---
title: "ReentrantLock 实现原理？"
published: 2020-06-24
description: "ReentrantLock 实现原理？"
tags: ["Java","并发","多线程"]
category: "java并发"
draft: false
slug: "java-concurrent-008"
---

### ReentrantLock 实现原理？
[ReentrantLock](https://javabetter.cn/thread/reentrantLock.html)是可重入的独占锁，只能有一个线程可以获取该锁，其它获取该锁的线程会被阻塞。
可重入表示当前线程获取该锁后再次获取不会被阻塞，也就意味着同一个线程可以多次获得同一个锁而不会发生死锁。
ReentrantLock 的加锁和解锁：

```java
// 创建非公平锁
ReentrantLock lock = new ReentrantLock();
// 获取锁操作
lock.lock();
try {
    // 执行代码逻辑
} catch (Exception ex) {
    // ...
} finally {
    // 解锁操作
    lock.unlock();
}
```
new ReentrantLock() 默认创建的是非公平锁 NonfairSync。
#### 公平锁 FairSync
在公平锁模式下，锁会授予等待时间最长的线程。
#### 非公平锁 NonfairSync
在非公平锁模式下，锁可能会授予刚刚请求它的线程，而不考虑等待时间。
ReentrantLock 内部通过一个计数器来跟踪锁的持有次数。
当线程调用lock()方法获取锁时，ReentrantLock 会检查当前状态，判断锁是否已经被其他线程持有。如果没有被持有，则当前线程将获得锁；如果锁已被其他线程持有，则当前线程将根据锁的公平性策略，可能会被加入到等待队列中。
线程首次获取锁时，计数器值变为 1；如果同一线程再次获取锁，计数器增加；每释放一次锁，计数器减 1。
当线程调用unlock()方法时，ReentrantLock 会将持有锁的计数减 1，如果计数到达 0，则释放锁，并唤醒等待队列中的线程来竞争锁。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUibHk3eNVqcUb1D6wrHC1La1cTy0mEvO64teGn9pQp2pgibxcPkDoo1grsvtkAGc9OmeczsPE9RrsQ/640?wx_fmt=png&from=appmsg)
ReentrantLock 非公平锁加锁流程简图