'use client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { User } from "next-auth";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";

type Props = {
  user: User
}

export default function AccountHeaderDropdown({ user }: Props) {
  // Helper to get initials from user's name or email
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts: string[] = name.split(' ');
      if (!parts) {
        return "US"; // Default initials if name is not provided
      }
      return parts.length > 1
        ? (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")
        : (parts[0]?.[0] ?? "");
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "US";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-0 rounded-full flex items-center gap-2">
          <Avatar>
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
            <AvatarFallback>{getInitials(user?.name ?? '', user?.email ?? '')}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start ml-2">
            <span className="text-sm font-medium">{user.name ?? user.email ?? "User"}</span>
            {user.email && (
              <span className="text-xs text-muted-foreground">{user.email}</span>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/api/auth/signout">
            Sign Out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}