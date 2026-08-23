---
title: "孵化应用进程这种事为什么不交给SystemServer来做，而专门设计一个Zygote？"
published: 2020-01-11
description: "孵化应用进程这种事为什么不交给SystemServer来做，而专门设计一个Zygote？"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-049"
---

# 孵化应用进程这种事为什么不交给SystemServer来做，而专门设计一个Zygote？
我们知道，应用在启动的时候需要做很多准备工作，包括启动虚拟机，加载各类系统资源等等，这些都是非常耗时的，如果能在zygote里就给这些必要的初始化工作做好，子进程在fork的时候就能直接共享，那么这样的话效率就会非常高。
这个就是zygote存在的价值，这一点呢SystemServer是替代不了的，主
要是因为SystemServer里跑了一堆系统服务，这些是不能继承到应用进程的。而且我们应用进程在启动的时候，内存空间除了必要的资源外，最好是干干净净的，不要继承一堆乱七八糟的东西。

所以呢，不如给SystemServer和应用进程里都要用到的资源抽出来单独放在一个进程里，也就是这的zygote进程，然后zygote进程再分别孵化出SystemServer进程和应用进程。孵化出来之后，SystemServer进程和应用进程就可以各干各的事了。