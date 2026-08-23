---
title: "Triple Buffer 的由来以及作用"
published: 2020-01-30
description: "Triple Buffer 的由来以及作用"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-035"
---


# Triple Buffer 的由来以及作用

Triple Buffer 中，我们又加入了一个 BackBuffer ，这样的话 BufferQueue 里面就有三个 Buffer 可以轮转了，当 FrontBuffer 在被使用的时候，App 有两个空闲的 Buffer 可以拿去生产，就算生产过程中有 GPU 超时，CPU 任然可以拿到新的 Buffer 进行生产(**即 SurfaceFling 消费 FrontBuffer，GPU 使用一个 BackBuffer，CPU使用一个 BackBuffer**)
[![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrIic6rtaxKAgzEzt6BFVYRoglmyiaA5zPricpyWcBmapOlicboYKQiaxyLvdg/640?wx_fmt=png&from=appmsg)

下面就是引入 Triple Buffer 之后，解决了 Double Buffer 中遇到的由于 Buffer 不足引起的掉帧问题
[![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrI3rRzDaJu2ZxZe6iaWVMddc7cxWgO8QJiajd0hm2KGMs3U8qpJlyEbUBQ/640?wx_fmt=png&from=appmsg)
这里把两个图放到一起来看，方便大家做对比（一个是 Double Buffer 掉帧两次，一个是使用 Triple Buffer 只掉了一帧）

[![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrIc4Q3u24wg8cVfUDNhkU47j51Yk1CdI6T9m2mIU0JsAAboTAhvuia0tw/640?wx_fmt=png&from=appmsg)](https://androidperformance.com/images/TripleBuffer_VS_DoubleBuffer.png)
# Triple Buffer 的作用
## 缓解掉帧
从上一节 Double Buffer 和 Triple Buffer 的对比图可以看到，在这种情况下（出现连续主线程超时），三个 Buffer 的轮转有助于缓解掉帧出现的次数（从掉帧两次 -> 只掉帧一次）
## 减少主线程和渲染线程等待时间
**双 Buffer 的轮转**， App 主线程有时候必须要等待 SurfaceFlinger(消费者)释放 Buffer 后，才能获取 Buffer 进行生产，这时候就有个问题，现在大部分手机 SurfaceFlinger 和 App 同时收到 Vsync 信号，如果出现App 主线程等待 SurfaceFlinger(消费者)释放 Buffer ，那么势必会让 App 主线程的执行时间延后，比如下面这张图，可以明显看到：**Buffer B 并不是在 Vsync 信号来的时候开始被消费(因为还在使用)，而是等 Buffer A 被消费后，Buffer B 被释放，App 才能拿到 Buffer B 进行生产，这期间就有一定的延迟，会让主线程可用的时间变短**
[![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrIYCceUmMthvACnYrJib11NEehIEJN8fe1HQTfr53BTlYvTS0MFrbJKaA/640?wx_fmt=png&from=appmsg)](https://androidperformance.com/images/15764247531355.jpg)
而 三个 Buffer 轮转的情况下，则基本不会有这种情况的发生，渲染线程一般在 dequeueBuffer 的时候，都可以顺利拿到可用的 Buffer （当然如果 dequeueBuffer 本身耗时那就不是这里的讨论范围了
