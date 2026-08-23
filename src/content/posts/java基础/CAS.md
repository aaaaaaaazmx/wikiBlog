---
title: "CAS"
published: 2025-01-30
description: "CAS"
tags: ["Java","基础"]
category: "java基础"
draft: false
slug: "java-basic-004"
---

# CAS

## CAS介绍？

### Unsafe

Unsafe是CAS的核心类。因为Java无法直接访问底层操作系统，而是通过本地（native）方法来访问。不过尽管如此，JVM还是开了一个后门，JDK中有一个类Unsafe，它提供了硬件级别的原子操作。

### CAS

**CAS，Compare and Swap即比较并交换**，设计并发算法时常用到的一种技术，java.util.concurrent包全完建立在CAS之上，没有CAS也就没有此包，可见CAS的重要性。当前的处理器基本都支持CAS，只不过不同的厂家的实现不一样罢了。并且CAS也是通过Unsafe实现的，由于CAS都是硬件级别的操作，因此效率会比普通加锁高一些。

### CAS的缺点

CAS看起来很美，但这种操作显然无法涵盖并发下的所有场景，并且CAS从语义上来说也不是完美的，存在这样一个逻辑漏洞：如果一个变量V初次读取的时候是A值，并且在准备赋值的时候检查到它仍然是A值，那我们就能说明它的值没有被其他线程修改过了吗？如果在这段期间它的值曾经被改成了B，然后又改回A，那CAS操作就会误认为它从来没有被修改过。这个漏洞称为CAS操作的"ABA"问题。java.util.concurrent包为了解决这个问题，提供了一个带有标记的原子引用类"AtomicStampedReference"，它可以通过控制变量值的版本来保证CAS的正确性。不过目前来说这个类比较"鸡肋"，大部分情况下ABA问题并不会影响程序并发的正确性，如果需要解决ABA问题，使用传统的互斥同步可能回避原子类更加高效。

### 底层原理

借助CPU底层指令cmpxchg实现原子操作。