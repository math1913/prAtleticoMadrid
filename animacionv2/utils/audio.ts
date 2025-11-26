
// Synthetic Audio Generator: Realistic Stadium Crowd Roar
// Uses Web Audio API with Pink Noise and Filters

let audioCtx: AudioContext | null = null;

const createPinkNoise = (context: AudioContext) => {
  const bufferSize = 4096;
  const pinkNoise = (function() {
      let b0, b1, b2, b3, b4, b5, b6;
      b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
      const node = context.createScriptProcessor(bufferSize, 1, 1);
      node.onaudioprocess = function(e) {
          const output = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
              const white = Math.random() * 2 - 1;
              b0 = 0.99886 * b0 + white * 0.0555179;
              b1 = 0.99332 * b1 + white * 0.0750759;
              b2 = 0.96900 * b2 + white * 0.1538520;
              b3 = 0.86650 * b3 + white * 0.3104856;
              b4 = 0.55000 * b4 + white * 0.5329522;
              b5 = -0.7616 * b5 - white * 0.0168980;
              output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
              output[i] *= 0.11; // (roughly) compensate for gain
              b6 = white * 0.115926;
          }
      };
      return node;
  })();
  return pinkNoise;
};

export const playCrowdCheer = () => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const context = audioCtx;
    const t = context.currentTime;
    const duration = 4.0;

    // Create Noise Source
    const noise = createPinkNoise(context);
    
    // LowPass Filter to shape the noise into a "Roar" (muffles the harsh high frequencies)
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.linearRampToValueAtTime(1200, t + 1.5); // "Swell" effect
    filter.frequency.exponentialRampToValueAtTime(400, t + duration);

    // HighPass Filter to remove muddy low rumble
    const highPass = context.createBiquadFilter();
    highPass.type = "highpass";
    highPass.frequency.value = 150;

    // Gain Envelope (Fade In / Fade Out)
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.8, t + 0.5); // Fast attack
    gain.gain.linearRampToValueAtTime(0.6, t + 2.0); // Sustain
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration); // Fade out

    // Connect graph
    noise.connect(filter);
    filter.connect(highPass);
    highPass.connect(gain);
    gain.connect(context.destination);

    // Since ScriptProcessor is infinite, we need to disconnect it after duration
    setTimeout(() => {
        noise.disconnect();
        gain.disconnect();
    }, duration * 1000);

  } catch (e) {
    console.error("Audio play failed", e);
  }
};
