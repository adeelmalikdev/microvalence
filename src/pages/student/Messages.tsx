import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageSquare, RefreshCw } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConversationList } from "@/components/messaging/ConversationList";
import { ChatWindow } from "@/components/messaging/ChatWindow";
import { useConversations, useConversationByApplication } from "@/hooks/useConversations";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQueryClient } from "@tanstack/react-query";

export default function StudentMessages() {
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get("app");
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading, isFetching } = useConversations();
  const { data: conversationByApp } = useConversationByApplication(applicationId ?? undefined);

  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (conversationByApp) {
      setSelectedId(conversationByApp.id);
      setShowChat(true);
    }
  }, [conversationByApp]);

  useEffect(() => {
    if (!isMobile && conversations.length > 0 && !selectedId) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, isMobile, selectedId]);

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
    if (selectedId) {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedId] });
    }
  };

  return (
    <div className="container py-8">
      <BackButton fallbackPath="/student/dashboard" className="mb-6" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <MessageSquare className="h-8 w-8" />
            Messages
          </h1>
          <p className="text-muted-foreground">
            Communicate with recruiters about your internships
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="h-[calc(100vh-220px)] overflow-hidden">
        <div className="flex h-full">
          <div className={`w-full md:w-80 border-r ${isMobile && showChat ? "hidden" : "block"}`}>
            <div className="p-4 border-b">
              <h2 className="font-semibold text-foreground">Conversations</h2>
            </div>
            <ConversationList
              conversations={conversations}
              selectedId={selectedId}
              onSelect={(id) => { setSelectedId(id); setShowChat(true); }}
              isLoading={isLoading}
            />
          </div>

          <div className={`flex-1 flex flex-col ${isMobile && !showChat ? "hidden" : "flex"}`}>
            {isMobile && showChat && (
              <button
                onClick={() => setShowChat(false)}
                className="p-3 border-b text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
              >
                ← Back to conversations
              </button>
            )}
            <ChatWindow
              conversationId={selectedId}
              otherUserName={selectedConversation?.other_user_name ?? ""}
              opportunityTitle={selectedConversation?.opportunity_title ?? ""}
              companyName={selectedConversation?.company_name ?? ""}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
