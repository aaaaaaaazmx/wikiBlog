---
title: "Binder概述，快速了解Binder体系"
published: 2023-04-03
description: "Binder概述，快速了解Binder体系"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-011"
---

# Binder概述，快速了解Binder体系

## 概述
一个进程如何通过binder和另一个进程通讯？最简单的流程如下

1. 我们在使用 Binder 时基本都是调用 framework 层封装好的方法，AIDL 就是 framework 层提供的傻瓜式是使用方式。假设该服务已经通过Servicemanger注册完，对应 通过系统调用在binder驱动（内核）中先注册此进程（创建保存一个bidner_proc），驱动为接收端进程创建一个任务队列（biner_proc.todo）

2. 通过 ServiceManager 获取到服务端的 BinderProxy 代理对象，通过调用 BinderProxy 将参数，方法标识（例如：TRANSACTION_test，AIDL中自动生成）传给 ServiceManager，同时客户端线程进入等待状态。

3. ServiceManager 将用户空间的参数等请求数据复制到内核空间，并向服务端插入一条执行执行方法的事务。事务执行完通知 ServiceManager 将执行结果从内核空间复制到用户空间，并唤醒等待的线程，响应结果，通讯结束。

在Binder驱动中以binder_proc结构体代表一个进程，binder_thread代表一个线程，binder_proc.todo即为**进程需要处理的来自其他进程的任务队列**。
```
struct binder_proc {
	// 存储所有binder_proc的链表
	struct hlist_node proc_node;
	// binder_thread红黑树
	struct rb_root threads;
	// binder_proc进程内的binder实体组成的红黑树
	struct rb_root nodes;
	......
}
```


## 详细过程
内核层的Binder驱动已经提供了IPC功能，
不过还需要在framework native层提供一些**对于驱动层的调用封装，使framework开发者更易于使用，由此封装出了Native Binder**；
同时，由于framework native层是c/c++语言实现，**对于应用开发者，需要更加方便的Java层的封装，衍生出Java Binder**；
最后在此之上，**为了减少重复代码的编写和规范接口，在Java Binder的基础上又封装出了AIDL**。

经过层层封装，在使用者使用AIDL时对于Binder基本上是无感知的。
这里贴一张架构图。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11f5cYibMfUYfbNU8S1mNuaf2ib2Za31X5bbibe4bcuHLrE6Ileeiavd701g/640?wx_fmt=png&from=appmsg)

### Native层
BpBinder代表服务端Binder的一个代理，
内部有一个成员mHandle就是服务端Binder在驱动层的句柄，客户端通过调用BpBinder::transact传入该句柄，
经过驱动层和服务端BBinder产生会话，最后服务端会调用到BBinder::onTransact。
在这里两者之间通过约定好的code来标识会话内容

要用Binder进行通信的进程都需要在驱动中先注册该进程，并且每次通讯时需要一个线程死循环读写binder驱动。
**驱动层中一个进程对应一个binder_proc，一个线程对应binder_thread；**
**而在Framework Native层中，进程对应一个ProcessState，线程对应IPCThreadState**，
BpBinder::transact发起通讯最终也是通过IPCThreadState.transact调用驱动进行
> Android中每个应用进程都打开了Binder驱动（在驱动中注册），Zygote进程在fork出应用进程后，调用app_main.cpp中onZygoteInit函数初始化，此函数中就创建了该进程的ProcessState实例，打开Binder驱动然后分配映射区，驱动中也创建并保存一个该进程的binder_proc实例。这里借一张图来描述。

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib117uxvfXtjyO7Z1OFWSPMvTRPttcicTVgiaDAGRBs5XTI8YaelichJyBYVg/640?wx_fmt=png&from=appmsg)
对于底层Binder驱动，通过 binder_procs 链表记录所有创建的 binder_proc 结构体，binder 驱动层的每一个 binder_proc 结构体都与用户空间的一个用于 binder 通信的进程一一对应，且每个进程有且只有一个 ProcessState 对象，这是通过单例模式来保证的。
在每个进程中可以有很多个线程，每个线程对应一个 IPCThreadState 对象，IPCThreadState 对象也是单例模式，即一个线程对应一个 IPCThreadState 对象，在 Binder 驱动层也有与之相对应的结构，那就是 Binder_thread 结构体。在 binder_proc 结构体中通过成员变量 rb_root threads，来记录当前进程内所有的 binder_thread。

**Binder 线程池**：每个 Server 进程在启动时创建一个 binder 线程池，并向其中注册一个 Binder 线程；
之后 Server 进程也可以向 binder 线程池注册新的线程，或者 Binder 驱动在探测到没有空闲 binder 线程时主动向 Server 进程注册新的的 binder 线程。
对于一个 Server 进程有一个最大 Binder 线程数限制，默认为16个 binder 线程，例如 Android 的 system_server 进程就存在16个线程。对于所有 Client 端进程的 binder 请求都是交由 Server 端进程的 binder 线程来处理的。

### Java层
Java层是对native层相关类的封装，BBinder对应Binder，BpBinder对应BinderProxy，java层最后还是会调用到native层对应函数

### AIDL
AIDL生成的代码对于Binder进行了进一步封装，<接口>.Stub对应服务端Binder，<接口>.Stub.Proxy标识客户端，内部持有一个mRemote实例（BinderProxy），aidl根据定义的接口方法生成若干个TRANSACTION_<函数名> code常量，两端Binder通过这些code标识解析参数，调用相应接口方法。换言之AIDL就是对BinderProxy.transact和Binder.onTransact进行了封装，**使用者不必再自己定义每次通讯的code以及参数解析**。

整体过程如下图
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11e10U3zQUicialt41InicO0zEY8hK0ibic3reiaUKDPicnxrqYspicagT3eRbcw/640?wx_fmt=png&from=appmsg)
