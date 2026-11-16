import { useCallback, useEffect, useRef, useState } from 'react';
import { QuizHud } from './components/QuizHud';
import { StatusModals } from './components/StatusModals';
import { TitleOverlay } from './components/TitleOverlay';
import { soundEngine } from './game/audioEngine';
import { BenCanvasRenderer } from './game/benSpriteRenderer';
import {
  createInitialRigState,
  hitTestBenZone,
  stepBoneRig,
  type TouchZone,
  triggerQuizReaction,
  triggerZoneReaction,
} from './game/boneRig';
import {
  advanceQuestion,
  createQuizSession,
  type QuizCategory,
  type QuizSession,
  submitAnswer,
  tickQuestionTimer,
} from './game/quizLogic';

type GamePhase = 'title' | 'playing' | 'paused' | 'gameover';

const BEN_IMAGE_URL = '/assets/aistudio/7d33ea16a32a9532ea39826820a54ec2_bd37b01e.jpg';

function readAutostartParam(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('autostart') === '1';
}

export default function App() {
  const [phase, setPhase] = useState<GamePhase>(() => (readAutostartParam() ? 'playing' : 'title'));
  const [category, setCategory] = useState<QuizCategory>('all');
  const [session, setSession] = useState<QuizSession>(() => createQuizSession('all'));
  const [pokeCount, setPokeCount] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [lastBenLine, setLastBenLine] = useState('Tap my nose, paw, or belly!');
  const [showBones, setShowBones] = useState(false);
  const [muted, setMuted] = useState(false);
  const [hoveredZone, setHoveredZone] = useState<TouchZone | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<BenCanvasRenderer | null>(null);
  const rigRef = useRef(createInitialRigState());
  const pointerNormRef = useRef<{ x: number; y: number } | null>(null);

  const phaseRef = useRef<GamePhase>(phase);
  const sessionRef = useRef<QuizSession>(session);
  const showBonesRef = useRef<boolean>(showBones);
  const hoveredZoneRef = useRef<TouchZone | null>(hoveredZone);

  const timerBarRef = useRef<HTMLDivElement | null>(null);
  const timerTextRef = useRef<HTMLSpanElement | null>(null);

  phaseRef.current = phase;
  sessionRef.current = session;
  showBonesRef.current = showBones;
  hoveredZoneRef.current = hoveredZone;

  useEffect(() => {
    document.body.dataset.state = phase;
  }, [phase]);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      return next;
    });
  }, []);

  const handleStartQuiz = useCallback(() => {
    soundEngine.unlock();
    soundEngine.play('click');
    const fresh = createQuizSession(category);
    sessionRef.current = fresh;
    setSession(fresh);
    setLastBenLine('Let us test your brain!');
    setPhase('playing');
    triggerQuizReaction(rigRef.current, 'correct');
  }, [category]);

  const handleRestartQuiz = useCallback(() => {
    soundEngine.unlock();
    soundEngine.play('click');
    const fresh = createQuizSession(category);
    sessionRef.current = fresh;
    setSession(fresh);
    setLastBenLine('Fresh beaker, new questions!');
    setPhase('playing');
    triggerQuizReaction(rigRef.current, 'correct');
  }, [category]);

  const handleSelectOption = useCallback((idx: number) => {
    const current = sessionRef.current;
    if (phaseRef.current !== 'playing' || current.isRevealed || current.isFinished) {
      return;
    }
    soundEngine.unlock();
    const { session: nextSession, isCorrect } = submitAnswer(current, idx);
    sessionRef.current = nextSession;
    setSession(nextSession);

    const q = nextSession.questions[nextSession.currentIndex];
    setLastBenLine(isCorrect ? q.benCorrectLine : q.benWrongLine);

    triggerQuizReaction(rigRef.current, isCorrect ? 'correct' : 'wrong');
    soundEngine.play(isCorrect ? 'correct' : 'wrong');
    window.setTimeout(() => {
      soundEngine.play(isCorrect ? 'yes' : 'no');
    }, 110);
    rendererRef.current?.spawnQuizBurst(isCorrect);
  }, []);

  const handleNextQuestion = useCallback(() => {
    const current = sessionRef.current;
    if (!current.isRevealed) return;
    soundEngine.unlock();
    soundEngine.play('click');

    const next = advanceQuestion(current);
    sessionRef.current = next;
    setSession(next);

    if (next.isFinished) {
      setBestScore((prev) => Math.max(prev, next.score));
      setPhase('gameover');
      triggerQuizReaction(rigRef.current, 'victory');
      soundEngine.play('victory');
      setLastBenLine('Round complete!');
    } else {
      setLastBenLine('Next question. Ready?');
      if (timerBarRef.current) {
        timerBarRef.current.style.transform = 'scaleX(1)';
      }
      if (timerTextRef.current) {
        timerTextRef.current.textContent = `${next.questionDuration}s`;
      }
    }
  }, []);

  // Load Ben sprite and run single 60fps canvas animation loop
  useEffect(() => {
    const renderer = new BenCanvasRenderer();
    rendererRef.current = renderer;
    void renderer.loadImage(BEN_IMAGE_URL);

    const canvas = canvasRef.current;
    const host = canvasHostRef.current;
    if (!canvas || !host) return;

    let width = host.clientWidth || window.innerWidth;
    let height = host.clientHeight || window.innerHeight;

    const resizeCanvas = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(host);

    let rafId = 0;
    let lastTime = performance.now();
    let lastShownSec = -1;

    const tick = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      if (rawDt < 0.03) {
        rafId = window.requestAnimationFrame(tick);
        return;
      }
      lastTime = now;
      const dt = Math.min(Math.max(rawDt, 0), 0.05);

      const curPhase = phaseRef.current;
      if (curPhase !== 'paused') {
        stepBoneRig(rigRef.current, dt, pointerNormRef.current);
      }

      // Advance question timer cleanly via refs during active question
      if (curPhase === 'playing') {
        const curSession = sessionRef.current;
        if (!curSession.isRevealed && !curSession.isFinished) {
          const { session: ticked, timedOut } = tickQuestionTimer(curSession, dt);
          sessionRef.current = ticked;

          const ratio = Math.max(0, ticked.timeRemaining / ticked.questionDuration);
          if (timerBarRef.current) {
            timerBarRef.current.style.transform = `scaleX(${ratio})`;
          }
          const ceilSec = Math.ceil(ticked.timeRemaining);
          if (ceilSec !== lastShownSec && timerTextRef.current) {
            lastShownSec = ceilSec;
            timerTextRef.current.textContent = `${ceilSec}s`;
          }

          if (timedOut) {
            setSession(ticked);
            const q = ticked.questions[ticked.currentIndex];
            setLastBenLine(q.benWrongLine);
            triggerQuizReaction(rigRef.current, 'wrong');
            soundEngine.play('wrong');
          }
        } else {
          lastShownSec = -1;
        }
      }

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const isDesktop = width >= 768;
        let stageShiftX = 0;
        let stageShiftY = 0;
        let maxHeightRatio = 0.84;

        if (curPhase === 'title') {
          stageShiftX = isDesktop ? Math.min(width * 0.21, 280) : 0;
          stageShiftY = isDesktop ? 0 : -height * 0.17;
          maxHeightRatio = isDesktop ? 0.84 : 0.44;
        } else if (curPhase === 'playing' || curPhase === 'paused') {
          stageShiftX = isDesktop ? -Math.min(width * 0.23, 300) : 0;
          stageShiftY = isDesktop ? 10 : -height * 0.19;
          maxHeightRatio = isDesktop ? 0.78 : 0.29;
        }

        renderer.render(ctx, width, height, dt, rigRef.current, {
          hoveredZone: hoveredZoneRef.current,
          showBones: showBonesRef.current,
          stageShiftX,
          stageShiftY,
          maxHeightRatio,
        });
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  // Global keyboard shortcuts & window blur hygiene
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const curPhase = phaseRef.current;

      if (curPhase === 'title') {
        if (key === 'Enter' || key === ' ') {
          e.preventDefault();
          handleStartQuiz();
        } else if (key.toLowerCase() === 'm') {
          handleToggleMute();
        }
        return;
      }

      if (curPhase === 'playing') {
        if (key === '1' || key === '2' || key === '3' || key === '4') {
          handleSelectOption(Number(key) - 1);
        } else if (key === 'Enter' || key === ' ') {
          if (sessionRef.current.isRevealed) {
            e.preventDefault();
            handleNextQuestion();
          }
        } else if (key.toLowerCase() === 'b') {
          setShowBones((prev) => !prev);
        } else if (key.toLowerCase() === 'm') {
          handleToggleMute();
        } else if (key.toLowerCase() === 'p' || key === 'Escape') {
          setPhase('paused');
        } else if (key.toLowerCase() === 'r') {
          handleRestartQuiz();
        }
        return;
      }

      if (curPhase === 'paused') {
        if (key.toLowerCase() === 'p' || key === 'Escape') {
          setPhase('playing');
        }
        return;
      }

      if (curPhase === 'gameover') {
        if (key === 'Enter') {
          e.preventDefault();
          handleRestartQuiz();
        }
      }
    };

    const onBlur = () => {
      pointerNormRef.current = null;
      setHoveredZone(null);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('blur', onBlur);
    };
  }, [handleNextQuestion, handleRestartQuiz, handleSelectOption, handleStartQuiz, handleToggleMute]);

  const resolveCanvasHit = (clientX: number, clientY: number): TouchZone | null => {
    const canvas = canvasRef.current;
    const renderer = rendererRef.current;
    if (!canvas || !renderer) return null;
    const rect = canvas.getBoundingClientRect();
    const lx = clientX - rect.left;
    const ly = clientY - rect.top;
    const norm = renderer.screenToSpriteNorm(lx, ly);
    if (!norm) {
      pointerNormRef.current = {
        x: Math.max(0, Math.min(1, lx / Math.max(1, rect.width))),
        y: Math.max(0, Math.min(1, ly / Math.max(1, rect.height))),
      };
      return null;
    }
    pointerNormRef.current = { x: norm.u, y: norm.v };
    return hitTestBenZone(norm.u, norm.v, rigRef.current);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (phase === 'paused' || phase === 'gameover') return;
    const zone = resolveCanvasHit(e.clientX, e.clientY);
    if (zone !== hoveredZoneRef.current) {
      setHoveredZone(zone);
    }
  };

  const handleCanvasPointerLeave = () => {
    pointerNormRef.current = null;
    setHoveredZone(null);
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (phase === 'paused' || phase === 'gameover') return;
    soundEngine.unlock();
    const zone = resolveCanvasHit(e.clientX, e.clientY);
    if (zone) {
      const reaction = triggerZoneReaction(rigRef.current, zone);
      soundEngine.play(reaction.sound);
      rendererRef.current?.spawnZoneBurst(zone, reaction.caption, rigRef.current, '#b45309');
      setPokeCount((c) => c + 1);
      setLastBenLine(`${reaction.label}: ${reaction.caption}`);
    } else {
      // Gentle floor/backdrop tap chime if touching outside Ben
      soundEngine.play('click');
    }
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden select-none">
      {/* Isolated Canvas Host */}
      <div ref={canvasHostRef} className="absolute inset-0">
        <canvas
          ref={canvasRef}
          data-testid="ben-canvas"
          aria-label="Interactive Talking Ben character stage"
          onPointerMove={handleCanvasPointerMove}
          onPointerLeave={handleCanvasPointerLeave}
          onPointerDown={handleCanvasPointerDown}
          className={`block h-full w-full touch-none ${hoveredZone ? 'cursor-pointer' : 'cursor-default'}`}
        />
      </div>

      {phase === 'title' && (
        <TitleOverlay
          category={category}
          onSelectCategory={(cat) => {
            soundEngine.unlock();
            soundEngine.play('click');
            setCategory(cat);
          }}
          onStart={handleStartQuiz}
          muted={muted}
          onToggleMute={handleToggleMute}
        />
      )}

      {(phase === 'playing' || phase === 'paused') && (
        <QuizHud
          session={session}
          pokeCount={pokeCount}
          lastBenLine={lastBenLine}
          showBones={showBones}
          muted={muted}
          timerBarRef={timerBarRef}
          timerTextRef={timerTextRef}
          onSelectOption={handleSelectOption}
          onNextQuestion={handleNextQuestion}
          onToggleBones={() => {
            soundEngine.unlock();
            soundEngine.play('click');
            setShowBones((prev) => !prev);
          }}
          onToggleMute={handleToggleMute}
          onPause={() => setPhase('paused')}
          onRestart={handleRestartQuiz}
        />
      )}

      {(phase === 'paused' || phase === 'gameover') && (
        <StatusModals
          mode={phase}
          session={session}
          pokeCount={pokeCount}
          bestScore={bestScore}
          onResume={() => setPhase('playing')}
          onRestart={handleRestartQuiz}
          onTitle={() => setPhase('title')}
        />
      )}
    </main>
  );
}
