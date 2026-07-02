"use client";

let audioContext: AudioContext | null = null;
let audioBuffer: AudioBuffer | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
  } catch {
    return null;
  }
}

/** Call this on user interaction (click/tap) to prime audio for mobile */
export function prepareConfirmationSound() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume();
  }
  // Preload buffer
  if (!audioBuffer) {
    const preloadCtx = getAudioContext();
    if (preloadCtx) {
      const ctx = preloadCtx;
      fetch("/confirmation.mp3")
        .then((r) => r.arrayBuffer())
        .then((buf) => ctx.decodeAudioData(buf))
        .then((decoded) => { audioBuffer = decoded; })
        .catch(() => {});
    }
  }
}

export function playConfirmationSound() {
  // Web Audio API path (works on mobile if context was resumed on gesture)
  const ctx = getAudioContext();
  if (ctx && ctx.state === "running" && audioBuffer) {
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    const gain = ctx.createGain();
    gain.gain.value = 0.5;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);
    return;
  }

  // Fallback: direct Audio element (works on desktop)
  try {
    const audio = new Audio("/confirmation.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch {
    // silently ignore
  }
}
