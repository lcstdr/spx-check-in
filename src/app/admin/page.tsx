
"use client";

import { useMemo } from "react";
import { collection, query, orderBy } from "firebase/firestore";
import Link from 'next/link';
import { Home, ShieldAlert } from 'lucide-react';

import { useFirestore, useCollection, useUser } from "@/firebase";
import { ActivityLog, LogEntry } from "@/components/activity-log";
import { Button } from "@/components/ui/button";
import { ADMIN_EMAILS } from "@/lib/admins";

export default function AdminPage() {
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();

  const isAuthorizedAdmin = user && ADMIN_EMAILS.includes(user.email || "");

  const logsQuery = useMemo(() => {
    // Só busca os logs se o usuário for um admin autorizado
    if (!firestore || !isAuthorizedAdmin) return null;
    const logsCollection = collection(firestore, "logs");
    return query(logsCollection, orderBy("timestamp", "desc"));
  }, [firestore, isAuthorizedAdmin]);
  
  const { data: activityLog, loading: logsLoading } = useCollection<LogEntry>(logsQuery);

  if (userLoading) {
    return <div className="flex h-screen items-center justify-center">Verificando autorização...</div>;
  }

  // Se não houver usuário logado ou se o usuário não for um admin autorizado, mostra acesso negado.
  if (!user || !isAuthorizedAdmin) {
    return (
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
        <p className="text-muted-foreground mb-6">Você não tem permissão para acessar esta página.</p>
        <Link href="/">
            <Button>
                <Home className="mr-2 h-4 w-4" />
                Voltar para a Página Inicial
            </Button>
        </Link>
      </div>
    );
  }

  // Se for um admin autorizado, mostra o painel.
  return (
    <main className="container mx-auto p-4 py-8 sm:p-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Painel do Administrador</h1>
        <Link href="/">
            <Button variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Página de Check-in
            </Button>
        </Link>
      </div>
      
      <div className="w-full max-w-6xl mx-auto">
        <h2 className="text-2xl font-headline font-bold text-center">Registro de Atividades</h2>
        <ActivityLog logs={activityLog || []} loading={logsLoading} />
      </div>
    </main>
  );
}
