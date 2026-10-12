export default function ArenaResponse({ solution1, solution2, judge, isStreaming }) {
  return (
    <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-600">
          Solution 1
        </h3>
        <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
          {solution1 || (isStreaming ? "Thinking..." : "Response will appear here.")}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-violet-600">
          Solution 2
        </h3>
        <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
          {solution2 || (isStreaming ? "Thinking..." : "Response will appear here.")}
        </p>
      </div>

      {judge && (
        <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800 md:col-span-2">
          <h3 className="mb-3 font-semibold">Judge Recommendations</h3>
          <p>Solution 1 Score: {judge.solution_1_score}/10</p>
          <p>Solution 2 Score: {judge.solution_2_score}/10</p>
        </div>
      )}
    </div>
  );
}
