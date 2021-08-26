import { CPlayer } from "./player-small";

export const generateSong = (song: Song): HTMLAudioElement => {
  const cPlayer = new CPlayer();
  cPlayer.init(song);
  cPlayer.generate();
  let done = false;
  let audio: HTMLAudioElement;
  setInterval(function () {
    if (done) {
      return;
    }
    const pct = cPlayer.generate();
    done = pct >= 1;
    if (done) {
      const wave = cPlayer.createWave();
      audio = document.createElement("audio");
      audio.src = URL.createObjectURL(new Blob([wave], { type: "audio/wav" }));
      audio.loop = true;
    }
  }, 0);
  return audio;
};

export interface Song {
  songData: { i: number[]; p: number[]; c: { n: number[]; f: number[] }[] }[];
  rowLen: number;
  patternLen: number;
  endPattern: number;
  numChannels: number;
}
