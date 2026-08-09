"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  useResendOtpMutation,
  useVerifyEmailMutation,
} from "@/redux/featured/auth/authApi"; // Adjust import
import { ArrowLeft, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const VerifyEmail = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifyEmail] = useVerifyEmailMutation();
  const [resendOtp] = useResendOtpMutation();

  const email = searchParams.get("email")
    ? decodeURIComponent(searchParams.get("email")!)
    : "";

  useEffect(() => {

    // Start countdown timer for resend
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit verification code");
      return;
    }

    setLoading(true);
    try {
      await verifyEmail({ email, otp }).unwrap();
      toast.success("Email verified successfully! You can now login.");

      // Manual redirect to login page
      router.push("/auth/login");
    } catch (error) {
      toast.error("The verification code you entered is incorrect");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await resendOtp({ email }).unwrap();
      toast.success("A new verification code has been sent to your email");
      setCountdown(60);
      setCanResend(false);
    } catch (error) {
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/auth/register");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
              <Mail className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Verify Your Email
          </CardTitle>
          <CardDescription>
            Weve sent a 6-digit verification code to
            <br />
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OTP Input */}
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Verify Button */}
          {/* <Button
            onClick={handleVerify}
            className="w-full"
            variant="gradient"
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </Button> */}
          <Button
            onClick={handleVerify}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </Button>

          {/* Resend Section */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {"Didn't"} receive the code?
            </p>
            {canResend ? (
              <Button
                variant="ghost"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-primary hover:text-primary/80"
              >
                {resendLoading ? "Sending..." : "Resend Code"}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Resend code in {countdown}s
              </p>
            )}
          </div>

          {/* Back Button */}
          <Button variant="outline" onClick={handleBack} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Registration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
