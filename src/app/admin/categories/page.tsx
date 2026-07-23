"use client";

import { useEffect, useState } from "react";
import { Category } from "@/lib/types";
import { categoriesService } from "@/lib/services/categories.service";
import { toast } from "sonner";
import { Plus, Edit, Trash2, MoreHorizontal, Tag, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, CategoryFormValues } from "@/lib/validators";
import { motion, AnimatePresence } from "framer-motion";

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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulaire unique pour l'ajout et la modification
  const form = useForm<CategoryFormValues>({
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

  const handleOpenAddForm = () => {
    form.reset({ name: "" });
    setEditingId(null);
    setShowForm(true);
  };

  const handleOpenEditForm = async (id: string) => {
    try {
      const category = await categoriesService.getById(id);
      setEditingId(id);
      form.reset({ name: category.name });
      setShowForm(true);
    } catch (error) {
      toast.error("Erreur lors du chargement de la catégorie");
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    form.reset({ name: "" });
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
      setIsSubmitting(true);
      if (editingId) {
        await categoriesService.update(editingId, data);
        toast.success("Catégorie mise à jour");
      } else {
        await categoriesService.create(data);
        toast.success("Catégorie ajoutée");
      }
      handleCancelForm();
      fetchData();
    } catch (error) {
      toast.error(editingId ? "Erreur lors de la mise à jour" : "Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
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
        {!showForm && (
          <Button size="lg" onClick={handleOpenAddForm}>
            <Plus size={19} /> Nouvelle Catégorie
          </Button>
        )}
      </div>

      {/* Formulaire inline avec animations */}
      <AnimatePresence mode="wait">
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex justify-center"
          >
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{editingId ? "Modifier la catégorie" : "Ajouter une catégorie"}</CardTitle>
                    <CardDescription>
                      {editingId
                        ? "Modifiez le nom de la catégorie."
                        : "Créez une nouvelle catégorie de livres."}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancelForm}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
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
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-3">
                      <Button
                        size="lg"
                        type="button"
                        variant="outline"
                        onClick={handleCancelForm}
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        Annuler
                      </Button>
                      <Button 
                        size="lg" 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-2"
                      >
                        {isSubmitting
                          ? "Enregistrement..."
                          : editingId
                          ? "Mettre à jour"
                          : "Ajouter"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grille de cartes avec animations */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Chargement des catégories...</p>
          </div>
        </div>
      ) : categories.length === 0 && !showForm ? (
        <Card>
          <CardContent className="h-24 flex items-center justify-center">
            <p className="text-muted-foreground">Aucune catégorie trouvée.</p>
          </CardContent>
        </Card>
      ) : (
        !showForm && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.1
                }
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {categories.map((category) => (
              <motion.div
                key={category.id}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.95 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { duration: 0.3, ease: "easeOut" }
                  }
                }}
                layout
              >
                <Card className="flex flex-col h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{category.name}</CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEditForm(String(category.id))}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Modifier</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(String(category.id))}
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
                  <CardFooter>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground w-full justify-between">
                      <span>Nombre de livres</span>
                      <Badge variant="secondary">
                        {(category as any)._count?.books || 0}
                      </Badge>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )
      )}
    </div>
  );
}