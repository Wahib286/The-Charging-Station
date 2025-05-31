// src/App.js

import React, { useState, useEffect, createContext, useContext } from "react";
import {
  MapPin,
  Power,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  User,
  LogOut,
  Search,
  X,
  AlertCircle,
  List,
} from "lucide-react";
import "./index.css"; // if you have global styles; otherwise remove this line

// ---------------------------
// API Configuration + Service
// ---------------------------
const API_BASE_URL = "http://localhost:5000/api";

const apiService = {
  // Auth endpoints
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // Station endpoints
  getStations: async (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/stations?${queryString}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  createStation: async (token, stationData) => {
    const response = await fetch(`${API_BASE_URL}/stations/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(stationData),
    });
    return response.json();
  },

  updateStation: async (token, id, stationData) => {
    const response = await fetch(`${API_BASE_URL}/stations/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(stationData),
    });
    return response.json();
  },

  deleteStation: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/stations/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },
};

// ---------------------------
// Auth Context + Provider
// ---------------------------
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// ---------------------------
// LoginScreen Component
// ---------------------------
const LoginScreen = ({ onSwitchMode }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await apiService.login(formData);
      if (result.token) {
        login(result.user, result.token);
      } else {
        setError(result.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Power className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">EV Charging Hub</h1>
          <p className="text-gray-600 mt-2">
            Sign in to manage charging stations
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => onSwitchMode("register")}
              className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// ---------------------------
// RegisterScreen Component
// ---------------------------
const RegisterScreen = ({ onSwitchMode }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await apiService.register(formData);
      if (result.token) {
        login(result.user, result.token);
      } else {
        setError(result.message || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join the EV Charging Hub</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Create a password"
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => onSwitchMode("login")}
              className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// ---------------------------
// StationForm Component
// ---------------------------
const StationForm = ({ station, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: station?.name || "",
    location: {
      latitude: station?.location?.latitude || "",
      longitude: station?.location?.longitude || "",
      address: station?.location?.address || "",
    },
    status: station?.status || "Active",
    power: station?.power || "",
    connectorTypes: station?.connectorTypes || [],
    pricePerKwh: station?.pricePerKwh || "",
    amenities: station?.amenities ? station.amenities.join(", ") : "",
  });

  const connectorOptions = [
    "Type 1",
    "Type 2",
    "CCS",
    "CHAdeMO",
    "Tesla Supercharger",
  ];
  const statusOptions = ["Active", "Inactive", "Maintenance"];

  const handleConnectorChange = (connector) => {
    const updatedConnectors = formData.connectorTypes.includes(connector)
      ? formData.connectorTypes.filter((c) => c !== connector)
      : [...formData.connectorTypes, connector];

    setFormData({ ...formData, connectorTypes: updatedConnectors });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      power: parseFloat(formData.power),
      pricePerKwh: formData.pricePerKwh
        ? parseFloat(formData.pricePerKwh)
        : undefined,
      location: {
        ...formData.location,
        latitude: parseFloat(formData.location.latitude),
        longitude: parseFloat(formData.location.longitude),
      },
      amenities: formData.amenities
        ? formData.amenities
            .split(",")
            .map((a) => a.trim())
            .filter((a) => a)
        : [],
    };
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {station ? "Edit Charging Station" : "Add New Charging Station"}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Station Name
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter station name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.location.latitude}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: {
                      ...formData.location,
                      latitude: e.target.value,
                    },
                  })
                }
                placeholder="40.7128"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.location.longitude}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: {
                      ...formData.location,
                      longitude: e.target.value,
                    },
                  })
                }
                placeholder="-74.0060"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.location.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, address: e.target.value },
                  })
                }
                placeholder="123 Main St, City, State"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Power (kW)
              </label>
              <input
                type="number"
                step="any"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.power}
                onChange={(e) =>
                  setFormData({ ...formData, power: e.target.value })
                }
                placeholder="150"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price per kWh ($)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.pricePerKwh}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerKwh: e.target.value })
                }
                placeholder="0.25"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connector Types
              </label>
              <div className="flex flex-wrap gap-2">
                {connectorOptions.map((connector) => (
                  <label key={connector} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.connectorTypes.includes(connector)}
                      onChange={() => handleConnectorChange(connector)}
                      className="mr-2"
                    />
                    <span className="text-sm">{connector}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amenities (comma-separated)
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.amenities}
                onChange={(e) =>
                  setFormData({ ...formData, amenities: e.target.value })
                }
                placeholder="WiFi, Restroom, Cafe"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              {station ? "Update Station" : "Create Station"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------
// MapView Component
// ---------------------------
const MapView = ({ stations, selectedStation, onStationSelect }) => {
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.006 });

  return (
    <div className="h-96 bg-gray-100 rounded-lg relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Map View</p>
          <p className="text-sm text-gray-500">
            Google Maps integration would go here
          </p>
        </div>
      </div>

      {/* Station markers overlay */}
      <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-md max-w-xs">
        <h3 className="font-semibold mb-2">
          Stations on Map ({stations.length})
        </h3>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {stations.slice(0, 5).map((station) => (
            <div
              key={station._id}
              className="text-xs p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
              onClick={() => onStationSelect(station)}>
              <div className="font-medium">{station.name}</div>
              <div className="text-gray-600">
                {station.location.latitude.toFixed(4)},{" "}
                {station.location.longitude.toFixed(4)}
              </div>
            </div>
          ))}
          {stations.length > 5 && (
            <div className="text-xs text-gray-500 p-2">
              ... and {stations.length - 5} more stations
            </div>
          )}
        </div>
      </div>

      {/* Selected station info */}
      {selectedStation && (
        <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-sm">
          <h4 className="font-semibold">{selectedStation.name}</h4>
          <p className="text-sm text-gray-600">
            {selectedStation.location.address}
          </p>
          <div className="flex items-center mt-2 space-x-4">
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                selectedStation.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : selectedStation.status === "Inactive"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}>
              {selectedStation.status}
            </span>
            <span className="text-sm text-gray-600">
              {selectedStation.power}kW
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------
// Dashboard Component
// ---------------------------
const Dashboard = () => {
  const { user, logout, token } = useAuth();
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentView, setCurrentView] = useState("list"); // 'list' or 'map'
  const [showForm, setShowForm] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    minPower: "",
    maxPower: "",
    connectorType: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Load stations
  const loadStations = async () => {
    setLoading(true);
    try {
      const result = await apiService.getStations(token);
      // If the API returns an array (no "stations" key), use it directly
      if (Array.isArray(result)) {
        setStations(result);
        setFilteredStations(result);
        setError("");
      }
      // If your backend eventually wraps it in { stations: [...] }, handle that too:
      else if (result.stations && Array.isArray(result.stations)) {
        setStations(result.stations);
        setFilteredStations(result.stations);
        setError("");
      }
      else {
        // neither an array nor { stations: [...] } → show backend’s error message
        setError(result.message || "Failed to load stations");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (token) {
      loadStations();
    }
  }, [token]);

  // Apply filters
  useEffect(() => {
    let filtered = stations;

    if (filters.search) {
      filtered = filtered.filter(
        (station) =>
          station.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          (station.location.address &&
            station.location.address
              .toLowerCase()
              .includes(filters.search.toLowerCase()))
      );
    }

    if (filters.status) {
      filtered = filtered.filter(
        (station) => station.status === filters.status
      );
    }

    if (filters.minPower) {
      filtered = filtered.filter(
        (station) => station.power >= parseFloat(filters.minPower)
      );
    }

    if (filters.maxPower) {
      filtered = filtered.filter(
        (station) => station.power <= parseFloat(filters.maxPower)
      );
    }

    if (filters.connectorType) {
      filtered = filtered.filter(
        (station) =>
          station.connectorTypes &&
          station.connectorTypes.includes(filters.connectorType)
      );
    }

    setFilteredStations(filtered);
  }, [filters, stations]);

  // Handle station operations
  const handleSaveStation = async (stationData) => {
    try {
      if (editingStation) {
        const result = await apiService.updateStation(
          token,
          editingStation._id,
          stationData
        );
        if (result.station) {
          await loadStations();
          setShowForm(false);
          setEditingStation(null);
        } else {
          setError(result.message || "Failed to update station");
        }
      } else {
        const result = await apiService.createStation(token, stationData);
        if (result.station) {
          await loadStations();
          setShowForm(false);
        } else {
          setError(result.message || "Failed to create station");
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const handleDeleteStation = async (stationId) => {
    if (window.confirm("Are you sure you want to delete this station?")) {
      try {
        const result = await apiService.deleteStation(token, stationId);
        if (result.message) {
          await loadStations();
        } else {
          setError("Failed to delete station");
        }
      } catch (err) {
        setError("Network error. Please try again.");
      }
    }
  };

  const handleEditStation = (station) => {
    setEditingStation(station);
    setShowForm(true);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      minPower: "",
      maxPower: "",
      connectorType: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Power className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">
                EV Charging Hub
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">{user?.username}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center text-gray-700 hover:text-gray-900">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Stations</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Filter className="w-4 h-4 mr-1" />
              Filters
            </button>
            <button
              onClick={() =>
                setCurrentView((prev) => (prev === "list" ? "map" : "list"))
              }
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              {currentView === "list" ? (
                <>
                  <MapPin className="w-4 h-4 mr-1" />
                  Map View
                </>
              ) : (
                <>
                  <List className="w-4 h-4 mr-1" />
                  List View
                </>
              )}
            </button>
            <button
              onClick={() => {
                setEditingStation(null);
                setShowForm(true);
              }}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-1" />
              Add Station
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    placeholder="Search by name or address"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }>
                  <option value="">All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Connector Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.connectorType}
                  onChange={(e) =>
                    setFilters({ ...filters, connectorType: e.target.value })
                  }>
                  <option value="">All</option>
                  {[
                    "Type 1",
                    "Type 2",
                    "CCS",
                    "CHAdeMO",
                    "Tesla Supercharger",
                  ].map((connector) => (
                    <option key={connector} value={connector}>
                      {connector}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Power (kW)
                </label>
                <input
                  type="number"
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.minPower}
                  onChange={(e) =>
                    setFilters({ ...filters, minPower: e.target.value })
                  }
                  placeholder="e.g. 50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Power (kW)
                </label>
                <input
                  type="number"
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.maxPower}
                  onChange={(e) =>
                    setFilters({ ...filters, maxPower: e.target.value })
                  }
                  placeholder="e.g. 350"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
          </div>
        ) : currentView === "list" ? (
          /* List View */
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Power (kW)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Connector Types
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStations.map((station) => (
                  <tr key={station._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {station.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {station.location.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {station.power}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          station.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : station.status === "Inactive"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                        {station.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {station.connectorTypes.join(", ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditStation(station)}
                        className="text-indigo-600 hover:text-indigo-900">
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteStation(station._id)}
                        className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredStations.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                      No stations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Map View */
          <MapView
            stations={filteredStations}
            selectedStation={selectedStation}
            onStationSelect={setSelectedStation}
          />
        )}

        {/* Station Form Modal */}
        {showForm && (
          <StationForm
            station={editingStation}
            onSave={handleSaveStation}
            onCancel={() => {
              setShowForm(false);
              setEditingStation(null);
            }}
          />
        )}
      </main>
    </div>
  );
};

// ---------------------------
// App Component (Switcher)
// ---------------------------
const App = () => {
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
      </div>
    );
  }

  // If authenticated, show Dashboard
  if (user) {
    return <Dashboard />;
  }

  // Otherwise, show Login or Register
  return mode === "login" ? (
    <LoginScreen onSwitchMode={setMode} />
  ) : (
    <RegisterScreen onSwitchMode={setMode} />
  );
};

export default App;
export { AuthProvider };
