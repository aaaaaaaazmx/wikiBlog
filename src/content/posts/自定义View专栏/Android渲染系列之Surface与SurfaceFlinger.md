---
title: "Android渲染系列之Surface与SurfaceFlinger"
published: 2026-01-11
description: "Android渲染系列之Surface与SurfaceFlinger"
tags: ["自定义View","Android","UI"]
category: "自定义View专栏"
draft: false
slug: "custom-view-002"
---

# Android渲染系列之Surface与SurfaceFlinger
---

本文主要介绍在渲染中大家可能熟悉又陌生的概念Surface和SurfaceFlinger

## 背景

> 我们知道actvity对应一个window,window中有一个Surface

Android 图形架构使用了生产者——消费者模型。Surface 表示缓冲队列中的生产方，图像流最常见的消耗方是 SurfaceFlinger，该系统服务接收来自于多个源的数据缓冲区，组合它们，并将它们发送给显示设备。

Android 应用程序为了能够将自己的 UI 绘制在系统的帧缓冲区上，它们就必须要与 SurfaceFlinger 服务进行通信。SurfaceFlinger 服务运行在 Android 系统的 System 进程中，它负责管理 Android 系统的帧缓冲区（Frame Buffer）。

## Surface

### 了解Surface

app的每个actvity都对应一个window，每个windows需要surface来承载，任何View都要画在Surface的Canvas上。 图形的传递是通过Buffer作为载体，**Surface是对Buffer的进一步封装**，也就是说Surface内部具有多个Buffer供上层使用，如何管理这些Buffer呢? 请看下面这个模型

![Surface Buffer模型](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWAIklV9PKgzibQ0Hczl4jJnpWlRkpVufoyw7fXXvKniaUBOD9s75YheiaPwoNGydWWZjumL1JpLqMwA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=0)

Surface对应生产者代理对象，Surface(Native)对应生产者本地对象。那么流程就是：

- 上层app通过Surface获取buffer，供上层绘制，绘制过程通过Canvas来完成，(底层实现是skia引擎)
- 绘制完成后数据通过Surface被queue进BufferQueue,然后监听会通知SurfaceFlinger去消费buffer,
- 接着SurfaceFlinger就acquire数据拿去合成,合成完成后会将buffer release回BufferQueue。

如此循环，形成一个Buffer被循环使用的过程。

另外，这个过程Buffer有这么几个状态:

- Free: 可被上层使用
- Dequeued: 出列，正在被上层使用
- Queued: 入列，已完成上层绘制，等待SurfaceFlinger合成Acquired: 被获取，SurfaceFlinger正持有该Buffer进行合成

所以Surface主要干两件事:

1. **获取Canvas来干绘制的活**
2. **申请buffer，并把Canvas最终生产的图形、纹理数据放进去**

### Surface的创建

- 创建

Surface的创建其实跟window的创建是紧密相关的

![Surface创建流程](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWAIklV9PKgzibQ0Hczl4jJnwFeoLI81tsyBiaawO97ibj9HH5zLXekaHUyxSMMl0PHwKpZDjuicXJqgA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=1)

> 关注公众号 Android茶话会 更多精彩等你探索

Surface 创建的过程就是 Activity 显示的过程，在 ActivityThread.handleResumeActivity() 中调用了 Activity.makeVisible()，继而调用了wms创建surface

### 关于本地窗口(NativeWindow)

可能有的读者会感到困惑，一个系统设计一种本地窗口不就可以了吗?为什么需要两个甚至更多呢? 理论上我们的确可以只通过一个本地窗口来实现，如图所示。

![理想窗口系统](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWAIklV9PKgzibQ0Hczl4jJn7xoA6wdtOib1fDmGIOVicZHk07KZoZcWfK1bqKNgGfswL7bJ9b0xgBKw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=2)

上面这个窗口系统中，由 Native Window 来管理 Framebuffer。打个比方，**OpenGL 就像一台通用的打印机**一样，只要输入正确的指令，就能按照要求输出结果: 而**Native Window 则是"纸"**，它是用来承载 OpenGL 的输出结果的。**OpenGL 并不介意 Native Window 是 A4 或者 A6 纸**，甚至是塑料纸也没有关系，这些对它来说都只是"本地窗口"。

我们再来思考下，这种理想模型能否符合 Android 的要求。假如整个系统仅有一个需要显示UI 的程序，我们有理由相信它可以胜任。**但是如果有N个 UI 程序的情况会怎样呢**? 一个系统设备中显然只会有一个帧缓冲区 Framebufer，而按照"理想窗口系统"的设计，每个应用程序都需要各自使用和管理 Framebufer一-其结果就会像"幼儿园"的几个小朋友共用-块画板来涂鸦一样，可谓"五彩斑斓""创意无限"。那么该如何改进呢? 如下图所示

