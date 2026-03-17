import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { TaskActivityLog } from "@/components/TaskActivityLog";
import { Task, TaskPriority, TaskStatus, TaskCategory, AssignedBy, FollowUp, GeneratedFollowUp } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateFollowUpsFromTask, analyzeTaskForFollowUps } from "@/lib/aiService";
import { Loader2, Sparkles, Plus, Search, Trash2, Edit, ChevronLeft, ChevronRight, Download, FileText, FileSpreadsheet, Activity, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { exportAllTasksToExcel } from "@/lib/helpers";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { formatDateDDMMYYYY, getDaysRemaining, isOverdue, getPriorityBg, getStatusBg, exportTasksToCSV } from "@/lib/helpers";

const priorities: TaskPriority[] = ["Critical", "High", "Medium", "Low"];
const statuses: TaskStatus[] = ["To Do", "In Progress", "Under Review", "Completed", "On Hold"];
const categories: TaskCategory[] = ["Operations", "Implementation", "Coordination", "Reporting", "Review", "Automation", "Process Improvement", "Other"];
const assignedByOptions: AssignedBy[] = ["Director", "CEO", "Self", "BU Head"];

const emptyTask = (): Partial<Task> => ({
  title: "", description: "", assignedBy: "CEO", assignedTo: "", requestedBy: "", category: "Operations",
  priority: "Medium", status: "To Do", startDate: new Date().toISOString().split("T")[0],
  dueDate: "", percentComplete: 0, remarks: "",
});

// Advanced search function
const searchTasks = (task: Task, searchTerm: string): boolean => {
  if (!searchTerm) return true;
  
  const term = searchTerm.toLowerCase();
  
  // Search in all relevant fields
  return (
    task.taskId.toLowerCase().includes(term) ||
    task.title.toLowerCase().includes(term) ||
    (task.description?.toLowerCase() || "").includes(term) ||
    task.assignedTo.toLowerCase().includes(term) ||
    (task.assignedBy?.toLowerCase() || "").includes(term) ||
    (task.requestedBy?.toLowerCase() || "").includes(term) ||
    task.category.toLowerCase().includes(term) ||
    task.status.toLowerCase().includes(term) ||
    task.priority.toLowerCase().includes(term) ||
    (task.remarks?.toLowerCase() || "").includes(term) ||
    task.startDate.includes(term) ||
    task.dueDate.includes(term) ||
    (task.completionDate?.includes(term) || false)
  );
};

export default function TaskRegister() {
  const { user, tasks, followUps, addTask, updateTask, deleteTask, getNextTaskId, addFollowUp } = useApp();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // AI state variables
  const [generateAIFollowUps, setGenerateAIFollowUps] = useState(true);
  const [isGeneratingFollowUps, setIsGeneratingFollowUps] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<GeneratedFollowUp[]>([]);
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  const filtered = useMemo(() => {
    return (tasks || []).filter((t) => {
      // Apply search first
      if (!searchTasks(t, search)) return false;
      
      // Then apply filters
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (filterPriority !== "all" && t.priority !== filterPriority) return false;
      if (filterCategory !== "all" && t.category !== filterCategory) return false;
      return true;
    });
  }, [tasks, search, filterStatus, filterPriority, filterCategory]);

  // Get search suggestions based on current tasks
  const searchSuggestions = useMemo(() => {
    if (!search || search.length < 2) return [];
    
    const suggestions = new Set<string>();
    const term = search.toLowerCase();
    
    tasks.forEach(task => {
      // Suggest task IDs
      if (task.taskId.toLowerCase().includes(term)) {
        suggestions.add(task.taskId);
      }
      // Suggest assignees
      if (task.assignedTo.toLowerCase().includes(term)) {
        suggestions.add(task.assignedTo);
      }
      // Suggest categories
      if (task.category.toLowerCase().includes(term)) {
        suggestions.add(task.category);
      }
      // Suggest statuses
      if (task.status.toLowerCase().includes(term)) {
        suggestions.add(task.status);
      }
      // Suggest priorities
      if (task.priority.toLowerCase().includes(term)) {
        suggestions.add(task.priority);
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  }, [tasks, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openNew = () => { setEditingTask(emptyTask()); setDialogOpen(true); };
  const openEdit = (task: Task) => { setEditingTask({ ...task }); setDialogOpen(true); };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    
    // Save to search history (avoid duplicates, keep last 5)
    if (value && !searchHistory.includes(value)) {
      setSearchHistory(prev => [value, ...prev].slice(0, 5));
    }
  };

  const clearSearch = () => {
    setSearch("");
    setPage(1);
  };

  // AI follow-ups handler
  const handleGenerateFollowUps = async () => {
    if (!editingTask?.title) return;

    setIsGeneratingFollowUps(true);
    try {
      const followUps = await generateFollowUpsFromTask(
        editingTask.title,
        editingTask.description || "",
        "temp-id" // temp, will replace with real task id after save
      );

      if (followUps.length > 0) {
        setAiSuggestions(followUps);
        setShowAISuggestions(true);
      }
    } catch (error) {
      console.error("Failed to generate follow-ups:", error);
    } finally {
      setIsGeneratingFollowUps(false);
    }
  };

  // handleSave with AI integration
  const handleSave = async () => {
    if (!editingTask?.title || !editingTask?.dueDate) { 
      toast.error("Title and Due Date are required"); 
      return; 
    }
    if (!editingTask?.assignedTo) {
      toast.error("Assigned To is required");
      return;
    }
  
    const now = new Date().toISOString();
    let savedTask: Task;
  
    if (editingTask.id) {
      const updatedTask = { ...editingTask, updatedAt: now } as Task;
      await updateTask(updatedTask);
      savedTask = updatedTask;
      toast.success("Task updated");
    } else {
      const taskId = getNextTaskId();
      const newTask = { 
        ...editingTask, 
        id: crypto.randomUUID(), 
        taskId, 
        createdAt: now, 
        updatedAt: now,
        createdBy: user?.id
      } as Task;
      await addTask(newTask);
      savedTask = newTask;
      toast.success("Task created");

      // Generate AI follow-ups if enabled
      if (generateAIFollowUps) {
        setIsGeneratingFollowUps(true);
        try {
          const followUps = await generateFollowUpsFromTask(
            newTask.title,
            newTask.description || "",
            newTask.id
          );

          for (const f of followUps) {
            const followUp: FollowUp = {
              id: crypto.randomUUID(),
              taskId: newTask.id,
              followUpDate: f.followUpDate,
              type: f.type,
              stakeholder: f.stakeholder,
              actionItem: f.actionItem,
              outcome: "",
              nextFollowUpDate: f.nextFollowUpDate,
              status: "Pending"
            };
            await addFollowUp(followUp);
          }

          if (followUps.length > 0) {
            toast.success(`Generated ${followUps.length} follow-up(s)`);
          }
        } catch (error) {
          console.error("Failed to generate follow-ups:", error);
        } finally {
          setIsGeneratingFollowUps(false);
        }
      }
    }

    setDialogOpen(false);
    setEditingTask(null);
  };

  const handleDelete = (id: string) => { 
    deleteTask(id); 
    toast.success("Task deleted"); 
  };
  
  const handleExportExcel = () => {
    try {
      exportAllTasksToExcel(filtered, followUps);
      toast.success("Tasks exported to Excel successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export tasks");
    }
  };
  
  const updateField = <K extends keyof Task>(field: K, value: Task[K]) =>
    setEditingTask((p) => (p ? { ...p, [field]: value } : p));

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Task Register</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {tasks.length} tasks
            {search && ` • Searching: "${search}"`}
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportTasksToCSV(filtered)}>
                <FileText className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={openNew} size="sm">
            <Plus className="h-4 w-4 mr-1" />New Task
          </Button>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <Card className="glass-card">
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search across all fields (ID, title, assignee, dates...)" 
                value={search} 
                onChange={(e) => handleSearch(e.target.value)} 
                className="pl-9 pr-8 h-9"
              />
              {search && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              
              {/* Search suggestions dropdown */}
              {searchSuggestions.length > 0 && search.length >= 2 && (
                <div className="absolute z-10 mt-1 w-full bg-popover border rounded-md shadow-lg">
                  {searchSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                      onClick={() => handleSearch(suggestion)}
                    >
                      <Search className="h-3 w-3 inline mr-2 text-muted-foreground" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            
            <Select value={filterPriority} onValueChange={(v) => { setFilterPriority(v); setPage(1); }}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {priorities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            
            <Select value={filterCategory} onValueChange={(v) => { setFilterCategory(v); setPage(1); }}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Category</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Search stats */}
          {search && (
            <div className="mt-2 text-xs text-muted-foreground">
              Found {filtered.length} matching tasks
              {filtered.length === 0 && (
                <Button 
                  variant="link" 
                  className="text-xs px-1 h-auto"
                  onClick={clearSearch}
                >
                  Clear search
                </Button>
              )}
            </div>
          )}

          {/* Search history */}
          {searchHistory.length > 0 && !search && (
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <span className="text-xs text-muted-foreground mr-1">Recent:</span>
              {searchHistory.map((term, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-[10px] cursor-pointer hover:bg-accent"
                  onClick={() => handleSearch(term)}
                >
                  {term}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[90px]">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Assigned To</TableHead>
              <TableHead className="hidden lg:table-cell">Requested By</TableHead>
              <TableHead className="hidden md:table-cell">Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Due Date</TableHead>
              <TableHead className="hidden lg:table-cell">Days</TableHead>
              <TableHead className="hidden md:table-cell">%</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((task) => {
              const days = getDaysRemaining(task.dueDate);
              const overdue = isOverdue(task);
              const dueToday = days === 0;
              return (
                <TableRow 
                  key={task.id} 
                  className={`
                    ${overdue ? "bg-destructive/5" : dueToday ? "bg-warning/5" : ""}
                    ${search && searchTasks(task, search) ? "ring-1 ring-primary/20" : ""}
                  `}
                >
                  <TableCell className="font-mono text-xs">{task.taskId}</TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{task.title}</div>
                    <div className="text-xs text-muted-foreground hidden sm:block">{task.category}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs">{task.assignedTo}</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs">{task.requestedBy || "-"}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className={`text-xs ${getPriorityBg(task.priority)}`}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${getStatusBg(task.status)}`}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs">{formatDateDDMMYYYY(task.dueDate)}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {task.status === "Completed" ? 
                      <Badge className="text-[10px] bg-success/10 text-success border-success/20" variant="outline">Done</Badge> :
                      overdue ? 
                        <Badge variant="destructive" className="text-[10px]">OVERDUE</Badge> :
                        <span className="text-xs">{days}d</span>
                    }
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${task.percentComplete}%` }} />
                      </div>
                      <span className="text-[10px]">{task.percentComplete}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(task)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(task.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  {search ? (
                    <div className="space-y-2">
                      <p>No tasks matching "{search}"</p>
                      <Button variant="link" onClick={clearSearch}>
                        Clear search
                      </Button>
                    </div>
                  ) : (
                    "No tasks found"
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages} • Showing {paginated.length} of {filtered.length} tasks
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Task Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editingTask?.id ? "Edit Task" : "New Task"}</DialogTitle>
          </DialogHeader>

          {editingTask && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
              </TabsList>

              {/* DETAILS TAB */}
              <TabsContent value="details" className="space-y-3 pt-3">
                {/* Title field */}
                <div className="space-y-1">
                  <label className="text-xs font-medium">Title *</label>
                  <Input
                    value={editingTask.title}
                    onChange={(e) => updateField("title", e.target.value)}
                  />
                </div>

                {/* Description field */}
                <div className="space-y-1">
                  <label className="text-xs font-medium">Description</label>
                  <Textarea
                    value={editingTask.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={2}
                  />
                </div>

                {/* AI follow-ups UI (only for new tasks) */}
                {!editingTask?.id && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ai-followups"
                        checked={generateAIFollowUps}
                        onCheckedChange={(checked) =>
                          setGenerateAIFollowUps(checked as boolean)
                        }
                      />
                      <label
                        htmlFor="ai-followups"
                        className="text-xs font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3 text-yellow-500" />
                        Auto-generate follow-ups with AI
                      </label>
                    </div>

                    {generateAIFollowUps && (
                      <div className="text-[10px] text-muted-foreground bg-muted/50 p-2 rounded">
                        AI will analyze your task and create relevant follow-up items automatically.
                      </div>
                    )}

                    {isGeneratingFollowUps && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Generating follow-ups...
                      </div>
                    )}
                  </div>
                )}

                {/* Assigned By / Assigned To */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Assigned By</label>
                    <Select
                      value={editingTask.assignedBy}
                      onValueChange={(v) => updateField("assignedBy", v as Task["assignedBy"])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {assignedByOptions.map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Assigned To *</label>
                    <Input
                      value={editingTask.assignedTo || ""}
                      onChange={(e) => updateField("assignedTo", e.target.value)}
                      placeholder="Enter name"
                    />
                  </div>
                </div>

                {/* Requested By */}
                <div className="space-y-1">
                  <label className="text-xs font-medium">Requested By (if from BU Head)</label>
                  <Input
                    value={editingTask.requestedBy || ""}
                    onChange={(e) => updateField("requestedBy", e.target.value)}
                    placeholder="Enter BU Head name"
                  />
                </div>

                {/* Category / Priority / Status */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Category</label>
                    <Select
                      value={editingTask.category}
                      onValueChange={(v) => updateField("category", v as Task["category"])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Priority</label>
                    <Select
                      value={editingTask.priority}
                      onValueChange={(v) => updateField("priority", v as Task["priority"])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Status</label>
                    <Select
                      value={editingTask.status}
                      onValueChange={(v) => updateField("status", v as Task["status"])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Start Date</label>
                    <Input
                      type="date"
                      value={editingTask.startDate}
                      onChange={(e) => updateField("startDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Due Date *</label>
                    <Input
                      type="date"
                      value={editingTask.dueDate}
                      onChange={(e) => updateField("dueDate", e.target.value)}
                    />
                  </div>
                </div>

                {/* Completion slider */}
                <div className="space-y-1">
                  <label className="text-xs font-medium">
                    Completion: {editingTask.percentComplete}%
                  </label>
                  <Slider
                    value={[editingTask.percentComplete || 0]}
                    onValueChange={(v) => updateField("percentComplete", v[0])}
                    max={100}
                    step={5}
                  />
                </div>

                {/* Remarks */}
                <div className="space-y-1">
                  <label className="text-xs font-medium">Remarks</label>
                  <Textarea
                    value={editingTask.remarks}
                    onChange={(e) => updateField("remarks", e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    {editingTask.id ? "Update" : "Create"}
                  </Button>
                </div>
              </TabsContent>

              {/* ACTIVITY TAB */}
              <TabsContent value="activity" className="pt-3">
                {editingTask.id ? (
                  <TaskActivityLog
                    taskId={editingTask.id}
                    taskTitle={editingTask.title || ""}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      Save the task first to see activity log
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}