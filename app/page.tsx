"use client";

import dynamic from "next/dynamic";

const ChelseaMap = dynamic(() => import("@/components/ChelseaMap"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="flex-1">
      <ChelseaMap />
    </main>
  );
}