![改进的窗口系统](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWAIklV9PKgzibQ0Hczl4jJnwjSibrxeewUq9zc5hiaVhfHqlAuuC1Q5CRf1L48JY66vrxuvUtzZIGicA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=3)

- NativeWindows-2 面向App就是Surface 是跟WMS有着关联
- NativeWindows-1 属于**Framebuffer NativeWindow由**SurfaceFlinger管理

第一类窗口是能直接显示在终端屏幕上的一一它使用了帧缓冲区:而后一类本地窗口实际上是从内存缓冲区中分配的空间。 当系统中存在多个需要显示UI 的应用程序时，一方面这种改进设计保证了它们都能获得个"本地窗口"，另一方面这些"本地窗口"也都可以被有序地显示到终端屏幕上一一因为SurfaceFlinger 会收集所有程序的显示需求，对它们进行统一的图像混合操作，然后输出到自己的NativeWindow-1 上。

## SurfaceFlinger

SurfaceFlinger 是一个独立的Service，它**接收所有Surface作为输入**，创建layer (其主要的组件是一个 BufferQueue) 与Surface一一对应，根据ZOrder， 透明度，大小，位置等参数 计算出每个layer在最终合成图像中的位置，然后交由HWComposer或OpenGL生成最终的栅格化数据,放到layer的framebuffer上。

> Vsync-app 和 Vsync-sf，前者用于告诉 Choreographer，是时候协调 app 生产buffer了；后者用于告诉 SurfaceFlinger，是时候来消费buffer合成并显示到屏幕了。

这里直接上官方对于 SurfaceFlinger 的介绍

- 大多数应用在屏幕上一次显示三个层：**屏幕顶部的状态栏、底部或侧面的导航栏以及应用界面**。有些应用会拥有更多或更少的层（例如，默认主屏幕应用有一个单独的壁纸层，而全屏游戏可能会隐藏状态栏）。每个层都可以单独更新。状态栏和导航栏由系统进程渲染，而应用层由应用渲染，两者之间不进行协调。
- 设备显示会按一定速率刷新，在手机和平板电脑上通常为 60 fps。如果显示内容在刷新期间更新，则会出现撕裂现象；因此，请务必只在周期之间更新内容。在可以安全更新内容时，系统便会收到来自显示设备的信号。由于历史原因，我们将该信号称为 VSYNC 信号。
- 刷新率可能会随时间而变化，例如，一些移动设备的帧率范围在 58 fps 到 62 fps 之间，具体要视当前条件而定。对于连接了 HDMI 的电视，刷新率在理论上可以下降到 24 Hz 或 48 Hz，以便与视频相匹配。**由于每个刷新周期只能更新屏幕一次，因此以 200 fps 的帧率为显示设备提交缓冲区就是一种资源浪费**，因为大多数帧会被舍弃掉。**SurfaceFlinger 不会在应用每次提交缓冲区时都执行操作，而是在显示设备准备好接收新的缓冲区时才会唤醒。**
- 当 VSYNC 信号到达时，**SurfaceFlinger 会遍历它的层列表，以寻找新的缓冲区**。如果找到新的缓冲区，它会获取该缓冲区；否则，它会继续使用以前获取的缓冲区。**SurfaceFlinger 必须始终显示内容，因此它会保留一个缓冲区**。如果在某个层上没有提交缓冲区，则该层会被忽略。
- SurfaceFlinger 在**收集可见层的所有缓冲区**之后，便会**询问 Hardware Composer 应如何进行合成**。

下面是上述流程所对应的流程图， 简单地说， SurfaceFlinger 最主要的功能:**SurfaceFlinger 接受来自多个来源的数据缓冲区，对它们进行合成，然后发送到显示设备。**

![SurfaceFlinger流程](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWAIklV9PKgzibQ0Hczl4jJn2vRmxp9QjRO9BzicWQNIvqx1HPgw2uKDC2ZSeMqxNTviaksDJ5tFMQPw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=4)

> 其中App 部分主要负责生产 SurfaceFlinger 合成所需要的 Surface。

### Layer

Layer是SurfaceFlinger 进行合成的基本操作单元，其主要的组件是一个** BufferQueue**。Layer在应用请求创建Surface的时候在SurfaceFlinger内部创建，因此一个Surface对应一个 Layer。**Layer 其实是一个 FrameBuffer**，每个 FrameBuffer 中有两个 GraphicBuffer 记作 FrontBuffer和 BackBuffer。

### Hardware Composer

