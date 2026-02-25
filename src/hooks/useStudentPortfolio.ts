import { useQuery } from "@tanstack/react-query";
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
  const resolvedId = targetUserId || user?.id;

  return useQuery({
    queryKey: ["student-portfolio", resolvedId],
    queryFn: async (): Promise<PortfolioData> => {
      if (!resolvedId) throw new Error("User not authenticated");

      // Fetch completed applications first
      const { data: applications, error: appError } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          updated_at,
          opportunity_id
        `)
        .eq("student_id", resolvedId)
        .eq("status", "completed");

      if (appError) throw appError;

      if (!applications || applications.length === 0) {
        return {
          internships: [],
          allSkills: [],
          totalHours: 0,
          averageRating: null,
        };
      }

      const opportunityIds = applications.map((app) => app.opportunity_id);
      const applicationIds = applications.map((app) => app.id);

      // Run all dependent queries in PARALLEL for faster loading
      const [opportunitiesResult, feedbackResult, certificatesResult] = await Promise.all([
        supabase
          .from("opportunities")
          .select("id, title, company_name, duration_hours, skills_required")
          .in("id", opportunityIds),
        supabase
          .from("feedback")
          .select("application_id, rating, comments, skills_demonstrated")
          .in("application_id", applicationIds),
        supabase
          .from("certificates")
          .select("id, application_id, verification_code")
          .in("application_id", applicationIds),
      ]);

      if (opportunitiesResult.error) throw opportunitiesResult.error;
      if (feedbackResult.error) throw feedbackResult.error;
      if (certificatesResult.error) throw certificatesResult.error;

      const opportunities = opportunitiesResult.data;
      const feedbackData = feedbackResult.data;
      const certificates = certificatesResult.data;

      // Map data together
      const internships: CompletedInternship[] = applications.map((app) => {
        const opportunity = opportunities?.find((o) => o.id === app.opportunity_id);
        const feedback = feedbackData?.find((f) => f.application_id === app.id);
        const certificate = certificates?.find((c) => c.application_id === app.id);

        return {
          id: app.id,
          opportunityTitle: opportunity?.title || "Unknown Opportunity",
          companyName: opportunity?.company_name || "Unknown Company",
          completedAt: app.updated_at,
          durationHours: opportunity?.duration_hours || 0,
          skills: feedback?.skills_demonstrated || opportunity?.skills_required || [],
          rating: feedback?.rating || null,
          feedback: feedback?.comments || null,
          certificateId: certificate?.id || null,
          verificationCode: certificate?.verification_code || null,
        };
      });

      // Aggregate all unique skills
      const allSkills = [...new Set(internships.flatMap((i) => i.skills))];

      // Calculate total hours
      const totalHours = internships.reduce((sum, i) => sum + i.durationHours, 0);

      // Calculate average rating
      const ratings = internships.filter((i) => i.rating !== null).map((i) => i.rating!);
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : null;

      return {
        internships,
        allSkills,
        totalHours,
        averageRating,
      };
    },
    enabled: !!resolvedId,
  });
}
