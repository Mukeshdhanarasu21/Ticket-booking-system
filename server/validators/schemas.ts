import { z } from 'zod';

export const uuidSchema = z.string().uuid({ message: 'Invalid UUID format' });

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['USER', 'ADMIN']).optional().default('USER'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const eventQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).optional(),
  search: z.string().optional(),
});

export const createEventSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  description: z.string().trim().min(1, 'Description is required'),
  venue: z.string().trim().min(1, 'Venue is required'),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Event date must be YYYY-MM-DD'),
  startTime: z.string().trim().min(1, 'Start time is required'),
  endTime: z.string().trim().min(1, 'End time is required'),
  totalCapacity: z.number().int().positive('Total capacity must be greater than 0'),
  price: z.number().min(0, 'Price must be 0 or greater').default(0),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).optional().default('PUBLISHED'),
});

export const updateEventSchema = createEventSchema.partial();

export const createBookingSchema = z.object({
  eventId: uuidSchema,
  seatIds: z
    .array(uuidSchema)
    .min(1, 'At least one seat must be selected')
    .refine((items) => new Set(items).size === items.length, {
      message: 'Duplicate seat IDs are not allowed in booking request',
    }),
});
