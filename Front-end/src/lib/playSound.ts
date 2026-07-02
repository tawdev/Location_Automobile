"use client";

export function playConfirmationSound() {
  try {
    const audio = new Audio("/confirmation.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Autoplay blocked on mobile, silently ignore
    });
  } catch {
    // Audio not supported, silently ignore
  }
}
