import { z } from 'zod';
export const leadSchema = z.object({ name:z.string().min(2), phone:z.string().min(7), email:z.string().email().optional().or(z.literal('')), serviceId:z.string().optional(), message:z.string().max(5000).optional() });
export const serviceSchema = z.object({ title:z.string().min(3), description:z.string().min(10), priceFrom:z.coerce.number().int().min(0), isPopular:z.boolean().optional() });
export const reviewSchema = z.object({ clientName:z.string().min(2), rating:z.coerce.number().int().min(1).max(5), text:z.string().min(10), isPublished:z.boolean().optional() });
export const portfolioSchema = z.object({ title:z.string().min(3), objectType:z.string().min(2), description:z.string().min(10), beforeImage:z.string().optional(), afterImage:z.string().optional(), completedAt:z.coerce.date() });
