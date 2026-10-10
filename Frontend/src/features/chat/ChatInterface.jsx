import { useState } from "react";
import ChatHeader from "./components/ChatHeader";
import BattleSidebar from "./components/BattleSidebar";

export default function ChatInterface() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [judgeProvider, setJudgeProvider] = useState("gemini");
  const [activeBattleId, setActiveBattleId] = useState(null);

  const handleNewBattle = () => {
    setMessages([]);
  };

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <BattleSidebar
        isOpen={isSidebarOpen}
        user={user}
        onClose={() => setIsSidebarOpen(false)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onNewBattle={handleNewBattle}
      />

      <main className="flex flex-1 min-w-0 flex-col">
        <ChatHeader 
          user={user}
          messages={messages}
          activeBattleId={activeBattleId}
          isSidebarOpen={isSidebarOpen}
          judgeProvider={judgeProvider}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onSignOut={() => {
            setUser(null);
            setMessages([]);
            setActiveBattleId(null);
          }}
          onJudgeProviderChange={setJudgeProvider}
        />


        <section className="flex flex-1 items-center justify-center p-6">
          {messages.length === 0
            ? "Welcome to the Arena"
            : `${messages.length} messages`}
        </section>

        <footer className="border-t border-zinc-200 dark:border-zinc-800 p-4">
          Chat input will go here
        </footer>
      </main>

      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6">
            <p className="mb-4">Authentication modal placeholder</p>
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="text-sm underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}