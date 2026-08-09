"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useResetPasswordWithOtpMutation } from "@/redux/featured/auth/authApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

const passwordPolicy = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

const resetPasswordSchema = z
  .object({
    email: z.string().email("Valid email required"),
    otp: z
      .string()
      .min(6, "OTP must be 6 digits")
      .max(6, "OTP must be 6 digits"),
    newPassword: z
      .string()
      .min(8, "Minimum 8 characters")
      .regex(
        passwordPolicy,
        "Password must contain upper, lower, number & special char"
      ),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get("email") || "";

  const [resetPassword, { isLoading }] = useResetPasswordWithOtpMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: prefillEmail,
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordFormData) => {
    try {
      await resetPassword({
        email: values.email,
        otp: values.otp,
        newPassword: values.newPassword,
      }).unwrap();

      setResetSuccess(true);
      toast.success("Password reset successful. Redirecting to login...");
      setTimeout(() => {
        router.push("/auth/login");
      }, 5000);
    } catch (e: any) {
      toast.error(
        e?.data?.error || e?.data?.message || "Password reset failed"
      );
    }
  };

  useEffect(() => {
    if (!prefillEmail) {
      toast.error("Missing email context, please try again.");
      router.push("/auth/forgot-password");
    }
  }, [prefillEmail, router]);

  // Success Screen
  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-strong border-0">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-heading font-bold text-foreground">
                    Password Reset Complete
                  </h2>
                  <p className="text-muted-foreground">
                    Your password has been successfully updated. You will be
                    redirected to the login page shortly.
                  </p>
                </div>
                <Link href="/auth/login">
                  <Button className="w-full btn-cta">Continue to Login</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main Form
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-strong border-0">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-between">
              <Link
                href="/auth/login"
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </Link>
              <div className="flex-1" />
            </div>
            <CardTitle className="text-2xl font-heading text-foreground">
              Reset Password
            </CardTitle>
            <p className="text-muted-foreground">
              Enter your OTP, email and new password below.
            </p>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
              noValidate
            >
              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  readOnly
                  placeholder="Enter your email"
                  {...form.register("email")}
                  className="h-12"
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* OTP */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  OTP Code
                </label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="Enter OTP"
                  {...form.register("otp")}
                  className="h-12"
                />
                {form.formState.errors.otp && (
                  <p className="text-xs text-destructive mt-1">
                    {form.formState.errors.otp.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    {...form.register("newPassword")}
                    className="h-12 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {form.formState.errors.newPassword && (
                  <p className="text-xs text-destructive mt-1">
                    {form.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    {...form.register("confirmPassword")}
                    className="h-12 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive mt-1">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 btn-cta"
              >
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
