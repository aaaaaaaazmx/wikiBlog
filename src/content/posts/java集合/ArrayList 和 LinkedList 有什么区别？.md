---
title: "ArrayList 和 LinkedList 有什么区别？"
published: 2025-03-31
description: "ArrayList 和 LinkedList 有什么区别？"
tags: ["Java","集合","数据结构"]
category: "java集合"
draft: false
slug: "java-collection-004"
---

### ArrayList 和 LinkedList 有什么区别？

#### 数据结构不同

- ArrayList 基于数组实现
- LinkedList 基于链表实现

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1SjlgBWQiciaNUp9gRcIVzjYicGcH9VIiaj9d5CmeEL5ZzKSz5OPHDOefrBA/640?wx_fmt=png&from=appmsg)
ArrayList和LinkedList的数据结构
#### 用途不同
多数情况下，ArrayList 更利于查找，LinkedList 更利于增删
①、由于 ArrayList 是基于数组实现的，所以 get(int index) 可以直接通过数组下标获取，时间复杂度是 O(1)；LinkedList 是基于链表实现的，get(int index) 需要遍历链表，时间复杂度是 O(n)。
当然，get(E element) 这种查找，两种集合都需要遍历通过 equals 比较获取元素，所以时间复杂度都是 O(n)。
②、ArrayList 如果增删的是数组的尾部，直接插入或者删除就可以了，时间复杂度是 O(1)；如果 add 的时候涉及到扩容，时间复杂度会提升到 O(n)。
但如果插入的是中间的位置，就需要把插入位置后的元素向前或者向后移动，甚至还有可能触发扩容，效率就会低很多，O(n)。
LinkedList 因为是链表结构，插入和删除只需要改变前置节点、后置节点和插入节点的引用就行了，不需要移动元素。
如果是在链表的头部插入或者删除，时间复杂度是 O(1)；如果是在链表的中间插入或者删除，时间复杂度是 O(n)，因为需要遍历链表找到插入位置；如果是在链表的尾部插入或者删除，时间复杂度是 O(1)。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1SbYyWsfXTETEgnv9LLb9eKDgjCbgz57bPa2tuL8bvc6Raauts2Lricng/640?wx_fmt=png&from=appmsg)
ArrayList和LinkedList中间插入
![image.png](https://cdn.nlark.com/yuque/0/2024/png/215777/1712906825478-95edb88f-6449-4f83-8132-c73f7b84cedb.png)
ArrayList和LinkedList中间删除
注意，这里有个陷阱，LinkedList 更利于增删不是体现在时间复杂度上，因为二者增删的时间复杂度都是 O(n)，都需要遍历列表；而是体现在增删的效率上，因为 LinkedList 的增删只需要改变引用，而 ArrayList 的增删可能需要移动元素。
#### 是否支持随机访问
①、ArrayList 是基于数组的，也实现了 RandomAccess 接口，所以它支持随机访问，可以通过下标直接获取元素。
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1SnhQVia4HFmziaKmUOn8A4I1ydT2Tqrs8fyGicfcq5pEXMqyIV0Ro6XjAw/640?wx_fmt=png&from=appmsg)
②、LinkedList 是基于链表的，所以它没法根据下标直接获取元素，不支持随机访问，所以它也没有实现 RandomAccess 接口。
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1SW9vlDZG6AYv1yTxwkkpl67Awn7JoRZWRj6s0ibKpxd7JLfm3O5jot0A/640?wx_fmt=png&from=appmsg)
#### 内存占用
ArrayList 是基于数组的，是一块连续的内存空间，所以它的内存占用是比较紧凑的；但如果涉及到扩容，就会重新分配内存，空间是原来的 1.5 倍，存在一定的空间浪费。
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1SeNfn8BYKjiblH3Pv3Q1RU9JYiacr6MBTrenOnyU4nUnHmDK5Mu5tHVtw/640?wx_fmt=png&from=appmsg)
LinkedList 是基于链表的，每个节点都有一个指向下一个节点和上一个节点的引用，于是每个节点占用的内存空间稍微大一点。
### 3.ArrayList 的扩容机制了解吗？
ArrayList 是基于数组的集合，数组的容量是在定义的时候确定的，如果数组满了，再插入，就会数组溢出。所以在插入时候，会先检查是否需要扩容，如果当前容量+1 超过数组长度，就会进行扩容。
ArrayList 的扩容是创建一个**1.5 倍**的新数组，然后把原数组的值拷贝过去。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1SwpOmicenWLGmDW6feNFfdbsvSziaw3rNZWNZiborUFKDGMCaGMHrVfiaPw/640?wx_fmt=png&from=appmsg)