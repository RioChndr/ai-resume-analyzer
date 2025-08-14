
import Link from "next/link";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="p-6">
        <h1 className="text-3xl font-bold">
          Welcome to our Application
        </h1>
        {session?.user && (
          <div>
            <p className="mt-4">
              {hello.greeting} You are logged in as{" "}
              <span className="font-semibold">{session?.user?.email}</span>.
            </p>
            <p className="mt-2 border border-primary p-4 rounded-lg">
              Setup your&nbsp;
              <Link href='/resume' className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent font-semibold">
                <span>resume Here</span>
              </Link>
            </p>
          </div>
        )}
        <p>
          Features:
        </p>
        <ul className="list-disc pl-6 mt-2">
          <li>Authentication with NextAuth</li>
          <li>tRPC for type-safe API calls</li>
          <li>Hydration for client-side data fetching</li>
          <li>Resume Management</li>
          <li>
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent font-semibold">
              Resume AI validation
            </span>
          </li>
        </ul>
      </main>
    </HydrateClient>
  );
}
