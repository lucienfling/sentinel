import { useState, useRef, useEffect } from "react";
import { useListOpenaiConversations, useGetOpenaiConversation, useCreateOpenaiConversation, useDeleteOpenaiConversation } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Plus, Trash2, Send, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { getListOpenaiConversationsQueryKey, getGetOpenaiConversationQueryKey } from "@workspace/api-client-react";

export default function Chat() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const { data: conversations } = useListOpenaiConversations();
  const createConversation = useCreateOpenaiConversation();
  const deleteConversation = useDeleteOpenaiConversation();
  const queryClient = useQueryClient();

  const handleCreate = () => {
    createConversation.mutate({ data: { title: "New Intelligence Query" } }, {
      onSuccess: (newConv) => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        setActiveId(newConv.id);
      }
    });
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        if (activeId === id) setActiveId(null);
      }
    });
  };

  useEffect(() => {
    if (conversations?.length && !activeId) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  return (
    <div className="flex h-full w-full">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-[#0a0a0b] flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Analyst Queries</h2>
          <Button variant="ghost" size="icon" onClick={handleCreate} disabled={createConversation.isPending}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations?.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveId(conv.id)}
              className={cn(
                "w-full text-left px-3 py-3 rounded-md transition-colors group flex items-center justify-between",
                activeId === conv.id ? "bg-[#16161A] text-foreground" : "text-muted-foreground hover:bg-[#16161A]/50 hover:text-foreground"
              )}
            >
              <div className="truncate pr-4">
                <div className="text-sm font-medium truncate">{conv.title}</div>
                <div className="text-xs opacity-50 mt-1">{format(new Date(conv.createdAt), "MMM d, HH:mm")}</div>
              </div>
              <button 
                onClick={(e) => handleDelete(conv.id, e)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </button>
          ))}
          {conversations?.length === 0 && (
            <div className="text-center p-4 text-sm text-muted-foreground">
              No previous queries.
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-[#0a0a0b] flex flex-col relative">
        {activeId ? <ChatView conversationId={activeId} /> : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select or start a new intelligence query.
          </div>
        )}
      </div>
    </div>
  );
}

function ChatView({ conversationId }: { conversationId: number }) {
  const { data: conversation } = useGetOpenaiConversation(conversationId, {
    query: { enabled: !!conversationId, queryKey: getGetOpenaiConversationQueryKey(conversationId) }
  });
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages, streamingContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage = input;
    setInput("");
    
    // Optimistic UI update for user message
    queryClient.setQueryData(getGetOpenaiConversationQueryKey(conversationId), (old: any) => {
      if (!old) return old;
      return {
        ...old,
        messages: [...old.messages, { id: Date.now(), role: "user", content: userMessage, createdAt: new Date().toISOString() }]
      };
    });

    setIsStreaming(true);
    setStreamingContent("");

    try {
      const response = await fetch(`/api/openai/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userMessage }),
        credentials: 'include',
      });

      if (!response.ok) throw new Error("Stream failed");

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(line => line.startsWith("data: "));
        
        for (const line of lines) {
          const dataStr = line.replace("data: ", "");
          try {
            const data = JSON.parse(dataStr);
            if (data.done) {
              break;
            } else if (data.content) {
              accumulatedResponse += data.content;
              setStreamingContent(accumulatedResponse);
            }
          } catch (e) {
            // parsing error on partial chunks, ignore
          }
        }
      }

      // Refresh to get final state
      queryClient.invalidateQueries({ queryKey: getGetOpenaiConversationQueryKey(conversationId) });
      queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() }); // Refresh title if it changed
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="text-center pb-8 border-b border-white/5 mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-light text-foreground">Sentinel AI Analyst</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            I have context on your calendar, emails, and active projects. What intelligence do you require?
          </p>
        </div>

        {conversation?.messages.map((msg, i) => (
          <div key={msg.id || i} className={cn("flex gap-4", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
            <div className={cn(
              "shrink-0 h-8 w-8 rounded-md flex items-center justify-center",
              msg.role === "user" ? "bg-secondary" : "bg-primary/20"
            )}>
              {msg.role === "user" ? <User className="h-4 w-4 text-foreground" /> : <Bot className="h-4 w-4 text-primary" />}
            </div>
            <div className={cn(
              "max-w-[80%] rounded-2xl px-5 py-3.5 text-sm whitespace-pre-wrap leading-relaxed",
              msg.role === "user" ? "bg-secondary text-foreground" : "bg-transparent text-foreground/90 border border-white/5"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isStreaming && (
          <div className="flex gap-4 flex-row">
            <div className="shrink-0 h-8 w-8 rounded-md flex items-center justify-center bg-primary/20">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="max-w-[80%] rounded-2xl px-5 py-3.5 text-sm whitespace-pre-wrap leading-relaxed bg-transparent text-foreground/90 border border-white/5 flex items-center">
              {streamingContent || <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-[#0a0a0b] border-t border-border">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Query intelligence database..."
            className="w-full bg-[#16161A] border border-border rounded-xl pl-4 pr-12 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="absolute right-2 p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </>
  );
}