---
title: "ConcurrentHashMap加锁机制是什么"
published: 2023-04-16
description: "ConcurrentHashMap加锁机制是什么"
tags: ["Java","基础"]
category: "java基础"
draft: false
slug: "java-basic-006"
---

# ConcurrentHashMap加锁机制是什么


## Java7 ConcurrentHashMap

ConcurrentHashMap作为一种**线程安全**且高效的哈希表的解决方案，尤其其中的"**分段锁**"的方案，相比HashTable的表锁在性能上的提升非常之大。HashTable容器在竞争激烈的并发环境下表现出效率低下的原因，是因为所有访问HashTable的线程都必须竞争同一把锁，那假如容器里有多把锁，每一把锁用于锁容器其中一部分数据，那么当多线程访问容器里不同数据段的数据时，线程间就不会存在锁竞争，从而可以有效的提高并发访问效率，这就是

ConcurrentHashMap所使用的锁分段技术，首先将数据分成一段一段的存储，然后给每一段数据配一把锁，当一个线程占用锁访问其中一个段数据的时候，其他段的数据也能被其他线程访问。

ConcurrentHashMap 是一个 Segment 数组，Segment 通过继承 ReentrantLock 来进行加锁，所以每次需要加锁的操作锁住的是一个 segment，这样只要保证每个 Segment 是线程安全的，也就实现了全局的线程安全。

concurrencyLevel：并行级别、并发数、Segment 数。默认是 16，也就是说 ConcurrentHashMap 有 16 个 Segments，所以理论上，这个时候，最多可以同时支持 16 个线程并发写，只要它们的操作分别分布在不同的 Segment 上。这个值可以在初始化的时候设置为其他值，但是一旦初始化以后，它是不可以扩容的。其中的每个 Segment 很像 HashMap，不过它要保证线程安全，所以处理起来要麻烦些。

初始化槽: ensureSegment

ConcurrentHashMap 初始化的时候会初始化第一个槽 segment[0]，对于其他槽来说，在插入第一个值的时候进行初始化。对于并发操作使用 CAS 进行控制。

## Java8 ConcurrentHashMap

抛弃了原有的 Segment 分段锁，而采用了 **CAS + synchronized** 来保证并发安全性。结构上和 Java8 的 HashMap（数组+链表+红黑树） 基本上一样，不过它要保证线程安全性，所以在源码上确实要复杂一些。1.8 在 1.7 的数据结构上做了大的改动，采用红黑树之后可以保证查询效率（O(logn)），甚至取消了 ReentrantLock 改为了 synchronized，这样可以看出在新版的 JDK 中对 synchronized 优化是很到位的。
