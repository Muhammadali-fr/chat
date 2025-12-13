'use client'

import { useUsername } from "@/hooks/use-username";
import { client } from "@/lib/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns/fp";
import { Send, Copy, Timer, Trash2, MoveDown } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const ROOM_SECONDS = 60 * 10;

export default function Page() {
  const { roomId } = useParams<{ roomId: string }>();
  const { username } = useUsername();

  const [input, setInput] = useState("");
  const [remaining, setRemaining] = useState(ROOM_SECONDS);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const { data: messages } = useQuery({
    queryKey: ['messages', roomId],
    queryFn: async () => {
      const res = await client.messages.get({ query: { roomId } });
      return res.data;
    }
  })

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

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  console.log(messages);

  return (
    <div className="flex flex-col">
      {/* HEADER */}
      <div className="fixed top-4 left-0 w-full flex justify-center px-4 z-50">
        <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl border border-zinc-200 rounded-2xl px-4 py-3 flex items-center justify-between">

          {/* Room ID */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500">Room</span>
            <span className="font-mono bg-zinc-100 px-2 font-bold py-1 rounded-lg text-green-600">
              {roomId}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(roomId)}
              className="hover:opacity-70 transition"
            >
              <Copy size={14} />
            </button>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1 text-sm text-zinc-600">
            <Timer size={16} />
            <span>
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
          </div>

          {/* Destroy */}
          <button
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg
            bg-red-500 text-white hover:bg-red-600 transition"
          >
            <Trash2 size={14} />
            Destroy
          </button>
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div className="pt-28 pb-28 flex justify-center px-4">
        <div className="w-full max-w-2xl space-y-3">
          {messages?.messages.map((msg) => {
            const isMe = msg.sender === username;

            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 text-sm font-normal rounded-[22px]
                  ${isMe
                      ? "bg-[#34C759] text-white rounded-br-md"
                      : "bg-[#E5E5EA] text-black rounded-bl-md"
                    }`}
                >
                  {msg.text}

                  <div
                    className={`mt-1 text-[10px] text-right ${isMe ? "text-white/70" : "text-black/50"
                      }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* CHAT INPUT */}
      <div className="fixed bottom-6 left-0 w-full flex justify-center px-4 ">
        <div className="bg-white w-full max-w-2xl backdrop-blur-xl border border-zinc-300/70 rounded-full pr-1 pl-5 py-1 flex items-center gap-3">

          <input
            ref={inputRef}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) {
                sendMessage({ text: input });
              }
            }}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 bg-transparent outline-none text-sm text-zinc-900 placeholder-zinc-400"
          />

          <button
            onClick={() => sendMessage({ text: input })}
            disabled={!input.trim() || isPending}
            className="w-10 h-10 flex items-center justify-center rounded-full 
            bg-[#34C759] text-white disabled:bg-zinc-300/70 cursor-pointer
            hover:scale-105 active:scale-95 transition"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
