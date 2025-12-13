'use client'

import { Send } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function Page() {
    const params = useParams();
    const roomId = params.roomId;
    const [message, setMessage] = useState("");

    return (
        <div className="fixed bottom-6 left-0 w-full flex justify-center px-4">
            <div className="w-full max-w-2xl bg-gray-300 backdrop-blur-xl border border-zinc-200 rounded-full pr-2 pl-5 py-2 flex items-center gap-3">

                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a message..."
                    className="flex-1 bg-transparent outline-none text-sm text-zinc-900 placeholder-zinc-400"
                />

                <button
                    disabled={!message.trim()}
                    className="w-10 h-10 flex items-center justify-center rounded-full 
          bg-black text-white disabled:bg-zinc-400 
          hover:scale-105 active:scale-95 transition"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}
