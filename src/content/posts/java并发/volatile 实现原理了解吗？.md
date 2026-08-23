---
title: "volatile 实现原理了解吗？"
published: 2021-10-09
description: "volatile 实现原理了解吗？"
tags: ["Java","并发","多线程"]
category: "java并发"
draft: false
slug: "java-concurrent-016"
---


### volatile 实现原理了解吗？
volatile 有两个作用，保证**可见性**和**有序性**。
volatile 怎么保证可见性的呢？
相比 synchronized 的加锁方式来解决共享变量的内存可见性问题，volatile 就是更轻量的选择，它没有上下文切换的额外开销成本。
volatile 可以确保对某个变量的更新对其他线程马上可见，一个变量被声明为 volatile 时，线程在写入变量时不会把值缓存在寄存器或者其他地方，而是会把值刷新回主内存 当其它线程读取该共享变量 ，会从主内存重新获取最新值，而不是使用当前线程的本地内存中的值。
例如，我们声明一个 volatile 变量 volatile int x = 0，线程 A 修改 x=1，修改完之后就会把新的值刷新回主内存，线程 B 读取 x 的时候，就会清空本地内存变量，然后再从主内存获取最新值。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUibHk3eNVqcUb1D6wrHC1La0HqjEEH0jI5EbLOia5NTBxYNeZkzv5AG25gGrC3qYbKp8PywJSBuJWQ/640?wx_fmt=png&from=appmsg)
volatile 怎么保证有序性的呢？
重排序可以分为编译器重排序和处理器重排序，valatile 保证有序性，就是通过分别限制这两种类型的重排序。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUibHk3eNVqcUb1D6wrHC1LagiauFo1eoHlUW5BibDA7NSEUyCmU6sOvczoDLYRBTGjoQdsNTWAo9m0Q/640?wx_fmt=png&from=appmsg)
为了实现 volatile 的内存语义，编译器在生成字节码时，会在指令序列中插入内存屏障来禁止特定类型的处理器重排序。

1. 在每个 volatile 写操作的前面插入一个StoreStore屏障
2. 在每个 volatile 写操作的后面插入一个StoreLoad屏障
3. 在每个 volatile 读操作的后面插入一个LoadLoad屏障
4. 在每个 volatile 读操作的后面插入一个LoadStore屏障

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUibHk3eNVqcUb1D6wrHC1LapqLOhr6T1lUlfkJnUcMicLcJWNv3aQIS687rjemMtgvQyhTX2qUc1PQ/640?wx_fmt=png&from=appmsg)
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUibHk3eNVqcUb1D6wrHC1LanAbiaY0CQomJ0Hn4G2eIIaDPMCechaDIR00ibicrfVY6dFrDJia3CRqohg/640?wx_fmt=png&from=appmsg)