Hardware Composer HAL (HWC)在 Android 3.0 中被引入。它的主要目标是通过可用硬件确定组合缓冲区的最有效方式。

1. SurfaceFlinger 为 HWC 提供完整的 layers 的列表并询问，"你想要如何处理它?"
2. HWComposer根据硬件性能决定是使用硬件图层合成器还是GPU合成，分别将每个layer对应标记为 overlay 或 GLES composition 来进行响应。
3. SurfaceFlinger处理需要GPU合成的layers，将结果递交给HWComposer做显示(通过需要硬件图层合成器合成的layers由HWComposer自行处理(通过Hwcomposer HAL)，Hwcomposer HAL).
4. 合成Layer时，优先选用HWComposer，在HWComposer无法解决时，SurfaceFlinger采用默认的3D合成，也即调OpenGL标准接口，将各layer绘制到fb上。

**通常合成的方式有2种**

- 离线合成：

![离线合成](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWAIklV9PKgzibQ0Hczl4jJnibYic8TuCeTZvngfq0D4ib02L9C7YFia9zhic5zFTBibc0tR1TxshpnsQfLA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=5)

先将所有图层画到一个最终层 (FrameBuffer) 上，再将FrameBuffer送到LCD显示。由于合成FrameBuffer与送LCD显示一般是异步的 (线下生成FrameBuffer，需要时线上的LCD去取)因此叫离线合成。 毫无疑问，SurfaceFlinger采用默认的3D合成，也即调OpenGL标准接口将各layer绘制到fb上属于离线合成。

- 在线合成

![在线合成](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWAIklV9PKgzibQ0Hczl4jJnHHAKKUjk3yUoPoTe3QhZEQic5Ct3sg2GoQPhu76ZRVcyVVDwicXD6y8A/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=6)

不使用FrameBuffer，在LCD需要显示某一行的像素时，用显示控制器将所有图层与该行相关的数据取出，合成一行像素送过去。只有一个图层时，又叫Overlay技术。由于省去合成FrameBuffer时读图层，写FrameBuffer的步骤，大幅降低了内存传输量，减少了功耗，但这个需要硬件支持。毫无疑问，HWComposer合成属于在线合成。

### SurfaceFlinge启动过程

启动过程如下图所示

![SurfaceFlinger启动](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWAIklV9PKgzibQ0Hczl4jJnFqiakXUPrnfibTSlBk9Kd3G6748eX2ocowVjOFA5B9ByfgJic9SibYmcxQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=7)

可见SurfaceFlinger 进程是由 init 进程创建的，运行在独立的 SurfaceFlinger 进程中。init 进程读取 init.rc 文件启动 SurfaceFlinger。

## 小结

下面使用一张图来总结下今天的介绍

![总结图](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWAIklV9PKgzibQ0Hczl4jJnOCS6NoiaGYt8qnPaZA9XXAcSq3iaz2w4nz1UR4hvoefRoMsZSjYsvNmw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=8)

- 在 App 进程中创建 PhoneWindow 后会创建 ViewRoot。ViewRoot 的创建会创建一个 Surface，这个 Surface 其实是空的，通过与 WindowManagerService 通信 copyFrom() 一个 NativeSurface。

> 在与 SurfaceFlinger 通信时，会创建 SharedClient 一段共享内存，里面存放的是 SharedBufferStack 对应 SurfaceFlinger 中的 SurfaceLayer 每个 Layer 其实是一个 FrameBuffer，每个 FrameBuffer 中有两个 GraphicBuffer 记作 FrontBuffer 和 BackBuffer。

- 在 SurfaceFlinger 中 SharedBufferServer 来管理 FrameBuffer。同时在 App 端 copyFrom() 出来 NativeSurface 时会创建一个 SharedBufferClient 与 SharedClient 这块共享内存关联。当客户端 addView() 或者需要更新 View 时，会通过 SharedBufferClient 写入数据到 ShareClient 中，SurfaceFlinger 中的 SharedBufferServer 接收到通知会将 FrameBuffer 中的数据传输到屏幕上。
- HWComposer 是基于硬件来产生 VSync 信号的，来通知 SurfaceFlinger 重绘控制显示的帧率。

## 参考

- https://github.com/huanzhiyazi/articles/blob/master/技术/android/Android显示系统之——Surface和SurfaceFlinger/Android显示系统之——Surface和SurfaceFlinger.md#index
- https://www.jianshu.com/p/fcdd8f3bd448
- https://blog.csdn.net/freekiteyu/article/details/79483406
- https://www.androidperformance.com/2020/02/14/Android-Systrace-SurfaceFlinger/#/工作流程
