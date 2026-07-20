"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Book } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BookCardProps {
  book: Book;
  index: number;
}

export function BookCard({ book, index }: BookCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="text-xs text-muted-foreground mb-2 font-medium tracking-wider uppercase">
            {book.category?.name || "Sans catégorie"}
          </div>
          <CardTitle className="line-clamp-1" title={book.title}>{book.title}</CardTitle>
          <CardDescription>{book.author}</CardDescription>
        </CardHeader>
        <CardContent className="grow">
          <p className="text-sm text-muted-foreground">
            ISBN: {book.isbn}
          </p>
        </CardContent>
        <CardFooter>
          <Button render={<Link href={`/books/${book.id}`} />} size="lg" variant="primarySoft" className="w-full">Voir les détails</Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
