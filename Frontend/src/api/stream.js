const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const streamBattle = async ({
    input,
    judge_provider,
    battleId,
    turnIndex = 0,
    onMessage,
    onError,
    onComplete,
    signal}) => {
    let reader;

    try {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("Please login to start an AI battle");
        }

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
            let errorMessage = `Request failed: ${response.status}`;

            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch {
                // Keep default error message
            }

            throw new Error(errorMessage);
        }

        if (!response.body) {
            throw new Error("Streaming is not supported by this response");
        }

        reader = response.body.getReader();

        const decoder = new TextDecoder();
        let buffer = "";

        const processEvent = (event) => {
            const dataLines = event
                .split(/\r?\n/)
                .filter((line) => line.startsWith("data:"));

            if (!dataLines.length) return;

            const dataText = dataLines
                .map((line) => line.slice(5).trim())
                .join("\n");

            if (!dataText) return;

            const data = JSON.parse(dataText);

            if (data.type === "error" || data.error) {
                throw new Error(
                    data.message || data.error || "AI battle failed"
                );
            }

            onMessage?.(data);
        };

        while (true) {
            const { value, done } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            const events = buffer.split(/\r?\n\r?\n/);
            buffer = events.pop() || "";

            for (const event of events) {
                processEvent(event);
            }
        }

        buffer += decoder.decode();

        if (buffer.trim()) {
            processEvent(buffer);
        }

        onComplete?.();

    } catch (error) {
        if (error.name === "AbortError") {
            return;
        }

        console.error("Streaming error:", error);
        onError?.(error);

    } finally {
        if (reader) {
            try {
                reader.releaseLock();
            } catch {
                // Reader may already be released
            }
        }
    }
};