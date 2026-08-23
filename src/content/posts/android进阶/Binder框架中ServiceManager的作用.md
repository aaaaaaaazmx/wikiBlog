---
title: "Binder框架中ServiceManager的作用"
published: 2021-05-26
description: "Binder框架中ServiceManager的作用"
tags: ["Android","进阶"]
category: "android进阶"
draft: false
slug: "android-adv-019"
---

# Binder框架中ServiceManager的作用

Binder框架 是基于 C/S 架构的。由一系列的组件组成，包括 Client、Server、ServiceManager、Binder驱动，其中 Client、Server、Service Manager 运行在用户空间，Binder 驱动运行在内核空间。如下图所示：

![image](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUw9BicVvmviceybO8w5pgneyhEWDjVAErv9zMUvgD5npg4A2M2vDlgYzyLicBgM2WaSyzxiaHOWsA2Ww/640?wx_fmt=png)



- Server&Client：服务器&客户端。在Binder驱动和Service Manager提供的基础设施上，进行Client-Server之间的通信。
- ServiceManager（如同DNS域名服务器）服务的管理者，将Binder名字转换为Client中对该Binder的引用，使得Client可以通过Binder名字获得Server中Binder实体的引用。
- Binder驱动（如同路由器）：负责进程之间binder通信的建立，计数管理以及数据的传递交互等底层支持。

最后，结合[Android跨进程通信：图文详解 Binder机制 ](https://blog.csdn.net/carson_ho/article/details/73560642)的总结图来综合理解一下：
(https://blog.csdn.net/carson_ho/article/details/73560642)

![image](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUw9BicVvmviceybO8w5pgneyNrxEt7hic7icicANMb5Q5Qib7FeRqSkLTx0dKn7DZlsXAV29yjnXM1A4dw/640?wx_fmt=png)
