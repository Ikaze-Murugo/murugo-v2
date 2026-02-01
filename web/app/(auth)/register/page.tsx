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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/use-auth";
import { UserRole, ProfileType } from "@/lib/types";
import { Search, Building2 } from "lucide-react";

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
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Sign up to start listing or finding properties
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Role selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              I want to
            </label>
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
                      flex flex-col items-start p-4 rounded-lg border-2 text-left transition-colors
                      ${
                        isSelected
                          ? "border-[#949DDB] bg-[#949DDB] text-white"
                          : "border-muted hover:border-muted-foreground/50"
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 mb-2 ${isSelected ? "text-white" : "text-primary"}`} />
                    <span className="font-medium">{opt.label}</span>
                    <span className={`text-xs mt-1 ${isSelected ? "text-white/90" : "text-muted-foreground"}`}>
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
            <input type="hidden" {...register("role")} />
            {errors.role && (
              <p className="text-sm text-destructive mt-1">{errors.role.message}</p>
            )}
          </div>

          {/* Lister type (only when role = lister) */}
          {isLister && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Lister type
              </label>
              <select
                {...register("profileType")}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                {PROFILE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.profileType && (
                <p className="text-sm text-destructive mt-1">
                  {errors.profileType.message}
                </p>
              )}
            </div>
          )}

          <Input
            label="Full name"
            type="text"
            placeholder="Your name or company name"
            error={errors.name?.message}
            {...register("name")}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+250 788 123 456"
            error={errors.phone?.message}
            {...register("phone")}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
            required
          />
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <Button type="submit" className="w-full" loading={isLoading}>
            Create account
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardContent className="flex items-center justify-center min-h-[400px]">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          </CardContent>
        </Card>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
