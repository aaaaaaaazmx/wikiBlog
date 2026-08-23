---
title: "Binder通信的优势"
published: 2021-04-05
description: "Binder通信的优势"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-015"
---

# Binder通信的优势

这个问题需要抓住2个要点

1. 简单介绍下 传统linux已有的进程间通信
2. 重点介绍binder的优势

## 要点一：传统Linux进程间通信
Android 系统是基于 Linux 内核的，Linux 已经提供了管道、消息队列、共享内存和 Socket 等 IPC 机制。那为什么 Android 还要提供 Binder 来实现 IPC 呢？主要是基于**性能**、**稳定性**和**安全性**几方面的原因。

**管道（pipe）**：管道描述符是半双工，**单向的**，数据只能往一个方向流，想要读写需要两个管道描述符。Linux提供了pipe(fds)来获取一对描述符，一个读一个写。匿名管道只能用在具有亲缘关系的父子进程间的通信，有名管道无此限制。

**Socket**：全双工，可读可写。如Zygote进程等待AMS系统服务发起socket请求来创建应用进程。

**共享内存**（shm，Shared Memory）：会映射一段能被多个进程访问的内存，是最高效的IPC方式，他通常需要结合其他跨进程方式如信号量来同步信息。Android基于shm改进得到**匿名共享内存**Ashmem（Anonymous Shared Memory），因高效而适合处理较大的数据，**如应用进程通过共享内存来读取SurfaceFlinger进程合成的视图数据，进行展示**。

**内存映射（mmap）**：Linux通过将一个虚拟内存区域与一个磁盘上的文件关联起来，以初始化这个虚拟内存区域的内容。通过指针的方式读写内存，系统会同步进对应的磁盘文件。Binder用到了mmap。

**信号（signal）**：**单向的**，发个信号就完事，**无返回结果。只能发信号，带不了参数**。如子进程被杀掉后系统会发出SIGCHLD信号，父进程会清理子进程在进程表的描述信息防止僵尸进程的发生。

## 要点二：Binder通信优势

1. **性能上**

Socket 作为一款通用接口，其传输效率低，开销大，主要用在跨网络的进程间通信和本机上进程间的低速通信。消息队列和管道采用存储-转发方式，即数据先从发送方缓存区拷贝到内核开辟的缓存区中，然后再从内核缓存区拷贝到接收方缓存区，至少有两次拷贝过程。共享内存虽然无需拷贝，但控制复杂，难以使用。**Binder 只需要一次数据拷贝，性能上仅次于共享内存**。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11BHkAduVMJSbrCErkUpvAe2OanbrM6jaByUESQUjBXNeo6TLArCLaicw/640?wx_fmt=png&amp;from=appmsg)

2. **稳定性**

再说说稳定性，Binder 基于 C/S 架构，客户端（Client）有什么需求就丢给服务端（Server）去完成，架构清晰、职责明确又相互独立，自然稳定性更好。共享内存虽然无需拷贝，但是控制负责，难以使用。从稳定性的角度讲，Binder 机制是优于内存共享的

3. **安全性**

另一方面就是安全性。Android 作为一个开放性的平台，市场上有各类海量的应用供用户选择安装，因此安全性对于 Android 平台而言极其重要。作为用户当然不希望我们下载的 APP 偷偷读取我的通信录，上传我的隐私数据，后台偷跑流量、消耗手机电量。传统的 IPC 没有任何安全措施，完全依赖上层协议来确保。首先传统的 IPC 接收方无法获得对方可靠的进程用户ID/进程ID（UID/PID），从而无法鉴别对方身份。Android 为每个安装好的 APP 分配了自己的 UID，故而进程的 UID 是鉴别进程身份的重要标志。传统的 IPC 只能由用户在数据包中填入 UID/PID，但这样不可靠，容易被恶意程序利用。可靠的身份标识只有由 IPC 机制在内核中添加。其次传统的 IPC 访问接入点是开放的，只要知道这些接入点的程序都可以和对端建立连接，不管怎样都无法阻止恶意程序通过猜测接收方地址获得连接。同时 Binder 既支持实名 Binder，又支持匿名 Binder，安全性高。

基于上述原因，Android 需要建立一套新的 IPC 机制来满足系统对稳定性、传输性能和安全性方面的要求，这就是 Binder。

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11k1TTN0RogdeYg1MFPQRemGuFjOibibXJkOzy1t4GibKp61hvkWtgcTgVw/640?wx_fmt=png&amp;from=appmsg)
