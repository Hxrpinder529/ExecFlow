import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { FollowUp, FollowUpType, FollowUpStatus } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Sparkles } from "lucide-react";
import { formatDateDDMMYYYY, getDaysRemaining } from "@/lib/helpers";

const followUpTypes: FollowUpType[] = ["Call", "Email", "In-Person", "WhatsApp"];
const followUpStatuses: FollowUpStatus[] = ["Pending", "Resolved", "Escalated"];

export default function FollowUpTracker() {
  const { followUps, tasks, addFollowUp, updateFollowUp, deleteFollowUp } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<FollowUp> | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const openNew = () => { setEditing({ taskId: "", followUpDate: today, type: "Call", stakeholder: "", actionItem: "", outcome: "", nextFollowUpDate: "", status: "Pending" }); setDialogOpen(true); };
  const openEdit = (f: FollowUp) => { setEditing({ ...f }); setDialogOpen(true); };

  const handleSave = () => {
    if (!editing?.taskId || !editing?.stakeholder) { toast.error("Task ID and Stakeholder required"); return; }
    if (editing.id) {
      updateFollowUp(editing as FollowUp);
      toast.success("Follow-up updated");
    } else {
      addFollowUp({ ...editing, id: crypto.randomUUID() } as FollowUp);
      toast.success("Follow-up added");
    }
    setDialogOpen(false);
  };

  const updateField = (field: string, value: any) => setEditing((p) => p ? { ...p, [field]: value } : p);

  const getRowHighlight = (f: FollowUp) => {
    if (!f.nextFollowUpDate || f.status === "Resolved") return "";
    if (f.nextFollowUpDate < today) return "bg-destructive/5";
    if (f.nextFollowUpDate === today) return "bg-warning/5";
    return "";
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">Follow-Up Tracker</h1><p className="text-sm text-muted-foreground">{followUps.length} follow-ups</p></div>
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" />Add Follow-Up</Button>
      </div>

      <Card className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead>Stakeholder</TableHead>
              <TableHead className="hidden lg:table-cell">Action Item</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Next Follow-Up</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {followUps.map((f) => (
              <TableRow key={f.id} className={getRowHighlight(f)}>
                <TableCell className="font-mono text-xs">{f.taskId}</TableCell>
                <TableCell className="hidden md:table-cell text-xs">{f.type}</TableCell>
                <TableCell className="text-sm">{f.stakeholder}</TableCell>
                <TableCell className="hidden lg:table-cell text-xs max-w-[200px] truncate">
                  {f.actionItem}
                  {f.actionItem.includes("AI generated") && (
                    <Badge variant="outline" className="ml-2 text-[8px] bg-yellow-500/10 text-yellow-500 flex items-center gap-1">
                      <Sparkles className="h-2 w-2" />AI
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${f.status === "Resolved" ? "bg-success/10 text-success" : f.status === "Escalated" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                    {f.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs">
                  {f.nextFollowUpDate ? formatDateDDMMYYYY(f.nextFollowUpDate) : "—"}
                  {f.nextFollowUpDate && f.nextFollowUpDate <= today && f.status !== "Resolved" && <Badge variant="destructive" className="ml-1 text-[10px]">!</Badge>}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(f)}><Edit className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { deleteFollowUp(f.id); toast.success("Deleted"); }}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {followUps.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No follow-ups yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} Follow-Up</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="space-y-1"><label className="text-xs font-medium">Task *</label>
                <Select value={editing.taskId} onValueChange={(v) => updateField("taskId", v)}><SelectTrigger><SelectValue placeholder="Select task" /></SelectTrigger>
                  <SelectContent>{tasks.map((t) => <SelectItem key={t.taskId} value={t.taskId}>{t.taskId} — {t.title}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><label className="text-xs font-medium">Date</label><Input type="date" value={editing.followUpDate} onChange={(e) => updateField("followUpDate", e.target.value)} /></div>
                <div className="space-y-1"><label className="text-xs font-medium">Type</label>
                  <Select value={editing.type} onValueChange={(v) => updateField("type", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{followUpTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="space-y-1"><label className="text-xs font-medium">Stakeholder *</label><Input value={editing.stakeholder} onChange={(e) => updateField("stakeholder", e.target.value)} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Action Item</label><Textarea value={editing.actionItem} onChange={(e) => updateField("actionItem", e.target.value)} rows={2} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Outcome</label><Textarea value={editing.outcome} onChange={(e) => updateField("outcome", e.target.value)} rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><label className="text-xs font-medium">Next Follow-Up</label><Input type="date" value={editing.nextFollowUpDate} onChange={(e) => updateField("nextFollowUpDate", e.target.value)} /></div>
                <div className="space-y-1"><label className="text-xs font-medium">Status</label>
                  <Select value={editing.status} onValueChange={(v) => updateField("status", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{followUpStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
