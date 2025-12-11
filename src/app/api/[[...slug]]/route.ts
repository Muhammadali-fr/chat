import { Elysia, t } from 'elysia'

const room = new Elysia({ prefix: '/room' })
    .post("/create", () => { console.log("Hellooo room") })

const app = new Elysia({ prefix: '/api' }).use(room);

export const GET = app.fetch
export const POST = app.fetch
export type app = typeof app 