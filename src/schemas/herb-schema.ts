import { z } from "zod";
import { HERB_KEYS } from "@/lib/herb-catalog";

export const HerbStatusSchema = z.enum(["pouca", "muita"]);

export const HerbKeySchema = z.enum(HERB_KEYS as [string, ...string[]]);

export const HerbFormSchema = z.object({
  herbKey: HerbKeySchema,
  status: HerbStatusSchema,
  notes: z.string().max(280, "Máximo 280 caracteres"),
  address: z.string().max(140, "Máximo 140 caracteres"),
});

export type HerbFormValues = z.infer<typeof HerbFormSchema>;
