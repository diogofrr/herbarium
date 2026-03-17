"use client";

import { memo, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

import { HerbFormSchema, type HerbFormValues } from "@/schemas/herb-schema";
import { useCreateHerb, useUpdateHerb } from "@/hooks/use-herbs";
import { HERB_CATALOG, HERB_KEYS } from "@/lib/herb-catalog";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Select, SelectItem } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import type { HerbKey, HerbMarker } from "@/types/herb";

type Props = {
  open: boolean;
  pendingPoint: { lat: number; lng: number } | null;
  editingMarker: HerbMarker | null;
  onSuccess: () => void;
  onCancel: () => void;
  onError: (msg: string) => void;
};

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
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<HerbFormValues>({
    resolver: zodResolver(HerbFormSchema),
    defaultValues: { herbKey: "arruda", status: "muita", notes: "", address: "" },
  });

  // Sync form when modal opens or switches between create/edit mode.
  // react-hook-form's reset() must be called imperatively — this useEffect is necessary.
  useEffect(() => {
    if (!open) return;
    reset(
      editingMarker
        ? {
            herbKey: editingMarker.herbKey,
            status: editingMarker.status,
            notes: editingMarker.notes,
            address: editingMarker.addressLabel,
          }
        : { herbKey: "arruda", status: "muita", notes: "", address: "" },
    );
  }, [open, editingMarker, reset]);

  const herbKey = watch("herbKey") as HerbKey;
  const selectedHerb = HERB_CATALOG[herbKey];

  const herbOptions = useMemo(
    () =>
      HERB_KEYS.map((key) => ({
        value: key,
        label: HERB_CATALOG[key].label,
        sublabel: HERB_CATALOG[key].saintTags.slice(0, 3).join(", "),
      })),
    [],
  );

  async function onValid(values: HerbFormValues) {
    if (!pendingPoint) return;
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
      onError(err instanceof Error ? err.message : "Não foi possível salvar.");
    }
  }

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
          <h2 className="modal-title">{editingMarker ? "Editar localização" : "Adicionar localização"}</h2>
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

        {errors.herbKey || errors.status || errors.notes || errors.address ? (
          <p className="form-error" role="alert">
            {errors.herbKey?.message ?? errors.status?.message ?? errors.notes?.message ?? errors.address?.message}
          </p>
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
                searchPlaceholder="Buscar por nome ou santo…"
                disabled={isSaving}
              />
            )}
          />
        </label>

        <section className="herb-preview" aria-label="detalhes da erva selecionada">
          <p className="herb-preview-title">Resumo da erva</p>
          <div className="popup-tags">
            <span>{selectedHerb.label}</span>
            <span>{selectedHerb.energyTemperature}</span>
            <span>Risco: {selectedHerb.allergyRisk}</span>
          </div>
          <div className="popup-tags">
            {selectedHerb.saintTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="popup-tags popup-tags-props">
            {selectedHerb.properties.map((prop) => (
              <span key={prop}>{prop}</span>
            ))}
          </div>
          {selectedHerb.warningNote ? (
            <p className={`popup-warning popup-warning-${selectedHerb.allergyRisk}`}>
              ⚠ {selectedHerb.warningNote}
            </p>
          ) : null}
        </section>

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
            disabled={isSaving}
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
