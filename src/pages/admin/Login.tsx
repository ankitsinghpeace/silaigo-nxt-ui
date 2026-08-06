"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Lock, AtSign, Info, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useAuth } from "@/contexts/AuthContext";
import { login } from "@/services/auth.api";
import { useRouter } from "@/lib/next-router-compat";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useRouter();
  const router = navigate;
  const { toast } = useToast();
  const { adminLogin, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/admin/dashboard");
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const success = await adminLogin(email, password);

      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome to Silai Go Admin Panel",
          variant: "default",
        });
        router.push("/admin/dashboard");
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="absolute top-4 right-4">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8 bg-white/50 backdrop-blur-sm hover:bg-white/80"
            >
              <Info className="h-4 w-4 text-primary" />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Demo Credentials</h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>
                  <span className="font-medium">Admin:</span> admin@silai.com /
                  admin123
                </p>
                <p>
                  <span className="font-medium">Sales:</span> sales@silai.com /
                  sales123
                </p>
                <p>
                  <span className="font-medium">Marketing:</span>{" "}
                  marketing@silai.com / marketing123
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      <div className="w-full max-w-md p-8 space-y-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg animate-fade-in hover:shadow-xl transition-all">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-float">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Silai Go Admin
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage your website content
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md">
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="pl-10 w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="pl-10 w-full rounded-lg border-gray-200 focus:border-primary focus:ring-primary"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-lg shadow-sm transition-all hover:shadow-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </div>
        </form>

        <div className="text-center text-xs text-gray-500 p-2 rounded-lg bg-gray-50/80">
          <p>This is a demo website. Use the credentials provided.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
