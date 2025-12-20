"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

const PlannerContext = createContext(null);

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) {
    throw new Error("usePlanner must be used within PlannerProvider");
  }
  return ctx;
}

const API_BASE_URL =
  process.env. NEXT_PUBLIC_API_URL || "http://localhost:8000";
const LOCAL_KEY = "wanderwise:planner:v2";

export default function PlannerProvider({ children }) {
  // ==========================================================
  // STATE
  // ==========================================================
  const [destinations, setDestinations] = useState([]);
  const [days, setDays] = useState(3);
  const [preferences, setPreferences] = useState("");
  const [generatedItinerary, setGeneratedItinerary] = useState(null);

  // NEW:  Itinerary metadata for PDF generation
  const [itineraryMeta, setItineraryMeta] = useState({
    title:  "",
    days: 0,
    dates: "",
    destinations: [],
    preferences: "",
    generatedAt: null,
  });

  // Structured loading + error systems
  const [loading, setLoading] = useState({
    generation: false,
  });

  const [errors, setErrors] = useState({
    generation: null,
  });

  // ==========================================================
  // AUTO-SAVE
  // ==========================================================
  useEffect(() => {
    try {
      const payload = {
        destinations,
        days,
        preferences,
        generatedItinerary,
        itineraryMeta, // Save metadata too
      };
      localStorage.setItem(LOCAL_KEY, JSON. stringify(payload));
    } catch (err) {
      console.warn("Save error:", err);
    }
  }, [destinations, days, preferences, generatedItinerary, itineraryMeta]);

  // ==========================================================
  // CLEAR A SPECIFIC ERROR TYPE
  // ==========================================================
  const clearError = useCallback((type) => {
    setErrors((prev) => ({
      ...prev,
      [type]: null,
    }));
  }, []);

  // ==========================================================
  // HELPER: Generate itinerary title from destinations
  // ==========================================================
  const generateItineraryTitle = useCallback((dests, numDays) => {
    if (!dests || dests.length === 0) return "My Sri Lanka Adventure";
    
    if (dests.length === 1) {
      return `${numDays}-Day ${dests[0]} Experience`;
    } else if (dests.length === 2) {
      return `${numDays}-Day ${dests[0]} & ${dests[1]} Tour`;
    } else {
      return `${numDays}-Day Sri Lanka Multi-City Adventure`;
    }
  }, []);

  // ==========================================================
  // HELPER: Format date range
  // ==========================================================
  const formatDateRange = useCallback((numDays) => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + numDays);
    
    const formatDate = (date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:  "numeric",
      });
    };
    
    return `${formatDate(today)} - ${formatDate(endDate)}`;
  }, []);

  // ==========================================================
  // GENERATE ITINERARY (FastAPI)
  // ==========================================================
  const generateItinerary = useCallback(async () => {
    // Reset previous output
    setGeneratedItinerary(null);

    // Basic validation
    if (!destinations || destinations.length === 0) {
      setErrors((prev) => ({
        ...prev,
        generation: "Please enter at least 1 destination.",
      }));
      return;
    }

    if (!days || days < 1) {
      setErrors((prev) => ({
        ...prev,
        generation: "Days must be at least 1.",
      }));
      return;
    }

    // Clear previous error
    setErrors((prev) => ({ ...prev, generation: null }));

    // Enable loading
    setLoading((prev) => ({ ...prev, generation: true }));

    try {
      const payload = {
        destinations,
        days: Number(days),
        preferences: preferences?.trim() || "",
      };

      console.log("📤 Sending:", payload);

      const res = await fetch(`${API_BASE_URL}/api/itinerary/generate`, {
        method: "POST",
        headers: { "Content-Type":  "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("📥 Received:", data);

      if (data.itinerary) {
        setGeneratedItinerary(data.itinerary);

        // Generate and save metadata
        const meta = {
          title: generateItineraryTitle(destinations, days),
          days: Number(days),
          dates: formatDateRange(Number(days)),
          destinations: [... destinations],
          preferences: preferences?.trim() || "Not specified",
          generatedAt:  new Date().toISOString(),
        };
        
        setItineraryMeta(meta);
        console.log("✅ Itinerary metadata:", meta);
      } else {
        throw new Error("Invalid response from AI service.");
      }
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({
        ...prev,
        generation: "Failed to generate itinerary.  Please try again.",
      }));
    } finally {
      // Stop loading
      setLoading((prev) => ({ ...prev, generation: false }));
    }
  }, [destinations, days, preferences, generateItineraryTitle, formatDateRange]);

  // ==========================================================
  // CLEAR ALL
  // ==========================================================
  const clearAll = useCallback(() => {
    setDestinations([]);
    setDays(3);
    setPreferences("");
    setGeneratedItinerary(null);
    setItineraryMeta({
      title: "",
      days: 0,
      dates: "",
      destinations: [],
      preferences: "",
      generatedAt: null,
    });
    setErrors({ generation: null });

    localStorage.removeItem(LOCAL_KEY);
  }, []);

  // ==========================================================
  // EXPLICIT RESTORE: read from localStorage only when called
  // ==========================================================
  const restoreFromLocal = useCallback(() => {
    try {
      const raw = localStorage. getItem(LOCAL_KEY);
      if (!raw) return { restored: false };

      const saved = JSON.parse(raw);

      if (saved.destinations) setDestinations(saved.destinations);
      if (saved.days) setDays(saved.days);
      if (saved.preferences) setPreferences(saved.preferences);
      if (saved.generatedItinerary)
        setGeneratedItinerary(saved.generatedItinerary);
      
      // Restore metadata
      if (saved.itineraryMeta) {
        setItineraryMeta(saved.itineraryMeta);
      }

      return { restored: true };
    } catch (err) {
      console.warn("Restore error:", err);
      return { restored: false, error: err };
    }
  }, []);

  // ==========================================================
  // UPDATE METADATA:  Allow manual updates
  // ==========================================================
  const updateItineraryMeta = useCallback((updates) => {
    setItineraryMeta((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // ==========================================================
  // PROVIDER VALUE
  // ==========================================================
  const value = {
    // Basic state
    destinations,
    setDestinations,
    days,
    setDays,
    preferences,
    setPreferences,
    generatedItinerary,
    setGeneratedItinerary,

    // Metadata
    itineraryMeta,
    setItineraryMeta,
    updateItineraryMeta,

    // Loading & errors
    loading,
    errors,
    clearError,

    // Actions
    generateItinerary,
    clearAll,
    restoreFromLocal,
  };

  return (
    <PlannerContext.Provider value={value}>
      {children}
    </PlannerContext.Provider>
  );
}