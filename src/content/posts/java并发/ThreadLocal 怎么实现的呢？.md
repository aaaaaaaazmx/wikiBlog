---
title: "ThreadLocal 怎么实现的呢？"
published: 2025-08-26
description: "ThreadLocal 怎么实现的呢？"
tags: ["Java","并发","多线程"]
category: "java并发"
draft: false
slug: "java-concurrent-012"
---

### ThreadLocal 怎么实现的呢？
我们看一下 ThreadLocal 的 set(T)方法，发现先获取到当前线程，再获取ThreadLocalMap，然后把元素存到这个 map 中。

```java
public void set(T value) {
        //获取当前线程
        Thread t = Thread.currentThread();
        //获取ThreadLocalMap
        ThreadLocalMap map = getMap(t);
        //讲当前元素存入map
        if (map != null)
            map.set(this, value);
        else
            createMap(t, value);
    }
```
ThreadLocal 实现的秘密都在这个ThreadLocalMap了，可以 Thread 类中定义了一个类型为ThreadLocal.ThreadLocalMap的成员变量threadLocals。
```java
public class Thread implements Runnable {
   //ThreadLocal.ThreadLocalMap是Thread的属性
   ThreadLocal.ThreadLocalMap threadLocals = null;
}
```
ThreadLocalMap 既然被称为 Map，那么毫无疑问它是<key,value>型的数据结构。我们都知道 map 的本质是一个个<key,value>形式的节点组成的数组，那 ThreadLocalMap 的节点是什么样的呢？

```java
static class Entry extends WeakReference<ThreadLocal<?>> {
    /** The value associated with this ThreadLocal. */
    Object value;

    //节点类
    Entry(ThreadLocal<?> k, Object v) {
        //key赋值
        super(k);
        //value赋值
        value = v;
    }
}
```
这里的节点，key 可以简单低视作 ThreadLocal，value 为代码中放入的值，当然实际上 key 并不是 ThreadLocal 本身，而是它的一个**弱引用**，可以看到 Entry 的 key 继承了 WeakReference（弱引用），再来看一下 key 怎么赋值的：
```java
public WeakReference(T referent) {
    super(referent);
}
```
key 的赋值，使用的是 WeakReference 的赋值。
![image.png](https://cdn.nlark.com/yuque/0/2024/png/215777/1712594965918-94adc3e4-196b-4db1-a339-29844c973fa9.png)
ThreadLoca结构图
所以，怎么回答 ThreadLocal 原理？要答出这几个点：

- Thread 类有一个类型为 ThreadLocal.ThreadLocalMap 的实例变量 threadLocals，每个线程都有一个属于自己的 ThreadLocalMap。
- ThreadLocalMap 内部维护着 Entry 数组，每个 Entry 代表一个完整的对象，key 是 ThreadLocal 的弱引用，value 是 ThreadLocal 的泛型值。
- 每个线程在往 ThreadLocal 里设置值的时候，都是往自己的 ThreadLocalMap 里存，读也是以某个 ThreadLocal 作为引用，在自己的 map 里找对应的 key，从而实现了线程隔离。
- ThreadLocal 本身不存储值，它只是作为一个 key 来让线程往 ThreadLocalMap 里存取值。