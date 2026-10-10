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
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-zinc-200 bg-white/80 px-4 py-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {!isSidebarOpen && (
          <button
            onClick={onOpenSidebar}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            title="Open Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="flex min-w-0 items-center gap-2">
          <h1 className="whitespace-nowrap text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-50 md:text-xl">
            AI Battle Arena
          </h1>

          {activeBattleId && messages.length > 0 && (
            <span className="hidden items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 sm:inline-flex">
              <Swords className="h-3 w-3" />
              {messages.length} {messages.length === 1 ? "turn" : "turns"}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-4">
        <div className="hidden items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex">
          <Settings2 className="h-4 w-4 text-zinc-500" />

          <span className="font-medium text-zinc-600 dark:text-zinc-400">
            Judge:
          </span>

          <select
            value={judgeProvider}
            onChange={(e) => onJudgeProviderChange(e.target.value)}
            className="cursor-pointer bg-transparent font-medium text-zinc-900 outline-none dark:text-zinc-100"
          >
            <option className=" bg-zinc-900 text-zinc-100 " value="gemini">Gemini Flash</option>
            <option className=" bg-zinc-900 text-zinc-100 " value="mistral">Mistral Medium</option>
            <option className=" bg-zinc-900 text-zinc-100 " value="cohere">Cohere Command</option>
          </select>
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white"
              title={user.name || user.email}
            >
              {(user.name || user.email || "U")[0].toUpperCase()}
            </div>

            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}