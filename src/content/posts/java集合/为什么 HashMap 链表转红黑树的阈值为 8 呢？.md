---
title: "为什么 HashMap 链表转红黑树的阈值为 8 呢？"
published: 2025-09-02
description: "为什么 HashMap 链表转红黑树的阈值为 8 呢？"
tags: ["Java","集合","数据结构"]
category: "java集合"
draft: false
slug: "java-collection-012"
---


### 为什么 HashMap 链表转红黑树的阈值为 8 呢？
树化发生在 table 数组的长度大于 64，且链表的长度大于 8 的时候。
为什么是 8 呢？源码的注释也给出了答案。
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1S4J1ibUEcGD60sbATwIfhv5ujZbZ3craIpBAak1AYicB9rU0W8ialHxvxw/640?wx_fmt=png&from=appmsg)
源码注释
红黑树节点的大小大概是普通节点大小的两倍，所以转红黑树，牺牲了空间换时间，更多的是一种兜底的策略，保证极端情况下的查找效率。
阈值为什么要选 8 呢？和统计学有关。理想情况下，使用随机哈希码，链表里的节点符合泊松分布，出现节点个数的概率是递减的，节点个数为 8 的情况，发生概率仅为0.00000006。
至于红黑树转回链表的阈值为什么是 6，而不是 8？是因为如果这个阈值也设置成 8，假如发生碰撞，节点增减刚好在 8 附近，会发生链表和红黑树的不断转换，导致资源浪费。