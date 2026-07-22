"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Compass,
  BookMarked,
  Bookmark,
  LayoutDashboard,
  Book,
  Tags,
  LogOut,
  LogIn,
  UserPlus,
  Users,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Shield,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

export function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    main: true,
    admin: true,
  });
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isAuthenticated) {
    return null;
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const mainLinks = [
    { name: "Catalogue", href: "/books", icon: BookMarked },
    { name: "Mes Emprunts", href: "/dashboard", icon: Bookmark },
    { name: "Emprunter un livre", href: "/borrow", icon: Book },
  ];

  const adminLinks = [
    { name: "Tableau de bord", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Livres", href: "/admin/books", icon: Book },
    { name: "Catégories", href: "/admin/categories", icon: Tags },
    { name: "Utilisateurs", href: "/admin/users", icon: Users },
  ];

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };

  // Composant pour les liens de navigation
  const NavLink = ({ link, isActive, isChild = false }: { link: any; isActive: boolean; isChild?: boolean }) => (
    <Link
      href={link.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        isCollapsed && "justify-center px-2",
        isChild && !isCollapsed && "ml-4"
      )}
      title={isCollapsed ? link.name : undefined}
    >
      <link.icon className="h-4 w-4 shrink-0" />
      {!isCollapsed && link.name}
    </Link>
  );

  // Composant pour les sections avec sous-menus
  const NavSection = ({
    title,
    icon: Icon,
    links,
    sectionKey,
    isAdminSection = false,
  }: {
    title: string;
    icon?: any;
    links: any[];
    sectionKey: string;
    isAdminSection?: boolean;
  }) => {
    const isOpen = openSections[sectionKey];
    const isActive = links.some((link) => pathname === link.href);

    if (!isAdminSection && !isAuthenticated) return null;
    if (isAdminSection && !isAdmin) return null;

    if (isCollapsed) {
      return (
        <div className="px-2">
          <nav className="flex flex-col gap-1">
            {links.map((link) => {
              const isLinkActive = pathname === link.href;
              return <NavLink key={link.href} link={link} isActive={isLinkActive} isChild={false} />;
            })}
          </nav>
        </div>
      );
    }

    return (
      <Collapsible
        open={isOpen}
        onOpenChange={() => toggleSection(sectionKey)}
        className="w-full"
      >
        <div className="px-4">
          <CollapsibleTrigger>
            <button
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-muted",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                {Icon && <Icon className="h-4 w-4" />}
                <span className="uppercase text-xs font-semibold tracking-wider">
                  {title}
                </span>
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="px-4 pt-1">
          <nav className="flex flex-col gap-1">
            {links.map((link) => {
              const isLinkActive = pathname === link.href;
              return <NavLink key={link.href} link={link} isActive={isLinkActive} isChild={true} />;
            })}
          </nav>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <>
      <div
        className={cn(
          "border-r border-primary/10 h-screen flex flex-col justify-between shrink-0 select-none bg-background transition-all duration-300",
          isCollapsed ? "w-16" : "w-72"
        )}
      >
        <div className="flex flex-col gap-4 py-6 overflow-y-auto">
          {/* En-tête avec Nom de l'app et bouton de fermeture */}
          <div className={cn("flex items-center", isCollapsed ? "px-2" : "px-6")}>
            {!isCollapsed ? (
              <div className="flex items-center justify-between w-full">
                <Link href="/" className="flex items-center space-x-2">
                  <BookOpen className="text-primary" size={23} />
                  <span className="font-bold text-xl text-primary">Libib</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full gap-2">
                <Link href="/" className="flex items-center">
                  <BookOpen className="text-primary" size={23} />
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-8 w-8"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Navigation principale avec sous-menus */}
          <div className="flex flex-col gap-1">
            <NavSection
              title="Navigation"
              icon={Compass}
              links={mainLinks}
              sectionKey="main"
            />
          </div>

          {/* Administration avec sous-menus */}
          {isAdmin && (
            <div className="flex flex-col gap-1">
              <NavSection
                title="Administration"
                icon={Shield}
                links={adminLinks}
                sectionKey="admin"
                isAdminSection
              />
            </div>
          )}
        </div>

        {/* Bas du Sidebar (Utilisateur & Thème) */}
        <div
          className={cn(
            "p-4 flex flex-col gap-4",
            isCollapsed && "items-center"
          )}
        >
          {isAuthenticated ? (
            <div className={cn("flex flex-col gap-3", isCollapsed ? "items-center" : "w-full")}>
              <div className={cn("flex items-center", isCollapsed ? "flex-col gap-2" : "justify-between")}>
                {!isCollapsed ? (
                  <>
                    {/* Remplacer "Connecté en tant que" par une icône utilisateur */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold truncate text-foreground">
                          {user?.firstName} {user?.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {user?.email}
                        </span>
                      </div>
                    </div>
                    {/* Dropdown pour le thème avec indicateur visuel */}
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="outline" size="sm" className="gap-2">
                          <BookOpen className="h-4 w-4" />
                          Thème
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                          <div className="flex items-center justify-between w-full">
                            <span>Clair</span>
                            {theme === "light" && <Check className="h-4 w-4 ml-2" />}
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                          <div className="flex items-center justify-between w-full">
                            <span>Sombre</span>
                            {theme === "dark" && <Check className="h-4 w-4 ml-2" />}
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}>
                          <div className="flex items-center justify-between w-full">
                            <span>Système</span>
                            {theme === "system" && <Check className="h-4 w-4 ml-2" />}
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>
                    {/* Mode collapsed : avatar + thème */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <BookOpen className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem onClick={() => setTheme("light")}>
                            <div className="flex items-center justify-between w-full">
                              <span>Clair</span>
                              {theme === "light" && <Check className="h-4 w-4 ml-2" />}
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTheme("dark")}>
                            <div className="flex items-center justify-between w-full">
                              <span>Sombre</span>
                              {theme === "dark" && <Check className="h-4 w-4 ml-2" />}
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTheme("system")}>
                            <div className="flex items-center justify-between w-full">
                              <span>Système</span>
                              {theme === "system" && <Check className="h-4 w-4 ml-2" />}
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </>
                )}
              </div>
              <Button
                variant="destructive"
                size={isCollapsed ? "icon" : "lg"}
                onClick={() => setShowLogoutDialog(true)}
                className={cn(
                  "bg-destructive/7 hover:bg-destructive/15 text-destructive hover:text-destructive",
                  isCollapsed ? "h-10 w-10" : "w-full h-10"
                )}
                title={isCollapsed ? "Déconnexion" : undefined}
              >
                <LogOut className="h-4 w-4" />
                {!isCollapsed && "Déconnexion"}
              </Button>
            </div>
          ) : (
            <div className={cn("flex flex-col gap-3", isCollapsed ? "items-center" : "w-full")}>
              <div className={cn("flex items-center", isCollapsed ? "flex-col gap-2" : "justify-between")}>
                {!isCollapsed ? (
                  <>
                    <span className="text-xs text-muted-foreground">Thème</span>
                    <ModeToggle />
                  </>
                ) : (
                  <ModeToggle />
                )}
              </div>
              <div className={cn("flex flex-col gap-2", isCollapsed ? "items-center" : "w-full")}>
                <Button
                  variant="outline"
                  size={isCollapsed ? "icon" : "sm"}
                  className={cn(
                    "justify-start gap-2",
                    isCollapsed ? "h-10 w-10" : "w-full"
                  )}
                  title={isCollapsed ? "Connexion" : undefined}
                >
                  <Link href="/login">
                    <LogIn className="h-4 w-4" />
                    {!isCollapsed && "Connexion"}
                  </Link>
                </Button>
                <Button
                  size={isCollapsed ? "icon" : "sm"}
                  className={cn(
                    "justify-start gap-2",
                    isCollapsed ? "h-10 w-10" : "w-full"
                  )}
                  title={isCollapsed ? "S'inscrire" : undefined}
                >
                  <Link href="/register">
                    <UserPlus className="h-4 w-4" />
                    {!isCollapsed && "S'inscrire"}
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation de déconnexion */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la déconnexion</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à nouveau à votre compte.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              size="lg"
              variant="destructive"
              onClick={handleLogout}
              className="w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}