import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface CompletedInternship {
  id: string;
  opportunityTitle: string;
  companyName: string;
  completedAt: string;
  durationHours: number;
  skills: string[];
  rating: number | null;
  feedback: string | null;
  certificateId: string | null;
  verificationCode: string | null;
}

interface PortfolioData {
  internships: CompletedInternship[];
  allSkills: string[];
  totalHours: number;
  averageRating: number | null;
}

export function useStudentPortfolio(targetUserId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const resolvedId = targetUserId || user?.id;

  // Realtime: refresh portfolio when applications or feedback change for this student
  useEffect(() => {
    if (!resolvedId) return;

    const channel = supabase
      .channel(`portfolio-sync-${resolvedId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: `student_id=eq.${resolvedId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["student-portfolio", resolvedId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feedback',
        },
        () => {
          // Feedback table doesn't have student_id, so we always invalidate
          queryClient.invalidateQueries({ queryKey: ["student-portfolio", resolvedId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [resolvedId, queryClient]);

  return useQuery({
    queryKey: ["student-portfolio", resolvedId],
    queryFn: async (): Promise<PortfolioData> => {
      if (!resolvedId) throw new Error("User not authenticated");

      // Use the SECURITY DEFINER RPC so any authenticated user can view portfolio data
      const { data, error } = await supabase.rpc("get_student_portfolio", {
        _student_id: resolvedId,
      });

      if (error) throw error;

      const rawInternships = (data as any)?.internships || [];

      const internships: CompletedInternship[] = rawInternships.map((i: any) => ({
        id: i.id,
        opportunityTitle: i.opportunityTitle || "Unknown Opportunity",
        companyName: i.companyName || "Unknown Company",
        completedAt: i.completedAt,
        durationHours: i.durationHours || 0,
        skills: i.skills || [],
        rating: i.rating || null,
        feedback: i.feedback || null,
        certificateId: i.certificateId || null,
        verificationCode: i.verificationCode || null,
      }));

      const allSkills = [...new Set(internships.flatMap((i) => i.skills))];
      const totalHours = internships.reduce((sum, i) => sum + i.durationHours, 0);
      const ratings = internships.filter((i) => i.rating !== null).map((i) => i.rating!);
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : null;

      return { internships, allSkills, totalHours, averageRating };
    },
    enabled: !!resolvedId,
    refetchInterval: 15000, // Poll every 15s as fallback for missed realtime events
    refetchIntervalInBackground: false,
  });
}
