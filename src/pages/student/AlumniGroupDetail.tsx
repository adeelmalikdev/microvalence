import { BackButton } from "@/components/BackButton";
import { GroupDetail } from "@/features/alumni-connect/GroupDetail";

export default function AlumniGroupDetail() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <BackButton fallbackPath="/student/alumni/groups" className="mb-6" />
      <GroupDetail />
    </div>
  );
}