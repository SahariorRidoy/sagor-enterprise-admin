"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPasswordMutation } from "@/redux/featured/auth/authApi";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Valid email required"),
});

type Values = z.infer<typeof schema>;

const ForgotPasswordPage: React.FC = () => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: Values) => {
    try {
      await forgotPassword({ email: values.email }).unwrap();
      toast.success("OTP sent to your email");

      // Next.js এ state পাস করা যায় না → URL query ব্যবহার করো
      router.push(
        `/auth/reset-password?email=${encodeURIComponent(values.email)}`
      );
    } catch (e: any) {
      toast.error(
        e?.data?.error || e?.data?.message || "Failed to send reset OTP"
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>
              Enter your email to receive a password reset OTP.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
              noValidate
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send OTP"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm">
              <Link href="/auth/login" className="text-primary hover:underline">
                Back to Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
