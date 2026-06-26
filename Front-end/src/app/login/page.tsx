"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (!params.has("mode")) {
      params.set("mode", "login");
    }
    router.replace(`/register?${params.toString()}`);
  }, [router, searchParams]);

  return null;
}
