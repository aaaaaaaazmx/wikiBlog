---
title: "Binder通信架构"
published: 2024-11-10
description: "Binder通信架构"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-014"
---

# Binder通信架构

#### 1.1 Binder架构的思考
Android内核是基于Linux系统, 而Linux现存多种进程间IPC方式:管道, 消息队列, 共享内存, 套接字, 信号量, 信号. 为什么Android非要用Binder来进行进程间通信呢. 从我个人的理解角度, 曾尝试着在知乎回答同样一个问题 [为什么Android要采用Binder作为IPC机制？](https://www.zhihu.com/question/39440766/answer/89210950). 这是Gityuan第一次认认真真地在知乎上回答问题, 收到很多网友的点赞与回复, 让我很受鼓舞, 也决心分享更多优先地文章回报读者和粉丝, 为Android圈贡献自己的微薄之力。
在说到Binder架构之前, 先简单说说大家熟悉的TCP/IP的五层通信体系结构:
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11npwzMo7RcdN8YhXjJsOcicl0Mf12DGXLlPPD0Nc6DafG3OpD6A3df7Q/640?wx_fmt=png&from=appmsg)

- 应用层: 直接为用户提供服务;
- 传输层: 传输的是报文(TCP数据)或者用户数据报(UDP数据)
- 网络层: 传输的是包(Packet), 例如路由器
- 数据链路层: 传输的是帧(Frame), 例如以太网交换机
- 物理层: 相邻节点间传输bit, 例如集线器,双绞线等

这是经典的五层TPC/IP协议体系, 这样分层设计的思想, 让每一个子问题都设计成一个独立的协议, 这协议的设计/分析/实现/测试都变得更加简单:

- 层与层具有独立性, 例如应用层可以使用传输层提供的功能而无需知晓其实现原理;
- 设计灵活, 层与层之间都定义好接口, 即便层内方法发生变化,只有接口不变, 对这个系统便毫无影响;
- 结构的解耦合, 让每一层可以用更适合的技术方案, 更合适的语言;
- 方便维护, 可分层调试和定位问题;

Binder架构也是采用分层架构设计, 每一层都有其不同的功能:
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11EicWBBj0EBSu4oO570NCAndvRhPC03PERWZlaCBKNbkU2K2rf1gtV4Q/640?wx_fmt=png&from=appmsg)

- **Java应用层:** 对于上层应用通过调用AMP.startService, 完全可以不用关心底层,经过层层调用,最终必然会调用到AMS.startService.
- **Java IPC层:** Binder通信是采用C/S架构, Android系统的基础架构便已设计好Binder在Java framework层的Binder客户类BinderProxy和服务类Binder;
- **Native IPC层:** 对于Native层,如果需要直接使用Binder(比如media相关), 则可以直接使用BpBinder和BBinder(当然这里还有JavaBBinder)即可, 对于上一层Java IPC的通信也是基于这个层面.
- **Kernel物理层:** 这里是Binder Driver, 前面3层都跑在用户空间,对于用户空间的内存资源是不共享的,每个Android的进程只能运行在自己进程所拥有的虚拟地址空间, 而内核空间却是可共享的. 真正通信的核心环节还是在Binder Driver.
#### 1.2 分析起点
前面通过一个[Binder系列-开篇](http://gityuan.com/2015/10/31/binder-prepare/)来从源码讲解了Binder的各个层面, 但是Binder牵涉颇为广泛, 几乎是整个Android架构的顶梁柱, 虽说用了十几篇文章来阐述Binder的各个过程. 但依然还是没有将Binder IPC(进程间通信)的过程彻底说透.
Binder系统如此庞大, 那么这里需要寻求一个出发点来穿针引线, 一窥视Binder全貌. 那么本文将从全新的视角,以[startService流程分析](http://gityuan.com/2016/03/06/start-service/)为例子来说说Binder所其作用. 首先在发起方进程调用AMP.startService，经过binder驱动，最终调用系统进程AMS.startService,如下图:
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11s0Vls43jFGA5KN3HHpRJJUaBf2SI8nTAGibqZVOqYGg6IVnVtMGuicHQ/640?wx_fmt=png&from=appmsg)
AMP和AMN都是实现了IActivityManager接口,AMS继承于AMN. 其中AMP作为Binder的客户端,运行在各个app所在进程, AMN(或AMS)运行在系统进程system_server.
#### 1.3 Binder IPC原理
Binder通信采用C/S架构，从组件视角来说，包含Client、Server、ServiceManager以及binder驱动，其中ServiceManager用于管理系统中的各种服务。下面说说startService过程所涉及的Binder对象的架构图：
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11GoaT7Ibu3ChO8ljA2X4ShugibdWTnxEBS8Pk9knkqY53AXvwjOr4JRg/640?wx_fmt=png&from=appmsg)
可以看出无论是注册服务和获取服务的过程都需要ServiceManager，需要注意的是此处的Service Manager是指Native层的ServiceManager（C++），并非指framework层的ServiceManager(Java)。ServiceManager是整个Binder通信机制的大管家，是Android进程间通信机制Binder的守护进程，Client端和Server端通信时都需要先获取Service Manager接口，才能开始通信服务, 当然查找到目标信息可以缓存起来则不需要每次都向ServiceManager请求。
图中Client/Server/ServiceManage之间的相互通信都是基于Binder机制。既然基于Binder机制通信，那么同样也是C/S架构，则图中的3大步骤都有相应的Client端与Server端。

1. **注册服务**：首先AMS注册到ServiceManager。该过程：AMS所在进程(system_server)是客户端，ServiceManager是服务端。
2. **获取服务**：Client进程使用AMS前，须先向ServiceManager中获取AMS的代理类AMP。该过程：AMP所在进程(app process)是客户端，ServiceManager是服务端。
3. **使用服务**： app进程根据得到的代理类AMP,便可以直接与AMS所在进程交互。该过程：AMP所在进程(app process)是客户端，AMS所在进程(system_server)是服务端。

图中的Client,Server,Service Manager之间交互都是虚线表示，是由于它们彼此之间不是直接交互的，而是都通过与Binder Driver进行交互的，从而实现IPC通信方式。其中Binder驱动位于内核空间，Client,Server,Service Manager位于用户空间。Binder驱动和Service Manager可以看做是Android平台的基础架构，而Client和Server是Android的应用层.
这3大过程每一次都是一个完整的Binder IPC过程, 接下来从源码角度, 仅介绍**第3过程使用服务**, 即展开AMP.startService是如何调用到AMS.startService的过程.
**Tips:** 如果你只想了解大致过程,并不打算细扣源码, 那么你可以略过通信过程源码分析

