"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Compass,
  Bookmark,
  LayoutDashboard,
  Book,
  Tags,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isAuthenticated) {
    return null;
  }

  const mainLinks = [
    { name: "Catalogue", href: "/books", icon: Compass },
    ...(isAuthenticated
      ? [{ name: "Mes Emprunts", href: "/dashboard", icon: Bookmark }]
      : []),
  ];

  const adminLinks = [
    { name: "Tableau de bord", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Livres", href: "/admin/books", icon: Book },
    { name: "Catégories", href: "/admin/categories", icon: Tags },
  ];

  return (
    <div className="w-72 border-r border-primary/10 h-screen flex flex-col justify-between shrink-0 select-none">
      <div className="flex flex-col gap-6 py-6">
        {/* En-tête avec Nom de l'app */}
        <div className="px-6">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="text-primary" size={23} />
            <span className="font-bold text-xl text-primary">Libib</span>
          </Link>
        </div>

        {/* Navigation Administration (si Admin) */}
        {isAdmin && (
          <div className="px-4">
            <div className="text-xs font-medium uppercase mb-2">
              Administration
            </div>
            <nav className="flex flex-col gap-1">
              {adminLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary/7 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Navigation principale */}
        <div className="px-4">
          <div className="text-xs font-medium uppercase mb-2">
            Navigation
          </div>
          <nav className="flex flex-col gap-1">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/7 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bas du Sidebar (Utilisateur & Thème) */}
      <div className="p-4 flex flex-col gap-4 bg-muted/20">
        {isAuthenticated ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col min-w-0">
                <span className="text-xs">Connecté en tant que</span>
                <span className="text-sm font-semibold truncate text-foreground">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <ModeToggle />
            </div>
            <Button
              variant="destructive"
              size="lg"
              onClick={logout}
              className="w-full h-10 flex items-center justify-center gap-2 bg-destructive/7"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Thème</span>
              <ModeToggle />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                render={<Link href="/login" />}
              >
                <LogIn className="h-4 w-4" />
                Connexion
              </Button>
              <Button
                size="sm"
                className="w-full justify-start gap-2"
                render={<Link href="/register" />}
              >
                <UserPlus className="h-4 w-4" />
                S'inscrire
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
