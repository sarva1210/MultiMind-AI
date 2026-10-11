import { Send } from "lucide-react";

export default function ChatComposer({ inputValue, messages, isStreaming, textareaRef, onInputChange, onKeyDown, onFocus, onSubmit }) {
  return (
    <div className="sticky bottom-0 flex w-full justify-center bg-gradient-to-t from-zinc-50 via-zinc-50/90 to-transparent p-3 pt-10 dark:from-zinc-950 dark:via-zinc-950/90 md:p-6 md:pt-12">
      <div className="w-full rounded-2xl border border-zinc-200 bg-zinc-100 p-1.5 shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-blue-500/50 dark:border-zinc-800 dark:bg-zinc-900 md:max-w-3xl md:rounded-3xl">
        <form
          onSubmit={onSubmit}
          className="relative flex items-end overflow-hidden rounded-xl bg-white dark:bg-zinc-950 md:rounded-2xl"
        >
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            placeholder={
              messages.length > 0
                ? "Continue this battle with another question..."
                : "Ask a coding question to start the battle..."
            }
            className="min-h-[44px] w-full resize-none border-none bg-transparent py-3 pl-4 pr-12 text-sm leading-relaxed text-zinc-900 outline-none placeholder-zinc-400 focus:ring-0 dark:text-zinc-100 md:text-base"
            rows={1}
            style={{
              maxHeight: `${Math.floor(window.innerHeight * 0.4)}px`,
              overflowY: "auto",
            }}
          />

          <div className="absolute bottom-2 right-2">
            <button
              type="submit"
              disabled={!inputValue.trim() || isStreaming}
              className="flex items-center justify-center rounded-full bg-zinc-900 p-1.5 text-white shadow-sm transition-transform hover:bg-zinc-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              title="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>

        <div className="mb-0.5 mt-1.5 text-center">
          <span className="text-[10px] font-medium text-zinc-400">
            AI can make mistakes. Verify important code.
          </span>
        </div>
      </div>
    </div>
  );
}