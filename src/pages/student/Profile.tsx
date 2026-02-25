import { useParams } from "react-router-dom";
import { FullPortfolioView } from "@/components/portfolio/FullPortfolioView";

export default function StudentProfile() {
  const { userId } = useParams<{ userId: string }>();
  return <FullPortfolioView userId={userId} backPath="/student/dashboard" />;
}
