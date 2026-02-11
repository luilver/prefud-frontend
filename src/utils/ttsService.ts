import { Capacitor } from "@capacitor/core";

/**
 * Cross-platform TTS service.
 * Uses @capacitor-community/text-to-speech on native (iOS/Android),
 * falls back to Web Speech API on web.
 */

let nativeTTS: any = null;
let nativeLoadFailed = false;

const isNative = () => Capacitor.isNativePlatform();

const getNativeTTS = async () => {
  if (nativeLoadFailed) return null;
  if (!nativeTTS) {
    try {
      const mod = await import("@capacitor-community/text-to-speech");
      nativeTTS = mod.TextToSpeech;
    } catch (err) {
      console.error("[TTS] Failed to load native TTS plugin:", err);
      nativeLoadFailed = true;
      return null;
    }
  }
  return nativeTTS;
};

/**
 * Speak text. Returns a promise that resolves when speech finishes.
 * On native: uses Capacitor plugin (reliable onend via Promise).
 * On web: wraps speechSynthesis in a Promise with iOS workaround.
 */
export const speak = async (
  text: string,
  lang: string = "en-US",
  rate: number = 0.9
): Promise<void> => {
  if (isNative()) {
    const TTS = await getNativeTTS();
    if (TTS) {
      try {
        await TTS.speak({ text, lang, rate, pitch: 1.0, volume: 1.0, category: "ambient" });
        return;
      } catch (err) {
        console.error("[TTS] Native speak failed, falling back to web:", err);
        // Fall through to web fallback
      }
    }
  }

  // Web fallback (also used if native fails)
  return new Promise<void>((resolve, reject) => {
    if (!window.speechSynthesis) {
      console.warn("[TTS] speechSynthesis not available");
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;

    // iOS Safari workaround: onend sometimes doesn't fire.
    // Use a polling fallback to detect when speech has finished.
    let resolved = false;
    const done = () => {
      if (resolved) return;
      resolved = true;
      clearInterval(iosCheckInterval);
      resolve();
    };

    utterance.onend = done;
    utterance.onerror = (e) => {
      if (resolved) return;
      resolved = true;
      clearInterval(iosCheckInterval);
      // Don't reject for 'interrupted' errors (happens when we cancel)
      if (e.error === "interrupted" || e.error === "canceled") {
        resolve();
      } else {
        reject(e);
      }
    };

    window.speechSynthesis.speak(utterance);

    // iOS Safari fix: poll to detect when speech finishes since onend is unreliable
    const iosCheckInterval = setInterval(() => {
      if (!window.speechSynthesis.speaking && !resolved) {
        done();
      }
    }, 250);

    // Safety timeout: resolve after estimated duration to prevent hanging
    const estimatedDuration = Math.max(5000, text.length * 80);
    setTimeout(() => {
      if (!resolved) {
        console.warn("[TTS] Safety timeout reached, resolving");
        done();
      }
    }, estimatedDuration);
  });
};

/**
 * Stop any ongoing speech.
 */
export const stopSpeaking = async (): Promise<void> => {
  if (isNative()) {
    try {
      const TTS = await getNativeTTS();
      if (TTS) {
        await TTS.stop();
        return;
      }
    } catch {
      // ignore
    }
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};
