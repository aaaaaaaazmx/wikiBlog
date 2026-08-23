---
title: "JVM的内存模型的理解？"
published: 2025-08-23
description: "JVM的内存模型的理解？"
tags: ["Java","基础"]
category: "java基础"
draft: false
slug: "java-basic-027"
---

# JVM的内存模型的理解？

## 2、JVM的内存模型的理解？

### JVM

- 定义：可以理解成一个虚构的计算机，解释自己的字节码指令集映射到本地 CPU 或 OS 的指令集，上层只需关注 Class 文件，与操作系统无关，实现跨平台
- Kotlin 就是能解释成 Class 文件，所以可以跑在 JVM 上

### JVM 内存模型

- Java 多线程之间是通过共享内存来通信的，每个线程都有自己的本地内存
- 共享变量存放于主内存中，线程会拷贝一份共享变量到本地内存
- volatile 关键字就是给内存模型服务的，用来保证内存可见性和顺序性

Java内存模型即Java Memory Model，简称JMM。JMM定义了Java 虚拟机(JVM)在计算机内存(RAM)中的工作方式。JVM是整个计算机虚拟模型，所以JMM是隶属于JVM的。

Java线程之间的通信总是隐式进行，并且采用的是共享内存模型。这里提到的共享内存模型指的就是Java内存模型(简称JMM)，JMM决定一个线程对共享变量的写入何时对另一个线程可见。从抽象的角度来看，JMM定义了线程和主内存之间的抽象关系：线程之间的共享变量存储在主内存（main memory）中，每个线程都有一个私有的本地内存（local memory），本地内存中存储了该线程以读/写共享变量的副本。本地内存是JMM的一个抽象概念，并不真实存在。它涵盖了缓存，写缓冲区，寄存器以及其他的硬件和编译器优化。

总之，JMM就是一组规则，这组规则意在解决在并发编程可能出现的线程安全问题，并提供了内置解决方案（happen-before原则）及其外部可使用的同步手段(synchronized/volatile等)，确保了程序执行在多线程环境中的应有的原子性，可视性及其有序性。

### 需要更全面理解建议阅读以下文章：

[全面理解Java内存模型(JMM)及volatile关键字](https://blog.csdn.net/javazejian/article/details/72772461#%E7%90%86%E8%A7%A3java%E5%86%85%E5%AD%98%E5%8C%BA%E5%9F%9F%E4%B8%8Ejava%E5%86%85%E5%AD%98%E6%A8%A1%E5%9E%8B)

[全面理解Java内存模型](https://blog.csdn.net/suifeng3051/article/details/52611310)