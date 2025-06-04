import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(15, "El nombre no debe superar los 15 caracteres"),
  price: z.number()
    .min(0.10, "El precio mínimo es 0.10"),
  description: z.string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(100, "La descripción no debe superar los 100 caracteres"),
  image: z.string()
    .url("La imagen debe ser una URL válida"),
  categoryId: z.number()
    .int("El ID de la categoría debe ser un número entero")
    .min(1, "El ID de la categoría debe ser mayor o igual a 1"),
  stock: z.number()
    .int("El stock debe ser un número entero")
    .min(0, "El stock no puede ser negativo"),
  stockMin: z.number()
    .int("El stock mínimo debe ser un número entero")
    .min(0, "El stock mínimo no puede ser negativo"),
  code: z.string()
    .min(3, "El código debe tener al menos 3 caracteres")
    .max(20, "El código no debe superar los 20 caracteres"),
}).refine(
  (data) => data.stock >= data.stockMin,
  {
    message: "El stock actual debe ser mayor o igual al stock mínimo",
    path: ["stock"],
  }
);

export const updateProductSchema = z.object({
  name: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(15, "El nombre no debe superar los 15 caracteres")
    .optional(),
  price: z.number()
    .min(0.10, "El precio mínimo es 0.10")
    .optional(),
  description: z.string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(100, "La descripción no debe superar los 100 caracteres")
    .optional(),
  image: z.string()
    .url("La imagen debe ser una URL válida")
    .optional(),
  categoryId: z.number()
    .int("El ID de la categoría debe ser un número entero")
    .min(1, "El ID de la categoría debe ser mayor o igual a 1")
    .optional(),
  stock: z.number()
    .int("El stock debe ser un número entero")
    .min(0, "El stock no puede ser negativo")
    .optional(),
  stockMin: z.number()
    .int("El stock mínimo debe ser un número entero")
    .min(0, "El stock mínimo no puede ser negativo")
    .optional(),
  code: z.string()
    .min(3, "El código debe tener al menos 3 caracteres")
    .max(20, "El código no debe superar los 20 caracteres")
    .optional(),
});

export const getProductSchema = z.object({
  id: z.string()
    .uuid("El ID debe tener formato UUID"),
});

export const queryProductSchema = z.object({
  limit: z.number()
    .int("El límite debe ser un número entero")
    .min(1, "el límite mínimo es 1")
    .max(50, "El límite máximo es 50")
    .optional(),
  offset: z.number()
    .int("El offset debe ser un número entero")
    .min(0, "El offset no puede ser negativo")
    .optional(),
  price: z.number()
    .min(0.10, "El precio mínimo es 0.10")
    .optional(),
  price_min: z.number()
    .min(0.10, "El precio mínimo es 0.10")
    .default(0)
    .optional(),
  price_max: z.number()
    .min(0.10, "El precio máximo debe ser al menos 0.10")
    .optional(),
}).refine(
  (data) => !data.price_min || !data.price_max || data.price_max >= data.price_min,
  {
    message: "El precio máximo debe ser mayor o igual al precio mínimo",
    path: ["price_max"],
  }
);
