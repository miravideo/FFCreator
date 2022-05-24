const FFVideo = require('@/node/video');
const FFClip = require('@/core/clip');

describe('time/video', () => {
  test('video: default start/duration/end with loop default false', () => {
    const video = new FFVideo({});
    video.material = { getDuration: () => 3 };
    video.parent = { startTime: 0, duration: 10 }
    expect(video.startTime).toBe(0);
    expect(video.duration).toBe(3);
    expect(video.endTime).toBe(3);

    video.material = { getDuration: () => 13 };
    expect(video.duration).toBe(13);
    expect(video.endTime).toBe(13);

    video.prevSibling = { endTime: 5 };
    expect(video.startTime).toBe(5);
    expect(video.duration).toBe(13);
    expect(video.endTime).toBe(18);

    video.conf.start = 6;
    expect(video.startTime).toBe(6);
    expect(video.duration).toBe(13);
    expect(video.endTime).toBe(19);

    video.conf.duration = 5;
    expect(video.startTime).toBe(6);
    expect(video.duration).toBe(5);
    expect(video.endTime).toBe(11);
  });

  test('video: default start/duration/end with loop set true', () => {
    const video = new FFVideo({ loop: true });
    video.material = { getDuration: () => 3 };
    video.parent = { startTime: 0, duration: 10 }
    expect(video.startTime).toBe(0);
    expect(video.duration).toBe(10);
    expect(video.endTime).toBe(10);

    video.material.length = 13;
    expect(video.duration).toBe(10);
    expect(video.endTime).toBe(10);

    video.prevSibling = { endTime: 6 };
    expect(video.startTime).toBe(6);
    expect(video.duration).toBe(4);
    expect(video.endTime).toBe(10);

    video.conf.start = 3;
    expect(video.startTime).toBe(3);
    expect(video.duration).toBe(7);
    expect(video.endTime).toBe(10);

    video.conf.duration = 5;
    expect(video.startTime).toBe(3);
    expect(video.duration).toBe(5);
    expect(video.endTime).toBe(8);
  });

  test('video: set duration over material length', () => {
    const video = new FFVideo({ duration: 10 });
    video.material = { getDuration: () => 6 };
    video.parent = { startTime: 0, duration: NaN };
    expect(video.duration).toBe(10);

    const clip = new FFClip({ start: -4 });
    video.addChild(clip);
    expect(clip.startTime).toBe(-4);
    expect(clip.duration).toBe(14);
    expect(clip.endTime).toBe(10);
  });
});

const VideoMaterial = require('@/material/video');
describe('time/video-material', () => {
  test('video material ss/to', () => {
    const mat = new VideoMaterial({ ss: 3, to: 5 });
    mat.duration = 3;
    expect(mat.getStartOffset()).toBe(3);
    expect(mat.getEndOffset()).toBe(5);
    expect(mat.getEndOffset(true)).toBe(5);
    expect(mat.getDuration()).toBe(2);

    mat.length = 4.5;
    expect(mat.getEndOffset()).toBe(4.5);
    expect(mat.getDuration()).toBe(1.5);

    // 参数 withConainer = true 会计算外部容器duration的影响
    mat.duration = 1;
    expect(mat.getEndOffset()).toBe(4.5);
    expect(mat.getEndOffset(true)).toBe(4);
    expect(mat.getDuration()).toBe(1.5);
    expect(mat.getDuration(true)).toBe(1);
  });

  test('video material speed', () => {
    const mat = new VideoMaterial({ ss: 3, to: 9, speed: 3 });
    mat.duration = 3;
    mat.length = 10;
    expect(mat.getStartOffset()).toBe(3);
    expect(mat.getEndOffset()).toBe(9);
    expect(mat.getEndOffset(true)).toBe(9);
    expect(mat.getDuration()).toBe(2);
    expect(mat.getDuration(true)).toBe(2);

    mat.speed = 2;
    mat.duration = 2.5;
    expect(mat.getEndOffset()).toBe(9);
    expect(mat.getEndOffset(true)).toBe(8); // 3 + (2.5 * 2) = 8
    expect(mat.getDuration()).toBe(3);
    expect(mat.getDuration(true)).toBe(2.5);
    expect(mat.seekTime(1)).toBe(5);
    expect(mat.seekTime(5)).toBe(9);
    expect(mat.seekTime(10)).toBe(9);
  });

  test('video material default value', () => {
    const mat = new VideoMaterial({ speed: 2 });
    mat.duration = 3;
    mat.length = 12;
    expect(mat.getStartOffset()).toBe(0);
    expect(mat.getEndOffset()).toBe(12);
    expect(mat.getEndOffset(true)).toBe(6);
    expect(mat.getDuration()).toBe(6);
    expect(mat.getDuration(true)).toBe(3);
    expect(mat.seekTime(1)).toBe(2);
    expect(mat.seekTime(5)).toBe(10);
    expect(mat.seekTime(10)).toBe(12);
  });

  test('video material with loop', () => {
    const video = new FFVideo({ loop: true });
    video.parent = { absStartTime: 0 };
    const mat = new VideoMaterial({ ss: 3, to: 9, speed: 2, loop: true });
    video.material = mat;
    mat.duration = 10;
    mat.length = 12;
    expect(mat.getStartOffset()).toBe(3);
    expect(mat.getEndOffset()).toBe(9);
    expect(mat.getEndOffset(true)).toBe(9);
    expect(mat.getDuration()).toBe(3);
    expect(mat.getDuration(true)).toBe(3);
    expect(mat.seekTime(1)).toBe(5); // 3 + (1 * 2)
    expect(mat.seekTime(5)).toBe(9); // max 9
    expect(video.materialTime(5).time).toBe(2); // 5 % 3 = 2
    expect(video.materialTime(5, true).time).toBe(7); // 3 + (2 * (5 % 3))
    expect(video.materialTime(10).time).toBe(1); // 10 % 3 = 1
    expect(video.materialTime(10, true).time).toBe(5); // 3 + (2 * (10 % 3))
    expect(video.materialTime(10, true).loops).toBe(3); // floor(10 / 3)
  });
});