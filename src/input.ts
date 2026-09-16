import { idleInput, type Input } from './engine';

export class Controls {
  private keys = new Set<string>();
  private buttons = new Set<string>();
  private pending = new Set<string>();
  private stickId: number | null = null;
  private vector = { x: 0, y: 0 };
  private enabled = false;
  private physicalKeys = new Set<string>();
  private blockedKeys = new Set<string>();
  private padBarriers = new Map<number, { buttons: Set<number>; axes: boolean }>();
  onPause = () => {};
  constructor() {
    // Capture physical state even when the menu consumes the event later.
    window.addEventListener('keydown', event => this.physicalKeys.add(event.code), true);
    window.addEventListener('keydown', event => {
      if (!this.enabled || this.blockedKeys.has(event.code)) return;
      if (event.target instanceof HTMLInputElement) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
      if ((event.code === 'Escape' || event.code === 'KeyP') && !event.repeat) this.onPause();
      this.keys.add(event.code);
      if (event.repeat) return;
      if (event.code === 'KeyH') this.pending.add('heavy');
      const second = ({Numpad1:'attack2',Numpad2:'heavy2',Numpad3:'magic2',Numpad0:'jump2',Numpad4:'dodge2'} as Record<string,string>)[event.code]; if (second) this.pending.add(second);
      if (event.code === 'KeyJ') this.pending.add('attack');
      if (['Space', 'KeyI'].includes(event.code)) this.pending.add('jump');
      if (event.code === 'KeyK') this.pending.add('magic');
      if (['KeyL', 'ShiftLeft', 'ShiftRight'].includes(event.code)) this.pending.add('dodge');
    });
    window.addEventListener('keyup', event => { this.keys.delete(event.code); this.physicalKeys.delete(event.code); this.blockedKeys.delete(event.code); }, true);
    window.addEventListener('blur', () => { this.physicalKeys.clear(); this.blockedKeys.clear(); this.clear(); });
    const stick = document.querySelector<HTMLElement>('#stick')!;
    const move = (e: PointerEvent) => {
      if (e.pointerId !== this.stickId) return;
      const box = stick.getBoundingClientRect(), radius = box.width * .32;
      const x = e.clientX - box.left - box.width / 2, y = e.clientY - box.top - box.height / 2;
      const length = Math.hypot(x, y), normal = Math.max(radius, length);
      this.vector = { x: x / normal, y: y / normal };
      document.querySelector<HTMLElement>('#thumb')!.style.transform = `translate(${this.vector.x * radius}px, ${this.vector.y * radius}px)`;
    };
    stick.addEventListener('pointerdown', e => {
      if (!this.enabled || this.stickId !== null) return;
      this.stickId = e.pointerId; stick.setPointerCapture(e.pointerId); move(e);
    });
    stick.addEventListener('pointermove', move);
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) stick.addEventListener(event, () => { this.stickId = null; this.vector = { x: 0, y: 0 }; document.querySelector<HTMLElement>('#thumb')!.style.transform = ''; });
    for (const key of ['attack', 'heavy', 'magic', 'dodge', 'jump']) {
      const button = document.querySelector<HTMLButtonElement>(`#${key}`)!;
      button.addEventListener('pointerdown', event => { if (!this.enabled) return; event.preventDefault(); button.setPointerCapture(event.pointerId); this.buttons.add(key); this.pending.add(key); button.classList.add('pressed'); });
      for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(event, () => { this.buttons.delete(key); button.classList.remove('pressed'); });
    }
  }
  clear() { this.keys.clear(); this.buttons.clear(); this.pending.clear(); this.vector = { x: 0, y: 0 }; this.stickId = null; document.querySelector<HTMLElement>('#thumb')!.style.transform = ''; document.querySelectorAll('.pressed').forEach(e => e.classList.remove('pressed')); }
  private barrier(pad: Gamepad) {
    return { buttons: new Set(pad.buttons.flatMap((b, i) => b.pressed ? [i] : [])), axes: pad.axes.some((n, i) => i < 2 && Math.abs(n) >= .18) };
  }
  setEnabled(enabled: boolean) {
    if (enabled === this.enabled) return;
    this.enabled = enabled; this.clear();
    if (enabled) {
      this.blockedKeys = new Set(this.physicalKeys);
      this.padBarriers.clear();
      for (const pad of navigator.getGamepads?.() ?? []) if (pad?.connected) this.padBarriers.set(pad.index, this.barrier(pad));
    }
  }
  consumeActions() { this.pending.clear(); }
  sample(player = 0, coop = false): Input {
    const v = idleInput();
    if (!this.enabled) return v;
    v.x = Number(this.keys.has('KeyD') || this.keys.has('ArrowRight')) - Number(this.keys.has('KeyA') || this.keys.has('ArrowLeft')) + this.vector.x;
    v.y = Number(this.keys.has('KeyS') || this.keys.has('ArrowDown')) - Number(this.keys.has('KeyW') || this.keys.has('ArrowUp')) + this.vector.y;
    v.attack = this.keys.has('KeyJ') || this.buttons.has('attack') || this.pending.has('attack');
    v.heavy = this.keys.has('KeyH') || this.buttons.has('heavy') || this.pending.has('heavy');
    v.jump = this.keys.has('Space') || this.keys.has('KeyI') || this.buttons.has('jump') || this.pending.has('jump');
    v.magic = this.keys.has('KeyK') || this.buttons.has('magic') || this.pending.has('magic');
    v.dodge = this.keys.has('KeyL') || this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || this.buttons.has('dodge') || this.pending.has('dodge');
    if (coop && player === 0) { v.x = Number(this.keys.has('KeyD')) - Number(this.keys.has('KeyA')) + this.vector.x; v.y = Number(this.keys.has('KeyS')) - Number(this.keys.has('KeyW')) + this.vector.y; }
    if (player === 1) {
      v.x = Number(this.keys.has('ArrowRight')) - Number(this.keys.has('ArrowLeft')); v.y = Number(this.keys.has('ArrowDown')) - Number(this.keys.has('ArrowUp'));
      v.attack = this.keys.has('Numpad1') || this.pending.has('attack2'); v.heavy = this.keys.has('Numpad2') || this.pending.has('heavy2'); v.jump = this.keys.has('Numpad0') || this.pending.has('jump2'); v.magic = this.keys.has('Numpad3') || this.pending.has('magic2'); v.dodge = this.keys.has('Numpad4') || this.pending.has('dodge2');
    }
    const pads = Array.from(navigator.getGamepads?.() ?? []).filter(p => p?.connected);
    const pad = coop && pads.length === 1 ? (player === 1 ? pads[0] : null) : pads[player];
    if (pad?.connected) {
      const barrier = this.padBarriers.get(pad.index) ?? this.barrier(pad);
      this.padBarriers.set(pad.index, barrier);
      for (const button of barrier.buttons) if (!pad.buttons[button]?.pressed) barrier.buttons.delete(button);
      if (Math.abs(pad.axes[0] || 0) < .18 && Math.abs(pad.axes[1] || 0) < .18) barrier.axes = false;
      const pressed = (i: number) => !!pad.buttons[i]?.pressed && !barrier.buttons.has(i);
      const axis = (i: number) => barrier.axes || Math.abs(pad.axes[i] || 0) < .18 ? 0 : pad.axes[i];
      v.x += axis(0) + Number(pressed(15)) - Number(pressed(14));
      v.y += axis(1) + Number(pressed(13)) - Number(pressed(12));
      v.heavy ||= pressed(5); v.jump ||= pressed(0); v.attack ||= pressed(2); v.magic ||= pressed(3); v.dodge ||= pressed(1);
    }
    return v;
  }
}
