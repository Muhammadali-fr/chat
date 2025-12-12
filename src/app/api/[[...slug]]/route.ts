import { redis } from '@/lib/redis';
import { Elysia, t } from 'elysia'
import { nanoid } from 'nanoid';
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

const app = new Elysia({ prefix: '/api' }).use(room);

export const GET = app.fetch
export const POST = app.fetch
export type app = typeof app 