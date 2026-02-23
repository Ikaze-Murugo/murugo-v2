"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { userApi } from "@/lib/api/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/hooks/use-toast";
import { User, Mail, Phone, Shield, Edit, Save, X, Building2, MessageSquare } from "lucide-react";

const profileSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  profile: z.object({
    name: z.string().optional(),
    bio: z.string().optional(),
    company: z.string().optional(),
    whatsapp: z.string().optional(),
  }).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userApi.getProfile(),
  });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: user ? {
      email: user.email,
      phone: user.phone || "",
      profile: {
        name: user.profile?.name || "",
        bio: user.profile?.bio || "",
        company: user.profile?.companyName || "",
        whatsapp: user.whatsappNumber || "",
      },
    } : undefined,
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      userApi.updateProfile({
        name: data.profile?.name,
        bio: data.profile?.bio,
        company: data.profile?.company,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      });
      setIsEditingProfile(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: PasswordFormData) =>
      userApi.updatePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      toast({
        title: "Password updated!",
        description: "Your password has been changed successfully.",
      });
      resetPassword();
      setIsChangingPassword(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmitProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onSubmitPassword = (data: PasswordFormData) => {
    updatePasswordMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-900">Profile Settings</h1>
        <p className="text-sm text-neutral-600">Manage your account information and preferences</p>
      </div>

      {/* Profile Information Card */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-medium text-neutral-900">Personal Information</h2>
              <p className="text-xs text-neutral-500">Update your personal details</p>
            </div>
          </div>
          {!isEditingProfile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingProfile(true)}
              className="text-neutral-600 hover:text-neutral-900"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="p-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Full Name</label>
              <Input
                {...registerProfile("profile.name")}
                disabled={!isEditingProfile}
                placeholder="Enter your full name"
                className="bg-neutral-50 border-neutral-200"
              />
              {profileErrors.profile?.name && (
                <p className="text-xs text-red-600">{profileErrors.profile.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <Input
                {...registerProfile("email")}
                type="email"
                disabled
                className="bg-neutral-100 border-neutral-200 cursor-not-allowed"
              />
              <p className="text-xs text-neutral-500">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </label>
              <Input
                {...registerProfile("phone")}
                disabled={!isEditingProfile}
                placeholder="+250 XXX XXX XXX"
                className="bg-neutral-50 border-neutral-200"
              />
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                WhatsApp Number
              </label>
              <Input
                {...registerProfile("profile.whatsapp")}
                disabled={!isEditingProfile}
                placeholder="+250 XXX XXX XXX"
                className="bg-neutral-50 border-neutral-200"
              />
            </div>

            {/* Company */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company Name
              </label>
              <Input
                {...registerProfile("profile.company")}
                disabled={!isEditingProfile}
                placeholder="Your company or agency name"
                className="bg-neutral-50 border-neutral-200"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-neutral-700">Bio</label>
              <textarea
                {...registerProfile("profile.bio")}
                disabled={!isEditingProfile}
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {isEditingProfile && (
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsEditingProfile(false);
                  resetProfile();
                }}
                className="text-neutral-600 hover:text-neutral-900"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Account Role */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-medium text-neutral-900">Account Type</h2>
            <p className="text-xs text-neutral-500">Your current account role</p>
          </div>
        </div>
        <div className="p-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg">
            <span className="text-sm font-medium text-neutral-900 capitalize">{user?.role || "User"}</span>
          </div>
        </div>
      </div>

      {/* Security - Change Password */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500/10 to-red-500/5 flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-base font-medium text-neutral-900">Security</h2>
              <p className="text-xs text-neutral-500">Update your password</p>
            </div>
          </div>
          {!isChangingPassword && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChangingPassword(true)}
              className="text-neutral-600 hover:text-neutral-900"
            >
              <Edit className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          )}
        </div>

        {isChangingPassword && (
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="p-6 space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Current Password</label>
                <Input
                  {...registerPassword("currentPassword")}
                  type="password"
                  placeholder="Enter current password"
                  className="bg-neutral-50 border-neutral-200"
                />
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-red-600">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">New Password</label>
                <Input
                  {...registerPassword("newPassword")}
                  type="password"
                  placeholder="Enter new password"
                  className="bg-neutral-50 border-neutral-200"
                />
                {passwordErrors.newPassword && (
                  <p className="text-xs text-red-600">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Confirm New Password</label>
                <Input
                  {...registerPassword("confirmPassword")}
                  type="password"
                  placeholder="Confirm new password"
                  className="bg-neutral-50 border-neutral-200"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-red-600">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={updatePasswordMutation.isPending}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsChangingPassword(false);
                  resetPassword();
                }}
                className="text-neutral-600 hover:text-neutral-900"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        )}

        {!isChangingPassword && (
          <div className="p-6">
            <p className="text-sm text-neutral-600">••••••••</p>
          </div>
        )}
      </div>
    </div>
  );
}
