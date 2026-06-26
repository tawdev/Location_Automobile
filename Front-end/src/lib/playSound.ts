"use client";

export function playConfirmationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const g = ctx.createGain();
    g.gain.value = 0.3;
    g.connect(ctx.destination);
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = freq;
      o.connect(g);
      o.start(ctx.currentTime + i * 0.12);
      o.stop(ctx.currentTime + i * 0.24);
    });
  } catch {
    // Audio not supported
  }
}
