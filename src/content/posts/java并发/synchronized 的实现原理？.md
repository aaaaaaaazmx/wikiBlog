---
title: "synchronized 的实现原理？"
published: 2022-04-06
description: "synchronized 的实现原理？"
tags: ["Java","并发","多线程"]
category: "java并发"
draft: false
slug: "java-concurrent-011"
---

### synchronized 的实现原理？
synchronized 是怎么加锁的呢？
我们使用 synchronized 的时候，发现不用自己去 lock 和 unlock，是因为 JVM 帮我们把这个事情做了。

1. synchronized 修饰代码块时，JVM 采用monitorenter、monitorexit两个指令来实现同步，monitorenter 指令指向同步代码块的开始位置， monitorexit 指令则指向同步代码块的结束位置。反编译一段 synchronized 修饰代码块代码，javap -c -s -v -l SynchronizedDemo.class，可以看到相应的字节码指令。

![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUibHk3eNVqcUb1D6wrHC1LahhEc1UlEe5UGhwcG78DibTnQOEyP4VlblyiaexLTbNd64wibtiaPGeVFUQ/640?wx_fmt=png&from=appmsg)
monitorenter和monitorexit

1. synchronized 修饰同步方法时，JVM 采用ACC_SYNCHRONIZED标记符来实现同步，这个标识指明了该方法是一个同步方法。

同样可以写段代码反编译看一下。
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUibHk3eNVqcUb1D6wrHC1LabdSH7wEKxBnLaibP7KzTrcCqB9BF3Duk1piav8yibt9zg352GpeHVwnLw/640?wx_fmt=png&from=appmsg)
synchronized修饰同步方法
synchronized 锁住的是什么呢？
monitorenter、monitorexit 或者 ACC_SYNCHRONIZED 都是**基于 Monitor 实现**的。
实例对象结构里有对象头，对象头里面有一块结构叫 Mark Word，Mark Word 指针指向了**monitor**。
所谓的 Monitor 其实是一种**同步工具**，也可以说是一种**同步机制**。在 Java 虚拟机（HotSpot）中，Monitor 是由**ObjectMonitor 实现**的，可以叫做内部锁，或者 Monitor 锁。
ObjectMonitor 的工作原理：

- ObjectMonitor 有两个队列：_WaitSet、_EntryList，用来保存 ObjectWaiter 对象列表。
- _owner，获取 Monitor 对象的线程进入 _owner 区时， _count + 1。如果线程调用了 wait() 方法，此时会释放 Monitor 对象， _owner 恢复为空， _count - 1。同时该等待线程进入 _WaitSet 中，等待被唤醒。

```java
ObjectMonitor() {
    _header       = NULL;
    _count        = 0; // 记录线程获取锁的次数
    _waiters      = 0,
    _recursions   = 0;  //锁的重入次数
    _object       = NULL;
    _owner        = NULL;  // 指向持有ObjectMonitor对象的线程
    _WaitSet      = NULL;  // 处于wait状态的线程，会被加入到_WaitSet
    _WaitSetLock  = 0 ;
    _Responsible  = NULL ;
    _succ         = NULL ;
    _cxq          = NULL ;
    FreeNext      = NULL ;
    _EntryList    = NULL ;  // 处于等待锁block状态的线程，会被加入到该列表
    _SpinFreq     = 0 ;
    _SpinClock    = 0 ;
    OwnerIsThread = 0 ;
  }
```
可以类比一个去医院就诊的例子[18]：

- 首先，患者在**门诊大厅**前台或自助挂号机**进行挂号**；
- 随后，挂号结束后患者找到对应的**诊室就诊**：
   - 诊室每次只能有一个患者就诊；
   - 如果此时诊室空闲，直接进入就诊；
   - 如果此时诊室内有其它患者就诊，那么当前患者进入**候诊室**，等待叫号；
- 就诊结束后，**走出就诊室**，候诊室的**下一位候诊患者**进入就诊室。

![image.png](https://cdn.nlark.com/yuque/0/2024/png/215777/1712681148776-bb269b3f-464d-4288-a560-6c628749d949.png)

这个过程就和 Monitor 机制比较相似：

- **门诊大厅**：所有待进入的线程都必须先在**入口 Entry Set**挂号才有资格；
- **就诊室**：就诊室_Owner里里只能有一个线程就诊，就诊完线程就自行离开
- **候诊室**：就诊室繁忙时，进入**等待区（Wait Set）**，就诊室空闲的时候就从等待区（Wait Set）叫新的线程

![image.png](https://cdn.nlark.com/yuque/0/2024/png/215777/1712681164800-2ae4537d-fa14-44c2-b400-b97079c227af.png)
Java Montior机制
所以我们就知道了，同步是锁住的什么东西：

- monitorenter，在判断拥有同步标识 ACC_SYNCHRONIZED 抢先进入此方法的线程会优先拥有 Monitor 的 owner ，此时计数器 +1。
- monitorexit，当执行完退出后，计数器 -1，归 0 后被其他进入的线程获得。