import { useParams } from "react-router-dom";
import { EnhancedProfile } from "@/features/profile/EnhancedProfile";

export default function StudentProfileView() {
  const { userId } = useParams<{ userId: string }>();
  return <EnhancedProfile userId={userId} />;
}
