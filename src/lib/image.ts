/**
 * Reduz a foto no aparelho antes de enviar: JPEG com lado maior de até 1024 px, ajustando a
 * qualidade até caber em ~300 KB. Se ainda não couber, diminui o tamanho e tenta de novo
 * (a API recusa acima de 400 KB). Com `crop`, usa só esse quadrado da foto original
 * (coordenadas em pixels da imagem). Devolve base64 sem o prefixo data:.
 */
export type PhotoCrop = { x: number; y: number; size: number };

const SIDES = [1024, 800, 640, 480];
const QUALITIES = [0.78, 0.65, 0.5, 0.4];
const TARGET_BYTES = 300 * 1024;
const LIMIT_BYTES = 380 * 1024;

export async function compressPhoto(
  file: File,
  crop?: PhotoCrop,
): Promise<{ mime: "image/jpeg"; data: string; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const sx = crop?.x ?? 0;
  const sy = crop?.y ?? 0;
  const sw = crop?.size ?? bitmap.width;
  const sh = crop?.size ?? bitmap.height;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const toBlob = (quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

  let blob: Blob | null = null;
  try {
    for (const side of SIDES) {
      const scale = Math.min(1, side / Math.max(sw, sh));
      canvas.width = Math.max(1, Math.round(sw * scale));
      canvas.height = Math.max(1, Math.round(sh * scale));
      ctx?.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      for (const quality of QUALITIES) {
        blob = await toBlob(quality);
        if (blob && blob.size <= TARGET_BYTES) break;
      }
      if (blob && blob.size <= LIMIT_BYTES) break;
    }
  } finally {
    bitmap.close();
  }
  if (!blob || blob.size > LIMIT_BYTES) throw new Error("Não foi possível reduzir a foto. Tente outra.");

  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return { mime: "image/jpeg", data: btoa(binary), width: canvas.width, height: canvas.height };
}
