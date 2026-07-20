"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center p-8 bg-linear-to-b from-background to-muted/20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl"
      >
        <BookOpen className="w-13 h-13 mx-auto text-primary mb-5" />
        <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl mb-6">
          Votre bibliothèque,
          <span className="text-primary">réinventée.</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Découvrez notre catalogue, gérez vos emprunts et explorez de nouveaux mondes littéraires en toute simplicité.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button render={<Link href="/books" />} size="xl" className="gap-2 px-5">
              <Search className="w-4 h-4" />
              Explorer le catalogue
          </Button>
          <Button render={<Link href="/register" />} variant="outline" size="xl" className="gap-2">
              Créer un compte
              <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
