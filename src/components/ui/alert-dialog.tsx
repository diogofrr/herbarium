"use client";

import * as Adlg from "@radix-ui/react-alert-dialog";

export const AlertDialog = Adlg.Root;

type AlertDialogContentProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
};

export function AlertDialogContent({
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  danger = false,
}: AlertDialogContentProps) {
  return (
    <Adlg.Portal>
      <Adlg.Overlay className="dialog-overlay" />
      <Adlg.Content className="dialog-content confirm-card">
        <div className="modal-header">
          <Adlg.Title className="modal-title">{title}</Adlg.Title>
        </div>
        <Adlg.Description className="confirm-text">{description}</Adlg.Description>
        <div className="modal-actions">
          <Adlg.Action asChild>
            <button
              type="button"
              className={danger ? "danger" : "primary"}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </Adlg.Action>
          <Adlg.Cancel asChild>
            <button type="button" onClick={onCancel}>
              {cancelLabel}
            </button>
          </Adlg.Cancel>
        </div>
      </Adlg.Content>
    </Adlg.Portal>
  );
}
