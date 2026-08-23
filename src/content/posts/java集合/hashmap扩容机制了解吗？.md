---
title: "hashmap扩容机制了解吗？"
published: 2022-10-03
description: "hashmap扩容机制了解吗？"
tags: ["Java","集合","数据结构"]
category: "java集合"
draft: false
slug: "java-collection-008"
---

### hashmap扩容机制了解吗？
扩容时，HashMap 会创建一个新的数组，其容量是原数组容量的两倍。
然后将键值对放到新计算出的索引位置上。一部分索引不变，另一部分索引为“原索引+旧容量”。
在 JDK 7 中，定位元素位置的代码是这样的：

```java
static int indexFor(int h, int length) {
    // assert Integer.bitCount(length) == 1 : "length must be a non-zero power of 2";
    return h & (length-1);
}
```
其实就相当于用键的哈希值和数组大小取模，也就是 hashCode % table.length。
那我们来假设：

- 数组 table 的长度为 2
- 键的哈希值为 3、7、5

取模运算后，键发生了哈希冲突，都到 table[1] 上了。那么扩容前就是这个样子。
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1SYricBK76HymmvNJMtuyrJHXsdYaEGtMwLqWDdx05Wzn3Piciatj1RoJyw/640?wx_fmt=png&from=appmsg)
数组的容量为 2，key 为 3、7、5 的元素在 table[1] 上，需要通过拉链法来解决哈希冲突。
假设负载因子 loadFactor 为 1，也就是当元素的个数大于 table 的长度时进行扩容。
扩容后的数组容量为 4。

- key 3 取模（3%4）后是 3，放在 table[3] 上。
- key 7 取模（7%4）后是 3，放在 table[3] 上的链表头部。
- key 5 取模（5%4）后是 1，放在 table[1] 上。

![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1SrvQK7pJgUWrMQu3Ly0v0jS9OvibYJdEPxK1PSD5v6CWNF3tWMGew9EA/640?wx_fmt=png&from=appmsg)
7 跑到 3 的前面了，因为 JDK 7 使用的是头插法。

```java
e.next = newTable[i];
```
同时，扩容后的 5 跑到了下标为 1 的位置。
最好的情况就是，扩容后的 7 在 3 的后面，5 在 7 的后面，保持原来的顺序。
JDK 8 完全扭转了这个局面，因为 JDK 8 的哈希算法进行了优化，当数组长度为 2 的幂次方时，能够很巧妙地解决 JDK 7 中遇到的问题。
JDK 8 的扩容代码如下所示：

```java
Node<K,V>[] newTab = new Node[newCapacity];
for (int j = 0; j < oldTab.length; j++) {
    Node<K,V> e = oldTab[j];
    if (e != null) {
        int hash = e.hash;
        int newIndex = hash & (newCapacity - 1); // 计算在新数组中的位置
        // 将节点移动到新数组的对应位置
        newTab[newIndex] = e;
    }
}
```
新索引的计算方式是 hash & (newCapacity - 1)，和 JDK 7 的 h & (length-1)没什么大的差别，差别主要在 hash 方法上，JDK 8 是这样：

```java
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```
过将键的hashCode()返回的 32 位哈希值与这个哈希值无符号右移 16 位的结果进行异或。
JDK 7 是这样：

```java
final int hash(Object k) {
    int h = hashSeed;
    if (0 != h && k instanceof String) {
        return sun.misc.Hashing.stringHash32((String) k);
    }

    h ^= k.hashCode();

    // This function ensures that hashCodes that differ only by
    // constant multiples at each bit position have a bounded
    // number of collisions (approximately 8 at default load factor).
    h ^= (h >>> 20) ^ (h >>> 12);
    return h ^ (h >>> 7) ^ (h >>> 4);
}
```
我们用 JDK 8 的哈希算法来计算一下哈希值，就会发现别有洞天。
假设扩容前的数组长度为 16（n-1 也就是二进制的 0000 1111，1X20+1X21+1X22+1X23=1+2+4+8=15），key1 为 5（二进制为 0000 0101），key2 为 21（二进制为 0001 0101）。

- key1 和 n-1 做 & 运算后为 0000 0101，也就是 5；
- key2 和 n-1 做 & 运算后为 0000 0101，也就是 5。
- 此时哈希冲突了，用拉链法来解决哈希冲突。

现在，HashMap 进行了扩容，容量为原来的 2 倍，也就是 32（n-1 也就是二进制的 0001 1111，1X20+1X21+1X22+1X23+1X24=1+2+4+8+16=31）。

- key1 和 n-1 做 & 运算后为 0000 0101，也就是 5；
- key2 和 n-1 做 & 运算后为 0001 0101，也就是 21=5+16，也就是数组扩容前的位置+原数组的长度。

神奇吧？
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1Sl9R2YNkiaYpeJw7vu4VgBg1ickAibPZS9Sobql4IwuIBIhnBxuf0s5UzQ/640?wx_fmt=png&from=appmsg)
扩容位置变化
也就是说，在 JDK 8 的新 hash 算法下，数组扩容后的索引位置，要么就是原来的索引位置，要么就是“原索引+原来的容量”，遵循一定的规律。
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1S8dGLsRxXRZicnoFwVOcwVh13oQRb9y6mwnkDY9TrfRXUwIg1L8VzQzA/640?wx_fmt=png&from=appmsg)
扩容节点迁移示意图
当然了，这个功劳既属于新的哈希算法，也离不开 n 为 2 的整数次幂这个前提，这是它俩通力合作后的结果 hash & (newCapacity - 1)。