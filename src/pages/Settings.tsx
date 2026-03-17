import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { ColorPicker } from "@/components/ColorPicker";
import { User, UserRole, UserPermissions, defaultPermissions } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Moon, Sun, User as UserIcon, Shield, Users, Plus, Edit, Trash2, UserCheck, UserX, Palette, Eye } from "lucide-react";

const permissionLabels: { key: keyof UserPermissions; label: string }[] = [
  { key: "canCreateTasks", label: "Create Tasks" },
  { key: "canEditTasks", label: "Edit Tasks" },
  { key: "canDeleteTasks", label: "Delete Tasks" },
  { key: "canViewDashboard", label: "View Dashboard" },
  { key: "canManageFollowUps", label: "Manage Follow-Ups" },
  { key: "canManageTimeline", label: "Manage Timeline" },
  { key: "canGenerateReports", label: "Generate Reports" },
  { key: "canManageUsers", label: "Manage Users" },
];

const roles: UserRole[] = ["Admin", "Manager", "Implementor"];

export default function SettingsPage() {
  const { user, users, theme, setTheme, accentColor, setAccentColor, addUser, updateUser, deleteUser, toggleUserActive, updateUserPermissions, updateUserRole } = useApp();
  const isAdmin = user?.role === "Admin";

  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [permDialogOpen, setPermDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User & { password: string }> | null>(null);
  const [permUser, setPermUser] = useState<User | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const openNewUser = () => {
    setEditingUser({ name: "", email: "", role: "Implementor", password: "", isActive: true, permissions: defaultPermissions.Implementor });
    setUserDialogOpen(true);
  };

  const openEditUser = (u: User) => {
    setEditingUser({ ...u, password: "" });
    setUserDialogOpen(true);
  };

  const openPermissions = (u: User) => {
    setPermUser({ ...u });
    setPermDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!editingUser?.name || !editingUser?.email) { toast.error("Name and email required"); return; }
    if (editingUser.id) {
      updateUser({ id: editingUser.id, name: editingUser.name, email: editingUser.email, role: editingUser.role!, isActive: editingUser.isActive!, permissions: editingUser.permissions!, avatar: editingUser.avatar });
      toast.success("User updated");
    } else {
      if (!editingUser.password) { toast.error("Password required for new user"); return; }
      if (users.find((u) => u.email === editingUser.email)) { toast.error("Email already exists"); return; }
      const newUser: User = { id: crypto.randomUUID(), name: editingUser.name, email: editingUser.email, role: editingUser.role!, isActive: true, permissions: defaultPermissions[editingUser.role!] };
      addUser(newUser, editingUser.password);
      toast.success("User created");
    }
    setUserDialogOpen(false);
  };

  const handleSavePermissions = () => {
    if (permUser) {
      updateUserPermissions(permUser.id, permUser.permissions);
      toast.success(`Permissions updated for ${permUser.name}`);
      setPermDialogOpen(false);
    }
  };

  const handleRoleChange = (userId: string, role: UserRole) => {
    updateUserRole(userId, role);
    toast.success("Role updated — permissions reset to defaults");
  };

  const handleDeleteUser = (u: User) => {
    if (u.id === user?.id) { toast.error("Cannot delete yourself"); return; }
    deleteUser(u.id);
    toast.success("User deleted");
  };

  const handleToggleActive = (u: User) => {
    if (u.id === user?.id) { toast.error("Cannot deactivate yourself"); return; }
    toggleUserActive(u.id);
    toast.success(u.isActive ? "User deactivated" : "User activated");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <Card className="glass-card max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserIcon className="h-4 w-4" />Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div 
              className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground"
              style={{ backgroundColor: `hsl(${accentColor})` }}
            >
              {user?.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge 
                variant="outline" 
                className="mt-1"
                style={{ 
                  backgroundColor: `hsl(${accentColor} / 0.1)`,
                  borderColor: `hsl(${accentColor} / 0.3)`,
                  color: `hsl(${accentColor})`
                }}
              >
                {user?.role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="glass-card max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="text-sm">Dark Mode</span>
            </div>
            <Switch 
              checked={theme === "dark"} 
              onCheckedChange={(c) => { 
                setTheme(c ? "dark" : "light"); 
                toast.success(`Switched to ${c ? "dark" : "light"} mode`); 
              }} 
            />
          </div>

          {/* Accent Color Picker */}
          <Separator />
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="text-sm font-medium">Accent Color</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
            </div>
            
            <ColorPicker color={accentColor} onChange={setAccentColor} />

            {/* Live Preview */}
            {showPreview && (
              <div className="mt-4 p-4 rounded-lg border space-y-3">
                <p className="text-xs font-medium">Live Preview</p>
                <div className="flex items-center gap-2">
                  <Button size="sm" style={{ backgroundColor: `hsl(${accentColor})` }}>
                    Primary Button
                  </Button>
                  <Button size="sm" variant="outline" style={{ borderColor: `hsl(${accentColor})`, color: `hsl(${accentColor})` }}>
                    Outline Button
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Badge style={{ backgroundColor: `hsl(${accentColor} / 0.1)`, color: `hsl(${accentColor})`, borderColor: `hsl(${accentColor} / 0.3)` }}>
                    Accent Badge
                  </Badge>
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${accentColor})` }} />
                  <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: `hsl(${accentColor} / 0.3)` }}>
                    <div className="h-1 rounded-full w-3/4" style={{ backgroundColor: `hsl(${accentColor})` }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Admin: User Management */}
      {isAdmin && (
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />User Management
              </CardTitle>
              <Button size="sm" onClick={openNewUser}>
                <Plus className="h-4 w-4 mr-1" />Add User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground"
                          style={{ backgroundColor: `hsl(${u.accentColor || accentColor})` }}
                        >
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select value={u.role} onValueChange={(v) => handleRoleChange(u.id, v as UserRole)}>
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={u.isActive ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openPermissions(u)} title="Permissions">
                          <Shield className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleToggleActive(u)} title={u.isActive ? "Deactivate" : "Activate"}>
                          {u.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditUser(u)} title="Edit">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteUser(u)} title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Admin: Role Defaults */}
      {isAdmin && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />Default Role Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission</TableHead>
                    {roles.map((r) => <TableHead key={r} className="text-center">{r}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissionLabels.map((p) => (
                    <TableRow key={p.key}>
                      <TableCell className="text-sm">{p.label}</TableCell>
                      {roles.map((r) => (
                        <TableCell key={r} className="text-center">
                          {defaultPermissions[r][p.key] ? 
                            <Badge 
                              className="text-[10px]" 
                              variant="outline"
                              style={{ 
                                backgroundColor: `hsl(${accentColor} / 0.1)`,
                                borderColor: `hsl(${accentColor} / 0.3)`,
                                color: `hsl(${accentColor})`
                              }}
                            >
                              ✓
                            </Badge> : 
                            <Badge className="bg-muted text-muted-foreground text-[10px]" variant="outline">✗</Badge>
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keyboard Shortcuts */}
      <Card className="glass-card max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Keyboard Shortcuts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>New Task</span>
            <kbd className="px-2 py-0.5 rounded bg-muted text-xs">Ctrl + N</kbd>
          </div>
          <div className="flex justify-between">
            <span>Search</span>
            <kbd className="px-2 py-0.5 rounded bg-muted text-xs">Ctrl + F</kbd>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser?.id ? "Edit User" : "Add New User"}</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Name *</label>
                <Input value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Email *</label>
                <Input type="email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} disabled={!!editingUser.id} />
              </div>
              {!editingUser.id && 
                <div className="space-y-1">
                  <label className="text-xs font-medium">Password *</label>
                  <Input type="password" value={editingUser.password} onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })} />
                </div>
              }
              <div className="space-y-1">
                <label className="text-xs font-medium">Role</label>
                <Select value={editingUser.role} onValueChange={(v) => setEditingUser({ ...editingUser, role: v as UserRole, permissions: defaultPermissions[v as UserRole] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setUserDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveUser}>{editingUser.id ? "Update" : "Create"}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={permDialogOpen} onOpenChange={setPermDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Permissions — {permUser?.name}</DialogTitle>
          </DialogHeader>
          {permUser && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Toggle individual permissions for this user. These override role defaults.</p>
              {permissionLabels.map((p) => (
                <div key={p.key} className="flex items-center justify-between py-1">
                  <span className="text-sm">{p.label}</span>
                  <Switch 
                    checked={permUser.permissions[p.key]} 
                    onCheckedChange={(c) => setPermUser({ ...permUser, permissions: { ...permUser.permissions, [p.key]: c } })}
                    style={{
                      backgroundColor: permUser.permissions[p.key] ? `hsl(${accentColor})` : undefined
                    }}
                  />
                </div>
              ))}
              <Separator />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPermDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSavePermissions}>Save Permissions</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}