"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

import { HerbFormSchema, type HerbFormValues } from "@/schemas/herb-schema";
import { useCreateHerb, useUpdateHerb } from "@/hooks/use-herbs";
import { useHerbCatalog } from "@/hooks/use-herb-catalog";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Select, SelectItem } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import type { HerbCatalogEntry, HerbMarker } from "@/types/herb";

type Props = {
  open: boolean;
  pendingPoint: { lat: number; lng: number } | null;
  editingMarker: HerbMarker | null;
  onSuccess: () => void;
  onCancel: () => void;
  onError: (msg: string) => void;
};

const HerbPreview = memo(function HerbPreview({
  herb,
}: {
  herb: HerbCatalogEntry | undefined;
}) {
  if (!herb) return null;
  const temp = herb.temperature.join(" / ") || "—";
  const risk = herb.hasRisk
    ? herb.riskTags.length > 0
      ? herb.riskTags.join(", ")
      : "com alerta"
    : "sem alerta";

  return (
    <section className="herb-preview" aria-label="detalhes da erva selecionada">
      <p className="herb-preview-title">Resumo da erva</p>
      <div className="popup-tags">
        <span>{herb.name}</span>
        {herb.type ? <span>{herb.type}</span> : null}
        <span>Temp.: {temp}</span>
        <span>Risco: {risk}</span>
      </div>
      {herb.orixas.length > 0 ? (
        <div className="popup-tags">
          {herb.orixas.slice(0, 6).map((o) => (
            <span key={o}>{o}</span>
          ))}
        </div>
      ) : null}
      {herb.usage ? <p className="popup-notes">{herb.usage}</p> : null}
      {herb.hasRisk && herb.riskDesc ? (
        <p className="popup-warning popup-warning-alto">⚠ {herb.riskDesc}</p>
      ) : null}
    </section>
  );
});

export const HerbFormModal = memo(function HerbFormModal({
  open,
  pendingPoint,
  editingMarker,
  onSuccess,
  onCancel,
  onError,
}: Props) {
  const createMutation = useCreateHerb();
  const updateMutation = useUpdateHerb();
  const catalog = useHerbCatalog();
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const firstKey = catalog.keys[0] ?? "";

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HerbFormValues>({
    resolver: zodResolver(HerbFormSchema),
    defaultValues: { herbKey: firstKey, status: "muita", notes: "", address: "" },
  });

  const herbKey = useWatch({ control, name: "herbKey" });
  const selectedHerb = herbKey ? catalog.byKey(herbKey) : undefined;

  const herbOptions = useMemo(
    () =>
      catalog.list.map((h) => ({
        value: h.key,
        label: h.name,
        sublabel: h.orixas.slice(0, 3).join(", ") || h.type || "",
      })),
    [catalog.list],
  );

  useEffect(() => {
    if (!open) {
      setSubmitError(null);
      return;
    }
    reset(
      editingMarker
        ? {
            herbKey: editingMarker.herbKey,
            status: editingMarker.status,
            notes: editingMarker.notes,
            address: editingMarker.addressLabel,
          }
        : { herbKey: firstKey, status: "muita", notes: "", address: "" },
    );
  }, [open, editingMarker, reset, firstKey]);

  async function onValid(values: HerbFormValues) {
    if (!pendingPoint) return;
    if (!catalog.has(values.herbKey)) {
      setSubmitError("Selecione uma erva válida do catálogo.");
      return;
    }
    setSubmitError(null);
    const payload = {
      herbKey: values.herbKey,
      status: values.status,
      notes: values.notes,
      addressLabel: values.address,
      lat: pendingPoint.lat,
      lng: pendingPoint.lng,
    };
    try {
      if (editingMarker) {
        await updateMutation.mutateAsync({ id: editingMarker.id, body: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível salvar.";
      setSubmitError(msg);
      onError(msg);
    }
  }

  const fieldErrors = [
    errors.herbKey?.message,
    errors.status?.message,
    errors.notes?.message,
    errors.address?.message,
  ].filter((m): m is string => Boolean(m));

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !isSaving) onCancel();
      }}
    >
      <DialogContent
        title={editingMarker ? "Editar localização" : "Adicionar localização"}
        description="Formulário para registrar uma erva no mapa"
      >
        <div className="modal-header">
          <h2 className="modal-title">
            {editingMarker ? "Editar localização" : "Adicionar localização"}
          </h2>
          <DialogClose asChild>
            <button
              type="button"
              className="modal-close"
              aria-label="fechar"
              disabled={isSaving}
              onClick={onCancel}
            >
              <X size={18} />
            </button>
          </DialogClose>
        </div>

        {pendingPoint ? (
          <p className="coord-label">
            📍 {pendingPoint.lat.toFixed(5)}, {pendingPoint.lng.toFixed(5)}
          </p>
        ) : null}

        {fieldErrors.length > 0 ? (
          <ul className="form-error" role="alert">
            {fieldErrors.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        ) : null}

        {submitError ? (
          <p className="form-error" role="alert">
            {submitError}
          </p>
        ) : null}

        {catalog.isLoading ? (
          <p className="coord-label">Carregando catálogo de ervas…</p>
        ) : null}

        {catalog.isError ? (
          <p className="form-error">Não foi possível carregar o catálogo.</p>
        ) : null}

        <label>
          Erva
          <Controller
            control={control}
            name="herbKey"
            render={({ field }) => (
              <Combobox
                options={herbOptions}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Selecionar erva…"
                searchPlaceholder="Buscar por nome ou orixá…"
                disabled={isSaving || catalog.isLoading}
              />
            )}
          />
        </label>

        <HerbPreview herb={selectedHerb} />

        <label>
          Status
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectItem value="muita">Muita erva</SelectItem>
                <SelectItem value="pouca">Pouca erva</SelectItem>
              </Select>
            )}
          />
        </label>

        <label>
          Endereço
          <Controller
            control={control}
            name="address"
            render={({ field }) => (
              <input
                {...field}
                placeholder="Rua, número, bairro"
                maxLength={140}
                disabled={isSaving}
              />
            )}
          />
        </label>

        <label>
          Observações
          <Controller
            control={control}
            name="notes"
            render={({ field }) => (
              <textarea
                {...field}
                placeholder="Detalhes do ponto"
                maxLength={280}
                disabled={isSaving}
              />
            )}
          />
        </label>

        <div className="modal-actions">
          <button
            type="button"
            className="primary"
            onClick={() => void handleSubmit(onValid)()}
            disabled={isSaving || catalog.isLoading}
          >
            {isSaving ? "Salvando…" : "Salvar"}
          </button>
          <button type="button" onClick={onCancel} disabled={isSaving}>
            Cancelar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
