---
title: "Binder的一次拷贝是如何实现的"
published: 2024-05-17
description: "Binder的一次拷贝是如何实现的"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-012"
---


# Binder的一次拷贝是如何实现的

跨进程通信是需要内核空间做支持的。传统的 IPC 机制如管道、Socket 都是内核的一部分，因此通过内核支持来实现进程间通信自然是没问题的。但是 Binder 并不是 Linux 系统内核的一部分，

这就得益于 Linux 的**动态内核可加载模块**（Loadable Kernel Module，LKM）的机制；模块是具有独立功能的程序，它可以被单独编译，但是不能独立运行。它在运行时被链接到内核作为内核的一部分运行。

这样，Android 系统就可以通过动态添加一个内核模块运行在内核空间，用户进程之间通过这个内核模块作为桥梁来实现通信
> 在 Android 系统中，这个运行在内核空间，负责各个用户进程通过 Binder 实现通信的内核模块就叫 **Binder 驱动**（Binder Dirver）。	


Binder不像之前提到的Linux本身的IPC通信方式：先将数据从发送方进程拷贝到内核缓存区，然后再将数据从内核缓存区拷贝到接收方进程，通过两次拷贝来实现吗

而是**mmap(),建立内存映射 通过一次拷贝完成**

mmap() 是操作系统中一种内存映射的方法。内存映射简单的讲就是将用户空间的一块内存区域映射到内核空间。映射关系建立后，用户对这块内存区域的修改可以直接反应到内核空间；反之内核空间对这段区域的修改也能直接反应到用户空间。实现用户空间和内核空间的高效互动

一次完整的通信过程如下图所示
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11BHDsicoNrU53VLq4rqrbSxXP6xsvicaoibWr2YrDmsZy3rK6EuzNKO9sw/640?wx_fmt=png&from=appmsg)

1. 首先 Binder 驱动在内核空间创建一个数据接收缓存区；
2. 接着在内核空间开辟一块内核缓存区，建立**内核缓存区**和**内核中数据接收缓存区**之间的映射关系，以及**内核中数据接收缓存区**和**接收进程用户空间地址**的映射关系；
3. 发送方进程通过系统调用 copy_from_user() 将数据 copy 到内核中的**内核缓存区**，由于内核缓存区和接收进程的用户空间存在内存映射，因此也就相当于把数据发送到了接收进程的用户空间，这样便完成了一次进程间的通信。


补充说明这个mmap的内存映射，**将一块物理内存（若干个物理页）分别映射到接收端用户空间和内核空间**，达到用户空间和内核空间共享数据的目的
发送端要向接收端发送数据时，内核直接通过copy_from_user将数据拷贝到接收端内核空间映射区，此时由于共享物理内存，接收进程的内存映射区也就能拿到该数据了，如下图。
![](https://mmbiz.qpic.cn/mmbiz_jpg/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib1138JWDdF5FRr8ZNGavGaAfE9EfZfXmGYicFL4ttrfaIj3L7bM4OTPGRA/640?wx_fmt=webp&from=appmsg)
