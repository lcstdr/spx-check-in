"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Timestamp } from "firebase/firestore";

export type LogEntry = {
  id: string;
  name: string;
  timestamp: Timestamp;
  status: "Sucesso" | "Falhou" | "Erro";
  details: string;
};

interface ActivityLogProps {
  logs: LogEntry[];
  loading: boolean;
}

export function ActivityLog({ logs, loading }: ActivityLogProps) {
  if (loading) {
    return (
      <div className="rounded-lg border bg-card mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Nome</TableHead>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[70px]" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-[150px] ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="mt-8 rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Nenhuma atividade de check-in ainda.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Nome</TableHead>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Horário</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Detalhes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-medium">{log.name}</TableCell>
              <TableCell>{log.id}</TableCell>
              <TableCell>
                {log.timestamp ? format(log.timestamp.toDate(), "PPpp", { locale: ptBR }) : 'Carregando...'}
              </TableCell>
              <TableCell>
                <Badge variant={log.status === "Sucesso" ? "secondary" : "destructive"}>
                  {log.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{log.details}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
