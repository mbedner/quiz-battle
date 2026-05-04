import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { Player, AttackResult, RoundPhase, AnswerStatus } from '../types';
import { CharacterName } from '../types';
import { sound } from '../utils/sound';

interface Props {
  players: Player[];
  roundPhase: RoundPhase;
  playerAnswerStatus: Record<string, AnswerStatus>;
  attackResults: AttackResult[];
  timeLeft: number;
  roundNumber: number;
  battleNumber: number;
  message: string;
  hideHpBar?: boolean;
}

// Canvas logical dimensions
const W = 900;
const H = 400;
const HP_H  = 74;   // top HP-bar section height
const FLOOR_H = 34; // wood floor strip height
const FLOOR_Y = H - FLOOR_H;



interface FighterObj {
  container: PIXI.Container;
  badgeGfx: PIXI.Graphics;
  badgeTxt: PIXI.Text;
  idleTween: gsap.core.Animation | null;
  baseX: number;
  baseY: number;
  flip: boolean;
}

interface HpBarObj {
  fill: PIXI.Graphics;
  hypeFill: PIXI.Graphics;
  maxW: number;
  flip: boolean;
}

interface StageObjs {
  app: PIXI.Application;
  fighterLayer: PIXI.Container;
  hpLayer: PIXI.Container;
  uiLayer: PIXI.Container;
  fighters: FighterObj[];
  hpBars: HpBarObj[];
  centerTxt: PIXI.Text;
  timerTxt: PIXI.Text;
  subTxt: PIXI.Text;
}

// ── Canvas helpers ─────────────────────────────────────────────

function makeGradientBg(): PIXI.Sprite {
  const cv = document.createElement('canvas');
  cv.width = 4; cv.height = FLOOR_Y - HP_H;
  const ctx = cv.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, cv.height);
  g.addColorStop(0,    '#0d0221');
  g.addColorStop(0.35, '#1a0533');
  g.addColorStop(0.75, '#2d0a0a');
  g.addColorStop(1,    '#3a1200');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cv.width, cv.height);
  const spr = new PIXI.Sprite(PIXI.Texture.from(cv));
  spr.width = W; spr.height = cv.height;
  spr.y = HP_H;
  return spr;
}

function makeFloor(): PIXI.Graphics {
  const g = new PIXI.Graphics();
  g.y = FLOOR_Y;
  g.beginFill(0x3d1f00); g.drawRect(0, 0, W, FLOOR_H); g.endFill();
  g.beginFill(0x6b3a00); g.drawRect(0, 0, W, 3);        g.endFill();
  g.lineStyle(1, 0x2a1400, 0.5);
  for (let x = 0; x < W; x += 64) { g.moveTo(x, 3); g.lineTo(x, FLOOR_H); }
  return g;
}

function redrawHpFill(gfx: PIXI.Graphics, pct: number, maxW: number, h: number, flip: boolean) {
  gfx.clear();
  const col = pct > 0.5 ? 0x22c55e : pct > 0.25 ? 0xeab308 : 0xef4444;
  const w = Math.max(0, Math.round(pct * maxW));
  if (!w) return;
  gfx.beginFill(col);
  gfx.drawRoundedRect(flip ? maxW - w : 0, 0, w, h, 4);
  gfx.endFill();
}

function redrawHypeFill(gfx: PIXI.Graphics, pct: number, maxW: number, h: number, flip: boolean) {
  gfx.clear();
  const w = Math.max(0, Math.round(pct * maxW));
  if (!w) return;
  gfx.beginFill(pct >= 1 ? 0xf59e0b : 0x6366f1);
  gfx.drawRoundedRect(flip ? maxW - w : 0, 0, w, h, 2);
  gfx.endFill();
}

// ── Component ──────────────────────────────────────────────────

