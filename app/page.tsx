'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { VapiWidgetHandle } from "@/components/VapiWidget";

const VapiWidget = dynamic(() => import("@/components/VapiWidget"), {
  ssr: false,
});

export default function Home() {
  const vapiRef = useRef<VapiWidgetHandle>(null);
  const [inCall, setInCall] = useState(false);

  const handleCallClick = () => {
    if (vapiRef.current) {
      setInCall(true);
      vapiRef.current.endCall();
      setTimeout(() => {
        vapiRef.current?.startCall();
      }, 200);
    }
  };

  const handleEndCall = () => {
    vapiRef.current?.endCall();
    setInCall(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-10">
      {/* Heading */}
      <h1 className="text-3xl md:text-4xl font-bold mb-10 text-white">
        🤖 AI Voice Bot
      </h1>

      {/* Side-by-side cards */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        {/* Assistant Card */}
        <Card className="bg-zinc-900 border border-zinc-700 flex-1 p-6 flex flex-col items-center rounded-2xl shadow-lg">
          <div className="relative">
            <Image
              src="/bot.jpg"
              alt="Assistant"
              width={100}
              height={100}
              className="rounded-full border-4 border-emerald-500"
            />
            {inCall && (
              <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-500 animate-pulse ring-2 ring-black" />
            )}
          </div>
          <div className="mt-4 font-semibold text-xl text-white">Ayush Kankane</div>
          <div className="text-sm text-gray-400">AI Assistant</div>
        </Card>

        {/* User Card */}
        <Card className="bg-zinc-900 border border-zinc-700 flex-1 p-6 flex flex-col items-center rounded-2xl shadow-lg">
          <Image
            src="/user.jpg"
            alt="User"
            width={100}
            height={100}
            className="rounded-full border-4 border-gray-600"
          />
          <div className="mt-4 font-semibold text-xl text-white">You</div>
          <div className="text-sm text-gray-400">Caller</div>
        </Card>
      </div>

      {/* Call Buttons */}
      <div className="flex gap-4 mb-10">
        <Button
          onClick={handleCallClick}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full text-base font-semibold shadow-lg transition-all duration-300"
        >
          Start Call
        </Button>

        {inCall && (
          <Button
            onClick={handleEndCall}
            className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-full text-base font-semibold shadow-lg transition-all duration-300"
          >
            End Call
          </Button>
        )}
      </div>

      {/* Vapi Widget */}
      <VapiWidget
        ref={vapiRef}
        apiKey={process.env.NEXT_PUBLIC_VAPI_API_KEY!}
        assistantId={process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!}
      />
    </div>
  );
}
