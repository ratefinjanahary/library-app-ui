"use client";

import Link from "next/link";
import { BookOpen, LogOut, User as UserIcon } from "lucide-react";
import { useAuthStore, useCartStore } from "@/lib/store";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";

export function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold inline-block text-xl">Libib</span>
          </Link>

          <nav className="hidden md:flex gap-6">
            <Link
              href="/books"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Catalogue
            </Link>
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Mes Emprunts
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Administration
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                Bonjour, {user?.firstName}
              </span>
              <Button variant="outline" size="icon" onClick={logout} title="Déconnexion">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" render={<Link href="/login" />}>Connexion</Button>
              <Button render={<Link href="/register" />}>S&apos;inscrire</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
