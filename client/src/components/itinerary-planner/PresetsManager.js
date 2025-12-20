"use client";

import { useEffect, useState } from "react";
import { usePlanner } from "./PlannerProvider";
import * as api from "@/lib/presetsApi";
import toast from "react-hot-toast";
import {
  Save,
  FolderOpen,
  Share2,
  Trash2,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Calendar,
  MapPin,
  Settings,
  User,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Star,
  MoreVertical,
  Search,
  Filter,
  Grid,
  List,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LAST_SAVED_KEY = "wanderwise:lastSavedPresetId";

export default function PresetsManager() {
  const {
    destinations,
    days,
    preferences,
    generatedItinerary,
    setDestinations,
    setDays,
    setPreferences,
    setGeneratedItinerary,
  } = usePlanner();
  const [name, setName] = useState("");
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  const hasToken = () => {
    try {
      return !!localStorage.getItem("token");
    } catch (e) {
      return false;
    }
  };

  async function loadList() {
    if (!hasToken()) {
      setPresets([]);
      toast.error("Sign in to access saved presets");
      return;
    }

    try {
      setLoading(true);
      const data = await api.listPresets();
      setPresets(data.presets || []);
      toast.success("Presets loaded successfully");
    } catch (err) {
      console.error("Failed to load presets", err);
      const status = err?.response?.status;
      const respData = err?.response?.data;

      if (status === 401) {
        toast.error("Session expired. Please log in again.");
        try {
          localStorage.removeItem("token");
        } catch (e) {}
      } else if (status === 403) {
        toast.error("Access denied to presets.");
      } else if (status === 404) {
        toast.error("Presets endpoint not found.");
      } else {
        toast.error("Failed to load presets");
      }

      if (
        typeof respData === "string" &&
        respData.trim().startsWith("<!DOCTYPE html>")
      ) {
        console.warn("Server returned HTML. Check API configuration.");
      }

      setPresets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPresets = presets
    .filter(
      (preset) =>
        preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        preset.destinations?.some((d) =>
          d.toLowerCase().includes(searchTerm.toLowerCase())
        )
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "recent":
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  const handleSave = async () => {
    if (!name || name.trim().length < 2) {
      toast.error("Please provide a name for the preset");
      return;
    }

    if (!hasToken()) {
      toast.error("Please sign in to save presets");
      return;
    }

    const payload = {
      destinations,
      days,
      preferences,
      generatedItinerary,
    };

    try {
      const r = await api.savePreset(name.trim(), payload);
      const saved = r.preset;
      if (saved && saved.id) {
        try {
          localStorage.setItem(LAST_SAVED_KEY, saved.id);
        } catch (e) {}
      }
      toast.success("Preset saved successfully");
      setName("");
      loadList();
    } catch (err) {
      console.error("Save preset failed", err);
      const status = err?.response?.status;
      if (status === 401) {
        toast.error("Authentication required. Please log in.");
        try {
          localStorage.removeItem("token");
        } catch (e) {}
      } else {
        toast.error(err?.response?.data?.message || "Save failed");
      }
    }
  };

  const handleLoad = async (preset) => {
    try {
      const p = preset.payload || {};
      if (p.destinations) setDestinations(p.destinations);
      if (p.days) setDays(p.days);
      if (p.preferences) setPreferences(p.preferences);
      if (p.generatedItinerary) setGeneratedItinerary(p.generatedItinerary);

      try {
        localStorage.setItem(LAST_SAVED_KEY, preset.id);
      } catch (e) {}
      toast.success(`Loaded "${preset.name}"`);
      setSelectedPreset(preset.id);
    } catch (err) {
      console.error("Load preset error", err);
      toast.error("Failed to load preset");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this preset?")) return;
    if (!hasToken()) {
      toast.error("Please sign in to delete presets");
      return;
    }
    try {
      await api.deletePreset(id);
      toast.success("Preset deleted");
      try {
        const last = localStorage.getItem(LAST_SAVED_KEY);
        if (last === id) localStorage.removeItem(LAST_SAVED_KEY);
      } catch (e) {}
      loadList();
    } catch (err) {
      console.error("Delete preset error", err);
      const status = err?.response?.status;
      if (status === 401) {
        toast.error("Authentication required. Please log in.");
        try {
          localStorage.removeItem("token");
        } catch (e) {}
      } else {
        toast.error("Failed to delete");
      }
    }
  };

  const handleShare = async (id) => {
    if (!hasToken()) {
      toast.error("Please sign in to create share links");
      return;
    }
    try {
      const res = await api.createShare(id);
      const url =
        res.url ||
        (typeof window !== "undefined" &&
          `${window.location.origin}/share/${res.share.token}`);
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard");
    } catch (err) {
      console.error("Create share error", err);
      const status = err?.response?.status;
      if (status === 401) {
        toast.error("Authentication required. Please log in.");
        try {
          localStorage.removeItem("token");
        } catch (e) {}
      } else {
        toast.error("Failed to create share");
      }
    }
  };

  const handleExport = (preset) => {
    const data = {
      name: preset.name,
      createdAt: preset.created_at,
      payload: preset.payload,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wanderwise-preset-${preset.name
      .replace(/\s+/g, "-")
      .toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Preset exported");
  };

  // Utility to produce a readable preferences string
  const prefsToDisplay = (pref) => {
    if (!pref && pref !== "") return "—";
    // If it's an array, join names
    if (Array.isArray(pref)) {
      if (pref.length === 0) return "—";
      return pref.join(", ");
    }
    // If it's an object with named keys, try to extract values
    if (typeof pref === "object" && pref !== null) {
      try {
        // prefer array-like values
        const vals = Object.values(pref).filter(Boolean);
        if (vals.length) return vals.join(", ");
      } catch (e) {
        // fallthrough
      }
      return JSON.stringify(pref);
    }
    // string (most common in current UI)
    if (typeof pref === "string") {
      const s = pref.trim();
      return s === "" ? "—" : s;
    }
    return String(pref);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Travel Presets
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Save, load, and manage your travel planning templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadList}
            disabled={loading}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <RefreshCw
              className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${
                loading ? "animate-spin" : ""
              }`}
            />
          </button>
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 cursor-pointer ${
                viewMode === "grid"
                  ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 cursor-pointer ${
                viewMode === "list"
                  ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Save Section */}
      <div className="mb-8">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <Save className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-300">
                Save Current Plan
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Save your current destinations and preferences as a preset for future use
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter preset name (e.g., 'European Adventure')"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={!name.trim() || loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Preset
            </motion.button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search presets by name or destination..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
              >
                <option value="recent">Most Recent</option>
                <option value="name">Name (A-Z)</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-400">Total Presets</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{presets.length}</p>
              </div>
              <FolderOpen className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">Last Saved</p>
                <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                  {presets.length > 0 ? new Date(presets[0].created_at).toLocaleDateString() : "Never"}
                </p>
              </div>
              <Clock className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-400">Active Plans</p>
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                  {presets.filter((p) => p.id === selectedPreset).length}
                </p>
              </div>
              <Star className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Presets Grid/List */}
      <div className="mb-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading your presets...</p>
          </div>
        ) : filteredPresets.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Presets Found</h4>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm ? "No presets match your search." : "Save your first preset to get started!"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => document.querySelector('input[placeholder*="Enter preset name"]')?.focus()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Create Your First Preset
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPresets.map((preset) => {
              const prefText = prefsToDisplay(preset.payload?.preferences);
              return (
                <motion.div
                  key={preset.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-white dark:bg-gray-800 rounded-xl border overflow-hidden hover:shadow-lg transition-all cursor-pointer ${selectedPreset === preset.id ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200 dark:border-gray-700'}`}
                  onClick={() => setSelectedPreset(preset.id)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">{preset.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(preset.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {selectedPreset === preset.id && (
                        <div className="p-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Preset Details */}
                    <div className="space-y-2 mb-4">
                      {preset.payload?.destinations && preset.payload.destinations.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300 truncate">
                            {preset.payload.destinations.join(", ")}
                          </span>
                        </div>
                      )}
                      {preset.payload?.days && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300">{preset.payload.days} days</span>
                        </div>
                      )}
                      {/* Preferences: show names/text */}
                      {preset.payload?.preferences && (
                        <div className="flex items-center gap-2 text-sm">
                          <Settings className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300 truncate">{prefText}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); handleLoad(preset); }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:shadow transition-all cursor-pointer"
                      >
                        <FolderOpen className="w-3 h-3" />
                        <span className="text-sm">Load</span>
                      </motion.button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleExport(preset); }}
                        className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow transition-all cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(preset.id); }}
                        className="p-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:shadow transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Destinations</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Duration</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Created</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredPresets.map((preset) => {
                    const prefText = prefsToDisplay(preset.payload?.preferences);
                    return (
                      <tr
                        key={preset.id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${selectedPreset === preset.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        onClick={() => setSelectedPreset(preset.id)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${selectedPreset === preset.id ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gray-100 dark:bg-gray-700'}`}>
                              <FolderOpen className={`w-4 h-4 ${selectedPreset === preset.id ? 'text-white' : 'text-gray-500'}`} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{preset.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {prefText}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span className="text-sm truncate max-w-[150px]">
                              {preset.payload?.destinations?.join(", ") || "No destinations"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-500" />
                            <span className="text-gray-700 dark:text-gray-300">{preset.payload?.days || "N/A"} days</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(preset.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleLoad(preset); }}
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm hover:shadow transition-all cursor-pointer"
                            >
                              Load
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleShare(preset.id); }}
                              className="p-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:shadow transition-all cursor-pointer"
                            >
                              <Share2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(preset.id); }}
                              className="p-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:shadow transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-800 dark:text-white mb-1">About Presets</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Presets allow you to save and reuse travel plans. Share them with friends or export as JSON for backup.
              {!hasToken() && " Sign in to access all features."}
            </p>
            {!hasToken() && (
              <button
                onClick={() => toast.error("Please sign in to access all features")}
                className="mt-2 inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <User className="w-3 h-3" />
                Sign In Required
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}