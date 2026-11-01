/**
 * Reduz a foto no aparelho antes de enviar: JPEG com lado maior de até 1024 px, ajustando a
 * qualidade até caber em ~300 KB. Se ainda não couber, diminui o tamanho e tenta de novo
 * (a API recusa acima de 400 KB). Devolve base64 sem o prefixo data:.
 */
const SIDES = [1024, 800, 640, 480];
const QUALITIES = [0.78, 0.65, 0.5, 0.4];
const TARGET_BYTES = 300 * 1024;
const LIMIT_BYTES = 380 * 1024;

export async function compressPhoto(file: File): Promise<{ mime: "image/jpeg"; data: string; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const toBlob = (quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

  let blob: Blob | null = null;
  try {
    for (const side of SIDES) {
      const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      ctx?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
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
