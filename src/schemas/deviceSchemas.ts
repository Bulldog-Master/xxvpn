import { z } from 'zod';

export const deviceSchema = z.object({
  deviceName: z
    .string()
    .trim()
    .min(1, 'Device name is required')
    .max(100, 'Device name must be less than 100 characters'),
  deviceType: z
    .string()
    .trim()
    .min(1, 'Device type is required')
    .max(50, 'Device type must be less than 50 characters'),
  operatingSystem: z
    .string()
    .trim()
    .max(50, 'Operating system must be less than 50 characters')
    .optional(),
});

export type DeviceInput = z.infer<typeof deviceSchema>;
