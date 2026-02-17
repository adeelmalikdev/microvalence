import { Link, useLocation, useNavigate } from "react-router-dom";
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
    { path: "/student/tasks", label: "Tasks", icon: ClipboardList },
    { path: "/student/portfolio", label: "Portfolio", icon: FolderOpen },
    { path: "/student/alumni", label: "Alumni", icon: GraduationCap },
    { path: "/student/search", label: "Search", icon: Search },
  ],
  recruiter: [
    { path: "/recruiter/dashboard", label: "Dashboard", icon: Home },
    { path: "/recruiter/post", label: "Post Opportunity", icon: Briefcase },
    { path: "/recruiter/submissions", label: "Reviews", icon: ClipboardList },
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

  // Inject badge into messages link for mobile menu
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
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-2 overflow-visible">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to={userRole ? `/${userRole}/dashboard` : "/"} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">V</span>
            </div>
            <span className="font-bold text-xl text-foreground hidden sm:inline">Valence</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        {userRole && (
          <div className="hidden lg:flex items-center gap-1 min-w-0 flex-wrap">
            {currentLinks.map((link) => {
              const isActive = location.pathname === link.path ||
                (link.path !== `/${userRole}/dashboard` && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Notifications */}
          {userRole && <NotificationBell userRole={userRole} />}

          {/* Messages with badge (desktop) */}
          {messagesPath && (
            <Link
              to={messagesPath}
              className={cn(
                "relative p-2 rounded-lg transition-colors hidden lg:flex items-center",
                location.pathname === messagesPath
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <MessageSquare className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 h-5 min-w-5 p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Link>
          )}

          {/* User dropdown */}
          {userRole ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 ml-1">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
                    {profile?.full_name || "Account"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium truncate">{profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/login">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          {userRole && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden ml-1"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {userRole && mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background px-4 py-3 space-y-1">
          {allLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
                {link.badge && link.badge > 0 ? (
                  <Badge variant="default" className="ml-auto text-xs">
                    {link.badge > 9 ? "9+" : link.badge}
                  </Badge>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
