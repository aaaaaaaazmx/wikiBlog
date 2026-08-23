---
title: "需要在Activity间传递大量的数据怎么办？"
published: 2024-09-24
description: "需要在Activity间传递大量的数据怎么办？"
tags: ["Android","进阶"]
category: "android进阶"
draft: false
slug: "android-adv-056"
---

# 需要在Activity间传递大量的数据怎么办？

Intent 传递数据的大小是有限制的，它大概能传的数据是**1M-8K**，原因是**Binder锁映射的内存大小就是1M-8K**.一般activity间传递数据会要使用到binder，因此这个就成为了数据传递的大小的限制。那么当activity间要传递大数据采用什么方式呢？

主要有以下方式

- LruCache
- 持久化（sqlite、file等）
- 匿名共享内存


## LruCache

LruCache是一种缓存策略，可以帮助我们管理缓存，在当前的问题下，我们可以利用LruCache存储我们数据作为一个中转，好比我们需要Activity A向Activity B传递大量数据，我们可以Activity A先向LruCache先写入数据，之后Activity B从LruCache读取。


## 持久化数据
那就是sqlite、file等方式。将需要传递的数据写在临时文件或者数据库中，再跳转到另外一个组件的时候再去读取这些数据信息，这种处理方式会由于读写文件较为耗时导致程序运行效率较低。这种方式特点如下：

**优势**：
- （1）应用中全部地方均可以访问
- （2）即便应用被强杀也不是问题了

**缺点**：
- （1）操做麻烦
- （2）效率低下


## 匿名共享内存

在跨进程传递大数据的时候，我们一般会采用binder传递数据，但是Binder只能传递1M一下的数据，所以我们需要采用其他方式完成数据的传递，这个方式就是匿名共享内存。

「Anonymous Shared Memory 匿名共享内存」是 Android 特有的内存共享机制，它可以将指定的物理内存分别映射到各个进程自己的虚拟地址空间中，从而便捷的实现进程间内存共享。
Android 上层提供了一些内存共享工具类，就是基于 Ashmem 来实现的，比如 **MemoryFile、 SharedMemory**。



