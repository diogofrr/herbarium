"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Filter,
  Flower2,
  Leaf,
  LocateFixed,
  MapPin,
  Plus,
  Search,
  Trees,
  X,
} from "lucide-react";

import { HerbMapProvider, useHerbMapContext } from "@/context/herb-map-context";
import { useHerbs, useGeocode } from "@/hooks";
import { HerbFormModal } from "@/components/herb-form-modal";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import type { HerbClassification } from "@/types/herb";

const LeafletMap = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => <div className="map-placeholder">Carregando mapa…</div>,
});

function classIcon(kind: HerbClassification) {
  if (kind === "flor") return <Flower2 size={14} />;
  if (kind === "arvore") return <Trees size={14} />;
  return <Leaf size={14} />;
}

export default function HerbMap() {
  return (
    <HerbMapProvider>
      <HerbMapInner />
    </HerbMapProvider>
  );
}

function HerbMapInner() {
  const {
    state,
    dispatch,
    onMapClick,
    onOutOfBounds,
    focusOn,
    locateUser,
    openEditModal,
    handleModalSuccess,
    handleModalCancel,
    handleModalError,
    handleDeleteConfirm,
  } = useHerbMapContext();

  const herbsQuery = useHerbs({ q: state.search, status: state.statusFilter });
  const geocodeQuery = useGeocode(state.addressQuery);

  const markers = herbsQuery.data ?? [];
  const isLoading = herbsQuery.isFetching;
  const addressResults = geocodeQuery.data ?? [];
  const isAddressLoading = geocodeQuery.isFetching;

  // Auto-dismiss error toast (UI timer — not data fetching)
  useEffect(() => {
    if (!state.errorMessage) return;
    const t = setTimeout(() => dispatch({ type: "CLEAR_ERROR" }), 4000);
    return () => clearTimeout(t);
  }, [state.errorMessage, dispatch]);

  const counters = useMemo(
    () =>
      markers.reduce(
        (acc, m) => {
          acc.total++;
          if (m.status === "muita") acc.muita++;
          else acc.pouca++;
          return acc;
        },
        { total: 0, muita: 0, pouca: 0 },
      ),
    [markers],
  );

  return (
    <main className="map-screen">
      <section className="map-full" aria-label="mapa full screen">
        <LeafletMap
          markers={markers}
          pendingPoint={state.pendingPoint}
          userLocation={state.userLocation}
          focusPoint={state.focusPoint}
          onMapClick={onMapClick}
          onOutOfBounds={onOutOfBounds}
          onEdit={openEditModal}
          onDelete={(marker) => dispatch({ type: "SET_CONFIRM_DELETE", payload: marker })}
        />

        {/* ── Top overlay ────────────────────────────────────────────── */}
        <div className="overlay-top">
          <button
            type="button"
            className={`fab fab-search${state.isSearchOpen ? " active" : ""}`}
            aria-label={state.isSearchOpen ? "fechar busca" : "abrir busca"}
            onClick={() => dispatch({ type: "TOGGLE_SEARCH" })}
          >
            {state.isSearchOpen ? <X size={18} /> : <Search size={18} />}
          </button>

          {state.isSearchOpen ? (
            <div className="search-panel">
              <input
                autoFocus
                value={state.search}
                onChange={(e) => dispatch({ type: "SET_SEARCH", payload: e.target.value })}
                placeholder="Buscar por erva, propriedade ou santo"
                aria-label="buscar ervas"
              />
            </div>
          ) : null}

          <div className="address-panel">
            <MapPin size={16} />
            <input
              value={state.addressQuery}
              onChange={(e) => dispatch({ type: "SET_ADDRESS_QUERY", payload: e.target.value })}
              placeholder="Pesquisar endereço em Uberlândia"
              aria-label="buscar endereço"
            />
            {state.addressQuery ? (
              <button
                type="button"
                className="address-clear"
                aria-label="limpar endereço"
                onClick={() => dispatch({ type: "CLEAR_ADDRESS" })}
              >
                <X size={14} />
              </button>
            ) : null}
          </div>

          {state.addressQuery.trim().length >= 3 ? (
            <div className="address-results">
              {isAddressLoading ? <p className="address-loading">Buscando…</p> : null}
              {!isAddressLoading && addressResults.length === 0 ? (
                <p>Nenhum resultado encontrado</p>
              ) : null}
              {addressResults.map((r) => (
                <button
                  type="button"
                  key={`${r.lat}-${r.lng}`}
                  onClick={() => {
                    dispatch({ type: "SET_ADDRESS_QUERY", payload: r.label });
                    focusOn(r.lat, r.lng, 17);
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* ── Right overlay ──────────────────────────────────────────── */}
        <div className="overlay-right">
          <button
            type="button"
            className={`fab${state.statusFilter !== "todos" ? " fab-active" : ""}`}
            aria-label="filtro status"
            onClick={() => dispatch({ type: "TOGGLE_FILTER" })}
          >
            <Filter size={18} />
          </button>

          <button
            type="button"
            className={`fab${state.isLocating ? " fab-locating" : ""}`}
            aria-label="minha localização"
            onClick={() =>
              state.userLocation
                ? focusOn(state.userLocation.lat, state.userLocation.lng, 16)
                : locateUser()
            }
            disabled={state.isLocating}
          >
            <LocateFixed size={18} />
          </button>

          {state.isFilterOpen ? (
            <div className="status-menu">
              {(["todos", "muita", "pouca"] as const).map((f) => (
                <button
                  type="button"
                  key={f}
                  className={state.statusFilter === f ? "active" : ""}
                  onClick={() => dispatch({ type: "SET_STATUS_FILTER", payload: f })}
                >
                  {f === "todos" ? "Todos" : f === "muita" ? "Muita erva" : "Pouca erva"}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* ── Bottom overlay ─────────────────────────────────────────── */}
        <div className="overlay-bottom">
          <div className="legend">
            <span>{classIcon("flor")} Flor</span>
            <span>{classIcon("erva")} Erva</span>
            <span>{classIcon("arvore")} Árvore</span>
          </div>
          <div className="mini-stats">
            <span>Total {counters.total}</span>
            <span className="stat-muita">Muita {counters.muita}</span>
            <span className="stat-pouca">Pouca {counters.pouca}</span>
          </div>

          {state.pendingPoint ? (
            <div className="pending-actions">
              <button
                type="button"
                className="fab-add"
                onClick={() => dispatch({ type: "OPEN_CREATE_MODAL" })}
              >
                <Plus size={16} /> Adicionar aqui
              </button>
              <button
                type="button"
                className="fab fab-cancel"
                aria-label="cancelar seleção"
                onClick={() => dispatch({ type: "SET_PENDING_POINT", payload: null })}
              >
                <X size={16} />
              </button>
            </div>
          ) : null}
        </div>

        {/* ── Error toast ────────────────────────────────────────────── */}
        {state.errorMessage ? (
          <div className="error-toast" role="alert">
            <span>{state.errorMessage}</span>
            <button
              type="button"
              className="toast-close"
              aria-label="fechar"
              onClick={() => dispatch({ type: "CLEAR_ERROR" })}
            >
              <X size={14} />
            </button>
          </div>
        ) : null}

        {isLoading ? <div className="loading-chip">Atualizando…</div> : null}
      </section>

      {/* ── Radix modals (rendered outside map section) ──────────────────── */}
      <HerbFormModal
        open={state.isModalOpen}
        pendingPoint={state.pendingPoint}
        editingMarker={state.editingMarker}
        onSuccess={handleModalSuccess}
        onCancel={handleModalCancel}
        onError={handleModalError}
      />

      <AlertDialog
        open={!!state.confirmDelete}
        onOpenChange={(v) => {
          if (!v) dispatch({ type: "SET_CONFIRM_DELETE", payload: null });
        }}
      >
        <AlertDialogContent
          title="Remover localização?"
          description={`Deseja remover ${state.confirmDelete?.herbName ?? ""} do mapa? Esta ação não pode ser desfeita.`}
          confirmLabel="Remover"
          cancelLabel="Cancelar"
          danger
          onConfirm={handleDeleteConfirm}
          onCancel={() => dispatch({ type: "SET_CONFIRM_DELETE", payload: null })}
        />
      </AlertDialog>
    </main>
  );
}
