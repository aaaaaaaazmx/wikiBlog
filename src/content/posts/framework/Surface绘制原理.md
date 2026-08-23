---
title: "Surface绘制原理"
published: 2022-05-08
description: "Surface绘制原理"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-032"
---

# Surface绘制原理


**得讲清楚2个问题**

- surface绘制的buffer是怎么来的
- 绘制完的buffer是怎么提交的


surface绘制的buffer是怎么来的
```javascript
 private void performDraw() {
     draw(fullRedrawNeeded);
 }
 
  private void draw(boolean fullRedrawNeeded) {
      drawSoftware();
  }
  
 private boolean drawSoftware(Surface surface, AttachInfo attachInfo, int xoff, int yoff,
            boolean scalingRequired, Rect dirty) {
                //获取Canvas 就是buffer
                Canvas canvas = mSurface.lockCanvas(dirty);
                mView.draw(canvas);
                //提交 buffer
                surface.unlockCanvasAndPost(canvas);
            }
```
从上面看到 Canvas来自Surface.mCanvas，通过函数Surface.lockcanvas取得，
nativeLockcanvas 传入的mCanvas 里的 bimtap 是空的，调用完后才会有值，bitmap是sk库里的一个数据结构skBitmap，它是给mcanvas作为绘制缓冲区的。


**surface绘制的buffer是怎么来的?**

通过 GraphicBufferProducer 向bufferQueue 申请的,
Surface 里面有两个buffer，

- 一个是前台 buffer(mPostedBuffer)用来显示，
- 一个是后台 buffer(mLockedBuffer)用来绘制。

**buffer绘制完了又是怎么提交的?**
通过 GraphicBufferProducer 向bufferQueue 提交的，然后surfaceFliger会从BufferQueue中取出buffer给对应的consumer.

总结下：
当应用需要绘制ui的时候，需要利用surface去申请buffer，
> 这些buffer都存在BufferQueue里面，它是一个双端队列，

当应用得到buffer，将ui绘制到buffer后，再将buffer提交到Queue里面去，并且通知SurfaceFlinger去从Queue中去取buffer显示到屏幕上去，
SurfaceFlinger是buffer的唯一消费者。 
> 对于suface来说，GraphicBufferProducer是它的灵魂，buffer的申请和提交都是通过它来操作的，其中BufferQueue是用来存放buffer的


![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrIBibs9glpbRJ5cMLnQFbzdOlfvpfrvAuNjXOIEnK9vrTkzmtibSMb8EwQ/640?wx_fmt=png&from=appmsg)
