 import { useState } from "react";
 import { Send } from "lucide-react";
 import { motion, AnimatePresence } from "framer-motion";
 import { format } from "date-fns";
 import { useGroupChat } from "../hooks/useGroupChat";
 import { useAuth } from "@/hooks/useAuth";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Skeleton } from "@/components/ui/skeleton";
 
 interface GroupChatProps {
   groupId: string;
 }
 
 export function GroupChat({ groupId }: GroupChatProps) {
   const [newMessage, setNewMessage] = useState("");
   const { messages, isLoading, isSending, sendMessage, messagesEndRef } =
     useGroupChat(groupId);
   const { user, profile } = useAuth();
 
   const handleSend = async () => {
     if (!newMessage.trim()) return;
     const success = await sendMessage(newMessage);
     if (success) {
       setNewMessage("");
     }
   };
 
   const handleKeyPress = (e: React.KeyboardEvent) => {
     if (e.key === "Enter" && !e.shiftKey) {
       e.preventDefault();
       handleSend();
     }
   };
 
   const userInitials = profile?.full_name
     ?.split(" ")
     .map((n) => n[0])
     .join("")
     .toUpperCase() || user?.email?.[0]?.toUpperCase() || "?";
 
   return (
     <div className="flex flex-col h-[500px] bg-card/50 rounded-2xl border-2 border-primary/20 overflow-hidden">
       {/* Messages */}
       <div className="flex-1 overflow-y-auto p-4 space-y-4">
         {isLoading ? (
           Array.from({ length: 5 }).map((_, i) => (
             <div key={i} className="flex gap-3">
               <Skeleton className="h-10 w-10 rounded-full" />
               <div className="space-y-2">
                 <Skeleton className="h-4 w-24" />
                 <Skeleton className="h-16 w-48" />
               </div>
             </div>
           ))
         ) : messages.length === 0 ? (
           <div className="flex items-center justify-center h-full">
             <p className="text-muted-foreground text-center">
               No messages yet. Start the conversation!
             </p>
           </div>
         ) : (
           <AnimatePresence initial={false}>
             {messages.map((msg) => {
               const isOwn = msg.sender_id === user?.id;
               const senderName =
                 msg.sender_profile?.full_name ||
                 `User ${msg.sender_id.slice(0, 8)}`;
               const initials = senderName
                 .split(" ")
                 .map((n) => n[0])
                 .join("")
                 .toUpperCase()
                 .slice(0, 2);
 
               return (
                 <motion.div
                   key={msg.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                 >
                   <Avatar className="h-10 w-10 flex-shrink-0">
                     <AvatarImage
                       src={msg.sender_profile?.avatar_url || undefined}
                     />
                     <AvatarFallback className="bg-primary/20 text-primary text-sm">
                       {initials}
                     </AvatarFallback>
                   </Avatar>
 
                   <div
                     className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}
                   >
                     <div
                       className={`rounded-2xl px-4 py-2 ${
                         isOwn
                           ? "bg-primary text-primary-foreground rounded-br-sm"
                           : "bg-muted rounded-bl-sm"
                       }`}
                     >
                       {!isOwn && (
                         <span className="text-xs font-medium opacity-70 block mb-1">
                           {senderName}
                         </span>
                       )}
                       <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                     </div>
                     <span className="text-xs text-muted-foreground mt-1 block px-2">
                       {format(new Date(msg.created_at), "HH:mm")}
                     </span>
                   </div>
                 </motion.div>
               );
             })}
           </AnimatePresence>
         )}
         <div ref={messagesEndRef} />
       </div>
 
       {/* Input */}
       <div className="p-4 border-t border-border/50 bg-background/50">
         <div className="flex gap-2">
           <Avatar className="h-10 w-10">
             <AvatarImage src={profile?.avatar_url || undefined} />
             <AvatarFallback className="bg-primary/10 text-primary">
               {userInitials}
             </AvatarFallback>
           </Avatar>
           <Input
             value={newMessage}
             onChange={(e) => setNewMessage(e.target.value)}
             onKeyDown={handleKeyPress}
             placeholder={user ? "Type a message..." : "Sign in to send messages"}
             className="flex-1 bg-muted/50 border-primary/20"
             disabled={!user}
           />
           <Button
             onClick={handleSend}
             disabled={!newMessage.trim() || isSending || !user}
             size="icon"
             className="bg-primary hover:bg-primary/90 shadow-[0_0_10px_hsl(var(--primary)/0.3)]"
           >
             <Send className="h-4 w-4" />
           </Button>
         </div>
       </div>
     </div>
   );
 }