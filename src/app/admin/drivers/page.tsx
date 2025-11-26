"use client";

import { useState, useMemo } from "react";
import { collection, query, orderBy, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { Home, ShieldAlert, PlusCircle, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { useFirestore, useCollection, useUser } from "@/firebase";
import { ADMIN_EMAILS } from "@/lib/admins";
import type { Driver } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DriverForm } from "@/components/driver-form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function DriversPage() {
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const isAuthorizedAdmin = user && ADMIN_EMAILS.includes(user.email || "");

  const driversQuery = useMemo(() => {
    if (!firestore || !isAuthorizedAdmin) return null;
    const driversCollection = collection(firestore, "drivers");
    return query(driversCollection, orderBy("name", "asc"));
  }, [firestore, isAuthorizedAdmin]);

  const { data: drivers, loading: driversLoading } = useCollection<Driver>(driversQuery);

  const handleOpenForm = (driver: Driver | null = null) => {
    setEditingDriver(driver);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: Omit<Driver, "id">) => {
    if (!firestore) return;

    try {
      if (editingDriver) {
        // Update existing driver
        const driverRef = doc(firestore, "drivers", editingDriver.id);
        await updateDoc(driverRef, values);
        toast({ title: "Motorista atualizado com sucesso!" });
      } else {
        // Add new driver
        const driversCollection = collection(firestore, "drivers");
        await addDoc(driversCollection, values);
        toast({ title: "Motorista adicionado com sucesso!" });
      }
      setIsFormOpen(false);
      setEditingDriver(null);
    } catch (error) {
      console.error("Erro ao salvar motorista:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Salvar",
        description: "Não foi possível salvar os dados do motorista.",
      });
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    if (!firestore) return;
    try {
        const driverRef = doc(firestore, "drivers", driverId);
        await deleteDoc(driverRef);
        toast({ title: "Motorista excluído com sucesso!" });
    } catch (error) {
        console.error("Erro ao excluir motorista:", error);
        toast({
            variant: "destructive",
            title: "Erro ao Excluir",
            description: "Não foi possível excluir o motorista.",
        });
    }
  };

  if (userLoading) {
    return <div className="flex h-screen items-center justify-center">Verificando autorização...</div>;
  }

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

  return (
    <main className="container mx-auto p-4 py-8 sm:p-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="h-8 w-8" />
          Gerenciar Motoristas
        </h1>
        <div className="flex gap-2">
           <Link href="/admin">
                <Button variant="outline">
                    <ArrowLeft />
                    Voltar ao Painel
                </Button>
            </Link>
          <Button onClick={() => handleOpenForm()}>
            <PlusCircle />
            Adicionar Motorista
          </Button>
        </div>
      </div>

      <DriverForm 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        driver={editingDriver}
      />

      <div className="rounded-lg border bg-card mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Placa</TableHead>
              <TableHead className="text-right w-[140px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {driversLoading ? (
                [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-[120px] ml-auto" /></TableCell>
                    </TableRow>
                ))
            ) : drivers && drivers.length > 0 ? (
              drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{driver.name}</TableCell>
                  <TableCell>{driver.id}</TableCell>
                  <TableCell>{driver.vehicle}</TableCell>
                  <TableCell>{driver.plate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => handleOpenForm(driver)}>
                        Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="sm">Excluir</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente os dados do motorista.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteDriver(driver.id)}>
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        Nenhum motorista encontrado.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
