import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/hooks/interceptor";
import { Eye, EyeOff } from "lucide-react";
import { changePassword } from "@/services";
import AdminLayout from "@/components/admin/AdminLayout";

const ChangePassword: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirm password do not match",
        variant: "destructive",
      });
      return;
    }

    if (!user?.userId) {
      toast({
        title: "Error",
        description: "User not found",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await changePassword({
        id: String(user?.userId),
        oldPassword,
        newPassword,
      });

      if (res) {
        toast({
          title: "Success",
          description: "Password changed successfully",
        });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        toast({
          title: "Error",
          description: data.message || "Failed to change password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto p-6 bg-card rounded shadow"
      >
        <h2 className="text-xl font-bold mb-6">Change Password</h2>

        {/* Old Password */}
        <div className="mb-4 relative">
          <label htmlFor="oldPassword" className="block mb-1 font-medium">
            Old Password
          </label>
          <input
            id="oldPassword"
            type={showOld ? "text" : "password"}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            className="w-full p-2 border rounded"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowOld(!showOld)}
            className="absolute top-8 right-3 text-gray-500"
            tabIndex={-1}
          >
            {showOld ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* New Password */}
        <div className="mb-4 relative">
          <label htmlFor="newPassword" className="block mb-1 font-medium">
            New Password
          </label>
          <input
            id="newPassword"
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full p-2 border rounded"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute top-8 right-3 text-gray-500"
            tabIndex={-1}
          >
            {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="mb-6 relative">
          <label htmlFor="confirmPassword" className="block mb-1 font-medium">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-2 border rounded"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute top-8 right-3 text-gray-500"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Changing..." : "Change Password"}
        </Button>
      </form>
    </AdminLayout>
  );
};

export default ChangePassword;
