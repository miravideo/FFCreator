[English](./README.en.md) | [简体中文](./README.md)

<p align="center">
  <img width="650px" src="https://tnfe.github.io/FFCreator/_media/logo/logo.png" />
</p>

如果你还不知道FFCreator，请先参考原文档:  
[English](./FFCreator.md) | [简体中文](./FFCreator.zh-CN.md)


## 简介

`FFCreator`是一个很棒的项目，用js实现了视频的排版和烧制。但目前还有局限，比如没有**所见即所得的编辑功能**，排版难度高；以及任何对排版与样式的改动都需要写代码，也不利于分层与封装。

### 本项目对FFCreator的优化目标：
1. 封装JSON接口，标准化的视频描述；
2. 优化时长和排版的自适应能力，让模板对不同分辨率导出和不同尺寸、时长的源素材有更好的支持；
3. 发挥JS能在浏览器端执行的优势，让FFCreator不仅仅可以用在后端烧制上，也可以用在`前端预览和编辑`上，达到前后端一致的效果；
4. 加入更多的功能：滤镜、蒙版、动画等。

### 本项目不会涉及到的内容：
1. 前端播放器控件，请参见: [MiraPlayer](https://miravideo.github.io/mira-player) (即将开源)
2. 前端编辑器，请参见: MiraEditor (即将开源)

## 视频描述格式
采用JSON格式，树形结构描述的视频如下：
```javascript
const video_data = {
  "type": "canvas",
  "width": 1280,
  "height": 720,
  "children": [
    {
      "type": "video",
      "src": "/src/video1.mp4",
      "width": "100vw",
      "ss": 10,
      "to": 20,
    },
    {
      "type": "video",
      "src": "/src/video2.mp4",
      "height": "100vh",
    },
  ],
};
```
我们可以简单的把树形结构的节点想象为`HTML里的DOM节点`。   
每个节点都有`type`和`children`属性，以及节点类型所对应的属性。   
为了便于理解和编写测试，我们也引入了MiraML作为补充，上面的JSON等同于以下：
```xml
<miraml>
  <canvas width="1280" height="720">
    <video src="/src/video1.mp4" width="100vw" ss="10" to="20"></video>
    <video src="/src/video2.mp4" height="100vh"></video>
  </canvas>
</miraml>
```
引入树形结构的目的是：
1. 父子节点关系，可用于处理时间依赖
2. 与DOM节点逻辑类似，便于理解

详细的树形结构逻辑与节点属性列表，请参考：[视频描述文档](./JSONAPI.zh-CN.md)

## API示例

### 视频预览 Browser JS
```javascript

```

### 视频烧录 Node.js
```javascript
const { Factory } = require('ffcreator');
const { node: creator } = Factory.from(video_json);

creator.on('start', () => {
    console.log(`start`);
  }).on('error', e => {
    console.error("error", e);
  }).on('progress', e => {
    let number = e.percent || 0;
    console.log(`progress: ${(number * 100) >> 0}%`);
  }).on('complete', e => {
    console.log(`completed: ${e.output}`);
  }).generateOutput().start();
```


## 附加

基于FFCreator实现的前端播放器 [DEMO](https://miravideo.github.io/mira-player)

<p align="center">
  <img width="100%" src="https://miravideo.github.io/static/player.png" />
</p>

米拉视频提供云端烧录API（即将公开）

## 联系方式
遇到问题可以扫码加入微信群
<p align="center">
  <img width="200px" src="https://miravideo.github.io/static/contact_me_qr.png" />
</p>

## License

[MIT](./LICENSE)
