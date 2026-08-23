---
title: "一种新型的应用启动机制_USAP"
published: 2023-05-09
description: "一种新型的应用启动机制_USAP"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-041"
---

# 一种新型的应用启动机制:USAP
传统的应用启动模式由system_server中的AMS接收请求，之后通过socket告知zygote，让其完成fork动作，这样新进程便创建出来。不过从Android Q(10)开始，Google引入了一种新的机制：USAP(Unspecialized App Process)。通过prefork的方式提前创建好一批进程，当有应用启动时，直接将已经创建好的进程分配给它，从而省去了fork的动作，因此可以提升性能。
## 1. USAP进程的工作流程
![](https://mmbiz.qpic.cn/mmbiz_jpg/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1q1BHcK5rqG3yUhfzhqBYAhq2eflWvXGbH1RxIBdL9xibjaETlDWKtEA/640?wx_fmt=webp&from=appmsg)
当开启USAP的功能后，zygote会维护一个进程池，其中最多可容纳10个USAP进程。以下是根据图示罗列的详细工作流程。

1. Zygote首先会fork出10个进程，将其加入到进程池中。被创建出来的USAP进程并不会执行具体逻辑，而是等待socket通信的到来。不过有一个细节，在等待socket通信之前，USAP进程会提升调度优先级，这样如果应用需要启动时，它能以最快的速度响应。
2. USAP进程等待的socket通信将会何时到来？这取决于应用进程何时启动。当AMS接收到启动需求时，其会调用Process.start()。当决定采用USAP的方式启动时，system_server便会发起socket通信，将所有启动参数发送过去。由于此时有10个USAP进程都在等待同一个socket端口，因此系统底层会随机唤醒一个进程来处理此次通信。
3. USAP进程被唤醒，调用specializeAppProcess来完成“腾笼换鸟”的工作。最终调入ActivityThread.main方法中去，进而完成应用的启动。

当该进程退出时，它不会回到USAP Pool中，而是直接被zygote回收。zygote接收到SIGCHLD信号后，会调用SigChldHandler进行处理。过程中会通过socket将回收的进程数告知system_server