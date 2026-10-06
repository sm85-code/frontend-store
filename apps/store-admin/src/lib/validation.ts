import { z } from 'zod'

export const nameSchema = z.string().trim().min(1, 'Nama wajib diisi').max(255, 'Maksimal 255 karakter')
export const passwordSchema = z.string().min(8, 'Minimal 8 karakter').refine(
  (value) => new TextEncoder().encode(value).length <= 72,
  'Maksimal 72 byte UTF-8',
)
export const currentPasswordSchema = z.string().min(1, 'Password saat ini wajib diisi').refine(
  (value) => new TextEncoder().encode(value).length <= 72,
  'Maksimal 72 byte UTF-8',
)
