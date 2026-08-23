---
title: "并发-锁-ReentrantLock"
published: 2020-12-25
description: "并发-锁-ReentrantLock"
tags: ["Java","基础"]
category: "java基础"
draft: false
slug: "java-basic-061"
---

## [ReentrantLock的内部实现](https://www.cnblogs.com/chengxiao/p/7255941.html)。

ReentrantLock实现的前提就是AbstractQueuedSynchronizer，简称AQS，是java.util.concurrent的核心，CountDownLatch、FutureTask、Semaphore、ReentrantLock等都有一个内部类是这个抽象类的子类。由于AQS是基于FIFO队列的实现，因此必然存在一个个节点，Node就是一个节点，Node有两种模式：共享模式和独占模式。ReentrantLock是基于AQS的，AQS是Java并发包中众多同步组件的构建基础，它通过一个int类型的状态变量state和一个FIFO队列来完成共享资源的获取，线程的排队等待等。AQS是个底层框架，采用模板方法模式，它定义了通用的较为复杂的逻辑骨架，比如线程的排队，阻塞，唤醒等，将这些复杂但实质通用的部分抽取出来，这些都是需要构建同步组件的使用者无需关心的，使用者仅需重写一些简单的指定的方法即可（其实就是对于共享变量state的一些简单的获取释放的操作）。AQS的子类一般只需要重写tryAcquire(int arg)和tryRelease(int arg)两个方法即可。

### ReentrantLock的处理逻辑：

其内部定义了三个重要的静态内部类，Sync，NonFairSync，FairSync。Sync作为ReentrantLock中公用的同步组件，继承了AQS（要利用AQS复杂的顶层逻辑嘛，线程排队，阻塞，唤醒等等）；NonFairSync和FairSync则都继承Sync，调用Sync的公用逻辑，然后再在各自内部完成自己特定的逻辑（公平或非公平）。

接着说下这两者的lock()方法实现原理：

### NonFairSync（非公平可重入锁）

1.先获取state值，若为0，意味着此时没有线程获取到资源，CAS将其设置为1，设置成功则代表获取到排他锁了；

2.若state大于0，肯定有线程已经抢占到资源了，此时再去判断是否就是自己抢占的，是的话，state累加，返回true，重入成功，state的值即是线程重入的次数；

3.其他情况，则获取锁失败。

### FairSync（公平可重入锁）

可以看到，公平锁的大致逻辑与非公平锁是一致的，不同的地方在于有了!hasQueuedPredecessors()这个判断逻辑，即便state为0，也不能贸然直接去获取，要先去看有没有还在排队的线程，若没有，才能尝试去获取，做后面的处理。反之，返回false，获取失败。

最后，说下ReentrantLock的tryRelease()方法实现原理：

若state值为0，表示当前线程已完全释放干净，返回true，上层的AQS会意识到资源已空出。若不为0，则表示线程还占有资源，只不过将此次重入的资源的释放了而已，返回false。

ReentrantLock是一种可重入的，可实现公平性的互斥锁，它的设计基于AQS框架，可重入和公平性的实现逻辑都不难理解，每重入一次，state就加1，当然在释放的时候，也得一层一层释放。至于公平性，在尝试获取锁的时候多了一个判断：是否有比自己申请早的线程在同步队列中等待，若有，去等待；若没有，才允许去抢占。　　

## ReentrantLock 、synchronized 和 volatile 比较？

synchronized是互斥同步的一种实现。

synchronized：当某个线程访问被synchronized标记的方法或代码块时，这个线程便获得了该对象的锁，其他线暂时无法访问这个方法，只有等待这个方法执行完毕或代码块执行完毕，这个线程才会释放该对象的锁，其他线程才能执行这个方法代码块。

前面我们已经说了volatile关键字，这里我们举个例子来综合分析volatile与synchronized关键字的使用。

举个例子：

    public class Singleton {
    
        // volatile保证了：1 instance在多线程并发的可见性 2 禁止instance在操作是的指令重排序
        private volatile static Singleton instance;
    
        private Singleton(){}
    
        public static Singleton getInstance() {
            // 第一次判空，保证不必要的同步
            if (instance == null) {
                // synchronized对Singleton加全局锁，保证每次只要一个线程创建实例
                synchronized (Singleton.class) {
                    // 第二次判空时为了在null的情况下创建实例
                    if (instance == null) {
                        instance = new Singleton();
                    }
                }
            }
            return instance;
        }
    }
    
这是一个经典的DCL单例。

它的字节码如下：

![image](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWCiaEXFDRIoE2dsoo0oicIA8YAib3pNQ5pHBfKU2tcnVknSlDPgAotGVLiahcpEYoxQxEGiaiaZ1rUbDqw/640?wx_fmt=png)

可以看到被synchronized同步的代码块，会在前后分别加上monitorenter和monitorexit，这两个字节码都需要指定加锁和解锁的对象。

关于加锁和解锁的对象：

synchronized代码块 ：同步代码块，作用范围是整个代码块，作用对象是调用这个代码块的对象。

synchronized方法 ：同步方法，作用范围是整个方法，作用对象是调用这个方法的对象。

synchronized静态方法 ：同步静态方法，作用范围是整个静态方法，作用对象是调用这个类的所有对象。

synchronized(this)：作用范围是该对象中所有被synchronized标记的变量、方法或代码块，作用对象是对象本身。

synchronized(ClassName.class) ：作用范围是静态的方法或者静态变量，作用对象是Class对象。

synchronized(this)添加的是对象锁，synchronized(ClassName.class)添加的是类锁，它们的区别如下：

- 对象锁：Java的所有对象都含有1个互斥锁，这个锁由JVM自动获取和释放。线程进入synchronized方法的时候获取该对象的锁，当然如果已经有线程获取了这个对象的锁那么当前线程会等待；synchronized方法正常返回或者抛异常而终止，JVM会自动释放对象锁。这里也体现了用synchronized来加锁的好处，方法抛异常的时候，锁仍然可以由JVM来自动释放。

- 类锁：对象锁是用来控制实例方法之间的同步，类锁是来控制静态方法（或静态变量互斥体）之间的同步。其实类锁只是一个概念上的东西，并不是真实存在的，它只用来帮助我们理解锁定实例方法和静态方法的区别的。我们都知道，java类可能会有很多个对象，但是只有1个Class对象，也就说类的不同实例之间共享该类的Class对象。Class对象其实也仅仅是1个java对象，只不过有点特殊而已。由于每个java对象都有个互斥锁，而类的静态方法是需要Class对象。所以所谓类锁，不过是Class对象的锁而已。获取类的Class对象有好几种，最简单的就是MyClass.class的方式。类锁和对象锁不是同一个东西，一个是类的Class对象的锁，一个是类的实例的锁。也就是说：一个线程访问静态sychronized的时候，允许另一个线程访问对象的实例synchronized方法。反过来也是成立的，为他们需要的锁是不同的。