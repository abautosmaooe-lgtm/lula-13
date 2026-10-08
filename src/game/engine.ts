/**
 * 2D Retro Platformer Engine for Lulalá - Caminho da Estrela
 * Features:
 * - Super Mario World style Cape Flight / Gliding
 * - Discurso Emocional charisma projectiles (Hearts, Books, Gears)
 * - Popularity & Alliances collection
 * - Historical enemy pacification
 * - Smooth camera scroll, particles, and responsive physics
 */

import { chiptune } from '../audio/chiptune';
import { InputState } from '../input/inputManager';
import { BlockDef, CeilingSpikeDef, CollectibleDef, EnemyDef, ForestFireDef, LevelData, LEVELS, TILE_SIZE } from './levels';
import { FloatingText, Particle, SpriteRenderer } from './sprites';

export type PlayerMod = 'none' | 'heroi_voo' | 'marombeiro' | 'lancador_agua';

export interface GameState {
  score: number;
  coins: number;          // Apoio Popular
  carteiras: number;      // Carteiras de Trabalho
  estrelas: number;       // Estrelas Vermelhas
  diplomas: number;       // Diplomas Universitários
  presal: number;         // Barris do Pré-Sal
  povoFelizCount: number; // O Povo Feliz de Novo!
  lives: number;
  timeLeft: number;
  levelIndex: number;
  flightFuel: number;     // Cape flight meter (0 to 100)
  isFlying: boolean;
  activeMod: PlayerMod;
  powerTimer: number;     // 10-second temporary power countdown
  extinguishedFiresCount: number;
  showModSelector: boolean;
  isGameOver: boolean;
  isVictory: boolean;
  isPaused: boolean;
  showingFactSheet: boolean;
  currentFactSheet: LevelData['factSheet'] | null;
}

