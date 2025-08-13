'use client'
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const AppHeader: React.FC = () => {
  const pathname = usePathname();
  return (
    <header className="w-full bg-white shadow-md py-4 px-6">
      <nav>
        <ul className="flex space-x-6">
          <li>
            <Link href="/">
              <span
                className={
                  `hover:text-blue-600 transition-colors cursor-pointer ` +
                  (pathname === "/" ? "text-blue-600 font-semibold border-b-2 border-blue-600" : "")
                }
              >
                Home
              </span>
            </Link>
          </li>
          <li>
            <Link href="/resume">
              <span
                className={
                  `hover:text-blue-600 transition-colors cursor-pointer ` +
                  (pathname === "/resume" ? "text-blue-600 font-semibold border-b-2 border-blue-600" : "")
                }
              >
                Resume
              </span>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default AppHeader;
