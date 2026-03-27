"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LibraryPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/materials");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-caption text-gray-muted">Redirecting to materials...</p>
    </div>
  );
}
