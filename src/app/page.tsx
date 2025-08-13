
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
        <h1 className="text-3xl font-bold">Welcome to Next.js with tRPC!</h1>
        <p className="mt-4">
          {hello.greeting} You are logged in as{" "}
          <span className="font-semibold">{session?.user?.email}</span>.
        </p>
      </main>
    </HydrateClient>
  );
}
