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
import type { SourceWithCategory } from "@/lib/types";
import { shortUrlDisplay } from "@/lib/source-utils";

type SourcesTableProps = {
  sources: SourceWithCategory[];
  onRowClick: (source: SourceWithCategory) => void;
};

export function SourcesTable({ sources, onRowClick }: SourcesTableProps) {
  return (
    <div className="rounded-md border">
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[28%] min-w-[140px]">Title</TableHead>
            <TableHead className="w-[86px]">Type</TableHead>
            <TableHead className="w-[12%] min-w-[96px]">Topic</TableHead>
            <TableHead className="w-[24%] min-w-[180px]">Category</TableHead>
            <TableHead className="w-[26%] min-w-[100px]">Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sources.map((source) => (
            <TableRow
              key={source.id}
              className="cursor-pointer"
              style={
                source.category.color && /^#[0-9A-Fa-f]{6}$/.test(source.category.color)
                  ? { borderLeftWidth: 4, borderLeftColor: source.category.color }
                  : undefined
              }
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
              <TableCell className="whitespace-nowrap">
                <Badge variant="outline" className="whitespace-nowrap font-normal">
                  {source.category.name}
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
