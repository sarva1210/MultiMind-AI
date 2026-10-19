import { useEffect, useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/atom-one-dark.css";

const CHARS_PER_FRAME = 8;

function useTypingEffect(fullText = "", active = false) {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);
  const rafRef = useRef(null);
  const fullTextRef = useRef(fullText);
  const indexRef = useRef(0);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    fullTextRef.current = fullText;
  }, [fullText]);

  const startAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    const tick = () => {
      const text = fullTextRef.current;
      indexRef.current = Math.min(
        indexRef.current + CHARS_PER_FRAME,
        text.length
      );

      setDisplayed(text.slice(0, indexRef.current));

      if (indexRef.current < text.length) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        setIsDone(true);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (!active || !fullText || fullText === "Thinking...") return;
    if (hasStartedRef.current) return;

    hasStartedRef.current = true;
    indexRef.current = 0;
    setDisplayed("");
    setIsDone(false);

    startAnimation();

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = null;
      indexRef.current = 0;
      hasStartedRef.current = false;
    };
  }, [fullText, active, startAnimation]);

  return [active ? displayed : fullText, active ? isDone : true];
}

function MarkdownContent({ content = "" }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ ...props }) => (
          <h1
            className="mb-4 mt-6 text-xl font-bold text-zinc-900 dark:text-white md:text-2xl"
            {...props}
          />
        ),
        h2: ({ ...props }) => (
          <h2
            className="mb-3 mt-5 text-lg font-bold text-zinc-900 dark:text-white md:text-xl"
            {...props}
          />
        ),
        h3: ({ ...props }) => (
          <h3
            className="mb-2 mt-4 text-base font-bold text-zinc-900 dark:text-white md:text-lg"
            {...props}
          />
        ),
        p: ({ ...props }) => (
          <p
            className="mb-4 leading-relaxed text-zinc-700 dark:text-zinc-300"
            {...props}
          />
        ),
        ul: ({ ...props }) => (
          <ul
            className="mb-4 list-disc space-y-1 pl-5 text-zinc-700 dark:text-zinc-300 md:pl-6"
            {...props}
          />
        ),
        ol: ({ ...props }) => (
          <ol
            className="mb-4 list-decimal space-y-1 pl-5 text-zinc-700 dark:text-zinc-300 md:pl-6"
            {...props}
          />
        ),
        a: ({ ...props }) => (
          <a
            className="text-blue-600 underline hover:text-blue-500"
            target="_blank"
            rel="noreferrer"
            {...props}
          />
        ),
        code: ({ className, children, ...props }) => {
          const isBlock = Boolean(className?.startsWith("language-"));
          const lang = className?.replace("language-", "") || "";
          const codeText = String(children).replace(/\n$/, "");

          const copyToClipboard = async () => {
            try {
              await navigator.clipboard.writeText(codeText);
            } catch (error) {
              console.error("Unable to copy code:", error);
            }
          };

          if (isBlock) {
            return (
              <div className="group relative my-4 max-w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                    {lang || "code"}
                  </span>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="text-xs font-medium text-zinc-400 transition-colors hover:text-white"
                  >
                    Copy
                  </button>
                </div>
                <pre className="max-w-full overflow-x-auto bg-zinc-950 p-4 text-xs text-zinc-100 md:text-sm">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          }

          return (
            <code
              className="break-words rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 md:text-sm"
              {...props}
            >
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-4 w-5/6 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-4 w-4/6 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

export default function ArenaResponse({
  solution1 = "",
  solution2 = "",
  judge,
  isNew = false,
  isStreaming = false,
}) {
  const [display1, done1] = useTypingEffect(solution1, isNew);
  const [display2, done2] = useTypingEffect(solution2, isNew);

  const showJudge = Boolean(judge) && !isStreaming && done1 && done2;

  const isSolution1Loading =
    isStreaming && (!solution1 || solution1 === "Thinking...");
  const isSolution2Loading =
    isStreaming && (!solution2 || solution2 === "Thinking...");

  return (
    <div className="my-6 flex w-full max-w-full flex-col gap-6 overflow-hidden md:gap-8">
      <div className="grid w-full max-w-full grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex max-w-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 md:rounded-3xl md:p-8">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 md:mb-6">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
            <span>Solution 1</span>
            {isSolution1Loading && (
              <span className="ml-auto flex gap-1">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </span>
            )}
          </h3>

          <div className="max-w-full overflow-hidden text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 md:text-base">
            {isSolution1Loading ? (
              <SkeletonLoader />
            ) : (
              <MarkdownContent content={display1} />
            )}
          </div>
        </div>

        <div className="flex max-w-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 md:rounded-3xl md:p-8">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 md:mb-6">
            <span className="h-2 w-2 shrink-0 rounded-full bg-violet-500" />
            <span>Solution 2</span>
            {isSolution2Loading && (
              <span className="ml-auto flex gap-1">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </span>
            )}
          </h3>

          <div className="max-w-full overflow-hidden text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 md:text-base">
            {isSolution2Loading ? (
              <SkeletonLoader />
            ) : (
              <MarkdownContent content={display2} />
            )}
          </div>
        </div>
      </div>

      {showJudge && (
        <div className="animate-in fade-in mt-2 max-w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-5 shadow-sm duration-500 dark:border-zinc-800 dark:bg-zinc-950 md:rounded-3xl md:p-8">
          <h3 className="mb-4 flex items-center gap-3 text-base font-medium text-zinc-900 dark:text-zinc-100 md:mb-6 md:text-lg">
            Judge Recommendations
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 md:px-5">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 md:text-sm">
                  Solution 1 Score
                </span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 md:text-2xl">
                  {judge.solution_1_score ?? "—"}/10
                </span>
              </div>
              <p className="px-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-sm">
                {judge.solution_1_reasoning || ""}
              </p>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 md:px-5">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 md:text-sm">
                  Solution 2 Score
                </span>
                <span className="text-lg font-bold text-violet-600 dark:text-violet-400 md:text-2xl">
                  {judge.solution_2_score ?? "—"}/10
                </span>
              </div>
              <p className="px-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-sm">
                {judge.solution_2_reasoning || ""}
              </p>
            </div>
          </div>

          {judge.winner && (
            <p className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm font-medium text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
              Winner: {judge.winner}
            </p>
          )}

          {judge.reasoning && (
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {judge.reasoning}
            </p>
          )}
        </div>
      )}
    </div>
  );
}