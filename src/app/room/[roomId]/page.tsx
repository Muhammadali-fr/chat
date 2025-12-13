'use client';

import { useUsername } from "@/hooks/use-username";
import { client } from "@/lib/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Send, Copy, Timer, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { useRealtime } from "@/lib/realtime-client";
import ButtonLoader from "@/components/loaders/ButtonLoader";

export default function Page() {
  const { roomId } = useParams<{ roomId: string }>();
  const { username } = useUsername();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // error 
  useEffect(() => {
    setMounted(true);
  }, []);

  // time 
  useEffect(() => {
    if (!mounted || remaining === null) return;

    if (remaining <= 0) {
      router.push("/?destroyed=true");
      return;
    }

    const interval = setInterval(() => {
      setRemaining((prev) => (prev !== null ? prev - 1 : prev));
    }, 1000);

    return () => clearInterval(interval);
  }, [mounted, remaining, router]);

  // ttl 
  const { data: ttlData } = useQuery({
    queryKey: ["ttl", roomId],
    queryFn: async () => {
      const res = await client.room.ttl.get({ query: { roomId } });
      return res.data;
    },
  });

  useEffect(() => {
    if (ttlData?.ttl != null) {
      setRemaining(ttlData.ttl);
    }
  }, [ttlData]);

  // messages 
  const { data: messages, refetch } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: async () => {
      const res = await client.messages.get({ query: { roomId } });
      return res.data;
    },
  });

  useRealtime({
    channels: [roomId],
    events: ["chat.destroy", "chat.message"],
    onData: ({ event }) => {
      if (event === "chat.message") refetch();
      if (event === "chat.destroy") router.push("/?destroyed=true");
    },
  });

  // send messages 
  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async ({ text }: { text: string }) => {
      await client.messages.post(
        { sender: username, text },
        { query: { roomId } }
      );
    },
    onSuccess: () => {
      setInput("");
      inputRef.current?.focus();
    },
  });

  const { mutate: destroyFn } = useMutation({
    mutationFn: async () => {
      await client.room.delete(null, { query: { roomId } });
    }
  })

  const minutes = remaining !== null ? Math.floor(remaining / 60) : "--";
  const seconds = remaining !== null ? remaining % 60 : "--";

  if (!mounted) return null;

  return (
    <div className="flex flex-col">
      {/* header */}
      <div className="fixed top-4 left-0 w-full flex justify-center px-4 z-50">
        <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl border border-zinc-200 rounded-[22px] px-4 py-3 flex items-center justify-between">

          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500">Room id:</span>
            <span className="font-mono bg-zinc-100 px-2 py-1 rounded-lg text-green-600 font-bold">
              {roomId}
            </span>
            <button onClick={() => navigator.clipboard.writeText(roomId)}>
              <Copy size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1 text-sm text-zinc-600">
            <Timer size={16} />
            <span>
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
          </div>

          <button onClick={() => destroyFn()} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-[22px] bg-red-500 text-white">
            <Trash2 size={14} />
            Destroy
          </button>
        </div>
      </div>

      {/* messages  */}
      <div className="pt-28 pb-28 flex justify-center px-4">
        <div className="w-full max-w-2xl space-y-3">
          {messages?.messages.map((msg) => {
            const isMe = msg.sender === username;

            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] px-4 py-2 text-sm rounded-[22px]
                  ${isMe ? "bg-[#34C759] text-white rounded-br-md" : "bg-[#E5E5EA] text-black rounded-bl-md"}`}
                >
                  {msg.text}
                  <div className={`mt-1 text-[10px] text-right ${isMe ? "text-white/70" : "text-black/50"}`}>
                    {format(new Date(msg.timestamp), "HH:mm")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* bottom  */}
      <div className="fixed bottom-6 left-0 w-full flex justify-center px-4">
        <div className="bg-white w-full max-w-2xl border border-zinc-300/70 rounded-full pl-4 pr-1 py-1 flex items-center gap-3">
          <input
            autoFocus
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && input.trim() && sendMessage({ text: input })}
            placeholder="Write a message..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <button
            onClick={() => sendMessage({ text: input })}
            disabled={!input.trim() || isPending}
            className="w-10 h-10 rounded-full bg-[#34C759] text-white disabled:bg-zinc-300 flex items-center justify-center cursor-pointer"
          >
            {isPending ? <ButtonLoader /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
