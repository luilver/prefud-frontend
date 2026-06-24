import { Capacitor } from "@capacitor/core";
import { TextToSpeech } from "@capacitor-community/text-to-speech";

let activeUtterance: SpeechSynthesisUtterance | null = null;

const isNative = () => Capacitor.isNativePlatform();

export const speak = async (text: string, lang: string = "en-US", rate: number = 0.9): Promise<void> => {
  console.log("[TTS] speak called, native:", isNative(), "text length:", text.length);

  if (isNative()) {
    try {
      console.log("[TTS] Using native TTS plugin");
      await TextToSpeech.speak({
        text,
        lang,
        rate,
        pitch: 1.0,
        volume: 1.0,
        category: "playback",
      });
      console.log("[TTS] Native speak completed");
      return;
    } catch (err) {
      console.error("[TTS] Native speak error, falling back to web:", err);
    }
  }

  // WEB FALLBACK
  return new Promise<void>((resolve) => {
    if (!window.speechSynthesis) {
      console.warn("[TTS] No speechSynthesis available");
      return resolve();
    }
    window.speechSynthesis.cancel();
    activeUtterance = new SpeechSynthesisUtterance(text);
    activeUtterance.lang = lang;
    activeUtterance.rate = rate;

    let resolved = false;
    const done = () => {
      if (resolved) return;
      resolved = true;
      activeUtterance = null;
      clearInterval(iosCheck);
      resolve();
    };

    activeUtterance.onend = done;
    activeUtterance.onerror = (e) => {
      console.error("[TTS] Web speech error:", e);
      done();
    };
    window.speechSynthesis.speak(activeUtterance);

    // iOS WebKit fix: poll if speaking stopped
    const iosCheck = setInterval(() => {
      if (!window.speechSynthesis.speaking && !resolved) {
        done();
      }
    }, 250);

    // Safety timeout based on text length
    const timeout = Math.max(10000, text.length * 100);
    setTimeout(done, timeout);
  });
};

export const stopSpeaking = async (): Promise<void> => {
  if (isNative()) {
    try {
      await TextToSpeech.stop();
    } catch (e) {
      console.error("[TTS] Native stop error:", e);
    }
  }
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  activeUtterance = null;
};
