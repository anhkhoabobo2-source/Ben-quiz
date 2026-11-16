import type { RefObject } from 'react';
import type { QuizSession } from '../game/quizLogic';

interface QuizHudProps {
  session: QuizSession;
  pokeCount: number;
  lastBenLine: string;
  showBones: boolean;
  muted: boolean;
  timerBarRef: RefObject<HTMLDivElement | null>;
  timerTextRef: RefObject<HTMLSpanElement | null>;
  onSelectOption: (index: number) => void;
  onNextQuestion: () => void;
  onToggleBones: () => void;
  onToggleMute: () => void;
  onPause: () => void;
  onRestart: () => void;
}

const CATEGORY_NAMES: Record<string, string> = {
  science: 'Science Lab',
  animals: 'Animal Kingdom',
  world: 'World & History',
};

export function QuizHud({
  session,
  pokeCount,
  lastBenLine,
  showBones,
  muted,
  timerBarRef,
  timerTextRef,
  onSelectOption,
  onNextQuestion,
  onToggleBones,
  onToggleMute,
  onPause,
  onRestart,
}: QuizHudProps) {
  const question = session.questions[session.currentIndex];
  const isLast = session.currentIndex === session.questions.length - 1;
  const isCorrect = session.selectedOption === question.correctIndex;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-4 md:p-6 lg:p-8">
      {/* Top World-Matched HUD Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Clean unboxed tabular readouts */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl border border-[#d6cbb8] bg-[#fffdf8]/95 px-4 py-2.5 shadow-xs">
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] font-bold tracking-wider text-[#7a6855] uppercase">Score</span>
            <span data-testid="hud-score" className="font-mono-num text-xl font-bold text-[#261f18]">
              {session.score}
            </span>
          </div>
          <span className="text-[#cbbba3]" aria-hidden="true">/</span>
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] font-bold tracking-wider text-[#7a6855] uppercase">Streak</span>
            <span data-testid="hud-streak" className="font-mono-num text-xl font-bold text-[#b45309]">
              {session.streak}
            </span>
          </div>
          <span className="text-[#cbbba3]" aria-hidden="true">/</span>
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] font-bold tracking-wider text-[#7a6855] uppercase">Question</span>
            <span data-testid="hud-progress" className="font-mono-num text-base font-bold text-[#261f18]">
              {session.currentIndex + 1}/{session.questions.length}
            </span>
          </div>
          <span className="hidden text-[#cbbba3] sm:inline" aria-hidden="true">/</span>
          <div className="hidden items-baseline gap-2 sm:flex">
            <span className="text-[11px] font-bold tracking-wider text-[#7a6855] uppercase">Touches</span>
            <span data-testid="hud-pokes" className="font-mono-num text-base font-semibold text-[#57493a]">
              {pokeCount}
            </span>
          </div>
        </div>

        {/* Right: Utility SVG icon controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleBones();
            }}
            aria-label={showBones ? 'Hide skeleton bones [B]' : 'Show skeleton bones [B]'}
            aria-pressed={showBones}
            className={`inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-[#b45309] ${
              showBones
                ? 'border-[#b45309] bg-[#b45309] text-[#fffdf8]'
                : 'border-[#d6cbb8] bg-[#fffdf8] text-[#261f18] hover:bg-[#f2eadc]'
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="6" cy="6" r="2.5" />
              <circle cx="18" cy="18" r="2.5" />
              <line x1="7.8" y1="7.8" x2="16.2" y2="16.2" />
              <circle cx="18" cy="6" r="2.5" />
              <line x1="16.2" y1="7.8" x2="12" y2="12" />
            </svg>
            <span>Bones</span>
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            aria-label={muted ? 'Unmute sound [M]' : 'Mute sound [M]'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#d6cbb8] bg-[#fffdf8] text-[#261f18] transition-colors hover:bg-[#f2eadc] focus-visible:outline-2 focus-visible:outline-[#b45309]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              {muted ? (
                <>
                  <line x1="22" y1="9" x2="16" y2="15" />
                  <line x1="16" y1="9" x2="22" y2="15" />
                </>
              ) : (
                <>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </>
              )}
            </svg>
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onPause();
            }}
            aria-label="Pause quiz [P]"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#d6cbb8] bg-[#fffdf8] text-[#261f18] transition-colors hover:bg-[#f2eadc] focus-visible:outline-2 focus-visible:outline-[#b45309]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onRestart();
            }}
            aria-label="Restart quiz [R]"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#d6cbb8] bg-[#fffdf8] text-[#261f18] transition-colors hover:bg-[#f2eadc] focus-visible:outline-2 focus-visible:outline-[#b45309]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <polyline points="3 3 3 8 8 8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Split Stage: Left open for Ben canvas, Right Quiz Panel */}
      <div className="mt-auto grid grid-cols-1 items-end gap-3 md:my-auto md:grid-cols-12 md:items-center md:gap-4">
        {/* Desktop left-column Ben caption */}
        <div className="hidden md:col-span-5 md:flex md:flex-col md:justify-end md:self-start md:pt-2 lg:col-span-6">
          <div className="pointer-events-auto inline-block self-start rounded-xl border border-[#d6cbb8] bg-[#fffdf8]/95 px-4 py-2 shadow-xs">
            <div className="text-[11px] font-bold tracking-wider text-[#7a6855] uppercase">Ben says</div>
            <div data-testid="ben-caption" className="font-display text-base font-bold text-[#261f18]">
              {lastBenLine}
            </div>
          </div>
        </div>

        {/* Right Quiz Card */}
        <div className="md:col-span-7 lg:col-span-6">
          <section
            aria-label="Quiz question"
            className="pointer-events-auto mx-auto max-w-xl rounded-2xl border border-[#d6cbb8] bg-[#fffdf8] p-4 shadow-sm md:p-7"
          >
            {/* Mobile compact Ben reaction line inside card */}
            <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-[#efe7d8] pb-2 text-xs md:hidden">
              <span className="font-bold text-[#7a6855] uppercase">Ben</span>
              <span className="truncate font-semibold text-[#261f18]">{lastBenLine}</span>
            </div>

            {/* Question header + timer bar */}
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#7a6855]">
                <span>{CATEGORY_NAMES[question.category]}</span>
                <span aria-hidden="true">·</span>
                <span>Question {session.currentIndex + 1} of {session.questions.length}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#7a6855]">Time</span>
                <span
                  ref={timerTextRef}
                  className="font-mono-num text-sm font-bold text-[#261f18]"
                >
                  {Math.ceil(session.timeRemaining)}s
                </span>
              </div>
            </div>

            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-[#ebe1d0] md:mb-5">
              <div
                ref={timerBarRef}
                className="h-full origin-left bg-[#b45309]"
                style={{ transform: `scaleX(${Math.max(0, session.timeRemaining / session.questionDuration)})` }}
              />
            </div>

            <h2
              data-testid="question-prompt"
              className="font-display mb-4 text-lg leading-snug font-bold text-[#261f18] md:mb-5 md:text-2xl"
              style={{ textWrap: 'balance' }}
            >
              {question.prompt}
            </h2>

            {/* Answer options */}
            <div className="grid grid-cols-1 gap-2 md:gap-2.5">
              {question.options.map((opt, idx) => {
                const isSelected = session.selectedOption === idx;
                const isOptionCorrect = idx === question.correctIndex;
                let btnStyle =
                  'border-[#d6cbb8] bg-[#faf6ee] text-[#261f18] hover:border-[#b45309] hover:bg-[#f4ecdd]';
                let statusText: string | null = null;

                if (session.isRevealed) {
                  if (isOptionCorrect) {
                    btnStyle = 'border-[#15803d] bg-[#ecfdf3] text-[#14532d]';
                    statusText = 'Correct';
                  } else if (isSelected) {
                    btnStyle = 'border-[#b91c1c] bg-[#fef2f2] text-[#7f1d1d]';
                    statusText = 'Selected';
                  } else {
                    btnStyle = 'border-[#e4dac9] bg-[#f8f4ec] text-[#8a7a68] opacity-75';
                  }
                }

                return (
                  <button
                    key={`${question.id}-opt-${idx}`}
                    type="button"
                    disabled={session.isRevealed}
                    onClick={() => onSelectOption(idx)}
                    className={`flex min-h-[44px] w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b45309] md:min-h-[48px] md:px-4 md:py-2.5 ${btnStyle}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-mono-num inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-current/20 bg-white/70 text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-[14px] font-semibold md:text-[15px]">{opt}</span>
                    </span>
                    {statusText && (
                      <span className="text-xs font-bold whitespace-nowrap">
                        {statusText}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Revealed verdict & Next action */}
            {session.isRevealed && (
              <div className="mt-4 border-t border-[#e7dece] pt-3.5 md:mt-5 md:pt-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 md:mb-3">
                  <div className="text-sm font-bold">
                    {session.selectedOption === -1 ? (
                      <span className="text-[#b91c1c]">Time Up — Ben says: {question.benWrongLine}</span>
                    ) : isCorrect ? (
                      <span className="text-[#15803d]">
                        Correct (+{session.lastPointsAwarded}) — {question.benCorrectLine}
                      </span>
                    ) : (
                      <span className="text-[#b91c1c]">Incorrect — {question.benWrongLine}</span>
                    )}
                  </div>
                </div>
                <p className="mb-3.5 text-sm leading-relaxed text-[#57493a] md:mb-4">{question.fact}</p>
                <button
                  type="button"
                  onClick={onNextQuestion}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#261f18] px-5 text-sm font-bold text-[#fffdf8] transition-colors hover:bg-[#3f3429] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b45309]"
                >
                  <span>{isLast ? 'Finish Quiz' : 'Next Question'}</span>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="flex items-center justify-between text-xs font-medium text-[#6c5b49]">
        <span className="md:hidden">Tap Ben on screen to poke · 1-4 Answer</span>
        <span className="hidden md:inline">Touch Ben&apos;s head, ears, nose, waving paw, belly, or feet directly on screen</span>
        <span className="hidden md:inline">Keys: 1-4 Answer · Enter Next · B Bones · P Pause</span>
      </div>
    </div>
  );
}
