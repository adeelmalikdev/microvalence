import { useState, useEffect } from "react";
import { Shield, UserX, UserCheck, Crown, Ban, Settings, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Member {
  id: string;
  user_id: string;
  role: string;
  profile?: { full_name: string | null; avatar_url: string | null };
}

interface JoinRequest {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  profile?: { full_name: string | null; avatar_url: string | null };
}

interface GroupAdminPanelProps {
  groupId: string;
  joinMode: string;
  adminOnlyMessaging: boolean;
  onSettingsChanged: () => void;
}

export function GroupAdminPanel({ groupId, joinMode, adminOnlyMessaging, onSettingsChanged }: GroupAdminPanelProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [localJoinMode, setLocalJoinMode] = useState(joinMode);
  const [localAdminOnly, setLocalAdminOnly] = useState(adminOnlyMessaging);

  useEffect(() => {
    fetchMembers();
    fetchRequests();
  }, [groupId]);

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("alumni_group_members")
      .select("*")
      .eq("group_id", groupId);

    if (data && data.length > 0) {
      const userIds = data.map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      setMembers(
        data.map((m) => ({
          ...m,
          role: m.role || "member",
          profile: profiles?.find((p) => p.user_id === m.user_id),
        }))
      );
    }
  };

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("alumni_group_join_requests")
      .select("*")
      .eq("group_id", groupId)
      .eq("status", "pending");

    if (data && data.length > 0) {
      const userIds = data.map((r) => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      setRequests(
        data.map((r) => ({
          ...r,
          profile: profiles?.find((p) => p.user_id === r.user_id),
        }))
      );
    } else {
      setRequests([]);
    }
  };

  const handleApproveRequest = async (requestId: string, userId: string) => {
    try {
      await supabase
        .from("alumni_group_join_requests")
        .update({ status: "approved" } as any)
        .eq("id", requestId);

      await supabase.from("alumni_group_members").insert({
        group_id: groupId,
        user_id: userId,
        role: "member",
      });

      toast.success("Request approved");
      fetchRequests();
      fetchMembers();
    } catch {
      toast.error("Failed to approve");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    await supabase
      .from("alumni_group_join_requests")
      .update({ status: "rejected" } as any)
      .eq("id", requestId);
    toast.success("Request rejected");
    fetchRequests();
  };

  const handleKickMember = async (memberId: string, memberUserId: string) => {
    if (memberUserId === user?.id) return;
    await supabase.from("alumni_group_members").delete().eq("id", memberId);
    toast.success("Member removed");
    fetchMembers();
  };

  const handlePromote = async (memberId: string) => {
    await supabase
      .from("alumni_group_members")
      .update({ role: "admin" } as any)
      .eq("id", memberId);
    toast.success("Promoted to admin");
    fetchMembers();
  };

  const handleDemote = async (memberId: string) => {
    await supabase
      .from("alumni_group_members")
      .update({ role: "member" } as any)
      .eq("id", memberId);
    toast.success("Demoted to member");
    fetchMembers();
  };

  const handleToggleJoinMode = async (checked: boolean) => {
    const mode = checked ? "approval" : "open";
    setLocalJoinMode(mode);
    await supabase
      .from("alumni_groups")
      .update({ join_mode: mode } as any)
      .eq("id", groupId);
    toast.success(checked ? "Join requests now require approval" : "Group is now open to join");
    onSettingsChanged();
  };

  const handleToggleAdminOnly = async (checked: boolean) => {
    setLocalAdminOnly(checked);
    await supabase
      .from("alumni_groups")
      .update({ admin_only_messaging: checked } as any)
      .eq("id", groupId);
    toast.success(checked ? "Only admins can send messages" : "All members can send messages");
    onSettingsChanged();
  };

  const getInitials = (name: string | null) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className="bg-card/50 rounded-2xl border-2 border-primary/20 overflow-hidden">
      <Tabs defaultValue="members">
        <div className="border-b px-4 py-3">
          <TabsList className="w-full">
            <TabsTrigger value="members" className="flex-1 gap-1">
              <Users className="h-4 w-4" /> Members ({members.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex-1 gap-1">
              <UserCheck className="h-4 w-4" /> Requests
              {requests.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 justify-center text-xs">
                  {requests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 gap-1">
              <Settings className="h-4 w-4" /> Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="members" className="p-4 max-h-80 overflow-y-auto space-y-2 mt-0">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.profile?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">{getInitials(member.profile?.full_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium truncate block">
                  {member.profile?.full_name || "Unknown"}
                </span>
                <Badge variant={member.role === "admin" ? "default" : "secondary"} className="text-xs">
                  {member.role === "admin" && <Crown className="h-3 w-3 mr-1" />}
                  {member.role}
                </Badge>
              </div>
              {member.user_id !== user?.id && (
                <div className="flex gap-1">
                  {member.role === "member" ? (
                    <Button variant="ghost" size="sm" onClick={() => handlePromote(member.id)} title="Promote to admin">
                      <Shield className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => handleDemote(member.id)} title="Demote to member">
                      <Ban className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleKickMember(member.id, member.user_id)}
                    title="Remove member"
                  >
                    <UserX className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="requests" className="p-4 max-h-80 overflow-y-auto space-y-2 mt-0">
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No pending requests</p>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={req.profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">{getInitials(req.profile?.full_name)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium flex-1">{req.profile?.full_name || "Unknown"}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="default" onClick={() => handleApproveRequest(req.id, req.user_id)}>
                    <UserCheck className="h-3 w-3 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleRejectRequest(req.id)}>
                    <UserX className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="settings" className="p-4 space-y-6 mt-0">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Require Approval to Join</Label>
              <p className="text-xs text-muted-foreground">Members must be approved by an admin</p>
            </div>
            <Switch checked={localJoinMode === "approval"} onCheckedChange={handleToggleJoinMode} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Admin-Only Messaging</Label>
              <p className="text-xs text-muted-foreground">Only admins can send messages</p>
            </div>
            <Switch checked={localAdminOnly} onCheckedChange={handleToggleAdminOnly} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
