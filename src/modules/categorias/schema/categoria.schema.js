import { z } from "zod";

export const getCategorySchema = z.object({
  id: z.number()
    .int("El ID debe ser un número entero")
    .nonnegative("El ID debe ser un número positivo"),
});

export const createCategorySchema = z.object({
  name: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(15, "El nombre no debe superar los 15 caracteres"),
  image: z.string()
    .url("La imagen debe ser una URL válida"),
});

export const updateCategorySchema = z.object({
  name: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(15, "El nombre no debe superar los 15 caracteres")
    .optional(),
  image: z.string()
    .url("La imagen debe ser una URL válida")
    .optional(),
});
