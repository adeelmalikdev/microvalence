import { useState } from "react";
import { Shield, ShieldCheck, ShieldOff, AlertTriangle, Loader2, KeyRound, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useTwoFactor } from "@/hooks/useTwoFactor";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import { TwoFactorVerify } from "@/components/auth/TwoFactorVerify";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function SecuritySettings() {
  const { toast } = useToast();
  const {
    status,
    statusLoading,
    disable,
    isDisabling,
    disableError,
  } = useTwoFactor();

  const [showSetup, setShowSetup] = useState(false);
  const [showDisableVerify, setShowDisableVerify] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

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
      setCurrentPassword("");
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
