export const generateBattleId = () => crypto.randomUUID();

export const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export const createBattle = (problem = "New Battle") => ({
  id: generateBattleId(),
  title: problem.length > 32 ? `${problem.slice(0, 32)}...` : problem,
  createdAt: new Date().toISOString(),
  messages: [],
});

export const toMessage = (turn) => ({
  id: turn.id || turn._id || generateBattleId(),
  problem: turn.problem || "",
  solution_1: turn.solution_1 || "",
  solution_2: turn.solution_2 || "",
  judge: turn.judge || null,
  isNew: false,
});