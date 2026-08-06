"use client";
import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import {
  getRoles,
  getTeamMembers,
  createTeamMember,
  removeTeamMember,
  updateTeamMember,
} from "@/services/auth.api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserCog, Plus, Loader2, Trash, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateErrorMessage } from "@/lib/helpers";
import { PermissionSubType, PermissionType } from "@/types/enums";
import { useAuth } from "@/contexts/AuthContext";

const UserManagementPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const canCreate = user?.permissions?.includes(
    `${PermissionType.ROLES}.${PermissionSubType.CREATE}`,
  );
  const canView = user?.permissions?.includes(
    `${PermissionType.ROLES}.${PermissionSubType.VIEW}`,
  );
  const canDelete = user?.permissions?.includes(
    `${PermissionType.ROLES}.${PermissionSubType.DELETE}`,
  );
  const canEdit = user?.permissions?.includes(
    `${PermissionType.ROLES}.${PermissionSubType.EDIT}`,
  );

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    designation: "",
    role: "none",
    joiningDate: "",
  });

  const [editUser, setEditUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    designation: "",
    role: "none",
    joiningDate: "",
  });

  const {
    data: users,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => {
      if (!canView) return Promise.reject(new Error("No permission"));
      return getTeamMembers();
    },
  });

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => {
      if (!canView) return Promise.reject(new Error("No permission"));
      return getRoles();
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  const handleCreateTeamMember = async () => {
    if (!canCreate) return;
    if (
      !newUser.firstName ||
      !newUser.lastName ||
      !newUser.email ||
      !newUser.password ||
      !newUser.designation ||
      !newUser.joiningDate
    ) {
      toast({
        title: "Validation Error",
        description: "All fields required",
        variant: "destructive",
      });
      return;
    }
    setIsCreating(true);
    try {
      await createTeamMember(newUser);
      toast({ title: "Success", description: "User created" });
      setIsCreateDialogOpen(false);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        designation: "",
        role: "none",
        joiningDate: "",
      });
      refetch();
    } catch (e) {
      toast({
        title: "Error",
        description: generateErrorMessage(e),
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const openEditDialog = (u: any) => {
    if (!canEdit) return;
    setEditingUserId(u.userId);
    setEditUser({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      password: "",
      designation: u.designation,
      role: u.roleId || u.role,
      joiningDate: u.joiningDate?.split("T")[0],
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateTeamMember = async () => {
    if (!canEdit || !editingUserId) return;
    if (
      !editUser.firstName ||
      !editUser.lastName ||
      !editUser.email ||
      !editUser.designation ||
      !editUser.joiningDate
    ) {
      toast({
        title: "Validation Error",
        description: "All fields required",
        variant: "destructive",
      });
      return;
    }
    setIsUpdating(true);
    try {
      const payload: any = {
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        email: editUser.email,
        designation: editUser.designation,
        role: editUser.role,
        joiningDate: editUser.joiningDate,
      };
      if (editUser.password) payload.password = editUser.password;
      await updateTeamMember(editingUserId, payload);
      toast({ title: "Success", description: "User updated" });
      setIsEditDialogOpen(false);
      setEditingUserId(null);
      refetch();
    } catch (e) {
      toast({
        title: "Error",
        description: generateErrorMessage(e),
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveTeamMember = async (id: string) => {
    if (!canDelete) return;
    try {
      await removeTeamMember(id);
      toast({ title: "Success", description: "User removed" });
      refetch();
    } catch (e) {
      toast({
        title: "Error",
        description: generateErrorMessage(e),
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCog className="h-6 w-6" /> User Management
          </h1>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button disabled={!canCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add User</DialogTitle>
                <DialogDescription>Create admin user</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="First Name"
                  value={newUser.firstName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, firstName: e.target.value })
                  }
                />
                <Input
                  placeholder="Last Name"
                  value={newUser.lastName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, lastName: e.target.value })
                  }
                />
                <Input
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
                <Input
                  placeholder="Password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                />
                <Input
                  placeholder="Designation"
                  value={newUser.designation}
                  onChange={(e) =>
                    setNewUser({ ...newUser, designation: e.target.value })
                  }
                />
                <Input
                  type="date"
                  value={newUser.joiningDate}
                  onChange={(e) =>
                    setNewUser({ ...newUser, joiningDate: e.target.value })
                  }
                />
                <Select
                  value={newUser.role}
                  onValueChange={(v) => setNewUser({ ...newUser, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles?.map((r: any) => (
                      <SelectItem key={r._id} value={r._id}>
                        {r.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateTeamMember} disabled={isCreating}>
                  {isCreating ? <Loader2 className="animate-spin" /> : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : error ? null : (
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>Admin users</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((u: any, i: number) => (
                    <TableRow key={u.userId}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>
                        {u.firstName} {u.lastName}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={!canEdit}
                          onClick={() => openEditDialog(u)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={!canDelete}
                          onClick={() => handleRemoveTeamMember(u.userId)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <Input
                value={editUser.firstName}
                onChange={(e) =>
                  setEditUser({ ...editUser, firstName: e.target.value })
                }
              />
              <Input
                value={editUser.lastName}
                onChange={(e) =>
                  setEditUser({ ...editUser, lastName: e.target.value })
                }
              />
              <Input
                value={editUser.email}
                onChange={(e) =>
                  setEditUser({ ...editUser, email: e.target.value })
                }
              />
              <Input
                type="password"
                placeholder="Password"
                value={editUser.password}
                onChange={(e) =>
                  setEditUser({ ...editUser, password: e.target.value })
                }
              />
              <Input
                value={editUser.designation}
                onChange={(e) =>
                  setEditUser({ ...editUser, designation: e.target.value })
                }
              />
              <Input
                type="date"
                value={editUser.joiningDate}
                onChange={(e) =>
                  setEditUser({ ...editUser, joiningDate: e.target.value })
                }
              />
              <Select
                value={editUser.role}
                onValueChange={(v) => setEditUser({ ...editUser, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((r: any) => (
                    <SelectItem key={r._id} value={r.code}>
                      {r.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateTeamMember} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="animate-spin" /> : "Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default UserManagementPage;
