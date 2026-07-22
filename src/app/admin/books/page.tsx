"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Category } from "@/lib/types";
import { booksService, BookQueryParams, PaginatedResponse } from "@/lib/services/books.service";
import { categoriesService } from "@/lib/services/categories.service";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookSchema, BookFormValues } from "@/lib/validators";
import { useDebounce } from "@/lib/hooks/useDebounce";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ViewMode = "list" | "form";

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
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const itemsPerPage = 9;
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

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

  // Fonction unifiée pour charger les données
  const loadBooks = useCallback(async (page: number = 1) => {
    try {
      setIsSearching(true);
      setLoading(true);
      
      const params: BookQueryParams = {
        page: page,
        limit: itemsPerPage,
      };

      if (debouncedSearchTerm.trim()) {
        params.search = debouncedSearchTerm.trim();
      }

      if (selectedCategory !== null) {
        params.categoryId = selectedCategory;
      }

      const response: PaginatedResponse<Book> = await booksService.getAll(params);
      
      setBooks(Array.isArray(response.data) ? response.data : []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.total || 0);
      setCurrentPage(page);
      
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Erreur lors du chargement des livres");
      setBooks([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [debouncedSearchTerm, selectedCategory, itemsPerPage]);

  // Chargement des catégories
  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await categoriesService.getAll();
      setCategories(Array.isArray(categoriesData) ? categoriesData : (categoriesData as any).data || []);
    } catch (error) {
      console.error("Categories fetch error:", error);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadBooks(1), fetchCategories()]);
    };
    init();
  }, []);

  // Gestion des filtres (recherche + catégorie)
  useEffect(() => {
    // Reset à la page 1 et recharger
    loadBooks(1);
  }, [debouncedSearchTerm, selectedCategory, loadBooks]); // ✅ loadBooks est stable

  // Gestion du changement de page UNIQUEMENT
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      loadBooks(page);
    }
  };

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
      const bookData = await booksService.getById(Number(id));
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

  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;
    
    try {
      await booksService.delete(bookToDelete.id);
      toast.success(`"${bookToDelete.title}" a été supprimé`);
      setDeleteDialogOpen(false);
      setBookToDelete(null);
      loadBooks(currentPage);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const onSubmit = async (data: BookFormValues) => {
    try {
      if (editingBookId) {
        await booksService.update(Number(editingBookId), data);
        toast.success("Livre mis à jour");
      } else {
        await booksService.create(data);
        toast.success("Livre ajouté");
      }
      setViewMode("list");
      setEditingBookId(null);
      form.reset();
      loadBooks(1);
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

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
                <PenSquare /> Modifier le livre
              </>
            ) : (
              <>
                <Plus /> Ajouter un nouveau livre
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
                        className="w-full px-3 py-4 border rounded-md bg-background"
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

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-background border rounded-lg mt-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} livres
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isSearching}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {pageNumbers.map(page => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="lg" className="min-w-[36px]"
              onClick={() => handlePageChange(page)}
              disabled={isSearching}
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline" size="lg"
            onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || isSearching}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderLoader = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Chargement des livres...</p>
    </div>
  );

  const renderBookList = () => {
    if (loading) {
      return renderLoader();
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
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== null
                  ? "Aucun livre ne correspond à vos critères de recherche." 
                  : "Aucun livre trouvé."}
              </p>
              {(searchTerm || selectedCategory !== null) && (
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory(null);
                  }} 
                  variant="outline"
                >
                  Réinitialiser les filtres
                </Button>
              )}
              {!searchTerm && selectedCategory === null && (
                <Button onClick={handleOpenCreate} variant="outline">
                  <Plus size={20} className="mr-2" />
                  Ajouter votre premier livre
                </Button>
              )}
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
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <DropdownMenuItem onClick={() => handleOpenEdit(String(book.id))}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Modifier</span>
                    </DropdownMenuItem>
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
        </div>
        {renderPagination()}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
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
              ({totalItems})
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

      {viewMode === "list" && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre, auteur ou ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={loading || isSearching}
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          
          <Select
            value={selectedCategory !== null ? String(selectedCategory) : "all"}
            onValueChange={(value) => {
              setSelectedCategory(value === null ? null : parseInt(value, 10));
            }}
            disabled={loading || isSearching}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <AnimatePresence mode="wait">
        {viewMode === "list" ? renderBookList() : renderForm()}
      </AnimatePresence>

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
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
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