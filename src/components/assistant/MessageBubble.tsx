import React from "react";
import { cn } from "@/lib/utils";
import { Bot, User as UserIcon } from "lucide-react";

interface Props {
  role: "user" | "ai";
  children: React.ReactNode;
}

const MessageBubble: React.FC<Props> = ({ role, children }) => {
  const isUser = role === "user";
  return (
    <div className={cn("flex gap-2 w-full", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="mt-1 h-7 w-7 flex-none rounded-full bg-primary/15 text-primary flex items-center justify-center">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-secondary text-secondary-foreground rounded-bl-md"
        )}
      >
        {children}
      </div>
      {isUser && (
        <div className="mt-1 h-7 w-7 flex-none rounded-full bg-muted text-muted-foreground flex items-center justify-center">
          <UserIcon className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
