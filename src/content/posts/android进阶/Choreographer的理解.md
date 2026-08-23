---
title: "Choreographer的理解"
published: 2023-05-27
description: "Choreographer的理解"
tags: ["Android","进阶"]
category: "android进阶"
draft: false
slug: "android-adv-021"
---

# Choreographer的理解


> 相关源码 https://cs.android.com/android/platform/superproject/+/android-7.0.0_r34:frameworks/base/core/java/android/view/Choreographer.java

Chroreographer的引入主要是为了配合VSync信号，给上层App渲染一个稳定的Message处理时机，它在Android渲染流水线中扮演着承上启下的角色。

- 向下负责接收和处理App的各种页面更新消息和回调(例如Input、Animation、Traversal等)，等到VSync到来的时候统一处理，以及判断卡顿掉顿情况，记录回调耗时等
- 向下负责请求(FrameDisplayEventReceiver.scheduleVsync，当应用需要绘制UI时，会申请一次VSync中断，然后再在中断处理的onVSync函数中进行绘制)和接收 (FrameDisplayEventReceiver.onVsync())VSync信号。


工作流程
1. Choreographer初始化，初始化FrameHandler，绑定Looper; 初始化FrameDisplayEventReceiver，它会创建一个DisplayEventConnection的VSync监听者对象，与SurfaceFlinger监理通信用来请求和接收VSync信号

2. SurfaceFlinger的appEventThread唤醒并发送VSync信号，触发Choreographer回调FrameDisplayEventReceiver.onVsync()，进入Choreographer的主要处理医数doFrame().
3. Choreographer计算掉顿逻辑
4. Choreographer处理Input回调
5. Choreographer处理Animation回调
6. Choreographer处理Insets Animation回调
7. Choreographer处理Traversal回调
8. Choreographer处理Commit回调
9. RenderThread处理绘制数据，执行渲染
10. RenderThread将处理好的Buffer提交给SurfaceFlinger进行合成。
