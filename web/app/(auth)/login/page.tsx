"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/hooks/use-auth";
import { Mail, Lock, ArrowRight } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data);
    } catch (error) {
      // Error handled by useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Welcome back</h1>
        <p className="text-sm text-neutral-600">Sign in to your account to continue</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className="bg-neutral-50 border-neutral-200 h-11"
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="bg-neutral-50 border-neutral-200 h-11"
            />
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign in
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </div>

      {/* Sign Up Link */}
      <p className="text-sm text-center text-neutral-600 mt-6">
        Don't have an account?{" "}
        <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
}
