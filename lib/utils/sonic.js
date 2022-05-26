'use strict';

class Sonic {

  SONIC_MIN_PITCH = 65;
  SONIC_MAX_PITCH = 400;
  // This is used to down-sample some inputs to improve speed
  SONIC_AMDF_FREQ = 4000;
  // The number of points to use in the sinc FIR filter for resampling.
  SINC_FILTER_POINTS = 12;
  SINC_TABLE_SIZE = 601;
  
  // Lookup table for windowed sinc function of SINC_FILTER_POINTS points.
  sincTable = [
    0, 0, 0, 0, 0, 0, 0, -1, -1, -2, -2, -3, -4, -6, -7, -9, -10, -12, -14,
    -17, -19, -21, -24, -26, -29, -32, -34, -37, -40, -42, -44, -47, -48, -50,
    -51, -52, -53, -53, -53, -52, -50, -48, -46, -43, -39, -34, -29, -22, -16,
    -8, 0, 9, 19, 29, 41, 53, 65, 79, 92, 107, 121, 137, 152, 168, 184, 200,
    215, 231, 247, 262, 276, 291, 304, 317, 328, 339, 348, 357, 363, 369, 372,
    374, 375, 373, 369, 363, 355, 345, 332, 318, 300, 281, 259, 234, 208, 178,
    147, 113, 77, 39, 0, -41, -85, -130, -177, -225, -274, -324, -375, -426,
    -478, -530, -581, -632, -682, -731, -779, -825, -870, -912, -951, -989,
    -1023, -1053, -1080, -1104, -1123, -1138, -1149, -1154, -1155, -1151,
    -1141, -1125, -1105, -1078, -1046, -1007, -963, -913, -857, -796, -728,
    -655, -576, -492, -403, -309, -210, -107, 0, 111, 225, 342, 462, 584, 708,
    833, 958, 1084, 1209, 1333, 1455, 1575, 1693, 1807, 1916, 2022, 2122, 2216,
    2304, 2384, 2457, 2522, 2579, 2625, 2663, 2689, 2706, 2711, 2705, 2687,
    2657, 2614, 2559, 2491, 2411, 2317, 2211, 2092, 1960, 1815, 1658, 1489,
    1308, 1115, 912, 698, 474, 241, 0, -249, -506, -769, -1037, -1310, -1586,
    -1864, -2144, -2424, -2703, -2980, -3254, -3523, -3787, -4043, -4291,
    -4529, -4757, -4972, -5174, -5360, -5531, -5685, -5819, -5935, -6029,
    -6101, -6150, -6175, -6175, -6149, -6096, -6015, -5905, -5767, -5599,
    -5401, -5172, -4912, -4621, -4298, -3944, -3558, -3141, -2693, -2214,
    -1705, -1166, -597, 0, 625, 1277, 1955, 2658, 3386, 4135, 4906, 5697, 6506,
    7332, 8173, 9027, 9893, 10769, 11654, 12544, 13439, 14335, 15232, 16128,
    17019, 17904, 18782, 19649, 20504, 21345, 22170, 22977, 23763, 24527,
    25268, 25982, 26669, 27327, 27953, 28547, 29107, 29632, 30119, 30569,
    30979, 31349, 31678, 31964, 32208, 32408, 32565, 32677, 32744, 32767,
    32744, 32677, 32565, 32408, 32208, 31964, 31678, 31349, 30979, 30569,
    30119, 29632, 29107, 28547, 27953, 27327, 26669, 25982, 25268, 24527,
    23763, 22977, 22170, 21345, 20504, 19649, 18782, 17904, 17019, 16128,
    15232, 14335, 13439, 12544, 11654, 10769, 9893, 9027, 8173, 7332, 6506,
    5697, 4906, 4135, 3386, 2658, 1955, 1277, 625, 0, -597, -1166, -1705,
    -2214, -2693, -3141, -3558, -3944, -4298, -4621, -4912, -5172, -5401,
    -5599, -5767, -5905, -6015, -6096, -6149, -6175, -6175, -6150, -6101,
    -6029, -5935, -5819, -5685, -5531, -5360, -5174, -4972, -4757, -4529,
    -4291, -4043, -3787, -3523, -3254, -2980, -2703, -2424, -2144, -1864,
    -1586, -1310, -1037, -769, -506, -249, 0, 241, 474, 698, 912, 1115, 1308,
    1489, 1658, 1815, 1960, 2092, 2211, 2317, 2411, 2491, 2559, 2614, 2657,
    2687, 2705, 2711, 2706, 2689, 2663, 2625, 2579, 2522, 2457, 2384, 2304,
    2216, 2122, 2022, 1916, 1807, 1693, 1575, 1455, 1333, 1209, 1084, 958, 833,
    708, 584, 462, 342, 225, 111, 0, -107, -210, -309, -403, -492, -576, -655,
    -728, -796, -857, -913, -963, -1007, -1046, -1078, -1105, -1125, -1141,
    -1151, -1155, -1154, -1149, -1138, -1123, -1104, -1080, -1053, -1023, -989,
    -951, -912, -870, -825, -779, -731, -682, -632, -581, -530, -478, -426,
    -375, -324, -274, -225, -177, -130, -85, -41, 0, 39, 77, 113, 147, 178,
    208, 234, 259, 281, 300, 318, 332, 345, 355, 363, 369, 373, 375, 374, 372,
    369, 363, 357, 348, 339, 328, 317, 304, 291, 276, 262, 247, 231, 215, 200,
    184, 168, 152, 137, 121, 107, 92, 79, 65, 53, 41, 29, 19, 9, 0, -8, -16,
    -22, -29, -34, -39, -43, -46, -48, -50, -52, -53, -53, -53, -52, -51, -50,
    -48, -47, -44, -42, -40, -37, -34, -32, -29, -26, -24, -21, -19, -17, -14,
    -12, -10, -9, -7, -6, -4, -3, -2, -2, -1, -1, 0, 0, 0, 0, 0, 0, 0
  ];

