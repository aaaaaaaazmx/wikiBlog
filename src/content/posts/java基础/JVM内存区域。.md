---
title: "JVM内存区域。"
published: 2020-10-07
description: "JVM内存区域。"
tags: ["Java","基础"]
category: "java基础"
draft: false
slug: "java-basic-026"
---

# JVM内存区域。

## 线程私有：

- 1.程序计数器：记录正在执行的字节码指令地址，若正在执行 Native 方法则为空
- 2.虚拟机栈：执行方法时把方法所需数据存为一个栈帧入栈，执行完后出栈
- 3.本地方法栈：同虚拟机栈，但是针对的是 Native 方法

## 线程共享：

- 1.堆：存储 Java 实例，GC 主要区域，分代收集 GC 方法会吧堆划分为新生代、老年代
- 2.方法区：存储类信息，常量池，静态变量等数据

JVM基本构成![image](https://mmbiz.qpic.cn/mmbiz_jpg/LrDMVD5bqLWU3NG9ghOdpQnBk2ibUK4S2LVoAHIJQRz6tDibEeZrAwmIV7teCVGsAd5OYdWq8c0pIf6pS4DlYicKw/640?wx_fmt=jpeg)

从上图可知，JVM主要包括四个部分：

1.类加载器（ClassLoader）:在JVM启动时或者在类运行将需要的class加载到JVM中。（下图表示了从java源文件到JVM的整个过程，可配合理解。

![image](https://mmbiz.qpic.cn/mmbiz_jpg/LrDMVD5bqLWU3NG9ghOdpQnBk2ibUK4S2ZicgibfzPT46PFTrGaakXaZCIkNxiajxA2gj6dJfmjUtHH8CDcHV5j5dg/640?wx_fmt=jpeg)

2.执行引擎：负责执行class文件中包含的字节码指令；
    
3.内存区（也叫运行时数据区）：是在JVM运行的时候操作所分配的内存区。运行时内存区主要可以划分为5个区域，如图：

![image](https://mmbiz.qpic.cn/mmbiz_jpg/LrDMVD5bqLWU3NG9ghOdpQnBk2ibUK4S27rnggY7GpWBlGu7Z8SVfuPJnqfhsY9yqNYVeNEiclqYSzKehK5vnoHw/640?wx_fmt=jpeg)

方法区(MethodArea)：用于存储类结构信息的地方，包括常量池、静态常量、构造函数等。虽然JVM规范把方法区描述为堆的一个辑部分， 但它却有个别名non-heap（非堆），所以大家不要搞混淆了。方法区还包含一个运行时常量池。

java堆(Heap)：存储java实例或者对象的地方。这块是GC的主要区域。从存储的内容我们可以很容易知道，方法和堆是被所有java线程共享的。

java栈(Stack)：java栈总是和线程关联在一起，每当创一个线程时，JVM就会为这个线程创建一个对应的java栈在这个java栈中,其中又会包含多个栈帧，每运行一个方法就建一个栈帧，用于存储局部变量表、操作栈、方法返回等。每一个方法从调用直至执行完成的过程，就对应一栈帧在java栈中入栈到出栈的过程。所以java栈是现成有的。

程序计数器(PCRegister)：用于保存当前线程执行的内存地址。由于JVM程序是多线程执行的（线程轮流切换），所以为了保证程切换回来后，还能恢复到原先状态，就需要一个独立计数器，记录之前中断的地方，可见程序计数器也是线程私有的。

本地方法栈(Native MethodStack)：和java栈的作用差不多，只不过是为JVM使用到native方法服务的。

4.本地方法接口：主要是调用C或C++实现的本地方法及回调结果。

## 开线程影响哪块内存？

每当有线程被创建的时候，JVM就需要为其在内存中分配虚拟机栈和本地方法栈来记录调用方法的内容，分配程序计数器记录指令执行的位置，这样的内存消耗就是创建线程的内存代价。