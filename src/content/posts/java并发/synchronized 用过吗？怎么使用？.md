---
title: "synchronized 用过吗？怎么使用？"
published: 2025-08-09
description: "synchronized 用过吗？怎么使用？"
tags: ["Java","并发","多线程"]
category: "java并发"
draft: false
slug: "java-concurrent-010"
---

### synchronized 用过吗？怎么使用？
synchronized 经常用的，用来保证代码的原子性。
synchronized 主要有三种用法：

- **修饰实例方法:** 作用于当前对象实例加锁，进入同步代码前要获得 **当前对象实例的锁**

```java
synchronized void method() {
  //业务代码
}
```

- **修饰静态方法**：也就是给当前类加锁，会作⽤于类的所有对象实例 ，进⼊同步代码前要获得当前 class 的锁。因为静态成员不属于任何⼀个实例对象，是类成员（ static 表明这是该类的⼀个静态资源，不管 new 了多少个对象，只有⼀份）。如果⼀个线程 A 调⽤⼀个实例对象的⾮静态 synchronized ⽅法，⽽线程 B 需要调⽤这个实例对象所属类的静态 synchronized ⽅法，是允许的，不会发⽣互斥现象，因为访问静态 synchronized ⽅法占⽤的锁是当前类的锁，⽽访问⾮静态 synchronized ⽅法占⽤的锁是当前实例对象锁。

```java
synchronized void staic method() {
 //业务代码
}
```

- **修饰代码块** ：指定加锁对象，对给定对象/类加锁。 synchronized(this|object) 表示进⼊同步代码库前要获得给定对象的锁。 synchronized(类.class) 表示进⼊同步代码前要获得 当前 **class** 的锁

```java
synchronized(this) {
 //业务代码
}
```