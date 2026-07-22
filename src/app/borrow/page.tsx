"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { booksService } from '@/lib/services/books.service';
import { borrowingsService } from '@/lib/services/borrowings.service';
import { Book } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Search, BookOpen, Loader2 } from 'lucide-react';

export default function BorrowPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const router = useRouter();
  const limit = 9;

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const response = await booksService.getAll({
          page: currentPage,
          limit: limit,
          search: search || undefined,
        });
        
        setBooks(Array.isArray(response.data) ? response.data : []);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.total || 0);
      } catch (error: any) {
        console.error("Failed to fetch books:", error);
        toast.error(error.response?.data?.message || "Erreur lors du chargement des livres.");
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchBooks, 500);
    return () => clearTimeout(timeoutId);
  }, [currentPage, search]);

  const handleCheckboxChange = (bookId: number, isChecked: boolean) => {
    if (isChecked) {
      if (selectedBookIds.length >= 5) {
        toast.warning("Vous ne pouvez sélectionner que 5 livres maximum.");
        return;
      }
      setSelectedBookIds((prev) => [...prev, bookId]);
    } else {
      setSelectedBookIds((prev) => prev.filter((id) => id !== bookId));
    }
  };

  const handleBorrowBooks = async () => {
    if (selectedBookIds.length === 0) {
      toast.warning("Veuillez sélectionner au moins un livre à emprunter.");
      return;
    }

    setBorrowing(true);
    try {
      const result = await borrowingsService.borrow(selectedBookIds);
      toast.success(`${result.length} livre(s) emprunté(s) avec succès!`);
      setSelectedBookIds([]);
      
      // Rafraîchir la liste
      setCurrentPage(1);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors de l'emprunt des livres.";
      toast.error(errorMessage);
      console.error("Failed to borrow books:", error);
    } finally {
      setBorrowing(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  if (loading && books.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Chargement des livres...</p>
          </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Emprunter des Livres</h1>
          <p className="text-gray-600">
            {totalItems} livre(s) disponible(s) - Maximum 5 livres par emprunt
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher par titre, auteur ou ISBN..."
              value={search}
              onChange={handleSearchChange}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {books.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              {search ? "Aucun livre ne correspond à votre recherche." : "Aucun livre disponible."}
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => {
                const isSelected = selectedBookIds.includes(Number(book.id));
                const isDisabled = borrowing || 
                  (!isSelected && selectedBookIds.length >= 5);

                return (
                  <Card key={book.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-2 flex-1">{book.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="grow">
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Auteur:</span> {book.author}</p>
                        <p><span className="font-medium">ISBN:</span> {book.isbn}</p>
                        {book.category && (
                          <p><span className="font-medium">Catégorie:</span> {book.category.name}</p>
                        )}
                        <div className="mt-3">
                          <Badge variant="success">
                            Disponible à l'emprunt
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {book.inventoryItems?.length || 0} exemplaire(s)
                      </span>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked: boolean) => {
                            handleCheckboxChange(Number(book.id), checked);
                          }}
                          id={`book-${book.id}`}
                          disabled={isDisabled}
                        />
                        <label
                          htmlFor={`book-${book.id}`}
                          className={`text-sm font-medium leading-none ${
                            isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                          }`}
                        >
                          {isSelected ? 'Sélectionné' : 'Sélectionner'}
                        </label>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Actions */}
            <Card className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 p-4 rounded-lg">
              <span className="text-sm text-gray-600">
                <span className="font-semibold">{selectedBookIds.length}</span> / 5 livres sélectionnés
              </span>
              <Button 
                onClick={handleBorrowBooks} 
                disabled={borrowing || selectedBookIds.length === 0}
                className="min-w-[200px]"
                size="lg"
              >
                {borrowing ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Emprunt en cours...
                  </>
                ) : (
                  `Emprunter ${selectedBookIds.length} livre${selectedBookIds.length > 1 ? 's' : ''}`
                )}
              </Button>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}