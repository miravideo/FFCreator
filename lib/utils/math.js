// Clamps value between min and max
function clamp(num, min, max) {
  return num < min ? min : num > max ? max : num;
}

// Normalize value over a given range
function normalize(val, min, max) {
  const n = (val - min) / (max - min);

  return clamp(n, 0, 1);
}

// Fast floor
function floor(val) {
  return ~~val;
}

// Decibels to magnitude: Math.pow(10, 0.05 * val);
function db2mag(val) {
  return Math.exp(0.1151292546497023 * val);
}

// Magnitude to decibels: 20 * log10(db)
function mag2db(val) {
  return 20 * log10(val);
}

// Log base 10
function log10(val) {
  return Math.log(val) / Math.LN10;
}

const blackman = (i,N) =>  {
  const a0 = 0.42,
    a1 = 0.5,
    a2 = 0.08,
    f = 6.283185307179586*i/(N-1)

  return a0 - a1 * Math.cos(f) + a2 * Math.cos(2*f)
}


module.exports = {
  clamp,
  normalize,
  floor,
  db2mag,
  mag2db,
  log10,
  blackman
}
