import { Swords } from "lucide-react";
import ArenaResponse from "../../../components/ArenaResponse";
import UserMessage from "../../../components/UserMessage";

export default function MessageList({ messages, isLoadingBattle, isStreaming, endOfMessagesRef }) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 md:px-8">
      {isLoadingBattle ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="space-y-3 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-500" />
            <p className="text-sm text-zinc-400">Loading battle...</p>
          </div>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
              <Swords className="h-8 w-8 text-blue-600 dark:text-blue-300" />
            </div>

            <h2 className="mb-3 bg-gradient-to-br from-zinc-900 to-zinc-500 bg-clip-text text-3xl font-medium text-transparent dark:from-zinc-100 dark:to-zinc-500">
              Welcome to the Arena
            </h2>

            <p className="text-lg leading-relaxed text-zinc-500">
              Each battle supports multiple rounds. Send your first query to
              start, then keep going. All turns are saved together.
            </p>
          </div>
        </div>
      ) : (
        messages.map((msg, idx) => (
          <div key={msg.id} className="mb-12">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                <Swords className="h-3 w-3" />
                Turn {idx + 1}
              </span>

              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            </div>

            <UserMessage message={msg.problem} />

            <ArenaResponse
              solution1={msg.solution_1 || (isStreaming && idx === messages.length - 1 ? "Thinking..." : "")}
              solution2={msg.solution_2 || (isStreaming && idx === messages.length - 1 ? "Thinking..." : "")}
              judge={msg.judge}
              isNew={!!msg.isNew}
              isStreaming={isStreaming && idx === messages.length - 1}
            />
          </div>
        ))
      )}

      <div ref={endOfMessagesRef} className="h-24" />
    </main>
  );
}