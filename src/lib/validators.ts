import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Le nom de la catégorie doit contenir au moins 2 caractères'),
});

export const bookSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  author: z.string().min(1, "L'auteur est requis"),
  isbn: z.string().min(1, "L'ISBN est requis"),
  categoryId: z.number().min(0, "La catégorie est requise"),
});

export const inventorySchema = z.object({
  bookId: z.coerce.number().int().positive('Livre invalide'),
  quantity: z.coerce.number().min(0, 'La quantité doit être positive'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type CategoryFormValues = z.infer<typeof categorySchema>;
export type BookFormValues = z.infer<typeof bookSchema>;
export type InventoryFormValues = z.infer<typeof inventorySchema>;
