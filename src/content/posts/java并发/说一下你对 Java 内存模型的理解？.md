---
title: "说一下你对 Java 内存模型的理解？"
published: 2021-11-28
description: "说一下你对 Java 内存模型的理解？"
tags: ["Java","并发","多线程"]
category: "java并发"
draft: false
slug: "java-concurrent-045"
---

### 说一下你对 Java 内存模型的理解？
Java 内存模型（Java Memory Model）是一种抽象的模型，简称 JMM，主要用来定义多线程中变量的访问规则，用来解决变量的可见性、有序性和原子性问题，确保在并发环境中安全地访问共享变量。

Java内存模型
JMM 定义了线程内存和主内存之间的抽象关系：线程之间的共享变量存储在主内存（Main Memory）中，每个线程都有一个私有的本地内存（Local Memory），本地内存中存储了共享变量的副本，用来进行线程内部的读写操作。

- 当一个线程更改了本地内存中共享变量的副本后，它需要将这些更改刷新到主内存中，以确保其他线程可以看到这些更改。
- 当一个线程需要读取共享变量时，它可能首先从本地内存中读取。如果本地内存中的副本是过时的，线程将从主内存中重新加载共享变量的最新值到本地内存中。

本地内存是 JMM 中的一个抽象概念，并不真实存在。实际上，本地内存可能对应于 CPU 缓存、寄存器或者其他硬件和编译器优化。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUibHk3eNVqcUb1D6wrHC1LaEF2VyN4DkutKS8OkNsqqAp8bibicw4ib58gpgs1k8AeBDeP2KAicib2Grgw/640?wx_fmt=png&from=appmsg)
实际线程工作模型
对于一个双核 CPU 的系统架构，每个核都有自己的控制器和运算器，其中控制器包含一组寄存器和操作控制器，运算器执行算术逻辅运算。
每个核都有自己的一级缓存，在有些架构里面还有一个所有 CPU 共享的二级缓存。
Java 内存模型里面的本地内存，可能对应的事 L1 缓存或者 L2 缓存或者 CPU 寄存器。