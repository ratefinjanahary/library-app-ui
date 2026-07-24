"use client";

import { useEffect, useState } from "react";
import { AnalyticsKPIs } from "@/lib/types";
import { analyticsService } from "@/lib/services/analytics.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Clock, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<AnalyticsKPIs | null>(null);
  const [topBooks, setTopBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [kpisData, topBooksData] = await Promise.all([
          analyticsService.getKPIs(),
          analyticsService.getTopBooks(),
        ]);
        setKpis(kpisData);
        const formattedTopBooks = topBooksData.map(item => ({
          title: item.book?.title || 'Titre inconnu',
          author: item.book?.author || 'Auteur inconnu',
          borrowCount: item.borrowCount || 0,
        }));
        setTopBooks(formattedTopBooks);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const stats = [
    {
      title: "Membres Inscrits",
      value: kpis?.totalMembers || 0,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Livres au Catalogue",
      value: kpis?.totalBooks || 0,
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      title: "Emprunts Actifs",
      value: kpis?.activeBorrowings || 0,
      icon: Clock,
      color: "text-amber-500",
    },
    {
      title: "Emprunts en Retard",
      value: kpis?.overdueBorrowings || 0,
      icon: AlertTriangle,
      color: "text-destructive",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Tableau de Bord</h1>
        <p>Aperçu général de l'activité de la bibliothèque.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-600/80">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Livres les plus populaires</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {loading ? (
              <Skeleton className="h-75 w-full" />
            ) : topBooks.length > 0 ? (
              <div className="h-75">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topBooks} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis
                      dataKey="title" 
                      className="text-xs" 
                      tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + "..." : value}
                    />
                    <YAxis allowDecimals={false} className="text-xs" />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        
                        return (
                          <div className="bg-background rounded-lg shadow-sm p-4 min-w-[130px]">
                            <p className="text-sm font-medium text-foreground/70 mb-1.5">
                              {label}
                            </p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-bold text-primary">
                                {payload[0].value}
                              </span>
                              <span className="text-foreground/70">emprunts</span>
                            </div>
                          </div>
                        );
                      }}
                      cursor={{ 
                        fill: 'rgba(59, 130, 246, 0.08)',
                        radius: 4
                      }}
                    />
                    <Bar 
                      dataKey="borrowCount" 
                      fill="var(--primary)" // Couleur bleue visible
                      name="Emprunts" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-75 flex items-center justify-center text-muted-foreground">
                Pas assez de données pour afficher le graphique.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