  constructor(sampleRate, numChannels=1) {
    this.inputBuffer = null;
    this.outputBuffer = null;
    this.pitchBuffer;
    this.downSampleBuffer;
    this.numChannels = 0;
    this.inputBufferSize = 0;
    this.pitchBufferSize = 0;
    this.outputBufferSize = 0;
    this.numInputSamples = 0;
    this.numOutputSamples = 0;
    this.numPitchSamples = 0;
    this.minPeriod = 0;
    this.maxPeriod = 0;
    this.maxRequired = 0;
    this.remainingInputToCopy = 0;
    this.sampleRate = 0;
    this.prevPeriod = 0;
    this.prevMinDiff = 0;
    this.minDiff = 0;
    this.maxDiff = 0;

    this.allocateStreamBuffers(sampleRate, numChannels);
    this.speed = 1.0;
    this.pitch = 1.0;
    this.volume = 1.0;
    this.rate = 1.0;
    this.oldRatePosition = 0;
    this.newRatePosition = 0;
    this.useChordPitch = false;
    this.quality = 0;
  }

  arraycopy(src, srcPos, dest, destPos, len) {
    for (let i = 0; i < len; i++){
      dest[destPos + i] = src[srcPos + i];
    };
  }

  // Resize the array.
  resize(oldArray, newLength) {
    newLength *= this.numChannels;
    const newArray = new Int16Array(newLength);
    const length = oldArray.length <= newLength ? oldArray.length : newLength;
    this.arraycopy(oldArray, 0, newArray, 0, length);
    return newArray;
  }

  // Move samples from one array to another.  May move samples down within an array, but not up.
  move(dest, destPos, source, sourcePos, numSamples) {
    this.arraycopy(source, sourcePos * this.numChannels, dest, destPos * this.numChannels, numSamples * this.numChannels);
  }

