"use client";

import { useEffect, useState } from "react";
import { Category } from "@/lib/types";
import { categoriesService } from "@/lib/services/categories.service";
import { toast } from "sonner";
import { Plus, Edit, Trash2, MoreHorizontal, Tag, BookOpen } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, CategoryFormValues } from "@/lib/validators";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Formulaire pour l'ajout
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  // Formulaire pour l'édition
  const editForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await categoriesService.getAll();
      setCategories(Array.isArray(data) ? data : (data as any).data || []);
    } catch (error) {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    form.reset({ name: "" });
    setIsAddDropdownOpen(true);
  };

  const handleOpenEdit = async (id: string) => {
    try {
      const category = await categoriesService.getById(id);
      setEditingId(id);
      editForm.reset({ name: category.name });
      setIsEditDialogOpen(true);
    } catch (error) {
      toast.error("Erreur lors du chargement de la catégorie");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette catégorie ?")) return;
    try {
      await categoriesService.delete(id);
      toast.success("Catégorie supprimée");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      await categoriesService.create(data);
      toast.success("Catégorie ajoutée");
      setIsAddDropdownOpen(false);
      form.reset();
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const onEditSubmit = async (data: CategoryFormValues) => {
    try {
      if (editingId) {
        await categoriesService.update(editingId, data);
        toast.success("Catégorie mise à jour");
        setIsEditDialogOpen(false);
        editForm.reset();
        setEditingId(null);
        fetchData();
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Catégories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les catégories de livres de la bibliothèque.
          </p>
        </div>
        <DropdownMenu open={isAddDropdownOpen} onOpenChange={setIsAddDropdownOpen}>
          <DropdownMenuTrigger>
            <Button className="h-11 px-4" onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" /> Nouvelle Catégorie
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la catégorie</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Science-Fiction"
                          {...field}
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsAddDropdownOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1">
                    Ajouter
                  </Button>
                </div>
              </form>
            </Form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Grille de cartes responsive */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full" />
              </CardContent>
              <CardFooter className="justify-end">
                <Skeleton className="h-9 w-9" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="h-24 flex items-center justify-center">
            <p className="text-muted-foreground">Aucune catégorie trouvée.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="flex flex-col h-full transition-colors hover:bg-muted/50"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Catégorie</span>
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEdit(category.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Modifier</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(category.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Supprimer</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span>ID: {category.id}</span>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground w-full justify-between">
                  <span>Nombre de livres</span>
                  <Badge variant="secondary">
                    {(category as any)._count?.books || 0}
                  </Badge>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog pour la modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la catégorie</DialogTitle>
            <DialogDescription>
              Modifiez le nom de la catégorie.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Science-Fiction" {...field} autoFocus />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">Mettre à jour</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}