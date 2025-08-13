import { Button } from "@/components/ui/button";
import { SessionProvider } from 'next-auth/react';
import { FaCloud } from "react-icons/fa";
import { auth } from "~/server/auth";
import AccountHeaderDropdown from "./account-header-dropdown";

export default async function MainHeader() {

  const session = await auth();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <FaCloud className="text-blue-600 text-2xl" />
        <span className="font-bold text-lg text-gray-800">SaaS App</span>
      </div>
      {session?.user ? (
        <AccountHeaderDropdown user={session.user} />
      ) : (
        <SessionProvider session={session}>
          <Button asChild>
            <a href="/api/auth/signin">Sign In</a>
          </Button>
        </SessionProvider>
      )}
    </header>
  );
}