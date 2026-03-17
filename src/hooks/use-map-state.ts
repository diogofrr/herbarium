"use client";

import { useReducer } from "react";
import type { HerbMarker, HerbStatus } from "@/types/herb";

// ── Types ─────────────────────────────────────────────────────────────────────

export type FocusPoint = { lat: number; lng: number; zoom?: number; nonce: number };

export type MapState = {
  search: string;
  statusFilter: "todos" | HerbStatus;
  isSearchOpen: boolean;
  isFilterOpen: boolean;
  addressQuery: string;
  focusPoint: FocusPoint | null;
  userLocation: { lat: number; lng: number } | null;
  isLocating: boolean;
  pendingPoint: { lat: number; lng: number } | null;
  isModalOpen: boolean;
  editingMarker: HerbMarker | null;
  confirmDelete: HerbMarker | null;
  errorMessage: string;
};

export type MapAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_STATUS_FILTER"; payload: "todos" | HerbStatus }
  | { type: "TOGGLE_SEARCH" }
  | { type: "TOGGLE_FILTER" }
  | { type: "SET_ADDRESS_QUERY"; payload: string }
  | { type: "CLEAR_ADDRESS" }
  | { type: "SET_FOCUS"; payload: FocusPoint }
  | { type: "SET_USER_LOCATION"; payload: { lat: number; lng: number } }
  | { type: "SET_LOCATING"; payload: boolean }
  | { type: "SET_PENDING_POINT"; payload: { lat: number; lng: number } | null }
  | { type: "OPEN_CREATE_MODAL" }
  | { type: "OPEN_EDIT_MODAL"; payload: HerbMarker }
  | { type: "CLOSE_MODAL" }
  | { type: "MODAL_SUCCESS" }
  | { type: "SET_CONFIRM_DELETE"; payload: HerbMarker | null }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" };

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState: MapState = {
  search: "",
  statusFilter: "todos",
  isSearchOpen: false,
  isFilterOpen: false,
  addressQuery: "",
  focusPoint: null,
  userLocation: null,
  isLocating: false,
  pendingPoint: null,
  isModalOpen: false,
  editingMarker: null,
  confirmDelete: null,
  errorMessage: "",
};

// ── Reducer ───────────────────────────────────────────────────────────────────

function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.payload };
    case "SET_STATUS_FILTER":
      return { ...state, statusFilter: action.payload, isFilterOpen: false };
    case "TOGGLE_SEARCH":
      return { ...state, isSearchOpen: !state.isSearchOpen };
    case "TOGGLE_FILTER":
      return { ...state, isFilterOpen: !state.isFilterOpen };
    case "SET_ADDRESS_QUERY":
      return { ...state, addressQuery: action.payload };
    case "CLEAR_ADDRESS":
      return { ...state, addressQuery: "" };
    case "SET_FOCUS":
      return { ...state, focusPoint: action.payload };
    case "SET_USER_LOCATION":
      return { ...state, userLocation: action.payload };
    case "SET_LOCATING":
      return { ...state, isLocating: action.payload };
    case "SET_PENDING_POINT":
      return { ...state, pendingPoint: action.payload };
    case "OPEN_CREATE_MODAL":
      return { ...state, isModalOpen: true, editingMarker: null };
    case "OPEN_EDIT_MODAL":
      return {
        ...state,
        isModalOpen: true,
        editingMarker: action.payload,
        pendingPoint: { lat: action.payload.lat, lng: action.payload.lng },
      };
    case "CLOSE_MODAL":
      return { ...state, isModalOpen: false, editingMarker: null, pendingPoint: null };
    case "MODAL_SUCCESS":
      return { ...state, isModalOpen: false, editingMarker: null, pendingPoint: null };
    case "SET_CONFIRM_DELETE":
      return { ...state, confirmDelete: action.payload };
    case "SET_ERROR":
      return { ...state, errorMessage: action.payload };
    case "CLEAR_ERROR":
      return { ...state, errorMessage: "" };
    default:
      return state;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useMapState() {
  return useReducer(mapReducer, initialState);
}
