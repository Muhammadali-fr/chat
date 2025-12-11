import { Elysia, t } from 'elysia'

const app = new Elysia({ prefix: '/api' })
    .get('/user', { name: "Muhammadali" });

export const GET = app.fetch
export const POST = app.fetch
export type app = typeof app 