import { Capacitor } from "@capacitor/core";

/**
 * Cross-platform TTS service.
 * Uses @capacitor-community/text-to-speech on native (iOS/Android),
 * falls back to Web Speech API on web.
 */

let nativeTTS: any = null;

const isNative = () => Capacitor.isNativePlatform();

const getNativeTTS = async () => {
  if (!nativeTTS) {
    const mod = await import("@capacitor-community/text-to-speech");
    nativeTTS = mod.TextToSpeech;
  }
  return nativeTTS;
};

/**
 * Speak text. Returns a promise that resolves when speech finishes.
 * On native: uses Capacitor plugin (reliable onend via Promise).
 * On web: wraps speechSynthesis in a Promise.
 */
export const speak = async (
  text: string,
  lang: string = "en-US",
  rate: number = 0.9
): Promise<void> => {
  if (isNative()) {
    const TTS = await getNativeTTS();
    await TTS.speak({ text, lang, rate, pitch: 1.0, volume: 1.0, category: "ambient" });
  } else {
    return new Promise<void>((resolve, reject) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e);
      window.speechSynthesis.speak(utterance);
    });
  }
};

/**
 * Stop any ongoing speech.
 */
export const stopSpeaking = async (): Promise<void> => {
  if (isNative()) {
    try {
      const TTS = await getNativeTTS();
      await TTS.stop();
    } catch {
      // ignore if nothing is playing
    }
  } else {
    window.speechSynthesis.cancel();
  }
};