  // Scale the samples by the factor.
  scaleSamples(samples, position, numSamples, volume) {
    const fixedPointVolume = Math.floor(volume * 4096.0);
    const start = position * this.numChannels;
    const stop = start + numSamples * this.numChannels;

    for (let xSample = start; xSample < stop; xSample++) {
      let value = (samples[xSample] * fixedPointVolume) >> 12;
      if (value > 32767) {
        value = 32767;
      } else if (value < -32767) {
        value = -32767;
      }
      samples[xSample] = value;
    }
  }

  // Get the speed of the stream.
  getSpeed() {
    return this.speed;
  }

  // Set the speed of the stream.
  setSpeed(speed_) {
    this.speed = speed_;
  }

  // Get the pitch of the stream.
  getPitch() {
    return this.pitch;
  }

  // Set the pitch of the stream.
  setPitch(pitch_) {
    this.pitch = pitch_;
  }

  // Get the rate of the stream.
  getRate() {
    return this.rate;
  }

  // Set the playback rate of the stream. This scales pitch and speed at the same time.
  setRate(rate_) {
    if (this.rate != rate_) {//允许任意设置
      this.rate = rate_;
      this.oldRatePosition = 0;
      this.newRatePosition = 0;
    }
  }

  // Get the vocal chord pitch setting.
  getChordPitch() {
    return this.useChordPitch;
  }

  // Set the vocal chord mode for pitch computation.  Default is off.
  setChordPitch(useChordPitch_) {
    this.useChordPitch = useChordPitch_;
  }

  // Get the quality setting.
  getQuality() {
    return this.quality;
  }

  // Set the "quality".  Default 0 is virtually as good as 1, but very much faster.
  setQuality(quality_) {
    this.quality = quality_;
  }

  // Get the scaling factor of the stream.
  getVolume() {
    return this.volume;
  }

  // Set the scaling factor of the stream.
  setVolume(volume_) {
    this.volume = volume_;
  }

  // Allocate stream buffers.
  allocateStreamBuffers(sampleRate_, numChannels_) {
    this.minPeriod = Math.floor(sampleRate_ / this.SONIC_MAX_PITCH);
    this.maxPeriod = Math.floor(sampleRate_ / this.SONIC_MIN_PITCH);
    this.maxRequired = 2 * this.maxPeriod;
    this.inputBufferSize = this.maxRequired;
    this.inputBuffer = new Int16Array(this.maxRequired * numChannels_);
    this.outputBufferSize = this.maxRequired;
    this.outputBuffer = new Int16Array(this.maxRequired * numChannels_);
    this.pitchBufferSize = this.maxRequired;
    this.pitchBuffer = new Int16Array(this.maxRequired * numChannels_);
    this.downSampleBuffer = new Int16Array(this.maxRequired);
    this.sampleRate = sampleRate_;
    this.numChannels = numChannels_;
    this.oldRatePosition = 0;
    this.newRatePosition = 0;
    this.prevPeriod = 0;
  }

  // Get the sample rate of the stream.
  getSampleRate() {
    return this.sampleRate;
  }

  // Set the sample rate of the stream.  This will cause samples buffered in the stream to be lost.
  setSampleRate(sampleRate) {
    this.allocateStreamBuffers(sampleRate, this.numChannels);
  }

  // Get the number of channels.
  getNumChannels() {
    return this.numChannels;
  }

  // Set the num channels of the stream.  This will cause samples buffered in the stream to be lost.
  setNumChannels(numChannels) {
    this.allocateStreamBuffers(this.sampleRate, numChannels);
  }

  // Enlarge the output buffer if needed.
  enlargeOutputBufferIfNeeded(numSamples) {
    if (this.numOutputSamples + numSamples > this.outputBufferSize) {
      this.outputBufferSize += (this.outputBufferSize >> 1) + numSamples;
      this.outputBuffer = this.resize(this.outputBuffer, this.outputBufferSize);
    }
  }

