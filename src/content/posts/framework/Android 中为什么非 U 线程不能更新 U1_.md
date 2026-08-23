---
title: "Android 中为什么非 U 线程不能更新 U1_"
published: 2024-09-12
description: "Android 中为什么非 U 线程不能更新 U1_"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-006"
---

# Android 中为什么非 U 线程不能更新 U1?
**1、系统为什么提供Handler?**
·为了切换线程，主要就是为了解决在子线程中无法访问的问题。

**2、U 为什么不设计成线程安全?**
总的来说，有以下几点原因

- 1) UI 具有可变性，甚至是高频可变性
- 2) UI对响应时间的敏感性要求 U 操作必须高效
- 3) U组件必须批量绘制来保证效率

总之，就是因为 Android 的UI控件不是线程安全的，如果在多线程中并发访问可能会导致UI控件处于不可预期的状态，那么为什么系统不对控件的访问加上锁机制呢?缺点有两个:

- 首先加上锁机制会让UI访问的逻辑变得复杂
- 锁机制会降低U访问的效率，因为锁机制会阻塞某些线程的执行，所以最简单且高效的方法就是采用单线程模型来处理UI操作

**3、非 U 线程可以直接更新 UI**
使用 SurfaceView=>SurfaceFlinger原理

- prepare content
- lockCanvas
- draw可以在任意线程进行绘制
- unLockCanvasAndPost
