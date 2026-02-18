import { Link } from "react-router-dom";
import valenceLogo from "@/assets/valence-logo.jpeg";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <img src={valenceLogo} alt="Valence" className="h-8 w-8 object-contain" />
      <span className="text-2xl font-bold text-primary">Valence</span>
    </Link>
  );
}
