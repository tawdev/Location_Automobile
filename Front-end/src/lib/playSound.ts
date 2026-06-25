"use client";

export function playConfirmationSound() {
  try {
    const audio = new Audio("/confirmation.mp3");
    audio.volume = 0.5;
    audio.play();
  } catch {
    // Audio not supported, silently ignore
  }
}
