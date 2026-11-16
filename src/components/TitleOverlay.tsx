import type { QuizCategory } from '../game/quizLogic';

interface TitleOverlayProps {
  category: QuizCategory;
  onSelectCategory: (category: QuizCategory) => void;
  onStart: () => void;
  muted: boolean;
  onToggleMute: () => void;
}

const CATEGORIES: { id: QuizCategory; label: string }[] = [
  { id: 'all', label: 'All Mix' },
  { id: 'science', label: 'Science Lab' },
  { id: 'animals', label: 'Animals' },
  { id: 'world', label: 'World' },
];

export function TitleOverlay({
  category,
  onSelectCategory,
  onStart,
  muted,
  onToggleMute,
}: TitleOverlayProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-6 md:p-10">
      {/* Top right sound toggle */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.currentTarget.blur();
            onToggleMute();
          }}
          aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
          className="pointer-events-auto inline-flex h-10 items-center gap-2 rounded-lg border border-[#d6cbb8] bg-[#fffdf8] px-3.5 text-sm font-medium text-[#261f18] shadow-sm transition-colors hover:bg-[#f2eadc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b45309]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
          <span className="whitespace-nowrap">{muted ? 'Muted' : 'Sound On'}</span>
        </button>
      </div>

      {/* Main negative-space title lockup (Ben stands right on desktop, above on mobile) */}
      <div className="mt-auto mb-3 max-w-md md:my-auto md:ml-6 lg:ml-12">
        <div className="pointer-events-auto rounded-2xl border border-[#d6cbb8]/90 bg-[#fffdf8]/95 p-6 shadow-sm md:p-8">
          {/* Custom inline SVG Title Emblem */}
          <svg
            viewBox="0 0 360 92"
            className="mb-4 w-full max-w-[330px]"
            role="img"
            aria-label="Talking Ben Lab Quiz"
          >
            <g>
              {/* Flask & Paw Crest */}
              <rect x="2" y="10" width="66" height="66" rx="14" fill="#ebe1d0" stroke="#b45309" strokeWidth="2" />
              <path
                d="M27 24h16M31 24v12l-9 17a4 4 0 0 0 3.5 6h19a4 4 0 0 0 3.5-6l-9-17V24"
                fill="none"
                stroke="#261f18"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M26 49h18" stroke="#b45309" strokeWidth="2.4" strokeLinecap="round" />
              <circle cx="35" cy="43" r="2.2" fill="#b45309" />
              {/* Title Typography */}
              <text
                x="82"
                y="38"
                fill="#261f18"
                fontFamily="Bricolage Grotesque, sans-serif"
                fontWeight="800"
                fontSize="28"
                letterSpacing="-0.5"
              >
                Talking Ben
              </text>
              <text
                x="83"
                y="67"
                fill="#b45309"
                fontFamily="Bricolage Grotesque, sans-serif"
                fontWeight="700"
                fontSize="21"
                letterSpacing="0.2"
              >
                Lab Quiz Challenge
              </text>
            </g>
          </svg>

          <p className="mb-5 text-[15px] leading-relaxed text-[#57493a]">
            Answer eight rapid questions with Ben reacting in real time, or tap his nose, ears, paw, belly, and feet directly on screen for bone animations and sound effects.
          </p>

          {/* Category segmented selector */}
          <div className="mb-6">
            <div className="mb-2 text-xs font-semibold tracking-wide text-[#705e4b] uppercase">
              Topic Deck
            </div>
            <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-[#efe7d8] p-1 sm:grid-cols-4">
              {CATEGORIES.map((item) => {
                const active = category === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectCategory(item.id)}
                    className={`rounded-md px-2.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-[#b45309] ${
                      active
                        ? 'bg-[#fffdf8] text-[#261f18] shadow-xs'
                        : 'text-[#665644] hover:text-[#261f18]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            data-start="true"
            onClick={(e) => {
              e.currentTarget.blur();
              onStart();
            }}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#b45309] px-6 text-base font-bold text-[#fffdf8] transition-colors hover:bg-[#92400e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#261f18]"
          >
            <span>Start Quiz</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Flat borderless bottom control hint */}
      <div className="flex justify-center md:justify-start md:ml-6 lg:ml-12">
        <p className="text-xs font-medium text-[#6c5b49]">
          Touch Ben to Poke · Enter Start · 1-4 Answer · B Bones · M Mute · P Pause
        </p>
      </div>
    </div>
  );
}
