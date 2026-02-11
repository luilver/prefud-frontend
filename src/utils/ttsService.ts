import { Capacitor } from "@capacitor/core";

let nativeTTS: any = null;
let nativeLoadFailed = false;
let activeUtterance: SpeechSynthesisUtterance | null = null;

const isNative = () => Capacitor.isNativePlatform();

const getNativeTTS = async () => {
  if (nativeLoadFailed) return null;
  if (!nativeTTS) {
    try {
      const mod = await import("@capacitor-community/text-to-speech");
      nativeTTS = mod.TextToSpeech;
      
    } catch (err) {
      nativeLoadFailed = true;
      console.log('error loading native ', err);
      return null;
    }
  }
  return nativeTTS;
};

export const speak = async (text: string, lang: string = "en-US", rate: number = 0.9): Promise<void> => {
  if (isNative()) {
    const TTS = await getNativeTTS();
    if (TTS) {
      return new Promise(async (resolve) => {
        // Safety: If native engine hangs for more than 10s, move on
        const timer = setTimeout(() => {
          console.warn("[TTS] Native call timed out");
          resolve();
        }, 10000);

        try {
          await TTS.speak({
            text,
            lang,
            rate,
            pitch: 1.0,
            volume: 1.0,
            category: "playback", // playback allows audio even on silent mode
          });
        } catch (err) {
          console.error("[TTS] Native speak error:", err);
        } finally {
          clearTimeout(timer);
          resolve();
        }
      });
    }
  }

  // WEB FALLBACK
  return new Promise<void>((resolve) => {
    if (!window.speechSynthesis) return resolve();
    window.speechSynthesis.cancel();
    activeUtterance = new SpeechSynthesisUtterance(text);
    activeUtterance.lang = lang;
    activeUtterance.rate = rate;

    let resolved = false;
    const done = () => {
      if (resolved) return;
      resolved = true;
      activeUtterance = null;
      resolve();
    };

    activeUtterance.onend = done;
    activeUtterance.onerror = done;
    window.speechSynthesis.speak(activeUtterance);
    
    // iOS WebKit fix: poll if speaking stopped
    const check = setInterval(() => {
      if (!window.speechSynthesis.speaking && !resolved) {
        clearInterval(check);
        done();
      }
    }, 250);
    setTimeout(done, 10000);
  });
};

export const stopSpeaking = async (): Promise<void> => {
  if (isNative()) {
    const TTS = await getNativeTTS();
    try { await TTS?.stop(); } catch (e) {}
  }
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  activeUtterance = null;
};