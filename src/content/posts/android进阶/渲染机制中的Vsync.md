---
title: "渲染机制中的Vsync"
published: 2022-12-31
description: "渲染机制中的Vsync"
tags: ["Android","进阶"]
category: "android进阶"
draft: false
slug: "android-adv-046"
---

# 渲染机制中的Vsync

### Overview
早年的Android系统UI流畅性差的问题一直饱受诟病，Google为了解决这个问题开发了Proiect Butter项目，也就是黄油计划，期望彻底改善Android系统的流畅性。这是Android UI系统的一次非常大的改进，了解改进的内容，是我们掌握Android渲染机制的关键。

概括来说在这次改进中，Google打出了一套**VSync+Choreographer+TripleBuffer**的组合拳。具体说来

- VSync: 

它是黄油计划的核心，VSync (Vertical Synchronization 垂直同步) 是一种在PC时代就广泛使用的技术，简单说来它是利用屏幕刷新的间隙来进行帧缓冲区交换的技术。

- Choreographer: 

Choreographer的引入是为了配合VSync，给App端一个稳定的染处理时机。

- TripleBuffer


### VSync
我们知道屏幕上的画面每一帧都是静态的，不同的帧不断的进行刷新我们才能看的动态的画面，
对于Android来说界面的刷新是16.67ms刷新一次，也就是60fps (frame per second，每秒更新60次)，为什么是60fps呢?

> 60fps是跟硬件屏幕的刷新率有关的，为了和主流屏幕的刷新率保持一致，目前主流的屏幕是60HZ (当然现在还有90HZ，120HZ)，对于屏幕来说更高的刷新率就意味着更高的功耗，以及更短的TFT数据写入时间，对屏幕来说，设计难度也就更大。

那么Android的UI系统，怎么和屏幕刷新做同步呢，这就要提到VSync机制，什么是VSync机制?
简单来说，VSvnc机制就是把UI体系的FPS和显示器的刷新频率同步起来，避免屏幕界面出现“断裂”的现象


我们以VSync为中心，来用一组图来解释这几个概念，这些图来自于Google l/0 2012关Proiect Butter的丰题演讲。
 黄色: 显示器
。绿色: GPU
。蓝色: CPU
三者被等分成16.67ms的段，来观察每个周期内的渲染情况,如下图
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXDtDV1icY0iaS8ibC5U31S71xbSbXPeWfDMSrsAVicsNiauDAJgfwPskEiabPH3THA7pnqljzpHfWx6KWA/640?wx_fmt=png)



**当不使用VSvnc机制时**，在标号2中由于CPU没有及时处理这一帧，导致显示器只能继续显示第一顿，这种情况称大Jank。为什么CPU没有及时处理呢，可能是CPU在忙于处理其他事情，忘记了处理UI绘制。当CPU想起来要去处理UI绘制时，又过了最佳时间段.
为此就引入了Vsync，它类似于一种中断机制，通知CPU去处理UI绘制。如下所示:
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXDtDV1icY0iaS8ibC5U31S71xNOWbLxISxQOBEHPicn31Pf67EDX7kpxApeJ5h4TvfXqDcFQCDNIPHNQ/640?wx_fmt=png)



由于使用了VSync机制，CPU可以早早的开始处理标号2的绘制，这样显示器也能正常的显示标号2的数据了.

这似乎非常完美，由于由VSync这种同步机制的存在CPU/GPU与显示器的FPS都保持了一致，如我们上文所说是60fps。负责在VSync信号到来时，实现这种同步工作的正是Choreographer。

但是这都建立在CPU和GPU都能在一个周期内 (16.67ms) 完成自己的工作，如果不能呢，如下所示:

![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXDtDV1icY0iaS8ibC5U31S71xP0EINL2YswROcxIwibf1Olia5XLxm1ALMthymMkRqJUURfOy5UmUEKfw/640?wx_fmt=png)

GPU没有在一个周期内处理完B，导致Display只能继续显示A，这样AB两个Buffer (Android早期是Double Buffel机制，一个Back Buffer供GPU和CPU使用，一个Front Buffer供Display使用)都被占用了。这样就导致CPU在第二个周期内无所事事。不仅如此，由于CPU在等待A释放，导致CPU绘制被延期，有导致了下一个Jank。
这个时候如果有第三个Buffer，CPU就能去干活了。这也就是Tripple Buffer机制。如下所示:
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXDtDV1icY0iaS8ibC5U31S71xZB19meDC33eJLCc1zENiaLib5ggI1v7w2HqnMGdNoxtYZpCwAxbdSOzw/640?wx_fmt=png)
CPU使用第二个Buffer C进行绘制，虽然A在Display里还是重复显示了一次，但是后续的绘制流程就比较流畅了。那Buffer是不是越多越好呢，答案是并不是，CPU绘制的Buffer C数据要等待第四个周期才显示，这比DoubleBuffer多了16.67ms的延迟，正常情况下都是两个或者三个 (Chromium就是Double Buffer机制)。


### 什么是VSync机制?

**VSync** (Vertical Synchronization 垂直同步) 可以同步应用渲染、屏幕合成以及屏幕刷新周期的时间，消除卡顿，提升图形的视觉表现。VSync信号由HardwareCompositor产生，它封账了硬件厂商提供的HAL层，如果HAL层能产生VSync信号，则直接使用硬件VSync信号，否则使用HardwareCompositor内部的VSyncThread模拟产生软件VSync信号 (Sleep固定时间，然后唤醒) 。

HardwareCompositor产生HW VSYNC信号，经由DispSync生成SW VSYNC信号，SW VSYNC信号经过offset调整生成了两种信号:

![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXDtDV1icY0iaS8ibC5U31S71xiavVJT0TLsE0UJe6icSthDl9XG6ZfGxpAHDolPAmPmxae2LIJ48nneiaw/640?wx_fmt=png)


- VSYNC APP: Choreographer使用，Choreographer会配合VSync，给上层App一个稳定的渲染知己，上面提到VSync的触发周期是16.67ms，每隔16.67ms，VSync信号就会唤醒Choreographer来做App的绘制操。
- VSYNC_SF: SurfaceFlinger使用。SurfaceFlinger会在VSync信号到来的时候，进行合成操作


其中phase-sf和phase-app就是一个vsync offset (0-16.67ms) ，这个值可以通过adb shell dumpsyssurfaceflnger获得。

![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXDtDV1icY0iaS8ibC5U31S71xnLcicpJqcA1V15tahHL0pKQthu7K3E6mLUHnkxHftqyowmNlic6Criaiaw/640?wx_fmt=png)


> 什么是vsync offset，简单来说它是VSync信号的信移，正常情况下VSYNC-apD和VSYNC-sf信号时同步到来的，一个生产当前顿的数据，一个消费上一顿的数据，VSync Offset可以让VSYNC信号发生偏移，比如让VSYNC-sf信号提前到来，提前处理当前这一顿的数据。

有了VSync机制，Android UI系统就可以在VSync信号的驱动下有条不素的进行染和刷新了。
