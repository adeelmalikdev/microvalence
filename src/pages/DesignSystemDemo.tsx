import { GlassContainer } from "@/components/ui/GlassContainer";
import { EmeraldButton } from "@/components/ui/EmeraldButton";
import { emeraldPalette } from "@/design-system/colors/emerald-theme";
import { motion } from "framer-motion";
import { ArrowRight, Star, Sparkles, Heart, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const shadeKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
 
 export default function DesignSystemDemo() {
   return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 p-8">
      {/* Animated background shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

       <div className="max-w-6xl mx-auto space-y-12">
         {/* Header */}
         <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center"
         >
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-foreground mb-4"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{
              background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
             🌿 Emerald Design System
          </motion.h1>
           <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Glassmorphism meets vibrant emerald green. Premium components with smooth animations and glowing effects.
           </p>
         </motion.div>
 
         {/* Glass Containers Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Sparkles className="text-primary" size={24} />
            Glass Containers
          </h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <GlassContainer variant="light" className="p-6">
              <Star className="text-primary mb-3" size={32} />
               <h3 className="text-lg font-semibold text-foreground mb-2">Light Variant</h3>
               <p className="text-muted-foreground text-sm">
                Subtle glass effect with white background tint. Perfect for cards and content areas.
               </p>
             </GlassContainer>
 
             <GlassContainer variant="medium" glow className="p-6">
              <Zap className="text-primary mb-3" size={32} />
              <h3 className="text-lg font-semibold text-foreground mb-2">Medium + Glow</h3>
               <p className="text-muted-foreground text-sm">
                Enhanced with emerald glow effect. Great for featured content.
               </p>
             </GlassContainer>
 
             <GlassContainer variant="emerald" className="p-6">
              <Heart className="text-primary mb-3" size={32} />
              <h3 className="text-lg font-semibold text-foreground mb-2">Full Emerald</h3>
               <p className="text-muted-foreground text-sm">
                Maximum emerald theme with hover lift effect.
               </p>
             </GlassContainer>
           </div>
        </motion.section>
 
         {/* Buttons Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Zap className="text-primary" size={24} />
            Emerald Buttons
          </h2>
           <GlassContainer variant="light" className="p-8">
             <div className="space-y-6">
               {/* Primary Buttons */}
               <div>
                 <h3 className="text-lg font-semibold text-foreground mb-4">Primary</h3>
                 <div className="flex flex-wrap gap-4">
                   <EmeraldButton size="sm">Small</EmeraldButton>
                   <EmeraldButton size="md">Medium</EmeraldButton>
                   <EmeraldButton size="lg">Large</EmeraldButton>
                   <EmeraldButton size="md" leftIcon={<Star size={18} />}>
                     With Icon
                   </EmeraldButton>
                   <EmeraldButton size="md" rightIcon={<ArrowRight size={18} />}>
                     Next Step
                   </EmeraldButton>
                   <EmeraldButton size="md" isLoading>
                     Loading...
                   </EmeraldButton>
                 </div>
               </div>
 
               {/* Secondary Buttons */}
               <div>
                 <h3 className="text-lg font-semibold text-foreground mb-4">Secondary</h3>
                 <div className="flex flex-wrap gap-4">
                   <EmeraldButton variant="secondary" size="sm">Small</EmeraldButton>
                   <EmeraldButton variant="secondary" size="md">Medium</EmeraldButton>
                   <EmeraldButton variant="secondary" size="lg">Large</EmeraldButton>
                   <EmeraldButton variant="secondary" leftIcon={<Heart size={18} />}>
                     Favorite
                   </EmeraldButton>
                 </div>
               </div>
 
               {/* Outline Buttons */}
               <div>
                 <h3 className="text-lg font-semibold text-foreground mb-4">Outline</h3>
                 <div className="flex flex-wrap gap-4">
                   <EmeraldButton variant="outline" size="sm">Small</EmeraldButton>
                   <EmeraldButton variant="outline" size="md">Medium</EmeraldButton>
                   <EmeraldButton variant="outline" size="lg">Large</EmeraldButton>
                   <EmeraldButton variant="outline" leftIcon={<Sparkles size={18} />}>
                     Premium
                   </EmeraldButton>
                 </div>
               </div>
 
               {/* Ghost Buttons */}
               <div>
                 <h3 className="text-lg font-semibold text-foreground mb-4">Ghost</h3>
                 <div className="flex flex-wrap gap-4">
                   <EmeraldButton variant="ghost" size="sm">Small</EmeraldButton>
                   <EmeraldButton variant="ghost" size="md">Medium</EmeraldButton>
                   <EmeraldButton variant="ghost" size="lg">Large</EmeraldButton>
                 </div>
               </div>
             </div>
           </GlassContainer>
        </motion.section>
 
         {/* Color Palette Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Star className="text-primary" size={24} />
            Emerald Color Palette
          </h2>
           <GlassContainer variant="light" className="p-8">
            <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
               {shadeKeys.map((shade) => (
                 <motion.div
                   key={shade}
                  className="flex flex-col items-center cursor-pointer"
                   whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                 >
                   <div
                    className="w-14 h-14 md:w-16 md:h-16 rounded-xl shadow-lg mb-2"
                     style={{ backgroundColor: emeraldPalette.primary[shade] }}
                   />
                  <span className="text-xs font-bold text-foreground">{shade}</span>
                  <span className="text-[10px] text-muted-foreground">{emeraldPalette.primary[shade]}</span>
                 </motion.div>
               ))}
             </div>
 
            <h3 className="text-lg font-semibold text-foreground mb-4 mt-8">Accent Palette</h3>
            <div className="flex flex-wrap gap-4">
               {Object.entries(emeraldPalette.accent).map(([name, color]) => (
                 <motion.div
                   key={name}
                   className="flex flex-col items-center"
                   whileHover={{ scale: 1.1 }}
                 >
                   <div
                    className="w-16 h-16 rounded-xl shadow-lg mb-2"
                     style={{ backgroundColor: color }}
                   />
                   <span className="text-xs font-medium text-muted-foreground capitalize">{name}</span>
                  <span className="text-[10px] text-muted-foreground">{color}</span>
                 </motion.div>
               ))}
             </div>
           </GlassContainer>
        </motion.section>

        {/* Interactive Cards Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Heart className="text-primary" size={24} />
            Interactive Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <GlassContainer key={i} variant="medium" glow className="p-6">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xl mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {i}
                </motion.div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Feature Card {i}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Hover over this card to see the glass effect with emerald glow animation.
                </p>
                <EmeraldButton size="sm" variant="outline">
                  Learn More
                </EmeraldButton>
              </GlassContainer>
            ))}
          </div>
        </motion.section>
 
         {/* Interactive Demo */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Sparkles className="text-primary" size={24} />
            Premium Experience
          </h2>
           <GlassContainer variant="emerald" glow className="p-8">
             <div className="text-center">
               <motion.div
                 animate={{
                   boxShadow: [
                     "0 0 20px hsl(var(--primary) / 0.3)",
                     "0 0 40px hsl(var(--primary) / 0.6)",
                     "0 0 20px hsl(var(--primary) / 0.3)",
                   ],
                 }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="inline-block p-1 rounded-full mb-6"
               >
                 <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                   <Sparkles className="w-12 h-12 text-primary-foreground" />
                 </div>
               </motion.div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Ready for Production</h3>
               <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                This design system is production-ready with smooth animations, accessibility features, and responsive design.
               </p>
               <div className="flex justify-center gap-4">
                <EmeraldButton rightIcon={<ArrowRight size={18} />}>
                  Get Started
                </EmeraldButton>
                <EmeraldButton variant="secondary">
                  View Documentation
                </EmeraldButton>
               </div>
             </div>
           </GlassContainer>
        </motion.section>

        {/* Glassmorphic Form Example */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Star className="text-primary" size={24} />
            Glassmorphic Form
          </h2>
          <div className="max-w-md mx-auto">
            <GlassContainer variant="medium" glow className="p-8">
              <h3 className="text-xl font-bold text-foreground mb-6 text-center">Sign In</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <EmeraldButton className="w-full" size="lg">
                  Sign In
                </EmeraldButton>
              </form>
            </GlassContainer>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center py-8 text-muted-foreground"
        >
          <p>Built with 💚 using the Emerald Design System</p>
          <Link to="/login" className="text-primary hover:underline mt-2 inline-block">
            Go to Login →
          </Link>
        </motion.footer>
       </div>
     </div>
   );
 }