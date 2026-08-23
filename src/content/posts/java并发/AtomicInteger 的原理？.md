---
title: "AtomicInteger 的原理？"
published: 2024-03-17
description: "AtomicInteger 的原理？"
tags: ["Java","并发","多线程"]
category: "java并发"
draft: false
slug: "java-concurrent-002"
---

### AtomicInteger 的原理？
一句话概括：**使用 CAS 实现**。
以 AtomicInteger 的添加方法为例：

```java
public final int getAndIncrement() {
        return unsafe.getAndAddInt(this, valueOffset, 1);
    }
```
通过Unsafe类的实例来进行添加操作，来看看具体的 CAS 操作：

```java
public final int getAndAddInt(Object var1, long var2, int var4) {
    int var5;
    do {
        var5 = this.getIntVolatile(var1, var2);
    } while(!this.compareAndSwapInt(var1, var2, var5, var5 + var4));

    return var5;
}
```
compareAndSwapInt 是一个 native 方法，基于 CAS 来操作 int 类型变量。其它的原子操作类基本都是大同小异。