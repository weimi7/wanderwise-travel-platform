import { usePlanner } from "./PlannerProvider";
import {
  Calendar,
  Clock,
  Sparkles,
  Heart,
  List,
  MapPin,
  Plus,
  X,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import PresetsManager from "./PresetsManager";
import GenerateButton from "./GenerateButton";

export default function TripDetailsForm() {
  const {
    days,
    setDays,
    preferences,
    setPreferences,
    destinations,
    setDestinations,
  } = usePlanner();

  const [destinationInput, setDestinationInput] = useState("");

  // Collapsible Presets panel state (collapsed by default)
  const [presetsOpen, setPresetsOpen] = useState(false);

  const formFields = [
    {
      name: "days",
      label: "Trip Duration (Days)",
      type: "number",
      icon: Clock,
      min: 1,
      max: 30,
      step: 1,
      placeholder: "Number of days",
      color: "text-blue-400",
    },
    {
      name: "preferences",
      label: "Travel Preferences",
      type: "text",
      icon: Heart,
      placeholder: "Ex: nature, luxury, adventure, temples",
      color: "text-pink-400",
    },
  ];

  // Add destination
  const addDestination = () => {
    const clean = destinationInput.trim();
    if (!clean) return;

    const list = clean
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d !== "");

    setDestinations([...destinations, ...list]);
    setDestinationInput("");
  };

  const removeDestination = (index) => {
    const updated = destinations.filter((_, i) => i !== index);
    setDestinations(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="text-2xl font-bold text-white">Trip Details</h4>
          <p className="text-gray-400">Basic info to generate your itinerary</p>
        </div>
      </div>

      {/* DESTINATIONS FIELD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <label className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-400" />
          Destinations
        </label>

        <div className="relative flex gap-2">
          <input
            type="text"
            placeholder="Enter destinations (comma separated)"
            value={destinationInput}
            onChange={(e) => setDestinationInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addDestination()}
            className="w-full px-4 py-3 pl-12 rounded-xl bg-white/10 backdrop-blur-md text-white 
            border border-white/20 focus:border-green-400 focus:ring-2 
            focus:ring-green-400/30 placeholder-gray-400 transition-all"
          />

          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400 opacity-70" />

          <button
            onClick={addDestination}
            className="px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Destination chips */}
        {destinations.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {destinations.map((d, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white"
              >
                <span>{d}</span>
                <button
                  onClick={() => removeDestination(i)}
                  className="text-red-300 hover:text-red-100"
                >
                  <X className="w-4 h-4 cursor-pointer" />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Other fields (days + preferences) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formFields.map((field, index) => {
          const Icon = field.icon;
          const value = field.name === "days" ? days : preferences;

          const setter =
            field.name === "days"
              ? (v) => setDays(Number(v))
              : (v) => setPreferences(v);

          return (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <label className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Icon className={`w-4 h-4 ${field.color}`} />
                {field.label}
              </label>

              <div className="relative">
                <input
                  type={field.type}
                  value={value}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  placeholder={field.placeholder}
                  onChange={(e) => setter(e.target.value)}
                  className="w-full px-4 py-3 pl-12 rounded-xl bg-white/10 backdrop-blur-md 
                  text-white border border-white/20 focus:border-blue-400 focus:ring-2 
                  focus:ring-blue-400/30 placeholder-gray-400 transition-all group-hover:bg-white/15"
                />
                <Icon
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${field.color} opacity-70`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      {(destinations.length > 0 || days || preferences) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-md 
          rounded-2xl border border-white/10"
        >
          <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <List className="w-5 h-5 text-blue-400" />
            Summary
          </h5>

          <div className="grid grid-cols-2 gap-4 text-center">
            {destinations.length > 0 && (
              <div>
                <div className="text-2xl font-bold text-white">{destinations.length}</div>
                <div className="text-sm text-gray-400">Destinations</div>
              </div>
            )}

            {days && (
              <div>
                <div className="text-2xl font-bold text-white">{days}</div>
                <div className="text-sm text-gray-400">Days</div>
              </div>
            )}

            {preferences && (
              <div className="col-span-2">
                <div className="text-white text-sm">{preferences}</div>
                <div className="text-xs text-gray-400">Preferences</div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Generate button placed above Presets Manager */}
      <div className="mt-6">
        <GenerateButton />
      </div>

      {/* Collapsible Presets Manager */}
      <div className="mt-6">
        <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <List className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Presets</div>
              <div className="text-xs text-gray-300">Save, load, and manage your travel presets</div>
            </div>
          </div>

          <button
            onClick={() => setPresetsOpen((s) => !s)}
            aria-expanded={presetsOpen}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/6 hover:bg-white/10 text-white cursor-pointer transition"
          >
            <span className="text-sm">{presetsOpen ? "Collapse" : "Expand"}</span>
            <ChevronDown className={`w-4 h-4 transform transition-transform ${presetsOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        <AnimatePresence initial={false}>
          {presetsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
              className="mt-4"
            >
              <PresetsManager />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}