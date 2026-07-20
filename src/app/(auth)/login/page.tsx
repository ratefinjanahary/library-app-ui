"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginSchema, LoginFormValues } from "@/lib/validators";
import { useAuthStore } from "@/lib/store";
import { authService } from "@/lib/services/auth.service";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    try {
      const response = await authService.login(data);
      const token = (response as any).access_token || response.token;
      const user = response.user;

      if (!token || !user) {
        throw new Error("Réponse de l'API invalide");
      }

      setAuth(token, user);
      toast.success("Connexion réussie !");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Échec de la connexion. Vérifiez vos identifiants.");
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="py-10">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
            <CardDescription>
              Entrez votre email et mot de passe pour accéder à votre compte.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button size="xl" type="submit" className="w-full mt-4" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Connexion en cours..." : "Se connecter"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 text-center">
            <div className="text-sm text-muted-foreground mb-5">
              Pas encore de compte ?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Inscrivez-vous
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
