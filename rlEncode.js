export const rlEncode = (arr) => {
  const ret = ["x", 0];
  for (let i = 0; i < arr.length - 1; i += 2) {
    const a = arr[i] > -1 ? arr[i] + "x" : "nx";
    const b = arr[i + 1] > -1 ? arr[i + 1] : "n";
    const curr = a + b;
    if (ret[ret.length - 2] === curr) ret[ret.length - 1]++;
    else ret.push(curr, 1);
  }
  if (arr.length % 2 === 1) ret.push(arr[arr.length - 1]);
  ret.splice(0, 2);
  return ret;
};

export const rlDecode = (arr) => {
  const ret = [];
  for (let i = 0; i < arr.length; i += 2) {
    if (i === arr.length - 1) break;
    const v = arr[i].split("x");
    for (let j = 0; j < arr[i + 1]; j++) {
      v[0] === "n" ? ret.length++ : ret.push(+v[0]);
      v[1] === "n" ? ret.length++ : ret.push(+v[1]);
    }
  }
  if (arr.length % 2 === 1) ret.push(arr[arr.length - 1]);
  return ret;
};

export const processSong = (
  { songData, rowLen, patternLen, endPattern, numChannels },
  func
) => {
  const compD = [];
  for (let m = 0; m < songData.length; m++) {
    const { i, p, c } = songData[m];
    let compC = [];
    for (let j = 0; j < c.length; j++) {
      const { n, f } = c[j];
      compC[j] = { n: func(n), f: func(f) };
    }
    compD[m] = { i: func(i), p: func(p), c: compC };
  }
  return { songData: compD, rowLen, patternLen, endPattern, numChannels };
};
