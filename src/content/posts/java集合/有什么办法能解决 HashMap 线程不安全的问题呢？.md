---
title: "有什么办法能解决 HashMap 线程不安全的问题呢？"
published: 2020-08-21
description: "有什么办法能解决 HashMap 线程不安全的问题呢？"
tags: ["Java","集合","数据结构"]
category: "java集合"
draft: false
slug: "java-collection-018"
---

### 有什么办法能解决 HashMap 线程不安全的问题呢？
在 Java 中，有 3 种线程安全的 Map 实现，最常用的是[ConcurrentHashMap](https://javabetter.cn/thread/ConcurrentHashMap.html)和Collections.synchronizedMap(Map)包装器。
Hashtable 也是线程安全的，但它的使用已经不再推荐使用，因为 ConcurrentHashMap 提供了更高的并发性和性能。
①、HashTable 是直接在方法上加 [synchronized 关键字](https://javabetter.cn/thread/synchronized-1.html)，比较粗暴。
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1SLJAs0PicUhicW9aWkia5tE4KaKXrNO8cfXtd7mXeo7XDHyO2TicvOlatnQ/640?wx_fmt=png&amp;from=appmsg)
②、Collections.synchronizedMap 返回的是 [Collections](https://javabetter.cn/common-tool/collections.html)工具类的内部类。
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1SGJrCJ1eCmiaOctvsibX7b8tu3UxD90Fw7ic4ib3PkoUKe5HJVkHOpj8D0g/640?wx_fmt=png&amp;from=appmsg)
内部是通过 synchronized 对象锁来保证线程安全的。
③、[ConcurrentHashMap](https://javabetter.cn/thread/ConcurrentHashMap.html)在 JDK 7 中使用分段锁，在 JKD 8 中使用了 CAS+节点锁，性能得到进一步提升。
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1S5VUYAMWa4Vxxw0tYXImtcjufzmiagfgMRf3JrbRibGGqgBVQC0tSm5KQ/640?wx_fmt=png&amp;from=appmsg)
ConcurrentHashMap 8 中的实现
#### 为什么 ConcurrentHashMap 比 Hashtable 效率高
Hashtable 在任何时刻只允许一个线程访问整个 Map，通过对整个 Map 加锁来实现线程安全。
而 ConcurrentHashMap（尤其是在 JDK 8 及之后版本）通过锁分离和 CAS 操作实现更细粒度的锁定策略，允许更高的并发。

```java
static final <K,V> boolean casTabAt(Node<K,V>[] tab, int i,
                                    Node<K,V> c, Node<K,V> v) {
    return U.compareAndSwapObject(tab, ((long)i << ASHIFT) + ABASE, c, v);
}
```
CAS 操作是一种乐观锁，它不会阻塞线程，而是在更新时检查是否有其他线程已经修改了数据，如果没有就更新，如果有就重试。
ConcurrentHashMap 允许多个读操作并发进行而不加锁，因为它通过 [volatile 变量](https://javabetter.cn/thread/volatile.html)来保证读取操作的内存可见性。相比之下，Hashtable 对读操作也加锁，增加了开销。

```java
public V get(Object key) {
    Node<K,V>[] tab; Node<K,V> e, p; int n, eh; K ek;
	// 1. 重hash
    int h = spread(key.hashCode());
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (e = tabAt(tab, (n - 1) & h)) != null) {
        // 2. table[i]桶节点的key与查找的key相同，则直接返回
		if ((eh = e.hash) == h) {
            if ((ek = e.key) == key || (ek != null && key.equals(ek)))
                return e.val;
        }
		// 3. 当前节点hash小于0说明为树节点，在红黑树中查找即可
        else if (eh < 0)
            return (p = e.find(h, key)) != null ? p.val : null;
        while ((e = e.next) != null) {
		//4. 从链表中查找，查找到则返回该节点的value，否则就返回null即可
            if (e.hash == h &&
                ((ek = e.key) == key || (ek != null && key.equals(ek))))
                return e.val;
        }
    }
    return null;
}
```