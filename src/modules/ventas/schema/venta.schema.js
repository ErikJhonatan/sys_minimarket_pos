import { z } from "zod";

export const getOrderSchema = z.object({
  id: z.number()
    .int("El ID debe ser un número entero")
    .nonnegative("El ID debe ser un número positivo"),
});

export const createOrderSchema = z.object({
  customerId: z.number()
    .int("El ID del cliente debe ser un número entero")
    .nonnegative("El ID del cliente debe ser un número positivo"),
});

export const addProductSchema = z.object({
  orderId: z.number()
    .int("El ID del pedido debe ser un número entero")
    .nonnegative("El ID del pedido debe ser un número positivo"),
  productId: z.number()
    .int("El ID del producto debe ser un número entero")
    .nonnegative("El ID del producto debe ser un número positivo"),
  amount: z.number()
    .int("La cantidad debe ser un número entero")
    .min(1, "La cantidad debe ser al menos 1"),
});
