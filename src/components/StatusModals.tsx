import { getQuizSummary, type QuizSession } from '../game/quizLogic';

interface StatusModalsProps {
  mode: 'paused' | 'gameover';
  session: QuizSession;
  pokeCount: number;
  bestScore: number;
  onResume: () => void;
  onRestart: () => void;
  onTitle: () => void;
}

export function StatusModals({
  mode,
  session,
  pokeCount,
  bestScore,
  onResume,
  onRestart,
  onTitle,
}: StatusModalsProps) {
  const summary = getQuizSummary(session);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'paused' ? 'Quiz paused' : 'Quiz round summary'}
      className="fixed inset-0 z-20 flex items-center justify-center bg-[#261f18]/50 p-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#d6cbb8] bg-[#fffdf8] p-7 shadow-lg">
        {mode === 'paused' ? (
          <>
            <div className="mb-1 text-xs font-bold tracking-wider text-[#b45309] uppercase">
              Session Paused
            </div>
            <h2 className="font-display mb-5 text-2xl font-bold text-[#261f18]">
              Take a breather in Ben&apos;s study
            </h2>

            <div className="mb-6 grid grid-cols-3 gap-3 rounded-xl bg-[#f5efe4] p-4">
              <div>
                <div className="text-[11px] font-bold text-[#7a6855] uppercase">Score</div>
                <div className="font-mono-num text-xl font-bold text-[#261f18]">{session.score}</div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#7a6855] uppercase">Question</div>
                <div className="font-mono-num text-xl font-bold text-[#261f18]">
                  {session.currentIndex + 1}/{session.questions.length}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#7a6855] uppercase">Touches</div>
                <div className="font-mono-num text-xl font-bold text-[#261f18]">{pokeCount}</div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onResume}
                className="h-11 w-full rounded-xl bg-[#b45309] px-5 text-sm font-bold text-[#fffdf8] transition-colors hover:bg-[#92400e] focus-visible:outline-2 focus-visible:outline-[#261f18]"
              >
                Resume Quiz
              </button>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={onRestart}
                  className="h-11 rounded-xl border border-[#d6cbb8] bg-[#faf6ee] px-4 text-sm font-semibold text-[#261f18] transition-colors hover:bg-[#efe7d8]"
                >
                  Restart
                </button>
                <button
                  type="button"
                  onClick={onTitle}
                  className="h-11 rounded-xl border border-[#d6cbb8] bg-[#faf6ee] px-4 text-sm font-semibold text-[#261f18] transition-colors hover:bg-[#efe7d8]"
                >
                  Title Screen
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-1 text-xs font-bold tracking-wider text-[#b45309] uppercase">
              Round Complete
            </div>
            <h2 className="font-display mb-2 text-3xl font-extrabold text-[#261f18]">
              {summary.rankTitle}
            </h2>
            <p className="mb-6 text-sm text-[#57493a]">
              Ben tallied your lab notes across {summary.totalQuestions} questions and {pokeCount} screen interactions.
            </p>

            <div className="mb-6 grid grid-cols-3 gap-3 rounded-xl bg-[#f5efe4] p-4">
              <div>
                <div className="text-[11px] font-bold text-[#7a6855] uppercase">Score</div>
                <div data-testid="summary-score" className="font-mono-num text-xl font-bold text-[#261f18]">
                  {session.score}
                </div>
                <div className="font-mono-num text-[11px] text-[#7a6855]">Best {bestScore}</div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#7a6855] uppercase">Accuracy</div>
                <div className="font-mono-num text-xl font-bold text-[#15803d]">
                  {summary.accuracyPercent}%
                </div>
                <div className="font-mono-num text-[11px] text-[#7a6855]">
                  {session.correctCount}/{summary.totalQuestions}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#7a6855] uppercase">Best Streak</div>
                <div className="font-mono-num text-xl font-bold text-[#b45309]">
                  {session.bestStreak}
                </div>
                <div className="font-mono-num text-[11px] text-[#7a6855]">{pokeCount} pokes</div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                data-start="true"
                onClick={onRestart}
                className="h-12 w-full rounded-xl bg-[#b45309] px-5 text-sm font-bold text-[#fffdf8] transition-colors hover:bg-[#92400e] focus-visible:outline-2 focus-visible:outline-[#261f18]"
              >
                Play Again
              </button>
              <button
                type="button"
                onClick={onTitle}
                className="h-11 w-full rounded-xl border border-[#d6cbb8] bg-[#faf6ee] px-4 text-sm font-semibold text-[#261f18] transition-colors hover:bg-[#efe7d8]"
              >
                Back to Title
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