  // Enlarge the input buffer if needed.
  enlargeInputBufferIfNeeded(numSamples) {
    if (this.numInputSamples + numSamples > this.inputBufferSize) {
      this.inputBufferSize += (this.inputBufferSize >> 1) + numSamples;
      this.inputBuffer = this.resize(this.inputBuffer, this.inputBufferSize);
    }
  }

  // Add the input samples to the input buffer.
  addShortSamplesToInputBuffer(samples, numSamples) {
    if (numSamples == 0) return;
    this.enlargeInputBufferIfNeeded(numSamples);
    this.move(this.inputBuffer, this.numInputSamples, samples, 0, numSamples);
    this.numInputSamples += numSamples;
  }

  // Remove input samples that we have already processed.
  removeInputSamples(position) {
    const remainingSamples = this.numInputSamples - position;
    this.move(this.inputBuffer, 0, this.inputBuffer, position, remainingSamples);
    this.numInputSamples = remainingSamples;
  }

  // Just copy from the array to the output buffer
  copyToOutput(samples, position, numSamples) {
    this.enlargeOutputBufferIfNeeded(numSamples);
    this.move(this.outputBuffer, this.numOutputSamples, samples, position, numSamples);
    this.numOutputSamples += numSamples;
  }

  // Just copy from the input buffer to the output buffer.  Return num samples copied.
  copyInputToOutput(position) {
    const numSamples = Math.min(this.remainingInputToCopy, this.maxRequired);
    this.copyToOutput(this.inputBuffer, position, numSamples);
    this.remainingInputToCopy -= numSamples;
    return numSamples;
  }

  // Read short data out of the stream.  Sometimes no data will be available, and zero
  // is returned, which is not an error condition.
  readShortFromStream() {//已改成直接返回所有的Int16Array
    const numSamples = this.numOutputSamples;
    const samples = new Int16Array(numSamples);
    const remainingSamples = 0;
    if (numSamples == 0) return samples;
    this.move(samples, 0, this.outputBuffer, 0, numSamples);
    this.move(this.outputBuffer, 0, this.outputBuffer, numSamples, remainingSamples);
    this.numOutputSamples = remainingSamples;
    return samples;
  }

  // Force the sonic stream to generate output using whatever data it currently
  // has.  No extra delay will be added to the output, but flushing in the middle of
  // words could introduce distortion.
  flushStream() {
    var remainingSamples = this.numInputSamples;
    var s = this.speed / this.pitch;
    var r = this.rate * this.pitch;
    var expectedOutputSamples = Math.floor(this.numOutputSamples + Math.floor((remainingSamples / s + this.numPitchSamples) / r + 0.5));

    // Add enough silence to flush both input and pitch buffers.
    this.enlargeInputBufferIfNeeded(remainingSamples + 2 * this.maxRequired);
    for (var xSample = 0; xSample < 2 * this.maxRequired * this.numChannels; xSample++) {
      this.inputBuffer[remainingSamples * this.numChannels + xSample] = 0;
    }
    this.numInputSamples += 2 * this.maxRequired;
    this.writeShortToStream(null, 0);
    // Throw away any extra samples we generated due to the silence we added.
    if (this.numOutputSamples > expectedOutputSamples) {
      this.numOutputSamples = expectedOutputSamples;
    }
    // Empty input and pitch buffers.
    this.numInputSamples = 0;
    this.remainingInputToCopy = 0;
    this.numPitchSamples = 0;
  }

  // Return the number of samples in the output buffer
  samplesAvailable() {
    return this.numOutputSamples;
  }

