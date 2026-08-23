---
title: "指令重排有限制吗？happens-before 了解吗？"
published: 2023-08-11
description: "指令重排有限制吗？happens-before 了解吗？"
tags: ["Java","并发","多线程"]
category: "java并发"
draft: false
slug: "java-concurrent-025"
---


### 指令重排有限制吗？happens-before 了解吗？
指令重排也是有一些限制的，有两个规则happens-before和as-if-serial来约束。
happens-before 的定义：

- 如果一个操作 happens-before 另一个操作，那么第一个操作的执行结果将对第二个操作可见，而且第一个操作的执行顺序排在第二个操作之前。
- 两个操作之间存在 happens-before 关系，并不意味着 Java 平台的具体实现必须要按照 happens-before 关系指定的顺序来执行。如果重排序之后的执行结果，与按 happens-before 关系来执行的结果一致，那么这种重排序并不非法

happens-before 和我们息息相关的有六大规则：
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUibHk3eNVqcUb1D6wrHC1LagibAhD0ZmMBWMGGuopr7cUib861zS7LOwoBlic5ZCZv7Q4cnshXNpeCjA/640?wx_fmt=png&from=appmsg)
happens-before六大规则

- **程序顺序规则**：一个线程中的每个操作，happens-before 于该线程中的任意后续操作。
- **监视器锁规则**：对一个锁的解锁，happens-before 于随后对这个锁的加锁。
- **volatile 变量规则**：对一个 volatile 域的写，happens-before 于任意后续对这个 volatile 域的读。
- **传递性**：如果 A happens-before B，且 B happens-before C，那么 A happens-before C。
- **start()规则**：如果线程 A 执行操作 ThreadB.start()（启动线程 B），那么 A 线程的 ThreadB.start()操作 happens-before 于线程 B 中的任意操作。
- **join()规则**：如果线程 A 执行操作 ThreadB.join()并成功返回，那么线程 B 中的任意操作 happens-before 于线程 A 从 ThreadB.join()操作成功返回。