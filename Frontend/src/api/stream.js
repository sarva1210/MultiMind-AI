const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const streamBattle = async ({
    input,
    judge_provider,
    battleId,
    turnIndex = 0,
    onMessage,
    onError,
    onComplete,
    signal
}) => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/api/stream`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                input,
                judge_provider,
                battleId,
                turnIndex
            }),
            signal
        });

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        if (!response.body) {
            throw new Error("Streaming is not supported by this response");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";

        while (true) {
            const { value, done } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            const events = buffer.split("\n\n");
            buffer = events.pop() || "";

            for (const event of events) {
                const dataLine = event
                    .split("\n")
                    .find((line) => line.startsWith("data:"));

                if (!dataLine) continue;

                const data = JSON.parse(dataLine.slice(5).trim());

                if (data.error || data.type === "error") {
                    throw new Error(data.message || data.error);
                }

                onMessage?.(data);
            }
        }

        onComplete?.();

    } catch (error) {
        if (error.name === "AbortError") {
            return;
        }

        onError?.(error);
    }
};