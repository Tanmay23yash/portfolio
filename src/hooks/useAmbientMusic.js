import { useCallback, useEffect, useRef, useState } from "react";

// A small generative lo-fi loop built with the Web Audio API — no audio files needed.
// Soft pads + a round bass + a sparse arpeggio, with a little vinyl crackle.

const midiToHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

// Fmaj7 → Em7 → Dm7 → Cmaj7, as MIDI notes.
const CHORDS = [
  [53, 57, 60, 64],
  [52, 55, 59, 62],
  [50, 53, 57, 60],
  [48, 52, 55, 59],
];
const BPM = 72;
const BEAT = 60 / BPM;
const BEATS_PER_CHORD = 4;
const VOLUME = 0.22;

function createEngine() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  const master = ctx.createGain();
  master.gain.value = 0;
  const compressor = ctx.createDynamicsCompressor();
  master.connect(compressor).connect(ctx.destination);

  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 1400;
  tone.Q.value = 0.4;
  tone.connect(master);

  // Echo for the arpeggio.
  const delay = ctx.createDelay(1);
  delay.delayTime.value = BEAT * 0.75;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.32;
  const wet = ctx.createGain();
  wet.gain.value = 0.28;
  delay.connect(feedback).connect(delay);
  delay.connect(wet).connect(tone);

  // Vinyl crackle: filtered noise plus the occasional pop.
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3 + (Math.random() < 0.0004 ? Math.random() * 0.8 : 0);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.035;
  noise.connect(noiseGain).connect(master);
  noise.start();

  const voice = ({ freq, start, length, type, gain, attack, release, dest }) => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0, start);
    env.gain.linearRampToValueAtTime(gain, start + attack);
    env.gain.setTargetAtTime(0, start + length, release / 3);
    osc.connect(env).connect(dest);
    osc.start(start);
    osc.stop(start + length + release + 0.1);
  };

  let beat = 0;
  let nextTime = ctx.currentTime + 0.1;
  let timer = 0;

  const scheduleBeat = (time) => {
    const chord = CHORDS[Math.floor(beat / BEATS_PER_CHORD) % CHORDS.length];
    const beatInChord = beat % BEATS_PER_CHORD;

    if (beatInChord === 0) {
      const length = BEAT * BEATS_PER_CHORD;
      chord.forEach((note) => {
        [-6, 6].forEach((detune) => {
          voice({
            freq: midiToHz(note) * Math.pow(2, detune / 1200),
            start: time,
            length: length - 0.2,
            type: "triangle",
            gain: 0.028,
            attack: 0.9,
            release: 1.2,
            dest: tone,
          });
        });
      });
    }

    if (beatInChord === 0 || beatInChord === 2) {
      voice({ freq: midiToHz(chord[0] - 12), start: time, length: BEAT * 1.4, type: "sine", gain: 0.16, attack: 0.02, release: 0.5, dest: tone });
    }

    // Sparse arpeggio on eighth notes.
    [0, 0.5].forEach((offset) => {
      if (Math.random() < 0.5) {
        const note = chord[Math.floor(Math.random() * chord.length)] + 12 + (Math.random() < 0.3 ? 12 : 0);
        const t = time + offset * BEAT;
        voice({ freq: midiToHz(note), start: t, length: 0.12, type: "sine", gain: 0.05, attack: 0.01, release: 0.6, dest: tone });
        voice({ freq: midiToHz(note), start: t, length: 0.12, type: "sine", gain: 0.03, attack: 0.01, release: 0.6, dest: delay });
      }
    });
  };

  const tick = () => {
    while (nextTime < ctx.currentTime + 0.4) {
      scheduleBeat(nextTime);
      nextTime += BEAT;
      beat++;
    }
  };

  return {
    async play() {
      await ctx.resume();
      nextTime = Math.max(nextTime, ctx.currentTime + 0.05);
      tick();
      clearInterval(timer);
      timer = setInterval(tick, 100);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(VOLUME, ctx.currentTime, 0.6);
    },
    pause() {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
      clearInterval(timer);
      setTimeout(() => ctx.state === "running" && !timer && ctx.suspend(), 1200);
      timer = 0;
    },
    close() {
      clearInterval(timer);
      ctx.close();
    },
  };
}

export default function useAmbientMusic() {
  const engine = useRef(null);
  const [playing, setPlaying] = useState(false);

  const toggle = useCallback(() => {
    if (!engine.current) engine.current = createEngine();
    if (playing) {
      engine.current.pause();
      setPlaying(false);
    } else {
      engine.current.play();
      setPlaying(true);
    }
  }, [playing]);

  useEffect(() => () => engine.current?.close(), []);

  return { playing, toggle };
}
