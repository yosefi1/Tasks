"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { SourceCategory } from "@prisma/client";
import {
  useCreateSourceCategory,
  useUpdateSourceCategory,
  useDeleteSourceCategory,
} from "@/lib/hooks/use-source-categories";
import { ColorPresetRow } from "@/components/color-preset-row";

type SourceCategoriesSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: SourceCategory[];
  categoriesLoading: boolean;
};

export function SourceCategoriesSettingsDialog({
  open,
  onOpenChange,
  categories,
  categoriesLoading,
}: SourceCategoriesSettingsDialogProps) {
  const { toast } = useToast();
  const createCat = useCreateSourceCategory();
  const updateCat = useUpdateSourceCategory();
  const deleteCat = useDeleteSourceCategory();
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  async function handleAdd() {
    const res = await createCat.mutateAsync({
      name: newName,
      color: newColor.trim() || null,
    });
    if ("error" in res && res.error) {
      toast({ title: "Could not add", description: res.error, variant: "destructive" });
      return;
    }
    toast({ title: "Category added", variant: "success" });
    setNewName("");
    setNewColor("");
  }

  function startEdit(cat: SourceCategory) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color && /^#[0-9A-Fa-f]{6}$/.test(cat.color) ? cat.color : "");
  }

  async function saveEdit(id: string) {
    const res = await updateCat.mutateAsync({
      id,
      name: editName,
      color: editColor.trim() || null,
    });
    if ("error" in res && res.error) {
      toast({ title: "Could not save", description: res.error, variant: "destructive" });
      return;
    }
    setEditingId(null);
    toast({ title: "Saved", variant: "success" });
  }

  async function handleDelete(id: string) {
    const res = await deleteCat.mutateAsync(id);
    if ("error" in res && res.error) {
      toast({ title: "Could not delete", description: res.error, variant: "destructive" });
      return;
    }
    toast({ title: "Category removed", variant: "success" });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Source categories</DialogTitle>
          <DialogDescription>
            Name, color (optional stripe in the table), and order. You cannot delete a category that still has sources.
          </DialogDescription>
        </DialogHeader>

        {categoriesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-cat">New category</Label>
              <Input
                id="new-cat"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Learning"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
              />
              <Label className="text-muted-foreground text-xs">Color (optional)</Label>
              <ColorPresetRow value={newColor} onChange={setNewColor} />
              <Button
                type="button"
                onClick={handleAdd}
                disabled={!newName.trim() || createCat.isPending}
                className="w-full sm:w-auto"
              >
                {createCat.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add category"}
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Your categories</Label>
              <ul className="max-h-[280px] space-y-3 overflow-y-auto rounded-md border p-2">
                {categories.length === 0 && (
                  <li className="text-muted-foreground text-sm">No categories yet — add one above.</li>
                )}
                {categories.map((cat) => (
                  <li key={cat.id} className="space-y-2 rounded-md border border-transparent p-2 hover:bg-muted/40">
                    {editingId === cat.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              saveEdit(cat.id);
                            }
                          }}
                        />
                        <ColorPresetRow value={editColor} onChange={setEditColor} />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => saveEdit(cat.id)}
                            disabled={updateCat.isPending}
                          >
                            Save
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className="h-8 w-1 shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              cat.color && /^#[0-9A-Fa-f]{6}$/.test(cat.color) ? cat.color : "#94a3b8",
                          }}
                          aria-hidden
                        />
                        <span className="flex-1 text-sm font-medium">{cat.name}</span>
                        <Button type="button" size="sm" variant="outline" onClick={() => startEdit(cat)}>
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="shrink-0 text-destructive"
                          onClick={() => handleDelete(cat.id)}
                          disabled={deleteCat.isPending}
                          aria-label={`Delete ${cat.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
