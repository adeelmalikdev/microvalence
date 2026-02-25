import { useParams } from "react-router-dom";
import { FullPortfolioView } from "@/components/portfolio/FullPortfolioView";

export default function StudentProfileView() {
  const { userId } = useParams<{ userId: string }>();
  return <FullPortfolioView userId={userId} backPath="/recruiter/browse-students" />;
}
