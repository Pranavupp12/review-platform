"use client";

import { useState, useEffect } from "react";

export function useAutoLocation() {
  const [detectedLocation, setDetectedLocation] = useState<string>("");
  
  // We use a session storage flag to avoid asking every single time the user refreshes
  // (Optional: remove this check if you WANT to ask on every reload)
  const [hasAsked, setHasAsked] = useState(false);

  useEffect(() => {
    // 1. Check if browser supports it
    if (!navigator.geolocation) return;

    // 2. Prevent asking if we already have a location or denied it this session
    if (hasAsked) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setHasAsked(true); // Mark as asked
        const { latitude, longitude } = position.coords;

        try {
          // 3. Use REST API (More reliable than window.google for initial load)
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          
          if (!res.ok) throw new Error("Geocoding failed");
          
          const data = await res.json();
          
          // 4. Extract best available City name
          // Logic: City -> Locality -> Principal Subdivision (State)
          const city = data.city || data.locality || data.principalSubdivision;
          
          if (city) {
            console.log("📍 Auto-detected city:", city); // Debug log
            setDetectedLocation(city);
          }
        } catch (error) {
          console.error("Auto-location API error:", error);
        }
      },
      (error) => {
        setHasAsked(true); // Mark as asked (denied)
        console.warn("Location permission denied or unavailable.", error.message);
      }
    );
  }, [hasAsked]);

  return detectedLocation;
}