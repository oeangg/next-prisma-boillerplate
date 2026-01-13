"use client";

import { Loader2 } from "lucide-react";
import { trpc } from "./_trpcClient/client";

export default function Home() {
  const { data: users, isLoading } = trpc.users.getUsers.useQuery();

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-sans sm:p-20">
      <h1>Test Users </h1>

      {isLoading && (
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="animate-pulse" />
          <p>Memuat datas</p>
        </div>
      )}
      <ol>
        {users?.map((user) => (
          <li key={user.id}>
            {user.name} / {user.email}
          </li>
        ))}
      </ol>
    </div>
  );
}
