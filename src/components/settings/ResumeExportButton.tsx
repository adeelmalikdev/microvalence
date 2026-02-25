import { useState } from "react";
import { FileText, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

async function fetchStudentData(userId: string) {
  const [profileRes, skillsRes, projectsRes, experienceRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("student_skills").select("*").eq("user_id", userId),
    supabase.from("student_projects").select("*").eq("user_id", userId).order("start_date", { ascending: false }),
    supabase.from("student_experience").select("*").eq("user_id", userId).order("start_date", { ascending: false }),
  ]);
  return {
    profile: profileRes.data,
    skills: skillsRes.data || [],
    projects: projectsRes.data || [],
    experience: experienceRes.data || [],
  };
}

async function fetchRecruiterData(userId: string) {
  const [profileRes, opportunitiesRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("opportunities").select("*").eq("recruiter_id", userId).order("created_at", { ascending: false }),
  ]);
  return {
    profile: profileRes.data,
    opportunities: opportunitiesRes.data || [],
  };
}

function generateStudentResumeHtml(data: Awaited<ReturnType<typeof fetchStudentData>>) {
  const p = data.profile;
  if (!p) return "<html><body>No profile data</body></html>";

  const name = escapeHtml(p.full_name || "Student");
  const bio = p.bio ? escapeHtml(p.bio) : "";
  const aboutMe = p.about_me ? escapeHtml(p.about_me) : "";
  const email = escapeHtml(p.email || "");
  const phone = p.phone ? escapeHtml(p.phone) : "";
  const location = p.location ? escapeHtml(p.location) : "";
  const university = p.university ? escapeHtml(p.university) : "";
  const major = p.major ? escapeHtml(p.major) : "";
  const gradYear = p.graduation_year || "";
  const gpa = p.gpa ? Number(p.gpa).toFixed(2) : "";

  const links = [
    p.github_url && `<a href="${p.github_url}">GitHub</a>`,
    p.linkedin_url && `<a href="${p.linkedin_url}">LinkedIn</a>`,
    p.portfolio_url && `<a href="${p.portfolio_url}">Portfolio</a>`,
    p.website && `<a href="${p.website}">Website</a>`,
  ].filter(Boolean).join(" · ");

  const contactParts = [email, phone, location].filter(Boolean).join(" · ");

  const skillsHtml = data.skills.length > 0
    ? `<div class="section"><h2>Skills</h2><hr/><p>${data.skills.map(s => `<span class="skill">${escapeHtml(s.skill_name)}</span>`).join("")}</p></div>`
    : "";

  const experienceHtml = data.experience.length > 0
    ? `<div class="section"><h2>Experience</h2><hr/>${data.experience.map(exp => `
        <div class="entry">
          <div class="entry-header">
            <strong>${escapeHtml(exp.position)}</strong>
            <span class="date">${formatDate(exp.start_date)} – ${exp.is_current ? "Present" : exp.end_date ? formatDate(exp.end_date) : "Present"}</span>
          </div>
          <div class="entry-sub">${escapeHtml(exp.company)}${exp.location ? ` · ${escapeHtml(exp.location)}` : ""}</div>
          ${exp.description ? `<p class="desc">${escapeHtml(exp.description)}</p>` : ""}
        </div>`).join("")}</div>`
    : "";

  const projectsHtml = data.projects.length > 0
    ? `<div class="section"><h2>Projects</h2><hr/>${data.projects.map(proj => `
        <div class="entry">
          <div class="entry-header">
            <strong>${escapeHtml(proj.title)}</strong>
            ${proj.start_date ? `<span class="date">${formatDate(proj.start_date)}${proj.end_date ? ` – ${formatDate(proj.end_date)}` : ""}</span>` : ""}
          </div>
          ${proj.description ? `<p class="desc">${escapeHtml(proj.description)}</p>` : ""}
          ${proj.tech_stack && proj.tech_stack.length > 0 ? `<p class="tech">Tech: ${proj.tech_stack.map(t => escapeHtml(t)).join(", ")}</p>` : ""}
          ${proj.project_url ? `<p class="link"><a href="${proj.project_url}">View Project</a></p>` : ""}
        </div>`).join("")}</div>`
    : "";

  const educationHtml = university ? `<div class="section"><h2>Education</h2><hr/>
    <div class="entry">
      <div class="entry-header">
        <strong>${university}</strong>
        ${gradYear ? `<span class="date">Class of ${gradYear}</span>` : ""}
      </div>
      <div class="entry-sub">${[major, gpa ? `GPA: ${gpa}` : ""].filter(Boolean).join(" · ")}</div>
    </div></div>` : "";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${name} - Resume</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'EB Garamond', 'Georgia', serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 48px 56px; font-size: 11.5pt; line-height: 1.45; }
  h1 { font-size: 26pt; font-weight: 700; text-align: center; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; color: #0d2137; }
  .headline { text-align: center; font-style: italic; color: #444; margin-bottom: 4px; font-size: 11pt; }
  .contact { text-align: center; font-size: 10pt; color: #555; margin-bottom: 4px; }
  .links { text-align: center; font-size: 10pt; margin-bottom: 16px; }
  .links a { color: #1a5276; text-decoration: none; }
  .links a:hover { text-decoration: underline; }
  .about { text-align: center; font-size: 10.5pt; color: #333; margin-bottom: 16px; max-width: 600px; margin-left: auto; margin-right: auto; font-style: italic; }
  .section { margin-bottom: 14px; }
  .section h2 { font-size: 12pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #0d2137; margin-bottom: 2px; }
  .section hr { border: none; border-top: 1.5px solid #0d2137; margin-bottom: 8px; }
  .entry { margin-bottom: 10px; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
  .entry-header strong { font-size: 11.5pt; }
  .date { font-size: 10pt; color: #666; font-style: italic; }
  .entry-sub { font-size: 10.5pt; color: #444; }
  .desc { font-size: 10.5pt; color: #333; margin-top: 3px; }
  .tech { font-size: 10pt; color: #555; margin-top: 2px; }
  .link { font-size: 10pt; margin-top: 2px; }
  .link a { color: #1a5276; text-decoration: none; }
  .skill { display: inline-block; background: #eaf2f8; color: #1a5276; padding: 2px 10px; border-radius: 3px; margin: 2px 4px 2px 0; font-size: 10pt; }
  @media print { body { padding: 24px 36px; } }
</style></head><body>
  <h1>${name}</h1>
  ${bio ? `<div class="headline">${bio}</div>` : ""}
  ${contactParts ? `<div class="contact">${contactParts}</div>` : ""}
  ${links ? `<div class="links">${links}</div>` : ""}
  ${aboutMe ? `<div class="about">${aboutMe}</div>` : ""}
  ${educationHtml}
  ${experienceHtml}
  ${projectsHtml}
  ${skillsHtml}
</body></html>`;
}

function generateRecruiterReportHtml(data: Awaited<ReturnType<typeof fetchRecruiterData>>) {
  const p = data.profile;
  if (!p) return "<html><body>No profile data</body></html>";

  const companyName = escapeHtml(p.company_name || p.full_name || "Company");
  const industry = p.industry ? escapeHtml(p.industry) : "";
  const size = p.company_size || "";
  const website = p.company_website || "";
  const description = p.company_description ? escapeHtml(p.company_description) : "";
  const founded = p.founded_year || "";

  const oppsHtml = data.opportunities.length > 0
    ? data.opportunities.map(opp => `
      <div class="entry">
        <div class="entry-header">
          <strong>${escapeHtml(opp.title)}</strong>
          <span class="date">${opp.status.charAt(0).toUpperCase() + opp.status.slice(1)}${opp.filled ? " · Filled" : ""}</span>
        </div>
        <div class="entry-sub">${escapeHtml(opp.company_name)} · ${opp.duration_hours}h · ${opp.level}${opp.is_remote ? " · Remote" : opp.location ? ` · ${escapeHtml(opp.location)}` : ""}</div>
        <p class="desc">${escapeHtml(opp.description.substring(0, 200))}${opp.description.length > 200 ? "..." : ""}</p>
        ${opp.skills_required.length > 0 ? `<p class="tech">Skills: ${opp.skills_required.join(", ")}</p>` : ""}
      </div>`).join("")
    : "<p>No opportunities posted yet.</p>";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${companyName} - Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'EB Garamond', 'Georgia', serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 48px 56px; font-size: 11.5pt; line-height: 1.45; }
  h1 { font-size: 26pt; font-weight: 700; text-align: center; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; color: #0d2137; }
  .sub { text-align: center; font-size: 11pt; color: #555; margin-bottom: 16px; }
  .about { font-size: 10.5pt; color: #333; margin-bottom: 16px; text-align: center; max-width: 600px; margin-left: auto; margin-right: auto; font-style: italic; }
  .section { margin-bottom: 14px; }
  .section h2 { font-size: 12pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #0d2137; margin-bottom: 2px; }
  .section hr { border: none; border-top: 1.5px solid #0d2137; margin-bottom: 8px; }
  .entry { margin-bottom: 12px; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
  .entry-header strong { font-size: 11.5pt; }
  .date { font-size: 10pt; color: #666; font-style: italic; }
  .entry-sub { font-size: 10.5pt; color: #444; }
  .desc { font-size: 10.5pt; color: #333; margin-top: 3px; }
  .tech { font-size: 10pt; color: #555; margin-top: 2px; }
  @media print { body { padding: 24px 36px; } }
</style></head><body>
  <h1>${companyName}</h1>
  <div class="sub">${[industry, size ? `${size} employees` : "", founded ? `Founded ${founded}` : "", website ? `<a href="${website}">${escapeHtml(website)}</a>` : ""].filter(Boolean).join(" · ")}</div>
  ${description ? `<div class="about">${description}</div>` : ""}
  <div class="section">
    <h2>Opportunities (${data.opportunities.length})</h2><hr/>
    ${oppsHtml}
  </div>
</body></html>`;
}

export function ResumeExportButton() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!user?.id) return;
    setIsExporting(true);
    try {
      let html: string;
      let filename: string;

      if (role === "recruiter") {
        const data = await fetchRecruiterData(user.id);
        html = generateRecruiterReportHtml(data);
        filename = `${data.profile?.company_name || "company"}-report.html`;
      } else {
        const data = await fetchStudentData(user.id);
        html = generateStudentResumeHtml(data);
        filename = `${data.profile?.full_name?.replace(/\s+/g, "-").toLowerCase() || "resume"}-resume.html`;
      }

      // Open in new window for print-to-PDF
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        // Trigger print dialog after fonts load
        setTimeout(() => printWindow.print(), 500);
      } else {
        // Fallback: download as HTML
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      toast({ title: "Resume Generated", description: "Use your browser's Print dialog to save as PDF." });
    } catch (err) {
      console.error(err);
      toast({ title: "Export Failed", description: "Could not generate resume.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={isExporting} className="w-full sm:w-auto">
      {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
      {isExporting ? "Generating..." : role === "recruiter" ? "Download Company Report" : "Download Resume (PDF)"}
    </Button>
  );
}
