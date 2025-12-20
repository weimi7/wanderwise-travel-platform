"use client";

import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

/**
 * Requirements:
 * - NEXT_PUBLIC_GOOGLE_CLIENT_ID must be set in client env
 * - backend route POST /api/auth/social-login implemented
 *
 * This version adds improved logging and more robust error handling so you can
 * see the backend response status/body in the browser console when social login fails.
 */

export default function GoogleSignInButton({ buttonContainerId = "google-signin-button", onSuccess }) {
  const { setAuthUser, setToken } = useAuth() || {};
  const initializedRef = useRef(false);
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
      return;
    }

    // load script if not present
    if (typeof window !== "undefined" && !document.getElementById("google-identity")) {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.id = "google-identity";
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }

    const tryInit = () => {
      if (initializedRef.current) return;
      if (typeof window === "undefined" || !window.google) {
        // try again after short delay
        setTimeout(tryInit, 250);
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById(buttonContainerId),
        { theme: "outline", size: "large" }
      );

      initializedRef.current = true;
    };

    tryInit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCredentialResponse = async (response) => {
    // Debug: log the full Google callback object to ensure it contains credential
    console.log("Google callback response:", response);
    const id_token = response?.credential;
    if (!id_token) {
      console.warn("Google callback did not include credential");
      toast.error("Google sign-in failed");
      return;
    }

    const backendUrl = (process.env.NEXT_PUBLIC_API_URL || "") + "/api/auth/social-login";
    console.log("Posting social login to:", backendUrl);

    try {
      const r = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "google", id_token }),
      });

      // Always capture status and text for debugging
      const statusInfo = { status: r.status, statusText: r.statusText };
      let responseText = null;
      let data = null;

      // Try to parse JSON, fallback to raw text
      try {
        data = await r.json();
      } catch (parseErr) {
        responseText = await r.text().catch(() => null);
        console.warn("social-login response not JSON:", responseText, statusInfo);
      }

      // Log full debug info if something went wrong
      if (!r.ok || !data || !data.success) {
        console.error("Social login failed debug:", {
          request: { provider: "google", backendUrl },
          responseStatus: statusInfo,
          responseJson: data,
          responseText,
        });

        // prefer provider message if present, otherwise server message, otherwise status
        const message =
          data?.message ||
          (responseText ? `Server: ${responseText}` : `Social login failed (${r.status} ${r.statusText})`);

        toast.error(message);
        return;
      }

      // success path
      if (typeof setToken === "function") setToken(data.token);
      if (typeof setAuthUser === "function") setAuthUser(data.user);

      toast.success("Signed in with Google");
      if (typeof onSuccess === "function") onSuccess(data.user, data.token);
    } catch (err) {
      // network or other unexpected errors
      console.error("Google social login fetch error:", err);
      toast.error("Social login failed — network error");
    }
  };

  return <div id={buttonContainerId} className="inline-block" />;
}

GoogleSignInButton.propTypes = {
  buttonContainerId: PropTypes.string,
  onSuccess: PropTypes.func,
};