---
title: "ThreadLocalMap 的结构了解吗？"
published: 2025-10-25
description: "ThreadLocalMap 的结构了解吗？"
tags: ["Java","并发","多线程"]
category: "java并发"
draft: false
slug: "java-concurrent-015"
---

### ThreadLocalMap 的结构了解吗？
ThreadLocalMap 虽然被叫做 Map，其实它是没有实现 Map 接口的，但是结构还是和 HashMap 比较类似的，主要关注的是两个要素：**元素数组和散列方法**。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUibHk3eNVqcUb1D6wrHC1Laxx563qicJxl44ic3EicY6ZeSriaVs8ykLw3xpZKf4iaod2Mczh2M4a2wT9w/640?wx_fmt=png&from=appmsg)
ThreadLocalMap结构示意图

- 元素数组一个 table 数组，存储 Entry 类型的元素，Entry 是 ThreaLocal 弱引用作为 key，Object 作为 value 的结构。

```java
private Entry[] table;
```

- 散列方法散列方法就是怎么把对应的 key 映射到 table 数组的相应下标，ThreadLocalMap 用的是哈希取余法，取出 key 的 threadLocalHashCode，然后和 table 数组长度减一&运算（相当于取余）。

```java
int i = key.threadLocalHashCode & (table.length - 1);
```
这里的 threadLocalHashCode 计算有点东西，每创建一个 ThreadLocal 对象，它就会新增0x61c88647，这个值很特殊，它是**斐波那契数** 也叫 **黄金分割数**。hash增量为 这个数字，带来的好处就是 hash **分布非常均匀**。

```java
private static final int HASH_INCREMENT = 0x61c88647;

    private static int nextHashCode() {
        return nextHashCode.getAndAdd(HASH_INCREMENT);
    }
```