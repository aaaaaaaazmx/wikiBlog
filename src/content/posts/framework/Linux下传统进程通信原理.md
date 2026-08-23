---
title: "Linux下传统进程通信原理"
published: 2024-09-02
description: "Linux下传统进程通信原理"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-024"
---

# Linux下传统进程通信原理

> 这个是扩展知识点，主要看看知识广度，而且了解 Linux IPC 相关的概念和原理有助于我们理解 Binder 通信原理

主要思路是 为什么会有进程间通信(IPC)，然后就是介绍linux IPC

1. 核心概念
- 进程空间划分: 内核空间、用户空间
- 系统调用：用户态与内核态
2. Linux IPC通信原理

先看一张图
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11Bu8m930Off722IEIJE67P8RYye2kia1DwHlxDqEoib2VyhXcKsjY4oag/640?wx_fmt=png&from=appmsg)
这张展示了 Liunx 中跨进程通信涉及到的一些基本概念：

- 进程隔离
- 进程空间划分：用户空间(User Space)/内核空间(Kernel Space)
- 系统调用：用户态/内核态

## 进程通信的由来
### 进程隔离
这里涉及到一些操作系统的基本知识，能讲一些是加分项的。

在操作系统中，进程与进程间内存是不共享的。

两个进程就像两个平行的世界，A 进程没法直接访问 B 进程的数据，这就是进程隔离的通俗解释。
A 进程和 B 进程之间要进行数据交互就得采用特殊的通信机制：进程间通信（IPC）

### 用户空间和内核空间
进程空间划分为2个大部分：用户空间(User Space)/内核空间(Kernel Space),了保护用户进程不能直接操作内核，保证内核的安全

现代操作系统都是采用的虚拟存储器，比如 32 位系统而言，它的寻址空间（虚拟存储空间）就是 2 的 32 次方，也就是 4GB。
操作系统的核心是内核，独立于普通的应用程序，可以访问受保护的内存空间，也可以访问底层硬件设备的权限。
为了保护用户进程不能直接操作内核，保证内核的安全，操作系统从逻辑上将虚拟空间划分为用户空间（User Space）和内核空间（Kernel Space）。
针对 Linux 操作系统而言，将最高的 1GB 字节供内核使用，称为内核空间；较低的 3GB 字节供各进程使用，称为用户空间。
> 简单的说就是，内核空间（Kernel）是系统内核运行的空间，用户空间（User Space）是用户程序运行的空间。为了保证安全性，它们之间是隔离的。


![](https://mmbiz.qpic.cn/mmbiz_jpg/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11MAU7sOp1hKHMJdK7Pnkox6lvzxNPPsfZVIcduzjA59QY7A9FychLmw/640?wx_fmt=webp&from=appmsg)
### 用户态和内核态
虽然从逻辑上进行了用户空间和内核空间的划分，但不可避免的用户空间需要访问内核资源，比如文件操作、访问网络等等。为了突破隔离限制，就需要借助**系统调用**来实现。系统调用是用户空间访问内核空间的唯一方式，保证了所有的资源访问都是在内核的控制下进行的，避免了用户程序对系统资源的越权访问，提升了系统安全性和稳定性。
Linux 使用两级保护机制：0 级供系统内核使用，3 级供用户程序使用。
当一个任务（进程）执行系统调用而陷入内核代码中执行时，称进程处于**内核运行态（内核态）**。此时处理器处于特权级最高的（0级）内核代码中执行。当进程处于内核态时，执行的内核代码会使用当前进程的内核栈。每个进程都有自己的内核栈。
当进程在执行用户自己的代码的时候，我们称其处于**用户运行态（用户态）**。此时处理器在特权级最低的（3级）用户代码中运行。
系统调用主要通过如下两个函数来实现：

> copy_from_user() //将数据从用户空间拷贝到内核空间
> copy_to_user() //将数据从内核空间拷贝到用户空间



## Linux下的传统IPC 通信原理
说完上面的概念，再介绍下传统IPC方式中进程之间如何实现通信

通常的做法是消息发送方将要发送的数据存放在内存缓存区中，

通过系统调用**进入内核态**。然后内核程序在内核空间分配内存，开辟一块内核缓存区，**调用 copy**_**from**_**user() **函数将数据从用户空间的内存缓存区拷贝到内核空间的内核缓存区中。

同样的，接收方进程在接收数据时在自己的用户空间开辟一块内存缓存区，然后内核程序调用 copy_to_user() 函数将数据从内核缓存区拷贝到接收进程的内存缓存区。这样数据发送方进程和数据接收方进程就完成了一次数据传输，

我们称完成了一次进程间通信
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11UqzsRQiazsBF6O7LI9lKCkT7k1vVNpXD4FN8OdficCv9u0yZQ9bFqzVQ/640?wx_fmt=png&from=appmsg)

这种传统的 IPC 通信方式有两个问题：

1. 性能低下，一次数据传递需要经历：内存缓存区 --> 内核缓存区 --> 内存缓存区，需要 2 次数据拷贝；
2. 接收数据的缓存区由数据接收进程提供，但是接收进程并不知道需要多大的空间来存放将要传递过来的数据，因此只能开辟尽可能大的内存空间或者先调用 API 接收消息头来获取消息体的大小，这两种做法不是浪费空间就是浪费时间。

在从进程角度来看：
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11CJbXpuiaG3ZVI1ibuELHqnTHJTZHgzXyia0ib2w3RKZr6ZJ8KBc8LvnHeA/640?wx_fmt=png&from=appmsg)

每个Android的进程，只能运行在自己进程所拥有的虚拟地址空间。对应一个4GB的虚拟地址空间，其中3GB是用户空间，1GB是内核空间，当然内核空间的大小是可以通过参数配置调整的。对于用户空间，不同进程之间彼此是不能共享的，
而**内核空间却是可共享的**。
Client进程向Server进程通信，恰恰是利用进程间可共享的内核内存空间来完成底层通信工作的，
Client端与Server端进程往往采用ioctl等方法跟内核空间的驱动进行交互。
