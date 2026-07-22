"use client";

import { useEffect, useState } from "react";
import { Borrowing } from "@/lib/types";
import { borrowingsService } from "@/lib/services/borrowings.service";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BookMarked, Calendar, Check, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

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
      setLoading(true);
      const data = await borrowingsService.getHistory();
      
      // Simuler un délai de 1000ms pour le spinner
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBorrowings(data);
    } catch (error) {
      console.error("Error fetching borrowings:", error);
      toast.error("Erreur lors de la récupération de vos emprunts.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReturn(borrowingId: number) { // Changé de string à number
    try {
      await borrowingsService.returnBook(borrowingId);
      toast.success("Livre retourné avec succès !");
      fetchBorrowings();
    } catch (error: any) {
      console.error("Error returning book:", error);
      toast.error(error.response?.data?.message || "Erreur lors du rendu du livre.");
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BORROWED": 
      case "ACTIVE": 
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "RETURNED": 
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "OVERDUE": 
        return "bg-destructive/10 text-destructive hover:bg-destructive/20";
      default: 
        return "bg-muted text-muted-foreground hover:bg-muted/80 border-muted-foreground/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "BORROWED":
      case "ACTIVE": 
        return "En cours";
      case "RETURNED": 
        return "Retourné";
      case "OVERDUE": 
        return "En retard";
      default: 
        return status;
    }
  };

  const isBookOverdue = (borrowing: Borrowing) => {
    if (!borrowing.dueDate) return false;
    const dueDate = new Date(borrowing.dueDate);
    const now = new Date();
    return dueDate < now && borrowing.status !== 'RETURNED';
  };

  const formatSafeDate = (dateString: string | null | undefined, formatStr: string) => {
    if (!dateString) return "Date inconnue";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date invalide";
      return format(date, formatStr, { locale: fr });
    } catch (error) {
      return "Date invalide";
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Mon Tableau de Bord</h1>
        <p className="text-gray-600 mt-1">
          Bienvenue, {user?.firstName || "Membre"}. Voici vos emprunts récents.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BookMarked size={20} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-700">Mes Emprunts</h2>
          <Badge variant="outline" className="ml-2">
            {borrowings.length} emprunt{borrowings.length > 1 ? 's' : ''}
          </Badge>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Chargement de vos emprunts...</p>
          </div>
        ) : borrowings.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {borrowings.map((borrowing, index) => {
              const isOverdue = isBookOverdue(borrowing);
              const status = isOverdue ? 'OVERDUE' : borrowing.status;
              
              return (
                <motion.div
                  key={borrowing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.05
                  }}
                >
                  <Card className="flex flex-col h-full">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <Badge className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(status)}`}>
                          {getStatusLabel(status)}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="destructive" className="text-xs">
                            En retard
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="line-clamp-1 text-lg">
                        {borrowing.inventoryItem?.book?.title || borrowing.inventory?.book?.title || "Livre inconnu"}
                      </CardTitle>
                      <CardDescription>
                        {borrowing.inventoryItem?.book?.author || borrowing.inventory?.book?.author || "Auteur inconnu"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grow space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span>Emprunté le : {formatSafeDate(borrowing.borrowedAt || borrowing.borrowedAt, "dd MMM yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                          À rendre le : {formatSafeDate(borrowing.dueDate, "dd MMM yyyy")}
                          {isOverdue && ` (${Math.ceil(Math.abs(new Date(borrowing.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} jour${Math.ceil(Math.abs(new Date(borrowing.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) > 1 ? 's' : ''} de retard)`}
                        </span>
                      </div>
                      {borrowing.returnedAt || borrowing.returnedAt ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <Check className="w-4 h-4 shrink-0" />
                          <span>Retourné le : {formatSafeDate(borrowing.returnedAt || borrowing.returnedAt, "dd MMM yyyy")}</span>
                        </div>
                      ) : null}
                      {borrowing.fines && borrowing.fines.length > 0 && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-xs text-yellow-800">
                            Amende : {borrowing.fines.reduce((total, fine) => total + fine.amount, 0)}€
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-end">
                      {borrowing.status !== "RETURNED" && borrowing.status !== "BORROWED" && (
                        <Button 
                          variant="default"
                          onClick={() => handleReturn(Number(borrowing.id))}
                          className="min-w-[120px]"
                        >
                          Retourner
                        </Button>
                      )}
                      {borrowing.status === "RETURNED" && (
                        <Button variant="outline" size="default" disabled>
                          <Check /> Retourné
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <BookMarked className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">Aucun emprunt</h3>
            <p className="text-muted-foreground mt-1">Vous n'avez pas encore emprunté de livres.</p>
            <Button 
              variant="default" 
              className="mt-4"
              onClick={() => router.push('/borrow')}
            >
              Explorer le catalogue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}