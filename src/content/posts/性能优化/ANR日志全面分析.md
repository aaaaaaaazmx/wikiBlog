---
title: "ANR日志全面分析"
published: 2026-01-11
description: "总结ANR日志分析经验与技巧"
tags: ["性能优化", "Android", "ANR"]
category: "性能优化"
draft: false
slug: "performance-anr-analysis"
---

# ANR 日志全面分析
---

## 文章摘要

> 本文总结的技巧来自笔者工作中的大量ANR日志分析经验
>
> 【云台】https://juejin.cn/post/6971327652468621326

## 一、概述

ANR我们在日常开发中经常遇到，不过如何分析它有时候却是捉襟见肘。正确的分析ANR日志是Android 开发者需要掌握的技巧之一，今天就来聊聊这话题

## 二、ANR产生的原因是什么

主要分为2大类

**「1、系统繁忙导致的ANR」**

- CPU被抢占
- 系统服务无法及时响应
- 其他应用占用的大量内存

**「2、来自应用层耗时操作导致的ANR」**

- 锁出错：主线程等待子线程的锁
- 内存紧张
- 函数阻塞：如死循环、主线程IO、处理大数据

## 三、日志分析

当系统出现ANR的时候，会产生一份anr日志文件（一般在手机的/data/anr 目录下），会记录出现anr时候的关键信息。

### 3.1 内存相关信息

从含义可以得出结论：**「Free memory until OOME」** 的值很小的时候，已经处于内存紧张状态。应用可能是占用了过多内存。另外，除了trace文件中有内存信息，普通的eventlog日志中，也有内存信息（不一定打印）

```
04-02 22:00:08.195 1531 1544 I am_meminfo: [350937088,41086976,492830720,427937792,291887104]
```

上面四个值分别指的是：

- Cached
- Free
- Zram
- Kernel,Native

Cached+Free的内存代表着当前整个手机的可用内存，如果值很小，意味着处于内存紧张状态。一般低内存的判定阈值为：4G 内存手机以下阀值：350MB，以上阀值则为：450MB

**「ps:如果ANR时间点前后，日志里有打印onTrimMemory，也可以作为内存紧张的一个参考判断」**

### 3.2 CPU的负载情况

如上所示：

- 第一行：1、5、15 分钟内正在使用和等待使用CPU 的活动进程的平均数
- 第二行：表明负载信息抓取在ANR发生之后的0~1987ms。同时也指明了ANR的时间点：2020-03-10 08:31:55.169
- 中间部分：各个进程占用的CPU的详细情况
- 最后一行：各个进程合计占用的CPU信息。

> 名词解释：
> - user: 用户态
> - kernel: 内核态
> - faults: 内存缺页，minor——轻微的，major——重度，需要从磁盘拿数据
> - iowait: IO使用（等待）占比
> - irq: 硬中断
> - softirq: 软中断

注意：

- iowait占比很高，意味着有很大可能，是io耗时导致ANR，具体进一步查看有没有进程faults major比较多。
- 单进程CPU的负载并不是以100%为上限，而是有几个核，就有百分之几百，如4核上限为400%。

### 3.3 堆栈信息

堆栈信息展示了ANR发生的进程当前所有线程的状态。

如上日志所示，本文截图了两个线程信息，一个是主线程main，它的状态是native。另一个是OkHttp ConnectionPool，它的状态是TimeWaiting。我们知道 线程状态有5种：**「新建、就绪、执行、阻塞、死亡」**。而Java中的线程状态有6种，6种状态都定义在：java.lang.Thread.State中



![a](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c9d8fbbdb22f47fa8244c9305871a2e8~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

**「问题来了，上述main线程的native是什么状态，哪来的？」**

其实trace文件中的状态是是CPP代码中定义的状态，下面是一张对应关系表。

![asd](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/55ea536a4b3f4108abe5214f8ec15f0d~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

由此可知，main函数的native状态是正在执行JNI函数。堆栈信息是我们分析ANR的第一个重要的信息，一般来说：main线程处于 BLOCK、WAITING、TIMEWAITING状态，那基本上是函数阻塞导致ANR；如果main线程无异常，则应该排查CPU负载和内存环境。

## 四、典型案例分析

### 4.1 主线程中的耗时操作

通过日志可以看出，主线程正处于执行状态，看堆栈信息可知不是处于空闲状态，发生ANR是因为一处click监听函数里执行了耗时操作。

### 4.2 内存紧张导致ANR

如果CPU和堆栈都很正常，但是仍旧发生ANR，可能是内存紧张导致。

比如ANR的时间点是 2020-10-31 22:38:58.468—CPU usage from 0ms to 21752ms later (2020-10-31 22:38:58.468 to 2020-10-31 22:39:20.220)

再去系统日志里搜索onTrimMemory，可以看出，在发生ANR的时间点前后，内存都处于紧张状态，level等级是80，查看Android API 文档；

可知80这个等级是很严重的，应用马上就要被杀死，被杀死的这个应用从名字可以看出来是桌面，连桌面都快要被杀死，那普通应用能好到哪里去呢？

一般来说，发生内存紧张，会导致多个应用发生ANR，所以在日志中如果发现有多个应用一起ANR了，可以初步判定，此ANR与你的应用无关。

### 4.3 主线程被锁阻塞

这个例子比较典型：主线程被锁阻塞的例子；

```
waiting to lock <0x01aed1da> (a java.lang.Object) held by thread 3
```

等待的锁是`<0x01aed1da>`，这个锁的持有者是线程 3。进一步搜索 "tid=3" 找到线程3， 发现它正在TimeWating。

由此ANR的原因可以归结为：线程3持有了一把锁，并且自身长时间不释放，主线程等待这把锁发生超时。在线上环境中，常见因锁而ANR的场景是SharePreference写入。

### 4.4 CPU被抢占

如上日志，此时占据CPU高达543%，抢占了大部分CPU资源，因而导致发生ANR。

### 4.5 系统服务超时导致ANR

系统服务超时一般会包含`BinderProxy.transactNative`关键字。

关键信息显示在 **「getActiveNetworkInfo」** 时候发生的ANR

我们知道：系统的服务都是Binder机制，binder线程池中有16个线程，服务能力也是有限的，有可能系统服务长时间不响应导致ANR。如果其他应用占用了所有Binder线程，那么当前应用只能等待。

---

## 推荐阅读

- [并发Bug的源头与可见性、有序性、原子性](http://mp.weixin.qq.com/s?__biz=MzU5OTgzNzM0NA==&mid=2247488851&idx=1&sn=b1719b2d8199e5d593073dc1a394acb4&chksm=feaf8a9cc9d8038a0d941fe1ee1641708aa2e0b7352e97cf33c42178e11e603586bdefb25383&scene=21#wechat_redirect)
- [深入理解 suspend关键字](http://mp.weixin.qq.com/s?__biz=MzU5OTgzNzM0NA==&mid=2247488334&idx=1&sn=c2a5825a913731667d4d6f6579a775d0&chksm=feaf8c81c9d8059729094ccebf0f48c43c437b2955cd5281abae4f6c2080fe0105aaf09626e0&scene=21#wechat_redirect)
- [裸辞创业并不是一件容易的事情](http://mp.weixin.qq.com/s?__biz=MzU5OTgzNzM0NA==&mid=2247487442&idx=1&sn=dc562ef219cad2504b92a96ba901d6e3&chksm=feaf901dc9d8190b703ae0e9677d9af9fc3d9a624cc2c7bb38538525c49243d0d4b2ae7954aa&scene=21#wechat_redirect)
