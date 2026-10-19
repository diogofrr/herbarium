"use client";

import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { FunctionChips, LinkChips, TemperatureChip } from "@/components/chips";
import { HerbPicker } from "@/components/herb-picker";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { useCreateMarker, useUpdateMarker } from "@/hooks/use-markers";
import { MarkerFormSchema, type MarkerFormValues } from "@/schemas/herb-schema";
import type { HerbCard, HerbMarker } from "@/types/herb";

type Props = {
  open: boolean;
  herbs: HerbCard[];
  pendingPoint: { lat: number; lng: number } | null;
  editing: HerbMarker | null;
  initialHerbSlug?: string;
  onSuccess: (message: string) => void;
  onCancel: () => void;
};

export function MarkerForm(props: Props) {
  const { open, editing, onCancel } = props;
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent
        title={editing ? "Editar marcação" : "Nova marcação"}
        description="Escolha a erva e informe a quantidade encontrada neste ponto."
      >
        {/* O corpo monta a cada abertura: estado e valores iniciais sempre limpos. */}
        <MarkerFormBody {...props} />
      </DialogContent>
    </Dialog>
  );
}

function MarkerFormBody({
  herbs,
  pendingPoint,
  editing,
  initialHerbSlug,
  onSuccess,
  onCancel,
}: Props) {
  const create = useCreateMarker();
  const update = useUpdateMarker();
  const [serverError, setServerError] = useState<string | null>(null);

  const defaults = useMemo<MarkerFormValues>(
    () => ({
      herbSlug: editing?.herbSlug ?? initialHerbSlug ?? "",
      status: editing?.status ?? "muita",
      notes: editing?.notes ?? "",
      address: editing?.addressLabel ?? "",
    }),
    [editing, initialHerbSlug],
  );

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MarkerFormValues>({
    resolver: zodResolver(MarkerFormSchema),
    defaultValues: defaults,
  });

  const slug = useWatch({ control, name: "herbSlug" });
  const picked = herbs.find((h) => h.slug === slug);
  const busy = create.isPending || update.isPending;

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.id,
          body: {
            herbSlug: values.herbSlug,
            status: values.status,
            notes: values.notes,
            addressLabel: values.address,
          },
        });
        onSuccess("Marcação atualizada.");
      } else {
        if (!pendingPoint) {
          setServerError("Toque no mapa para escolher o ponto.");
          return;
        }
        await create.mutateAsync({
          herbSlug: values.herbSlug,
          status: values.status,
          notes: values.notes,
          addressLabel: values.address,
          lat: pendingPoint.lat,
          lng: pendingPoint.lng,
        });
        onSuccess("Marcação adicionada ao mapa.");
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Não foi possível salvar.");
    }
  });

  return (
    <>
        <div className="modal-header">
          <h2 className="modal-title">{editing ? "Editar marcação" : "Nova marcação"}</h2>
          <DialogClose asChild>
            <button type="button" className="modal-close" aria-label="Fechar" disabled={busy}>
              <X size={18} />
            </button>
          </DialogClose>
        </div>

        <form onSubmit={onSubmit} className="form-stack" noValidate>
          <div className="field">
            <span>Erva</span>
            <Controller
              control={control}
              name="herbSlug"
              render={({ field }) => (
                <HerbPicker herbs={herbs} value={field.value} onChange={field.onChange} disabled={busy} />
              )}
            />
            {errors.herbSlug ? <p className="form-error">{errors.herbSlug.message}</p> : null}
          </div>

          {picked ? (
            <section className="herb-preview" aria-label="Resumo da erva escolhida">
              <p>
                <strong>{picked.name}</strong> <TemperatureChip temperature={picked.temperature} />
              </p>
              <LinkChips items={picked.orixas} kind="orixa" limit={4} />
              {picked.povos.length > 0 ? <LinkChips items={picked.povos} kind="povo" limit={4} /> : null}
              <FunctionChips slugs={picked.functions} />
            </section>
          ) : null}

          <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
            <span>Quantidade neste ponto</span>
            <div className="segmented">
              <label>
                <input type="radio" value="muita" {...register("status")} disabled={busy} />
                <span>Muita erva</span>
              </label>
              <label>
                <input type="radio" value="pouca" {...register("status")} disabled={busy} />
                <span>Pouca erva</span>
              </label>
            </div>
          </fieldset>

          <label className="field">
            <span>
              Endereço ou referência <small>(opcional)</small>
            </span>
            <input type="text" maxLength={140} placeholder="Ex.: Praça da Matriz" {...register("address")} disabled={busy} />
            {errors.address ? <p className="form-error">{errors.address.message}</p> : null}
          </label>

          <label className="field">
            <span>
              Observações <small>(opcional)</small>
            </span>
            <textarea maxLength={280} placeholder="Ex.: no canteiro, perto da calçada" {...register("notes")} disabled={busy} />
            {errors.notes ? <p className="form-error">{errors.notes.message}</p> : null}
          </label>

          {serverError ? (
            <p className="form-error" role="alert">
              {serverError}
            </p>
          ) : null}

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onCancel} disabled={busy}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? <Loader2 size={16} className="auth-spinner" aria-hidden /> : null}
              {editing ? "Salvar" : "Adicionar ao mapa"}
            </button>
          </div>
        </form>
    </>
  );
}