  // If skip is greater than one, average skip samples together and write them to
  // the down-sample buffer.  If numChannels is greater than one, mix the channels
  // together as we down sample.
  downSampleInput(samples, position, skip) {
    var numSamples = Math.floor(this.maxRequired / skip);
    var samplesPerValue = this.numChannels * skip;
    var value;

    position *= this.numChannels;
    for (var i = 0; i < numSamples; i++) {
      value = 0;
      for (var j = 0; j < samplesPerValue; j++) {
        value += samples[position + i * samplesPerValue + j];
      }
      value = Math.floor(value / samplesPerValue);
      this.downSampleBuffer[i] = value;
    }
  }

  // Find the best frequency match in the range, and given a sample skip multiple.
  // For now, just find the pitch of the first channel.
  findPitchPeriodInRange(samples, position, minPeriod, maxPeriod) {
    var bestPeriod = 0, worstPeriod = 255;
    var minDiff_ = 1, maxDiff_ = 0;

    position *= this.numChannels;
    for (var period = minPeriod; period <= maxPeriod; period++) {
      var diff = 0;
      for (var i = 0; i < period; i++) {
        var sVal = samples[position + i];
        var pVal = samples[position + period + i];
        diff += sVal >= pVal ? sVal - pVal : pVal - sVal;
      }
      /* Note that the highest number of samples we add into diff will be less
        than 256, since we skip samples.  Thus, diff is a 24 bit number, and
        we can safely multiply by numSamples without overflow */
      if (diff * bestPeriod < minDiff_ * period) {
        minDiff_ = diff;
        bestPeriod = period;
      }
      if (diff * worstPeriod > maxDiff_ * period) {
        maxDiff_ = diff;
        worstPeriod = period;
      }
    }
    this.minDiff = Math.floor(minDiff_ / bestPeriod);
    this.maxDiff = Math.floor(maxDiff_ / worstPeriod);

    return bestPeriod;
  }

  // At abrupt ends of voiced words, we can have pitch periods that are better
  // approximated by the previous pitch period estimate.  Try to detect this case.
  prevPeriodBetter(minDiff, maxDiff, preferNewPeriod) {
    if (minDiff == 0 || this.prevPeriod == 0) {
      return false;
    }
    if (preferNewPeriod) {
      if (maxDiff > minDiff * 3) {
        // Got a reasonable match this period
        return false;
      }
      if (minDiff * 2 <= this.prevMinDiff * 3) {
        // Mismatch is not that much greater this period
        return false;
      }
    } else {
      if (minDiff <= this.prevMinDiff) {
        return false;
      }
    }
    return true;
  }

  // Find the pitch period.  This is a critical step, and we may have to try
  // multiple ways to get a good answer.  This version uses AMDF.  To improve
  // speed, we down sample by an integer factor get in the 11KHz range, and then
  // do it again with a narrower frequency range without down sampling
  findPitchPeriod(samples, position, preferNewPeriod) {
    var period, retPeriod;
    var skip = 1;

    if (this.sampleRate > this.SONIC_AMDF_FREQ && this.quality == 0) {
      skip = Math.floor(this.sampleRate / this.SONIC_AMDF_FREQ);
    }
    if (this.numChannels == 1 && skip == 1) {
      period = this.findPitchPeriodInRange(samples, position, this.minPeriod, this.maxPeriod);
    } else {
      this.downSampleInput(samples, position, skip);
      period = this.findPitchPeriodInRange(this.downSampleBuffer, 0, Math.floor(this.minPeriod / skip), Math.floor(this.maxPeriod / skip));
      if (skip != 1) {
        period *= skip;
        var minP = period - (skip << 2);
        var maxP = period + (skip << 2);
        if (minP < this.minPeriod) {
          minP = this.minPeriod;
        }
        if (maxP > this.maxPeriod) {
          maxP = this.maxPeriod;
        }
        if (this.numChannels == 1) {
          period = this.findPitchPeriodInRange(samples, position, minP, maxP);
        } else {
          this.downSampleInput(samples, position, 1);
          period = this.findPitchPeriodInRange(this.downSampleBuffer, 0, minP, maxP);
        }
      }
    }
    if (this.prevPeriodBetter(this.minDiff, this.maxDiff, preferNewPeriod)) {
      retPeriod = this.prevPeriod;
    } else {
      retPeriod = period;
    }
    this.prevMinDiff = this.minDiff;
    this.prevPeriod = period;
    return retPeriod;
  }

