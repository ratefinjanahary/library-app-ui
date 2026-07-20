"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Category } from "@/lib/types";
import { booksService } from "@/lib/services/books.service";
import { categoriesService } from "@/lib/services/categories.service";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookSchema, BookFormValues } from "@/lib/validators";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  BookOpen, 
  Tag,
  MoreHorizontal,
  Library,
  PenSquare,
  AlertTriangle,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ViewMode = "list" | "form";

// Animation simplifiée avec les bons types
const fadeSlide = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring" as const,
      stiffness: 300,
      damping: 25
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { 
      type: "spring" as const,
      stiffness: 300,
      damping: 25
    }
  }
};

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  
  // État pour la modale de confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      categoryId: 0,
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [booksData, categoriesData] = await Promise.all([
        booksService.getAll(),
        categoriesService.getAll()
      ]);
      
      setBooks(Array.isArray(booksData) ? booksData : (booksData as any).data || []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : (categoriesData as any).data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Erreur lors du chargement des données");
      setBooks([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreate = () => {
    setEditingBookId(null);
    form.reset({ 
      title: "", 
      author: "", 
      isbn: "", 
      categoryId: categories[0]?.id ? Number(categories[0].id) : 0 
    });
    setViewMode("form");
  };

  const handleOpenEdit = async (id: string) => {
    try {
      const bookData = await booksService.getById(id);
      setEditingBookId(id);
      form.reset({
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn,
        categoryId: Number(bookData.categoryId),
      });
      setViewMode("form");
    } catch (error) {
      toast.error("Erreur lors du chargement du livre");
    }
  };

  const handleBackToList = () => {
    setViewMode("list");
    setEditingBookId(null);
    form.reset();
  };

  // Ouvrir la modale de confirmation de suppression
  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book);
    setDeleteDialogOpen(true);
  };

  // Supprimer effectivement le livre
  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;
    
    try {
      await booksService.delete(bookToDelete.id);
      toast.success(`"${bookToDelete.title}" a été supprimé`);
      setDeleteDialogOpen(false);
      setBookToDelete(null);
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const onSubmit = async (data: BookFormValues) => {
    try {
      if (editingBookId) {
        await booksService.update(editingBookId, data);
        toast.success("Livre mis à jour");
      } else {
        await booksService.create(data);
        toast.success("Livre ajouté");
      }
      setViewMode("list");
      setEditingBookId(null);
      form.reset();
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  // Rendu du formulaire
  const renderForm = () => (
    <motion.div
      key="form"
      initial={fadeSlide.initial}
      animate={fadeSlide.animate}
      exit={fadeSlide.exit}
      className="max-w-2xl mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editingBookId ? (
              <>
                <PenSquare className="h-5 w-5" />
                Modifier le livre
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Ajouter un nouveau livre
              </>
            )}
          </CardTitle>
          <CardDescription>
            {editingBookId 
              ? "Modifiez les informations du livre et cliquez sur mettre à jour." 
              : "Remplissez tous les champs pour ajouter un livre au catalogue."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Titre du livre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Auteur *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de l'auteur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isbn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ISBN *</FormLabel>
                    <FormControl>
                      <Input placeholder="ISBN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <FormControl>
                      <select 
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map((category) => (
                          <option key={category.id} value={Number(category.id)}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingBookId ? "Mettre à jour" : "Créer le livre"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBackToList}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Rendu de la liste des livres
  const renderBookList = () => {
    if (loading) {
      return (
        <motion.div
          key="loading"
          initial={fadeSlide.initial}
          animate={fadeSlide.animate}
          exit={fadeSlide.exit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Skeleton className="h-9 w-9" />
              </CardFooter>
            </Card>
          ))}
        </motion.div>
      );
    }

    if (books.length === 0) {
      return (
        <motion.div
          key="empty"
          initial={fadeSlide.initial}
          animate={fadeSlide.animate}
          exit={fadeSlide.exit}
        >
          <Card>
            <CardContent className="h-48 flex flex-col items-center justify-center gap-4">
              <p className="text-muted-foreground">Aucun livre trouvé.</p>
              <Button onClick={handleOpenCreate} variant="outline">
                <Plus size={20} className="mr-2" />
                Ajouter votre premier livre
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      );
    }

    return (
      <motion.div
        key="list"
        initial={fadeSlide.initial}
        animate={fadeSlide.animate}
        exit={fadeSlide.exit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {books.map((book) => (
          <Card key={book.id} className="flex flex-col h-full">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="flex-1">
                <CardTitle className="text-lg line-clamp-1">{book.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <User className="h-3.5 w-3.5" />
                  {book.author}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleOpenEdit(book.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Modifier</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleDeleteClick(book)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Supprimer</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>ISBN: {book.isbn}</span>
              </div>
              {book.categoryId && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Tag className="h-4 w-4" />
                  <span>Catégorie: {
                    categories.find(c => Number(c.id) === book.categoryId)?.name || book.categoryId
                  }</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec navigation */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Livres</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {viewMode === "list" 
              ? "Ajoutez, modifiez ou supprimez des livres du catalogue."
              : editingBookId 
                ? "Modifiez les informations du livre sélectionné."
                : "Remplissez les informations pour ajouter un nouveau livre."}
          </p>
        </div>
      </div>

      {/* Tabs Shadcn avec hauteur augmentée */}
      <Tabs value={viewMode} onValueChange={(value) => {
        if (value === "list") { 
          handleBackToList(); 
        } else if (value === "form" && viewMode === "list") { 
          handleOpenCreate(); 
        }
      }} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-14">
          <TabsTrigger 
            value="list" 
            className="flex items-center gap-2 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Library className="h-5 w-5" />
            Liste des livres
            <span className="ml-1 text-xs text-muted-foreground">
              ({books.length})
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="form" 
            className="flex items-center gap-2 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            {editingBookId ? (
              <>
                <PenSquare className="h-5 w-5" />
                Modification
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Nouveau
              </>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Contenu avec animation */}
      <AnimatePresence mode="wait">
        {viewMode === "list" ? renderBookList() : renderForm()}
      </AnimatePresence>

      {/* Modale de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce livre ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          
          {bookToDelete && (
            <div className="bg-gray-400/7 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">{bookToDelete.title}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {bookToDelete.author}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  ISBN: {bookToDelete.isbn}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              size="lg"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1 sm:flex-none mr-2"
            >
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            <Button
              size="lg"
              variant="destructive"
              onClick={handleConfirmDelete}
              className="flex-1 sm:flex-none"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}