/**
 * Unified Game Controller & Input Manager
 * Supports Gamepad API (Xbox, PlayStation, 8BitDo, generic USB/Bluetooth),
 * Keyboard (WASD, Arrows, Z, X, Esc, M), and on-screen Virtual Controls.
 */

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;        // Z / Button A
  run: boolean;         // X / Button B / Square / Shift
  pause: boolean;       // Esc / Start / P
  restart: boolean;     // R / Y
  mute: boolean;        // M / Select
  
  // Just pressed triggers (single-frame pulses)
  justPressedJump: boolean;
  justPressedRun: boolean;
  justPressedPause: boolean;
  justPressedRestart: boolean;
  justPressedMute: boolean;
  justPressedAny: boolean;

  gamepadConnected: boolean;
  gamepadName: string;
}

export class InputManager {
  private keysDown: Set<string> = new Set();
  private prevInputState: {
    jump: boolean;
    run: boolean;
    pause: boolean;
    restart: boolean;
    mute: boolean;
    any: boolean;
  } = {
    jump: false,
    run: false,
    pause: false,
    restart: false,
    mute: false,
    any: false,
  };

  public virtualLeft: boolean = false;
  public virtualRight: boolean = false;
  public virtualUp: boolean = false;
  public virtualDown: boolean = false;
  public virtualJump: boolean = false;
  public virtualRun: boolean = false;
  public virtualPause: boolean = false;

  public activeGamepadName: string = '';
  public onGamepadChange?: (name: string, connected: boolean) => void;

  constructor() {
    this.setupKeyboardListeners();
    this.setupGamepadListeners();
  }

  private setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      // Prevent scrolling on arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      this.keysDown.add(e.key.toLowerCase());
      this.keysDown.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown.delete(e.key.toLowerCase());
      this.keysDown.delete(e.code);
    });

    window.addEventListener('blur', () => {
      this.keysDown.clear();
    });
  }

  private setupGamepadListeners() {
    window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
      this.activeGamepadName = e.gamepad.id;
      if (this.onGamepadChange) {
        this.onGamepadChange(e.gamepad.id, true);
      }
    });

    window.addEventListener('gamepaddisconnected', () => {
      this.activeGamepadName = '';
      if (this.onGamepadChange) {
        this.onGamepadChange('', false);
      }
    });
  }

  private pollGamepad(): {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    jump: boolean;
    run: boolean;
    pause: boolean;
    restart: boolean;
    mute: boolean;
    any: boolean;
    name: string;
    connected: boolean;
  } {
    const gamepads = typeof navigator.getGamepads === 'function' ? navigator.getGamepads() : [];
    let pad: Gamepad | null = null;

    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i] && gamepads[i]!.connected) {
        pad = gamepads[i];
        break;
      }
    }

    if (!pad) {
      return {
        left: false,
        right: false,
        up: false,
        down: false,
        jump: false,
        run: false,
        pause: false,
        restart: false,
        mute: false,
        any: false,
        name: '',
        connected: false,
      };
    }

    const name = pad.id || 'Controle USB/Bluetooth';
    const deadzone = 0.35;

    // Axes (Left thumbstick)
    const axisX = pad.axes[0] || 0;
    const axisY = pad.axes[1] || 0;

    // Standard Gamepad Buttons:
    // 0: A (Xbox) / Cross (PS)
    // 1: B (Xbox) / Circle (PS)
    // 2: X (Xbox) / Square (PS)
    // 3: Y (Xbox) / Triangle (PS)
    // 8: Back / Select / Share
    // 9: Start / Menu / Options
    // 12: D-pad Up
    // 13: D-pad Down
    // 14: D-pad Left
    // 15: D-pad Right
    const btn = (index: number) => {
      const b = pad?.buttons[index];
      return b ? (typeof b === 'object' ? b.pressed : b === 1.0) : false;
    };

    const left = axisX < -deadzone || btn(14);
    const right = axisX > deadzone || btn(15);
    const up = axisY < -deadzone || btn(12);
    const down = axisY > deadzone || btn(13);

    const jump = btn(0) || btn(1);           // A or B
    const run = btn(2) || btn(3) || btn(5);  // X, Y or Right Bumper
    const pause = btn(9);                   // Start
    const mute = btn(8);                    // Select
    const restart = btn(3);                 // Y button

    const any = left || right || up || down || jump || run || pause || restart || mute || pad.buttons.some(b => b.pressed);

    return {
      left,
      right,
      up,
      down,
      jump,
      run,
      pause,
      restart,
      mute,
      any,
      name,
      connected: true,
    };
  }

  public getState(): InputState {
    const pad = this.pollGamepad();

    const kLeft = this.keysDown.has('arrowleft') || this.keysDown.has('a') || this.keysDown.has('keya');
    const kRight = this.keysDown.has('arrowright') || this.keysDown.has('d') || this.keysDown.has('keyd');
    const kUp = this.keysDown.has('arrowup') || this.keysDown.has('w') || this.keysDown.has('keyw');
    const kDown = this.keysDown.has('arrowdown') || this.keysDown.has('s') || this.keysDown.has('keys');
    const kJump = this.keysDown.has('z') || this.keysDown.has('keyz') || this.keysDown.has(' ') || this.keysDown.has('space');
    const kRun = this.keysDown.has('x') || this.keysDown.has('keyx') || this.keysDown.has('shift') || this.keysDown.has('shiftleft') || this.keysDown.has('shiftright');
    const kPause = this.keysDown.has('escape') || this.keysDown.has('p') || this.keysDown.has('keyp');
    const kRestart = this.keysDown.has('r') || this.keysDown.has('keyr');
    const kMute = this.keysDown.has('m') || this.keysDown.has('keym');

    const left = kLeft || pad.left || this.virtualLeft;
    const right = kRight || pad.right || this.virtualRight;
    const up = kUp || pad.up || this.virtualUp;
    const down = kDown || pad.down || this.virtualDown;
    const jump = kJump || pad.jump || this.virtualJump;
    const run = kRun || pad.run || this.virtualRun;
    const pause = kPause || pad.pause || this.virtualPause;
    const restart = kRestart || pad.restart;
    const mute = kMute || pad.mute;

    const any = left || right || up || down || jump || run || pause || pad.any || this.keysDown.size > 0;

    const justPressedJump = jump && !this.prevInputState.jump;
    const justPressedRun = run && !this.prevInputState.run;
    const justPressedPause = pause && !this.prevInputState.pause;
    const justPressedRestart = restart && !this.prevInputState.restart;
    const justPressedMute = mute && !this.prevInputState.mute;
    const justPressedAny = any && !this.prevInputState.any;

    this.prevInputState = {
      jump,
      run,
      pause,
      restart,
      mute,
      any,
    };

    return {
      left,
      right,
      up,
      down,
      jump,
      run,
      pause,
      restart,
      mute,
      justPressedJump,
      justPressedRun,
      justPressedPause,
      justPressedRestart,
      justPressedMute,
      justPressedAny,
      gamepadConnected: pad.connected,
      gamepadName: pad.name || this.activeGamepadName,
    };
  }
}
