"use client";
import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedUser = localStorage.getItem("user");
        const savedToken = localStorage.getItem("token");

        if (savedUser && savedToken) {
          setUser(JSON.parse(savedUser));
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to parse user from localStorage:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  // Login → save user + token
  const login = (userData, token) => {
    try {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);
      setUser(userData);
    } catch (err) {
      console.error("Error saving auth data:", err);
    }
  };

  // Logout → clear storage + reset user, show toast
  // Returns a promise so callers can await logout()
  const logout = async () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);

      // show toast
      toast.success("Logged out successfully");

      return Promise.resolve();
    } catch (err) {
      console.error("Error during logout:", err);
      toast.error("Logout failed");
      return Promise.reject(err);
    }
  };

  const updateUser = (userData) => {
  try {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  } catch (err) {
    console.error("Failed to update user in context:", err);
  }
};

  const value = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
