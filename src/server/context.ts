import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export type Context = {
  session: Awaited<ReturnType<typeof getSession>> | null;
  db: typeof prisma;
  headers: Headers;
};

export async function createContext(opts?: { headers?: Headers }): Promise<Context> {
  const session = await getSession();
  
  return {
    session,
    db: prisma,
    headers: opts?.headers || new Headers(),
  };
}
