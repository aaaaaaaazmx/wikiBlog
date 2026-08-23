---
title: "除了原子性，synchronized 可见性，有序性，可重入性怎么实现？"
published: 2025-02-19
description: "除了原子性，synchronized 可见性，有序性，可重入性怎么实现？"
tags: ["Java","并发","多线程"]
category: "java并发"
draft: false
slug: "java-concurrent-053"
---

### 除了原子性，synchronized 可见性，有序性，可重入性怎么实现？
synchronized 怎么保证可见性？

- 线程加锁前，将清空工作内存中共享变量的值，从而使用共享变量时需要从主内存中重新读取最新的值。
- 线程加锁后，其它线程无法获取主内存中的共享变量。
- 线程解锁前，必须把共享变量的最新值刷新到主内存中。

synchronized 怎么保证有序性？
synchronized 同步的代码块，具有排他性，一次只能被一个线程拥有，所以 synchronized 保证同一时刻，代码是单线程执行的。
因为 as-if-serial 语义的存在，单线程的程序能保证最终结果是有序的，但是不保证不会指令重排。
所以 synchronized 保证的有序是执行结果的有序性，而不是防止指令重排的有序性。
synchronized 怎么实现可重入的呢？
synchronized 是可重入锁，也就是说，允许一个线程二次请求自己持有对象锁的临界资源，这种情况称为可重入锁。
synchronized 锁对象的时候有个计数器，他会记录下线程获取锁的次数，在执行完对应的代码块之后，计数器就会-1，直到计数器清零，就释放锁了。
之所以，是可重入的。是因为 synchronized 锁对象有个计数器，会随着线程获取锁后 +1 计数，当线程执行完毕后 -1，直到清零释放锁。