import { useEffect, useRef, useState } from "react";
import BattleSidebar from "./components/BattleSidebar";
import ChatHeader from "./components/ChatHeader";
import ChatComposer from "./components/ChatComposer";
import MessageList from "./components/MessageList";
import AuthModal from "../../components/AuthModal";

export default function ChatInterface() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [judgeProvider, setJudgeProvider] = useState("gemini");
  const [activeBattleId, setActiveBattleId] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const textareaRef = useRef(null);
  const endOfMessagesRef = useRef(null);
  const [isLoadingBattle, setIsLoadingBattle] = useState(false);

  const handleNewBattle = () => {
    setMessages([]);
    setActiveBattleId(null);
    setInputValue("");
    setIsStreaming(false);
    setIsLoadingBattle(false);
    setIsSidebarOpen(false);
    textareaRef.current?.focus();
  };
  
  const handleSend = (e) => { 
    e?.preventDefault();
    const problemText = inputValue.trim();

    if (!problemText || isStreaming) return;

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        problem: problemText,
        solution_1:
          "This is a frontend demo response. The first AI model will provide its solution when the backend is connected.",
        solution_2:
          "This is the second demo response. The second AI model will provide its solution when the backend is connected.",
        judge: {
          solution_1_score: 8,
          solution_2_score: 9,
          winner: "Solution 2",
          reasoning:
            "Demo evaluation only. Real scores and recommendations will come from the judge model after backend integration.",
        },
        isNew: true,
      },
    ]);

    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter" || e.shiftKey) return;

    e.preventDefault();
    handleSend();
  };

  const handleTextareaFocus = () => {
    if (window.innerWidth >= 768) return;

    setTimeout(() => {
      textareaRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 300);
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

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

        <MessageList 
          messages={messages}
          isLoadingBattle={isLoadingBattle}
          isStreaming={isStreaming}
          endOfMessagesRef={endOfMessagesRef}
        />

        <ChatComposer  
          inputValue={inputValue}
          messages={messages}
          isStreaming={isStreaming}
          textareaRef={textareaRef}
          onInputChange={setInputValue}
          onKeyDown={handleKeyDown}
          onFocus={handleTextareaFocus}
          onSubmit={handleSend}
        />

      </main>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}