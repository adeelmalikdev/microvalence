import { Link, useLocation, useNavigate } from "react-router-dom";
import valenceLogo from "@/assets/valence-logo.jpeg";
import {
  Home,
  Briefcase,
  FileText,
  MessageSquare,
  User,
  Users,
  Building2,
  LayoutDashboard,
  Activity,
  Search,
  GraduationCap,
  FolderOpen,
  ClipboardList,
  LogOut,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LucideIcon } from "lucide-react";

interface NavLink {
  path: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface NavbarProps {
  userRole?: "student" | "recruiter" | "admin" | null;
}

const navLinks: Record<string, NavLink[]> = {
  student: [
    { path: "/student/dashboard", label: "Dashboard", icon: Home },
    { path: "/student/opportunities", label: "Opportunities", icon: Briefcase },
    { path: "/student/applications", label: "Applications", icon: FileText },
    { path: "/student/alumni", label: "Alumni", icon: GraduationCap },
    { path: "/student/browse-recruiters", label: "Companies", icon: Building2 },
  ],
  recruiter: [
    { path: "/recruiter/dashboard", label: "Dashboard", icon: Home },
    { path: "/recruiter/post", label: "Post Opportunity", icon: Briefcase },
    { path: "/recruiter/submissions", label: "Reviews", icon: ClipboardList },
    { path: "/recruiter/browse-students", label: "Students", icon: Users },
    { path: "/recruiter/profile", label: "Company Profile", icon: Building2 },
  ],
  admin: [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/activities", label: "Activities", icon: Activity },
  ],
};

export function Navbar({ userRole }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const unreadCount = useUnreadCount();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentLinks = userRole ? navLinks[userRole] ?? [] : [];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const messagesPath = userRole === "student"
    ? "/student/messages"
    : userRole === "recruiter"
      ? "/recruiter/messages"
      : null;

  const allLinks: NavLink[] = [
    ...currentLinks,
    ...(messagesPath
      ? [{ path: messagesPath, label: "Messages", icon: MessageSquare, badge: unreadCount }]
      : []),
  ];

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <nav className="sticky top-0 z-50 w-full">
      {/* Floating glass navbar */}
      <div className="mx-auto max-w-7xl px-3 pt-3">
        <div className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur-xl shadow-[var(--shadow-medium)]">
          <div className="flex h-14 items-center justify-between px-5 gap-2">
            {/* Logo */}
            <Link to={userRole ? `/${userRole}/dashboard` : "/"} className="flex items-center gap-2.5 group">
              <img src={valenceLogo} alt="Valence" className="h-10 w-10 object-contain" />
              <span className="font-bold text-lg text-foreground hidden sm:inline tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                Valence
              </span>
            </Link>

            {/* Desktop Navigation */}
            {userRole && (
              <div className="hidden lg:flex items-center gap-0.5">
                {currentLinks.map((link) => {
                  const isActive = location.pathname === link.path ||
                    (link.path !== `/${userRole}/dashboard` && location.pathname.startsWith(link.path));
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 whitespace-nowrap",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-[var(--shadow-emerald-glow)]"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <link.icon className="h-3.5 w-3.5" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Right side actions */}
            <div className="flex items-center gap-1 shrink-0">
              {userRole && <NotificationBell userRole={userRole} />}

              {messagesPath && (
                <Link
                  to={messagesPath}
                  className={cn(
                    "relative p-2 rounded-full transition-all duration-200 hidden lg:flex items-center",
                    location.pathname === messagesPath
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <MessageSquare className="h-4.5 w-4.5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="default"
                      className="absolute -top-1 -right-1 h-4.5 min-w-4.5 p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground border-2 border-background"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Link>
              )}

              {userRole ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 ml-1 rounded-full hover:bg-muted">
                      <div className="relative">
                        <Avatar className="h-7 w-7 ring-2 ring-primary/20 transition-all duration-200 hover:ring-primary/50">
                          <AvatarImage src={profile?.avatar_url ?? undefined} />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        {/* Online indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-background" />
                      </div>
                      <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
                        {profile?.full_name || "Account"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-[var(--shadow-medium)]">
                    <div className="px-3 py-2.5">
                      <p className="text-sm font-semibold truncate">{profile?.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="rounded-full">Login</Button>
                  </Link>
                  <Link to="/login">
                    <Button size="sm" className="rounded-full shadow-[var(--shadow-emerald-glow)] hover:shadow-[var(--glow-hover)] transition-shadow duration-300">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}

              {userRole && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden ml-1 rounded-full"
                  onClick={() => setMobileOpen(!mobileOpen)}
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          {userRole && mobileOpen && (
            <div className="lg:hidden border-t border-border/40 px-4 py-3 space-y-0.5">
              {allLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-[var(--shadow-emerald-glow)]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <link.icon className="h-4.5 w-4.5" />
                    {link.label}
                    {link.badge && link.badge > 0 ? (
                      <Badge variant="default" className="ml-auto text-xs bg-destructive text-destructive-foreground">
                        {link.badge > 9 ? "9+" : link.badge}
                      </Badge>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
