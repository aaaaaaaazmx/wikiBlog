---
title: "Synchronized优化后的锁机制简单介绍一下，包括自旋锁、偏向锁、轻量级锁、重量级锁？"
published: 2024-10-15
description: "Synchronized优化后的锁机制简单介绍一下，包括自旋锁、偏向锁、轻量级锁、重量级锁？"
tags: ["Java","基础"]
category: "java基础"
draft: false
slug: "java-basic-038"
---

## Synchronized优化后的锁机制简单介绍一下，包括自旋锁、偏向锁、轻量级锁、重量级锁？

- 自旋锁：

线程自旋说白了就是让cpu在做无用功，比如：可以执行几次for循环，可以执行几条空的汇编指令，目的是占着CPU不放，等待获取锁的机会。如果旋的时间过长会影响整体性能，时间过短又达不到延迟阻塞的目的。

- 偏向锁

偏向锁就是一旦线程第一次获得了监视对象，之后让监视对象“偏向”这个线程，之后的多次调用则可以避免CAS操作，说白了就是置个变量，如果发现为true则无需再走各种加锁/解锁流程。

- 轻量级锁：

轻量级锁是由偏向所升级来的，偏向锁运行在一个线程进入同步块的情况下，当第二个线程加入锁竞争用的时候，偏向锁就会升级为轻量级锁；

- 重量级锁

重量锁在JVM中又叫对象监视器（Monitor），它很像C中的Mutex，除了具备Mutex(0|1)互斥的功能，它还负责实现了Semaphore(信号量)的功能，也就是说它至少包含一个竞争锁的队列，和一个信号阻塞队列（wait队列），前者负责做互斥，后一个用于做线程同步。

## 谈谈对Synchronized关键字涉及到的类锁，方法锁，重入锁的理解？

synchronized修饰静态方法获取的是类锁(类的字节码文件对象)。

synchronized修饰普通方法或代码块获取的是对象锁。这种机制确保了同一时刻对于每一个类实例，其所有声明为 synchronized 的成员函数中至多只有一个处于可执行状态，从而有效避免了类成员变量的访问冲突。

它俩是不冲突的，也就是说：获取了类锁的线程和获取了对象锁的线程是不冲突的！

    public class Widget {

        // 锁住了
        public synchronized void doSomething() {
            ...
        }
    }

    public class LoggingWidget extends Widget {

        // 锁住了
        public synchronized void doSomething() {
            System.out.println(toString() + ": calling doSomething");
            super.doSomething();
        }
    }

因为锁的持有者是“线程”，而不是“调用”。

线程A已经是有了LoggingWidget实例对象的锁了，当再需要的时候可以继续**“开锁”**进去的！

这就是内置锁的可重入性。