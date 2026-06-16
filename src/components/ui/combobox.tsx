"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import * as Popover from "@radix-ui/react-popover";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, ChevronDown, Search, X } from "lucide-react";

export type ComboboxOption = {
  value: string;
  label: string;
  sublabel?: string;
};

type ComboboxProps = {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  emptyMessage?: string;
};

const ITEM_HEIGHT = 48;

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Selecionar…",
  searchPlaceholder = "Buscar…",
  disabled = false,
  emptyMessage = "Nenhum resultado",
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlight, setHighlight] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  const filtered = useMemo(() => {
    const q = normalize(search.trim());
    if (!q) return options;
    return options.filter((o) => {
      const inLabel = normalize(o.label).includes(q);
      const inSub = o.sublabel ? normalize(o.sublabel).includes(q) : false;
      return inLabel || inSub;
    });
  }, [options, search]);

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 8,
  });

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    const idx = filtered.findIndex((o) => o.value === value);
    setHighlight(idx >= 0 ? idx : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (highlight >= filtered.length) setHighlight(0);
  }, [filtered.length, highlight]);

  useEffect(() => {
    if (!open) return;
    virtualizer.scrollToIndex(highlight, { align: "auto" });
  }, [highlight, open, virtualizer]);

  const handleSelect = useCallback(
    (optValue: string) => {
      onValueChange(optValue);
      setOpen(false);
    },
    [onValueChange],
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[highlight];
      if (opt) handleSelect(opt.value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "Home") {
      e.preventDefault();
      setHighlight(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setHighlight(filtered.length - 1);
    }
  };

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
            {selected ? (
              selected.label
            ) : (
              <span className="combobox-placeholder">{placeholder}</span>
            )}
          </span>
          <ChevronDown
            size={14}
            className={`select-icon${open ? " rotated" : ""}`}
          />
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
          <div className="combobox-search">
            <Search size={14} className="combobox-search-icon" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlight(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="combobox-search-input"
              aria-label="filtrar opções"
              aria-controls="combobox-listbox"
              aria-activedescendant={
                filtered[highlight]
                  ? `combobox-item-${filtered[highlight].value}`
                  : undefined
              }
              autoComplete="off"
            />
            {search ? (
              <button
                type="button"
                className="combobox-search-clear"
                onClick={() => {
                  setSearch("");
                  setHighlight(0);
                  inputRef.current?.focus();
                }}
                aria-label="limpar pesquisa"
              >
                <X size={12} />
              </button>
            ) : null}
          </div>

          {filtered.length > 0 ? (
            <div
              ref={listRef}
              className="combobox-list"
              role="listbox"
              id="combobox-listbox"
              style={{ height: Math.min(filtered.length, 6) * ITEM_HEIGHT }}
            >
              <div
                style={{
                  height: virtualizer.getTotalSize(),
                  width: "100%",
                  position: "relative",
                }}
              >
                {virtualizer.getVirtualItems().map((vi) => {
                  const opt = filtered[vi.index];
                  if (!opt) return null;
                  const isSelected = opt.value === value;
                  const isHighlighted = vi.index === highlight;
                  return (
                    <div
                      id={`combobox-item-${opt.value}`}
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      className={`combobox-item${
                        isSelected ? " selected" : ""
                      }${isHighlighted ? " highlighted" : ""}`}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: ITEM_HEIGHT,
                        transform: `translateY(${vi.start}px)`,
                      }}
                      onMouseEnter={() => setHighlight(vi.index)}
                      onClick={() => handleSelect(opt.value)}
                    >
                      <span className="combobox-item-check">
                        {isSelected ? <Check size={12} /> : null}
                      </span>
                      <span className="combobox-item-text">
                        {opt.label}
                        {opt.sublabel ? (
                          <span className="combobox-item-sublabel">
                            {opt.sublabel}
                          </span>
                        ) : null}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="combobox-empty">
              {search ? `${emptyMessage} para "${search}"` : emptyMessage}
            </p>
          )}

          {search && filtered.length > 0 ? (
            <p className="combobox-count">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </p>
          ) : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
