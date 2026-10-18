import { useEffect, useRef, useState } from "react";
import BattleSidebar from "./components/BattleSidebar";
import ChatHeader from "./components/ChatHeader";
import ChatComposer from "./components/ChatComposer";
import MessageList from "./components/MessageList";
import AuthModal from "../../components/AuthModal";

const STORAGE_KEY = "ai-arena-battles";

export default function ChatInterface() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [judgeProvider, setJudgeProvider] = useState("gemini");
  const [activeBattleId, setActiveBattleId] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingBattle, setIsLoadingBattle] = useState(false);

  const [battleList, setBattleList] = useState(() => {
    try {
      const savedBattles = localStorage.getItem(STORAGE_KEY);
      const parsedBattles = savedBattles ? JSON.parse(savedBattles) : [];
      return Array.isArray(parsedBattles) ? parsedBattles : [];
    } catch {
      return [];
    }
  });

  const textareaRef = useRef(null);
  const endOfMessagesRef = useRef(null);
  const hasRestoredBattle = useRef(false);

  useEffect(() => {
    if (hasRestoredBattle.current) return;
    hasRestoredBattle.current = true;

    if (battleList.length > 0) {
      const savedBattle = battleList[0];
      setActiveBattleId(savedBattle.id);
      setMessages(savedBattle.messages || []);
    }
  }, [battleList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(battleList));
    } catch (error) {
      console.error("Unable to save battles:", error);
    }
  }, [battleList]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  const handleNewBattle = () => {
    const newBattle = {
      id: crypto.randomUUID(),
      title: "New Battle",
      createdAt: new Date().toISOString(),
      messages: [],
    };

    setBattleList((prev) => [newBattle, ...prev]);
    setActiveBattleId(newBattle.id);
    setMessages([]);
    setInputValue("");
    setIsStreaming(false);
    setIsLoadingBattle(false);
    // setIsSidebarOpen(false);
  };

  const handleSelectBattle = (battleId) => {
    const selectedBattle = battleList.find(
      (battle) => battle.id === battleId
    );

    if (!selectedBattle) return;

    setActiveBattleId(battleId);
    setMessages(selectedBattle.messages || []);
    setInputValue("");
    setIsStreaming(false);
    // setIsSidebarOpen(false);
  };

  const handleDeleteBattle = (battleId) => {
    const remainingBattles = battleList.filter(
      (battle) => battle.id !== battleId
    );

    setBattleList(remainingBattles);

    if (activeBattleId === battleId) {
      const nextBattle = remainingBattles[0] || null;
      setActiveBattleId(nextBattle?.id || null);
      setMessages(nextBattle?.messages || []);
      setInputValue("");
    }
  };

  const handleSend = (e) => {
    e?.preventDefault();

    const problemText = inputValue.trim();
    if (!problemText || isStreaming) return;

    const newMessage = {
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
    };

    const currentBattle = battleList.find(
      (battle) => battle.id === activeBattleId
    );

    const battleId = activeBattleId || crypto.randomUUID();

    const updatedMessages = [...messages, newMessage];

    const title =
      !currentBattle || currentBattle.title === "New Battle"
        ? problemText.length > 32
          ? `${problemText.slice(0, 32)}...`
          : problemText
        : currentBattle.title;

    const updatedBattle = {
      id: battleId,
      title,
      createdAt: currentBattle?.createdAt || new Date().toISOString(),
      messages: updatedMessages,
    };

    setBattleList((prev) => {
      const exists = prev.some((battle) => battle.id === battleId);

      if (exists) {
        return prev.map((battle) =>
          battle.id === battleId ? updatedBattle : battle
        );
      }

      return [updatedBattle, ...prev];
    });

    setActiveBattleId(battleId);
    setMessages(updatedMessages);
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

  return (
    <div className="flex min-h-screen w-full overflow-x-clip bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <BattleSidebar
        isOpen={isSidebarOpen}
        user={user}
        battleList={battleList}
        activeBattleId={activeBattleId}
        onClose={() => setIsSidebarOpen(false)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onNewBattle={handleNewBattle}
        onSelectBattle={handleSelectBattle}
        onDeleteBattle={handleDeleteBattle}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
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
            setBattleList([]);
            setActiveBattleId(null);
            localStorage.removeItem(STORAGE_KEY);
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
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}