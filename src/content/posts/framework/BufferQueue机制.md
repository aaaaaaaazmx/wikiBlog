---
title: "BufferQueue机制"
published: 2020-12-10
description: "BufferQueue机制"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-016"
---

## BufferQueue机制
借用一张经典的图来描述BufferQueue的工作原理：

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrINI6lmCGmqtJYiaqicfGgMOSBWpnE1Bnur9O2HK6bz0rXXbjQKvU6XmLw/640?wx_fmt=png&from=appmsg)

BufferQueue是一个**典型的生产者-消费者模型中的数据结构**。在Android应用的渲染流程中，应用扮演的就是“生产者”的角色，而SurfaceFlinger扮演的则是“消费者”的角色，**其配合工作的流程如下**：

1. 应用进程中在开始界面的绘制渲染之前，需要通过Binder调用dequeueBuffer接口从SurfaceFlinger进程中管理的BufferQueue 中申请一张处于free状态的可用Buffer，如果此时没有可用Buffer则阻塞等待；

2. 应用进程中拿到这张可用的Buffer之后，选择使用CPU软件绘制渲染或GPU硬件加速绘制渲染，渲染完成后再通过Binder调用queueBuffer接口将缓存数据返回给应用进程对应的BufferQueue（如果是 GPU 渲染的话，这里还有个 GPU处理的过程，所以这个 Buffer 不会马上可用，需要等 GPU 渲染完成的Fence信号），并申请sf类型的Vsync以便唤醒“消费者”SurfaceFlinger进行消费；

3. SurfaceFlinger 在收到 Vsync 信号之后，开始准备合成，使用 acquireBuffer获取应用对应的 BufferQueue 中的 Buffer 并进行合成操作；

4. 合成结束后，SurfaceFlinger 将通过调用 releaseBuffer将 Buffer 置为可用的free状态，返回到应用对应的 BufferQueue中。

在 Android App 的渲染流程里面，App 就是个生产者(Producer) ，而 SurfaceFlinger 是一个消费者(Consumer)，所以上面的流程就可以翻译为

1. 当 **App** 需要 Buffer 时，它通过调用 dequeueBuffer（）并指定 Buffer 的宽度，高度，像素格式和使用标志，从 BufferQueue 请求释放 Buffer
2. **App** 可以用 cpu 进行渲染也可以调用用 gpu 来进行渲染，渲染完成后，通过调用 queueBuffer（）将缓冲区返回到 App 对应的 BufferQueue(如果是 gpu 渲染的话，这里还有个 gpu 处理的过程)
3. **SurfaceFlinger** 在收到 Vsync 信号之后，开始准备合成，使用 acquireBuffer（）获取 App 对应的 BufferQueue 中的 Buffer 并进行合成操作
4. 合成结束后，**SurfaceFlinger** 将通过调用 releaseBuffer（）将 Buffer 返回到 App 对应的 BufferQueue



