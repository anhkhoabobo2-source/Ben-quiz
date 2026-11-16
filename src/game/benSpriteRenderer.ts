import {
  BONE_PIVOTS,
  type BoneId,
  type BoneTransform,
  computeWorldBoneTransforms,
  getZoneAnchor,
  type RigState,
  SPRITE_HEIGHT,
  SPRITE_WIDTH,
  type TouchZone,
} from './boneRig';

interface PartMask {
  id: BoneId;
  /** Bounds in normalized 0..1 sprite coords */
  u0: number;
  v0: number;
  u1: number;
  v1: number;
  /** Optional feathered exclusion/inclusion function in normalized coords */
  alphaFn: (u: number, v: number) => number;
}

interface PartSlice {
  id: BoneId;
  canvas: HTMLCanvasElement;
  /** Offset from bone pivot to slice top-left in sprite pixels */
  offsetX: number;
  offsetY: number;
}

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  kind: 'diamond' | 'ring';
}

interface FloatingCaption {
  text: string;
  x: number;
  y: number;
  life: number;
  maxLife: number;
}

const PARTICLE_POOL_SIZE = 40;

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function ellipseAlpha(
  u: number,
  v: number,
  cu: number,
  cv: number,
  ru: number,
  rv: number,
  feather = 0.18
): number {
  const dx = (u - cu) / ru;
  const dy = (v - cv) / rv;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return 1 - smoothstep(1 - feather, 1 + feather * 0.25, dist);
}

const PART_MASKS: PartMask[] = [
  {
    id: 'leftLeg',
    u0: 0.2,
    v0: 0.66,
    u1: 0.52,
    v1: 0.99,
    alphaFn: (u, v) =>
      ellipseAlpha(u, v, 0.37, 0.84, 0.16, 0.17, 0.18) *
      smoothstep(0.65, 0.72, v) *
      (1 - smoothstep(0.49, 0.53, u)),
  },
  {
    id: 'rightLeg',
    u0: 0.5,
    v0: 0.66,
    u1: 0.84,
    v1: 0.98,
    alphaFn: (u, v) =>
      ellipseAlpha(u, v, 0.65, 0.84, 0.17, 0.16, 0.18) *
      smoothstep(0.65, 0.72, v) *
      smoothstep(0.49, 0.53, u),
  },
  {
    id: 'leftArm',
    u0: 0.67,
    v0: 0.41,
    u1: 0.89,
    v1: 0.73,
    alphaFn: (u, v) =>
      ellipseAlpha(u, v, 0.77, 0.57, 0.12, 0.16, 0.22) *
      smoothstep(0.66, 0.73, u),
  },
  {
    id: 'torso',
    u0: 0.21,
    v0: 0.35,
    u1: 0.79,
    v1: 0.83,
    alphaFn: (u, v) => {
      const base = ellipseAlpha(u, v, 0.51, 0.59, 0.28, 0.24, 0.14);
      const topBlend = smoothstep(0.34, 0.39, v);
      // Keep shoulders intact while trimming away the waving forearm tip
      const trimWaveHand = 1 - (1 - smoothstep(0.22, 0.28, u)) * (1 - smoothstep(0.42, 0.48, v));
      return base * topBlend * trimWaveHand;
    },
  },
  {
    id: 'rightUpperArm',
    u0: 0.13,
    v0: 0.33,
    u1: 0.36,
    v1: 0.53,
    alphaFn: (u, v) =>
      ellipseAlpha(u, v, 0.25, 0.43, 0.12, 0.10, 0.22) *
      (1 - smoothstep(0.31, 0.36, u)),
  },
  {
    id: 'rightPaw',
    u0: 0.0,
    v0: 0.19,
    u1: 0.25,
    v1: 0.44,
    alphaFn: (u, v) =>
      ellipseAlpha(u, v, 0.13, 0.31, 0.13, 0.13, 0.18) *
      (1 - smoothstep(0.21, 0.25, u)),
  },
  {
    id: 'leftEar',
    u0: 0.06,
    v0: 0.04,
    u1: 0.32,
    v1: 0.31,
    alphaFn: (u, v) =>
      ellipseAlpha(u, v, 0.19, 0.18, 0.13, 0.14, 0.2) *
      (1 - smoothstep(0.28, 0.33, u)),
  },
  {
    id: 'rightEar',
    u0: 0.69,
    v0: 0.04,
    u1: 0.99,
    v1: 0.32,
    alphaFn: (u, v) =>
      ellipseAlpha(u, v, 0.84, 0.18, 0.14, 0.14, 0.2) *
      smoothstep(0.68, 0.73, u),
  },
  {
    id: 'head',
    u0: 0.22,
    v0: 0.01,
    u1: 0.78,
    v1: 0.42,
    alphaFn: (u, v) => {
      const base = ellipseAlpha(u, v, 0.50, 0.21, 0.27, 0.21, 0.14);
      const cutLeftEar = 1 - (1 - smoothstep(0.24, 0.29, u)) * smoothstep(0.11, 0.16, v);
      const cutRightEar = 1 - smoothstep(0.71, 0.76, u) * smoothstep(0.11, 0.16, v);
      return base * cutLeftEar * cutRightEar;
    },
  },
  {
    id: 'jaw',
    u0: 0.30,
    v0: 0.29,
    u1: 0.71,
    v1: 0.43,
    alphaFn: (u, v) =>
      ellipseAlpha(u, v, 0.50, 0.36, 0.20, 0.075, 0.22) *
      smoothstep(0.29, 0.33, v),
  },
];