  // Overlap two sound segments, ramp the volume of one down, while ramping the
  // other one from zero up, and add them, storing the result at the output.
  overlapAdd(numSamples, numChannels, out, outPos, rampDown, rampDownPos, rampUp, rampUpPos) {
    for (var i = 0; i < numChannels; i++) {
      var o = outPos * numChannels + i;
      var u = rampUpPos * numChannels + i;
      var d = rampDownPos * numChannels + i;
      for (var t = 0; t < numSamples; t++) {
        out[o] = Math.floor((rampDown[d] * (numSamples - t) + rampUp[u] * t) / numSamples);
        o += numChannels;
        d += numChannels;
        u += numChannels;
      }
    }
  }

  // Overlap two sound segments, ramp the volume of one down, while ramping the
  // other one from zero up, and add them, storing the result at the output.
  overlapAddWithSeparation(numSamples, numChannels, separation, out, outPos, rampDown, rampDownPos, rampUp, rampUpPos) {
    for (var i = 0; i < numChannels; i++) {
      var o = outPos * numChannels + i;
      var u = rampUpPos * numChannels + i;
      var d = rampDownPos * numChannels + i;
      for (var t = 0; t < numSamples + separation; t++) {
        if (t < separation) {
          out[o] = Math.floor(rampDown[d] * (numSamples - t) / numSamples);
          d += numChannels;
        } else if (t < numSamples) {
          out[o] = Math.floor((rampDown[d] * (numSamples - t) + rampUp[u] * (t - separation)) / numSamples);
          d += numChannels;
          u += numChannels;
        } else {
          out[o] = Math.floor(rampUp[u] * (t - separation) / numSamples);
          u += numChannels;
        }
        o += numChannels;
      }
    }
  }

  // Just move the new samples in the output buffer to the pitch buffer
  moveNewSamplesToPitchBuffer(originalNumOutputSamples) {
    var numSamples = this.numOutputSamples - originalNumOutputSamples;

    if (this.numPitchSamples + numSamples > this.pitchBufferSize) {
      this.pitchBufferSize += (this.pitchBufferSize >> 1) + numSamples;
      this.pitchBuffer = this.resize(this.pitchBuffer, this.pitchBufferSize);
    }
    this.move(this.pitchBuffer, this.numPitchSamples, this.outputBuffer, originalNumOutputSamples, numSamples);
    this.numOutputSamples = originalNumOutputSamples;
    this.numPitchSamples += numSamples;
  }

  // Remove processed samples from the pitch buffer.
  removePitchSamples(numSamples) {
    if (numSamples == 0) {
      return;
    }
    this.move(this.pitchBuffer, 0, this.pitchBuffer, numSamples, this.numPitchSamples - numSamples);
    this.numPitchSamples -= numSamples;
  }

  // Change the pitch.  The latency this introduces could be reduced by looking at
  // past samples to determine pitch, rather than future.
  adjustPitch(originalNumOutputSamples) {
    var period, newPeriod, separation;
    var position = 0;

    if (this.numOutputSamples == originalNumOutputSamples) {
      return;
    }
    this.moveNewSamplesToPitchBuffer(originalNumOutputSamples);
    while (this.numPitchSamples - position >= this.maxRequired) {
      period = this.findPitchPeriod(this.pitchBuffer, position, false);
      newPeriod = Math.floor(period / this.pitch);
      this.enlargeOutputBufferIfNeeded(newPeriod);
      if (this.pitch >= 1.0) {
        this.overlapAdd(newPeriod, this.numChannels, this.outputBuffer, this.numOutputSamples, this.pitchBuffer,
          position, this.pitchBuffer, position + period - newPeriod);
      } else {
        separation = newPeriod - period;
        this.overlapAddWithSeparation(period, this.numChannels, separation, this.outputBuffer, this.numOutputSamples,
          this.pitchBuffer, position, this.pitchBuffer, position);
      }
      this.numOutputSamples += newPeriod;
      position += period;
    }
    this.removePitchSamples(position);
  }

