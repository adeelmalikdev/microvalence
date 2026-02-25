import { useState, useEffect } from "react";
import { Shield, ShieldCheck, ShieldOff, AlertTriangle, Loader2, KeyRound, CheckCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTwoFactor } from "@/hooks/useTwoFactor";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import { TwoFactorVerify } from "@/components/auth/TwoFactorVerify";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const SECURITY_QUESTION_OPTIONS = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was your childhood nickname?",
  "What was the name of your first school?",
  "What is your favorite book?",
  "What was the make of your first car?",
  "What is the name of the street you grew up on?",
];

export function SecuritySettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    status,
    statusLoading,
    disable,
    isDisabling,
    disableError,
  } = useTwoFactor();

  const [showSetup, setShowSetup] = useState(false);
  const [showDisableVerify, setShowDisableVerify] = useState(false);

  // Change password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Security questions state
  const [question1, setQuestion1] = useState("");
  const [answer1, setAnswer1] = useState("");
  const [question2, setQuestion2] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [sqLoading, setSqLoading] = useState(true);
  const [sqSaving, setSqSaving] = useState(false);
  const [sqExists, setSqExists] = useState(false);
  const [sqSuccess, setSqSuccess] = useState(false);

  // Load existing security questions
  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setSqLoading(true);
      const { data } = await supabase
        .from("security_questions" as any)
        .select("question_1, question_2")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setQuestion1((data as any).question_1 || "");
        setQuestion2((data as any).question_2 || "");
        setSqExists(true);
      }
      setSqLoading(false);
    };
    load();
  }, [user?.id]);

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(true);
      toast({ title: "Password Updated", description: "Your password has been changed successfully." });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      toast({ title: "Failed", description: err.message || "Could not update password.", variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveSecurityQuestions = async () => {
    if (!question1 || !answer1.trim() || !question2 || !answer2.trim()) {
      toast({ title: "Error", description: "Please select questions and provide answers.", variant: "destructive" });
      return;
    }
    if (question1 === question2) {
      toast({ title: "Error", description: "Please choose two different questions.", variant: "destructive" });
      return;
    }
    setSqSaving(true);
    try {
      if (sqExists) {
        const { error } = await supabase
          .from("security_questions" as any)
          .update({
            question_1: question1,
            answer_1: answer1.trim().toLowerCase(),
            question_2: question2,
            answer_2: answer2.trim().toLowerCase(),
            updated_at: new Date().toISOString(),
          } as any)
          .eq("user_id", user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("security_questions" as any)
          .insert({
            user_id: user!.id,
            question_1: question1,
            answer_1: answer1.trim().toLowerCase(),
            question_2: question2,
            answer_2: answer2.trim().toLowerCase(),
          } as any);
        if (error) throw error;
        setSqExists(true);
      }
      setAnswer1("");
      setAnswer2("");
      setSqSuccess(true);
      toast({ title: "Saved", description: "Security questions updated successfully." });
      setTimeout(() => setSqSuccess(false), 3000);
    } catch (err: any) {
      toast({ title: "Failed", description: err.message || "Could not save security questions.", variant: "destructive" });
    } finally {
      setSqSaving(false);
    }
  };

  const handleDisable2FA = async (code: string) => {
    try {
      await new Promise<void>((resolve, reject) => {
        disable(code, {
          onSuccess: () => resolve(),
          onError: (err) => reject(err),
        });
      });
      setShowDisableVerify(false);
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
    } catch {
      // Error will be shown in the dialog
    }
  };

  if (statusLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your account password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <PasswordInput
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={changingPassword || !newPassword || !confirmPassword}
            className="gap-2"
          >
            {changingPassword ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : passwordSuccess ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            {passwordSuccess ? "Updated!" : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      {/* Security Questions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Security Questions
          </CardTitle>
          <CardDescription>
            Set up security questions for password recovery. {sqExists && <Badge variant="secondary" className="ml-1">Configured</Badge>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sqLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Question 1</Label>
                <Select value={question1} onValueChange={setQuestion1}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a security question" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECURITY_QUESTION_OPTIONS.map((q) => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={answer1}
                  onChange={(e) => setAnswer1(e.target.value)}
                  placeholder={sqExists ? "Enter new answer to update" : "Your answer"}
                />
              </div>
              <div className="space-y-2">
                <Label>Question 2</Label>
                <Select value={question2} onValueChange={setQuestion2}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a security question" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECURITY_QUESTION_OPTIONS.filter(q => q !== question1).map((q) => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={answer2}
                  onChange={(e) => setAnswer2(e.target.value)}
                  placeholder={sqExists ? "Enter new answer to update" : "Your answer"}
                />
              </div>
              <Alert>
                <AlertDescription className="text-sm">
                  Answers are case-insensitive. Choose questions only you know the answer to. These will be used to recover your password if you forget it.
                </AlertDescription>
              </Alert>
              <Button
                onClick={handleSaveSecurityQuestions}
                disabled={sqSaving || !question1 || !answer1.trim() || !question2 || !answer2.trim()}
                className="gap-2"
              >
                {sqSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : sqSuccess ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <HelpCircle className="h-4 w-4" />
                )}
                {sqSuccess ? "Saved!" : sqExists ? "Update Security Questions" : "Save Security Questions"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* 2FA Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {status?.enabled ? (
                <ShieldCheck className="h-8 w-8 text-primary" />
              ) : (
                <ShieldOff className="h-8 w-8 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">
                  {status?.enabled ? "2FA is enabled" : "2FA is not enabled"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {status?.enabled
                    ? `${status.backupCodesCount} backup codes remaining`
                    : "Protect your account with authenticator app"}
                </p>
              </div>
            </div>
            <Badge variant={status?.enabled ? "default" : "secondary"}>
              {status?.enabled ? "Active" : "Inactive"}
            </Badge>
          </div>

          {status?.enabled && status.backupCodesCount < 3 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You have only {status.backupCodesCount} backup codes remaining.
                Consider regenerating your backup codes.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            {status?.enabled ? (
              <Button
                variant="outline"
                onClick={() => setShowDisableVerify(true)}
                disabled={isDisabling}
              >
                Disable 2FA
              </Button>
            ) : (
              <Button onClick={() => setShowSetup(true)}>
                Enable 2FA
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <TwoFactorSetup
        open={showSetup}
        onOpenChange={setShowSetup}
      />

      <TwoFactorVerify
        open={showDisableVerify}
        onOpenChange={setShowDisableVerify}
        onVerify={handleDisable2FA}
        isVerifying={isDisabling}
        error={disableError?.message}
        title="Disable Two-Factor Authentication"
        description="Enter your authentication code to disable 2FA."
      />
    </>
  );
}
