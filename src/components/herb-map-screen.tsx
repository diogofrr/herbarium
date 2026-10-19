"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { BookOpen, LocateFixed, MapPin, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { AuthModal } from "@/components/auth-modal";
import { FilterSheet } from "@/components/filter-sheet";
import { MarkerForm } from "@/components/marker-form";
import { MarkerSheet } from "@/components/marker-sheet";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import type { FocusPoint } from "@/components/leaflet-map";
import { useAuth } from "@/context/auth-context";
import {
  useDebouncedValue,
  useDeleteMarker,
  useGeocode,
  useGeolocation,
  useHerbCatalog,
  useMarkers,
  useTaxonomy,
} from "@/hooks";
import {
  EMPTY_FILTERS,
  TEMPERATURE_META,
  countActiveFilters,
  fold,
  herbMatches,
} from "@/lib/herb-utils";
import type { HerbFilters, HerbMarker, Temperature } from "@/types/herb";

const LeafletMap = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => <div className="map-placeholder">Carregando mapa…</div>,
});

const TEMPS: Temperature[] = ["quente", "morna", "fria"];

export function HerbMapScreen() {
  const searchParams = useSearchParams();
  const ervaParam = searchParams.get("erva");
  const { user, isAuthenticated } = useAuth();

  const markersQuery = useMarkers();
  const catalogQuery = useHerbCatalog();
  const taxonomyQuery = useTaxonomy();
  const deleteMarker = useDeleteMarker();

  const [filters, setFilters] = useState<HerbFilters>(EMPTY_FILTERS);
  const [onlyHerb, setOnlyHerb] = useState<string | null>(ervaParam);
  const [text, setText] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [pendingPoint, setPendingPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [editing, setEditing] = useState<HerbMarker | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<HerbMarker | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [focusPoint, setFocusPoint] = useState<FocusPoint | null>(null);
  const [toast, setToast] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const showError = useCallback((text: string) => setToast({ kind: "error", text }), []);
  const { location, locating, locate } = useGeolocation(showError);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const markers = useMemo(() => markersQuery.data ?? [], [markersQuery.data]);
  const herbs = useMemo(() => catalogQuery.data ?? [], [catalogQuery.data]);

  const visible = useMemo(
    () =>
      markers.filter(
        (m) => (!onlyHerb || m.herbSlug === onlyHerb) && herbMatches(m.herb, filters),
      ),
    [markers, filters, onlyHerb],
  );
  const selected = useMemo(
    () => markers.find((m) => m.id === selectedId) ?? null,
    [markers, selectedId],
  );

  const debouncedText = useDebouncedValue(text, 250);
  const addressQuery = useGeocode(searchFocused ? debouncedText : "");
  const herbSuggestions = useMemo(() => {
    const needle = fold(debouncedText);
    if (needle.length < 2) return [];
    return herbs
      .filter((h) => fold(`${h.name} ${h.alternativeNames.join(" ")}`).includes(needle))
      .slice(0, 5);
  }, [herbs, debouncedText]);
  const addressSuggestions = addressQuery.data?.slice(0, 4) ?? [];
  const showSuggest =
    searchFocused && text.trim().length >= 2 && (herbSuggestions.length > 0 || addressSuggestions.length > 0);

  const focusHerbName = onlyHerb ? herbs.find((h) => h.slug === onlyHerb)?.name : null;
  const active = countActiveFilters(filters);

  const startPlacing = () => {
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    setSelectedId(null);
    setPlacing((p) => !p);
    setPendingPoint(null);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setPendingPoint(null);
    setPlacing(false);
  };

  const confirmRemoval = () => {
    const target = confirmDelete;
    setConfirmDelete(null);
    if (!target) return;
    setSelectedId(null);
    deleteMarker.mutate(target.id, {
      onSuccess: () => setToast({ kind: "ok", text: "Marcação removida." }),
      onError: (err) => showError(err instanceof Error ? err.message : "Não foi possível remover."),
    });
  };

  return (
    <div className="map-area">
      <LeafletMap
        markers={visible}
        selectedId={selectedId}
        pendingPoint={pendingPoint}
        userLocation={location}
        focusPoint={focusPoint}
        placing={placing}
        onSelect={(m) => {
          setSelectedId(m.id);
          setPlacing(false);
          setFocusPoint({ lat: m.lat, lng: m.lng, zoom: 16, nonce: Date.now() });
        }}
        onMapClick={(lat, lng) => {
          setPendingPoint({ lat, lng });
          setEditing(null);
          setFormOpen(true);
        }}
        onOutOfBounds={() => showError("A marcação precisa estar dentro de Uberlândia - MG.")}
      />

      <div className="map-top">
        <div className="map-search-row">
          <div className="search-box">
            <Search size={18} aria-hidden />
            <input
              type="search"
              value={text}
              placeholder="Buscar erva ou endereço"
              aria-label="Buscar erva ou endereço"
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            />
            {text ? (
              <button type="button" className="clear" aria-label="Limpar busca" onClick={() => setText("")}>
                <X size={16} />
              </button>
            ) : null}
          </div>
          <button
            type="button"
            className="icon-btn"
            aria-label={`Filtros${active ? ` (${active} ativos)` : ""}`}
            onClick={() => setFiltersOpen(true)}
          >
            <SlidersHorizontal size={20} />
            {active > 0 ? <span className="filter-count" style={{ position: "absolute", marginLeft: 26, marginTop: -26 }}>{active}</span> : null}
          </button>
        </div>

        {showSuggest ? (
          <div className="suggest" role="listbox" aria-label="Sugestões">
            {herbSuggestions.length > 0 ? <h4>Ervas</h4> : null}
            {herbSuggestions.map((h) => (
              <button
                key={h.slug}
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setOnlyHerb(h.slug);
                  setText("");
                  setSearchFocused(false);
                  setSelectedId(null);
                }}
              >
                <BookOpen size={16} aria-hidden />
                <span>
                  <strong>{h.name}</strong> <small>{h.mainUse}</small>
                </span>
              </button>
            ))}
            {addressSuggestions.length > 0 ? <h4>Endereços</h4> : null}
            {addressSuggestions.map((a) => (
              <button
                key={`${a.lat},${a.lng}`}
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setFocusPoint({ lat: a.lat, lng: a.lng, zoom: 16, nonce: Date.now() });
                  setText("");
                  setSearchFocused(false);
                }}
              >
                <MapPin size={16} aria-hidden />
                <span>{a.label}</span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="map-quick-filters" role="group" aria-label="Filtro rápido por temperatura">
          {focusHerbName ? (
            <button type="button" className="chip is-on" onClick={() => setOnlyHerb(null)}>
              {focusHerbName} <X size={13} aria-hidden />
              <span className="visually-hidden">mostrar todas as ervas</span>
            </button>
          ) : null}
          {TEMPS.map((t) => (
            <button
              key={t}
              type="button"
              className={`chip chip-temp-${t}${filters.temperature === t ? " is-on" : ""}`}
              aria-pressed={filters.temperature === t}
              onClick={() => setFilters((f) => ({ ...f, temperature: f.temperature === t ? null : t }))}
            >
              {TEMPERATURE_META[t].label}
            </button>
          ))}
        </div>
      </div>

      {toast ? (
        <div className={`toast toast-${toast.kind}`} role={toast.kind === "error" ? "alert" : "status"}>
          {toast.text}
        </div>
      ) : null}

      {placing && !formOpen ? <div className="map-hint">Toque no mapa para marcar o ponto</div> : null}

      {!selected ? (
        <div className="map-legend" aria-label="Legenda">
          <span><i className="legend-dot" style={{ background: "#b93a2a" }} />Quente</span>
          <span><i className="legend-dot" style={{ background: "#c98a12" }} />Morna</span>
          <span><i className="legend-dot" style={{ background: "#20639b" }} />Fria</span>
        </div>
      ) : null}

      <div className="map-fabs">
        <button
          type="button"
          className="icon-btn"
          aria-label="Minha localização"
          disabled={locating}
          onClick={() => locate((p) => setFocusPoint({ ...p, zoom: 16, nonce: Date.now() }))}
        >
          <LocateFixed size={20} />
        </button>
        <button
          type="button"
          className={`fab-add${placing ? " is-active" : ""}`}
          aria-label={placing ? "Cancelar marcação" : "Adicionar marcação"}
          aria-pressed={placing}
          onClick={startPlacing}
        >
          {placing ? <X size={26} /> : <Plus size={28} />}
        </button>
      </div>

      {selected ? (
        <MarkerSheet
          marker={selected}
          user={user}
          onClose={() => setSelectedId(null)}
          onEdit={(m) => {
            setEditing(m);
            setPendingPoint({ lat: m.lat, lng: m.lng });
            setFormOpen(true);
          }}
          onDelete={setConfirmDelete}
        />
      ) : markers.length === 0 && !markersQuery.isLoading ? (
        <div className="map-empty" aria-live="polite">
          <p style={{ margin: 0 }}>
            Ainda não há marcações. Toque em <strong>+</strong> para marcar a primeira erva, ou
            explore o <Link href="/ervas">guia de ervas</Link>.
          </p>
        </div>
      ) : null}

      <MarkerForm
        open={formOpen}
        herbs={herbs}
        pendingPoint={pendingPoint}
        editing={editing}
        initialHerbSlug={onlyHerb ?? undefined}
        onSuccess={(msg) => {
          closeForm();
          setToast({ kind: "ok", text: msg });
        }}
        onCancel={closeForm}
      />

      <FilterSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onChange={setFilters}
        taxonomy={taxonomyQuery.data}
        resultCount={visible.length}
        resultNoun="pontos"
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent
          title="Remover marcação?"
          description={`A marcação de ${confirmDelete?.herb.name ?? "erva"} sairá do mapa.`}
          confirmLabel="Remover"
          danger
          onConfirm={confirmRemoval}
          onCancel={() => setConfirmDelete(null)}
        />
      </AlertDialog>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => setPlacing(true)} />
    </div>
  );
}
