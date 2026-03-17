"use client";

import * as Sel from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

type SelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
};

export function Select({ value, onValueChange, placeholder = "Selecionar…", children }: SelectProps) {
  return (
    <Sel.Root value={value} onValueChange={onValueChange}>
      <Sel.Trigger className="select-trigger" aria-label="selecionar">
        <Sel.Value placeholder={placeholder} />
        <Sel.Icon className="select-icon">
          <ChevronDown size={14} />
        </Sel.Icon>
      </Sel.Trigger>

      <Sel.Portal>
        <Sel.Content className="select-content" position="popper" sideOffset={4}>
          <Sel.ScrollUpButton className="select-scroll-btn">
            <ChevronUp size={14} />
          </Sel.ScrollUpButton>

          <Sel.Viewport className="select-viewport">
            {children}
          </Sel.Viewport>

          <Sel.ScrollDownButton className="select-scroll-btn">
            <ChevronDown size={14} />
          </Sel.ScrollDownButton>
        </Sel.Content>
      </Sel.Portal>
    </Sel.Root>
  );
}

type SelectItemProps = {
  value: string;
  children: React.ReactNode;
};

export function SelectItem({ value, children }: SelectItemProps) {
  return (
    <Sel.Item value={value} className="select-item">
      <Sel.ItemIndicator className="select-item-check">
        <Check size={12} />
      </Sel.ItemIndicator>
      <Sel.ItemText>{children}</Sel.ItemText>
    </Sel.Item>
  );
}

export type { SelectProps };
