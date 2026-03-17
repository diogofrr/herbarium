"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, ChevronDown, Search, X } from "lucide-react";

export type ComboboxOption = {
  value: string;
  label: string;
  /** Optional sublabel shown below the main label */
  sublabel?: string;
};

type ComboboxProps = {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
};

const ITEM_HEIGHT = 38;
const MAX_LIST_HEIGHT = 280;

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Selecionar…",
  searchPlaceholder = "Buscar…",
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q));
  }, [options, search]);

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 8,
  });

  // Focus search input when popover opens
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    } else {
      setSearch("");
    }
  }, [open]);

  // Scroll selected item into view on open
  useEffect(() => {
    if (!open || !value) return;
    const idx = filtered.findIndex((o) => o.value === value);
    if (idx > -1) virtualizer.scrollToIndex(idx, { align: "auto" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleSelect(optValue: string) {
    onValueChange(optValue);
    setOpen(false);
  }

  const listHeight = Math.min(filtered.length * ITEM_HEIGHT, MAX_LIST_HEIGHT);

  return (
    <Popover.Root open={open} onOpenChange={disabled ? undefined : setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={`select-trigger combobox-trigger${open ? " open" : ""}`}
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
        >
          <span className="combobox-trigger-label">
            {selected ? selected.label : <span className="combobox-placeholder">{placeholder}</span>}
          </span>
          <ChevronDown size={14} className={`select-icon${open ? " rotated" : ""}`} />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="combobox-content"
          align="start"
          sideOffset={4}
          avoidCollisions
          onOpenAutoFocus={(e) => e.preventDefault()}
          style={{ width: "var(--radix-popover-trigger-width)" }}
        >
          {/* Search input */}
          <div className="combobox-search">
            <Search size={14} className="combobox-search-icon" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                // Reset virtualizer scroll to top on new search
                listRef.current?.scrollTo({ top: 0 });
              }}
              placeholder={searchPlaceholder}
              className="combobox-search-input"
              aria-label="filtrar opções"
              autoComplete="off"
            />
            {search ? (
              <button
                type="button"
                className="combobox-search-clear"
                onClick={() => {
                  setSearch("");
                  inputRef.current?.focus();
                }}
                aria-label="limpar pesquisa"
              >
                <X size={12} />
              </button>
            ) : null}
          </div>

          {/* Virtualized list */}
          {filtered.length > 0 ? (
            <div
              ref={listRef}
              className="combobox-list"
              role="listbox"
              style={{ height: listHeight }}
            >
              <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
                {virtualizer.getVirtualItems().map((vItem) => {
                  const opt = filtered[vItem.index];
                  const isSelected = opt.value === value;
                  return (
                    <div
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      className={`combobox-item${isSelected ? " selected" : ""}`}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: vItem.size,
                        transform: `translateY(${vItem.start}px)`,
                      }}
                      onClick={() => handleSelect(opt.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") handleSelect(opt.value);
                      }}
                      tabIndex={0}
                    >
                      <span className="combobox-item-check">
                        {isSelected ? <Check size={12} /> : null}
                      </span>
                      <span className="combobox-item-text">
                        {opt.label}
                        {opt.sublabel ? (
                          <span className="combobox-item-sublabel">{opt.sublabel}</span>
                        ) : null}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="combobox-empty">Nenhum resultado para &ldquo;{search}&rdquo;</p>
          )}

          {/* Count hint */}
          {search && filtered.length > 0 ? (
            <p className="combobox-count">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</p>
          ) : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
