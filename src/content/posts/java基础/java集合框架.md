---
title: "java集合框架"
published: 2020-01-07
description: "java集合框架"
tags: ["Java","基础"]
category: "java基础"
draft: false
slug: "java-basic-024"
---

# java集合框架 

## 1、集合框架，list，map，set都有哪些具体的实现类，区别都是什么?

Java集合里使用接口来定义功能，是一套完善的继承体系。Iterator是所有集合的总接口，其他所有接口都继承于它，该接口定义了集合的遍历操作，Collection接口继承于Iterator，是集合的次级接口（Map独立存在），定义了集合的一些通用操作。

## Java集合的类结构图如下所示：

![image](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWCiaEXFDRIoE2dsoo0oicIA82pCCsQ0YnjpD5ac57oL7ZkIRMJYPOvNiaQraR9bwD8HWDXLH4HSRrRQ/640?wx_fmt=png)

- List：有序、可重复；索引查询速度快；插入、删除伴随数据移动，速度慢；

- Set：无序，不可重复；

- Map：键值对，键唯一，值多个；

1. List,Set都是继承自Collection接口，Map则不是;

2. List特点：元素有放入顺序，元素可重复;

3. Set特点：元素无放入顺序，元素不可重复，重复元素会盖掉，（注意：元素虽然无放入顺序，但是元素在set中位置是由该元素的HashCode决定的，其位置其实是固定，加入Set 的Object必须定义equals()方法;

另外list支持for循环，也就是通过下标来遍历，也可以使用迭代器，但是set只能用迭代，因为他无序，无法用下标取得想要的值）。

3. Set和List对比：

Set：检索元素效率低下，删除和插入效率高，插入和删除不会引起元素位置改变。

List：和数组类似，List可以动态增长，查找元素效率高，插入删除元素效率低，因为会引起其他元素位置改变。

4. Map适合储存键值对的数据。

5. 线程安全集合类与非线程安全集合类

LinkedList、ArrayList、HashSet是非线程安全的，Vector是线程安全的;

HashMap是非线程安全的，HashTable是线程安全的;

StringBuilder是非线程安全的，StringBuffer是线程安的。

## 下面是这些类具体的使用介绍：

### ArrayList与LinkedList的区别和适用场景

Arraylist：

优点：ArrayList是实现了基于动态数组的数据结构,因地址连续，一旦数据存储好了，查询操作效率会比较高（在内存里是连着放的）。

缺点：因为地址连续，ArrayList要移动数据,所以插入和删除操作效率比较低。

LinkedList：

优点：LinkedList基于链表的数据结构，地址是任意的，其在开辟内存空间的时候不需要等一个连续的地址，对新增和删除操作add和remove，LinedList比较占优势。LikedList 适用于要头尾操作或插入指定位置的场景。

缺点：因为LinkedList要移动指针,所以查询操作性能比较低。

适用场景分析：

当需要对数据进行对此访问的情况下选用ArrayList，当要对数据进行多次增加删除修改时采用LinkedList。

### ArrayList和LinkedList怎么动态扩容的吗？

- ArrayList:

ArrayList 初始化大小是 10 （如果你知道你的arrayList 会达到多少容量，可以在初始化的时候就指定，能节省扩容的性能开支） 
扩容点规则是，新增的时候发现容量不够用了，就去扩容 
扩容大小规则是，扩容后的大小= 原始大小+原始大小/2 + 1。（例如：原始大小是 10 ，扩容后的大小就是 10 + 5+1 = 16）

- LinkedList:

linkedList 是一个双向链表，没有初始化大小，也没有扩容的机制，就是一直在前面或者后面新增就好。 

### ArrayList与Vector的区别和适用场景

ArrayList有三个构造方法：

    public ArrayList(intinitialCapacity)// 构造一个具有指定初始容量的空列表。   
    public ArrayList()// 构造一个初始容量为10的空列表。
    public ArrayList(Collection<? extends E> c)// 构造一个包含指定 collection 的元素的列表  
    
Vector有四个构造方法：
    
    public Vector() // 使用指定的初始容量和等于零的容量增量构造一个空向量。    
    public Vector(int initialCapacity) // 构造一个空向量，使其内部数据数组的大小，其标准容量增量为零。    
    public Vector(Collection<? extends E> c)// 构造一个包含指定 collection 中的元素的向量  
    public Vector(int initialCapacity, int capacityIncrement)// 使用指定的初始容量和容量增量构造一个空的向量
       
**ArrayList和Vector都是用数组实现的，主要有这么四个区别：**

1. Vector是**多线程安全**的，线程安全就是说多线程访问代码，不会产生不确定的结果。而ArrayList不是，这可以从源码中看出，Vector类中的方法很多有synchronied进行修饰，这样就导致了Vector在效率上无法与ArrayLst相比；

2. 两个都是采用的线性连续空间存储元素，但是当空间充足的时候，两个类的增加方式是不同。

3. Vector可以设置增长因子，而ArrayList不可以。

4. Vector是一种老的动态数组，是线程同步的，效率很低，一般不赞成使用。

适用场景：

1.Vector是线程同步的，所以它也是线程安全的，而ArraList是线程异步的，是不安全的。如果不考虑到线程的安全因素，一般用ArrayList效率比较高。

2.如果集合中的元素的数目大于目前集合数组的长度时，在集合中使用数据量比较大的数据，用Vector有一定的优势。
    