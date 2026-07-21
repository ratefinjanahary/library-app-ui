"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { booksService } from '@/lib/services/books.service';
import { borrowingsService } from '@/lib/services/borrowings.service';
import { Book } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function BorrowPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await booksService.getAll();
        // Vérifier si response.data est un tableau, sinon l'ajuster
        setBooks(Array.isArray(response) ? response : response.data || []);
      } catch (error) {
        toast.error("Erreur lors du chargement des livres.");
        console.error("Failed to fetch books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handleCheckboxChange = (bookId: number, isChecked: boolean) => {
    if (isChecked) {
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

    if (selectedBookIds.length > 5) {
      toast.warning("Vous ne pouvez emprunter que 5 livres maximum.");
      return;
    }

    setBorrowing(true);
    try {
      // Envoyer tous les bookIds en une seule requête
      const result = await borrowingsService.borrow(selectedBookIds);
      toast.success(`${result.length} livre(s) emprunté(s) avec succès!`);
      setSelectedBookIds([]);
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'emprunt des livres.");
      console.error("Failed to borrow books:", error);
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Chargement des livres...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mx-3.5">
        <div className="mb-6">
          <h2 className="text-2xl font-medium">Emprunter des Livres</h2>
          <p className="text-sm text-gray-500">Sélectionnez jusqu'à 5 livres (maximum autorisé: {5 - selectedBookIds.length} restants)</p>
        </div>
        <CardContent>
          {books.length === 0 ? (
            <p>Aucun livre disponible pour l'emprunt.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {books.map((book) => (
                  <Card key={book.id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle>{book.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="grow">
                      <p>Auteur: {book.author}</p>
                      <p>ISBN: {book.isbn}</p>
                    </CardContent>
                    <div className="p-4 flex items-center justify-end">
                      <Checkbox
                        checked={selectedBookIds.includes(Number(book.id))}
                        onCheckedChange={(checked: boolean) =>
                          handleCheckboxChange(Number(book.id), checked)
                        }
                        id={`book-${book.id}`}
                        disabled={borrowing || (selectedBookIds.length >= 5 && !selectedBookIds.includes(Number(book.id)))}
                      />
                      <label
                        htmlFor={String(`book-${book.id}`)}
                        className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Sélectionner
                      </label>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-6 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {selectedBookIds.length} / 5 livres sélectionnés
                </span>
                <Button 
                  onClick={handleBorrowBooks} 
                  disabled={borrowing || selectedBookIds.length === 0} 
                  size="lg"
                >
                  {borrowing ? "Emprunt en cours..." : "Emprunter les livres sélectionnés"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </div>
    </div>
  );
};