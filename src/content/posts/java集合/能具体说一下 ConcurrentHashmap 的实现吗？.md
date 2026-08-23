---
title: "能具体说一下 ConcurrentHashmap 的实现吗？"
published: 2020-09-04
description: "能具体说一下 ConcurrentHashmap 的实现吗？"
tags: ["Java","集合","数据结构"]
category: "java集合"
draft: false
slug: "java-collection-020"
---

### 能具体说一下 ConcurrentHashmap 的实现吗？
ConcurrentHashmap 线程安全在 jdk1.7 版本是基于分段锁实现，在 jdk1.8 是基于CAS+synchronized实现。
#### jdk 1.7分段锁
从结构上说，1.7 版本的 ConcurrentHashMap 采用分段锁机制，里面包含一个 Segment 数组，Segment 继承于 ReentrantLock，Segment 则包含 HashEntry 的数组，HashEntry 本身就是一个链表的结构，具有保存 key、value 的能力能指向下一个节点的指针。
实际上就是相当于每个 Segment 都是一个 HashMap，默认的 Segment 长度是 16，也就是支持 16 个线程的并发写，Segment 之间相互不会受到影响。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1SsBOUKgMgG1qBvVKzHKqD0g74XVxQNp8IgXdIcXzCVMFEdh2SPmVqFA/640?wx_fmt=png&from=appmsg)
**put 流程**
整个流程和 HashMap 非常类似，只不过是先定位到具体的 Segment，然后通过 ReentrantLock 去操作而已，后面的流程，就和 HashMap 基本上是一样的。

1. 计算 hash，定位到 segment，segment 如果是空就先初始化
2. 使用 ReentrantLock 加锁，如果获取锁失败则尝试自旋，自旋超过次数就阻塞获取，保证一定获取锁成功
3. 遍历 HashEntry，就是和 HashMap 一样，数组中 key 和 hash 一样就直接替换，不存在就再插入链表，链表同样操作

![](https://mmbiz.qpic.cn/mmbiz_jpg/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1ScKJsKZ1ibSBebuLM2OWvbUticOuDtejXr5vmzf1CsxBZicFaZoqpIjMPg/640?wx_fmt=webp&from=appmsg)
**get 流程**
get 也很简单，key 通过 hash 定位到 segment，再遍历链表定位到具体的元素上，需要注意的是 value 是 volatile 的，所以 get 是不需要加锁的。
#### jdk**1.8 CAS+synchronized**
jdk1.8 实现线程安全不是在数据结构上下功夫，它的数据结构和 HashMap 是一样的，数组+链表+红黑树。它实现线程安全的关键点在于 put 流程。
**put 流程**

1. 首先计算 hash，遍历 node 数组，如果 node 是空的话，就通过 CAS+自旋的方式初始化

```java
tab = initTable();
```
node 数组初始化：

```java
private final Node<K,V>[] initTable() {
    Node<K,V>[] tab; int sc;
    while ((tab = table) == null || tab.length == 0) {
        //如果正在初始化或者扩容
        if ((sc = sizeCtl) < 0)
            //等待
            Thread.yield(); // lost initialization race; just spin
        else if (U.compareAndSwapInt(this, SIZECTL, sc, -1)) {   //CAS操作
            try {
                if ((tab = table) == null || tab.length == 0) {
                    int n = (sc > 0) ? sc : DEFAULT_CAPACITY;
                    @SuppressWarnings("unchecked")
                    Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n];
                    table = tab = nt;
                    sc = n - (n >>> 2);
                }
            } finally {
                sizeCtl = sc;
            }
            break;
        }
    }
    return tab;
}
```
2.如果当前数组位置是空则直接通过 CAS 自旋写入数据

```java
static final <K,V> boolean casTabAt(Node<K,V>[] tab, int i,
                                    Node<K,V> c, Node<K,V> v) {
    return U.compareAndSwapObject(tab, ((long)i << ASHIFT) + ABASE, c, v);
}
```

1. 如果 hash==MOVED，说明需要扩容，执行扩容

```java
else if ((fh = f.hash) == MOVED)
                tab = helpTransfer(tab, f);
```

```java
final Node<K,V>[] helpTransfer(Node<K,V>[] tab, Node<K,V> f) {
    Node<K,V>[] nextTab; int sc;
    if (tab != null && (f instanceof ForwardingNode) &&
        (nextTab = ((ForwardingNode<K,V>)f).nextTable) != null) {
        int rs = resizeStamp(tab.length);
        while (nextTab == nextTable && table == tab &&
               (sc = sizeCtl) < 0) {
            if ((sc >>> RESIZE_STAMP_SHIFT) != rs || sc == rs + 1 ||
                sc == rs + MAX_RESIZERS || transferIndex <= 0)
                break;
            if (U.compareAndSwapInt(this, SIZECTL, sc, sc + 1)) {
                transfer(tab, nextTab);
                break;
            }
        }
        return nextTab;
    }
    return table;
}
```

1. 如果都不满足，就使用 synchronized 写入数据，写入数据同样判断链表、红黑树，链表写入和 HashMap 的方式一样，key hash 一样就覆盖，反之就尾插法，链表长度超过 8 就转换成红黑树

```java
synchronized (f){
     ……
 }
```
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1SZvbPiacqGrRdAEv6WhOX8etY833XUNqgumBbdCaaNdrNufDIqR84v4g/640?wx_fmt=png&from=appmsg)
**get 查询**
get 很简单，和 HashMap 基本相同，通过 key 计算位置，table 该位置 key 相同就返回，如果是红黑树按照红黑树获取，否则就遍历链表获取。