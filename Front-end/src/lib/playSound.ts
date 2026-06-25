"use client";

export function playConfirmationSound() {
  try {
    const audio = new Audio("/success-sound.mp3");
    audio.volume = 0.5;
    audio.play();
  } catch {
    // Audio not supported, silently ignore
  }
}
