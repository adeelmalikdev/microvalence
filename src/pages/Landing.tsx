import { Link } from "react-router-dom";
import { ArrowRight, Users, Building2, CheckCircle, TrendingUp, Target, BookOpen, Award, Clock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

// 3D Icon wrapper component
function Icon3D({ icon: IconComponent }: { icon: LucideIcon }) {
  return (
    <div className="relative group/icon">
      {/* 3D shadow layers */}
      <div className="absolute inset-0 bg-primary/20 rounded-xl translate-x-1 translate-y-1 blur-sm" />
      <div className="absolute inset-0 bg-primary/30 rounded-xl translate-x-0.5 translate-y-0.5" />
      
      {/* Icon container with gradient */}
      <div className="relative p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[0_0_20px_hsl(var(--primary)/0.4)] group-hover/icon:scale-110 group-hover/icon:rotate-3 transition-all duration-300">
        <IconComponent className="h-6 w-6 text-primary-foreground" />
      </div>
    </div>
  );
}

const howItWorks = [
  {
    step: 1,
    icon: Users,
    title: "Create Your Profile",
    description: "Build your portfolio with skills, projects, and achievements",
  },
  {
    step: 2,
    icon: Building2,
    title: "Browse Opportunities",
    description: "Explore micro-internships tailored to CS/IT/SE students",
  },
  {
    step: 3,
    icon: Award,
    title: "Gain Experience",
    description: "Complete tasks, get feedback, and earn certificates",
  },
];

const benefits = [
  {
    icon: Target,
    title: "Real Projects",
    description: "Work on actual industry tasks that matter",
  },
  {
    icon: Award,
    title: "Earn Certificates",
    description: "Get verified certificates for your portfolio",
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    description: "Complete micro-internships around your classes",
  },
];

const features = [
  { icon: Target, label: "Opportunities" },
  { icon: BookOpen, label: "Learning" },
  { icon: Award, label: "Certificates" },
  { icon: Clock, label: "Flexible" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted via-background to-muted">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Build Your Portfolio with{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Micro-Internships</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Connect with industry recruiters, gain real-world experience, and showcase your skills through short-term, impactful projects.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/login">
                  <Button size="lg" className="gap-2">
                    Start Your Journey
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login?role=recruiter">
                  <Button variant="outline" size="lg">
                    For Recruiters
                  </Button>
                </Link>
              </div>
            </div>

            <div className="hidden lg:grid grid-cols-2 gap-4">
              {features.map((feature) => (
                <Card key={feature.label} className="bg-background/90 border-2 border-primary/50 shadow-[0_0_15px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="mb-3">
                      <Icon3D icon={feature.icon} />
                    </div>
                    <span className="font-medium text-foreground">{feature.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to kickstart your professional journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item) => (
              <Card key={item.step} className="bg-background/95 border-2 border-primary/50 shadow-[0_0_15px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] transition-all duration-300 hover:-translate-y-1 relative">
                <div className="absolute -top-3 left-6">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg">
                    {item.step}
                  </span>
                </div>
                <CardContent className="p-6 pt-8">
                  <div className="mb-4">
                    <Icon3D icon={item.icon} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Why Choose Valence?</h2>
            <p className="text-muted-foreground">
              Built specifically for IIUI SE/IT/CS students
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-background/95 border-2 border-primary/50 shadow-[0_0_15px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <Icon3D icon={benefit.icon} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-primary via-accent to-secondary rounded-xl mx-4 mb-8">
        <div className="container text-center relative z-10">
          <h2 className="text-3xl font-bold text-primary-foreground mb-3">
            Ready to Gain Real Experience?
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
            Join IIUI SE/IT/CS students in building professional portfolios through micro-internships
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="gap-2 bg-background text-foreground hover:bg-background/90">
              Get Started Now
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
