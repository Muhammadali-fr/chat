'use client';

import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useUsername } from "@/hooks/use-username";
import ButtonLoader from "@/components/loaders/ButtonLoader";
import { Users, AlertTriangle, ArrowRight } from "lucide-react";
import { Suspense, useState } from "react";
import Link from "next/link";

const Page = () => {
  return <Suspense>
    <Lobby />
  </Suspense>
}

export default Page;


function Lobby() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL states
  const RoomNotFound = searchParams.get("error") === "room-not-found";
  const RoomIsFull = searchParams.get("error") === "room-is-full";
  const DestroyedRoom = searchParams.get("destroyed") === "true";

  const showStatus = RoomNotFound || RoomIsFull || DestroyedRoom;

  const { username } = useUsername();

  // Local states
  const [roomId, setRoomId] = useState("");
  const [showJoin, setShowJoin] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Create room mutation
  const { mutate: createRoom, isPending } = useMutation({
    mutationFn: async () => {
      return await client.room.create.post();
    },
    onSuccess: (res) => {
      router.push(`/room/${res.data?.roomId}`);
    },
  });

  // Join room handler
  const handleJoinRoom = () => {
    if (!roomId.trim()) return;
    setIsJoining(true);
    router.push(`/room/${roomId.trim()}`);
  };

  // Back from warning
  const handleBackToHome = () => {
    router.replace("/");
  };

  return (
    <div className="w-full min-h-screen flex flex-col gap-6 items-center justify-center bg-gray-100 px-4">
      {/* Header */}
      <div className="text-center">
        <p className="text-3xl font-bold">
          <span className="text-[#34C759]">{">"}</span> Private Chat
        </p>
        <p className="text-sm text-gray-500">
          A private, self-destructing chat room.
        </p>
      </div>

      {/* WARNING / STATUS CARD */}
      {showStatus && (
        <div className="w-full max-w-sm bg-white rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              {RoomIsFull ? (
                <Users className="w-5 h-5 text-gray-700" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-gray-700" />
              )}
            </div>

            <div>
              <p className="font-semibold text-lg">
                {RoomIsFull && "Room is Full"}
                {RoomNotFound && "Room Not Found"}
                {DestroyedRoom && "Room Closed"}
              </p>
              <p className="text-sm text-gray-500">
                {RoomIsFull &&
                  "This room has reached the maximum number of participants."}
                {RoomNotFound &&
                  "The room you are trying to join does not exist."}
                {DestroyedRoom &&
                  "This room was destroyed after the chat ended."}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={handleBackToHome}
              className="flex-1 h-11 rounded-xl bg-gray-100 font-medium hover:bg-gray-50 transition"
            >
              Back
            </button>

            <button
              onClick={() => createRoom()}
              disabled={isPending}
              className="flex-1 h-11 rounded-xl bg-[#34C759] text-white font-medium hover:bg-[#45d769] transition disabled:bg-zinc-300 flex items-center justify-center"
            >
              {isPending ? <ButtonLoader /> : "Create New Room"}
            </button>
          </div>
        </div>
      )}

      {/* MAIN CARD */}
      {!showStatus && (
        <div className="w-full max-w-sm bg-white rounded-2xl p-6 flex flex-col gap-4">
          {/* Identity */}
          <label className="flex flex-col gap-2">
            <p className="font-medium">Your Identity</p>
            <input
              readOnly
              value={username}
              type="text"
              className="bg-gray-100 rounded-2xl px-5 h-12 outline-none"
            />
          </label>

          {/* JOIN ROOM (TOGGLE) */}
          {showJoin && (
            <div className="flex flex-col gap-2">
              <p className="font-medium">Join Existing Room</p>
              <div className="flex gap-2">
                <input
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleJoinRoom();
                  }}
                  type="text"
                  placeholder="Enter Room ID"
                  className="flex-1 bg-gray-100 rounded-2xl px-5 h-12 outline-none"
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={isJoining}
                  className="w-12 h-12 rounded-2xl bg-[#34C759] text-white flex items-center justify-center hover:bg-gray-800 transition disabled:bg-gray-400"
                >
                  {isJoining ? <ButtonLoader /> : <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* CREATE ROOM */}
          <button
            disabled={isPending || showJoin}
            onClick={() => createRoom()}
            className="w-full h-12 bg-[#34C759] text-white rounded-2xl font-semibold hover:bg-[#45d769] transition disabled:bg-zinc-300 flex items-center justify-center"
          >
            {isPending ? <ButtonLoader /> : "CREATE SECURE ROOM"}
          </button>

          {/* TOGGLE LINK */}
          <button
            onClick={() => setShowJoin((prev) => !prev)}
            className="text-sm text-gray-500 hover:text-black transition text-center"
          >
            {showJoin ? "Cancel" : "Join an existing room"}
          </button>
        </div>
      )}

      <div className="text-sm absolute bottom-5">Created by <Link className="text-blue-600 underline" target="_blank" href={"https://github.com/Muhammadali-fr"}>Muhammadali</Link>.</div>
    </div>
  );
}
