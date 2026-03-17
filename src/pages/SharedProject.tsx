import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Project, ProjectPlanItem } from "@/types";
import { fetchProjects } from "@/lib/firestoreService";
import { format } from "date-fns";
import { Calendar, Target, CheckCircle2, PlayCircle, PauseCircle, XCircle, Lock, AlertCircle } from "lucide-react";

export default function SharedProject() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("share");
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (projectId) {
        console.log("Shared project viewed:", projectId);
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const projects = await fetchProjects();
      const found = projects.find(p => p.id === projectId);
      if (found) {
        setProject(found);
      } else {
        setError("Project not found");
      }
    } catch (err) {
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const getPlanItemStatusIcon = (status: string) => {
    switch(status) {
      case "Completed": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "In Progress": return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case "Delayed": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <PauseCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Project Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The project you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => window.location.href = "/"}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Protected Project
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This project is password protected. Please enter the password to view.
            </p>
            <Input 
              type="password" 
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowPassword(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={() => {
                  // Check password logic here
                  if (password === "share123") {
                    setShowPassword(false);
                  } else {
                    alert("Incorrect password");
                  }
                }}
              >
                View Project
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          <Badge variant="outline" className="text-sm">
            Shared Project View
          </Badge>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Target className="h-4 w-4" />
                Progress
              </div>
              <div className="text-2xl font-bold">{project.progress}%</div>
              <Progress value={project.progress} className="h-2 mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                Timeline
              </div>
              <div className="text-sm font-medium">
                {format(new Date(project.startDate), "dd MMM yyyy")} - {format(new Date(project.endDate), "dd MMM yyyy")}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <CheckCircle2 className="h-4 w-4" />
                Status
              </div>
              <div className="text-sm font-medium">{project.status}</div>
            </CardContent>
          </Card>
        </div>

        {/* Project Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Project Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.plan.length > 0 ? (
              project.plan.sort((a, b) => a.order - b.order).map((item) => (
                <Card key={item.id} className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Phase {item.order + 1}</Badge>
                          <h4 className="font-medium">{item.title}</h4>
                          <div className="flex items-center gap-1">
                            {getPlanItemStatusIcon(item.status)}
                            <span className="text-xs">{item.status}</span>
                          </div>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Planned</p>
                        <p>
                          {format(new Date(item.plannedStartDate), "dd MMM yyyy")} - {format(new Date(item.plannedEndDate), "dd MMM yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Actual</p>
                        <p>
                          {item.actualStartDate ? format(new Date(item.actualStartDate), "dd MMM yyyy") : "Not started"}
                          {item.actualEndDate && ` - ${format(new Date(item.actualEndDate), "dd MMM yyyy")}`}
                        </p>
                      </div>
                    </div>

                    {item.status === "In Progress" && (
                      <div className="mt-2">
                        <Progress value={item.progress} className="h-1.5" />
                        <p className="text-xs text-right mt-1">{item.progress}% complete</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No plan items yet</p>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground border-t pt-4">
          <p>Shared via ExecFlow Project Tracker</p>
        </div>
      </div>
    </div>
  );
}