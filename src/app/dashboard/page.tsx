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
import { BookMarked, Calendar, CheckCircle, Clock, Loader2 } from "lucide-react";
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
      toast.error("Erreur lors de la récupération de vos emprunts.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReturn(borrowingId: string) {
    try {
      await borrowingsService.returnBook(borrowingId);
      toast.success("Livre retourné avec succès !");
      fetchBorrowings();
    } catch (error) {
      toast.error("Erreur lors du retour du livre.");
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BORROWED": return "bg-blue-500/7 text-blue-500 hover:bg-blue-500/20";
      case "RETURNED": return "bg-green-500/7 text-green-500 hover:bg-green-500/20";
      case "OVERDUE": return "bg-destructive/7 text-destructive hover:bg-destructive/20";
      default: return "bg-muted text-muted-foreground hover:bg-muted/80";
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
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Chargement de vos emprunts...</p>
          </div>
        ) : borrowings.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {borrowings.map((borrowing, index) => (
              <motion.div
                key={borrowing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.05 // Délai progressif
                }}
              >
                <Card className="flex flex-col h-full">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(borrowing.status)}`}>
                        {getStatusLabel(borrowing.status)}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-1">
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
                  <CardFooter className="pt-2 flex justify-end">
                    {borrowing.status !== "RETURNED" && (
                      <Button variant="primarySoft" size="lg" onClick={() => handleReturn(borrowing.id)}>
                        Retourner le livre
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
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