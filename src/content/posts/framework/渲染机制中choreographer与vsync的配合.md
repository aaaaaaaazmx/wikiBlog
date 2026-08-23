---
title: "渲染机制中choreographer与vsync的配合"
published: 2024-08-30
description: "渲染机制中choreographer与vsync的配合"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-054"
---

# 渲染机制中choreographer与vsync的配合
类似问题

- 屏幕刷新原理


先看一张图
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrIyez8MicPx9kkdprMMtTWxicXLCMNKxYPNGaU6bamklCasDmiadbLicCwUw/640?wx_fmt=png&from=appmsg)

1. 当页面 View 有更新操作时，会通过 Choreographer 去注册一个 VSYNC 信号监听，等待 VSYNC 信号的到来，
2. VSYNC 信号到来后，会执行我们熟知的 measure，layout，draw 方法，然后将视图数据通过 swipeBuffer 移交给屏幕的 DataBuffer 区域，等待进一步处理。
3. 在这个过程中，如果绘制操作比较耗时，掺杂了我们的业务逻辑，页面就会变得卡顿，如果每一帧的绘制都是在两个标准的 VSYNC 信号之间完成的，页面操作和展示就会变得非常流畅。


![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrI8VyAWEC9GLbYq3GRWvzm9HIkxPTDFOGLG5WDYNXtpTwMnlCPIj71vA/640?wx_fmt=png&from=appmsg)
VSYNC 信号到达应用层后，经历 measure，layout，draw 几个阶段，这里统称为 render 阶段，render 阶段结束之后，如果 MessageQueue 没有其它的消息，这时候主线程就会处于空闲状态，等待视图刷新触发下一个 VSYNC 信号的到来，此时idlehandler开始进行工作

**Choreographer 作用**
Choreographer 的引入，主要是配合系统Vsync垂直同步机制（Android“黄油计划”中引入的机制之一，协调APP生成UI数据和SurfaceFlinger合成图像，避免Tearing画面撕裂的现象），给上层 App 的渲染提供一个稳定的 Message 处理的时机。

也就是 Vsync 到来的时候 ，系统通过对 Vsync 信号周期的调整，来控制每一帧绘制操作的时机。
**Choreographer 扮演 Android 渲染链路中承上启下的角色**：

1. **承上**：负责接收和处理 App 的各种更新消息和回调，等到 Vsync 到来的时候统一处理。比如集中处理 Input(主要是 Input 事件的处理) 、Animation(动画相关)、Traversal(包括 measure、layout、draw 等操作) ，判断卡顿掉帧情况，记录 CallBack 耗时等；
2. **启下**：负责请求和接收 Vsync 信号。接收 Vsync 事件回调(通过 FrameDisplayEventReceiver.onVsync )，请求 Vsync(FrameDisplayEventReceiver.scheduleVsync) 。



