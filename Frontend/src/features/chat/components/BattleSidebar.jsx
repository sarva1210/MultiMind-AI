import { Plus, Swords, LogIn, X } from "lucide-react";

const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

export default function BattleSidebar({
  isOpen,
  user,
  onClose,
  onOpenAuth,
  onNewBattle,
  battleList = [],
  activeBattleId,
  onSelectBattle,
  onDeleteBattle,
}) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-20 bg-black/40 md:hidden"
        onClick={onClose}
      />

      <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 shrink-0 flex-col border-r border-zinc-200 bg-zinc-100 p-4 dark:border-zinc-800 dark:bg-zinc-900 md:sticky">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            <Swords className="h-4 w-4" />
            Battles
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            Close
          </button>
        </div>

        <button
          type="button"
          onClick={onNewBattle}
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" />
          New Battle
        </button>

        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Recent Battles
        </div>

        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {battleList.length === 0 ? (
            <p className="px-2 py-4 text-sm text-zinc-500">
              No battles yet. Start a new battle!
            </p>
          ) : (
            battleList.map((battle) => (
              <div
                key={battle.id}
                className={`group flex items-center gap-1 rounded-lg ${
                  activeBattleId === battle.id
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200"
                    : "hover:bg-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectBattle?.(battle.id)}
                  className="min-w-0 flex-1 px-3 py-2.5 text-left"
                  title={battle.title}
                >
                  <span className="block truncate text-sm font-medium">
                    {battle.title}
                  </span>

                  <span className="mt-1 block text-[10px] text-zinc-400">
                    {formatDate(battle.createdAt)}
                  </span>
                </button>

                <button
                  type="button"
                  aria-label={`Delete ${battle.title}`}
                  onClick={() => onDeleteBattle?.(battle.id)}
                  className="mr-2 shrink-0 rounded p-1 text-zinc-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          {!user && (
            <div className="py-3 text-center">
              <p className="mb-3 text-xs text-zinc-400">
                Sign in to save and view your battles.
              </p>

              <button
                type="button"
                onClick={onOpenAuth}
                className="mx-auto flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                <LogIn className="h-3 w-3" />
                Sign In
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}