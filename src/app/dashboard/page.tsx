"use client";

import { useEffect, useState } from "react";
import { Borrowing } from "@/lib/types";
import { borrowingsService } from "@/lib/services/borrowings.service";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { BookMarked, Calendar, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function MemberDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    fetchBorrowings();
  }, [isAuthenticated, router]);

  async function fetchBorrowings() {
    try {
      // Note: On adapte borrowingsService.getHistory ou getAll selon ce qui est exposé, mais ici le endpoint était "/borrowings/my".
      // borrowingsService.getHistory correspond à l'historique de l'utilisateur ou on peut faire un appel typé direct
      const data = await borrowingsService.getHistory();
      setBorrowings(data);
    } catch (error) {
      toast.error("Erreur lors de la récupération de vos emprunts.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReturn(borrowingId: number) {
  try {
    await borrowingsService.returnBook(borrowingId);
    toast.success("Livre retourné avec succès !");
    await fetchBorrowings(); // Rafraîchir la liste après le retour
  } catch (error: any) {
    console.error('Erreur lors du retour:', error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Erreur lors du retour du livre.");
    }
  }
}

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BORROWED": return "text-primary bg-primary/7 py-1.5";
      case "RETURNED": return "text-green-500 bg-green-500/7 py-1.5";
      case "OVERDUE": return "text-destructive bg-destructive/7 py-1.5";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "BORROWED": return "En cours";
      case "RETURNED": return "Retourné";
      case "OVERDUE": return "En retard";
      default: return status;
    }
  };

  const formatSafeDate = (dateString: string | null | undefined, formatStr: string) => {
    if (!dateString) return "Date inconnue";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";
    return format(date, formatStr, { locale: fr });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Mon Tableau de Bord</h1>
        <span>Bienvenue, {user?.firstName}. Voici vos emprunts récents.</span>
      </div>

      <div className="space-y-6">
        <h2 className="text-md text-gray-600/75 font-semibold flex items-center gap-2">
          <BookMarked size={18} />
          Mes Emprunts
        </h2>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : borrowings.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {borrowings.map((borrowing) => (
              <Card key={borrowing.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getStatusColor(borrowing.status)}`}>
                      {getStatusLabel(borrowing.status)}
                    </span>
                  </div>
                  <CardTitle>
                    {borrowing.inventory?.book?.title || "Livre inconnu"}
                  </CardTitle>
                  <CardDescription>
                    {borrowing.inventory?.book?.author || "Auteur inconnu"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grow space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Emprunté le : {formatSafeDate(borrowing.borrowDate, "dd MMM yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className={(borrowing.dueDate && new Date(borrowing.dueDate) < new Date() && borrowing.status !== 'RETURNED') ? 'text-destructive font-medium' : ''}>
                      À rendre le : {formatSafeDate(borrowing.dueDate, "dd MMM yyyy")}
                    </span>
                  </div>
                  {borrowing.returnDate && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Retourné le : {formatSafeDate(borrowing.returnDate, "dd MMM yyyy")}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-3">
                  {borrowing.status !== "RETURNED" && (
                    <Button className="h-10 bg-primary/5 text-primary hover:text-white px-5" onClick={() => handleReturn(borrowing.id)}>
                      Retourner le livre
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <BookMarked className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">Aucun emprunt</h3>
            <p className="text-muted-foreground mt-1">Vous n'avez pas encore emprunté de livres.</p>
            <Button size="lg" variant="primarySoft" render={<a href="/books" />} className="mt-4">Explorer le catalogue</Button>
          </div>
        )}
      </div>
    </div>
  );
}
