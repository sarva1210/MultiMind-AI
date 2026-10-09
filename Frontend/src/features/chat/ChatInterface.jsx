import { useCallback, useEffect, useRef, useState } from "react";

export default function ChatInterface() {
  return (
    <div className="flex min-h-screen w-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <aside className="hidden w-64 border-r border-zinc-200 p-4 dark:border-zinc-800 md:block">
        Battles
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="border-b border-zinc-200 p-4 dark:border-zinc-800">
          AI Battle Arena
        </header>

        <section className="flex flex-1 items-center justify-center">
          Welcome to the Arena
        </section>

        <footer className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          Chat input will go here
        </footer>
      </main>
    </div>
  );
}