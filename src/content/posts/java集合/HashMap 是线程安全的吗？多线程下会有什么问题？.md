---
title: "HashMap 是线程安全的吗？多线程下会有什么问题？"
published: 2022-07-26
description: "HashMap 是线程安全的吗？多线程下会有什么问题？"
tags: ["Java","集合","数据结构"]
category: "java集合"
draft: false
slug: "java-collection-006"
---

### HashMap 是线程安全的吗？多线程下会有什么问题？
推荐阅读：[HashMap 详解](https://javabetter.cn/collection/hashmap.html#_04%E3%80%81%E7%BA%BF%E7%A8%8B%E4%B8%8D%E5%AE%89%E5%85%A8)
HashMap 之所以不是线程安全的，主要有以下几个问题：
①、多线程下扩容会死循环。JDK1.7 中的 HashMap 使用的是头插法插入元素，在多线程的环境下，扩容的时候就有可能导致出现环形链表，造成死循环。
![](https://cdn.nlark.com/yuque/0/2024/png/215777/1712901905439-e495187e-dc05-4c7b-bc55-62124e14b343.png)
不过，JDK 8 时已经修复了这个问题，扩容时会保持链表原来的顺序。
②、多线程的 put 可能会导致元素的丢失。因为计算出来的位置可能会被其他线程的 put 覆盖，很好理解。本来哈希冲突是应该用链表的，但多线程时由于没有加锁，相同位置的元素可能就被干掉了。
![](https://cdn.nlark.com/yuque/0/2024/png/215777/1712901905426-23108e45-9f9a-4288-8969-9f2ff2188c35.png)
③、put 和 get 并发时，可能导致 get 为 null。线程 1 执行 put 时，因为元素个数超出阈值而导致出现扩容，线程 2 此时执行 get，就有可能出现这个问题，因为线程 1 执行完 table = newTab 之后，线程 2 中的 table 此时也发生了变化，此时去 get 的时候当然会 get 到 null 了，因为元素还没有转移。

```java
final Node<K,V>[] resize() {
    Node<K,V>[] oldTab = table;
    int oldCap = (oldTab == null) ? 0 : oldTab.length;
    int oldThr = threshold;
    int newCap, newThr = 0;
    if (oldCap > 0) {
        // 超过最大值就不再扩充了，就只好随你碰撞去吧
        if (oldCap >= MAXIMUM_CAPACITY) {
            threshold = Integer.MAX_VALUE;
            return oldTab;
        }
        // 没超过最大值，就扩充为原来的2倍
        else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                 oldCap >= DEFAULT_INITIAL_CAPACITY)
            newThr = oldThr << 1; // double threshold
    }
    else if (oldThr > 0) // initial capacity was placed in threshold
        newCap = oldThr;
    else {               // zero initial threshold signifies using defaults
        newCap = DEFAULT_INITIAL_CAPACITY;
        newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
    }
    // 计算新的resize上限
    if (newThr == 0) {
        float ft = (float)newCap * loadFactor;
        newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                  (int)ft : Integer.MAX_VALUE);
    }
    threshold = newThr;
    @SuppressWarnings({"rawtypes","unchecked"})
        Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
    table = newTab;
}
```
