---
title: "synchronized关键字和Lock的区别你知道吗？为什么Lock的性能好一些？"
published: 2021-04-21
description: "synchronized关键字和Lock的区别你知道吗？为什么Lock的性能好一些？"
tags: ["Java","基础"]
category: "java基础"
draft: false
slug: "java-basic-039"
---

## synchronized关键字和Lock的区别你知道吗？为什么Lock的性能好一些？


类别 | synchronized | Lock（底层实现主要是Volatile + CAS） | 
---|---|---|
存在层次 | Java的关键字，在jvm层面上 | 是一个类 |
锁的释放 | 1、已获取锁的线程执行完同步代码，释放锁          2、线程执行发生异常，jvm会让线程释放锁。 | 在finally中必须释放锁，不然容易造成线程死锁。 
锁的获取 | 假设A线程获得锁，B线程等待。如果A线程阻塞，B线程会一直等待。 | 分情况而定，Lock有多个锁获取的方式，大致就是可以尝试获得锁，线程可以不用一直等待  |
锁状态 | 无法判断 | 可以判断 |
锁类型 | 可重入 不可中断 非公平	| 可重入 可判断 可公平（两者皆可） |
性能 | 少量同步 | 大量同步 |
    

### 区别
Lock（ReentrantLock）的底层实现主要是Volatile + CAS（乐观锁），

Synchronized是一种悲观锁，比较耗性能。但是在JDK1.6以后对Synchronized的锁机制进行了优化，加入了偏向锁、轻量级锁、自旋锁、重量级锁，在并发量不大的情况下，性能可能优于Lock机制。所以建议一般请求并发量不大的情况下使用synchronized关键字。

