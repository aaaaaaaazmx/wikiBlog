---
title: "CyclicBarrier（同步屏障）了解吗？"
published: 2023-07-03
description: "CyclicBarrier（同步屏障）了解吗？"
tags: ["Java","并发","多线程"]
category: "java并发"
draft: false
slug: "java-concurrent-006"
---

### CyclicBarrier（同步屏障）了解吗？
CyclicBarrier 的字面意思是可循环使用（Cyclic）的屏障（Barrier）。它要做的事情是，让一 组线程到达一个屏障（也可以叫同步点）时被阻塞，直到最后一个线程到达屏障时，屏障才会开门，所有被屏障拦截的线程才会继续运行。
它和 CountDownLatch 类似，都可以协调多线程的结束动作，在它们结束后都可以执行特定动作，但是为什么要有 CyclicBarrier，自然是它有和 CountDownLatch 不同的地方。
CyclicBarrier 最最核心的方法，仍然是 await()：

- 如果当前线程不是第一个到达屏障的话，它将会进入等待，直到其他线程都到达，除非发生**被中断**、**屏障被拆除**、**屏障被重设**等情况；

上面的例子抽象一下，本质上它的流程就是这样就是这样：
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUibHk3eNVqcUb1D6wrHC1La4L68Boe2yHdta5ia6GGHpQ05stvnqWnxXABJvM4rPh8Zx2H0QQGUjGg/640?wx_fmt=png&from=appmsg)
CyclicBarrier工作流程