  // Aproximate the sinc function times a Hann window from the sinc table.
  findSincCoefficient(i, ratio, width) {
    var lobePoints = Math.floor((this.SINC_TABLE_SIZE - 1) / this.SINC_FILTER_POINTS);
    var left = Math.floor(i * lobePoints + (ratio * lobePoints) / width);
    var right = left + 1;
    var position = i * lobePoints * width + ratio * lobePoints - left * width;
    var leftVal = this.sincTable[left];
    var rightVal = this.sincTable[right];

    return Math.floor(((leftVal * (width - position) + rightVal * position) << 1) / width);
  }

  // Return 1 if value >= 0, else -1.  This represents the sign of value.
  getSign(value) {
    return value >= 0 ? 1 : -1;
  }

  // Interpolate the new output sample.
  interpolate(in_,
    inPos,  // Index to first sample which already includes channel offset.
    oldSampleRate, newSampleRate) {
    // Compute N-point sinc FIR-filter here.  Clip rather than overflow.
    var i;
    var total = 0;
    var position = this.newRatePosition * oldSampleRate;
    var leftPosition = this.oldRatePosition * newSampleRate;
    var rightPosition = (this.oldRatePosition + 1) * newSampleRate;
    var ratio = rightPosition - position - 1;
    var width = rightPosition - leftPosition;
    var weight, value;
    var oldSign;
    var overflowCount = 0;

    for (i = 0; i < this.SINC_FILTER_POINTS; i++) {
      weight = this.findSincCoefficient(i, ratio, width);
      /* printf("%u %f\n", i, weight); */
      value = in_[inPos + i * this.numChannels] * weight;
      oldSign = this.getSign(total);
      total += value;
      if (oldSign != this.getSign(total) && this.getSign(value) == oldSign) {
        /* We must have overflowed.  This can happen with a sinc filter. */
        overflowCount += oldSign;
      }
    }
    /* It is better to clip than to wrap if there was a overflow. */
    if (overflowCount > 0) {
      return 0x7FFF;
    } else if (overflowCount < 0) {
      return -0x8000;
    }
    return (total >> 16) & 0xffff;
  }

  // Change the rate.
  adjustRate(rate, originalNumOutputSamples) {
    var newSampleRate = Math.floor(this.sampleRate / rate);
    var oldSampleRate = this.sampleRate;
    var position;

    // Set these values to help with the integer math
    while (newSampleRate > (1 << 14) || oldSampleRate > (1 << 14)) {
      newSampleRate >>= 1;
      oldSampleRate >>= 1;
    }
    if (this.numOutputSamples == originalNumOutputSamples) {
      return;
    }
    this.moveNewSamplesToPitchBuffer(originalNumOutputSamples);
    // Leave at least one pitch sample in the buffer
    for (position = 0; position < this.numPitchSamples - 1; position++) {
      while ((this.oldRatePosition + 1) * newSampleRate > this.newRatePosition * oldSampleRate) {
        this.enlargeOutputBufferIfNeeded(1);
        for (var i = 0; i < this.numChannels; i++) {
          this.outputBuffer[this.numOutputSamples * this.numChannels + i] = this.interpolate(this.pitchBuffer,
            position * this.numChannels + i, oldSampleRate, newSampleRate);
        }
        this.newRatePosition++;
        this.numOutputSamples++;
      }
      this.oldRatePosition++;
      if (this.oldRatePosition == oldSampleRate) {
        this.oldRatePosition = 0;
        if (this.newRatePosition != newSampleRate) {
          throw new Error("Assertion failed: newRatePosition != newSampleRate\n");
          //assert false;
        }
        this.newRatePosition = 0;
      }
    }
    this.removePitchSamples(position);
  }


