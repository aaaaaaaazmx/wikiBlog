---
title: "SufaceFlinger工作机制"
published: 2023-10-19
description: "SufaceFlinger工作机制"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-029"
---

## SufaceFlinger工作机制
## 一、SurfaceFlinger的原理
SurfaceFlinger是Android系统中负责屏幕显示内容合成的服务，它接收来自多个应用程序和系统服务的图像缓冲区，根据它们的位置、大小、透明度、Z轴顺序等属性，将它们合成到一个最终的缓冲区中，然后发送到显示设备上。
## 二、SurfaceFlinger的作用
SurfaceFlinger的作用是将所有的Surface和其他层合成到屏幕上，形成最终的显示效果。
Surface是一个包含BufferQueue和SurfaceControl的对象
BufferQueue是一个缓冲区队列，用于存储图像数据
SurfaceControl是一个包含层元数据的对象，用于控制Surface的显示属性。
Surface可以由应用程序或者系统服务创建，例如WindowManager、MediaServer、CameraService等。
SurfaceFlinger会根据Surface的属性，将它们分为不同的类型，例如OVERLAY、SIDEBAND、SOLID_COLOR、CLIENT等。
SurfaceFlinger会尽可能地将Surface标记为OVERLAY类型，表示可以直接将Surface的缓冲区合成到屏幕上，而不需要经过SurfaceFlinger的处理。
如果Surface不能被标记为OVERLAY类型，那么它们就会被标记为CLIENT类型，表示需要由SurfaceFlinger来进行合成。
除了Surface之外，SurfaceFlinger还会合成其他的层，例如BootAnimation、Framebuffer、ColorLayer等。这些层的作用是显示一些特殊的内容，例如开机动画、截屏、色彩校正等。

## 三、SurfaceFlinger的架构
![](https://mmbiz.qpic.cn/mmbiz_jpg/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrIy3j6fzfEh2qt0BTXsqpkE8Y1k8dib8PkpmAcyCD7GCqVnmhYKnrl0tg/640?wx_fmt=webp&from=appmsg) 从上图可以看出，SurfaceFlinger的架构主要包含以下几个部分：

1. App和Service：这些是Surface的创建者，它们可以通过SurfaceHolder或者SurfaceTexture等方式来创建和操作Surface，例如设置Surface的大小、位置、透明度等属性，或者向Surface的BufferQueue中提交图像数据。
2. Surface：这是SurfaceFlinger的合成对象，它包含一个BufferQueue和一个SurfaceControl，BufferQueue用于存储图像数据，SurfaceControl用于控制Surface的显示属性。 Surface在创建时，会向SurfaceFlinger注册，让SurfaceFlinger知道它的存在，并根据它的属性来进行合成。
3. SurfaceFlinger：这是屏幕显示内容合成的服务，它包含一个Looper线程和一个EventThread线程 **Looper线程**用于接收和处理来自Binder的消息，例如创建、销毁、更新Surface等 **EventThread线程**用于接收和处理来自显示设备的VSYNC信号，VSYNC信号是一个垂直同步信号，表示显示设备可以接收新的缓冲区而不会产生撕裂现象。 **SurfaceFlinger**会在收到VSYNC信号后，触发一次合成操作。SurfaceFlinger还会与Hardware Composer进行通信，询问应该如何进行合成，Hardware Composer是一个硬件抽象层，用于利用硬件加速的方式来合成Surface，提高性能和节省电量。
4. Hardware Composer：这是一个硬件抽象层，用于利用硬件加速的方式来合成Surface，提高性能和节省电量。 Hardware Composer会根据Surface的属性，将它们分为不同的类型，例如OVERLAY、SIDEBAND、SOLID_COLOR、CLIENT等。 Hardware Composer会尽可能地将Surface标记为OVERLAY类型，表示可以直接将Surface的缓冲区合成到屏幕上，而不需要经过SurfaceFlinger的处理。 如果Surface不能被标记为OVERLAY类型，那么它们就会被标记为CLIENT类型，表示需要由SurfaceFlinger来进行合成。 Hardware Composer还会返回一个DisplayFrame，表示Surface在屏幕上的位置和大小。 Hardware Composer会将合成后的缓冲区发送到显示设备上，完成绘制流程。
5. Display：这是显示设备，用于展示合成后的缓冲区，形成最终的显示效果。 Display会向SurfaceFlinger发送VSYNC信号，表示可以接收新的缓冲区而不会产生撕裂现象。 Display还会向SurfaceFlinger反馈一些信息，例如显示设备的分辨率、刷新率、色彩空间等

下面一张图也可以反应SurfaceFlinger的

1. **EventControlThread**: 控制硬件vsync的开关
2. **DispSyncThread**: 软件产生vsync的线程
3. **SF EventThread**: 该线程用于SurfaceFlinger接收vsync信号用于渲染
4. **App EventThread**: 该线程用于接收vsync信号并且上报给App进程，App开始画图
- HW vsync, 真实由硬件产生的vsync信号
- SW vsync, 由DispSync产生的vsync信号
- vsync-sf, SF接收到的vsync信号
- vsync-app, App接收到的vsync信号
![](https://mmbiz.qpic.cn/mmbiz_jpg/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrIouOxwQaSmfXqjhNfubH7MJRs6j2ibqwQVrc8rS9S2jGGc5KO8ckznEg/640?wx_fmt=webp&from=appmsg)



