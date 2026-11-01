"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import type { PhotoCrop } from "@/lib/image";

const FRAME = 280;
const MAX_ZOOM = 4;

type Props = {
  file: File | null;
  onCancel: () => void;
  onConfirm: (file: File, crop: PhotoCrop) => void;
};

/** Enquadramento quadrado: arrastar move a foto, o controle aproxima. */
export function PhotoCropper({ file, onCancel, onConfirm }: Props) {
  return (
    <Dialog open={file !== null} onOpenChange={(open) => (open ? undefined : onCancel())}>
      <DialogContent title="Enquadrar foto" description="Arraste a foto e use o zoom para escolher o quadrado que será enviado.">
        {file ? <CropBody key={`${file.name}-${file.size}-${file.lastModified}`} file={file} onCancel={onCancel} onConfirm={onConfirm} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function CropBody({ file, onCancel, onConfirm }: { file: File; onCancel: () => void; onConfirm: Props["onConfirm"] }) {
  const [url, setUrl] = useState<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    // A URL precisa ser criada e revogada junto com o efeito (o modo estrito roda o efeito duas vezes).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  // Escala que faz a foto cobrir o quadrado; o zoom multiplica essa base.
  const base = dims ? FRAME / Math.min(dims.w, dims.h) : 1;
  const scale = base * zoom;
  const clamp = (o: { x: number; y: number }, z = zoom) => {
    if (!dims) return o;
    const s = base * z;
    const maxX = Math.max(0, (dims.w * s - FRAME) / 2);
    const maxY = Math.max(0, (dims.h * s - FRAME) / 2);
    return { x: Math.min(maxX, Math.max(-maxX, o.x)), y: Math.min(maxY, Math.max(-maxY, o.y)) };
  };

  const confirm = () => {
    if (!dims) return;
    const size = FRAME / scale;
    const x = dims.w / 2 - offset.x / scale - size / 2;
    const y = dims.h / 2 - offset.y / scale - size / 2;
    onConfirm(file, {
      x: Math.max(0, Math.min(dims.w - size, x)),
      y: Math.max(0, Math.min(dims.h - size, y)),
      size,
    });
  };

  return (
    <>
      <div className="modal-header">
        <h2 className="modal-title">Enquadrar foto</h2>
        <DialogClose asChild>
          <button type="button" className="modal-close" aria-label="Cancelar">
            <X size={18} />
          </button>
        </DialogClose>
      </div>
      <div
        className="crop-frame"
        style={{ width: FRAME, height: FRAME }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (d) setOffset(clamp({ x: d.ox + e.clientX - d.px, y: d.oy + e.clientY - d.py }));
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Foto a enquadrar"
            draggable={false}
            onLoad={(e) => setDims({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            style={
              dims
                ? {
                    width: dims.w * scale,
                    height: dims.h * scale,
                    transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                  }
                : { visibility: "hidden" }
            }
          />
        ) : null}
      </div>
      <label className="crop-zoom">
        <span className="pv-small">Zoom</span>
        <input
          type="range"
          min={1}
          max={MAX_ZOOM}
          step={0.01}
          value={zoom}
          aria-label="Zoom"
          onChange={(e) => {
            const z = Number(e.target.value);
            setZoom(z);
            setOffset((o) => clamp(o, z));
          }}
        />
      </label>
      <div className="modal-actions">
        <button type="button" className="btn" onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" className="btn btn-primary" disabled={!dims} onClick={confirm}>
          Usar este enquadramento
        </button>
      </div>
    </>
  );
}
