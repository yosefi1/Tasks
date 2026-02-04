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
import { ExternalLink } from "lucide-react";
import type { Source } from "@prisma/client";
import { shortUrlDisplay } from "@/lib/source-utils";

type SourcesTableProps = {
  sources: Source[];
  onRowClick: (source: Source) => void;
};

export function SourcesTable({ sources, onRowClick }: SourcesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[140px]">Title</TableHead>
            <TableHead className="w-[80px]">Type</TableHead>
            <TableHead className="w-[100px]">Topic</TableHead>
            <TableHead className="w-[80px]">Category</TableHead>
            <TableHead className="min-w-[100px]">Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sources.map((source) => (
            <TableRow
              key={source.id}
              className="cursor-pointer"
              onClick={() => onRowClick(source)}
            >
              <TableCell className="font-medium">
                <span className="line-clamp-2" title={source.title}>
                  {source.title}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="capitalize">
                  {source.type}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground text-sm">
                  {(source as { topic?: string | null }).topic || "—"}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {source.category}
                </Badge>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                  title={source.url}
                >
                  {shortUrlDisplay(source.url)}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
