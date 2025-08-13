import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist, DM_Sans } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import MainHeader from "~/components/ui/main-header";
import { auth } from "~/server/auth";
import AppHeader from "~/components/ui/app-header";
import { Toaster } from "~/components/ui/sonner";

export const metadata: Metadata = {
  title: "Awesome Rio's App",
  description: "CV reader and job application tracker",
  icons: [{ rel: "icon", url: "/favicon.png" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  return (
    <html lang="en" className={`${dmSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <div>
            <MainHeader />
            {session?.user && (
              <AppHeader />
            )}
            {children}
          </div>
        </TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  );
}
