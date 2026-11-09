import { useEffect, useRef, useState } from "react";
import BattleSidebar from "./components/BattleSidebar";
import ChatHeader from "./components/ChatHeader";
import ChatComposer from "./components/ChatComposer";
import MessageList from "./components/MessageList";
import AuthModal from "../../components/AuthModal";
import { streamBattle } from "../../api/stream";
import { getHistory } from "../../api/history";
import { getCurrentUser, logoutUser } from "../../api/auth";

const STORAGE_KEY = "ai-arena-battles";

function getSavedBattles() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export default function ChatInterface() {
    const [battleList, setBattleList] = useState(getSavedBattles);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState(
        () => battleList[0]?.messages || []
    );
    const [judgeProvider, setJudgeProvider] = useState(
        () => localStorage.getItem("ai-arena-judge") || "gemini"
    );
    const [activeBattleId, setActiveBattleId] = useState(
        () => battleList[0]?.id || null
    );
    const [inputValue, setInputValue] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [isLoadingBattle, setIsLoadingBattle] = useState(false);

    const textareaRef = useRef(null);
    const endOfMessagesRef = useRef(null);
    const abortControllerRef = useRef(null);

    useEffect(() => {
        localStorage.setItem("ai-arena-judge", judgeProvider);
    }, [judgeProvider]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(battleList));
    }, [battleList]);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [messages]);

    // Restore logged-in user
    useEffect(() => {
        const restoreSession = async () => {
            if (!localStorage.getItem("token")) return;

            try {
                const response = await getCurrentUser();
                setUser(response.user);

                const historyResponse = await getHistory();
                const savedHistory = historyResponse.history || [];

                const groupedBattles = Object.values(
                    savedHistory.reduce((groups, item) => {
                        const id = item.battleId;

                        if (!groups[id]) {
                            groups[id] = {
                                id,
                                title: item.problem,
                                createdAt: item.createdAt,
                                messages: [],
                            };
                        }

                        groups[id].messages.push({
                            id: `${id}-${item.turnIndex}`,
                            problem: item.problem,
                            solution_1: item.solution_1,
                            solution_2: item.solution_2,
                            judge: item.judge,
                        });

                        return groups;
                    }, {})
                );

                groupedBattles.forEach((battle) => {
                    battle.messages.sort(
                        (a, b) => Number(a.id.split("-").pop()) -
                            Number(b.id.split("-").pop())
                    );
                });

                setBattleList(groupedBattles);

                if (groupedBattles.length > 0) {
                    setActiveBattleId(groupedBattles[0].id);
                    setMessages(groupedBattles[0].messages);
                }
            } catch (error) {
                console.error("Session restore failed:", error);
                localStorage.removeItem("token");
                setUser(null);
            }
        };

        restoreSession();
    }, []);

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
    };

    const handleSelectBattle = (battleId) => {
        const selected = battleList.find((battle) => battle.id === battleId);
        if (!selected) return;

        abortControllerRef.current?.abort();
        setActiveBattleId(battleId);
        setMessages(selected.messages || []);
        setInputValue("");
        setIsStreaming(false);
    };

    const handleDeleteBattle = (battleId) => {
        const remaining = battleList.filter(
            (battle) => battle.id !== battleId
        );

        setBattleList(remaining);

        if (activeBattleId === battleId) {
            const next = remaining[0] || null;
            setActiveBattleId(next?.id || null);
            setMessages(next?.messages || []);
        }
    };

    const handleSend = async (e) => {
        e?.preventDefault();

        const problemText = inputValue.trim();

        if (!problemText || isStreaming) return;

        if (!user || !localStorage.getItem("token")) {
            setIsAuthModalOpen(true);
            return;
        }

        const battleId = activeBattleId || crypto.randomUUID();

        const currentBattle = battleList.find(
            (battle) => battle.id === battleId
        );

        const turnIndex = currentBattle?.messages?.length || 0;

        const newMessage = {
            id: crypto.randomUUID(),
            problem: problemText,
            solution_1: "",
            solution_2: "",
            judge: null,
            isNew: false,
        };

        const updatedMessages = [...messages, newMessage];

        const updatedBattle = {
            id: battleId,
            title: currentBattle?.title === "New Battle" || !currentBattle
                ? problemText.slice(0, 32)
                : currentBattle.title,
            createdAt: currentBattle?.createdAt || new Date().toISOString(),
            messages: updatedMessages,
        };

        setBattleList((prev) => [
            updatedBattle,
            ...prev.filter((battle) => battle.id !== battleId),
        ]);

        setActiveBattleId(battleId);
        setMessages(updatedMessages);
        setInputValue("");
        setIsStreaming(true);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            await streamBattle({
                input: problemText,
                judge_provider: judgeProvider,
                battleId,
                turnIndex,
                signal: controller.signal,

                onMessage: (event) => {
                    if (event.event !== "on_chain_end") return;

                    const output = event.data?.output;
                    if (!output) return;

                    setMessages((prev) => {
                        const updated = [...prev];
                        const last = { ...updated[updated.length - 1] };

                        if (output.solution_1) {
                            last.solution_1 = output.solution_1;
                            last.solution_2 = output.solution_2;
                        }

                        if (output.judge) {
                            last.judge = output.judge;
                            last.isNew = true;
                        }

                        updated[updated.length - 1] = last;
                        return updated;
                    });
                },

                onError: (error) => {
                    console.error("Battle streaming failed:", error);
                },
            });
        } finally {
            setIsStreaming(false);
            abortControllerRef.current = null;
        }
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

    const handleSignOut = async () => {
        abortControllerRef.current?.abort();
        await logoutUser();
        setUser(null);
        setMessages([]);
        setBattleList([]);
        setActiveBattleId(null);
        localStorage.removeItem(STORAGE_KEY);
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
                    onSignOut={handleSignOut}
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
              onAuthSuccess={(loggedInUser) => {
                setUser(loggedInUser);
              }}
            />
        </div>
    );
}