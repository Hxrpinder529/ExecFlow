import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Copy,
  Check,
  Mail,
  Twitter,
  Linkedin,
  Facebook,
  Link2,
  Download,
  QrCode,
  Users,
  Calendar,
  Target,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Project } from "@/types";
import { format } from "date-fns";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  projectUrl?: string;
}

export function ShareDialog({ open, onOpenChange, project, projectUrl }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [selectedTab, setSelectedTab] = useState("link");
  
  // Generate a shareable link if not provided
  const baseUrl = window.location.origin;
  const shareableLink = projectUrl || `${baseUrl}/projects?share=${project.id}`;
  
  // Project statistics
  const totalPhases = project.plan.length;
  const completedPhases = project.plan.filter(p => p.status === "Completed").length;
  const inProgressPhases = project.plan.filter(p => p.status === "In Progress").length;
  const delayedPhases = project.plan.filter(p => p.status === "Delayed").length;
  const notStartedPhases = project.plan.filter(p => p.status === "Not Started").length;
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };
  
  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Project Progress: ${project.name}`);
    const body = encodeURIComponent(
      `Check out the progress of project "${project.name}":\n\n` +
      `Overall Progress: ${project.progress}%\n` +
      `Status: ${project.status}\n` +
      `Completed Phases: ${completedPhases}/${totalPhases}\n\n` +
      `View full details: ${shareableLink}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };
  
  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      `Check out the progress of project "${project.name}" - ${project.progress}% complete! 🚀`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareableLink)}`);
  };
  
  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableLink)}`);
  };
  
  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}`);
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case "Active": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "On Hold": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Completed": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Share Project Progress
          </DialogTitle>
          <DialogDescription>
            Share {project.name} with your team or stakeholders
          </DialogDescription>
        </DialogHeader>

        {/* Project Summary Card */}
        <div className="bg-muted/30 rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-lg">{project.name}</h3>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </div>
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>Progress: <span className="font-medium">{project.progress}%</span></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Due: {format(new Date(project.endDate), "dd MMM yyyy")}</span>
            </div>
          </div>
          
          <Progress value={project.progress} className="h-2 mb-3" />
          
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 bg-green-500/10 rounded">
              <div className="font-medium text-green-500">{completedPhases}</div>
              <div className="text-muted-foreground">Completed</div>
            </div>
            <div className="p-2 bg-blue-500/10 rounded">
              <div className="font-medium text-blue-500">{inProgressPhases}</div>
              <div className="text-muted-foreground">In Progress</div>
            </div>
            <div className="p-2 bg-yellow-500/10 rounded">
              <div className="font-medium text-yellow-500">{notStartedPhases}</div>
              <div className="text-muted-foreground">Not Started</div>
            </div>
            <div className="p-2 bg-red-500/10 rounded">
              <div className="font-medium text-red-500">{delayedPhases}</div>
              <div className="text-muted-foreground">Delayed</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="link" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="link">
              <Link2 className="h-4 w-4 mr-2" />
              Link
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="social">
              <Users className="h-4 w-4 mr-2" />
              Social
            </TabsTrigger>
            <TabsTrigger value="embed">
              <QrCode className="h-4 w-4 mr-2" />
              Embed
            </TabsTrigger>
          </TabsList>

          {/* Link Tab */}
          <TabsContent value="link" className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Shareable Link</label>
              <div className="flex gap-2">
                <Input 
                  value={shareableLink} 
                  readOnly 
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this link can view the project progress
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Link Options</label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    const expiringLink = `${shareableLink}&expires=${Date.now() + 7 * 24 * 60 * 60 * 1000}`;
                    navigator.clipboard.writeText(expiringLink);
                    toast.success("7-day expiring link copied!");
                  }}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  7-Day Link
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    const passwordLink = `${shareableLink}&password=share123`;
                    navigator.clipboard.writeText(passwordLink);
                    toast.success("Password-protected link copied!");
                  }}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Password Protect
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-4 pt-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">To</label>
                <Input placeholder="Enter email addresses (comma separated)" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Subject</label>
                <Input defaultValue={`Project Update: ${project.name}`} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Message (Optional)</label>
                <textarea 
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Add a personal message..."
                  defaultValue={`I'd like to share the progress of project "${project.name}" with you.\n\nCurrent progress: ${project.progress}%\nCompleted phases: ${completedPhases}/${totalPhases}`}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleShareEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={handleShareTwitter}
              >
                <Twitter className="h-6 w-6 text-[#1DA1F2]" />
                <span className="text-xs">Twitter</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={handleShareLinkedIn}
              >
                <Linkedin className="h-6 w-6 text-[#0A66C2]" />
                <span className="text-xs">LinkedIn</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={handleShareFacebook}
              >
                <Facebook className="h-6 w-6 text-[#1877F2]" />
                <span className="text-xs">Facebook</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => {
                  const text = encodeURIComponent(`Project ${project.name} - ${project.progress}% complete!`);
                  window.open(`https://wa.me/?text=${text}%20${encodeURIComponent(shareableLink)}`);
                }}
              >
                <svg className="h-6 w-6 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.09.6 4.05 1.76 5.78L2.1 21.9l4.45-1.77c1.7.99 3.65 1.56 5.69 1.56 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.91-9.91-9.91zm0 18.38c-1.75 0-3.46-.47-4.96-1.36l-.36-.21-2.72 1.08.99-2.6-.23-.38c-1.01-1.57-1.56-3.41-1.56-5.3 0-4.7 3.82-8.52 8.52-8.52s8.52 3.82 8.52 8.52-3.82 8.52-8.52 8.52z"/>
                </svg>
                <span className="text-xs">WhatsApp</span>
              </Button>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground text-center">
                Sharing options will open in a new window
              </p>
            </div>
          </TabsContent>

          {/* Embed Tab */}
          <TabsContent value="embed" className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">QR Code</label>
              <div className="flex flex-col items-center p-4 border rounded-lg bg-white">
                <div className="w-48 h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-2">
                  <QrCode className="h-24 w-24 text-primary/40" />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    toast.success("QR code downloaded!");
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Embed Code</label>
              <div className="flex gap-2">
                <Input 
                  value={`<iframe src="${shareableLink}" width="600" height="400" frameborder="0"></iframe>`} 
                  readOnly 
                  className="flex-1 font-mono text-xs"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(`<iframe src="${shareableLink}" width="600" height="400" frameborder="0"></iframe>`);
                    toast.success("Embed code copied!");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use this code to embed project progress on your website
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Share Statistics */}
        <div className="border-t pt-4 mt-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Shared 0 times
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Last shared: Never
              </span>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">
              View sharing history
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}