const FFAudio = require('@/audio/audio');
const FFClip = require('@/core/clip');
const Material = require('@/material/material');

describe('time/audio', () => {
  test('audio: default start/duration/end with loop default false', () => {
    const audio = new FFAudio({});
    audio.material = { getDuration: () => 3 };
    audio.parent = { startTime: 0, duration: 10 }
    expect(audio.startTime).toBe(0);
    expect(audio.duration).toBe(3);
    expect(audio.endTime).toBe(3);

    audio.material = { getDuration: () => 13 };
    expect(audio.duration).toBe(13);
    expect(audio.endTime).toBe(13);

    audio.prevSibling = { endTime: 5 };
    expect(audio.startTime).toBe(5);
    expect(audio.duration).toBe(13);
    expect(audio.endTime).toBe(18);

    audio.conf.start = 6;
    expect(audio.startTime).toBe(6);
    expect(audio.duration).toBe(13);
    expect(audio.endTime).toBe(19);

    audio.conf.duration = 5;
    expect(audio.startTime).toBe(6);
    expect(audio.duration).toBe(5);
    expect(audio.endTime).toBe(11);
  });

  test('audio: default start/duration/end with loop set true', () => {
    const audio = new FFAudio({ loop: true });
    audio.material = { getDuration: () => 3 };
    audio.parent = { startTime: 0, duration: 10 }
    expect(audio.startTime).toBe(0);
    expect(audio.duration).toBe(10);
    expect(audio.endTime).toBe(10);

    audio.material = { getDuration: () => 13 };
    expect(audio.duration).toBe(10);
    expect(audio.endTime).toBe(10);

    audio.prevSibling = { endTime: 6 };
    expect(audio.startTime).toBe(6);
    expect(audio.duration).toBe(4);
    expect(audio.endTime).toBe(10);

    audio.conf.start = 3;
    expect(audio.startTime).toBe(3);
    expect(audio.duration).toBe(7);
    expect(audio.endTime).toBe(10);

    audio.conf.duration = 5;
    expect(audio.startTime).toBe(3);
    expect(audio.duration).toBe(5);
    expect(audio.endTime).toBe(8);
  });

  test('audio: set duration over material length', () => {
    const audio = new FFAudio({ duration: 10 });
    audio.material = { getDuration: () => 6 };
    audio.parent = { startTime: 0, duration: NaN };
    expect(audio.duration).toBe(10);

    const clip = new FFClip({ start: -4 });
    audio.addChild(clip);
    expect(clip.startTime).toBe(-4);
    expect(clip.duration).toBe(14);
    expect(clip.endTime).toBe(10);
  });

  test('audio: set duration with ss/to', () => {
    const audio = new FFAudio({});
    audio.material = new Material({ ss: 2, to: 8 });
    audio.material.length = 10;
    audio.parent = { startTime: 0, duration: 5 };
    expect(audio.speed).toBe(1);
    expect(audio.pitch).toBe(1);
    expect(audio.material.getStartOffset()).toBe(2);
    expect(audio.material.getDuration()).toBe(6);
    expect(audio.duration).toBe(6);

    audio.conf.duration = '100%';
    expect(audio.duration).toBe(5);

    audio.material.duration = audio.duration;
    expect(audio.material.getDuration()).toBe(6);
    expect(audio.material.getDuration(true)).toBe(5);
  });

});