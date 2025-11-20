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
import type { LogEntry } from "@/app/page";

interface ActivityLogProps {
  logs: LogEntry[];
}

export function ActivityLog({ logs }: ActivityLogProps) {
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
          {logs.map((log, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{log.name}</TableCell>
              <TableCell>{log.id}</TableCell>
              <TableCell>{log.timestamp}</TableCell>
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
