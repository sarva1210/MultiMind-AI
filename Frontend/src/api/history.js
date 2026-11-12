import api from "./auth.js";

// Get all battle history
export const getHistory = async () => {
    const response = await api.get("/api/history");
    return response.data;
};

// Save battle history
export const saveHistory = async (battleData) => {
    const response = await api.post("/api/history", battleData);
    return response.data;
};

// Delete complete battle history
export const deleteBattleHistory = async (battleId) => {
    const response = await api.delete(
        `/api/history/${encodeURIComponent(battleId)}`
    );

    return response.data;
};