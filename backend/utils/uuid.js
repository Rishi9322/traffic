import { randomUUID } from 'crypto';

/**
 * Generate a unique identifier using Node's built-in crypto module.
 */
export const generateId = () => randomUUID();
