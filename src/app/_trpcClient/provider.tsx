"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import React, { useState } from "react";

import { trpc } from "./client";

function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") return "";
    if (process.env.NEXT_PUBLIC_APP_URL)
      return `${process.env.NEXT_PUBLIC_APP_URL}`;
    return "http://localhost:3000";
  })();
  return `${base}/api/trpc`;
}

export default function ProviderTRPC({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes (dulu namanya cacheTime)
            refetchOnWindowFocus: false, // Optional: disable refetch on window focus
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: getUrl(),
          headers() {
            return {
              // Add any headers here
            };
          },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
