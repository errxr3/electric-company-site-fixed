import { z } from 'zod';
import { normalizeRussianPhone } from './phone';
export const leadSchema = z.object({ name:z.string().min(2), phone:z.string().refine((value)=>Boolean(normalizeRussianPhone(value)), 'Укажите российский номер телефона.'), email:z.string().email().optional().or(z.literal('')), serviceId:z.string().optional(), message:z.string().max(5000).optional() });
export const serviceSchema = z.object({ title:z.string().min(3), description:z.string().min(10), priceFrom:z.coerce.number().int().min(0), isPopular:z.boolean().optional() });
export const reviewStatusSchema = z.enum(['PENDING', 'PUBLISHED', 'HIDDEN', 'REJECTED']);
export const reviewSchema = z.object({ clientName:z.string().min(2).max(80), rating:z.coerce.number().int().min(1).max(5), text:z.string().min(10).max(1200), isPublished:z.boolean().optional(), status:reviewStatusSchema.optional() });
export const publicReviewSchema = z.object({ clientName:z.string().trim().min(2,'Укажите имя от 2 символов.').max(80,'Имя слишком длинное.'), rating:z.coerce.number().int().min(1,'Выберите оценку.').max(5,'Выберите оценку от 1 до 5.'), text:z.string().trim().min(10,'Напишите отзыв от 10 символов.').max(1200,'Отзыв слишком длинный.'), website:z.string().optional(), companySite:z.string().optional(), turnstileToken:z.string().optional() });
export const portfolioSchema = z.object({ title:z.string().min(3), objectType:z.string().min(2), description:z.string().min(10), beforeImage:z.string().optional(), afterImage:z.string().optional(), completedAt:z.coerce.date() });
