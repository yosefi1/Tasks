"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sourceSchema, type SourceSchema } from "@/lib/validations/source";
import type { SourceCategory } from "@prisma/client";
import type { SourceWithCategory } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { useCreateSource, useUpdateSource } from "@/lib/hooks/use-sources";
import { useEffect } from "react";

type SourceFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: SourceWithCategory | null;
  categories: SourceCategory[];
  defaultCategoryId: string;
  existingTopics?: string[];
};

const typeOptions = [
  { value: "site", label: "Site" },
  { value: "video", label: "Video" },
];

export function SourceFormDialog({
  open,
  onOpenChange,
  source,
  categories,
  defaultCategoryId,
  existingTopics = [],
}: SourceFormDialogProps) {
  const { toast } = useToast();
  const createSource = useCreateSource();
  const updateSource = useUpdateSource();
  const isEdit = !!source?.id;
  const effectiveDefault =
    defaultCategoryId || categories[0]?.id || "";

  const form = useForm<SourceSchema>({
    resolver: zodResolver(sourceSchema),
    defaultValues: {
      title: "",
      url: "",
      type: "site",
      categoryId: effectiveDefault,
      topic: "",
      sortOrder: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (source) {
      form.reset({
        title: source.title,
        url: source.url,
        type: source.type as "site" | "video",
        categoryId: source.categoryId,
        topic: source.topic ?? "",
        sortOrder: source.sortOrder,
        notes: source.notes ?? "",
      });
    } else {
      form.reset({
        title: "",
        url: "",
        type: "site",
        categoryId: effectiveDefault,
        topic: "",
        sortOrder: 0,
        notes: "",
      });
    }
  }, [source, open, effectiveDefault, form]);

  async function onSubmit(values: SourceSchema) {
    if (!categories.length) {
      toast({
        title: "Add a category first",
        description: "Open settings (gear) and create at least one source category.",
        variant: "destructive",
      });
      return;
    }
    if (isEdit && source) {
      const result = await updateSource.mutateAsync({ id: source.id, data: values });
      if (result.error) {
        toast({ title: "Validation error", description: "Please fix the form errors.", variant: "destructive" });
        return;
      }
      toast({ title: "Source updated", description: "Your source has been updated.", variant: "success" });
    } else {
      const result = await createSource.mutateAsync(values);
      if (result.error) {
        toast({ title: "Validation error", description: "Please fix the form errors.", variant: "destructive" });
        return;
      }
      toast({ title: "Source added", description: "Your source has been added.", variant: "success" });
    }
    onOpenChange(false);
  }

  const isPending = createSource.isPending || updateSource.isPending;
  const categoryIdWatch = form.watch("categoryId");
  const categorySelectValue =
    categories.some((c) => c.id === categoryIdWatch) ? categoryIdWatch : effectiveDefault;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit source" : "Add source"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g. React docs"
              {...form.register("title")}
              className={form.formState.errors.title ? "border-destructive" : ""}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="text"
              placeholder="facebook.com/... (https:// added automatically)"
              {...form.register("url")}
              className={form.formState.errors.url ? "border-destructive" : ""}
            />
            {form.formState.errors.url && (
              <p className="text-sm text-destructive">{form.formState.errors.url.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic">Topic (e.g. AI, ART, PPT)</Label>
            <Input
              id="topic"
              list="topic-list"
              placeholder="Type or pick existing"
              {...form.register("topic")}
            />
            {existingTopics.length > 0 && (
              <datalist id="topic-list">
                {existingTopics.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.watch("type")}
                onValueChange={(v) => form.setValue("type", v as "site" | "video")}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {typeOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={categorySelectValue}
                onValueChange={(v) => form.setValue("categoryId", v)}
                disabled={!categories.length}
              >
                <SelectTrigger><SelectValue placeholder="Choose category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Optional notes" rows={2} {...form.register("notes")} />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !categories.length}>
              {isPending ? "Saving…" : isEdit ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
