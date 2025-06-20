import { z } from "zod";

export const getCustomerSchema = z.object({
  id: z.number()
    .int("El ID debe ser un número entero")
    .nonnegative("El ID debe ser un número positivo"),
});

export const createCustomerSchema = z.object({
  name: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(30, "El nombre no debe superar los 30 caracteres"),
  lastName: z.string()
    .min(1, "El apellido es obligatorio"),
  phone: z.string()
    .min(1, "El número de teléfono es obligatorio"),
  address: z.string()
    .min(1, "La dirección es obligatoria")
    .optional(),
});

export const updateCustomerSchema = z.object({
  name: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(30, "El nombre no debe superar los 30 caracteres")
    .optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional()
});


