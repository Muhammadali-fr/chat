"use client"

import { useEffect, useState } from "react";
import { generateAnimalUsername } from "../components/Generateusername";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/client";

export default function Home() {
  const [username, setUsername] = useState("");
  const STORAGE_KEY = "username_key";

  useEffect(() => {
    const main = () => {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        setUsername(stored);
        return
      }

      const generated = generateAnimalUsername();
      localStorage.setItem(STORAGE_KEY, generated);
      setUsername(generated);
    };

    main();
  }, []);

  const {mutate: createRoom} = useMutation({
    mutationFn: async () => {
      const res = await client.room.create.post();
    }
  })


  return (
    <div className="w-full min-h-screen flex flex-col gap-5 items-center justify-center bg-gray-100">
      <div className="text-center">
        <p className="text-3xl font-bold">{">"}Private Chat</p>
        <p className="text-sm text-gray-500">A private, self-destructing chat room.</p>
      </div>
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <p className="font-medium">Your Identity</p>
          <input
            readOnly
            value={username}
            type="text"
            className="bg-gray-100 rounded-2xl px-5 h-12 outline-none focus:border-black transition"
            placeholder="Enter your name"
          />
        </label>

        <button onClick={() => createRoom()} className="w-full h-12 bg-black text-white rounded-2xl font-semibold hover:bg-gray-800 transition cursor-pointer">
          CREATE SECURE ROOM
        </button>
      </div>
    </div>
  );
}
