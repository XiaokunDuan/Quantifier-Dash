
// Simple synthesizer for game sounds using Web Audio API
// No external files needed, ensuring fast loading and offline support

let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

// Initialize/Resume audio context (must be called on user interaction)
export const initAudio = () => {
  const ctx = getCtx();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
};

// A cute "pop" sound for button clicks and card appearances
export const playPop = () => {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Rapid pitch ramp up
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);

    // Short envelope
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.error(e);
  }
};

// Happy "Ding-Ding" for correct answers
export const playCorrect = () => {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;

    // First note (High C)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, t); 
    gain1.gain.setValueAtTime(0.1, t);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.15);

    // Second note (Higher E) - Harmonious
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, t + 0.1); 
    gain2.gain.setValueAtTime(0.1, t + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t + 0.1);
    osc2.stop(t + 0.4);
  } catch (e) {
    console.error(e);
  }
};

// A "Bonk" sound for wrong answers (Sawtooth wave)
export const playWrong = () => {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth'; // Rougher sound
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.error(e);
  }
};

// Victory Fanfare (Arpeggio)
export const playWin = () => {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    
    // C Major Arpeggio: C, E, G, C(high)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle'; // Brighter than sine
      osc.frequency.setValueAtTime(freq, t + i * 0.1);
      
      gain.gain.setValueAtTime(0.1, t + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.1 + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.3);
    });
  } catch (e) {
    console.error(e);
  }
};
