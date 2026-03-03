import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
    username: z.string().min(3, 'Min 3 characters').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, underscores only'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Min 8 characters').regex(/[A-Z]/, 'Must contain uppercase').regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export const reportSchema = z.object({
    type: z.enum(['accident', 'congestion', 'roadblock', 'waterlogging', 'other']),
    congestionLevel: z.enum(['light', 'medium', 'heavy']),
    description: z.string().min(10, 'Min 10 characters').max(500, 'Max 500 characters'),
});

export const feedbackSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    message: z.string().min(10, 'Min 10 characters'),
});
