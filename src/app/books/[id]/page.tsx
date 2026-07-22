"use client";

import { useEffect, useState, use } from "react";
import { Book, Inventory } from "@/lib/types";
import { booksService } from "@/lib/services/books.service";
import { api } from "@/lib/api";
import { useCartStore, useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { BookOpen, Hash, Tag, ShoppingCart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    async function fetchBookData() {
      try {
        const [bookData, invRes] = await Promise.all([
          booksService.getById(Number(unwrappedParams.id)),
          api.get(`/inventory?bookId=${unwrappedParams.id}`)
        ]);
        setBook(bookData);
        
        // Filter inventories for this book specifically, if the API doesn't fully support ?bookId filter
        const relatedInventories = Array.isArray(invRes.data) 
          ? invRes.data.filter((i: any) => i.bookId === unwrappedParams.id)
          : [];
        setInventories(relatedInventories);
      } catch (error) {
        toast.error("Erreur lors de la récupération du livre");
        router.push("/books");
      } finally {
        setLoading(false);
      }
    }
    fetchBookData();
  }, [unwrappedParams.id, router]);

  const handleBorrow = async (inventory: Inventory) => {
    if (!isAuthenticated) {
      toast.info("Vous devez être connecté pour emprunter.");
      router.push("/login");
      return;
    }

    try {
      await api.post("/borrowings/borrow", { inventoryId: inventory.id });
      toast.success(`Le livre "${book?.title}" a été emprunté avec succès !`);
      router.push("/dashboard");
    } catch (error) {
      toast.error("Impossible d'emprunter ce livre. Vérifiez qu'il est disponible.");
    }
  };

  const availableInventory = inventories.find(inv => inv.quantity > 0);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" className="mb-6 w-fit" disabled>
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour au catalogue
        </Button>
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-full md:w-1/3 aspect-2/3 rounded-lg" />
          <div className="w-full md:w-2/3 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full mt-8" />
            <Skeleton className="h-12 w-40 mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" render={<Link href="/books" />} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour au catalogue
      </Button>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Pseudo-Cover */}
        <div className="w-full md:w-1/3 aspect-2/3 bg-muted rounded-lg flex items-center justify-center border shadow-sm">
          <BookOpen className="w-24 h-24 text-muted-foreground/30" />
        </div>

        <div className="w-full md:w-2/3 flex flex-col">
          <div className="mb-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit bg-secondary text-secondary-foreground">
            {book.category?.name || "Général"}
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight mt-2">{book.title}</h1>
          <p className="text-xl text-muted-foreground mt-2 font-medium">{book.author}</p>

          <div className="grid grid-cols-2 gap-4 mt-8 py-6 border-y">
            <div className="flex items-center gap-2 text-sm">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">ISBN:</span>
              <span>{book.isbn}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Catégorie ID:</span>
              <span className="truncate">{book.categoryId}</span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between p-6 bg-muted/50 rounded-lg border">
            <div>
              <p className="font-semibold text-lg">Disponibilité</p>
              {availableInventory ? (
                <p className="text-sm text-green-600 mt-1">
                  En stock ({availableInventory.quantity} disponible)
                </p>
              ) : (
                <p className="text-sm text-destructive mt-1">
                  Actuellement indisponible
                </p>
              )}
            </div>

            {availableInventory ? (
              <Button size="lg" onClick={() => handleBorrow(availableInventory)}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Emprunter
              </Button>
            ) : (
              <Button size="lg" disabled variant="secondary">
                Indisponible
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
