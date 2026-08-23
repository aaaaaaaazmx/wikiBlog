---
title: "描述下Binder机制原理"
published: 2025-05-05
description: "描述下Binder机制原理"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-052"
---

# 描述下Binder机制原理
Binder是Android Framework重要概念之一，通常这个问题是Binder系列问题开始之前的热身

回答这个问题可以抓住以下3点

1. binder是多进程通信方式之一
2. 介绍下多进程
3. 介绍下binder架构

**要点一：介绍下binder**
Binder 是 Android 系统中**进程间通讯（IPC）的一种方式**，也是 Android 系统中最重要的特性之一。 Android 中的四大组件 Activity，Service，Broadcast，ContentProvider，不同的 App 等都运行在不同的进程中，它是这些进程间通讯的桥梁。正如其名“粘合剂”一样，它把系统中各个组件粘合到了一起，是各个组件的桥梁。

**要点二：多进程及通信方式**
Binder是Android系统的一种跨进程通信（IPC）机制。
在Android系统中，单个进程被分配了有限的内存，多进程可以使用更多内存、隔离崩溃风险等。
多进程在Android中常见的使用场景有独立进程的WebView、推送、保活、系统服务等，既然是多进程场景，那么就需要跨进程通信了

Linux自带了一些跨进程通信方式：

**管道（pipe）**：管道描述符是半双工，**单向的**，数据只能往一个方向流，想要读写需要两个管道描述符。Linux提供了pipe(fds)来获取一对描述符，一个读一个写。匿名管道只能用在具有亲缘关系的父子进程间的通信，有名管道无此限制。

**Socket**：全双工，可读可写。如Zygote进程等待AMS系统服务发起socket请求来创建应用进程。

**共享内存**（shm，Shared Memory）：会映射一段能被多个进程访问的内存，是最高效的IPC方式，他通常需要结合其他跨进程方式如信号量来同步信息。Android基于shm改进得到**匿名共享内存**Ashmem（Anonymous Shared Memory），因高效而适合处理较大的数据，**如应用进程通过共享内存来读取SurfaceFlinger进程合成的视图数据，进行展示**。

**内存映射（mmap）**：Linux通过将一个虚拟内存区域与一个磁盘上的文件关联起来，以初始化这个虚拟内存区域的内容。通过指针的方式读写内存，系统会同步进对应的磁盘文件。Binder用到了mmap。

**信号（signal）**：**单向的**，发个信号就完事，**无返回结果。只能发信号，带不了参数**。如子进程被杀掉后系统会发出SIGCHLD信号，父进程会清理子进程在进程表的描述信息防止僵尸进程的发生。

另外还有文件共享、消息队列（Message）等跨进程通信方式...

这些跨进程通信方式都各有优劣，Android最终选择了**自建一套兼顾好用、高效、安全的Binder**。（这里简要回答就好，面试官感兴趣会追问的）

好用：易用的C/S架构（借助AIDL后只需编写业务逻辑）
高效：用mmap进行内存映射，只需一次拷贝
安全：内核态管理身份标记，每个App有UID来校验权限，同时支持实名（系统服务）和匿名（自己创建的服务）

**要点三：Binder的CS架构**

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11gwybZqn0Kjk9myqCDhdskQ7ZOQbbkPEmdyfYtPriajP0QQcftuiaRGAg/640?wx_fmt=png&from=appmsg)

- Binder 通信采用 C/S 架构，从组件视角来说，包含 Client、 Server、 ServiceManager 以及 Binder 驱动，其中 ServiceManager 用于管理系统中的各种服务。
- Binder 在 framework 层进行了封装，通过 JNI 技术调用 Native（C/C++）层的 Binder 架构。
- Binder 在 Native 层以 ioctl 的方式与 Binder 驱动通讯。

在聊完这个之后 面试官会觉得你确实了解一些binder知识，会继续深挖


# 应用是怎么启动binder的

- 了解Binder是用来做什么的？
- 应用里面哪些地方用到了Binder机制？
- 应用的大致启动流程是怎么样的？
- 一个进程是怎么启动Binder机制的？

我们在Activity.onCreate甚至更早的Application.onCreate里面就可以调用Binder机制了，这说明应用启动Binder比Application的生命周期更早。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11n5ErVAYGuFE8c5UqzQIXzPp8Y1iaovnCMtribBo6Zl2JOPUiamMTQsmAg/640?wx_fmt=png&from=appmsg)

上图是应用进程启动的流程，AMS在组件启动的过程中要是发现组件所在的进程尚未启动，就会通过本地socket通知Zygote启动进程，Zygote在应用进程启动完成之后会将启动的子进程的pid返回给AMS，应用进程启动完成之后，就会通过Binder通知AMS已经启动完成，并将自己的Binder句柄在AMS中注册。

> 从应用进程启动的流程中，我们可以看到在应用进程启动完成之后，应用进程的Binder机制就已经启动了，在Zygoto通过fork之后，对进程资源进行初始化的过程中完成了Binder的启动。

**下面首先来看看Zygoto启动进程的流程**
我们知道Zygote是有init进程启动的，Zygote启动之后，就会进入Loop循环读取本地socket传递来的消息，Zygote处理消息的函数runOnce：
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11orRicBUhm40mnotXdlpRibQTwpJ5pswj9vqTpD5F4Eib1ln5gAIDNFuUw/640?wx_fmt=png&from=appmsg)
首先Zygote通过readArgumentList读取socket里面的参数，然后通过fork的方式创建一个子进程，pid等于0表示当前是在子进程中，在子进程中通过handleChildProc来初始化子进程的相关资源。

其中在nativeZygoteInit函数中，通过open("/dev/binder")来启动binder驱动，binder驱动启动成功之后，就会将binder驱动映射到当前进程的内存空间，当前进程中就可以通过binder机制进行跨进程交互了。

完整的binder启动流程是，Zygote在fork出子进程之后，在子进程中进行进程的初始化，首先启动binder驱动，binder驱动启动成功之后，会通过mmap将binder驱动映射到当前进程的内存空间中，然后注册一个单列的binder线程，并在binder线程中启动loop循环，不断的与binder驱动进行交互