/**
 * Flood-fills exterior near-white background pixels from the four image edges
 * AND removes enclosed white background pockets outside the eye/teeth boxes
 * so Ben's teeth and sclera stay solid while the white background vanishes cleanly.
 */
function removeExteriorWhiteBackground(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  const ctx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return sourceCanvas;

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const visited = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;

  const isBgLike = (idx4: number): boolean => {
    const r = data[idx4];
    const g = data[idx4 + 1];
    const b = data[idx4 + 2];
    const minC = Math.min(r, g, b);
    const maxC = Math.max(r, g, b);
    return minC > 220 && maxC - minC < 28;
  };

  const isProtectedFeature = (x: number, y: number): boolean => {
    const u = x / w;
    const v = y / h;
    // Eyes region
    if (u >= 0.38 && u <= 0.64 && v >= 0.10 && v <= 0.20) return true;
    // Mouth / teeth region
    if (u >= 0.34 && u <= 0.66 && v >= 0.31 && v <= 0.385) return true;
    return false;
  };

  const pushIfBg = (x: number, y: number) => {
    const p = y * w + x;
    if (visited[p]) return;
    if (isBgLike(p * 4)) {
      visited[p] = 1;
      queue[tail++] = p;
    }
  };

  for (let x = 0; x < w; x++) {
    pushIfBg(x, 0);
    pushIfBg(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    pushIfBg(0, y);
    pushIfBg(w - 1, y);
  }

  // Also seed trapped bright-white pockets outside eyes/teeth (e.g., between waving arm & cheek)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (isProtectedFeature(x, y)) continue;
      const p = y * w + x;
      const idx4 = p * 4;
      const r = data[idx4];
      const g = data[idx4 + 1];
      const b = data[idx4 + 2];
      const minC = Math.min(r, g, b);
      const maxC = Math.max(r, g, b);
      if (minC > 236 && maxC - minC < 18) {
        pushIfBg(x, y);
      }
    }
  }

  while (head < tail) {
    const p = queue[head++];
    const x = p % w;
    const y = (p - x) / w;

    if (x > 0 && !isProtectedFeature(x - 1, y)) pushIfBg(x - 1, y);
    if (x < w - 1 && !isProtectedFeature(x + 1, y)) pushIfBg(x + 1, y);
    if (y > 0 && !isProtectedFeature(x, y - 1)) pushIfBg(x, y - 1);
    if (y < h - 1 && !isProtectedFeature(x, y + 1)) pushIfBg(x, y + 1);
  }

  for (let p = 0; p < w * h; p++) {
    if (visited[p]) {
      data[p * 4 + 3] = 0;
    } else {
      const x = p % w;
      const y = (p - x) / w;
      let bgNeighbors = 0;
      if (x > 0 && visited[p - 1]) bgNeighbors++;
      if (x < w - 1 && visited[p + 1]) bgNeighbors++;
      if (y > 0 && visited[p - w]) bgNeighbors++;
      if (y < h - 1 && visited[p + w]) bgNeighbors++;
      if (bgNeighbors > 0) {
        const idx4 = p * 4;
        const lum = (data[idx4] + data[idx4 + 1] + data[idx4 + 2]) / 3;
        if (lum > 180) {
          data[idx4 + 3] = Math.round(data[idx4 + 3] * (1 - bgNeighbors * 0.18));
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return sourceCanvas;
}

function buildBoneSlices(cleanSprite: HTMLCanvasElement): Map<BoneId, PartSlice> {
  const slices = new Map<BoneId, PartSlice>();
  const srcCtx = cleanSprite.getContext('2d', { willReadFrequently: true });
  if (!srcCtx) return slices;
  const srcData = srcCtx.getImageData(0, 0, SPRITE_WIDTH, SPRITE_HEIGHT).data;

  for (const mask of PART_MASKS) {
    const x0 = Math.max(0, Math.floor(mask.u0 * SPRITE_WIDTH));
    const y0 = Math.max(0, Math.floor(mask.v0 * SPRITE_HEIGHT));
    const x1 = Math.min(SPRITE_WIDTH, Math.ceil(mask.u1 * SPRITE_WIDTH));
    const y1 = Math.min(SPRITE_HEIGHT, Math.ceil(mask.v1 * SPRITE_HEIGHT));
    const sw = Math.max(1, x1 - x0);
    const sh = Math.max(1, y1 - y0);

    const partCanvas = document.createElement('canvas');
    partCanvas.width = sw;
    partCanvas.height = sh;
    const pCtx = partCanvas.getContext('2d');
    if (!pCtx) continue;

    const outImg = pCtx.createImageData(sw, sh);
    const out = outImg.data;

    for (let py = 0; py < sh; py++) {
      const sy = y0 + py;
      const v = sy / SPRITE_HEIGHT;
      for (let px = 0; px < sw; px++) {
        const sx = x0 + px;
        const u = sx / SPRITE_WIDTH;
        const srcIdx = (sy * SPRITE_WIDTH + sx) * 4;
        const dstIdx = (py * sw + px) * 4;
        const maskAlpha = mask.alphaFn(u, v);
        out[dstIdx] = srcData[srcIdx];
        out[dstIdx + 1] = srcData[srcIdx + 1];
        out[dstIdx + 2] = srcData[srcIdx + 2];
        out[dstIdx + 3] = Math.round(srcData[srcIdx + 3] * maskAlpha);
      }
    }

    pCtx.putImageData(outImg, 0, 0);
    const pivot = BONE_PIVOTS[mask.id];
    slices.set(mask.id, {
      id: mask.id,
      canvas: partCanvas,
      offsetX: x0 - pivot.u * SPRITE_WIDTH,
      offsetY: y0 - pivot.v * SPRITE_HEIGHT,
    });
  }

  return slices;
}

export class BenCanvasRenderer {
  private cleanSprite: HTMLCanvasElement | null = null;
  private slices: Map<BoneId, PartSlice> = new Map();
  private loaded = false;
  private loadFailed = false;
  private particles: Particle[] = [];
  private caption: FloatingCaption | null = null;
  private layoutBox = { x: 0, y: 0, w: SPRITE_WIDTH, h: SPRITE_HEIGHT, scale: 1 };
  private bgCache: { canvas: HTMLCanvasElement; w: number; h: number; shiftX: number; shiftY: number } | null = null;

  constructor() {
    for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
      this.particles.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 6,
        life: 0,
        maxLife: 0.6,
        color: '#b45309',
        kind: 'diamond',
      });
    }
  }

  public loadImage(src: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const off = document.createElement('canvas');
        off.width = SPRITE_WIDTH;
        off.height = SPRITE_HEIGHT;
        const ctx = off.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
          this.cleanSprite = removeExteriorWhiteBackground(off);
          this.slices = buildBoneSlices(this.cleanSprite);
          this.loaded = true;
        }
        resolve();
      };
      img.onerror = () => {
        this.loadFailed = true;
        resolve();
      };
      img.src = src;
    });
  }

  public isReady(): boolean {
    return this.loaded;
  }

  public spawnZoneBurst(
    zone: TouchZone,
    captionText: string,
    rigState: RigState,
    accentColor: string
  ): void {
    const anchor = getZoneAnchor(zone, rigState);
    const px = this.layoutBox.x + anchor.u * this.layoutBox.w;
    const py = this.layoutBox.y + anchor.v * this.layoutBox.h;

    this.caption = {
      text: captionText,
      x: px,
      y: py - 24,
      life: 0.95,
      maxLife: 0.95,
    };

    // Spawn 1 ring + 8 geometric diamond bursts from pre-allocated pool
    let spawned = 0;
    for (let i = 0; i < this.particles.length && spawned < 9; i++) {
      const p = this.particles[i];
      if (!p.active) {
        p.active = true;
        p.x = px;
        p.y = py;
        if (spawned === 0) {
          p.kind = 'ring';
          p.vx = 0;
          p.vy = 0;
          p.size = 18;
          p.maxLife = 0.42;
        } else {
          const ang = ((spawned - 1) / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
          const speed = 75 + Math.random() * 90;
          p.kind = 'diamond';
          p.vx = Math.cos(ang) * speed;
          p.vy = Math.sin(ang) * speed - 35;
          p.size = 5 + Math.random() * 4;
          p.maxLife = 0.45 + Math.random() * 0.25;
        }
        p.life = p.maxLife;
        p.color = accentColor;
        spawned++;
      }
    }
  }

  public spawnQuizBurst(isCorrect: boolean): void {
    const px = this.layoutBox.x + this.layoutBox.w * 0.5;
    const py = this.layoutBox.y + this.layoutBox.h * 0.25;
    const color = isCorrect ? '#15803d' : '#b91c1c';
    let spawned = 0;
    for (let i = 0; i < this.particles.length && spawned < 14; i++) {
      const p = this.particles[i];
      if (!p.active) {
        const ang = (spawned / 14) * Math.PI * 2;
        const speed = 90 + Math.random() * 110;
        p.active = true;
        p.kind = 'diamond';
        p.x = px;
        p.y = py;
        p.vx = Math.cos(ang) * speed;
        p.vy = Math.sin(ang) * speed - 60;
        p.size = 6 + Math.random() * 5;
        p.maxLife = 0.65;
        p.life = 0.65;
        p.color = color;
        spawned++;
      }
    }
  }

  public screenToSpriteNorm(
    localX: number,
    localY: number
  ): { u: number; v: number } | null {
    const { x, y, w, h } = this.layoutBox;
    if (w <= 0 || h <= 0) return null;
    const u = (localX - x) / w;
    const v = (localY - y) / h;
    if (u < -0.15 || u > 1.15 || v < -0.15 || v > 1.15) return null;
    return { u, v };
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dt: number,
    rigState: RigState,
    options: {
      hoveredZone: TouchZone | null;
      showBones: boolean;
      stageShiftX?: number;
      stageShiftY?: number;
      maxHeightRatio?: number;
    }
  ): void {
    // Soft spotlight halo behind Ben
    const spriteAspect = SPRITE_WIDTH / SPRITE_HEIGHT;
    const heightRatio = options.maxHeightRatio ?? 0.84;
    const maxSpriteH = Math.min(height * heightRatio, 620);
    const spriteH = Math.max(180, maxSpriteH);
    const spriteW = spriteH * spriteAspect;
    const scale = spriteW / SPRITE_WIDTH;
    const shiftX = options.stageShiftX ?? 0;
    const shiftY = options.stageShiftY ?? 0;
    const spriteX = width * 0.5 + shiftX - spriteW * 0.5;
    const spriteY = height * 0.52 + shiftY - spriteH * 0.5;

    this.layoutBox = { x: spriteX, y: spriteY, w: spriteW, h: spriteH, scale };

    // Cached static backdrop (rebuilt only when dimensions or stage shift change)
    if (
      !this.bgCache ||
      this.bgCache.w !== width ||
      this.bgCache.h !== height ||
      Math.abs(this.bgCache.shiftX - shiftX) > 1 ||
      Math.abs(this.bgCache.shiftY - shiftY) > 1
    ) {
      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = Math.max(1, Math.round(width));
      bgCanvas.height = Math.max(1, Math.round(height));
      const bCtx = bgCanvas.getContext('2d');
      if (bCtx) {
        const bgGrad = bCtx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#f5efe4');
        bgGrad.addColorStop(0.76, '#ebe1d0');
        bgGrad.addColorStop(1, '#dfd2bc');
        bCtx.fillStyle = bgGrad;
        bCtx.fillRect(0, 0, width, height);

        const floorY = height * 0.78;
        bCtx.strokeStyle = 'rgba(120, 96, 68, 0.14)';
        bCtx.lineWidth = 1.5;
        bCtx.beginPath();
        bCtx.moveTo(0, floorY);
        bCtx.lineTo(width, floorY);
        bCtx.stroke();

        const haloCx = spriteX + spriteW * 0.5;
        const haloCy = spriteY + spriteH * 0.48;
        const halo = bCtx.createRadialGradient(
          haloCx,
          haloCy,
          spriteW * 0.12,
          haloCx,
          haloCy,
          spriteH * 0.58
        );
        halo.addColorStop(0, 'rgba(255, 250, 240, 0.92)');
        halo.addColorStop(0.65, 'rgba(248, 240, 224, 0.35)');
        halo.addColorStop(1, 'rgba(248, 240, 224, 0)');
        bCtx.fillStyle = halo;
        bCtx.fillRect(0, 0, width, height);
      }
      this.bgCache = { canvas: bgCanvas, w: width, h: height, shiftX, shiftY };
    }

    ctx.drawImage(this.bgCache.canvas, 0, 0, width, height);

    const haloCx = spriteX + spriteW * 0.5;
    const haloCy = spriteY + spriteH * 0.48;

    // Ground shadow responding to Ben's vertical root bounce
    const rootBounce = rigState.bones.root.oy;
    const shadowScale = Math.max(0.75, 1 + rootBounce * 1.4);
    ctx.save();
    ctx.fillStyle = 'rgba(68, 50, 32, 0.18)';
    ctx.beginPath();
    ctx.ellipse(
      spriteX + spriteW * 0.51,
      spriteY + spriteH * 0.955,
      spriteW * 0.36 * shadowScale,
      spriteH * 0.032 * shadowScale,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    const world = computeWorldBoneTransforms(rigState);

    if (this.loaded && this.slices.size > 0) {
      // Render bones in depth order (legs -> leftArm -> torso -> rightUpperArm -> rightPaw -> head -> ears -> jaw)
      const drawOrder: BoneId[] = [
        'leftLeg',
        'rightLeg',
        'leftArm',
        'torso',
        'rightUpperArm',
        'rightPaw',
        'leftEar',
        'rightEar',
        'head',
        'jaw',
      ];

      for (const boneId of drawOrder) {
        const slice = this.slices.get(boneId);
        const bt = world[boneId];
        if (!slice || !bt) continue;

        ctx.save();
        ctx.translate(spriteX + bt.x * spriteW, spriteY + bt.y * spriteH);
        ctx.rotate(bt.rotation);
        ctx.scale(bt.scaleX * scale, bt.scaleY * scale);

        // Before drawing jaw, draw dark mouth interior inside head coordinate space if mouth opens
        if (boneId === 'head' && rigState.mouthOpen > 0.06) {
          this.drawMouthInterior(ctx, rigState.mouthOpen);
        }

        ctx.drawImage(slice.canvas, slice.offsetX, slice.offsetY);

        // Eye blink eyelids & subtle pupil gaze on the head bone
        if (boneId === 'head') {
          this.drawEyeExpressions(ctx, rigState);
        }

        ctx.restore();
      }
    } else if (!this.loadFailed) {
      // Subtle geometric placeholder while image loads
      ctx.save();
      ctx.fillStyle = 'rgba(130, 102, 72, 0.18)';
      ctx.beginPath();
      ctx.ellipse(haloCx, haloCy, spriteW * 0.28, spriteH * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Hover highlight ring on active touch zone
    if (options.hoveredZone) {
      const anchor = getZoneAnchor(options.hoveredZone, rigState);
      const hx = spriteX + anchor.u * spriteW;
      const hy = spriteY + anchor.v * spriteH;
      ctx.save();
      ctx.strokeStyle = 'rgba(180, 83, 9, 0.55)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(hx, hy, Math.max(18, spriteW * 0.095), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Optional live skeletal bone rig overlay
    if (options.showBones) {
      this.drawSkeletonOverlay(ctx, world, spriteX, spriteY, spriteW, spriteH);
    }

    // Update & render pooled particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }
      const alpha = Math.max(0, p.life / p.maxLife);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 190 * dt;

      ctx.save();
      ctx.globalAlpha = alpha;
      if (p.kind === 'ring') {
        const radius = p.size + (1 - alpha) * 34;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.translate(p.x, p.y);
        ctx.rotate((1 - alpha) * 2.2);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        p.size && ctx.lineTo(p.size * 0.7, 0);
        ctx.lineTo(0, p.size);
        ctx.lineTo(-p.size * 0.7, 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Floating reaction caption inside canvas
    if (this.caption) {
      this.caption.life -= dt;
      if (this.caption.life <= 0) {
        this.caption = null;
      } else {
        const t = 1 - this.caption.life / this.caption.maxLife;
        const alpha = this.caption.life < 0.25 ? this.caption.life / 0.25 : 1;
        const cy = this.caption.y - t * 28;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = '700 18px "Bricolage Grotesque", sans-serif';
        const metrics = ctx.measureText(this.caption.text);
        const padX = 14;
        const boxW = metrics.width + padX * 2;
        const boxH = 34;
        const bx = Math.max(12, Math.min(width - boxW - 12, this.caption.x - boxW / 2));
        const by = Math.max(12, cy - boxH / 2);

        ctx.fillStyle = '#fffdf8';
        ctx.strokeStyle = '#d6cbb8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(bx, by, boxW, boxH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#261f18';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.caption.text, bx + boxW / 2, by + boxH / 2 + 1);
        ctx.restore();
      }
    }
  }

  private drawMouthInterior(ctx: CanvasRenderingContext2D, mouthOpen: number): void {
    // Head pivot is at (0.51 * 333, 0.41 * 565)
    // Mouth center is around (0.50 * 333, 0.35 * 565) -> local (-3, -34)
    ctx.save();
    ctx.fillStyle = '#241110';
    ctx.beginPath();
    ctx.ellipse(-2, -33, 44, 13 + mouthOpen * 11, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#a84750';
    ctx.beginPath();
    ctx.ellipse(-2, -26 + mouthOpen * 4, 23, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawEyeExpressions(ctx: CanvasRenderingContext2D, rigState: RigState): void {
    // Head pivot (0.51, 0.41) -> in sprite pixels (170, 231.6)
    // Left eye center ~ (0.445, 0.145) -> (148, 82) -> local (-22, -150)
    // Right eye center ~ (0.575, 0.145) -> (191, 82) -> local (+21, -150)
    const eyes = [
      { lx: -22, ly: -150 },
      { lx: 21, ly: -150 },
    ];

    if (rigState.blinkAmount > 0.04) {
      ctx.save();
      ctx.fillStyle = '#9a7852';
      ctx.strokeStyle = '#4e3924';
      ctx.lineWidth = 2;
      for (const eye of eyes) {
        const lidH = 14 * rigState.blinkAmount;
        ctx.beginPath();
        ctx.ellipse(eye.lx, eye.ly - 13 + lidH * 0.5, 16, lidH, 0, 0, Math.PI * 2);
        ctx.fill();
        if (rigState.blinkAmount > 0.55) {
          ctx.beginPath();
          ctx.moveTo(eye.lx - 14, eye.ly);
          ctx.quadraticCurveTo(eye.lx, eye.ly + 4, eye.lx + 14, eye.ly);
          ctx.stroke();
        }
      }
      ctx.restore();
    } else if (rigState.mood === 'happy' || rigState.mood === 'celebrate') {
      // Subtle cheerful sparkle glint in pupils
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      for (const eye of eyes) {
        ctx.beginPath();
        ctx.arc(eye.lx + rigState.gazeX * 2.5 - 2, eye.ly + rigState.gazeY * 2 - 2, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private drawSkeletonOverlay(
    ctx: CanvasRenderingContext2D,
    world: Record<BoneId, BoneTransform>,
    spriteX: number,
    spriteY: number,
    spriteW: number,
    spriteH: number
  ): void {
    ctx.save();
    // Bone links
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 4]);
    for (const id of Object.keys(BONE_PIVOTS) as BoneId[]) {
      const pivot = BONE_PIVOTS[id];
      if (!pivot.parent) continue;
      const child = world[id];
      const parent = world[pivot.parent];
      ctx.beginPath();
      ctx.moveTo(spriteX + parent.x * spriteW, spriteY + parent.y * spriteH);
      ctx.lineTo(spriteX + child.x * spriteW, spriteY + child.y * spriteH);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Joint pins
    for (const id of Object.keys(BONE_PIVOTS) as BoneId[]) {
      const bt = world[id];
      const jx = spriteX + bt.x * spriteW;
      const jy = spriteY + bt.y * spriteH;
      ctx.fillStyle = '#fffdf8';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(jx, jy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
}
