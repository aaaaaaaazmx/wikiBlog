---
title: "说说 synchronized 和 ReentrantLock 的区别？"
published: 2023-12-08
description: "说说 synchronized 和 ReentrantLock 的区别？"
tags: ["Java","并发","多线程"]
category: "java并发"
draft: false
slug: "java-concurrent-046"
---

### 说说 synchronized 和 ReentrantLock 的区别？
[synchronized](https://javabetter.cn/thread/synchronized-1.html)是一个关键字，而 Lock 属于一个接口，其实现类主要有 [ReentrantLock](https://javabetter.cn/thread/reentrantLock.html)、[ReentrantReadWriteLock](https://javabetter.cn/thread/ReentrantReadWriteLock.html)
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUibHk3eNVqcUb1D6wrHC1La6P9E4nrxTjtIDTps6OGILick2N8MEYicXzAY8zI1BqCAGicfHmXibIFBxg/640?wx_fmt=png&from=appmsg)

#### ①、使用方式不同
synchronized 可以直接在方法上加锁，也可以在代码块上加锁（无需手动释放锁，锁会自动释放），而 ReentrantLock 必须手动声明来加锁和释放锁。

```java
// synchronized 修饰方法
public synchronized void method() {
    // 业务代码
}

// synchronized 修饰代码块
synchronized (this) {
    // 业务代码
}

// ReentrantLock 加锁
ReentrantLock lock = new ReentrantLock();
lock.lock();
try {
    // 业务代码
} finally {
    lock.unlock();
}
```
随着 JDK 版本的升级，synchronized 的性能已经可以媲美 ReentrantLock 了，加入了偏向锁、轻量级锁和重量级锁的自适应优化等，所以可以大胆地用。
#### ②、功能特点不同
如果需要更细粒度的控制（如可中断的锁操作、尝试非阻塞获取锁、超时获取锁或者使用公平锁等），可以使用 Lock。

- ReentrantLock 提供了一种能够中断等待锁的线程的机制，通过 lock.lockInterruptibly()来实现这个机制。
- ReentrantLock 可以指定是公平锁还是非公平锁。
- ReentrantReadWriteLock 读写锁，读锁是共享锁，写锁是独占锁，读锁可以同时被多个线程持有，写锁只能被一个线程持有。这种锁的设计可以提高性能，特别是在读操作的数量远远超过写操作的情况下。

Lock 还提供了newCondition()方法来创建等待通知条件[Condition](https://javabetter.cn/thread/condition.html)，比 synchronized 与 wait()、 notify()/notifyAll()方法的组合更强大。

```java
ReentrantLock lock = new ReentrantLock();
Condition condition = lock.newCondition();
```
--完结--