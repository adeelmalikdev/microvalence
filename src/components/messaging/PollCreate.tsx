import { useState } from "react";
import { Plus, X, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface PollCreateProps {
  groupId?: string;
  conversationId?: string;
  onCreated: () => void;
  onCancel: () => void;
}

export function PollCreate({ groupId, conversationId, onCreated, onCancel }: PollCreateProps) {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addOption = () => {
    if (options.length < 6) setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user || !question.trim()) return;
    const validOptions = options.filter((o) => o.trim());
    if (validOptions.length < 2) {
      toast.error("Add at least 2 options");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("polls").insert({
        group_id: groupId || null,
        conversation_id: conversationId || null,
        creator_id: user.id,
        question: question.trim(),
        options: validOptions.map((o) => o.trim()),
      } as any);

      if (error) throw error;
      toast.success("Poll created!");
      onCreated();
    } catch {
      toast.error("Failed to create poll");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-3 border rounded-lg bg-muted/30 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <BarChart3 className="h-4 w-4 text-primary" />
        Create a Poll
      </div>
      <Input
        placeholder="Ask a question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <Input
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => {
                const newOpts = [...options];
                newOpts[i] = e.target.value;
                setOptions(newOpts);
              }}
            />
            {options.length > 2 && (
              <Button variant="ghost" size="icon" onClick={() => removeOption(i)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        {options.length < 6 && (
          <Button variant="ghost" size="sm" onClick={addOption} className="gap-1">
            <Plus className="h-3 w-3" /> Add Option
          </Button>
        )}
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={handleSubmit} disabled={isSubmitting || !question.trim()}>
          Create Poll
        </Button>
      </div>
    </div>
  );
}
