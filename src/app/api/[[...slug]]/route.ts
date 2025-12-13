import { redis } from '@/lib/redis';
import { Elysia, t } from 'elysia'
import { nanoid } from 'nanoid';
import { authMiddleware } from './auth';
import { z } from 'zod';
const ROOM_SECONDS = 60 * 10;

const room = new Elysia({ prefix: '/room' })
    .post("/create", async () => {
        const roomId = nanoid();
        await redis.hset(`meta:${roomId}`, {
            connected: [],
            createdAt: Date.now(),
        });

        await redis.expire(`meta:${roomId}`, ROOM_SECONDS);
        return { roomId };
    })

const message = new Elysia({ prefix: "/messages" }).use(authMiddleware).post("/", async ({ body, auth }) => {
    const { sender, text } = body;

    const { roomId } = auth;

    const roomExists = await redis.exists(`meta:${roomId}`);
    if (!roomExists) {
        throw new Error("Room does not exist.");
    };

}, {
    query: z.object({ roomId: z.string() }),
    body: z.object({
        sender: z.string().max(100),
        text: z.string().max(1000),
    }),
});

const app = new Elysia({ prefix: '/api' }).use(room);

export const GET = app.fetch
export const POST = app.fetch
export type app = typeof app 