---
title: "HashSet 怎么判断元素重复，重复了是否 put"
published: 2021-02-22
description: "HashSet 怎么判断元素重复，重复了是否 put"
tags: ["Java","集合","数据结构"]
category: "java集合"
draft: false
slug: "java-collection-009"
---

### HashSet 怎么判断元素重复，重复了是否 put
HashSet 的 add 方法是通过调用 HashMap 的 put 方法实现的：

```java
public boolean add(E e) {
    return map.put(e, PRESENT)==null;
}
```
所以 HashSet 判断元素重复的逻辑底层依然是 HashMap 的底层逻辑：
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1SzTiaNuXfz3BWD6Hl5ibic8UPpoj24UiaVA0aibSzPT3jsaVn1JuSax52nvg/640?wx_fmt=png&from=appmsg)
HashMap 在插入元素时，通常需要三步：
第一步，通过 hash 方法计算 key 的哈希值。
```java
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```
第二步，数组进行第一次扩容。
```java
if ((tab = table) == null || (n = tab.length) == 0)
    n = (tab = resize()).length;
```
第三步，根据哈希值计算 key 在数组中的下标，如果对应下标正好没有存放数据，则直接插入。

```java
if ((p = tab[i = (n - 1) & hash]) == null)
    tab[i] = newNode(hash, key, value, null);
```
如果对应下标已经有数据了，就需要判断是否为相同的 key，是则覆盖 value，否则需要判断是否为树节点，是则向树中插入节点，否则向链表中插入数据。
```java
else {
    Node<K,V> e; K k;
    if (p.hash == hash &&
        ((k = p.key) == key || (key != null && key.equals(k))))
        e = p;
    else if (p instanceof TreeNode)
        e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
    else {
        for (int binCount = 0; ; ++binCount) {
            if ((e = p.next) == null) {
                p.next = newNode(hash, key, value, null);
                if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                    treeifyBin(tab, hash);
                break;
            }
            if (e.hash == hash &&
                ((k = e.key) == key || (key != null && key.equals(k))))
                break;
            p = e;
        }
    }
}
```
也就是说，HashSet 通过元素的哈希值来判断元素是否重复，如果重复了，会覆盖原来的值。
```java
if (e != null) { // existing mapping for key
    V oldValue = e.value;
    if (!onlyIfAbsent || oldValue == null)
        e.value = value;
    afterNodeAccess(e);
    return oldValue;
}
```
