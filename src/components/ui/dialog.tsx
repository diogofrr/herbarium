"use client";

import * as Dlg from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export const Dialog = Dlg.Root;
export const DialogTrigger = Dlg.Trigger;
export const DialogClose = Dlg.Close;

type DialogContentProps = {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
};

export function DialogContent({ title, description, className = "", children }: DialogContentProps) {
  return (
    <Dlg.Portal>
      <Dlg.Overlay className="dialog-overlay" />
      <Dlg.Content className={`dialog-content ${className}`}>
        <VisuallyHidden>
          <Dlg.Title>{title}</Dlg.Title>
          {description ? <Dlg.Description>{description}</Dlg.Description> : null}
        </VisuallyHidden>
        {children}
      </Dlg.Content>
    </Dlg.Portal>
  );
}
