---
title: "Binder机制的作用和原理"
published: 2021-07-04
description: "Binder机制的作用和原理"
tags: ["Android","进阶"]
category: "android进阶"
draft: false
slug: "android-adv-018"
---

# Binder机制的作用和原理

Linux系统将一个进程分为用户空间和内核空间。对于进程之间来说，用户空间的数据不可共享，内核空间的数据可共享，为了保证安全性和独立性，一个进程不能直接操作或者访问另一个进程，即Android的进程是相互独立、隔离的，这就需要跨进程之间的数据通信方式。普通的跨进程通信方式一般需要2次内存拷贝，如下图所示：

![image](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUw9BicVvmviceybO8w5pgneyQGIw6VuEgxMqYPibDvbT0RKry6NkxZGSDnLx4EJ1ERHPpM8ibrHQyOHw/640?wx_fmt=png)


一次完整的 Binder IPC 通信过程通常是这样：

- 首先 Binder 驱动在内核空间创建一个数据接收缓存区。
- 接着在内核空间开辟一块内核缓存区，建立内核缓存区和内核中数据接收缓存区之间的映射关系，以及内核中数据接收缓存区和接收进程用户空间地址的映射关系。
- 发送方进程通过系统调用 copyfromuser() 将数据 copy 到内核中的内核缓存区，由于内核缓存区和接收进程的用户空间存在内存映射，因此也就相当于把数据发送到了接收进程的用户空间，这样便完成了一次进程间的通信。

![image](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUw9BicVvmviceybO8w5pgneyyc4DD0rJ2j05QTnTBkgTawIcr5aMB4nCjU7lcgmRRhw6ehW5OqWUXA/640?wx_fmt=png)


