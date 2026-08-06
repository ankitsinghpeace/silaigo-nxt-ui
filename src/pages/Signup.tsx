"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Lock, AtSign, User, Phone, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { MetaTagsProvider } from "@/components/MetaTagsProvider";
import { useRouter } from "@/lib/next-router-compat";

const Signup = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    phone: "",
    password: "",
  });
  const navigate = useRouter();
  const router = navigate;
  const { toast } = useToast();
  const { isLoading, ...authRest } = useAuth() as any;
  const signup = authRest.signup;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { success, message } = await signup(credentials);
      if (success) {
        toast({
          title: "Account created successfully",
          description: message,
          variant: "default",
        });
        router.push("/login");
      } else {
        toast({
          title: "Signup failed",
          description: message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Signup error",
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
          <p className="text-lg font-medium">Creating your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
      <MetaTagsProvider
        title="Sign Up | SilaiGo"
        description="Create a SilaiGo account to start your journey with doorstep tailoring."
        canonicalPath="/signup"
        noindex={true}
      />
      <div className="w-full max-w-md p-8 space-y-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg animate-fade-in hover:shadow-xl transition-all">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-float">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join Silai Go and start your journey
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
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
                value={credentials.email}
                onChange={(e) => {
                  setCredentials({ ...credentials, email: e.target.value });
                }}
              />
            </div>
            <div className="relative">
              <PhoneInput
                value={credentials.phone}
                onChange={(value) => {
                  setCredentials({ ...credentials, phone: value });
                }}
                inputStyle={{
                  width: "95%",
                  height: "40px",
                  border: "none",
                  outline: "none",
                  boxShadow: "none",
                  fontSize: "14px",
                  paddingLeft: "48px",
                }}
                containerStyle={{
                  width: "100%",
                  border: "1px solid #E5E7EB",
                  borderRadius: "0.5rem",
                  transition: "all 0.2s ease",
                }}
                buttonStyle={{
                  border: "none",
                  borderRight: "1px solid #E5E7EB",
                  backgroundColor: "transparent",
                }}
                dropdownStyle={{
                  width: "300px",
                }}
                countryCodeEditable={false}
                preferredCountries={["in"]}
                country="in"
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
                value={credentials.password}
                onChange={(e) => {
                  setCredentials({ ...credentials, password: e.target.value });
                }}
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
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </form>

        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Sign in
            </Link>
          </p>
          <div className="text-xs text-gray-500 p-2 rounded-lg bg-gray-50/80">
            <p>
              By signing up, you agree to our Terms of Service and Privacy
              Policy and Return-Refund Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
