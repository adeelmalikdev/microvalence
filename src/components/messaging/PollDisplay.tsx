import { useState, useEffect } from "react";
import { BarChart3, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface PollDisplayProps {
  poll: {
    id: string;
    question: string;
    options: string[];
    creator_id: string;
    is_active: boolean;
  };
}

export function PollDisplay({ poll }: PollDisplayProps) {
  const { user } = useAuth();
  const [votes, setVotes] = useState<{ option_index: number; user_id: string }[]>([]);
  const [userVote, setUserVote] = useState<number | null>(null);

  useEffect(() => {
    fetchVotes();

    const channel = supabase
      .channel(`poll-${poll.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "poll_votes", filter: `poll_id=eq.${poll.id}` }, () => {
        fetchVotes();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [poll.id]);

  const fetchVotes = async () => {
    const { data } = await supabase
      .from("poll_votes")
      .select("option_index, user_id")
      .eq("poll_id", poll.id);
    if (data) {
      setVotes(data);
      const myVote = data.find((v) => v.user_id === user?.id);
      setUserVote(myVote ? myVote.option_index : null);
    }
  };

  const handleVote = async (optionIndex: number) => {
    if (!user || !poll.is_active) return;

    if (userVote !== null) {
      // Change vote: delete old, insert new
      await supabase.from("poll_votes").delete().eq("poll_id", poll.id).eq("user_id", user.id);
    }

    await supabase.from("poll_votes").insert({
      poll_id: poll.id,
      user_id: user.id,
      option_index: optionIndex,
    } as any);

    setUserVote(optionIndex);
  };

  const totalVotes = votes.length;
  const hasVoted = userVote !== null;
  const options = Array.isArray(poll.options) ? poll.options : [];

  return (
    <div className="p-3 border rounded-lg bg-muted/30 space-y-2 my-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <BarChart3 className="h-4 w-4 text-primary" />
        {poll.question}
      </div>
      <div className="space-y-1.5">
        {options.map((option: string, i: number) => {
          const optionVotes = votes.filter((v) => v.option_index === i).length;
          const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
          const isSelected = userVote === i;

          return (
            <Button
              key={i}
              variant="ghost"
              className={cn(
                "w-full justify-start relative h-auto py-2 px-3 overflow-hidden",
                isSelected && "border border-primary"
              )}
              onClick={() => handleVote(i)}
              disabled={!poll.is_active}
            >
              {hasVoted && (
                <div
                  className="absolute inset-0 bg-primary/10 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              )}
              <span className="relative flex items-center gap-2 text-sm w-full">
                {isSelected && <Check className="h-3 w-3 text-primary shrink-0" />}
                <span className="flex-1 text-left">{option}</span>
                {hasVoted && <span className="text-xs text-muted-foreground">{percentage}%</span>}
              </span>
            </Button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</p>
    </div>
  );
}
