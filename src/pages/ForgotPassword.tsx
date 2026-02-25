import { useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, HelpCircle, CheckCircle, Loader2, ShieldQuestion } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Step = "email" | "questions" | "success";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [question1, setQuestion1] = useState("");
  const [question2, setQuestion2] = useState("");
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleFetchQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-security-questions", {
        body: { email: email.trim() },
      });
      if (error || data?.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: data?.error || "Could not find security questions for this account.",
        });
      } else {
        setQuestion1(data.question_1);
        setQuestion2(data.question_2);
        setStep("questions");
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ variant: "destructive", title: "Error", description: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Passwords do not match." });
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-security-questions", {
        body: {
          email: email.trim(),
          answer_1: answer1,
          answer_2: answer2,
          new_password: newPassword,
        },
      });
      if (error || data?.error) {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: data?.error || "Security answers are incorrect.",
        });
      } else {
        setStep("success");
        toast({ title: "Password Reset!", description: "You can now sign in with your new password." });
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted via-background to-muted flex flex-col relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container py-6">
        <Link to="/">
          <Logo />
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <Card className="w-full max-w-md glass-light animate-fade-in relative z-10">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              {step === "success" ? (
                <CheckCircle className="h-6 w-6 text-primary" />
              ) : step === "questions" ? (
                <ShieldQuestion className="h-6 w-6 text-primary" />
              ) : (
                <HelpCircle className="h-6 w-6 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {step === "success"
                ? "Password Reset!"
                : step === "questions"
                ? "Answer Security Questions"
                : "Recover Your Account"}
            </CardTitle>
            <CardDescription>
              {step === "success"
                ? "Your password has been successfully changed."
                : step === "questions"
                ? "Answer your security questions to reset your password."
                : "Enter your email to recover your account using security questions."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === "email" && (
              <form onSubmit={handleFetchQuestions} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-muted"
                  />
                </div>
                <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading ? "Looking up..." : "Continue"}
                </Button>
              </form>
            )}

            {step === "questions" && (
              <form onSubmit={handleVerifyAndReset} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{question1}</Label>
                  <Input
                    value={answer1}
                    onChange={(e) => setAnswer1(e.target.value)}
                    placeholder="Your answer"
                    required
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{question2}</Label>
                  <Input
                    value={answer2}
                    onChange={(e) => setAnswer2(e.target.value)}
                    placeholder="Your answer"
                    required
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-pw">New Password</Label>
                  <PasswordInput
                    id="new-pw"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-pw">Confirm New Password</Label>
                  <PasswordInput
                    id="confirm-pw"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="bg-muted"
                  />
                </div>
                <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading ? "Verifying..." : "Reset Password"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => { setStep("email"); setAnswer1(""); setAnswer2(""); setNewPassword(""); setConfirmPassword(""); }}
                >
                  Use a different email
                </Button>
              </form>
            )}

            {step === "success" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  You can now sign in with your new password.
                </p>
                <Button asChild className="w-full">
                  <Link to="/login">Go to Sign In</Link>
                </Button>
              </div>
            )}

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
