import { z } from 'zod';
import { moodInputSchema, moodRequests } from './schema';

export const api = {
  recommendations: {
    create: {
      method: 'POST' as const,
      path: '/api/recommendations',
      input: moodInputSchema,
      responses: {
        200: z.object({
          recommendations: z.array(z.object({
            title: z.string(),
            type: z.enum(["Movie", "TV Show", "YouTube Video"]),
            description: z.string(),
            reason: z.string(),
          }))
        }),
        400: z.object({ message: z.string() }),
        500: z.object({ message: z.string() }),
      },
    },
    list: {
        method: 'GET' as const,
        path: '/api/history',
        responses: {
            200: z.array(z.custom<typeof moodRequests.$inferSelect>()),
        }
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
