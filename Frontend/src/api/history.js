
import api from "./auth.js";

// Fetch logged-in user's battle history
export const getHistory = async () => {
    const response = await api.get("/api/history");
    return response.data;
};

// Save a new battle
export const saveHistory = async (battleData) => {
    const response = await api.post("/api/history", battleData);
    return response.data;
};
