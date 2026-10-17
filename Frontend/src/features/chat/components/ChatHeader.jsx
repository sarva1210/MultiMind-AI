import { LogIn, LogOut, Menu, Settings2, Swords } from "lucide-react";

export default function ChatHeader({
  user,
  messages,
  activeBattleId,
  isSidebarOpen,
  judgeProvider,
  onOpenSidebar,
  onOpenAuth,
  onSignOut,
  onJudgeProviderChange,
}) {
  return (
    <header className="sticky top-0 z-10 flex w-full items-center justify-between gap-3 border-b border-zinc-200 bg-white/90 px-3 py-3 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90 sm:px-4 md:px-6 md:py-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Open sidebar"
            title="Open sidebar"
            className="shrink-0 rounded-xl border border-zinc-200 p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
            <Swords className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <h1 className="whitespace-nowrap text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-lg md:text-xl">
              AI Battle Arena
            </h1>

            {activeBattleId && messages.length > 0 && (
              <span className="mt-0.5 hidden items-center gap-1 text-[10px] font-medium text-zinc-500 sm:flex">
                <Swords className="h-3 w-3" />
                {messages.length}{" "}
                {messages.length === 1 ? "turn" : "turns"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3 md:gap-4">
        <div className="hidden items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-2 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 sm:flex md:px-3">
          <Settings2 className="h-4 w-4 shrink-0 text-zinc-500" />

          <label
            htmlFor="judge-provider"
            className="text-xs font-medium text-zinc-500 md:text-sm"
          >
            Judge
          </label>

          <select
            id="judge-provider"
            value={judgeProvider}
            onChange={(e) => onJudgeProviderChange(e.target.value)}
            className="max-w-32 cursor-pointer bg-transparent text-xs font-semibold text-zinc-900 outline-none dark:text-zinc-100 md:max-w-none md:text-sm"
          >
            <option value="gemini">Gemini Flash</option>
            <option value="mistral">Mistral Medium</option>
            <option value="cohere">Cohere Command</option>
          </select>
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white ring-2 ring-blue-100 dark:ring-blue-900/50"
              title={user.name || user.email}
            >
              {(user.name || user.email || "U")[0].toUpperCase()}
            </div>

            <button
              type="button"
              onClick={onSignOut}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-2.5 py-2 text-xs font-medium text-zinc-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-400 sm:px-3"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-600 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-blue-500 dark:hover:text-white sm:px-4"
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}