import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Settings, UserPlus, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { GroupChat } from "./components/GroupChat";
import { GroupAdminPanel } from "./components/GroupAdminPanel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type GroupRow = Database["public"]["Tables"]["alumni_groups"]["Row"];

interface GroupWithMembership extends Omit<GroupRow, 'join_mode' | 'admin_only_messaging'> {
  is_member: boolean;
  user_role: string | null;
  join_mode?: string;
  admin_only_messaging?: boolean;
}

export function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState<GroupWithMembership | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [joinRequested, setJoinRequested] = useState(false);

  useEffect(() => {
    if (groupId) fetchGroup();
  }, [groupId, user]);

  const fetchGroup = async () => {
    if (!groupId) return;
    setIsLoading(true);
    try {
      const { data: groupData, error } = await supabase
        .from("alumni_groups")
        .select("*")
        .eq("id", groupId)
        .single();

      if (error) throw error;

      let membership = null;
      if (user) {
        const { data: memberData } = await supabase
          .from("alumni_group_members")
          .select("role")
          .eq("group_id", groupId)
          .eq("user_id", user.id)
          .single();
        membership = memberData;

        // Check if join request exists
        if (!membership) {
          const { data: reqData } = await supabase
            .from("alumni_group_join_requests")
            .select("id, status")
            .eq("group_id", groupId)
            .eq("user_id", user.id)
            .eq("status", "pending")
            .maybeSingle();
          setJoinRequested(!!reqData);
        }
      }

      const gd = groupData as any;
      setGroup({
        ...groupData,
        is_member: !!membership,
        user_role: membership?.role || null,
        join_mode: gd.join_mode || "open",
        admin_only_messaging: gd.admin_only_messaging || false,
      });
    } catch (error) {
      console.error("Error fetching group:", error);
      toast.error("Group not found");
      navigate("/student/alumni/groups");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user || !groupId) {
      toast.error("Please sign in to join");
      return;
    }

    const needsApproval = group?.join_mode === "approval";

    if (needsApproval) {
      try {
        const { error } = await supabase.from("alumni_group_join_requests").insert({
          group_id: groupId,
          user_id: user.id,
        } as any);
        if (error) throw error;
        toast.success("Join request sent! Waiting for admin approval.");
        setJoinRequested(true);
      } catch {
        toast.error("Failed to send request");
      }
    } else {
      try {
        const { error } = await supabase.from("alumni_group_members").insert({
          group_id: groupId,
          user_id: user.id,
          role: "member",
        });
        if (error) throw error;
        toast.success("Joined group!");
        fetchGroup();
      } catch {
        toast.error("Failed to join group");
      }
    }
  };

  const handleLeave = async () => {
    if (!user || !groupId) return;
    try {
      const { error } = await supabase
        .from("alumni_group_members")
        .delete()
        .match({ group_id: groupId, user_id: user.id });
      if (error) throw error;
      toast.success("Left group");
      fetchGroup();
    } catch {
      toast.error("Failed to leave group");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!group) return null;

  const isAdmin = group.user_role === "admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/student/alumni/groups")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-xl translate-x-1 translate-y-1 blur-sm" />
              <div className="absolute inset-0 bg-primary/30 rounded-xl translate-x-0.5 translate-y-0.5" />
              <div className="relative p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{group.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
                  {group.field}
                </span>
                <span>•</span>
                <span>{group.member_count} members</span>
                {group.join_mode === "approval" && (
                  <>
                    <span>•</span>
                    <span className="text-xs text-muted-foreground">Approval required</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {group.is_member ? (
            <>
              {isAdmin && (
                <Button
                  variant={showAdmin ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowAdmin(!showAdmin)}
                >
                  <Settings className="h-4 w-4" />
                  {showAdmin ? "Hide Admin" : "Admin Panel"}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLeave}
                className="gap-2 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Leave
              </Button>
            </>
          ) : (
            <Button
              onClick={handleJoin}
              disabled={joinRequested}
              className="gap-2 bg-primary hover:bg-primary/90 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
            >
              <UserPlus className="h-4 w-4" />
              {joinRequested ? "Request Pending" : "Join Group"}
            </Button>
          )}
        </div>
      </div>

      {group.description && <p className="text-muted-foreground">{group.description}</p>}

      {/* Admin Panel */}
      {showAdmin && isAdmin && (
        <GroupAdminPanel
          groupId={group.id}
          joinMode={group.join_mode || "open"}
          adminOnlyMessaging={group.admin_only_messaging || false}
          onSettingsChanged={fetchGroup}
        />
      )}

      {/* Chat */}
      {group.is_member ? (
        <GroupChat
          groupId={group.id}
          isAdmin={isAdmin}
          adminOnlyMessaging={group.admin_only_messaging || false}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-[400px] bg-card/50 rounded-2xl border-2 border-primary/20">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Join to participate</h3>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            Become a member of this group to view messages and participate in discussions.
          </p>
          <Button onClick={handleJoin} disabled={joinRequested} className="gap-2 bg-primary hover:bg-primary/90">
            <UserPlus className="h-4 w-4" />
            {joinRequested ? "Request Pending" : "Join Group"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default GroupDetail;
