import { useState, useMemo, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
// ✅ Added Share2 to imports
import { Plus, Edit, Trash2, Calendar, Clock, CheckCircle2, PlayCircle, PauseCircle, XCircle, Share2 } from "lucide-react";
import { Project, ProjectPlanItem } from "@/types";
import { format } from "date-fns";
import { exportProjectToExcel } from "@/lib/helpers";
import { FileSpreadsheet } from "lucide-react";
// ✅ Added ShareDialog import
import { ShareDialog } from "@/components/ShareDialog";


const emptyProject = (): Partial<Project> => ({
  name: "",
  description: "",
  department: "",
  plan: [],
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  status: "Active",
  progress: 0
});


const emptyPlanItem = (order: number): ProjectPlanItem => ({
  id: crypto.randomUUID(),
  title: "",
  description: "",
  plannedStartDate: new Date().toISOString().split("T")[0],
  plannedEndDate: "",
  status: "Not Started",
  progress: 0,
  order
});


export default function Projects() {
  const { 
    projects, 
    tasks,
    addProject, 
    updateProject, 
    deleteProject 
  } = useApp();
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  
  // Plan dialog states
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlanItem, setEditingPlanItem] = useState<Partial<ProjectPlanItem> | null>(null);
  const [isNewPlanItem, setIsNewPlanItem] = useState(false);

  // ✅ Share dialog states
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [projectToShare, setProjectToShare] = useState<Project | null>(null);


  // Set first project as selected when projects load
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    } else if (projects.length === 0) {
      setSelectedProject(null);
    }
  }, [projects, selectedProject]);


  const getStatusColor = (status: string) => {
    switch(status) {
      case "Active": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "On Hold": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Completed": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "";
    }
  };


  const getPlanItemStatusColor = (status: string) => {
    switch(status) {
      case "Completed": return "bg-green-500/10 text-green-500";
      case "In Progress": return "bg-blue-500/10 text-blue-500";
      case "Delayed": return "bg-red-500/10 text-red-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };


  const getPlanItemStatusIcon = (status: string) => {
    switch(status) {
      case "Completed": return <CheckCircle2 className="h-4 w-4" />;
      case "In Progress": return <PlayCircle className="h-4 w-4" />;
      case "Delayed": return <XCircle className="h-4 w-4" />;
      default: return <PauseCircle className="h-4 w-4" />;
    }
  };


  // Project Handlers
  const handleNewProject = () => {
    setEditingProject(emptyProject());
    setProjectDialogOpen(true);
  };


  const handleEditProject = (project: Project) => {
    setEditingProject({ ...project });
    setProjectDialogOpen(true);
  };


  const handleSaveProject = async () => {
    if (!editingProject?.name) {
      toast.error("Project name is required");
      return;
    }


    try {
      const now = new Date().toISOString();
      if (editingProject.id) {
        await updateProject({ 
          ...editingProject, 
          updatedAt: now 
        } as Project);
        toast.success("Project updated");
      } else {
        const newProject: Project = {
          ...editingProject,
          id: crypto.randomUUID(),
          plan: [],
          createdAt: now,
          updatedAt: now
        } as Project;
        await addProject(newProject);
        setSelectedProject(newProject);
        toast.success("Project created");
        
        setProjectDialogOpen(false);
        setTimeout(() => {
          handleAddPlanItem(newProject.id);
        }, 100);
      }
      setProjectDialogOpen(false);
      setEditingProject(null);
    } catch (error) {
      toast.error("Failed to save project");
      console.error(error);
    }
  };


  const handleDeleteProject = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(id);
        toast.success("Project deleted");
      } catch (error) {
        toast.error("Failed to delete project");
        console.error(error);
      }
    }
  };


  const handleExportProject = (project: Project) => {
    try {
      exportProjectToExcel(project, tasks);
      toast.success("Project exported to Excel successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export project");
    }
  };

  // ✅ Share handler
  const handleShareProject = (project: Project) => {
    setProjectToShare(project);
    setShareDialogOpen(true);
  };


  // Plan Item Handlers
  const handleAddPlanItem = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;


    const nextOrder = project.plan?.length || 0;
    setEditingPlanItem(emptyPlanItem(nextOrder));
    setIsNewPlanItem(true);
    setPlanDialogOpen(true);
  };


  const handleEditPlanItem = (item: ProjectPlanItem) => {
    setEditingPlanItem({ ...item });
    setIsNewPlanItem(false);
    setPlanDialogOpen(true);
  };


  const handleSavePlanItem = async () => {
    if (!editingPlanItem?.title || !editingPlanItem?.plannedEndDate) {
      toast.error("Title and planned end date are required");
      return;
    }


    if (!selectedProject) return;


    try {
      const updatedProject = { ...selectedProject };
      
      if (isNewPlanItem) {
        const newItem: ProjectPlanItem = {
          ...editingPlanItem,
          id: crypto.randomUUID(),
          status: "Not Started",
          progress: 0
        } as ProjectPlanItem;
        
        updatedProject.plan = [...(selectedProject.plan || []), newItem];
      } else {
        updatedProject.plan = (selectedProject.plan || []).map(item =>
          item.id === editingPlanItem.id ? { ...item, ...editingPlanItem } as ProjectPlanItem : item
        );
      }


      const totalItems = updatedProject.plan.length;
      const completedItems = updatedProject.plan.filter(item => item.status === "Completed").length;
      updatedProject.progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
      updatedProject.updatedAt = new Date().toISOString();


      await updateProject(updatedProject);
      setSelectedProject(updatedProject);
      
      toast.success(isNewPlanItem ? "Plan item added" : "Plan item updated");
      setPlanDialogOpen(false);
      setEditingPlanItem(null);
    } catch (error) {
      toast.error("Failed to save plan item");
      console.error(error);
    }
  };


  const handleDeletePlanItem = async (itemId: string) => {
    if (!selectedProject) return;
    
    if (confirm("Are you sure you want to delete this plan item?")) {
      try {
        const updatedProject = { ...selectedProject };
        updatedProject.plan = (selectedProject.plan || []).filter(item => item.id !== itemId);
        
        const totalItems = updatedProject.plan.length;
        const completedItems = updatedProject.plan.filter(item => item.status === "Completed").length;
        updatedProject.progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        updatedProject.updatedAt = new Date().toISOString();


        await updateProject(updatedProject);
        setSelectedProject(updatedProject);
        
        toast.success("Plan item deleted");
      } catch (error) {
        toast.error("Failed to delete plan item");
        console.error(error);
      }
    }
  };


  const handleMarkComplete = async (item: ProjectPlanItem) => {
    if (!selectedProject) return;


    try {
      const updatedProject = { ...selectedProject };
      const updatedItem = { ...item };
      
      updatedItem.status = "Completed";
      updatedItem.progress = 100;
      updatedItem.actualEndDate = new Date().toISOString().split("T")[0];
      
      updatedProject.plan = (selectedProject.plan || []).map(p => 
        p.id === item.id ? updatedItem : p
      );


      const totalItems = updatedProject.plan.length;
      const completedItems = updatedProject.plan.filter(i => i.status === "Completed").length;
      updatedProject.progress = Math.round((completedItems / totalItems) * 100);
      updatedProject.updatedAt = new Date().toISOString();


      await updateProject(updatedProject);
      setSelectedProject(updatedProject);
      
      toast.success("Plan item marked as completed");
    } catch (error) {
      toast.error("Failed to update plan item");
      console.error(error);
    }
  };


  const handleMarkInProgress = async (item: ProjectPlanItem) => {
    if (!selectedProject) return;


    try {
      const updatedProject = { ...selectedProject };
      const updatedItem = { ...item };
      
      updatedItem.status = "In Progress";
      updatedItem.actualStartDate = updatedItem.actualStartDate || new Date().toISOString().split("T")[0];
      
      updatedProject.plan = (selectedProject.plan || []).map(p => 
        p.id === item.id ? updatedItem : p
      );

      updatedProject.updatedAt = new Date().toISOString();


      await updateProject(updatedProject);
      setSelectedProject(updatedProject);
      
      toast.success("Plan item marked as in progress");
    } catch (error) {
      toast.error("Failed to update plan item");
      console.error(error);
    }
  };


  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Header with Add Project Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Plan and track project execution
          </p>
        </div>
        <Button onClick={handleNewProject} size="default" className="gap-2">
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>


      {projects.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
              Create your first project to start planning and tracking execution.
            </p>
            <Button onClick={handleNewProject} size="default">
              <Plus className="h-4 w-4 mr-2" /> Create Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Project List Sidebar */}
          <Card className="lg:col-span-1 glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">All Projects</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {projects.map(project => (
                  <div
                    key={project.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedProject?.id === project.id 
                        ? "bg-accent text-accent-foreground" 
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{project.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{project.department || "No Department"}</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ml-2 ${getStatusColor(project.status)}`}>
                        {project.progress}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>


          {/* Project Details */}
          <Card className="lg:col-span-3 glass-card">
            {selectedProject ? (
              <>
                <CardHeader className="pb-2 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedProject.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{selectedProject.description}</p>
                    <Badge className="mt-2 bg-primary/10 text-primary border-primary/20">
                      {selectedProject.department || "No Department"}
                    </Badge>
                  </div>
                  {/* ✅ Updated button group with Share button */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShareProject(selectedProject)}
                    >
                      <Share2 className="h-3 w-3 mr-1" />Share
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => handleExportProject(selectedProject)}>
                      <FileSpreadsheet className="h-3 w-3 mr-1" />Export
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => handleEditProject(selectedProject)}>
                      <Edit className="h-3 w-3 mr-1" />Edit
                    </Button>

                    <Button variant="destructive" size="sm" onClick={() => handleDeleteProject(selectedProject.id)}>
                      <Trash2 className="h-3 w-3 mr-1" />Delete
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Start Date</p>
                      <p className="text-sm font-medium flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(selectedProject.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">End Date</p>
                      <p className="text-sm font-medium flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(selectedProject.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge className={`mt-1 ${getStatusColor(selectedProject.status)}`}>
                        {selectedProject.status}
                      </Badge>
                    </div>
                  </div>


                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">Overall Progress</span>
                      <span className="text-sm font-bold">{selectedProject.progress}%</span>
                    </div>
                    <Progress value={selectedProject.progress} className="h-2" />
                  </div>


                  {/* Project Plan Section */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{selectedProject.name} Plan</h3>
                        <p className="text-xs text-muted-foreground">Track plan vs actual execution</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleAddPlanItem(selectedProject.id)} className="gap-2">
                        <Plus className="h-3 w-3" /> Add Plan Item
                      </Button>
                    </div>


                    <div className="space-y-3">
                      {selectedProject.plan && selectedProject.plan.length > 0 ? (
                        [...selectedProject.plan]
                          .sort((a, b) => a.order - b.order)
                          .map((item) => {
                            const isDelayed = item.status !== "Completed" && 
                              new Date(item.plannedEndDate) < new Date() && 
                              item.status !== "Completed";
                            
                            const displayStatus = isDelayed ? "Delayed" : item.status;
                            
                            return (
                              <Card key={item.id} className="border border-border/50">
                                <CardContent className="p-3">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[10px]">
                                          Phase {item.order + 1}
                                        </Badge>
                                        <h4 className="font-medium">{item.title}</h4>
                                        <Badge className={`text-[10px] ${getPlanItemStatusColor(displayStatus)}`}>
                                          <span className="flex items-center gap-1">
                                            {getPlanItemStatusIcon(displayStatus)}
                                            {displayStatus}
                                          </span>
                                        </Badge>
                                      </div>
                                      {item.description && (
                                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {item.status !== "Completed" && (
                                        <>
                                          {item.status === "Not Started" && (
                                            <Button 
                                              variant="ghost" 
                                              size="icon" 
                                              className="h-6 w-6"
                                              onClick={() => handleMarkInProgress(item)}
                                            >
                                              <PlayCircle className="h-3 w-3 text-blue-500" />
                                            </Button>
                                          )}
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6"
                                            onClick={() => handleMarkComplete(item)}
                                          >
                                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                                          </Button>
                                        </>
                                      )}
                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditPlanItem(item)}>
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeletePlanItem(item.id)}>
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4 mt-2 text-xs">
                                    <div>
                                      <p className="text-muted-foreground">Planned</p>
                                      <p className="font-medium">
                                        {format(new Date(item.plannedStartDate), "dd MMM yyyy")} - {format(new Date(item.plannedEndDate), "dd MMM yyyy")}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Actual</p>
                                      <p className="font-medium">
                                        {item.actualStartDate ? format(new Date(item.actualStartDate), "dd MMM yyyy") : "Not started"} 
                                        {item.actualEndDate && ` - ${format(new Date(item.actualEndDate), "dd MMM yyyy")}`}
                                      </p>
                                    </div>
                                  </div>


                                  {item.status === "In Progress" && (
                                    <div className="mt-2">
                                      <div className="flex items-center gap-2">
                                        <Progress value={item.progress} className="h-1.5 flex-1" />
                                        <span className="text-[10px] font-medium">{item.progress}%</span>
                                      </div>
                                    </div>
                                  )}


                                  {isDelayed && (
                                    <div className="mt-2 p-2 bg-red-500/10 rounded-lg">
                                      <p className="text-[10px] text-red-500">
                                        Delayed by {Math.ceil((new Date().getTime() - new Date(item.plannedEndDate).getTime()) / (1000 * 60 * 60 * 24))} days
                                      </p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No plan items yet</p>
                          <Button variant="link" onClick={() => handleAddPlanItem(selectedProject.id)} className="mt-2">
                            Add your first plan item
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">Select a project or create a new one</p>
              </CardContent>
            )}
          </Card>
        </div>
      )}


      {/* Project Dialog */}
      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProject?.id ? "Edit Project" : "New Project"}</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Project Name *</label>
                <Input 
                  value={editingProject.name || ""} 
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  placeholder="e.g., BMP Program"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium">Department</label>
                <Input 
                  value={editingProject.department || ""} 
                  onChange={(e) => setEditingProject({ ...editingProject, department: e.target.value })}
                  placeholder="e.g., Engineering, Marketing, Operations"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium">Description</label>
                <Textarea 
                  value={editingProject.description || ""} 
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  rows={2}
                  placeholder="Project description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Start Date</label>
                  <Input 
                    type="date" 
                    value={editingProject.startDate || ""} 
                    onChange={(e) => setEditingProject({ ...editingProject, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">End Date</label>
                  <Input 
                    type="date" 
                    value={editingProject.endDate || ""} 
                    onChange={(e) => setEditingProject({ ...editingProject, endDate: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Status</label>
                  <Select 
                    value={editingProject.status || "Active"} 
                    onValueChange={(v: any) => setEditingProject({ ...editingProject, status: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-medium">Initial Progress %</label>
                  <Input 
                    type="number" 
                    min="0" 
                    max="100"
                    value={editingProject.progress || 0} 
                    onChange={(e) => setEditingProject({ ...editingProject, progress: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setProjectDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveProject}>{editingProject.id ? "Update" : "Create"}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>


      {/* Plan Item Dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isNewPlanItem ? `Add Plan Item to ${selectedProject?.name}` : "Edit Plan Item"}
            </DialogTitle>
          </DialogHeader>
          {editingPlanItem && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Title *</label>
                <Input 
                  value={editingPlanItem.title || ""} 
                  onChange={(e) => setEditingPlanItem({ ...editingPlanItem, title: e.target.value })}
                  placeholder="e.g., Core Module Development"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium">Description</label>
                <Textarea 
                  value={editingPlanItem.description || ""} 
                  onChange={(e) => setEditingPlanItem({ ...editingPlanItem, description: e.target.value })}
                  rows={2}
                  placeholder="What needs to be done in this phase?"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Planned Start Date</label>
                  <Input 
                    type="date" 
                    value={editingPlanItem.plannedStartDate || ""} 
                    onChange={(e) => setEditingPlanItem({ ...editingPlanItem, plannedStartDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Planned End Date *</label>
                  <Input 
                    type="date" 
                    value={editingPlanItem.plannedEndDate || ""} 
                    onChange={(e) => setEditingPlanItem({ ...editingPlanItem, plannedEndDate: e.target.value })}
                  />
                </div>
              </div>


              {!isNewPlanItem && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Actual Start Date</label>
                      <Input 
                        type="date" 
                        value={editingPlanItem.actualStartDate || ""} 
                        onChange={(e) => setEditingPlanItem({ ...editingPlanItem, actualStartDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Actual End Date</label>
                      <Input 
                        type="date" 
                        value={editingPlanItem.actualEndDate || ""} 
                        onChange={(e) => setEditingPlanItem({ ...editingPlanItem, actualEndDate: e.target.value })}
                      />
                    </div>
                  </div>


                  <div className="space-y-1">
                    <label className="text-xs font-medium">Status</label>
                    <Select 
                      value={editingPlanItem.status || "Not Started"} 
                      onValueChange={(v: any) => setEditingPlanItem({ ...editingPlanItem, status: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>


                  <div className="space-y-1">
                    <label className="text-xs font-medium">Progress: {editingPlanItem.progress || 0}%</label>
                    <Input 
                      type="range" 
                      min="0" 
                      max="100"
                      value={editingPlanItem.progress || 0} 
                      onChange={(e) => setEditingPlanItem({ ...editingPlanItem, progress: parseInt(e.target.value) || 0 })}
                      className="w-full"
                    />
                  </div>
                </>
              )}
              
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSavePlanItem}>
                  {isNewPlanItem ? "Add to Plan" : "Update"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {projectToShare && (
        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          project={projectToShare}
        />
      )}
    </div>
  );
}
