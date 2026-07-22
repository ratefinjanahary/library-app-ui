"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerSchema, RegisterFormValues } from "@/lib/validators";
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
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
    mode: "onChange",
  });

  const { watch, trigger, formState: { isSubmitting } } = form;
  const formValues = watch();

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await authService.register(data);
      toast.success("Inscription réussie ! Vous pouvez maintenant vous connecter.");
      router.push("/login");
    } catch (error) {
      toast.error("Échec de l'inscription. Veuillez vérifier les informations.");
    }
  }

  const handleNextStep = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(["firstName", "lastName"]);
    } else if (step === 2) {
      isValid = await trigger(["email", "password"]);
    }

    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setStep((prev) => prev - 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && step < 3) {
      e.preventDefault();
      handleNextStep(e);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 3) {
      form.handleSubmit(onSubmit)();
    } else {
      handleNextStep(e);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Jean" {...field} onKeyDown={handleKeyDown} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Dupont" {...field} onKeyDown={handleKeyDown} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} onKeyDown={handleKeyDown} />
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
                    <Input type="password" placeholder="••••••••" {...field} onKeyDown={handleKeyDown} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="rounded-lg border bg-card/40 p-4 space-y-3">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Récapitulatif
              </h4>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <span className="text-muted-foreground">Prénom :</span>
                <span className="font-medium">{formValues.firstName}</span>
                
                <span className="text-muted-foreground">Nom :</span>
                <span className="font-medium">{formValues.lastName}</span>
                
                <span className="text-muted-foreground">Email :</span>
                <span className="font-medium">{formValues.email}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Veuillez vérifier que les informations ci-dessus sont correctes avant de valider votre inscription.
            </p>
          </motion.div>
        );
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Inscription</CardTitle>
            <CardDescription>
              Étape {step} sur 3
            </CardDescription>
            <div className="pt-2">
              <Progress value={(step / 3) * 100} className="h-2" />
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  {renderStep()}
                </AnimatePresence>
                
                <div className="flex flex-col gap-3 pt-2">
                  {step < 3 ? (
                    <Button
                      size="lg"
                      type="button" 
                      onClick={handleNextStep}
                      className="w-full"
                    >
                      Suivant
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      size="lg"
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Création..." : "S'inscrire"}
                    </Button>
                  )}
                  
                  {step > 1 && (
                    <Button
                      size="lg"
                      type="button" 
                      variant="outline" 
                      onClick={handlePrevStep}
                      className="w-full"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Précédent
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 text-center pb-6">
            <div className="text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Connectez-vous
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}