---
title: "CopyOnWriteArrayList 了解多少？"
published: 2020-09-11
description: "CopyOnWriteArrayList 了解多少？"
tags: ["Java","集合","数据结构"]
category: "java集合"
draft: false
slug: "java-collection-005"
---

### CopyOnWriteArrayList 了解多少？
CopyOnWriteArrayList 就是线程安全版本的 ArrayList。

它的名字叫CopyOnWrite——写时复制，已经明示了它的原理。、

CopyOnWriteArrayList 采用了一种读写分离的并发策略。

CopyOnWriteArrayList 容器允许并发读，读操作是无锁的，性能较高。至于写操作，比如向容器中添加一个元素，则首先将当前容器复制一份，然后在新副本上执行写操作，结束之后再将原容器的引用指向新容器。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1StPHf0GqjjMaMYJP52myrkRAxPve0RddmETZ84RBqO44L1Besgs847A/640?wx_fmt=png&from=appmsg)