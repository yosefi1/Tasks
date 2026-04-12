"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TaskCard } from "@/components/task-card";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { DeleteTaskDialog } from "@/components/delete-task-dialog";
import { SourcesTable } from "@/components/sources-table";
import { SourceDetailDialog } from "@/components/source-detail-dialog";
import { SourceFormDialog } from "@/components/source-form-dialog";
import { DeleteSourceDialog } from "@/components/delete-source-dialog";
import { BulkPasteSourcesDialog } from "@/components/bulk-paste-sources-dialog";
import { SourceCategoriesSettingsDialog } from "@/components/source-categories-settings-dialog";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useSources } from "@/lib/hooks/use-sources";
import { useSourceCategories } from "@/lib/hooks/use-source-categories";
import { SortableTaskList } from "@/components/sortable-task-list";
import { TaskCategoryColorsDialog } from "@/components/task-category-colors-dialog";
import type { TaskWithSteps } from "@/lib/types";
import type { SourceWithCategory } from "@/lib/types";
import type { TaskOrderBy } from "@/app/actions/tasks";
import type { TaskCardViewVariant } from "@/components/task-card";
import { useTaskCategoryStyles } from "@/lib/hooks/use-task-category-styles";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  Loader2,
  ClipboardList,
  AlertCircle,
  ListTodo,
  Bookmark,
  FileText,
  Settings,
  LayoutGrid,
  List,
  Columns2,
  Palette,
} from "lucide-react";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const priorityOptions = [
  { value: "all", label: "All priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function DashboardPage() {
  const [mainTab, setMainTab] = useState<"tasks" | "sources">("tasks");
  const [tasksSubTab, setTasksSubTab] = useState<"private" | "work">("work");

  const [taskOrderBy, setTaskOrderBy] = useState<TaskOrderBy>("date");
  const [taskViewMode, setTaskViewMode] = useState<TaskCardViewVariant>("grid");
  const [taskColorsOpen, setTaskColorsOpen] = useState(false);
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithSteps | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskWithSteps | null>(null);

  const [sourceFormOpen, setSourceFormOpen] = useState(false);
  const [sourceDetailOpen, setSourceDetailOpen] = useState(false);
  const [sourceDeleteOpen, setSourceDeleteOpen] = useState(false);
  const [bulkPasteOpen, setBulkPasteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<SourceWithCategory | null>(null);
  const [selectedSource, setSelectedSource] = useState<SourceWithCategory | null>(null);
  const [deletingSource, setDeletingSource] = useState<SourceWithCategory | null>(null);
  const [sourcesSearch, setSourcesSearch] = useState("");

  const taskFilters = useMemo(
    () => ({
      category: tasksSubTab === "private" ? "personal" : "work",
      status: status === "all" ? undefined : status,
      priority: priority === "all" ? undefined : priority,
      search: search.trim() || undefined,
      orderBy: taskOrderBy,
    }),
    [tasksSubTab, status, priority, search, taskOrderBy]
  );

  const sourceFilters = useMemo(
    () => ({
      search: sourcesSearch.trim() || undefined,
    }),
    [sourcesSearch]
  );

  const { data: tasks = [], isLoading, isError, error } = useTasks(taskFilters);
  const {
    data: sources = [],
    isLoading: sourcesLoading,
    isError: sourcesError,
    error: sourcesErrorObj,
  } = useSources(sourceFilters);

  const {
    data: sourceCategories = [],
    isLoading: categoriesLoading,
  } = useSourceCategories();

  const { data: taskCategoryStyles = [] } = useTaskCategoryStyles();

  const taskCategoryColorMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const r of taskCategoryStyles) {
      m[r.slug] = r.color;
    }
    if (!m.personal) m.personal = "#8b5cf6";
    if (!m.work) m.work = "#0ea5e9";
    return m;
  }, [taskCategoryStyles]);

  useEffect(() => {
    try {
      const v = localStorage.getItem("taskViewMode");
      if (v === "grid" || v === "list" || v === "compact") setTaskViewMode(v);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("taskViewMode", taskViewMode);
    } catch {
      /* ignore */
    }
  }, [taskViewMode]);

  const defaultSourceCategoryId = sourceCategories[0]?.id ?? "";

  const taskSummary = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t: TaskWithSteps) => t.status === "done").length;
    const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, completionPct };
  }, [tasks]);

  const openCreateTask = () => {
    setEditingTask(null);
    setFormOpen(true);
  };
  const openEditTask = (task: TaskWithSteps) => {
    setEditingTask(task);
    setFormOpen(true);
  };
  const openDeleteTask = (task: TaskWithSteps) => {
    setDeletingTask(task);
    setDeleteOpen(true);
  };

  const openCreateSource = () => {
    setEditingSource(null);
    setSourceFormOpen(true);
  };
  const openEditSource = (source: SourceWithCategory) => {
    setEditingSource(source);
    setSourceFormOpen(true);
  };
  const openDeleteSource = (source: SourceWithCategory) => {
    setDeletingSource(source);
    setSourceDeleteOpen(true);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
            Task Manager
          </h1>
          {mainTab === "tasks" && (
            <Button onClick={openCreateTask} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New task</span>
            </Button>
          )}
          {mainTab === "sources" && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => setSettingsOpen(true)}
                aria-label="Source categories settings"
                title="Source categories"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setBulkPasteOpen(true)}
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Paste from document</span>
              </Button>
              <Button onClick={openCreateSource} size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add source</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as "tasks" | "sources")}>
          <TabsList className="mb-4 w-full sm:w-auto">
            <TabsTrigger value="tasks" className="gap-1.5">
              <ListTodo className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="sources" className="gap-1.5">
              <Bookmark className="h-4 w-4" />
              Sources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            <Tabs value={tasksSubTab} onValueChange={(v) => setTasksSubTab(v as "private" | "work")}>
              <TabsList>
                <TabsTrigger value="work">Work</TabsTrigger>
                <TabsTrigger value="private">Private</TabsTrigger>
              </TabsList>

            <section className="mt-4 grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total tasks</CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{taskSummary.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{taskSummary.completed}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion %</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{taskSummary.completionPct}%</p>
                </CardContent>
              </Card>
            </section>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">Filters & order</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setTaskColorsOpen(true)}
                    title="Colors for Private / Work tabs"
                  >
                    <Palette className="h-4 w-4" />
                    <span className="hidden sm:inline">Tab colors</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by title..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={taskOrderBy} onValueChange={(v) => setTaskOrderBy(v as TaskOrderBy)}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Due date</SelectItem>
                      <SelectItem value="custom">Manual (drag to reorder)</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="title">Title (A–Z)</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-muted-foreground text-sm shrink-0">View</span>
                  <div className="inline-flex rounded-md border p-0.5">
                    <Button
                      type="button"
                      variant={taskViewMode === "grid" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => setTaskViewMode("grid")}
                      title="Card grid"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant={taskViewMode === "compact" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => setTaskViewMode("compact")}
                      title="Compact grid"
                    >
                      <Columns2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant={taskViewMode === "list" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => setTaskViewMode("list")}
                      title="List"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <section>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">Tasks</h2>
                {taskOrderBy === "custom" && tasks.length > 0 && (
                  <span className="text-muted-foreground text-sm">
                    Drag the ⋮ handle to reorder (saved automatically)
                  </span>
                )}
              </div>
              {isLoading && (
                <div className="flex items-center justify-center rounded-lg border bg-card py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {isError && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/50 bg-destructive/5 py-12 px-4 text-center">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <p className="text-sm font-medium text-destructive">Failed to load tasks</p>
                  <p className="text-xs text-muted-foreground break-all">{error?.message ?? "Unknown error"}</p>
                  {(error?.message?.includes("TaskStep") || error?.message?.includes("sortOrder") || error?.message?.includes("no such")) && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Run: <code className="rounded bg-muted px-1">npm run db:migrate</code>
                    </p>
                  )}
                </div>
              )}
              {!isLoading && !isError && tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-card py-12 text-center">
                  <ClipboardList className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium">No tasks yet</p>
                  <p className="text-xs text-muted-foreground">Create a task to get started.</p>
                  <Button onClick={openCreateTask} variant="outline" size="sm" className="mt-2">
                    New task
                  </Button>
                </div>
              )}
              {!isLoading && !isError && tasks.length > 0 && taskOrderBy === "custom" && (
                <SortableTaskList
                  tasks={tasks}
                  onCardClick={openEditTask}
                  viewMode={taskViewMode}
                  categoryColors={taskCategoryColorMap}
                />
              )}
              {!isLoading && !isError && tasks.length > 0 && taskOrderBy !== "custom" && (
                <ul
                  className={cn(
                    taskViewMode === "list" && "flex flex-col gap-2",
                    taskViewMode === "grid" && "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
                    taskViewMode === "compact" &&
                      "grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  )}
                >
                  {tasks.map((task: TaskWithSteps) => (
                    <li key={task.id}>
                      <TaskCard
                        task={task}
                        onCardClick={openEditTask}
                        variant={taskViewMode}
                        categoryColors={taskCategoryColorMap}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
            </Tabs>
          </TabsContent>

          <TabsContent value="sources" className="space-y-6">
              <div className="space-y-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search sources..."
                    value={sourcesSearch}
                    onChange={(e) => setSourcesSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {sourcesLoading && (
                  <div className="flex items-center justify-center rounded-lg border bg-card py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                )}
                {sourcesError && (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/50 bg-destructive/5 py-12 text-center">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                    <p className="text-sm font-medium text-destructive">Failed to load sources</p>
                    <p className="text-xs text-muted-foreground">
                      {sourcesErrorObj?.message ?? "Unknown error"}
                    </p>
                  </div>
                )}
                {!sourcesLoading && !sourcesError && sources.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-card py-12 text-center">
                    <Bookmark className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm font-medium">No sources yet</p>
                    <p className="text-xs text-muted-foreground">
                      Add sources or paste from your document.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button onClick={openCreateSource} variant="outline" size="sm">
                        Add source
                      </Button>
                      <Button onClick={() => setBulkPasteOpen(true)} size="sm">
                        Paste from document
                      </Button>
                    </div>
                  </div>
                )}
                {!sourcesLoading && !sourcesError && sources.length > 0 && (
                  <SourcesTable
                    sources={sources}
                    onRowClick={(source) => {
                      setSelectedSource(source);
                      setSourceDetailOpen(true);
                    }}
                  />
                )}
              </div>
          </TabsContent>
        </Tabs>
      </main>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editingTask ? tasks.find((t: TaskWithSteps) => t.id === editingTask.id) ?? editingTask : null}
        filters={taskFilters}
        onDelete={(task) => {
          setFormOpen(false);
          setDeletingTask(task);
          setDeleteOpen(true);
        }}
      />
      <DeleteTaskDialog open={deleteOpen} onOpenChange={setDeleteOpen} task={deletingTask} />

      <SourceDetailDialog
        open={sourceDetailOpen}
        onOpenChange={setSourceDetailOpen}
        source={selectedSource}
        onEdit={(source) => {
          setEditingSource(source);
          setSourceFormOpen(true);
          setSourceDetailOpen(false);
        }}
        onDelete={(source) => {
          setSourceDetailOpen(false);
          setDeletingSource(source);
          setSourceDeleteOpen(true);
        }}
      />
      <SourceFormDialog
        open={sourceFormOpen}
        onOpenChange={setSourceFormOpen}
        source={editingSource}
        categories={sourceCategories}
        defaultCategoryId={defaultSourceCategoryId}
        existingTopics={Array.from(
          new Set(
            sources
              .map((s: SourceWithCategory) => s.topic)
              .filter((t): t is string => typeof t === "string" && t.length > 0)
          )
        )}
      />
      <DeleteSourceDialog
        open={sourceDeleteOpen}
        onOpenChange={setSourceDeleteOpen}
        source={deletingSource}
      />
      <BulkPasteSourcesDialog
        open={bulkPasteOpen}
        onOpenChange={setBulkPasteOpen}
        categories={sourceCategories}
        defaultCategoryId={defaultSourceCategoryId}
      />
      <SourceCategoriesSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        categories={sourceCategories}
        categoriesLoading={categoriesLoading}
      />
      <TaskCategoryColorsDialog open={taskColorsOpen} onOpenChange={setTaskColorsOpen} />
    </div>
  );
}
