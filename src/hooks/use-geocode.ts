"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchGeocode } from "@/lib/api/geocode";

export function useGeocode(rawQuery: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(rawQuery);

  // Debounce the raw input before firing a query — this is a legitimate
  // useEffect since it bridges user input to a time-delayed derived value.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(rawQuery), 300);
    return () => clearTimeout(t);
  }, [rawQuery]);

  return useQuery({
    queryKey: ["geocode", debouncedQuery],
    queryFn: ({ signal }) => fetchGeocode(debouncedQuery, signal),
    enabled: debouncedQuery.trim().length >= 3,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    placeholderData: (prev) => prev,
  });
}
