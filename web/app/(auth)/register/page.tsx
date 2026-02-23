"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/hooks/use-auth";
import { UserRole, ProfileType } from "@/lib/types";
import { Search, Building2, User, Mail, Phone, Lock, ArrowRight } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum([UserRole.SEEKER, UserRole.LISTER]),
    profileType: z
      .enum([
        ProfileType.INDIVIDUAL,
        ProfileType.COMMISSIONER,
        ProfileType.COMPANY,
      ])
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === UserRole.LISTER) return !!data.profileType;
      return true;
    },
    { message: "Please select how you list properties", path: ["profileType"] }
  );

type RegisterFormData = z.infer<typeof registerSchema>;

const ROLE_OPTIONS = [
  {
    value: UserRole.SEEKER,
    label: "I'm looking for a property",
    description: "Browse, save favorites, and contact listers",
    icon: Search,
  },
  {
    value: UserRole.LISTER,
    label: "I want to list properties",
    description: "Create listings and reach buyers or renters",
    icon: Building2,
  },
] as const;

const PROFILE_TYPE_OPTIONS = [
  { value: ProfileType.INDIVIDUAL, label: "Individual Owner" },
  { value: ProfileType.COMMISSIONER, label: "Commissioner / Agent" },
  { value: ProfileType.COMPANY, label: "Real Estate Company" },
] as const;

function RegisterForm() {
  const searchParams = useSearchParams();
  const roleFromUrl = searchParams.get("role");
  const defaultRole =
    roleFromUrl === UserRole.LISTER || roleFromUrl === UserRole.SEEKER
      ? roleFromUrl
      : UserRole.SEEKER;

  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: defaultRole,
      profileType: ProfileType.INDIVIDUAL,
    },
  });

  const selectedRole = watch("role");
  const isLister = selectedRole === UserRole.LISTER;

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser({
        email: data.email,
        phone: data.phone,
        password: data.password,
        name: data.name,
        role: data.role,
        profileType: isLister ? data.profileType : undefined,
      });
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
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Create an account</h1>
        <p className="text-sm text-neutral-600">Sign up to start listing or finding properties</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Role selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">I want to</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedRole === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue("role", opt.value)}
                    className={`
                      flex flex-col items-start p-4 rounded-lg border-2 text-left transition-all
                      ${
                        isSelected
                          ? "border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-sm"
                          : "border-neutral-200 hover:border-neutral-300"
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 mb-2 ${isSelected ? "text-primary" : "text-neutral-400"}`} />
                    <span className={`font-medium text-sm ${isSelected ? "text-neutral-900" : "text-neutral-700"}`}>
                      {opt.label}
                    </span>
                    <span className="text-xs mt-1 text-neutral-500">
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
            <input type="hidden" {...register("role")} />
            {errors.role && (
              <p className="text-xs text-red-600">{errors.role.message}</p>
            )}
          </div>

          {/* Lister type (only when role = lister) */}
          {isLister && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Lister type</label>
              <select
                {...register("profileType")}
                className="w-full px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {PROFILE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.profileType && (
                <p className="text-xs text-red-600">{errors.profileType.message}</p>
              )}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </label>
            <Input
              type="text"
              placeholder="Your name or company name"
              {...register("name")}
              className="bg-neutral-50 border-neutral-200 h-11"
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

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

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </label>
            <Input
              type="tel"
              placeholder="+250 788 123 456"
              {...register("phone")}
              className="bg-neutral-50 border-neutral-200 h-11"
            />
            {errors.phone && (
              <p className="text-xs text-red-600">{errors.phone.message}</p>
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

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Confirm Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              className="bg-neutral-50 border-neutral-200 h-11"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium mt-6"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Create account
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </div>

      {/* Sign In Link */}
      <p className="text-sm text-center text-neutral-600 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
