import { z } from 'zod';
export const leadSchema = z.object({ name:z.string().min(2), phone:z.string().min(7), email:z.string().email().optional().or(z.literal('')), serviceId:z.string().optional(), message:z.string().max(5000).optional() });
export const serviceSchema = z.object({ title:z.string().min(3), description:z.string().min(10), priceFrom:z.coerce.number().int().min(0), isPopular:z.boolean().optional() });
export const reviewStatusSchema = z.enum(['PENDING', 'PUBLISHED', 'HIDDEN', 'REJECTED']);
export const reviewSchema = z.object({ clientName:z.string().min(2).max(80), rating:z.coerce.number().int().min(1).max(5), text:z.string().min(10).max(1200), isPublished:z.boolean().optional(), status:reviewStatusSchema.optional() });
export const publicReviewSchema = z.object({ clientName:z.string().trim().min(2).max(80), rating:z.coerce.number().int().min(1).max(5), text:z.string().trim().min(20).max(1200), website:z.string().max(0).optional(), turnstileToken:z.string().optional() });
export const portfolioSchema = z.object({ title:z.string().min(3), objectType:z.string().min(2), description:z.string().min(10), beforeImage:z.string().optional(), afterImage:z.string().optional(), completedAt:z.coerce.date() });
