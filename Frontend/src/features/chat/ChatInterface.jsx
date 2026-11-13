import { useEffect, useRef, useState } from "react";
import BattleSidebar from "./components/BattleSidebar";
import ChatHeader from "./components/ChatHeader";
import ChatComposer from "./components/ChatComposer";
import MessageList from "./components/MessageList";
import AuthModal from "../../components/AuthModal";
import { streamBattle } from "../../api/stream";
import { getHistory , deleteBattleHistory } from "../../api/history";
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

function formatHistory(history) {
    const groups = {};

    history.forEach((item) => {
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
            turnIndex: item.turnIndex,
            problem: item.problem,
            solution_1: item.solution_1,
            solution_2: item.solution_2,
            judge: item.judge,
            isNew: false,
        });
    });

    return Object.values(groups)
        .map((battle) => ({
            ...battle,
            messages: battle.messages.sort(
                (a, b) => a.turnIndex - b.turnIndex
            ),
        }))
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );
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

    // Save selected judge provider
    useEffect(() => {
        localStorage.setItem("ai-arena-judge", judgeProvider);
    }, [judgeProvider]);

    // Save battles locally
    useEffect(() => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(battleList)
            );
        } catch (error) {
            console.error("Unable to save battles:", error);
        }
    }, [battleList]);

    // Auto-scroll messages
    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [messages]);

    // Load user history from MongoDB
    const loadUserHistory = async () => {
        const response = await getHistory();
        const groupedBattles = formatHistory(response.history || []);

        setBattleList(groupedBattles);

        if (groupedBattles.length > 0) {
            setActiveBattleId(groupedBattles[0].id);
            setMessages(groupedBattles[0].messages);
        } else {
            setActiveBattleId(null);
            setMessages([]);
        }
    };

    // Restore login session
    useEffect(() => {
        const restoreSession = async () => {
            if (!localStorage.getItem("token")) return;

            setIsLoadingBattle(true);

            try {
                const response = await getCurrentUser();
                setUser(response.user);

                await loadUserHistory();
            } catch (error) {
                console.error("Session restore failed:", error);
                await logoutUser();
                setUser(null);
            } finally {
                setIsLoadingBattle(false);
            }
        };

        restoreSession();
    }, []);

    // Update one message in both active messages and battle list
    const updateBattleMessage = (battleId, messageId, changes) => {
        setMessages((prev) =>
            prev.map((message) =>
                message.id === messageId
                    ? { ...message, ...changes }
                    : message
            )
        );

        setBattleList((prev) =>
            prev.map((battle) =>
                battle.id === battleId
                    ? {
                        ...battle,
                        messages: battle.messages.map((message) =>
                            message.id === messageId
                                ? { ...message, ...changes }
                                : message
                        ),
                    }
                    : battle
            )
        );
    };

    // Create a new battle
    const handleNewBattle = () => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;

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

    // Select an existing battle
    const handleSelectBattle = (battleId) => {
        const selected = battleList.find(
            (battle) => battle.id === battleId
        );

        if (!selected) return;

        abortControllerRef.current?.abort();
        abortControllerRef.current = null;

        setActiveBattleId(battleId);
        setMessages(selected.messages || []);
        setInputValue("");
        setIsStreaming(false);
    };

    // Delete a battle
    const handleDeleteBattle = async (battleId) => {
        try {
            // Delete from MongoDB if user is logged in
            if (user && localStorage.getItem("token")) {
                await deleteBattleHistory(battleId);
            }

            // Abort stream if deleting active battle
            if (activeBattleId === battleId) {
                abortControllerRef.current?.abort();
                abortControllerRef.current = null;
            }

            const remaining = battleList.filter(
                (battle) => battle.id !== battleId
            );

            setBattleList(remaining);

            if (activeBattleId === battleId) {
                const next = remaining[0] || null;

                setActiveBattleId(next?.id || null);
                setMessages(next?.messages || []);
                setIsStreaming(false);
            }

        } catch (error) {
            console.error("Delete battle failed:", error); 
            alert(
                error.response?.data?.error ||
                "Unable to delete battle. Please try again."
            );
        }
    };

    // Send prompt to AI battle backend
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
        const messageId = crypto.randomUUID();

        const newMessage = {
            id: messageId,
            turnIndex,
            problem: problemText,
            solution_1: "",
            solution_2: "",
            judge: null,
            isNew: false,
        };

        const updatedMessages = [...messages, newMessage];

        const updatedBattle = {
            id: battleId,
            title:
                currentBattle?.title === "New Battle" || !currentBattle
                    ? problemText.slice(0, 32)
                    : currentBattle.title,
            createdAt:
                currentBattle?.createdAt || new Date().toISOString(),
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

                    const changes = {};

                    if (output.solution_1) {
                        changes.solution_1 = output.solution_1;
                    }

                    if (output.solution_2) {
                        changes.solution_2 = output.solution_2;
                    }

                    if (output.judge) {
                        changes.judge = output.judge;
                    }

                    if (Object.keys(changes).length > 0) {
                        updateBattleMessage(
                            battleId,
                            messageId,
                            changes
                        );
                    }
                },

                onError: (error) => {
                    console.error("Battle streaming failed:", error);
                },
            });

        } catch (error) {
            console.error("Battle request failed:", error);
        } finally {
            if (abortControllerRef.current === controller) {
                abortControllerRef.current = null;
                setIsStreaming(false);

                setMessages((prev) =>
                    prev.map((message) =>
                        message.id === messageId
                            ? { ...message, isNew: true }
                            : message
                    )
                );

                setBattleList((prev) =>
                    prev.map((battle) =>
                        battle.id === battleId
                            ? {
                                ...battle,
                                messages: battle.messages.map((message) =>
                                    message.id === messageId
                                        ? { ...message, isNew: true }
                                        : message
                                ),
                            }
                            : battle
                    )
                );
            }
        }
    };

    // Enter to send, Shift + Enter for new line
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

    // Login or register success
    const handleAuthSuccess = async (loggedInUser) => {
        setUser(loggedInUser);
        setIsLoadingBattle(true);

        try {
            await loadUserHistory();
        } catch (error) {
            console.error("Unable to load battle history:", error);
        } finally {
            setIsLoadingBattle(false);
        }
    };

    // Sign out
    const handleSignOut = async () => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;

        await logoutUser();

        setUser(null);
        setMessages([]);
        setBattleList([]);
        setActiveBattleId(null);
        setInputValue("");
        setIsStreaming(false);

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
                onAuthSuccess={handleAuthSuccess}
            />
        </div>
    );
}