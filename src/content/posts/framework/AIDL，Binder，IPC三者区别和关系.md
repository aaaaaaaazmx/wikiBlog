---
title: "AIDL，Binder，IPC三者区别和关系"
published: 2022-06-12
description: "AIDL，Binder，IPC三者区别和关系"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-004"
---

# AIDL，Binder，IPC三者区别和关系
AIDL、Binder 和 IPC 是 Android 中实现进程间通信（IPC）的重要组件。它们之间的关系和区别如下：

1. AIDL：Android 接口定义语言，用于描述跨进程通信接口的数据类型、参数以及返回值等信息。
2. Binder：Android Binder 是一种 IPC 机制，它是基于共享内存和信号量实现的。Binder 包含 Binder 服务、客户端和内核三部分。Binder 服务端提供服务，Binder 客户端调用服务，内核驱动将服务端和客户端连接起来。
3. IPC：Inter-Process Communication，即进程间通信，它是在不同进程之间交换数据的一种机制或方式。Android 采用的是基于 Binder 的 IPC 机制。通过 Binder，不同进程之间可以共享数据和服务，从而提高了应用程序的可用性和性能。

因此，可以说 AIDL 是在 Android 平台上描述远程服务接口和数据类型的语言，Binder 是用于实现 Android 平台上进程间通信的技术和机制，IPC 是通用的进程间通信的概念。
在 Android 中，AIDL 和 Binder 是实现进程间通信的主要方式。AIDL 用于定义跨进程接口，而 Binder 则提供了实际的通信机制。 通常情况下，AIDL 定义了服务端暴露给客户端调用的接口，并生成 Stub 类，并在服务端中实现；客户端通过 IPC 机制调用服务端提供的方法，IPC 会将客户端的请求封装成 Binder 对象，并通过共享内存和信号量进行进程间通信。
简而言之，AIDL 提供了对跨进程通信接口的定义，Binder 提供了一种基于共享内存的 IPC 机制，而 IPC 是通用的进程间通信的概念。

AIDL 的作用，其实就是为开发者生成两个类：Stub 和 Proxy。这两个类都是一些模板代码，主要目的除了减轻开发者的工作量以外，也是为了隐藏跨进程通信 (IPC) 的各种细节在这两个类中，使得开发者只需要关注实现具体的服务逻辑，而无需关心底层通信的细节。
**Stub 通常用于服务端，Proxy 通常用于客户端。**

经过层层封装，在使用者使用AIDL时对于Binder基本上是无感知的。
这里贴一张架构图。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib118HNFu8q72Lm02pBcj1bwk7lalM1T8GEu23ERludZPPBBPmxD52iajwA/640?wx_fmt=png&from=appmsg)