  // Skip over a pitch period, and copy period/speed samples to the output
  skipPitchPeriod(samples, position, speed, period) {
    var newSamples;

    if (speed >= 2.0) {
      newSamples = Math.floor(period / (speed - 1.0));
    } else {
      newSamples = period;
      this.remainingInputToCopy = Math.floor(period * (2.0 - speed) / (speed - 1.0));
    }
    this.enlargeOutputBufferIfNeeded(newSamples);
    this.overlapAdd(newSamples, this.numChannels, this.outputBuffer, this.numOutputSamples, samples, position,
      samples, position + period);
      this.numOutputSamples += newSamples;
    return newSamples;
  }

  // Insert a pitch period, and determine how much input to copy directly.
  insertPitchPeriod(samples, position, speed, period) {
    var newSamples;

    if (speed < 0.5) {
      newSamples = Math.floor(period * speed / (1.0 - speed));
    } else {
      newSamples = period;
      this.remainingInputToCopy = Math.floor(period * (2.0 * speed - 1.0) / (1.0 - speed));
    }
    this.enlargeOutputBufferIfNeeded(period + newSamples);
    this.move(this.outputBuffer, this.numOutputSamples, samples, position, period);
    this.overlapAdd(newSamples, this.numChannels, this.outputBuffer, this.numOutputSamples + period, samples,
      position + period, samples, position);
    this.numOutputSamples += period + newSamples;
    return newSamples;
  }

  // Resample as many pitch periods as we have buffered on the input.  Return 0 if
  // we fail to resize an input or output buffer.  Also scale the output by the volume.
  changeSpeed(speed) {
    var numSamples = this.numInputSamples;
    var position = 0, period, newSamples;

    if (this.numInputSamples < this.maxRequired) return;
    do {
      if (this.remainingInputToCopy > 0) {
        newSamples = this.copyInputToOutput(position);
        position += newSamples;
      } else {
        period = this.findPitchPeriod(this.inputBuffer, position, true);
        if (speed > 1.0) {
          newSamples = this.skipPitchPeriod(this.inputBuffer, position, speed, period);
          position += period + newSamples;
        } else {
          newSamples = this.insertPitchPeriod(this.inputBuffer, position, speed, period);
          position += newSamples;
        }
      }
    } while (position + this.maxRequired <= numSamples);
    this.removeInputSamples(position);
  }

  // Resample as many pitch periods as we have buffered on the input.  Scale the output by the volume.
  processStreamInput() {
    const originalNumOutputSamples = this.numOutputSamples;
    const s = this.speed / this.pitch;

    let r = this.rate;
    if (!this.useChordPitch) r *= this.pitch;

    if (s > 1.00001 || s < 0.99999) {
      this.changeSpeed(s);
    } else {
      this.copyToOutput(this.inputBuffer, 0, this.numInputSamples);
      this.numInputSamples = 0;
    }
    if (this.useChordPitch) {
      if (this.pitch != 1.0) {
        this.adjustPitch(originalNumOutputSamples);
      }
    } else if (r != 1.0) {
      this.adjustRate(r, originalNumOutputSamples);
    }
    if (this.volume != 1.0) {
      // Adjust output volume.
      this.scaleSamples(this.outputBuffer, originalNumOutputSamples, this.numOutputSamples - originalNumOutputSamples, this.volume);
    }
  }

  // Write the data to the input stream, and process it.
  writeShortToStream(samples) {
    this.addShortSamplesToInputBuffer(samples, samples ? samples.length : 0);
    this.processStreamInput();
  }
}

module.exports = Sonic;