import { z } from "zod";

export const HerbStatusSchema = z.enum(["pouca", "muita"]);

export const HerbFormSchema = z.object({
  herbKey: z.string().min(1, "Selecione uma erva"),
  status: HerbStatusSchema,
  notes: z.string().max(280, "Máximo 280 caracteres"),
  address: z.string().max(140, "Máximo 140 caracteres"),
});

export type HerbFormValues = z.infer<typeof HerbFormSchema>;
