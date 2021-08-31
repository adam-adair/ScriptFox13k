import { CPlayer } from "./player-small";

export const generateSong = async (
  song: Song,
  loop = false,
  disp?: HTMLElement
): Promise<HTMLAudioElement> => {
  return new Promise((resolve) => {
    const cPlayer = new CPlayer();
    cPlayer.init(song);
    let done = false;
    let audio: HTMLAudioElement;

    const gen = setInterval(function () {
      const pct = cPlayer.generate();

      done = pct >= 1;

      if (disp) {
        disp.innerHTML = `<p>Loading Audio...${(pct * 100).toFixed(2)}%</p>`;
      }

      if (done) {
        const wave = cPlayer.createWave();
        audio = document.createElement("audio");
        audio.src = URL.createObjectURL(
          new Blob([wave], { type: "audio/wav" })
        );
        audio.loop = loop;
        resolve(audio);
        clearInterval(gen);
      }
    }, 0);
  });
};

export interface Song {
  songData: { i: number[]; p: number[]; c: { n: number[]; f: number[] }[] }[];
  rowLen: number;
  patternLen: number;
  endPattern: number;
  numChannels: number;
}
