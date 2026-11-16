import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeWorldBoneTransforms,
  createInitialRigState,
  hitTestBenZone,
  stepBoneRig,
  triggerQuizReaction,
  triggerZoneReaction,
} from './boneRig';

test('initial rig state computes valid hierarchical world transforms', () => {
  const rig = createInitialRigState();
  const world = computeWorldBoneTransforms(rig);
  assert.ok(world.head.y < world.torso.y, 'head should be above torso');
  assert.ok(world.leftEar.x < world.head.x, 'leftEar should be left of head');
  assert.ok(world.rightEar.x > world.head.x, 'rightEar should be right of head');
  assert.ok(world.rightPaw.x < world.rightUpperArm.x, 'waving paw extends left');
});

test('hitTestBenZone detects nose, waving paw, belly, ears, and feet accurately', () => {
  const rig = createInitialRigState();
  assert.equal(hitTestBenZone(0.51, 0.22, rig), 'nose');
  assert.equal(hitTestBenZone(0.15, 0.30, rig), 'wavePaw');
  assert.equal(hitTestBenZone(0.50, 0.60, rig), 'belly');
  assert.equal(hitTestBenZone(0.18, 0.20, rig), 'leftEar');
  assert.equal(hitTestBenZone(0.84, 0.20, rig), 'rightEar');
  assert.equal(hitTestBenZone(0.36, 0.90, rig), 'leftFoot');
  assert.equal(hitTestBenZone(0.66, 0.89, rig), 'rightFoot');
  assert.equal(hitTestBenZone(0.02, 0.02, rig), null);
});

test('triggerZoneReaction applies bone impulses and updates mood & pokeCount', () => {
  const rig = createInitialRigState();
  const reaction = triggerZoneReaction(rig, 'belly');
  assert.equal(reaction.sound, 'hohoho');
  assert.equal(rig.pokeCount, 1);
  assert.equal(rig.activeZone, 'belly');
  assert.ok(Math.abs(rig.bones.torso.sxVel) > 1);

  stepBoneRig(rig, 0.016, { x: 0.8, y: 0.2 });
  assert.ok(rig.mouthOpen > 0, 'speaking timer should open jaw');
  assert.ok(rig.gazeX > 0, 'gaze should track pointer right');
});

test('stepBoneRig clamps large dt and settles springs back toward rest', () => {
  const rig = createInitialRigState();
  triggerQuizReaction(rig, 'correct');
  for (let i = 0; i < 200; i++) {
    stepBoneRig(rig, 0.05, null);
  }
  assert.equal(rig.mood, 'idle');
  assert.ok(Math.abs(rig.bones.head.angle) < 0.15);
  assert.ok(Math.abs(rig.bones.torso.sx - 1) < 0.08);
});
