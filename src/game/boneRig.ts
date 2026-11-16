export type BoneId =
  | 'root'
  | 'torso'
  | 'head'
  | 'jaw'
  | 'leftEar'
  | 'rightEar'
  | 'rightUpperArm'
  | 'rightPaw'
  | 'leftArm'
  | 'leftLeg'
  | 'rightLeg';

export type TouchZone =
  | 'nose'
  | 'head'
  | 'leftEar'
  | 'rightEar'
  | 'wavePaw'
  | 'belly'
  | 'leftArm'
  | 'leftFoot'
  | 'rightFoot';

export type SoundCue =
  | 'yes'
  | 'no'
  | 'hohoho'
  | 'boop'
  | 'slap'
  | 'tickle'
  | 'earFlop'
  | 'footTap'
  | 'ugh'
  | 'correct'
  | 'wrong'
  | 'victory'
  | 'click';

export type ReactionMood =
  | 'idle'
  | 'happy'
  | 'grumpy'
  | 'laugh'
  | 'poke'
  | 'celebrate';

export interface BoneSpring {
  angle: number;
  angleVel: number;
  sx: number;
  sy: number;
  sxVel: number;
  syVel: number;
  ox: number;
  oy: number;
  oxVel: number;
  oyVel: number;
}

export interface BoneTransform {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface RigState {
  elapsed: number;
  blinkTimer: number;
  blinkAmount: number; // 0 = open, 1 = closed
  mouthOpen: number; // 0..1 lip-sync / bark opening
  speakTimer: number;
  mood: ReactionMood;
  moodTimer: number;
  activeZone: TouchZone | null;
  activeZoneTimer: number;
  gazeX: number; // -1..1
  gazeY: number; // -1..1
  pokeCount: number;
  bones: Record<BoneId, BoneSpring>;
}

export interface ZoneReaction {
  zone: TouchZone;
  label: string;
  caption: string;
  sound: SoundCue;
  mood: ReactionMood;
}

export interface JointPivot {
  id: BoneId;
  parent: BoneId | null;
  /** Normalized coordinates (0..1) inside the 333x565 source sprite */
  u: number;
  v: number;
  /** Offset from parent pivot in normalized sprite units */
  localU: number;
  localV: number;
  stiffness: number;
  damping: number;
}

export const SPRITE_WIDTH = 333;
export const SPRITE_HEIGHT = 565;

export const BONE_PIVOTS: Record<BoneId, JointPivot> = {
  root: { id: 'root', parent: null, u: 0.5, v: 0.74, localU: 0.5, localV: 0.74, stiffness: 110, damping: 12 },
  leftLeg: { id: 'leftLeg', parent: 'root', u: 0.39, v: 0.75, localU: -0.11, localV: 0.01, stiffness: 140, damping: 13 },
  rightLeg: { id: 'rightLeg', parent: 'root', u: 0.62, v: 0.75, localU: 0.12, localV: 0.01, stiffness: 140, damping: 13 },
  torso: { id: 'torso', parent: 'root', u: 0.5, v: 0.72, localU: 0, localV: -0.02, stiffness: 120, damping: 11 },
  rightUpperArm: {
    id: 'rightUpperArm',
    parent: 'torso',
    u: 0.27,
    v: 0.45,
    localU: -0.23,
    localV: -0.27,
    stiffness: 130,
    damping: 10,
  },
  rightPaw: {
    id: 'rightPaw',
    parent: 'rightUpperArm',
    u: 0.18,
    v: 0.37,
    localU: -0.09,
    localV: -0.08,
    stiffness: 160,
    damping: 9,
  },
  leftArm: {
    id: 'leftArm',
    parent: 'torso',
    u: 0.73,
    v: 0.47,
    localU: 0.23,
    localV: -0.25,
    stiffness: 130,
    damping: 11,
  },
  head: {
    id: 'head',
    parent: 'torso',
    u: 0.51,
    v: 0.41,
    localU: 0.01,
    localV: -0.31,
    stiffness: 140,
    damping: 11,
  },
  leftEar: {
    id: 'leftEar',
    parent: 'head',
    u: 0.28,
    v: 0.11,
    localU: -0.23,
    localV: -0.3,
    stiffness: 95,
    damping: 7.5,
  },
  rightEar: {
    id: 'rightEar',
    parent: 'head',
    u: 0.73,
    v: 0.11,
    localU: 0.22,
    localV: -0.3,
    stiffness: 95,
    damping: 7.5,
  },
  jaw: {
    id: 'jaw',
    parent: 'head',
    u: 0.5,
    v: 0.31,
    localU: -0.01,
    localV: -0.1,
    stiffness: 220,
    damping: 14,
  },
};

export const BONE_ORDER: BoneId[] = [
  'root',
  'leftLeg',
  'rightLeg',
  'torso',
  'leftArm',
  'rightUpperArm',
  'rightPaw',
  'head',
  'leftEar',
  'rightEar',
  'jaw',
];

function createSpring(): BoneSpring {
  return {
    angle: 0,
    angleVel: 0,
    sx: 1,
    sy: 1,
    sxVel: 0,
    syVel: 0,
    ox: 0,
    oy: 0,
    oxVel: 0,
    oyVel: 0,
  };
}

export function createInitialRigState(): RigState {
  return {
    elapsed: 0,
    blinkTimer: 2.2,
    blinkAmount: 0,
    mouthOpen: 0,
    speakTimer: 0,
    mood: 'idle',
    moodTimer: 0,
    activeZone: null,
    activeZoneTimer: 0,
    gazeX: 0,
    gazeY: 0,
    pokeCount: 0,
    bones: {
      root: createSpring(),
      torso: createSpring(),
      head: createSpring(),
      jaw: createSpring(),
      leftEar: createSpring(),
      rightEar: createSpring(),
      rightUpperArm: createSpring(),
      rightPaw: createSpring(),
      leftArm: createSpring(),
      leftLeg: createSpring(),
      rightLeg: createSpring(),
    },
  };
}

const ZONE_REACTIONS: Record<TouchZone, ZoneReaction> = {
  nose: {
    zone: 'nose',
    label: 'Nose',
    caption: 'Boop!',
    sound: 'boop',
    mood: 'poke',
  },
  head: {
    zone: 'head',
    label: 'Forehead',
    caption: 'Yes?',
    sound: 'yes',
    mood: 'happy',
  },
  leftEar: {
    zone: 'leftEar',
    label: 'Left Ear',
    caption: 'Mind the ears!',
    sound: 'earFlop',
    mood: 'poke',
  },
  rightEar: {
    zone: 'rightEar',
    label: 'Right Ear',
    caption: 'Hey, that tickles!',
    sound: 'earFlop',
    mood: 'poke',
  },
  wavePaw: {
    zone: 'wavePaw',
    label: 'Waving Paw',
    caption: 'High five!',
    sound: 'slap',
    mood: 'happy',
  },
  belly: {
    zone: 'belly',
    label: 'Belly',
    caption: 'Hohoho!',
    sound: 'hohoho',
    mood: 'laugh',
  },
  leftArm: {
    zone: 'leftArm',
    label: 'Arm',
    caption: 'Hm?',
    sound: 'ugh',
    mood: 'grumpy',
  },
  leftFoot: {
    zone: 'leftFoot',
    label: 'Left Foot',
    caption: 'Watch the toes!',
    sound: 'footTap',
    mood: 'grumpy',
  },
  rightFoot: {
    zone: 'rightFoot',
    label: 'Right Foot',
    caption: 'Whoa!',
    sound: 'footTap',
    mood: 'poke',
  },
};

export function triggerZoneReaction(state: RigState, zone: TouchZone): ZoneReaction {
  const reaction = ZONE_REACTIONS[zone];
  state.pokeCount += 1;
  state.activeZone = zone;
  state.activeZoneTimer = 0.85;
  state.mood = reaction.mood;
  state.moodTimer = 1.1;
  state.speakTimer = 0.55;

  const b = state.bones;

  switch (zone) {
    case 'nose':
      b.head.sxVel -= 2.2;
      b.head.syVel += 2.0;
      b.head.angleVel += (state.pokeCount % 2 === 0 ? 1 : -1) * 3.4;
      b.leftEar.angleVel -= 5.2;
      b.rightEar.angleVel += 5.2;
      state.blinkAmount = 1;
      state.blinkTimer = 0.28;
      break;
    case 'head':
      b.head.oyVel += 0.24;
      b.head.syVel -= 1.8;
      b.head.sxVel += 1.4;
      b.torso.oyVel += 0.08;
      b.leftEar.angleVel -= 3.8;
      b.rightEar.angleVel += 3.8;
      b.jaw.oyVel += 0.22;
      break;
    case 'leftEar':
      b.leftEar.angleVel -= 9.5;
      b.head.angleVel -= 2.6;
      b.rightEar.angleVel -= 2.4;
      break;
    case 'rightEar':
      b.rightEar.angleVel += 9.5;
      b.head.angleVel += 2.6;
      b.leftEar.angleVel += 2.4;
      break;
    case 'wavePaw':
      b.rightUpperArm.angleVel -= 6.5;
      b.rightPaw.angleVel += 11.0;
      b.rightPaw.sxVel += 2.2;
      b.rightPaw.syVel -= 2.0;
      b.torso.angleVel += 1.4;
      b.head.angleVel += 1.8;
      break;
    case 'belly':
      b.torso.sxVel += 2.8;
      b.torso.syVel -= 2.4;
      b.root.oyVel += 0.16;
      b.head.oyVel -= 0.14;
      b.jaw.oyVel += 0.35;
      b.leftArm.angleVel += 4.2;
      b.rightUpperArm.angleVel -= 4.2;
      b.leftEar.angleVel -= 4.5;
      b.rightEar.angleVel += 4.5;
      break;
    case 'leftArm':
      b.leftArm.angleVel += 7.5;
      b.torso.angleVel -= 1.6;
      b.head.angleVel -= 1.8;
      break;
    case 'leftFoot':
      b.leftLeg.angleVel -= 5.8;
      b.root.oyVel -= 0.25;
      b.torso.angleVel += 1.8;
      b.head.angleVel -= 2.0;
      break;
    case 'rightFoot':
      b.rightLeg.angleVel += 5.8;
      b.root.oyVel -= 0.25;
      b.torso.angleVel -= 1.8;
      b.head.angleVel += 2.0;
      break;
  }

  return reaction;
}

export function triggerQuizReaction(state: RigState, outcome: 'correct' | 'wrong' | 'victory'): void {
  const b = state.bones;
  if (outcome === 'correct' || outcome === 'victory') {
    const power = outcome === 'victory' ? 1.55 : 1.0;
    state.mood = outcome === 'victory' ? 'celebrate' : 'happy';
    state.moodTimer = outcome === 'victory' ? 2.2 : 1.25;
    state.speakTimer = outcome === 'victory' ? 1.1 : 0.65;
    b.root.oyVel -= 0.42 * power;
    b.torso.syVel += 2.0 * power;
    b.torso.sxVel -= 1.2 * power;
    b.head.oyVel += 0.22 * power;
    b.rightUpperArm.angleVel -= 7.0 * power;
    b.rightPaw.angleVel += 9.0 * power;
    b.leftArm.angleVel += 4.5 * power;
    b.leftEar.angleVel -= 5.5 * power;
    b.rightEar.angleVel += 5.5 * power;
  } else {
    state.mood = 'grumpy';
    state.moodTimer = 1.25;
    state.speakTimer = 0.6;
    b.head.angleVel += 6.2;
    b.torso.angleVel -= 1.5;
    b.leftEar.angleVel += 4.2;
    b.rightEar.angleVel += 4.2;
    b.leftArm.angleVel += 2.5;
  }
}

function stepSpringValue(
  val: number,
  vel: number,
  target: number,
  stiffness: number,
  damping: number,
  dt: number
): [number, number] {
  const force = (target - val) * stiffness - vel * damping;
  const nextVel = vel + force * dt;
  const nextVal = val + nextVel * dt;
  return [nextVal, nextVel];
}

export function stepBoneRig(
  state: RigState,
  rawDt: number,
  pointerNorm: { x: number; y: number } | null
): void {
  const dt = Math.min(Math.max(rawDt, 0), 0.05);
  state.elapsed += dt;

  // Smooth gaze tracking
  const targetGazeX = pointerNorm ? Math.max(-1, Math.min(1, (pointerNorm.x - 0.5) * 2)) : 0;
  const targetGazeY = pointerNorm ? Math.max(-1, Math.min(1, (pointerNorm.y - 0.35) * 2)) : 0;
  const gazeLerp = 1 - Math.exp(-8 * dt);
  state.gazeX += (targetGazeX - state.gazeX) * gazeLerp;
  state.gazeY += (targetGazeY - state.gazeY) * gazeLerp;

  // Blinking
  state.blinkTimer -= dt;
  if (state.blinkTimer <= 0) {
    state.blinkTimer = 2.6 + ((Math.sin(state.elapsed * 3.17) + 1) * 1.4);
  }
  const blinkPhase = state.blinkTimer;
  if (blinkPhase < 0.14) {
    state.blinkAmount = Math.sin((blinkPhase / 0.14) * Math.PI);
  } else {
    state.blinkAmount = Math.max(0, state.blinkAmount - dt * 10);
  }

  // Speaking & mood timers
  if (state.speakTimer > 0) {
    state.speakTimer = Math.max(0, state.speakTimer - dt);
    state.mouthOpen = 0.25 + 0.75 * Math.abs(Math.sin(state.elapsed * 22));
  } else {
    state.mouthOpen = Math.max(0, state.mouthOpen - dt * 10);
  }

  if (state.moodTimer > 0) {
    state.moodTimer = Math.max(0, state.moodTimer - dt);
    if (state.moodTimer === 0) {
      state.mood = 'idle';
    }
  }

  if (state.activeZoneTimer > 0) {
    state.activeZoneTimer = Math.max(0, state.activeZoneTimer - dt);
    if (state.activeZoneTimer === 0) {
      state.activeZone = null;
    }
  }

  // Procedural target poses driven by idle breathing + active mood
  const t = state.elapsed;
  const breath = Math.sin(t * 2.2);
  const sway = Math.sin(t * 1.15);

  let headTargetAngle = state.gazeX * 0.055 + sway * 0.025;
  let headTargetOy = breath * 0.005;
  let waveTargetAngle = Math.sin(t * 2.6) * 0.07;
  let pawTargetAngle = Math.sin(t * 2.6 - 0.6) * 0.09;
  let leftArmTargetAngle = -breath * 0.03;
  let torsoTargetAngle = sway * 0.015;
  let torsoTargetSy = 1 + breath * 0.016;
  let torsoTargetSx = 1 - breath * 0.01;

  if (state.mood === 'happy' || state.mood === 'celebrate') {
    const speed = state.mood === 'celebrate' ? 11 : 8;
    headTargetAngle += Math.sin(t * speed) * 0.08;
    headTargetOy += Math.sin(t * speed * 1.5) * 0.014;
    waveTargetAngle = -0.14 + Math.sin(t * 9.5) * 0.18;
    pawTargetAngle = Math.sin(t * 9.5 - 0.5) * 0.22;
  } else if (state.mood === 'grumpy') {
    headTargetAngle += Math.sin(t * 15) * 0.11;
    torsoTargetAngle += -0.02;
  } else if (state.mood === 'laugh') {
    torsoTargetSy += Math.sin(t * 16) * 0.03;
    torsoTargetSx -= Math.sin(t * 16) * 0.025;
    headTargetOy += Math.sin(t * 16) * 0.012;
  }

  const targets: Partial<Record<BoneId, { angle?: number; sx?: number; sy?: number; ox?: number; oy?: number }>> = {
    root: { oy: breath * 0.003 },
    torso: { angle: torsoTargetAngle, sx: torsoTargetSx, sy: torsoTargetSy },
    head: { angle: headTargetAngle, oy: headTargetOy },
    jaw: { oy: state.mouthOpen * 0.022, sy: 1 + state.mouthOpen * 0.14 },
    leftEar: { angle: -breath * 0.035 - torsoTargetAngle * 0.9 },
    rightEar: { angle: breath * 0.035 - torsoTargetAngle * 0.9 },
    rightUpperArm: { angle: waveTargetAngle },
    rightPaw: { angle: pawTargetAngle },
    leftArm: { angle: leftArmTargetAngle },
    leftLeg: { angle: -torsoTargetAngle * 0.4 },
    rightLeg: { angle: -torsoTargetAngle * 0.4 },
  };

  for (const id of BONE_ORDER) {
    const pivot = BONE_PIVOTS[id];
    const spring = state.bones[id];
    const tgt = targets[id] ?? {};
    [spring.angle, spring.angleVel] = stepSpringValue(
      spring.angle,
      spring.angleVel,
      tgt.angle ?? 0,
      pivot.stiffness,
      pivot.damping,
      dt
    );
    [spring.sx, spring.sxVel] = stepSpringValue(
      spring.sx,
      spring.sxVel,
      tgt.sx ?? 1,
      pivot.stiffness * 1.15,
      pivot.damping * 1.1,
      dt
    );
    [spring.sy, spring.syVel] = stepSpringValue(
      spring.sy,
      spring.syVel,
      tgt.sy ?? 1,
      pivot.stiffness * 1.15,
      pivot.damping * 1.1,
      dt
    );
    [spring.ox, spring.oxVel] = stepSpringValue(
      spring.ox,
      spring.oxVel,
      tgt.ox ?? 0,
      pivot.stiffness * 1.3,
      pivot.damping * 1.1,
      dt
    );
    [spring.oy, spring.oyVel] = stepSpringValue(
      spring.oy,
      spring.oyVel,
      tgt.oy ?? 0,
      pivot.stiffness * 1.3,
      pivot.damping * 1.1,
      dt
    );
  }
}

export function computeWorldBoneTransforms(state: RigState): Record<BoneId, BoneTransform> {
  const result = {} as Record<BoneId, BoneTransform>;

  for (const id of BONE_ORDER) {
    const pivot = BONE_PIVOTS[id];
    const spring = state.bones[id];
    if (!pivot.parent) {
      result[id] = {
        x: pivot.localU + spring.ox,
        y: pivot.localV + spring.oy,
        rotation: spring.angle,
        scaleX: spring.sx,
        scaleY: spring.sy,
      };
    } else {
      const p = result[pivot.parent];
      const cos = Math.cos(p.rotation);
      const sin = Math.sin(p.rotation);
      const lx = (pivot.localU + spring.ox) * p.scaleX;
      const ly = (pivot.localV + spring.oy) * p.scaleY;
      result[id] = {
        x: p.x + lx * cos - ly * sin,
        y: p.y + lx * sin + ly * cos,
        rotation: p.rotation + spring.angle,
        scaleX: p.scaleX * spring.sx,
        scaleY: p.scaleY * spring.sy,
      };
    }
  }

  return result;
}

interface HitCircle {
  zone: TouchZone;
  bone: BoneId;
  offsetU: number;
  offsetV: number;
  radiusU: number;
  radiusV: number;
}

const HIT_ZONES: HitCircle[] = [
  // Ordered highest priority first (nose & waving paw before head/torso)
  { zone: 'nose', bone: 'head', offsetU: 0.0, offsetV: -0.19, radiusU: 0.13, radiusV: 0.065 },
  { zone: 'wavePaw', bone: 'rightPaw', offsetU: -0.02, offsetV: -0.05, radiusU: 0.14, radiusV: 0.11 },
  { zone: 'leftEar', bone: 'leftEar', offsetU: -0.09, offsetV: 0.09, radiusU: 0.11, radiusV: 0.12 },
  { zone: 'rightEar', bone: 'rightEar', offsetU: 0.1, offsetV: 0.09, radiusU: 0.11, radiusV: 0.12 },
  { zone: 'head', bone: 'head', offsetU: 0.0, offsetV: -0.2, radiusU: 0.25, radiusV: 0.19 },
  { zone: 'leftArm', bone: 'leftArm', offsetU: 0.03, offsetV: 0.11, radiusU: 0.09, radiusV: 0.14 },
  { zone: 'belly', bone: 'torso', offsetU: 0.0, offsetV: -0.1, radiusU: 0.22, radiusV: 0.19 },
  { zone: 'leftFoot', bone: 'leftLeg', offsetU: -0.03, offsetV: 0.15, radiusU: 0.11, radiusV: 0.1 },
  { zone: 'rightFoot', bone: 'rightLeg', offsetU: 0.04, offsetV: 0.14, radiusU: 0.11, radiusV: 0.1 },
];

export function hitTestBenZone(
  normX: number,
  normY: number,
  state: RigState
): TouchZone | null {
  const world = computeWorldBoneTransforms(state);

  for (const hz of HIT_ZONES) {
    const bt = world[hz.bone];
    const cos = Math.cos(bt.rotation);
    const sin = Math.sin(bt.rotation);
    const cx = bt.x + (hz.offsetU * cos - hz.offsetV * sin) * bt.scaleX;
    const cy = bt.y + (hz.offsetU * sin + hz.offsetV * cos) * bt.scaleY;

    // Aspect-compensated normalized distance (sprite is 333x565 -> ratio ~ 0.59)
    const dx = (normX - cx) / hz.radiusU;
    const dy = (normY - cy) / hz.radiusV;
    if (dx * dx + dy * dy <= 1.0) {
      return hz.zone;
    }
  }
  return null;
}

export function getZoneAnchor(zone: TouchZone, state: RigState): { u: number; v: number } {
  const world = computeWorldBoneTransforms(state);
  const hz = HIT_ZONES.find((item) => item.zone === zone);
  if (!hz) return { u: 0.5, v: 0.4 };
  const bt = world[hz.bone];
  const cos = Math.cos(bt.rotation);
  const sin = Math.sin(bt.rotation);
  return {
    u: bt.x + (hz.offsetU * cos - hz.offsetV * sin) * bt.scaleX,
    v: bt.y + (hz.offsetU * sin + hz.offsetV * cos) * bt.scaleY,
  };
}
