import { Plus, Swords, LogIn } from "lucide-react";

export default function BattleSidebar({
  isOpen,
  user,
  onClose,
  onOpenAuth,
  onNewBattle,
}) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-20 md:hidden"
        onClick={onClose}
      />

      <aside className="fixed md:sticky top-0 left-0 h-screen w-64 shrink-0 z-30 bg-zinc-100 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 flex items-center gap-2">
            <Swords className="w-4 h-4" />
            Battles
          </h2>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            Close
          </button>
        </div>

        <button
          onClick={onNewBattle}
          className="w-full mb-4 py-2 px-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-800"
        >
          <Plus className="w-4 h-4" />
          New Battle
        </button>

        <div className="flex-1">
          {!user ? (
            <div className="text-center py-8">
              <p className="text-xs text-zinc-400 mb-3">
                Sign in to save and view your battles.
              </p>

              <button
                onClick={onOpenAuth}
                className="text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 py-2 px-3 rounded-lg flex items-center gap-2 mx-auto"
              >
                <LogIn className="w-3 h-3" />
                Sign In
              </button>
            </div>
          ) : (
            <p className="text-xs text-zinc-400 text-center py-6">
              No battles yet. Start one above!
            </p>
          )}
        </div>
      </aside>
    </>
  );
}