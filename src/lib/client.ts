import { treaty } from '@elysiajs/eden'
import type { app } from '@/app/api/[[...slug]]/route'

// this require .api to enter /api prefix
export const client = treaty<app>('localhost:3000').api
