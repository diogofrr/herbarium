/**
 * Reduz a foto no aparelho antes de enviar: lado maior de até 1024 px, JPEG,
 * ajustando a qualidade até caber em ~300 KB. Devolve base64 sem o prefixo data:.
 */
export async function compressPhoto(file: File): Promise<{ mime: "image/jpeg"; data: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const toBlob = (quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

  let blob: Blob | null = null;
  for (const quality of [0.78, 0.65, 0.5, 0.4]) {
    blob = await toBlob(quality);
    if (blob && blob.size <= 300 * 1024) break;
  }
  if (!blob || blob.size > 380 * 1024) throw new Error("Não foi possível reduzir a foto. Tente outra.");

  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return { mime: "image/jpeg", data: btoa(binary) };
}
