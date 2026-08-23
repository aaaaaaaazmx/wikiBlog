---
title: "能说一下 HashMap 的数据结构吗？"
published: 2021-07-22
description: "能说一下 HashMap 的数据结构吗？"
tags: ["Java","集合","数据结构"]
category: "java集合"
draft: false
slug: "java-collection-021"
---

### 能说一下 HashMap 的数据结构吗？
推荐阅读：[二哥的 Java 进阶之路：详解 HashMap](https://javabetter.cn/collection/hashmap.html)
JDK 8 中 HashMap 的数据结构是数组+链表+红黑树。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1SH88uyHn4upESQicdwMbATnAKkWBgKZY0ic5uzBSiaDsod2DtibSWVOxTYg/640?wx_fmt=png&from=appmsg)
HashMap 的核心是一个动态数组（Node[] table），用于存储键值对。这个数组的每个元素称为一个“桶”（Bucket），每个桶的索引是通过对键的哈希值进行哈希函数处理得到的。
当多个键经哈希处理后得到相同的索引时，会发生哈希冲突。HashMap 通过链表来解决哈希冲突——即将具有相同索引的键值对通过链表连接起来。
不过，链表过长时，查询效率会比较低，于是当链表的长度超过 8 时（且数组的长度大于 64），链表就会转换为红黑树。红黑树的查询效率是 O(logn)，比链表的 O(n) 要快。数组的查询效率是 O(1)。
当向 HashMap 中添加一个键值对时，会使用哈希函数计算键的哈希码，确定其在数组中的位置，哈希函数的目标是尽量减少哈希冲突，保证元素能够均匀地分布在数组的每个位置上。

```java
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```
当向 HashMap 中添加元素时，如果该位置已有元素（发生哈希冲突），则新元素将被添加到链表的末尾或红黑树中。如果键已经存在，其对应的值将被新值覆盖。
当从 HashMap 中获取元素时，也会使用哈希函数计算键的位置，然后根据位置在数组、链表或者红黑树中查找元素。
HashMap 的初始容量是 16，随着元素的不断添加，HashMap 的容量（也就是数组大小）可能不足，于是就需要进行扩容，阈值是capacity * loadFactor，capacity 为容量，loadFactor 为负载因子，默认为 0.75。
扩容后的数组大小是原来的 2 倍，然后把原来的元素重新计算哈希值，放到新的数组中。
总的来说，HashMap 是一种通过哈希表实现的键值对集合，它通过将键哈希化成数组索引，并在冲突时使用链表或红黑树来存储元素，从而实现快速的查找、插入和删除操作。
