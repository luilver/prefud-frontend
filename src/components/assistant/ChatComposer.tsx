import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

const ChatComposer: React.FC<Props> = ({ onSend, disabled }) => {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const { t } = useLanguage();

  useEffect(() => { ref.current?.focus(); }, []);

  const submit = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
    requestAnimationFrame(() => ref.current?.focus());
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(); }}
      className="flex items-end gap-2 border-t border-border bg-background/90 backdrop-blur p-3 safe-area-bottom"
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
        }}
        rows={1}
        placeholder={t("assistant.composer.placeholder")}
        disabled={disabled}
        className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-base leading-6 outline-none focus:ring-2 focus:ring-ring max-h-32"
      />
      <Button type="submit" size="icon" disabled={disabled || !value.trim()} aria-label="Enviar">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default ChatComposer;
