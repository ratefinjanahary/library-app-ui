// app/(dashboard)/admin/users/page.tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { User, usersService, PaginatedUsersResponse } from "@/lib/services/users.service";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Users,
  UserCircle,
  Mail,
  Shield,
  Calendar,
  MoreVertical,
  Loader2,
  Search,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useDebounce } from "@/lib/hooks/useDebounce";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
  });
  
  // États pour la recherche et les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      
      if (roleFilter !== "all") {
        params.role = roleFilter;
      }
      
      const response: PaginatedUsersResponse = await usersService.getUsers(params);
      console.log("Users data:", response);
      setUsers(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages,
      }));
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la récupération des utilisateurs");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await usersService.updateUserRole(userId, newRole);
      toast.success("Le rôle de l'utilisateur a été mis à jour");
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole as "USER" | "ADMIN" } : user
        )
      );
    } catch (error) {
      console.error("Erreur update:", error);
      toast.error("Erreur lors de la mise à jour du rôle");
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName || !lastName) return "??";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Mise à jour de la fonction pour utiliser les nouveaux variants
  const getRoleBadgeVariant = (role: string) => {
    switch(role) {
      case "ADMIN":
        return "admin";
      case "MEMBER":
        return "user";
      default:
        return "secondary";
    }
  };

  const getRoleLabel = (role: string) => {
    return role === "ADMIN" ? "Administrateur" : "Utilisateur";
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page }));
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [debouncedSearch, roleFilter]);

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">Chargement des utilisateurs...</p>
    </div>
  );

  // Pagination component
  const PaginationControls = () => {
    const { page, totalPages } = pagination;
    const items = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);
      if (page > 3) items.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(page + 1, totalPages - 1); i++) {
        items.push(i);
      }
      if (page < totalPages - 2) items.push('...');
      items.push(totalPages);
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(page - 1)}
              className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {items.map((item, index) => (
            <PaginationItem key={index}>
              {item === '...' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => handlePageChange(item as number)}
                  isActive={page === item}
                  className="cursor-pointer"
                >
                  {item}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => handlePageChange(page + 1)}
              className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
          <p className="text-muted-foreground">Gérez les utilisateurs et leurs rôles sur la plateforme.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 text-sm">
            <Users className="mr-2 h-4 w-4" />
            {pagination.total} utilisateurs
          </Badge>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select 
            value={roleFilter} 
            onValueChange={(value) => setRoleFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="ADMIN">Administrateurs</SelectItem>
              <SelectItem value="MEMBER">Utilisateurs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner />
          </CardContent>
        </Card>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Aucun utilisateur trouvé</p>
            <p className="text-sm text-muted-foreground">
              {searchTerm || roleFilter !== "all" 
                ? "Aucun utilisateur ne correspond à vos critères de recherche." 
                : "Il n'y a pas encore d'utilisateurs enregistrés sur la plateforme."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader className="space-y-3">
                  {/* Header with avatar and role */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base leading-tight">
                          {user.firstName} {user.lastName}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Voir le profil</DropdownMenuItem>
                        <DropdownMenuItem>Envoyer un email</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* User details */}
                  <div className="space-y-2 pt-1 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.createdAt && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Inscrit le {new Date(user.createdAt).toLocaleDateString("fr-FR")}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardFooter>
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">Changer le rôle</span>
                    <Select
                      value={user.role}
                      onValueChange={(value: string) => handleRoleChange(user.id, value)}
                    >
                      <SelectTrigger className="w-[130px] rounded-md">
                        <SelectValue placeholder="Rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER">Utilisateur</SelectItem>
                        <SelectItem value="ADMIN">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <PaginationControls />
            </div>
          )}
        </>
      )}
    </div>
  );
}