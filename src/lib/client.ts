import { treaty } from '@elysiajs/eden'
import type { app } from '@/app/api/[[...slug]]/route'

const baseURL =
  typeof window === 'undefined'
    ? 'http://localhost:3000'
    : window.location.origin

export const client = treaty<app>(baseURL).api
