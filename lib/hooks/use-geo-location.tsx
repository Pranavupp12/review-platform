"use client";

import { useState, useCallback } from "react";

const GEONAMES_USER = process.env.NEXT_PUBLIC_GEONAMES_USER || "demo";
const BASE_URL = "https://secure.geonames.org"; 

export interface GeoItem {
  name: string;
  geonameId: number;
  isoCode?: string;
  countryName?: string;
  adminName1?: string; 
  adminCode?: string; // ✅ ADDED THIS MISSING FIELD
  population?: number;
}

// ✅ Hardcoded Districts for Delhi
const DELHI_DISTRICTS: GeoItem[] = [
  { name: "Central Delhi", geonameId: 1273294, population: 582320 },
  { name: "East Delhi", geonameId: 1270770, population: 1709346 },
  { name: "New Delhi", geonameId: 1261481, population: 142004 },
  { name: "North Delhi", geonameId: 1270288, population: 887978 },
  { name: "North East Delhi", geonameId: 1270286, population: 2241624 },
  { name: "North West Delhi", geonameId: 1259395, population: 3656539 },
  { name: "Shahdara", geonameId: 7279748, population: 322931 },
  { name: "South Delhi", geonameId: 1255633, population: 2731929 },
  { name: "South East Delhi", geonameId: 8527063, population: 1800000 },
  { name: "South West Delhi", geonameId: 1254881, population: 2292958 },
  { name: "West Delhi", geonameId: 1253625, population: 2543243 },
];

export function useGeoLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGeo = async (endpoint: string, params: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = `${BASE_URL}/${endpoint}?username=${GEONAMES_USER}&${params}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const data = await res.json();
      if (data.status) throw new Error(data.status.message || "GeoNames API Error");
      return data.geonames || [];
    } catch (err: any) {
      console.error("GeoNames Fetch Error:", err);
      setError(err.message || "Failed to load location data");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = useCallback(async (): Promise<GeoItem[]> => {
    const data = await fetchGeo("countryInfoJSON", "");
    return data.map((c: any) => ({
      name: c.countryName,
      geonameId: c.geonameId,
      isoCode: c.countryCode, 
    })).sort((a: GeoItem, b: GeoItem) => a.name.localeCompare(b.name));
  }, []);

  const fetchStates = useCallback(async (countryGeonameId: number): Promise<GeoItem[]> => {
    if (!countryGeonameId) return [];
    const data = await fetchGeo("childrenJSON", `geonameId=${countryGeonameId}`);
    return data.map((s: any) => ({
      name: s.name,
      geonameId: s.geonameId,
      isoCode: s.countryCode,
      adminCode: s.adminCode1, // This maps correctly now
    })).sort((a: GeoItem, b: GeoItem) => a.name.localeCompare(b.name));
  }, []);

  // Updated fetchCities with 3rd argument for State Name Check
  const fetchCities = useCallback(async (countryCode: string, stateCode: string, stateName?: string): Promise<GeoItem[]> => {
    if (!countryCode || !stateCode) return [];

    // ✅ ROBUST CHECK: Check Code OR Name
    const isDelhi = 
       countryCode === 'IN' && 
       (stateCode === 'DL' || stateCode === '07' || stateName?.includes("Delhi") || stateName === "NCT");

    if (isDelhi) {
      return DELHI_DISTRICTS;
    }
    
    // Standard Logic for everywhere else
    const params = `country=${countryCode}&adminCode1=${stateCode}&featureClass=P&maxRows=1000&style=FULL&orderby=population`;
    const data = await fetchGeo("searchJSON", params);

    return data
      .map((c: any) => ({
        name: c.asciiName || c.name, 
        geonameId: c.geonameId,
        population: c.population ? parseInt(c.population) : 0,
      }))
      .filter((c: GeoItem) => (c.population || 0) > 5000)
      .sort((a: GeoItem, b: GeoItem) => a.name.localeCompare(b.name));
  }, []);

  const searchCities = useCallback(async (query: string): Promise<GeoItem[]> => {
    if (!query || query.length < 3) return []; 
    const data = await fetchGeo("searchJSON", `q=${encodeURIComponent(query)}&featureClass=P&maxRows=10&style=FULL`);
    return data.map((c: any) => ({
      name: c.asciiName || c.name,
      geonameId: c.geonameId,
      countryName: c.countryName,
      adminName1: c.adminName1,
    }));
  }, []);

  return { fetchCountries, fetchStates, fetchCities, searchCities, loading, error };
}