export function FightingStage({
  players, roundPhase, playerAnswerStatus, attackResults, timeLeft, roundNumber, battleNumber, message, hideHpBar,
}: Props) {
  const wrapRef      = useRef<HTMLDivElement>(null);
  const stageRef     = useRef<StageObjs | null>(null);
  const playersRef   = useRef(players);
  const animKeyRef   = useRef('');
  const hideHpBarRef = useRef(hideHpBar);

  // Keep refs fresh for stale-closure safety
  useEffect(() => { playersRef.current = players; });
  useEffect(() => { hideHpBarRef.current = hideHpBar; }, [hideHpBar]);

  // ── Init Pixi ────────────────────────────────────────────────
  useEffect(() => {
    if (!wrapRef.current || stageRef.current) return;

    const app = new PIXI.Application({
      width: W, height: H,
      backgroundColor: 0x020617,
      antialias: true,
      resolution: 1,
    });
    const cv = app.view as HTMLCanvasElement;
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    wrapRef.current.appendChild(cv);

    // Layer ordering
    const bgLayer      = new PIXI.Container();
    const hpLayer      = new PIXI.Container();
    const fighterLayer = new PIXI.Container();
    const uiLayer      = new PIXI.Container();
    app.stage.addChild(bgLayer, hpLayer, fighterLayer, uiLayer);

    // Background image
    const bgSpr = new PIXI.Sprite(PIXI.Texture.from('/battleworld-bg.png'));
    bgSpr.width = W; bgSpr.height = H;
    bgLayer.addChild(bgSpr);

    // HP section backdrop + VS label
    const hpBg = new PIXI.Graphics();
    hpBg.beginFill(0x000000, hideHpBarRef.current ? 0 : 0.55);
    hpBg.drawRect(0, 0, W, HP_H);
    hpBg.endFill();
    if (hideHpBarRef.current) hpBg.alpha = 0;
    hpLayer.addChild(hpBg);

    const vsTxt = new PIXI.Text('VS', {
      fontFamily: "'Press Start 2P', monospace", fontSize: 14, fontWeight: '400',
      fill: '#ffffff',
    });
    vsTxt.alpha = 0.4;
    vsTxt.anchor.set(0.5);
    vsTxt.position.set(W / 2, HP_H / 2);
    hpLayer.addChild(vsTxt);
    if (hideHpBarRef.current) vsTxt.visible = false;

    // Center overlay texts
    const centerTxt = new PIXI.Text('', {
      fontFamily: "'Press Start 2P', monospace", fontSize: 44, fontWeight: '400',
      fill: '#ffffff', stroke: '#6366f1', strokeThickness: 6,
      letterSpacing: 3, align: 'center',
      dropShadow: true, dropShadowColor: '#000000', dropShadowDistance: 4, dropShadowBlur: 6,
    });
    centerTxt.anchor.set(0.5);
    centerTxt.position.set(W / 2, H * 0.25);
    centerTxt.visible = false;
    uiLayer.addChild(centerTxt);

    const timerTxt = new PIXI.Text('', {
      fontFamily: "'Press Start 2P', monospace", fontSize: 58, fontWeight: '400',
      fill: '#ffffff', align: 'center',
      dropShadow: true, dropShadowColor: '#00000088', dropShadowDistance: 3,
    });
    timerTxt.anchor.set(0.5);
    timerTxt.position.set(W / 2, H * 0.50);
    timerTxt.visible = false;
    uiLayer.addChild(timerTxt);

    const subTxt = new PIXI.Text('', {
      fontFamily: "'Press Start 2P', monospace", fontSize: 15, fill: '#ffffff', align: 'center', wordWrap: true, wordWrapWidth: W - 40,
    });
    subTxt.anchor.set(0.5);
    subTxt.position.set(W / 2, timerTxt.y + 56);
    subTxt.visible = false;
    uiLayer.addChild(subTxt);

    stageRef.current = {
      app, fighterLayer, hpLayer, uiLayer,
      fighters: [], hpBars: [],
      centerTxt, timerTxt, subTxt,
    };

    return () => {
      stageRef.current?.fighters.forEach(f => f.idleTween?.kill());
      gsap.killTweensOf(app.stage);
      app.destroy(true, { children: true });
      stageRef.current = null;
    };
  }, []);

  // ── Build fighters + HP bars when player roster/characters change
  // battleNumber is included so fighters fully rebuild between battles (clears KO state)
  const playerKey = `${battleNumber}:` + players.map(p => `${p.id}:${p.character ?? ''}`).join('|');
  useEffect(() => {
    const s = stageRef.current;
    if (!s) return;

    // Teardown
    s.fighters.forEach(f => { f.idleTween?.kill(); f.container.destroy({ children: true }); });
    s.fighters.length = 0;
    s.hpBars.forEach(b => b.fill.parent?.parent?.destroy({ children: false }));
    s.hpBars.length = 0;
    // Remove dynamic hp containers (keep first 2 children: hpBg, vsTxt)
    while (s.hpLayer.children.length > 2) s.hpLayer.removeChildAt(2);

    if (players.length < 2) return;
    const [p1, p2] = players;

    // ── Build fighters
    [p1, p2].forEach((p, idx) => {
      const flip    = idx === 1;
      const char    = (p.character ?? 'carnage') as CharacterName;
      const baseX   = flip ? W - 160 : 160;
      const baseY   = Math.round(H * 0.74);

      const container = new PIXI.Container();
      container.position.set(baseX, baseY);

      // PNG sprite — anchored at bottom so character stands on the floor
      const tex = PIXI.Texture.from(`/sprites/${char}.png`);
      const sprImg = new PIXI.Sprite(tex);
      sprImg.width = 160;
      sprImg.height = 160;
      sprImg.anchor.set(0.5, 1); // feet at origin
      if (flip) sprImg.scale.x = -sprImg.scale.x;
      container.addChild(sprImg);

      // Name label
      const nameTxt = new PIXI.Text(p.name, {
        fontFamily: "'Press Start 2P', monospace", fontSize: 9, fontWeight: '400',
        fill: '#e2e8f0', stroke: '#000000', strokeThickness: 3, align: 'center',
      });
      nameTxt.anchor.set(0.5);
      nameTxt.y = 14;
      container.addChild(nameTxt);

      // Answer status badge (shown during answering phase)
      const badgeGfx = new PIXI.Graphics();
      const badgeTxt = new PIXI.Text('', { fontSize: 18, align: 'center' });
      badgeTxt.anchor.set(0.5);
      badgeTxt.y = -170;
      badgeGfx.y = -170;
      badgeTxt.visible = false;
      container.addChild(badgeGfx, badgeTxt);

      s.fighterLayer.addChild(container);

      // Weight-shift idle: subtle sway forward/back + gentle tilt
      const swayDir = flip ? -1 : 1;
      const idleTl = gsap.timeline({ repeat: -1 });
      idleTl
        .to(container, { x: baseX + swayDir * 3, rotation: swayDir * 0.016, duration: 1.2, ease: 'sine.inOut' })
        .to(container, { x: baseX - swayDir * 2, rotation: -swayDir * 0.010, duration: 1.4, ease: 'sine.inOut' })
        .to(container, { x: baseX + swayDir * 1, rotation: swayDir * 0.008, duration: 1.0, ease: 'sine.inOut' })
        .to(container, { x: baseX, rotation: 0, duration: 0.8, ease: 'sine.inOut' });
      const idleTween = idleTl as gsap.core.Animation;

      s.fighters.push({ container, badgeGfx, badgeTxt, idleTween, baseX, baseY, flip });
    });

    // ── Build HP bars (only when not hiding them)
    if (hideHpBarRef.current) return;
    [p1, p2].forEach((p, idx) => {
      const flip  = idx === 1;
      const maxW  = W / 2 - 82;
      const ox    = flip ? W / 2 + 42 : 40;

      const ctr = new PIXI.Container();
      ctr.position.set(ox, 10);
      s.hpLayer.addChild(ctr);

      const nameTxt = new PIXI.Text(p.name.toUpperCase(), {
        fontFamily: "'Press Start 2P', monospace", fontSize: 7, fontWeight: '400',
        letterSpacing: 1, fill: '#e2e8f0',
      });
      nameTxt.anchor.set(flip ? 1 : 0, 0);
      if (flip) nameTxt.x = maxW;
      ctr.addChild(nameTxt);

      // HP track
      const hpBg = new PIXI.Graphics();
      hpBg.beginFill(0x1e293b);
      hpBg.drawRoundedRect(0, 16, maxW, 18, 5);
      hpBg.endFill();
      ctr.addChild(hpBg);

      const fill = new PIXI.Graphics();
      fill.y = 16;
      ctr.addChild(fill);

      // Hype track
      const hypeBg = new PIXI.Graphics();
      hypeBg.beginFill(0x1e293b);
      hypeBg.drawRoundedRect(0, 38, maxW, 9, 2);
      hypeBg.endFill();
      ctr.addChild(hypeBg);

      const hypeFill = new PIXI.Graphics();
      hypeFill.y = 38;
      ctr.addChild(hypeFill);

      // Small HP / hype labels
      const hpLabel = new PIXI.Text('HP', {
        fontFamily: "'Press Start 2P', monospace", fontSize: 7, fill: '#475569',
      });
      hpLabel.anchor.set(flip ? 0 : 1, 0.5);
      hpLabel.x = flip ? maxW + 4 : -4;
      hpLabel.y = 25;
      ctr.addChild(hpLabel);

      redrawHpFill(fill, p.hp / p.maxHp, maxW, 18, flip);
      redrawHypeFill(hypeFill, p.hype / 100, maxW, 9, flip);

      s.hpBars.push({ fill, hypeFill, maxW, flip });
    });
  }, [playerKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── HP / hype updates (every render that changes player state)
  useEffect(() => {
    const s = stageRef.current;
    if (!s) return;
    players.slice(0, 2).forEach((p, idx) => {
      const bar = s.hpBars[idx];
      if (!bar) return;
      redrawHpFill(bar.fill, p.hp / p.maxHp, bar.maxW, 18, bar.flip);
      redrawHypeFill(bar.hypeFill, p.hype / 100, bar.maxW, 9, bar.flip);
      const fighter = s.fighters[idx];
      if (fighter && p.isEliminated) {
        fighter.idleTween?.kill();
        fighter.container.alpha = 0.4;
      }
    });
  });

  // ── Phase / center overlay ────────────────────────────────────
  useEffect(() => {
    const s = stageRef.current;
    if (!s) return;
    const { centerTxt, timerTxt, subTxt } = s;

    centerTxt.visible = false;
    timerTxt.visible  = false;
    subTxt.visible    = false;

    if (roundPhase === 'announcing') {
      sound.play('round_start');
      centerTxt.text    = `ROUND ${roundNumber}`;
      centerTxt.style.fontSize = 58;
      centerTxt.visible = true;
      centerTxt.scale.set(0.2);
      gsap.to(centerTxt.scale, { x: 1, y: 1, duration: 0.4, ease: 'back.out(2.5)' });
    } else if (roundPhase === 'answering') {
      timerTxt.visible = true;
      subTxt.text = 'seconds'; subTxt.visible = true;
    } else if (roundPhase === 'attacking') {
      centerTxt.text = '⚔️ CHOOSE!';
      centerTxt.style.fontSize = 28;
      centerTxt.visible = true;
      timerTxt.visible  = true;
    } else if (roundPhase === 'intermission') {
      subTxt.style.fontSize = 13;
      // Split multi-attack messages onto separate lines at sentence boundaries
      // e.g. "Alice hit Bob for 22! Bob hit Alice for 38! Next battle starting…"
      // becomes two lines for the attack results, then the rest
      const formatted = message
        .replace(/!\s+(?=[A-Z])/g, '!\n')   // break at "! Next" or "! Alice"
        .trim();
      subTxt.text    = formatted;
      subTxt.visible = true;
    }
  }, [roundPhase, roundNumber, message]);

  // ── Timer display ─────────────────────────────────────────────
  useEffect(() => {
    const s = stageRef.current;
    if (!s) return;
    if (roundPhase !== 'answering' && roundPhase !== 'attacking') return;
    const { timerTxt } = s;
    timerTxt.text = String(timeLeft);
    timerTxt.style.fill = timeLeft <= 5 ? '#ef4444' : '#ffffff';
    if (timeLeft <= 5 && timeLeft > 0) {
      timerTxt.scale.set(1.25);
      gsap.to(timerTxt.scale, { x: 1, y: 1, duration: 0.2, ease: 'power2.out' });
    }
  }, [timeLeft, roundPhase]);

  // ── Answer status badges ──────────────────────────────────────
  useEffect(() => {
    const s = stageRef.current;
    if (!s || players.length < 2) return;

    players.slice(0, 2).forEach((p, idx) => {
      const f = s.fighters[idx];
      if (!f) return;
      const status = playerAnswerStatus[p.id];
      f.badgeGfx.clear();
      f.badgeTxt.visible = false;

      if (roundPhase === 'answering') {
        f.badgeTxt.visible = true;
        if (status === 'correct') {
          f.badgeTxt.text = '✓'; f.badgeTxt.style.fill = '#22c55e';
        } else if (status === 'wrong') {
          f.badgeTxt.text = '✗'; f.badgeTxt.style.fill = '#ef4444';
        } else {
          f.badgeTxt.text = '💭'; f.badgeTxt.style.fill = '#ffffff';
        }
      } else if (roundPhase === 'attacking' && status === 'correct') {
        f.badgeTxt.text = '⚔️'; f.badgeTxt.visible = true;
      }
    });
  }, [roundPhase, playerAnswerStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Attack animations ─────────────────────────────────────────
  useEffect(() => {
    const s = stageRef.current;
    if (!s || roundPhase !== 'resolving' || !attackResults.length) return;

    // Deduplicate: only animate each unique result set once
    const key = attackResults.map(r => `${r.attackerId}>${r.targetId}:${r.damage}`).join('|');
    if (key === animKeyRef.current) return;
    animKeyRef.current = key;

    const pIds = playersRef.current.map(p => p.id);

    // Sequential stagger: each attack waits for the previous to finish
    let startAt = 0;

    attackResults.forEach((res) => {
      const aIdx = pIds.indexOf(res.attackerId);
      const tIdx = pIds.indexOf(res.targetId);
      const af   = s.fighters[aIdx];
      const tf   = s.fighters[tIdx];
      if (!af || !tf) return;

      af.idleTween?.pause();
      tf.idleTween?.pause();

      const tl      = gsap.timeline({ delay: startAt });
      const lungeX  = af.flip ? -140 : 140;

      // next attack starts after this one fully resolves
      startAt += res.targetEliminated ? 3.4 : 1.6;

      // 1. Attacker lunges forward
      tl.to(af.container, { x: af.baseX + lungeX, duration: 0.15, ease: 'power3.in' });

      // 2. Impact frame
      tl.call(() => {
        // Attack sound
        sound.play(
          res.attack.type === 'ultimate' ? 'attack_ultimate'
            : res.attack.type === 'power' ? 'attack_power'
            : 'attack_normal',
        );

        // Screen shake
        gsap.to(s.app.stage, {
          x: 12, y: 6, yoyo: true, repeat: 9,
          duration: 0.03, ease: 'none',
          onComplete: () => { s.app.stage.x = 0; s.app.stage.y = 0; },
        });

        // White hit-flash overlay on target box
        const flash = new PIXI.Graphics();
        flash.beginFill(0xffffff);
        flash.drawRoundedRect(-58, -58, 116, 116, 20);
        flash.endFill();
        tf.container.addChildAt(flash, 1); // behind emoji
        gsap.to(flash, {
          alpha: 0, duration: 0.38,
          onComplete: () => flash.destroy(),
        });

        // Target recoil
        const rcl = af.flip ? -75 : 75;
        gsap.to(tf.container, {
          x: tf.baseX + rcl,
          duration: 0.07, ease: 'power4.out',
          yoyo: true, repeat: 1,
          onComplete: () => { tf.container.x = tf.baseX; },
        });

        // Damage number bursts in then floats away
        const dmg = new PIXI.Text(`-${res.damage}`, {
          fontFamily: "'Press Start 2P', monospace", fontSize: 36, fontWeight: '400',
          fill: res.targetEliminated ? '#fbbf24' : '#ef4444',
          stroke: '#000000', strokeThickness: 6,
          dropShadow: true, dropShadowColor: '#000000',
          dropShadowDistance: 4, dropShadowBlur: 4,
        });
        dmg.anchor.set(0.5);
        dmg.x = tf.baseX + (Math.random() * 36 - 18);
        dmg.y = tf.baseY - 90;
        dmg.scale.set(1.8);
        s.uiLayer.addChild(dmg);
        gsap.to(dmg.scale, { x: 1, y: 1, duration: 0.22, ease: 'back.out(2)' });
        gsap.to(dmg, {
          y: dmg.y - 100, alpha: 0,
          duration: 1.6, ease: 'power2.out',
          onComplete: () => dmg.destroy(),
        });

        // Attack emoji burst at impact point
        const atkEmoji = new PIXI.Text(res.attack.emoji, { fontSize: 48 });
        atkEmoji.anchor.set(0.5);
        atkEmoji.x = tf.baseX + (af.flip ? 60 : -60);
        atkEmoji.y = tf.baseY - 10;
        atkEmoji.scale.set(0.4);
        s.uiLayer.addChild(atkEmoji);
        gsap.to(atkEmoji.scale, { x: 1.4, y: 1.4, duration: 0.25, ease: 'back.out(3)' });
        gsap.to(atkEmoji, {
          y: atkEmoji.y - 60, alpha: 0,
          duration: 0.8, delay: 0.1, ease: 'power1.out',
          onComplete: () => atkEmoji.destroy(),
        });

        // KO sequence
        if (res.targetEliminated) {
          setTimeout(() => sound.play('ko'), 380);
          gsap.to(tf.container, {
            rotation: af.flip ? 0.4 : -0.4,
            alpha: 0.35,
            duration: 0.45, delay: 0.12,
          });

          const koTxt = new PIXI.Text('K.O.!', {
            fontFamily: "'Press Start 2P', monospace", fontSize: 64, fontWeight: '400',
            fill: '#fbbf24', stroke: '#ef4444', strokeThickness: 8,
            letterSpacing: 4,
            dropShadow: true, dropShadowColor: '#000000',
            dropShadowDistance: 5, dropShadowBlur: 8,
          });
          koTxt.anchor.set(0.5);
          koTxt.position.set(W / 2, HP_H + (FLOOR_Y - HP_H) * 0.44);
          koTxt.alpha = 0;
          koTxt.scale.set(0.15);
          s.uiLayer.addChild(koTxt);
          gsap.to(koTxt, { alpha: 1, duration: 0.12, delay: 0.35 });
          gsap.to(koTxt.scale, { x: 1.1, y: 1.1, duration: 0.38, delay: 0.35, ease: 'back.out(2)' });
          gsap.to(koTxt, {
            alpha: 0, duration: 0.5, delay: 2.5,
            onComplete: () => koTxt.destroy(),
          });
        }
      });

      // 3. Attacker returns to base
      tl.to(af.container, { x: af.baseX, duration: 0.3, ease: 'power2.out' }, '+=0.06');

      // 4. Resume idle bobs
      tl.call(() => {
        const cur = playersRef.current;
        if (!cur[aIdx]?.isEliminated) af.idleTween?.resume();
        if (!cur[tIdx]?.isEliminated) tf.idleTween?.resume();
      });
    });
  }, [attackResults, roundPhase]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={wrapRef}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    />
  );
}
