---
title: "Java 有哪些保证原子性的方法？如何保证多线程下 i++ 结果正确？"
published: 2022-02-03
description: "Java 有哪些保证原子性的方法？如何保证多线程下 i++ 结果正确？"
tags: ["Java","并发","多线程"]
category: "java并发"
draft: false
slug: "java-concurrent-007"
---


### Java 有哪些保证原子性的方法？如何保证多线程下 i++ 结果正确？
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUibHk3eNVqcUb1D6wrHC1Latm3hYNNicr9uIWe8sdvZ8XQbPGoQaDyYwIU9Fw7hgAkjcApuuiaKeptg/640?wx_fmt=png&from=appmsg)
Java保证原子性方法

- 使用循环原子类，例如 AtomicInteger，实现 i++原子操作
- 使用 juc 包下的锁，如 ReentrantLock ，对 i++操作加锁 lock.lock()来实现原子性
- 使用 synchronized，对 i++操作加锁