---
title: "ServiceManger查找服务"
published: 2023-11-23
description: "ServiceManger查找服务"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-026"
---

# ServiceManger查找服务

回答这个问题的时候，我们紧扣2个点

1. **找到ServiceManger服务**
2. **传入name到ServiceManger查询服务**

如何找到ServiceManager服务这个前面已经说过了，总结下就是getIServiceManager从binder驱动拿到handle=0的BpBinder，进而拿到ServiceManager，开启后续流程

查询服务这里看下核心代码
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11Dtn7XmtTObM95CQ4MoPicQtuDRAL2Zg9TXdSVsc3yGr0AIxMEpZEYYQ/640?wx_fmt=png&from=appmsg)
最终还是通过BpBinder发送消息，进而发送到Binder驱动。
此时驱动收到的信息包括不限于：
> 1. 服务的名字
> 2. ServiceManager的handle

Binder驱动收到消息后，找到ServiceManger，并将服务的名字传给ServiceManger，ServiceManger从自己维护的链表里找到服务名相同的节点，最终取出该服务的handle，发送给Binder驱动。通过进程间通信告知发起查询的进程
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWHLmREemjAnUQiaSCXEWib11Kxo2MXsIqGNZss6XxLHeWqws0753xQicmlgrZ8CiaQxAEEiaCrnUZmVkQ/640?wx_fmt=png&from=appmsg)
