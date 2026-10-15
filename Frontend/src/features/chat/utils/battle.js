export const generateBattleId = () => crypto.randomUUID();

export const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};