'use strict';

const { sleep } = require('./lib/utils/utils');
// const FFClip = require('./lib/core/clip');
// const FFScene = require('./lib/node/scene');

// const scene = new FFScene({});
// scene.parent = { startTime: 0, duration: NaN };

// const clip = new FFClip({});
// scene.addChild(clip);

// clip.conf.duration = 5;
// scene.annotate();
// console.log('--------');
// console.log(clip.startTime, clip.duration, clip.endTime);
// // console.log(scene.start);

const VideoHolder = require('./lib/utils/video');

const af = async (i) => {
    const vh = await VideoHolder.get('url', `hid-${i}`);
    console.log('xxxxxxx', i, vh.id);
    setTimeout(() => vh.release(), 100);
}

// for (let i = 0; i < 3; i++) {
//     af(0);
// }

const tt = async () => {
    for (let i = 0; i < 10; i++) {
        await af(i);
        await sleep(30);
    } 
}
tt();

// setTimeout(() => {
//     console.log('xxx');
// }, 1000);