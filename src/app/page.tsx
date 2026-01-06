import prisma from "@/lib/prisma";

export default async function Home() {
  const users = await prisma.user.findMany();
  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-sans sm:p-20">
      <h1>Test Users </h1>
      <ol>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} / {user.email}
          </li>
        ))}
      </ol>
    </div>
  );
}
