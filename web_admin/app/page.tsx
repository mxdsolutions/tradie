"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Wrench, FileCheck, Users } from "lucide-react";
import { signIn, resetPassword } from "@/app/actions/auth";
import { toast } from "sonner";

function AuthContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await signIn(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setEmailError(true);
      toast.error("Please enter your email address to reset your password.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      const result = await resetPassword(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Password reset email sent! Please check your inbox.");
      }
    } catch (err: any) {
      toast.error("Failed to send reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-8 cursor-default bg-white rounded-xl p-2 shadow-sm">
              <Image src="/logo-white-bg.png" alt="TRADIE" width={240} height={72} priority className="h-16 w-auto object-contain" />
            </div>
            <h2 className="text-3xl font-bold mb-2">
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <div className="space-y-4">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">Email</label>
                <Input
                  id="email"
                  name="email"
                  placeholder="m@example.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (e.target.value) setEmailError(false);
                  }}
                  className={emailError ? "border-red-500 ring-red-500 focus-visible:ring-red-500" : ""}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">Password</label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input id="password" name="password" type="password" required />
              </div>

              <Button className="w-full h-11 text-base group" type="submit" disabled={isLoading}>
                {isLoading ? "Processing..." : "Sign In"}
                {!isLoading && <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />}
              </Button>
            </form>
          </div>

          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              Access to this platform is currently by invite only.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - TRADIE */}
      <div className="hidden lg:flex flex-1 bg-secondary/30 relative items-center justify-center p-12 overflow-hidden bg-slate-50 dark:bg-slate-900 border-l border-border/50">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,hsl(var(--primary)/0.06),transparent_50%)] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0))]" />

        <div className="relative z-10 max-w-lg space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="px-3 py-1 font-medium">
              Admin
            </Badge>
            <h3 className="text-4xl font-bold leading-tight text-slate-900 dark:text-white">
              Manage jobs, tradies<br />and customers.
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              The TRADIE admin dashboard lets you oversee quotes, projects and users so your platform runs smoothly.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              { icon: Wrench, label: "Jobs & quotes" },
              { icon: FileCheck, label: "Projects & content" },
              { icon: Users, label: "Tradies & customers" },
            ].map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
              </div>
            ))}
          </div>

          <div className="absolute -top-24 -right-24 w-64 h-64 bg-slate-300/20 dark:bg-slate-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-slate-400/10 dark:bg-slate-500/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground animate-pulse">Loading authentication...</div>}>
      <AuthContent />
    </Suspense>
  );
}