export class PlatformerEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  public virtualWidth: number = 640;
  public virtualHeight: number = 448;
  public cameraX: number = 0;

  public currentLevel: LevelData;
  public blocks: (BlockDef & { bumpOffset: number; bumpSpeed: number })[] = [];
  public enemies: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
    type: 'censor' | 'especulador' | 'orange' | 'minion' | 'ghost' | 'boi';
    isDead: boolean;
    deadTimer: number;
  }[] = [];
  public fires: (ForestFireDef & { isExtinguished: boolean })[] = [];
  public ceilingSpikes: CeilingSpikeDef[] = [];
  public collectibles: {
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'carteira' | 'estrela' | 'povo_feliz' | 'picanha' | 'diploma' | 'presal' | 'coin';
    collected: boolean;
  }[] = [];
  public activePowerups: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    type: 'estrela' | 'povo_feliz' | 'picanha';
  }[] = [];

  // Projectiles (Discurso Emocional, Jato d'água, Soco Pesado)
  public projectiles: {
    x: number;
    y: number;
    vx: number;
    type: 'heart' | 'gear' | 'book' | 'water' | 'muscle_fist';
    life: number;
  }[] = [];

  // Player State
  public player = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    width: 28,
    height: 40,
    isGrounded: false,
    facingRight: true,
    isSuper: false,
    isFlying: false,
    flightTimer: 0,
    flightFuel: 100,
    activeMod: 'none' as PlayerMod,
    powerTimer: 0,
    isStarRolling: false,
    starRollTimer: 0,
    isInvincible: false,
    invincibleTimer: 0,
    isDead: false,
    deadTimer: 0,
    crouching: false,
    reachedGoal: false,
    goalSlideY: 0,
    flagY: 0,
    victoryWalkTimer: 0,
    shootCooldown: 0,
    screenShake: 0,
  };

  public particles: Particle[] = [];
  public floatTexts: FloatingText[] = [];

  public state: GameState;
  private animTime: number = 0;
  private runFrameCount: number = 0;
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;

  public onStateChange?: (state: GameState) => void;

  constructor(canvas: HTMLCanvasElement, levelIndex: number = 0) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.currentLevel = LEVELS[levelIndex] || LEVELS[0];

    this.state = {
      score: 0,
      coins: 0,
      carteiras: 0,
      estrelas: 0,
      diplomas: 0,
      presal: 0,
      povoFelizCount: 0,
      lives: 3,
      timeLeft: this.currentLevel.timeLimit,
      levelIndex,
      flightFuel: 100,
      isFlying: false,
      activeMod: 'none',
      powerTimer: 0,
      extinguishedFiresCount: 0,
      showModSelector: false,
      isGameOver: false,
      isVictory: false,
      isPaused: false,
      showingFactSheet: false,
      currentFactSheet: null,
    };

    this.loadLevel(this.currentLevel);
  }

  public loadLevel(level: LevelData) {
    this.currentLevel = level;
    this.blocks = level.blocks.map(b => ({
      ...b,
      bumpOffset: 0,
      bumpSpeed: 0,
    }));

    this.enemies = level.enemies.map(e => ({
      x: e.x,
      y: e.y,
      vx: e.type === 'boi' ? -1.4 : -1.2,
      vy: 0,
      width: e.type === 'boi' ? 32 : 28,
      height: 28,
      type: e.type,
      isDead: false,
      deadTimer: 0,
    }));

    // Populate all forest fires & obstacle flames
    this.fires = (level.fires || []).map(f => ({
      ...f,
      isExtinguished: false,
    }));

    // Populate overhead ceiling spikes
    this.ceilingSpikes = level.ceilingSpikes || [];

    this.collectibles = level.collectibles.map(c => ({
      x: c.x,
      y: c.y,
      width: 24,
      height: 24,
      type: c.type,
      collected: false,
    }));

    this.activePowerups = [];
    this.projectiles = [];
    this.particles = [];
    this.floatTexts = [];

    // Reset player
    this.player.x = level.spawnX;
    this.player.y = level.spawnY;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.isGrounded = false;
    this.player.facingRight = true;
    this.player.isDead = false;
    this.player.deadTimer = 0;
    this.player.reachedGoal = false;
    this.player.goalSlideY = level.goalY;
    this.player.flagY = level.goalY;
    this.player.victoryWalkTimer = 0;
    this.player.isFlying = false;
    this.player.flightFuel = 100;
    this.player.powerTimer = 0;
    this.player.activeMod = 'none';
    this.player.isStarRolling = false;
    this.player.starRollTimer = 0;

    this.cameraX = 0;
    this.state.timeLeft = level.timeLimit;
    this.state.flightFuel = 100;
    this.state.isFlying = false;
    this.state.activeMod = 'none';
    this.state.powerTimer = 0;
    this.state.showingFactSheet = false;
    this.state.currentFactSheet = null;

    if (this.onStateChange) this.onStateChange({ ...this.state });

    // Start music for level
    chiptune.startMusic(level.musicTrack);
  }

  public restartCurrentLevel() {
    this.loadLevel(this.currentLevel);
  }

  public selectLevel(levelIndex: number) {
    const clamped = Math.max(0, Math.min(LEVELS.length - 1, levelIndex));
    this.state.levelIndex = clamped;
    this.loadLevel(LEVELS[clamped]);
  }

  public nextLevel() {
    chiptune.speakVoice('Bora lá, companheiro!');
    const nextIdx = (this.state.levelIndex + 1) % LEVELS.length;
    this.state.levelIndex = nextIdx;
    this.loadLevel(LEVELS[nextIdx]);
  }

  public togglePause() {
    this.state.isPaused = !this.state.isPaused;
    if (this.onStateChange) this.onStateChange({ ...this.state });
  }

  public setPlayerMod(mod: PlayerMod) {
    // Enquanto o personagem está no modo normal, nada acontece se mudar o mod nem apertar 1, 2 ou 3
    if (this.player.activeMod === 'none' && !this.player.isSuper) {
      chiptune.playBump();
      this.addFloatingText(this.player.x, this.player.y - 20, 'MODO NORMAL: COLETE UM PODER!', '#f87171');
      return;
    }

    this.player.activeMod = mod;
    this.state.activeMod = mod;
    this.player.isFlying = false;
    this.state.isFlying = false;
    this.player.vy = 0;

    // Safety: If player was stuck high above or off-screen, bring down to visible playfield
    if (this.player.y < 48) {
      this.player.y = 72;
    }

    if (mod === 'heroi_voo') {
      this.player.powerTimer = 10.0;
      this.state.powerTimer = 10.0;
      this.player.flightFuel = 100;
      this.player.isSuper = true;
      chiptune.playStarJingle();
      this.addFloatingText(this.player.x, this.player.y - 20, '★ LULA HERÓI DO VOO! (10s)', '#ffffff');
      this.addSparkles(this.player.x + 14, this.player.y + 14, '#ffffff');
    } else if (mod === 'marombeiro') {
      this.player.powerTimer = 10.0;
      this.state.powerTimer = 10.0;
      this.player.isSuper = false;
      chiptune.playMusclePunch();
      this.addFloatingText(this.player.x, this.player.y - 20, '💪 MOD MAROMBEIRO! (10s)', '#f59e0b');
      this.addSparkles(this.player.x + 14, this.player.y + 14, '#f59e0b');
    } else if (mod === 'lancador_agua') {
      this.player.powerTimer = 10.0;
      this.state.powerTimer = 10.0;
      this.player.isSuper = false;
      chiptune.playWaterStream();
      this.addFloatingText(this.player.x, this.player.y - 20, '💧 LANÇADOR DE ÁGUA! (10s)', '#38bdf8');
      this.addSparkles(this.player.x + 14, this.player.y + 14, '#38bdf8');
    } else {
      this.player.powerTimer = 0;
      this.state.powerTimer = 0;
      this.player.isSuper = false;
    }
    this.state.showModSelector = false;
    this.state.isPaused = false;
    if (this.onStateChange) this.onStateChange({ ...this.state });
  }

  public openModSelector() {
    // Enquanto o personagem está no modo normal, nada acontece
    if (this.player.activeMod === 'none' && !this.player.isSuper) {
      chiptune.playBump();
      this.addFloatingText(this.player.x, this.player.y - 20, 'MODO NORMAL: COLETE UM PODER!', '#f87171');
      return;
    }

    this.state.showModSelector = true;
    this.state.isPaused = true;
    if (this.onStateChange) this.onStateChange({ ...this.state });
  }

  public closeModSelector() {
    this.state.showModSelector = false;
    this.state.isPaused = false;
    if (this.onStateChange) this.onStateChange({ ...this.state });
  }

  public closeFactSheet() {
    this.state.showingFactSheet = false;
    chiptune.speakVoice('Bora lá, companheiro!');
    if (this.state.levelIndex < LEVELS.length - 1) {
      this.nextLevel();
    } else {
      this.state.isVictory = true;
    }
    if (this.onStateChange) this.onStateChange({ ...this.state });
  }

  // ==========================================
  // UPDATE LOOP (60 FPS)
  // ==========================================
  public update(input: InputState, dt: number) {
    if (this.state.isPaused || this.state.showingFactSheet || this.state.isGameOver || this.state.isVictory) {
      return;
    }

    this.animTime += dt;

    // Time countdown
    this.state.timeLeft -= dt;
    if (this.state.timeLeft <= 0 && !this.player.isDead) {
      this.killPlayer();
      return;
    }

    // Invincibility countdown
    if (this.player.isInvincible) {
      this.player.invincibleTimer -= dt;
      if (this.player.invincibleTimer <= 0) {
        this.player.isInvincible = false;
      }
    }

    // 10-Second Temporary Power Countdown (Powers last only 10s and player returns to normal)
    if (this.player.activeMod !== 'none') {
      this.player.powerTimer -= dt;
      this.state.powerTimer = Math.max(0, this.player.powerTimer);

      if (this.player.powerTimer <= 0) {
        this.player.activeMod = 'none';
        this.player.isSuper = false;
        this.player.isFlying = false;
        this.player.powerTimer = 0;
        this.state.activeMod = 'none';
        this.state.powerTimer = 0;
        chiptune.playPowerDown();
        this.addFloatingText(this.player.x - 20, this.player.y - 20, '⏱ PODER ESGOTADO! NORMAL', '#f87171');

        // Smoke particles when returning to normal
        for (let i = 0; i < 12; i++) {
          this.particles.push({
            x: this.player.x + this.player.width / 2 + (Math.random() - 0.5) * 16,
            y: this.player.y + this.player.height / 2 + (Math.random() - 0.5) * 16,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 2.5 - 0.5,
            color: '#cbd5e1',
            size: 4 + Math.random() * 2,
            life: 0,
            maxLife: 0.45,
          });
        }
        if (this.onStateChange) this.onStateChange({ ...this.state });
      }
    }

    // Goal animation
    if (this.player.reachedGoal) {
      this.updateGoalSequence(dt);
      this.updateBlocks(dt);
      this.updateParticles(dt);
      return;
    }

    // Dead animation
    if (this.player.isDead) {
      this.player.deadTimer += dt;
      this.player.vy += 0.5;
      this.player.y += this.player.vy;
      if (this.player.deadTimer > 2.5) {
        if (this.state.lives > 0) {
          this.loadLevel(this.currentLevel);
        } else {
          this.state.isGameOver = true;
          chiptune.playHurt();
          if (this.onStateChange) this.onStateChange({ ...this.state });
        }
      }
      this.updateParticles(dt);
      return;
    }

    // Cooldown
    if (this.player.shootCooldown > 0) {
      this.player.shootCooldown -= dt;
    }

    // --- PLAYER MOVEMENT, CAPE FLIGHT & CONTROLS ---
    this.updatePlayerMovement(input, dt);

    // --- DISCURSO EMOCIONAL PROJECTILES ---
    this.updateProjectiles(dt);

    // --- BLOCKS ---
    this.updateBlocks(dt);

    // --- ENEMIES ---
    this.updateEnemies(dt);

    // --- POWERUPS ---
    this.updatePowerups(dt);

    // --- COLLECTIBLES ---
    this.updateCollectibles();

    // --- PARTICLES ---
    this.updateParticles(dt);

    // --- CAMERA SCROLL ---
    const targetCamX = this.player.x - this.virtualWidth * 0.38;
    this.cameraX += (targetCamX - this.cameraX) * 0.15;
    if (this.cameraX < 0) this.cameraX = 0;
    const maxCamX = this.currentLevel.worldWidth - this.virtualWidth;
    if (this.cameraX > maxCamX) this.cameraX = maxCamX;

    // Pit fall check
    if (this.player.y > this.virtualHeight + 50) {
      this.killPlayer();
    }

    // Sync State
    this.state.isFlying = this.player.isFlying;
    this.state.flightFuel = Math.round(this.player.flightFuel);
  }

  private updatePlayerMovement(input: InputState, dt: number) {
    const accel = 0.58;
    const friction = 0.82;
    const maxWalkSpeed = 3.8;
    const maxRunSpeed = 6.2;
    const maxSpeed = input.run ? maxRunSpeed : maxWalkSpeed;

    // Horizontal acceleration
    if (input.left) {
      this.player.vx -= accel;
      this.player.facingRight = false;
      this.runFrameCount += dt * (input.run ? 14 : 9);
    } else if (input.right) {
      this.player.vx += accel;
      this.player.facingRight = true;
      this.runFrameCount += dt * (input.run ? 14 : 9);
    } else {
      this.player.vx *= friction;
      if (Math.abs(this.player.vx) < 0.1) this.player.vx = 0;
    }

    if (this.player.vx > maxSpeed) this.player.vx = maxSpeed;
    if (this.player.vx < -maxSpeed) this.player.vx = -maxSpeed;

    // Crouching
    this.player.crouching = input.down && this.player.isGrounded;

    // Refuel flight stamina on ground
    if (this.player.isGrounded) {
      this.coyoteTimer = 0.12;
      this.player.isFlying = false;
      if (this.player.flightFuel < 100) {
        this.player.flightFuel = Math.min(100, this.player.flightFuel + dt * 60);
      }
    } else {
      this.coyoteTimer -= dt;
    }

    if (input.justPressedJump) {
      this.jumpBufferTimer = 0.12;
    } else {
      this.jumpBufferTimer -= dt;
    }

    // SONIC STAR ROLL (DOWN + JUMP):
    // O jogador se transforma em uma estrela giratória em movimento com efeito Sonic e atropela tudo!
    const wantsStarRoll = input.down && (input.justPressedJump || (input.jump && this.player.crouching && !this.player.isStarRolling));

    if (wantsStarRoll) {
      this.player.isStarRolling = true;
      this.player.starRollTimer = 2.2; // 2.2 seconds of invincible supersonic star rolling
      const rollDir = input.left ? -1 : input.right ? 1 : (this.player.facingRight ? 1 : -1);
      this.player.facingRight = rollDir > 0;
      this.player.vx = rollDir * 11.2;
      this.player.screenShake = 6;
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
      chiptune.playSpinDash();
      this.addFloatingText(this.player.x - 10, this.player.y - 18, '★ GIRO ESTRELAR SONIC!', '#facc15');

      // Sonic golden star sparks & dust burst
      for (let i = 0; i < 16; i++) {
        this.particles.push({
          x: this.player.x + this.player.width / 2,
          y: this.player.y + this.player.height,
          vx: -rollDir * (2 + Math.random() * 5),
          vy: -Math.random() * 3.5 - 0.5,
          color: Math.random() < 0.6 ? '#facc15' : '#ef4444',
          size: 3 + Math.random() * 3,
          life: 0,
          maxLife: 0.4,
        });
      }
    }

    // While in Sonic Star Roll:
    if (this.player.isStarRolling) {
      this.player.starRollTimer -= dt;
      this.player.crouching = true;

      // Active Sonic steering: player can steer left or right at supersonic speed!
      if (input.left) {
        this.player.facingRight = false;
        this.player.vx = -11.0;
      } else if (input.right) {
        this.player.facingRight = true;
        this.player.vx = 11.0;
      } else {
        const dir = this.player.facingRight ? 1 : -1;
        if (Math.abs(this.player.vx) < 8.5) {
          this.player.vx = dir * 9.5;
        }
      }

      // Can perform spinning aerial jump while retaining invincible star roll state!
      if (input.justPressedJump && !input.down && this.player.isGrounded) {
        this.player.vy = -11.2;
        this.player.isGrounded = false;
        chiptune.playJump();
        this.addFloatingText(this.player.x, this.player.y - 16, '★ SALTO ESTRELAR!', '#fde047');
      }

      // Roll timer expires
      if (this.player.starRollTimer <= 0) {
        this.player.isStarRolling = false;
      }

      // Emit rolling speed sparks and dust trail
      if (Math.random() < 0.7) {
        const dir = this.player.facingRight ? 1 : -1;
        this.particles.push({
          x: this.player.x + (this.player.facingRight ? -4 : 28),
          y: this.player.y + this.player.height - 4,
          vx: -dir * (2 + Math.random() * 3),
          vy: -Math.random() * 2.5,
          color: Math.random() < 0.5 ? '#facc15' : '#ef4444',
          size: 3 + Math.random() * 2,
          life: 0,
          maxLife: 0.3,
        });
      }
    }

    // Execute standard Jump
    if (!this.player.isStarRolling && this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      const jumpImpulse = -11.4 - (Math.abs(this.player.vx) > 4.5 ? 1.4 : 0);
      this.player.vy = jumpImpulse;
      this.player.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      chiptune.playJump();
    }

    // SUPER HERO FLIGHT / GLIDING:
    const isHeroFlightMod = this.player.activeMod === 'heroi_voo';
    const wantsToAscend = (input.jump || input.up) && !this.player.isGrounded;

    if (isHeroFlightMod && !this.player.isGrounded) {
      // Mod Herói do Voo has full directional aerodynamic flight control
      if (wantsToAscend && this.player.flightFuel > 0) {
        this.player.isFlying = true;
        this.player.flightFuel = Math.max(0, this.player.flightFuel - dt * 20);

        // Smooth controlled upward thrust - never launches out of control
        this.player.vy = Math.max(-4.8, this.player.vy - 0.75);

        // LUZES BRANCAS RADIANTES AO VOAR: AO INVÉS DA COR VERMELHA, LUZES BRANCAS PURAS!
        if (Math.random() < 0.28) {
          chiptune.playFly();
          this.addSparkles(this.player.x + (this.player.facingRight ? -4 : 32), this.player.y + 16, '#ffffff');
          this.addSparkles(this.player.x + 14, this.player.y + 10, '#f8fafc');
          this.addSparkles(this.player.x + (this.player.facingRight ? -8 : 36), this.player.y + 22, '#e0f2fe');
        }
      } else if (input.down) {
        // Controlled downward descent towards platforms
        this.player.isFlying = true;
        this.player.vy = Math.min(5.5, this.player.vy + 0.8);
      } else {
        // Neutral gliding: gently glides down with gravity so player can land easily
        this.player.isFlying = false;
        this.player.vy = Math.min(3.8, this.player.vy + 0.42);
      }

      // Horizontal aerial steering controlled purely by user input
      if (input.left) {
        this.player.vx = Math.max(-5.0, this.player.vx - 0.55);
        this.player.facingRight = false;
      } else if (input.right) {
        this.player.vx = Math.min(5.0, this.player.vx + 0.55);
        this.player.facingRight = true;
      } else {
        this.player.vx *= 0.90; // Natural air damping when no directional key is pressed
      }
    } else if (this.player.isSuper && !this.player.isGrounded && input.jump && Math.abs(this.player.vx) > 3.0) {
      // Super Cape Gliding when holding Jump with forward speed
      this.player.isFlying = true;
      if (this.player.vy > 1.2) this.player.vy = 1.2;
    } else {
      this.player.isFlying = false;
    }

    // Variable jump height cut when releasing jump button
    if (!input.jump && !this.player.isFlying && this.player.vy < -3.2) {
      this.player.vy *= 0.65;
    }

    // Mod Marombeiro Ground Slam down in mid-air
    if (this.player.activeMod === 'marombeiro' && !this.player.isGrounded && input.down) {
      this.player.vy = Math.max(this.player.vy, 14);
    }

    // Standard Gravity when not hero flying or cape gliding
    if (!this.player.isFlying && !isHeroFlightMod) {
      this.player.vy += 0.58;
      if (this.player.vy > 12) this.player.vy = 12;
    }

    // ACTION BUTTON: Shoot charisma / water / muscle punch with [X] / Run button
    if (input.justPressedRun && this.player.shootCooldown <= 0) {
      this.shootDiscurso();
      this.player.shootCooldown = 0.28;
    }

    // Horizontal Movement & Collisions
    this.player.x += this.player.vx;
    if (this.player.x < 0) {
      this.player.x = 0;
      if (this.player.vx < 0) this.player.vx = 0;
    }
    const maxWorldX = this.currentLevel.worldWidth - this.player.width;
    if (this.player.x > maxWorldX) {
      this.player.x = maxWorldX;
      if (this.player.vx > 0) this.player.vx = 0;
    }
    this.resolveHorizontalPlayerCollision();

    // Vertical Movement & Collisions
    const wasInAir = !this.player.isGrounded;
    const oldVy = this.player.vy;
    this.player.y += this.player.vy;

    // CEILING BOUNDARY CLAMP: Player can NEVER fly above the visible screen ceiling!
    if (this.player.y < 24) {
      this.player.y = 24;
      if (this.player.vy < 0) this.player.vy = 0;
    }

    this.resolveVerticalPlayerCollision();

    // Mod Marombeiro Heavy Landing Shockwave!
    if (wasInAir && this.player.isGrounded && this.player.activeMod === 'marombeiro' && oldVy > 8.5) {
      this.triggerEarthquakeStomp();
    }

    // Collision with Forest Fires
    for (const f of this.fires) {
      if (!f.isExtinguished) {
        if (
          this.player.x + this.player.width > f.x &&
          this.player.x < f.x + f.width &&
          this.player.y + this.player.height > f.y &&
          this.player.y < f.y + f.height
        ) {
          if (this.player.isStarRolling) {
            // Sonic Star Roll plows straight through fire and extinguishes it!
            f.isExtinguished = true;
            chiptune.playExtinguishFire();
            this.state.score += 80;
            this.state.extinguishedFiresCount++;
            this.addFloatingText(f.x + f.width / 2, f.y - 14, '★ FOGO APAGADO!', '#22c55e');
            this.addSparkles(f.x + f.width / 2, f.y + f.height / 2, '#facc15');
            if (this.onStateChange) this.onStateChange({ ...this.state });
          } else if (this.player.activeMod === 'marombeiro' || this.player.isInvincible) {
            // Marombeiro charges through fire unharmed!
            this.addSparkles(f.x + f.width / 2, f.y + f.height / 2, '#facc15');
          } else {
            this.hurtPlayer();
          }
        }
      }
    }

    // Collision with Overhead Ceiling Spikes (Espinhos ao Alto)
    for (const spike of this.ceilingSpikes) {
      if (
        this.player.x + 4 < spike.x + spike.width &&
        this.player.x + this.player.width - 4 > spike.x &&
        this.player.y < spike.y + spike.height &&
        this.player.y + this.player.height > spike.y
      ) {
        if (this.player.isStarRolling) {
          // Ricochet down unharmed during Star Roll!
          chiptune.playSpikeHit();
          this.player.vy = 4.5;
          this.player.screenShake = 6;
          this.addFloatingText(spike.x + spike.width / 2 - 20, spike.y + spike.height + 12, '★ REBOTE ESTRELAR!', '#facc15');
          continue;
        }

        if (!this.player.isInvincible && !this.player.isDead) {
          chiptune.playSpikeHit();
          this.player.vy = 5.5; // Deflect player downwards away from ceiling spikes
          this.player.screenShake = 8;
          this.addFloatingText(spike.x + spike.width / 2 - 25, spike.y + spike.height + 14, '⚡ ESPINHOS AO ALTO!', '#ef4444');

          // Metallic spark particles
          for (let i = 0; i < 8; i++) {
            this.particles.push({
              x: this.player.x + this.player.width / 2,
              y: spike.y + spike.height,
              vx: (Math.random() - 0.5) * 6,
              vy: Math.random() * 3 + 1,
              color: '#facc15',
              size: 3,
              life: 0,
              maxLife: 0.35,
            });
          }
          this.hurtPlayer();
        }
      }
    }

    // Screen shake dampening
    if (this.player.screenShake > 0) {
      this.player.screenShake -= dt * 25;
      if (this.player.screenShake < 0) this.player.screenShake = 0;
    }

    // Goal Pole Reach Check
    const goalDistance = Math.abs(this.player.x - this.currentLevel.goalX);
    if (goalDistance < 32 && this.player.y >= this.currentLevel.goalY && !this.player.reachedGoal) {
      this.triggerGoalReached();
    }
  }

  private triggerEarthquakeStomp() {
    this.player.screenShake = 10;
    chiptune.playMusclePunch();
    this.addFloatingText(this.player.x, this.player.y - 18, '💥 IMPACTO MAROMBA!', '#f59e0b');

    // Spawn shockwave dust particles
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: this.player.x + this.player.width / 2,
        y: this.player.y + this.player.height,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 3 - 1,
        color: '#f59e0b',
        size: 3,
        life: 0.4,
        maxLife: 0.4,
      });
    }

    // Defeat nearby enemies
    for (const enemy of this.enemies) {
      if (!enemy.isDead && Math.abs(enemy.x - this.player.x) < 140 && Math.abs(enemy.y - this.player.y) < 50) {
        enemy.isDead = true;
        enemy.deadTimer = 0.5;
        this.state.score += 200;
        this.addFloatingText(enemy.x, enemy.y - 10, enemy.type === 'boi' ? '+200 BOI PACIFICADO!' : '+200 FORÇA!', '#f59e0b');
      }
    }
  }

  private shootDiscurso() {
    const dir = this.player.facingRight ? 1 : -1;

    // Mod Lançador de Água
    if (this.player.activeMod === 'lancador_agua') {
      chiptune.playWaterStream();
      this.projectiles.push({
        x: this.player.x + (this.player.facingRight ? this.player.width + 6 : -16),
        y: this.player.y + 14,
        vx: dir * 9.5,
        type: 'water',
        life: 0,
      });
      this.addFloatingText(this.player.x, this.player.y - 12, 'JATO D\'ÁGUA!', '#0284c7');
      return;
    }

    // Mod Marombeiro (Soco Pesado)
    if (this.player.activeMod === 'marombeiro') {
      chiptune.playMusclePunch();
      this.projectiles.push({
        x: this.player.x + (this.player.facingRight ? this.player.width + 8 : -20),
        y: this.player.y + 12,
        vx: dir * 8.5,
        type: 'muscle_fist',
        life: 0,
      });
      this.addFloatingText(this.player.x, this.player.y - 12, 'SOCO PESADO!', '#f59e0b');
      return;
    }

    chiptune.playSpeech();
    const projectileTypes: ('heart' | 'gear' | 'book')[] = ['heart', 'gear', 'book'];
    const chosenType = projectileTypes[Math.floor(Math.random() * projectileTypes.length)];

    this.projectiles.push({
      x: this.player.x + (this.player.facingRight ? this.player.width + 4 : -12),
      y: this.player.y + 16,
      vx: dir * 7.5,
      type: chosenType,
      life: 0,
    });

    this.addFloatingText(this.player.x, this.player.y - 12, 'DISCURSO!', '#ef4444');
  }

  private updateProjectiles(dt: number) {
    for (const p of this.projectiles) {
      p.life += dt;
      p.x += p.vx;

      // Mod Lançador de Água: Extinguish Forest Fires!
      if (p.type === 'water') {
        for (const f of this.fires) {
          if (
            !f.isExtinguished &&
            p.x > f.x - 12 &&
            p.x < f.x + f.width + 12 &&
            p.y > f.y - 12 &&
            p.y < f.y + f.height + 12
          ) {
            f.isExtinguished = true;
            p.life = 99; // destroy water droplet
            chiptune.playExtinguishFire();
            this.state.score += 300;
            this.state.extinguishedFiresCount++;
            this.addFloatingText(f.x + f.width / 2, f.y - 16, '+300 FLORESTA SALVA!', '#22c55e');

            // Steam quench and blossoming sprout particles
            for (let s = 0; s < 12; s++) {
              this.particles.push({
                x: f.x + f.width / 2,
                y: f.y + 10,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 3 - 1.5,
                color: '#f8fafc',
                size: 3 + Math.random() * 3,
                life: 0,
                maxLife: 0.6,
              });
            }
            if (this.onStateChange) this.onStateChange({ ...this.state });
            break;
          }
        }
      }

      // Mod Marombeiro Muscle Fist: Shatter bricks
      if (p.type === 'muscle_fist') {
        for (const b of this.blocks) {
          const bx = b.x * TILE_SIZE;
          const by = b.y * TILE_SIZE;
          if (
            b.type === 'brick' &&
            p.x > bx &&
            p.x < bx + TILE_SIZE &&
            p.y > by &&
            p.y < by + TILE_SIZE
          ) {
            chiptune.playMusclePunch();
            this.addBrickDebris(bx, by);
            this.blocks = this.blocks.filter(x => x !== b);
            this.state.score += 50;
            p.life = 99;
            break;
          }
        }
      }

      // Check hit against enemies -> converts enemy into supporters!
      for (const e of this.enemies) {
        if (e.isDead) continue;
        if (
          p.x > e.x &&
          p.x < e.x + e.width &&
          p.y > e.y &&
          p.y < e.y + e.height
        ) {
          e.isDead = true;
          if (p.type === 'muscle_fist') {
            chiptune.playMusclePunch();
            this.addFloatingText(e.x, e.y - 14, e.type === 'boi' ? '+300 BOI ACALMADO!' : '+300 NOCAUTEADO!', '#f59e0b');
          } else if (p.type === 'water') {
            chiptune.playWaterStream();
            this.addFloatingText(e.x, e.y - 14, e.type === 'boi' ? '+300 BOI REFRESCADO!' : '+300 BANHO REFRESCANTE!', '#38bdf8');
          } else {
            chiptune.playPowerup();
            this.addFloatingText(e.x, e.y - 14, e.type === 'boi' ? '+300 BOI CONVERTIDO!' : '+300 APOIO POPULAR!', '#facc15');
          }
          this.state.score += 300;
          this.state.coins++;
          this.addSparkles(e.x + 14, e.y + 14, '#facc15');
          p.life = 99; // destroy projectile
          if (this.onStateChange) this.onStateChange({ ...this.state });
          break;
        }
      }
    }
    this.projectiles = this.projectiles.filter(p => p.life < 1.2);
  }

  private resolveHorizontalPlayerCollision() {
    const pw = this.player.width;
    const ph = this.player.height;

    for (const b of this.blocks) {
      const bx = b.x * TILE_SIZE;
      const by = b.y * TILE_SIZE;
      const bw = TILE_SIZE;
      const bh = TILE_SIZE;

      if (
        this.player.x < bx + bw &&
        this.player.x + pw > bx &&
        this.player.y < by + bh &&
        this.player.y + ph > by
      ) {
        // Sonic Star Roll: Shatters destructible bricks and keeps blazing forward!
        if (this.player.isStarRolling && b.type === 'brick') {
          chiptune.playBump();
          this.addBrickDebris(bx, by);
          this.blocks = this.blocks.filter(x => x !== b);
          this.state.score += 25;
          this.player.screenShake = 4;
          continue;
        }

        if (this.player.vx > 0) {
          this.player.x = bx - pw;
          this.player.vx = 0;
          if (this.player.isStarRolling) this.player.isStarRolling = false;
        } else if (this.player.vx < 0) {
          this.player.x = bx + bw;
          this.player.vx = 0;
          if (this.player.isStarRolling) this.player.isStarRolling = false;
        }
      }
    }
  }

  private resolveVerticalPlayerCollision() {
    const pw = this.player.width;
    const ph = this.player.height;
    let groundedThisFrame = false;

    for (const b of this.blocks) {
      const bx = b.x * TILE_SIZE;
      const by = b.y * TILE_SIZE;
      const bw = TILE_SIZE;
      const bh = TILE_SIZE;

      if (
        this.player.x + 4 < bx + bw &&
        this.player.x + pw - 4 > bx &&
        this.player.y < by + bh &&
        this.player.y + ph > by
      ) {
        if (this.player.vy > 0) {
          this.player.y = by - ph;
          this.player.vy = 0;
          this.player.isGrounded = true;
          groundedThisFrame = true;
        } else if (this.player.vy < 0) {
          this.player.y = by + bh;
          this.player.vy = 0;
          this.handleBlockBump(b);
        }
      }
    }

    if (!groundedThisFrame) {
      this.player.isGrounded = false;
    }
  }

  private handleBlockBump(block: BlockDef & { bumpOffset: number; bumpSpeed: number }) {
    block.bumpOffset = 10;
    block.bumpSpeed = -8;

    if (block.type === 'question') {
      block.type = 'used';
      chiptune.playBump();

      const item = block.itemInside || 'coin';
      const bx = block.x * TILE_SIZE;
      const by = block.y * TILE_SIZE;

      if (item === 'coin') {
        chiptune.playCoin();
        this.state.coins++;
        this.state.score += 30;
        this.addFloatingText(bx, by - 16, '+30 APOIO', '#facc15');
        this.addSparkles(bx + 16, by - 10, '#facc15');
      } else if (item === 'carteira') {
        chiptune.playCard();
        this.state.carteiras++;
        this.state.score += 100;
        this.addFloatingText(bx, by - 16, '+100 CTPS TRABALHO', '#1d4ed8');
        this.addSparkles(bx + 16, by - 10, '#3b82f6');
      } else if (item === 'estrela') {
        chiptune.playStarJingle();
        this.activePowerups.push({
          x: bx + 4,
          y: by - 28,
          vx: 1.8,
          vy: -3.0,
          size: 24,
          type: 'estrela',
        });
        this.addFloatingText(bx, by - 16, '★ ESTRELA!', '#ffffff');
        this.addSparkles(bx + 16, by - 10, '#ffffff');
      } else if (item === 'povo_feliz') {
        chiptune.playPowerup();
        this.activePowerups.push({
          x: bx + 4,
          y: by - 28,
          vx: 1.5,
          vy: -2.8,
          size: 24,
          type: 'povo_feliz',
        });
        this.addFloatingText(bx, by - 16, '★ POVO FELIZ!', '#10b981');
        this.addSparkles(bx + 16, by - 10, '#10b981');
      } else if (item === 'diploma') {
        chiptune.playCard();
        this.state.diplomas++;
        this.state.score += 150;
        this.addFloatingText(bx, by - 16, '+150 PROUNI', '#f59e0b');
      } else if (item === 'presal') {
        chiptune.playPowerup();
        this.state.presal++;
        this.state.score += 200;
        this.addFloatingText(bx, by - 16, '+200 PRÉ-SAL!', '#15803d');
      }

      if (this.onStateChange) this.onStateChange({ ...this.state });
    } else if (block.type === 'brick') {
      if (this.player.isSuper) {
        chiptune.playStomp();
        const bx = block.x * TILE_SIZE;
        const by = block.y * TILE_SIZE;
        this.addBrickDebris(bx, by);
        this.blocks = this.blocks.filter(b => b !== block);
        this.state.score += 50;
      } else {
        chiptune.playBump();
      }
    }
  }

  private updateBlocks(dt: number) {
    for (const b of this.blocks) {
      if (b.bumpOffset > 0) {
        b.bumpOffset += b.bumpSpeed * dt * 60;
        b.bumpSpeed += 1.2 * dt * 60;
        if (b.bumpOffset <= 0) {
          b.bumpOffset = 0;
          b.bumpSpeed = 0;
        }
      }
    }
  }

  private updateEnemies(dt: number) {
    for (const e of this.enemies) {
      if (e.isDead) {
        e.deadTimer += dt;
        continue;
      }

      e.vy += 0.5;
      e.x += e.vx;
      e.y += e.vy;

      for (const b of this.blocks) {
        const bx = b.x * TILE_SIZE;
        const by = b.y * TILE_SIZE;
        const bw = TILE_SIZE;
        const bh = TILE_SIZE;

        if (
          e.x + 2 < bx + bw &&
          e.x + e.width - 2 > bx &&
          e.y < by + bh &&
          e.y + e.height > by
        ) {
          if (e.vy > 0) {
            e.y = by - e.height;
            e.vy = 0;
          }
        }

        if (
          e.y + e.height > by &&
          e.y < by + bh &&
          ((e.vx > 0 && e.x + e.width > bx && e.x < bx) ||
           (e.vx < 0 && e.x < bx + bw && e.x + e.width > bx + bw))
        ) {
          e.vx = -e.vx;
        }
      }

      // Player collision
      const pw = this.player.width;
      const ph = this.player.height;

      if (
        this.player.x + 4 < e.x + e.width &&
        this.player.x + pw - 4 > e.x &&
        this.player.y < e.y + e.height &&
        this.player.y + ph > e.y
      ) {
        // Sonic Star Roll Atropela Tudo! OR Stomp from above OR Invincible through Star
        if (this.player.isStarRolling) {
          e.isDead = true;
          e.deadTimer = 0;
          e.vy = -7.5;
          chiptune.playStomp();
          this.state.score += 80;
          this.state.coins++;
          this.player.screenShake = 6;
          this.addFloatingText(e.x, e.y - 12, e.type === 'boi' ? '💥 BOI ATROPELADO!' : '💥 ATROPELADO!', '#facc15');
          this.addSparkles(e.x + 14, e.y + 14, '#ef4444');
          if (this.onStateChange) this.onStateChange({ ...this.state });
        } else if ((this.player.vy > 0 && this.player.y + ph - this.player.vy <= e.y + 14) || this.player.isInvincible) {
          e.isDead = true;
          this.player.vy = -8.5;
          chiptune.playStomp();
          this.state.score += 80;
          this.state.coins++;
          if (e.type === 'boi') {
            this.addFloatingText(e.x, e.y - 10, '+80 BOI DOMADO!', '#eab308');
          } else {
            this.addFloatingText(e.x, e.y - 10, '+80 APOIO!', '#facc15');
          }
          this.addSparkles(e.x + 14, e.y + 14, '#ef4444');
          if (this.onStateChange) this.onStateChange({ ...this.state });
        } else {
          this.hurtPlayer();
        }
      }
    }

    this.enemies = this.enemies.filter(e => !e.isDead || e.deadTimer < 0.6);
  }

  private updatePowerups(dt: number) {
    for (const p of this.activePowerups) {
      p.vy += 0.45;
      p.x += p.vx;
      p.y += p.vy;

      for (const b of this.blocks) {
        const bx = b.x * TILE_SIZE;
        const by = b.y * TILE_SIZE;
        const bw = TILE_SIZE;
        const bh = TILE_SIZE;

        if (
          p.x < bx + bw &&
          p.x + p.size > bx &&
          p.y < by + bh &&
          p.y + p.size > by
        ) {
          if (p.vy > 0) {
            p.y = by - p.size;
            p.vy = 0;
          } else {
            p.vx = -p.vx;
          }
        }
      }

      // Collect Powerup -> Star or Povo Feliz!
      if (
        this.player.x < p.x + p.size &&
        this.player.x + this.player.width > p.x &&
        this.player.y < p.y + p.size &&
        this.player.y + this.player.height > p.y
      ) {
        if (p.type === 'estrela') {
          this.player.isSuper = true;
          this.player.isInvincible = true;
          this.player.invincibleTimer = 8.0; // 8 seconds of invincible hero flight!
          this.state.score += 250;
          this.state.estrelas++;
          chiptune.playStarJingle();
          this.addFloatingText(p.x, p.y - 12, '★ ESTRELA!', '#ffffff');
          this.addSparkles(p.x + 12, p.y + 12, '#ffffff');
          this.openModSelector();
        } else {
          this.state.lives++;
          this.state.povoFelizCount = (this.state.povoFelizCount || 0) + 1;
          this.state.score += 200;
          chiptune.playPowerup();
          this.addFloatingText(p.x, p.y - 12, '★ POVO FELIZ! +1 VIDA', '#10b981');
          this.addSparkles(p.x + 12, p.y + 12, '#10b981');
          this.openModSelector();
        }
        this.activePowerups = this.activePowerups.filter(x => x !== p);
        if (this.onStateChange) this.onStateChange({ ...this.state });
        break;
      }
    }
  }

  private updateCollectibles() {
    for (const c of this.collectibles) {
      if (c.collected) continue;

      if (
        this.player.x < c.x + c.width &&
        this.player.x + this.player.width > c.x &&
        this.player.y < c.y + c.height &&
        this.player.y + this.player.height > c.y
      ) {
        c.collected = true;
        if (c.type === 'coin') {
          chiptune.playCoin();
          this.state.coins++;
          this.state.score += 25;
          this.addFloatingText(c.x, c.y - 10, '+25 APOIO', '#facc15');
        } else if (c.type === 'carteira') {
          chiptune.playCard();
          this.state.carteiras++;
          this.state.score += 100;
          this.addFloatingText(c.x, c.y - 10, '+100 CARTEIRA', '#1d4ed8');
        } else if (c.type === 'estrela') {
          chiptune.playStarJingle();
          this.player.isSuper = true;
          this.state.estrelas++;
          this.state.score += 200;
          this.addFloatingText(c.x, c.y - 10, '★ ESTRELA!', '#ffffff');
          this.addSparkles(c.x + 12, c.y + 12, '#ffffff');
          this.openModSelector();
        } else if (c.type === 'povo_feliz' || (c.type as string) === 'picanha') {
          chiptune.playPowerup();
          this.state.lives++;
          this.state.povoFelizCount = (this.state.povoFelizCount || 0) + 1;
          this.state.score += 150;
          this.addFloatingText(c.x, c.y - 10, '★ POVO FELIZ! +1 VIDA', '#10b981');
          this.addSparkles(c.x + 12, c.y + 12, '#10b981');
          this.openModSelector();
        } else if (c.type === 'diploma') {
          chiptune.playCard();
          this.state.diplomas++;
          this.state.score += 150;
          this.addFloatingText(c.x, c.y - 10, '+150 PROUNI', '#f59e0b');
        } else if (c.type === 'presal') {
          chiptune.playPowerup();
          this.state.presal++;
          this.state.score += 250;
          this.addFloatingText(c.x, c.y - 10, '+250 PRÉ-SAL', '#15803d');
        }
        this.addSparkles(c.x + 12, c.y + 12, '#fde047');
        if (this.onStateChange) this.onStateChange({ ...this.state });
      }
    }
  }

  private hurtPlayer() {
    if (this.player.isInvincible || this.player.isDead || this.player.reachedGoal || this.player.isStarRolling) return;

    if (this.player.isSuper) {
      this.player.isSuper = false;
      this.player.isInvincible = true;
      this.player.invincibleTimer = 2.0;
      chiptune.playHurt();
      this.addFloatingText(this.player.x, this.player.y - 10, 'RESISTÊNCIA!', '#dc2626');
      if (this.onStateChange) this.onStateChange({ ...this.state });
    } else {
      this.killPlayer();
    }
  }

  private killPlayer() {
    if (this.player.isDead) return;
    this.player.isDead = true;
    this.player.deadTimer = 0;
    this.player.vy = -10;
    this.player.vx = 0;
    this.state.lives--;
    chiptune.playHurt();
    if (this.onStateChange) this.onStateChange({ ...this.state });
  }

  private triggerGoalReached() {
    this.player.reachedGoal = true;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.x = this.currentLevel.goalX - 10;
    chiptune.playStageClear();

    // Ao passar as fases, o personagem fala: Bora lá, companheiro!
    setTimeout(() => {
      chiptune.speakVoice('Bora lá, companheiro!');
    }, 700);

    this.state.score += Math.max(0, Math.floor(this.state.timeLeft * 10));
    this.addFloatingText(this.player.x, this.player.y - 30, '★ BORA LÁ, COMPANHEIRO!', '#22c55e');
    if (this.onStateChange) this.onStateChange({ ...this.state });
  }

  private updateGoalSequence(dt: number) {
    const poleBottom = this.currentLevel.goalY + 160;

    if (this.player.y < poleBottom) {
      this.player.y += 2.8;
      this.player.flagY += 2.8;
    } else {
      this.player.victoryWalkTimer += dt;
      this.player.x += 1.8;
      this.runFrameCount += dt * 6;

      if (this.player.victoryWalkTimer > 2.5 && !this.state.showingFactSheet) {
        this.state.showingFactSheet = true;
        this.state.currentFactSheet = this.currentLevel.factSheet;
        if (this.onStateChange) this.onStateChange({ ...this.state });
      }
    }
  }

  private addSparkles(x: number, y: number, color: string) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 1.5 + Math.random() * 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 2,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.2,
      });
    }
  }

  private addBrickDebris(x: number, y: number) {
    const directions = [
      { vx: -2.5, vy: -6 },
      { vx: 2.5, vy: -6 },
      { vx: -1.5, vy: -4 },
      { vx: 1.5, vy: -4 },
    ];
    for (const d of directions) {
      this.particles.push({
        x: x + 16,
        y: y + 16,
        vx: d.vx,
        vy: d.vy,
        color: '#b91c1c',
        size: 6,
        life: 0,
        maxLife: 0.8,
      });
    }
  }

  private addFloatingText(x: number, y: number, text: string, color: string) {
    this.floatTexts.push({
      x,
      y,
      text,
      color,
      vy: -1.2,
      life: 0,
    });
  }

  private updateParticles(dt: number) {
    for (const p of this.particles) {
      p.life += dt;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
    }
    this.particles = this.particles.filter(p => p.life < p.maxLife);

    for (const ft of this.floatTexts) {
      ft.life += dt;
      ft.y += ft.vy;
    }
    this.floatTexts = this.floatTexts.filter(ft => ft.life < 1.1);
  }

  // ==========================================
  // RENDER LOOP
  // ==========================================
  public render() {
    const ctx = this.ctx;
    const cw = this.virtualWidth;
    const ch = this.virtualHeight;

    ctx.save();
    ctx.clearRect(0, 0, cw, ch);

    // 1. Scenery Backdrop
    SpriteRenderer.drawBackground(ctx, this.cameraX, cw, ch, this.animTime, this.currentLevel.theme);

    // 2. Camera Transform with Screen Shake
    ctx.save();
    const shakeX = this.player.screenShake > 0 ? (Math.random() - 0.5) * this.player.screenShake : 0;
    const shakeY = this.player.screenShake > 0 ? (Math.random() - 0.5) * this.player.screenShake : 0;
    ctx.translate(-Math.round(this.cameraX) + shakeX, shakeY);

    // Goal Pole
    SpriteRenderer.drawGoalPole(
      ctx,
      this.currentLevel.goalX,
      this.currentLevel.goalY,
      180,
      this.player.flagY
    );

    // Blocks
    for (const b of this.blocks) {
      const bx = b.x * TILE_SIZE;
      const by = b.y * TILE_SIZE;

      if (bx + TILE_SIZE < this.cameraX - 32 || bx > this.cameraX + cw + 32) continue;

      if (b.type === 'ground' || b.type === 'ground_top') {
        SpriteRenderer.drawGroundBlock(ctx, bx, by, TILE_SIZE, b.type === 'ground_top');
      } else if (b.type === 'brick') {
        SpriteRenderer.drawBrickBlock(ctx, bx, by, TILE_SIZE, b.bumpOffset);
      } else if (b.type === 'question' || b.type === 'used') {
        SpriteRenderer.drawQuestionBlock(
          ctx,
          bx,
          by,
          TILE_SIZE,
          b.type === 'used',
          this.animTime,
          b.bumpOffset
        );
      }
    }

    // Forest Fires / Queimadas Obstacles
    for (const f of this.fires) {
      if (f.x + f.width > this.cameraX - 32 && f.x < this.cameraX + cw + 32) {
        SpriteRenderer.drawForestFire(
          ctx,
          f.x,
          f.y,
          f.width,
          f.height,
          this.animTime,
          f.isExtinguished
        );
      }
    }

    // Overhead Ceiling Spikes (Espinhos ao Alto)
    for (const s of this.ceilingSpikes) {
      if (s.x + s.width > this.cameraX - 32 && s.x < this.cameraX + cw + 32) {
        SpriteRenderer.drawCeilingSpikes(
          ctx,
          s.x,
          s.y,
          s.width,
          s.height,
          this.animTime
        );
      }
    }

    // Collectibles
    for (const c of this.collectibles) {
      if (c.collected) continue;
      if (c.x + 32 < this.cameraX || c.x > this.cameraX + cw) continue;

      const float = Math.sin(this.animTime * 4 + c.x) * 3;
      if (c.type === 'coin') {
        SpriteRenderer.drawPopularidade(ctx, c.x, c.y + float, c.width, this.animTime);
      } else if (c.type === 'carteira') {
        SpriteRenderer.drawCarteiraTrabalho(ctx, c.x, c.y, c.width, c.height, float);
      } else if (c.type === 'estrela') {
        SpriteRenderer.drawEstrelaVermelha(ctx, c.x, c.y + float, c.width, this.animTime);
      } else if (c.type === 'povo_feliz' || c.type === 'picanha') {
        SpriteRenderer.drawPovoFeliz(ctx, c.x, c.y, c.width, float);
      } else if (c.type === 'diploma') {
        SpriteRenderer.drawDiploma(ctx, c.x, c.y, c.width, float);
      } else if (c.type === 'presal') {
        SpriteRenderer.drawPreSal(ctx, c.x, c.y + float, c.width);
      }
    }

    // Active powerups
    for (const p of this.activePowerups) {
      if (p.type === 'estrela') {
        SpriteRenderer.drawEstrelaVermelha(ctx, p.x, p.y, p.size, this.animTime);
      } else {
        SpriteRenderer.drawPovoFeliz(ctx, p.x, p.y, p.size, 0);
      }
    }

    // Projectiles
    for (const proj of this.projectiles) {
      if (proj.type === 'water') {
        SpriteRenderer.drawWaterJet(ctx, proj.x, proj.y, proj.vx, this.animTime);
      } else if (proj.type === 'muscle_fist') {
        SpriteRenderer.drawMusclePunch(ctx, proj.x, proj.y, proj.vx, this.animTime);
      } else {
        SpriteRenderer.drawDiscursoProjectile(ctx, proj.x, proj.y, proj.type, this.animTime);
      }
    }

    // Enemies
    for (const e of this.enemies) {
      if (e.x + 40 < this.cameraX || e.x > this.cameraX + cw) continue;
      SpriteRenderer.drawEnemy(ctx, e.x, e.y, e.width, e.height, e.type, this.animTime, e.isDead);
    }

    // Player (Lula / Super Lula / Active Mod)
    let playerState: 'idle' | 'walk' | 'jump' | 'crouch' | 'victory' | 'dead' | 'fly' | 'roll' = 'idle';
    if (this.player.isDead) playerState = 'dead';
    else if (this.player.reachedGoal) playerState = 'victory';
    else if (this.player.isStarRolling) playerState = 'roll';
    else if (this.player.isFlying) playerState = 'fly';
    else if (!this.player.isGrounded) playerState = 'jump';
    else if (this.player.crouching) playerState = 'crouch';
    else if (Math.abs(this.player.vx) > 0.3) playerState = 'walk';

    SpriteRenderer.drawLula(
      ctx,
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height,
      this.player.facingRight,
      playerState,
      this.runFrameCount,
      this.player.isSuper,
      this.player.isFlying,
      this.player.isInvincible,
      this.player.invincibleTimer,
      this.currentLevel.theme,
      this.player.activeMod,
      this.player.powerTimer
    );

    // Particles
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }

    // Floating text popups
    for (const ft of this.floatTexts) {
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 10px "Press Start 2P", monospace';
      ctx.fillText(ft.text, ft.x, ft.y);
    }

    ctx.restore();

    // 3. HUD
    this.renderHUD(ctx, cw);

    ctx.restore();
  }

  private renderHUD(ctx: CanvasRenderingContext2D, width: number) {
    ctx.save();
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'top';

    // 1. LULA & SCORE
    ctx.fillText('LULA', 24, 16);
    ctx.fillText(String(this.state.score).padStart(6, '0'), 24, 30);

    // 2. APOIO POPULAR
    SpriteRenderer.drawPopularidade(ctx, 150, 14, 14, this.animTime);
    ctx.fillStyle = '#fde047';
    ctx.fillText(`x${String(this.state.coins).padStart(2, '0')}`, 170, 16);

    // 3. CARTEIRAS DE TRABALHO
    SpriteRenderer.drawCarteiraTrabalho(ctx, 230, 14, 12, 14, 0);
    ctx.fillStyle = '#60a5fa';
    ctx.fillText(`x${String(this.state.carteiras).padStart(2, '0')}`, 250, 16);

    // 4. MUNDO
    ctx.fillStyle = '#ffffff';
    ctx.fillText('MUNDO', 330, 16);
    ctx.fillText(`1-${this.state.levelIndex + 1}`, 344, 30);

    // 5. TEMPO
    ctx.fillText('TEMPO', width - 88, 16);
    const timeDisplay = Math.max(0, Math.floor(this.state.timeLeft));
    ctx.fillText(String(timeDisplay).padStart(3, '0'), width - 72, 30);

    // Active MOD Indicator with 10-Second Temporary Power Countdown
    if (this.player.activeMod !== 'none') {
      const modLabels = {
        heroi_voo: 'VOO',
        marombeiro: 'MAROMBA',
        lancador_agua: 'ÁGUA',
      };
      const modColors = {
        heroi_voo: '#ffffff',
        marombeiro: '#f59e0b',
        lancador_agua: '#38bdf8',
      };
      const secs = Math.ceil(Math.max(0, this.player.powerTimer));
      const isCritical = this.player.powerTimer <= 3.0;
      const isBlinking = isCritical && Math.floor(this.animTime * 8) % 2 === 0;
      const labelColor = isBlinking ? '#ef4444' : modColors[this.player.activeMod];

      ctx.fillStyle = labelColor;
      ctx.fillText(`${modLabels[this.player.activeMod]} [⏱${secs}s]`, 410, 16);

      // Mini 10-second timer progress bar
      const barW = 80;
      const barH = 5;
      const fillW = Math.max(0, (this.player.powerTimer / 10.0) * barW);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(410, 30, barW, barH);
      ctx.fillStyle = isCritical ? '#ef4444' : modColors[this.player.activeMod];
      ctx.fillRect(410, 30, fillW, barH);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.strokeRect(410, 30, barW, barH);
    } else if (this.player.isStarRolling) {
      // Sonic Star Roll active HUD badge
      ctx.fillStyle = '#facc15';
      ctx.fillText('★ GIRO SONIC!', 410, 16);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(410, 30, 80, 5);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(410, 30, (this.player.starRollTimer / 1.6) * 80, 5);
    }

    // Cape Flight Gauge Bar (LUZES BRANCAS RADIANTES)
    if (this.player.isSuper || this.player.isFlying || this.player.activeMod === 'heroi_voo' || this.player.flightFuel < 100) {
      ctx.fillStyle = '#ffffff';
      ctx.fillText('VOO', 24, 46);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(64, 46, 70, 8);
      // Pure White glowing bar!
      ctx.fillStyle = this.player.activeMod === 'heroi_voo' ? '#ffffff' : this.player.flightFuel > 30 ? '#f8fafc' : '#38bdf8';
      ctx.fillRect(64, 46, (this.player.flightFuel / 100) * 70, 8);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(64, 46, 70, 8);
    }

    // Lives counter
    ctx.fillStyle = '#ef4444';
    ctx.fillText(`❤ x${this.state.lives}`, width - 88, 46);

    // Pause banner
    if (this.state.isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, width, this.virtualHeight);
      ctx.fillStyle = '#facc15';
      ctx.font = '20px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('JOGO PAUSADO', width / 2, this.virtualHeight / 2 - 10);
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('APERTE ESC OU START PARA CONTINUAR', width / 2, this.virtualHeight / 2 + 25);
    }

    ctx.restore();
  }
}
