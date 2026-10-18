import { Swords, MessageSquare, Sparkles } from "lucide-react";
import ArenaResponse from "../../../components/ArenaResponse";
import UserMessage from "../../../components/UserMessage";

export default function MessageList({
  messages,
  isLoadingBattle,
  isStreaming,
  endOfMessagesRef,
}) {
  return (
    <main className="flex w-full min-w-0 flex-1 flex-col px-3 py-5 sm:px-5 md:px-8">
      {isLoadingBattle ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm space-y-5 text-center">
            <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50">
              <Swords className="h-6 w-6 animate-pulse text-blue-600 dark:text-blue-400" />
              <span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-blue-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
                Loading your battle
              </h2>
              <p className="text-sm text-zinc-500">
                Getting your conversation ready...
              </p>
            </div>
            <div className="space-y-3">
              <div className="h-3 w-3/4 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-full animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-xl text-center">
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-sm shadow-blue-500/10 dark:border-blue-900 dark:from-blue-950/70 dark:to-indigo-950/70">
              <Swords className="h-9 w-9 text-blue-600 dark:text-blue-400" />
              <Sparkles className="absolute -right-2 -top-2 h-6 w-6 text-indigo-500 dark:text-indigo-400" />
            </div>

            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300">
              <MessageSquare className="h-3.5 w-3.5" />
              Two AIs. One Arena.
            </p>

            <h2 className="mb-3 bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl dark:from-white dark:via-zinc-200 dark:to-zinc-500">
              Welcome to the Arena
            </h2>

            <p className="mx-auto max-w-md text-sm leading-7 text-zinc-500 sm:text-base dark:text-zinc-400">
              Put your question to the test. Compare two AI-generated
              solutions and see which one the judge considers better.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-900">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <Swords className="h-4 w-4" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  Compare solutions
                </h3>
                <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  Explore two different approaches to your question.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-900">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  AI judge
                </h3>
                <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  Review scores and reasoning from the judge.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-900">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  Continue chatting
                </h3>
                <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  Keep multiple turns together in each battle.
                </p>
              </div>
            </div>

            <p className="mt-6 text-xs text-zinc-400">
              Enter a question below to start your first battle.
            </p>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-5xl">
          {messages.map((msg, idx) => (
            <div key={msg.id || idx} className="mb-8 w-full min-w-0">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                  <Swords className="h-3 w-3" />
                  Turn {idx + 1}
                </span>
                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
              </div>

              <UserMessage message={msg.problem} />

              <ArenaResponse
                solution1={
                  msg.solution_1 ||
                  (isStreaming && idx === messages.length - 1
                    ? "Thinking..."
                    : "")
                }
                solution2={
                  msg.solution_2 ||
                  (isStreaming && idx === messages.length - 1
                    ? "Thinking..."
                    : "")
                }
                judge={msg.judge}
                isNew={!!msg.isNew}
                isStreaming={isStreaming && idx === messages.length - 1}
              />
            </div>
          ))}
        </div>
      )}

      <div ref={endOfMessagesRef} className="h-2 shrink-0" />
    </main>
  );
}