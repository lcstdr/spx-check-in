
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Fingerprint, Loader2, MapPin, ShoppingBag, User } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { verifyLocation } from "@/lib/geolocation";
import { LogEntry } from "@/components/activity-log";
import { useFirestore, useAuth, useUser } from "@/firebase";

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  id: z.string().min(1, { message: "O ID é obrigatório." }),
});

export default function CheckInPage() {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      id: "",
    },
  });

  const handleGoogleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Login realizado com sucesso!" });
    } catch (error) {
      console.error("Erro no login com Google:", error);
      toast({ variant: "destructive", title: "Erro no Login", description: "Não foi possível fazer login com o Google." });
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    toast({ title: "Você foi desconectado." });
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsCheckingIn(true);

    const addLogEntry = async (status: LogEntry["status"], details: string) => {
      if (!firestore) return;
      const logsCollection = collection(firestore, "logs");
      try {
        await addDoc(logsCollection, {
          ...values,
          status,
          details,
          timestamp: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error writing to Firestore: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao Salvar",
            description: "Não foi possível salvar o registro no banco de dados.",
        });
      }
    };

    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Erro de Geolocalização",
        description: "Seu navegador não suporta geolocalização.",
      });
      addLogEntry("Erro", "Navegador não suporta geolocalização.");
      setIsCheckingIn(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const { isInRange, distance } = verifyLocation(latitude, longitude);

        if (isInRange) {
          toast({
            title: "Check-in Realizado com Sucesso!",
            description: `Bem-vindo, ${values.name}. Você está dentro da área designada.`,
          });
          addLogEntry("Sucesso", `Check-in a ${distance}m do alvo.`);
        } else {
          toast({
            variant: "destructive",
            title: "Falha no Check-in",
            description: `Você está muito longe do local.`,
          });
          addLogEntry("Falhou", `Usuário está a ${distance}m de distância do alvo.`);
        }
        setIsCheckingIn(false);
        form.reset();
      },
      (error) => {
        toast({
          variant: "destructive",
          title: "Erro de Geolocalização",
          description: error.message,
        });
        addLogEntry("Erro", error.message);
        setIsCheckingIn(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-4 py-8 sm:p-12">
      <header className="w-full flex justify-end mb-4">
        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline">Painel do Administrador</Button>
            </Link>
            <Button onClick={handleLogout} variant="ghost">Sair</Button>
          </div>
        ) : (
          <Button onClick={handleGoogleLogin}>Login de Administrador</Button>
        )}
      </header>
      <div className="flex flex-col items-center text-center mb-8">
        <div className="mb-4 rounded-full bg-primary/10 p-3">
            <ShoppingBag className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-headline font-bold text-primary">
          SPX CHECK-IN MAUÁ
        </h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          AJUSTE - MAUÁ LSP64 - Check-in automático por geolocalização para membros da equipe.
        </p>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Insira Seus Dados</CardTitle>
          <CardDescription>
            Nós verificaremos sua localização automaticamente para o check-in.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="ex: João da Silva" {...field} className="pl-9" />
                      </div>
                      
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID do Funcionário</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="ex: SPX123456" {...field} className="pl-9" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isCheckingIn}>
                {isCheckingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando Localização...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Fazer Check-in
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

    </main>
  );
}
