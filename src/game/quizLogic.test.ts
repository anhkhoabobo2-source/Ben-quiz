import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceQuestion,
  createQuizSession,
  getQuizSummary,
  QUESTIONS_PER_ROUND,
  submitAnswer,
  tickQuestionTimer,
} from './quizLogic';

test('createQuizSession selects bounded questions for category', () => {
  const sci = createQuizSession('science', () => 0.5);
  assert.equal(sci.questions.length, QUESTIONS_PER_ROUND);
  assert.ok(sci.questions.every((q) => q.category === 'science'));
  assert.equal(sci.score, 0);
  assert.equal(sci.currentIndex, 0);
});

test('submitAnswer awards base, time, and streak bonuses on correct answers', () => {
  let session = createQuizSession('all', () => 0.3);
  const q1 = session.questions[0];
  const r1 = submitAnswer(session, q1.correctIndex);
  assert.equal(r1.isCorrect, true);
  assert.equal(r1.session.streak, 1);
  assert.equal(r1.session.score, 200); // 100 base + 20*5 time bonus

  session = advanceQuestion(r1.session);
  assert.equal(session.currentIndex, 1);
  assert.equal(session.isRevealed, false);

  const q2 = session.questions[1];
  const r2 = submitAnswer(session, q2.correctIndex);
  assert.equal(r2.isCorrect, true);
  assert.equal(r2.session.streak, 2);
  assert.equal(r2.session.score, 425); // +200 + 25 streak bonus
});

test('submitAnswer resets streak on wrong answer and finishes round cleanly', () => {
  let session = createQuizSession('animals', () => 0.2);
  for (let i = 0; i < QUESTIONS_PER_ROUND; i++) {
    const q = session.questions[session.currentIndex];
    const pick = i === 0 ? q.correctIndex : ((q.correctIndex + 1) % 4);
    const res = submitAnswer(session, pick);
    session = advanceQuestion(res.session);
  }
  assert.equal(session.isFinished, true);
  const summary = getQuizSummary(session);
  assert.equal(summary.totalQuestions, QUESTIONS_PER_ROUND);
  assert.equal(summary.accuracyPercent, Math.round((1 / QUESTIONS_PER_ROUND) * 100));
});

test('tickQuestionTimer triggers timeout reveal when timer expires', () => {
  let session = createQuizSession('world', () => 0.4);
  const t1 = tickQuestionTimer(session, 10);
  assert.equal(t1.timedOut, false);
  assert.equal(t1.session.timeRemaining, 10);

  const t2 = tickQuestionTimer(t1.session, 15);
  assert.equal(t2.timedOut, true);
  assert.equal(t2.session.timeRemaining, 0);
  assert.equal(t2.session.isRevealed, true);
});
