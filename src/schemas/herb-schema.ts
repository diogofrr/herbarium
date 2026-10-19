import { z } from "zod";

export const MarkerStatusSchema = z.enum(["pouca", "muita"]);

export const MarkerFormSchema = z.object({
  herbSlug: z.string().min(1, "Escolha uma erva"),
  status: MarkerStatusSchema,
  notes: z.string().max(280, "Máximo 280 caracteres"),
  address: z.string().max(140, "Máximo 140 caracteres"),
});

export type MarkerFormValues = z.infer<typeof MarkerFormSchema>;
