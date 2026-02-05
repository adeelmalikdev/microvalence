 import { GlassContainer } from "@/components/ui/GlassContainer";
 import { EmeraldButton } from "@/components/ui/EmeraldButton";
 import { emeraldPalette } from "@/design-system/colors/emerald-theme";
 import { motion } from "framer-motion";
 import { ArrowRight, Star, Sparkles, Heart } from "lucide-react";
 import { Link } from "react-router-dom";
 
 const shadeKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
 
 export default function DesignSystemDemo() {
   return (
     <div className="min-h-screen bg-gradient-to-br from-muted via-background to-primary/5 p-8">
       <div className="max-w-6xl mx-auto space-y-12">
         {/* Header */}
         <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center"
         >
           <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
             🌿 Emerald Design System
           </h1>
           <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
             A beautiful glassmorphic design system with emerald green as the primary color.
             Featuring smooth animations, glowing effects, and premium components.
           </p>
           <Link to="/" className="text-primary hover:underline mt-4 inline-block">
             ← Back to Home
           </Link>
         </motion.div>
 
         {/* Glass Containers Section */}
         <section>
           <h2 className="text-2xl font-bold text-foreground mb-6">Glass Containers</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <GlassContainer variant="light" className="p-6">
               <h3 className="text-lg font-semibold text-foreground mb-2">Light Variant</h3>
               <p className="text-muted-foreground text-sm">
                 Subtle glassmorphism effect with white background tint.
               </p>
             </GlassContainer>
 
             <GlassContainer variant="medium" glow className="p-6">
               <h3 className="text-lg font-semibold text-foreground mb-2">Medium with Glow</h3>
               <p className="text-muted-foreground text-sm">
                 Enhanced emerald glow effect for highlighted content.
               </p>
             </GlassContainer>
 
             <GlassContainer variant="emerald" className="p-6">
               <h3 className="text-lg font-semibold text-foreground mb-2">Emerald Variant</h3>
               <p className="text-muted-foreground text-sm">
                 Full emerald theme with stronger brand presence.
               </p>
             </GlassContainer>
           </div>
         </section>
 
         {/* Buttons Section */}
         <section>
           <h2 className="text-2xl font-bold text-foreground mb-6">Emerald Buttons</h2>
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
         </section>
 
         {/* Color Palette Section */}
         <section>
           <h2 className="text-2xl font-bold text-foreground mb-6">Color Palette</h2>
           <GlassContainer variant="light" className="p-8">
             <h3 className="text-lg font-semibold text-foreground mb-4">Primary Emerald</h3>
             <div className="flex flex-wrap gap-3">
               {shadeKeys.map((shade) => (
                 <motion.div
                   key={shade}
                   className="flex flex-col items-center"
                   whileHover={{ scale: 1.1 }}
                 >
                   <div
                     className="w-16 h-16 rounded-xl shadow-md mb-2"
                     style={{ backgroundColor: emeraldPalette.primary[shade] }}
                   />
                   <span className="text-xs font-medium text-muted-foreground">{shade}</span>
                 </motion.div>
               ))}
             </div>
 
             <h3 className="text-lg font-semibold text-foreground mb-4 mt-8">Accent Colors</h3>
             <div className="flex flex-wrap gap-3">
               {Object.entries(emeraldPalette.accent).map(([name, color]) => (
                 <motion.div
                   key={name}
                   className="flex flex-col items-center"
                   whileHover={{ scale: 1.1 }}
                 >
                   <div
                     className="w-16 h-16 rounded-xl shadow-md mb-2"
                     style={{ backgroundColor: color }}
                   />
                   <span className="text-xs font-medium text-muted-foreground capitalize">{name}</span>
                 </motion.div>
               ))}
             </div>
           </GlassContainer>
         </section>
 
         {/* Interactive Demo */}
         <section>
           <h2 className="text-2xl font-bold text-foreground mb-6">Interactive Demo</h2>
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
               <h3 className="text-2xl font-bold text-foreground mb-2">Premium Experience</h3>
               <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                 Hover over components to see smooth animations and glowing effects.
                 The design system adapts to both light and dark modes.
               </p>
               <div className="flex justify-center gap-4">
                 <EmeraldButton>Get Started</EmeraldButton>
                 <EmeraldButton variant="outline">Learn More</EmeraldButton>
               </div>
             </div>
           </GlassContainer>
         </section>
       </div>
     </div>
   );
 }