import React from "react";
import { AssistantProvider } from "@/contexts/AssistantContext";
import ChatPane from "@/components/assistant/ChatPane";
import WorkspacePane from "@/components/assistant/WorkspacePane";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

interface AssistantProps {
  isEmbedded?: boolean;
}

const AssistantInner: React.FC<{ isEmbedded?: boolean }> = ({ isEmbedded }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  useDocumentTitle("prefud AI Assistant");

  if (isMobile) {
    if (isEmbedded) {
      return (
        <div className="flex flex-col h-[calc(100vh-220px)] bg-background rounded-2xl overflow-hidden shadow-lg border border-border relative z-10">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
            <span className="font-semibold text-sm">prefud AI</span>
          </div>
          <div className="flex-1 min-h-0 bg-background">
            <ChatPane />
          </div>
        </div>
      );
    }
    return (
      <div className="fixed inset-0 flex flex-col bg-background">
        <div className="flex items-center gap-2 px-2 py-2 border-b border-border safe-area-top">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Volver">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-sm">prefud AI</span>
        </div>
        <div className="flex-1 min-h-0">
          <ChatPane />
        </div>
      </div>
    );
  }

  if (isEmbedded) {
    return (
      <main className="h-[calc(100vh-140px)] w-full grid grid-cols-[35%_65%] bg-background/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-border/50 relative z-10">
        <aside className="border-r border-border/50 h-full min-h-0">
          <ChatPane />
        </aside>
        <section className="h-full min-h-0 bg-muted/20">
          <WorkspacePane />
        </section>
      </main>
    );
  }

  return (
    <main className="h-dvh w-full grid grid-cols-[35%_65%]">
      <aside className="border-r border-border h-full min-h-0">
        <ChatPane />
      </aside>
      <section className="h-full min-h-0 bg-muted/20">
        <WorkspacePane />
      </section>
    </main>
  );
};

const Assistant: React.FC<AssistantProps> = ({ isEmbedded }) => (
  <AssistantProvider>
    <AssistantInner isEmbedded={isEmbedded} />
  </AssistantProvider>
);

export default Assistant;
