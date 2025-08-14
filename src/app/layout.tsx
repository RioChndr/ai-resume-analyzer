import "~/styles/globals.css";

import { type Metadata } from "next";
import { DM_Sans } from "next/font/google";

import AppHeader from "~/components/ui/app-header";
import MainHeader from "~/components/ui/main-header";
import { Toaster } from "~/components/ui/sonner";
import { auth } from "~/server/auth";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Awesome Rio's App",
  description: "CV reader and job application tracker",
  icons: [{ rel: "icon", url: "/favicon.png" }],
};

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
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
