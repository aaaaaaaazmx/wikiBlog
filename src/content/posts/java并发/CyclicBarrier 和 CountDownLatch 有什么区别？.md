---
title: "CyclicBarrier 和 CountDownLatch 有什么区别？"
published: 2023-11-01
description: "CyclicBarrier 和 CountDownLatch 有什么区别？"
tags: ["Java","并发","多线程"]
category: "java并发"
draft: false
slug: "java-concurrent-005"
---

### CyclicBarrier 和 CountDownLatch 有什么区别？
两者最核心的区别[18]：

- CountDownLatch 是一次性的，而 CyclicBarrier 则可以多次设置屏障，实现重复利用；
- CountDownLatch 中的各个子线程不可以等待其他线程，只能完成自己的任务；而 CyclicBarrier 中的各个线程可以等待其他线程

它们区别用一个表格整理：

| CyclicBarrier | CountDownLatch |
| --- | --- |
| CyclicBarrier 是可重用的，其中的线程会等待所有的线程完成任务。届时，屏障将被拆除，并可以选择性地做一些特定的动作。 | CountDownLatch 是一次性的，不同的线程在同一个计数器上工作，直到计数器为 0. |
| CyclicBarrier 面向的是线程数 | CountDownLatch 面向的是任务数 |
| 在使用 CyclicBarrier 时，你必须在构造中指定参与协作的线程数，这些线程必须调用 await()方法 | 使用 CountDownLatch 时，则必须要指定任务数，至于这些任务由哪些线程完成无关紧要 |
| CyclicBarrier 可以在所有的线程释放后重新使用 | CountDownLatch 在计数器为 0 时不能再使用 |
| 在 CyclicBarrier 中，如果某个线程遇到了中断、超时等问题时，则处于 await 的线程都会出现问题 | 在 CountDownLatch 中，如果某个线程出现问题，其他线程不受影响 |
