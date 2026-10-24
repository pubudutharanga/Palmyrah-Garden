"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: true,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster
        position="bottom-center"
        theme="light"
        toastOptions={{
          style: {
            background: "#14261F",
            color: "#F3F5F0",
            border: "1px solid rgba(243,245,240,0.16)",
            borderRadius: "14px",
            fontFamily: "var(--font-hanken), sans-serif",
          },
        }}
      />
    </QueryClientProvider>
  );
}
