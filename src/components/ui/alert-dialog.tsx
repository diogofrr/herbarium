"use client";

import * as Adlg from "@radix-ui/react-alert-dialog";
import { CircleHelp, TriangleAlert } from "lucide-react";

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
        <span className={`confirm-icon${danger ? " is-danger" : ""}`} aria-hidden>
          {danger ? <TriangleAlert size={26} /> : <CircleHelp size={26} />}
        </span>
        <Adlg.Title className="confirm-title">{title}</Adlg.Title>
        <Adlg.Description className="confirm-text">{description}</Adlg.Description>
        <div className="confirm-actions">
          <Adlg.Cancel asChild>
            <button type="button" className="btn" onClick={onCancel}>
              {cancelLabel}
            </button>
          </Adlg.Cancel>
          <Adlg.Action asChild>
            <button
              type="button"
              className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </Adlg.Action>
        </div>
      </Adlg.Content>
    </Adlg.Portal>
  );
}
