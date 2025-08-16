'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-xl">SaaS Framework</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-1">
          <Link href="/">
            <Button 
              variant={pathname === "/" ? "default" : "ghost"}
              className="font-medium"
            >
              Search
            </Button>
          </Link>
          <Link href="/videos">
            <Button 
              variant={pathname === "/videos" ? "default" : "ghost"}
              className="font-medium"
            >
              Videos
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
