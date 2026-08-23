---
title: "CountDownLatch（倒计数器）了解吗？"
published: 2021-07-14
description: "CountDownLatch（倒计数器）了解吗？"
tags: ["Java","并发","多线程"]
category: "java并发"
draft: false
slug: "java-concurrent-004"
---

### CountDownLatch（倒计数器）了解吗？
CountDownLatch，倒计数器，有两个常见的应用场景[18]：
**场景 1：协调子线程结束动作：等待所有子线程运行结束**
CountDownLatch 允许一个或多个线程等待其他线程完成操作。
例如，我们很多人喜欢玩的王者荣耀，开黑的时候，得等所有人都上线之后，才能开打。
![](https://mmbiz.qpic.cn/mmbiz_jpg/LrDMVD5bqLUibHk3eNVqcUb1D6wrHC1LaJojTSTkVwoZa36IKgU9kcx07U4APwB9DRDsbPv8r89sepKxliblKadQ/640?wx_fmt=webp&from=appmsg)
王者荣耀等待玩家确认-来源参考[18]
CountDownLatch 模仿这个场景(参考[18])：
创建大乔、兰陵王、安其拉、哪吒和铠等五个玩家，主线程必须在他们都完成确认后，才可以继续运行。
在这段代码中，new CountDownLatch(5)用户创建初始的 latch 数量，各玩家通过countDownLatch.countDown()完成状态确认，主线程通过countDownLatch.await()等待。

```java
public static void main(String[] args) throws InterruptedException {
    CountDownLatch countDownLatch = new CountDownLatch(5);

    Thread 大乔 = new Thread(countDownLatch::countDown);
    Thread 兰陵王 = new Thread(countDownLatch::countDown);
    Thread 安其拉 = new Thread(countDownLatch::countDown);
    Thread 哪吒 = new Thread(countDownLatch::countDown);
    Thread 铠 = new Thread(() -> {
        try {
            // 稍等，上个卫生间，马上到...
            Thread.sleep(1500);
            countDownLatch.countDown();
        } catch (InterruptedException ignored) {}
    });

    大乔.start();
    兰陵王.start();
    安其拉.start();
    哪吒.start();
    铠.start();
    countDownLatch.await();
    System.out.println("所有玩家已经就位！");
}
```
**场景 2. 协调子线程开始动作：统一各线程动作开始的时机**
王者游戏中也有类似的场景，游戏开始时，各玩家的初始状态必须一致。不能有的玩家都出完装了，有的才降生。
所以大家得一块出生，在
![](https://cdn.nlark.com/yuque/0/2024/jpeg/215777/1712592956929-ab4311b6-4056-45f5-a886-fd27ddb6d9a2.jpeg)
王者荣耀-来源参考[18]
在这个场景中，仍然用五个线程代表大乔、兰陵王、安其拉、哪吒和铠等五个玩家。需要注意的是，各玩家虽然都调用了start()线程，但是它们在运行时都在等待countDownLatch的信号，在信号未收到前，它们不会往下执行。

```java
public static void main(String[] args) throws InterruptedException {
    CountDownLatch countDownLatch = new CountDownLatch(1);

    Thread 大乔 = new Thread(() -> waitToFight(countDownLatch));
    Thread 兰陵王 = new Thread(() -> waitToFight(countDownLatch));
    Thread 安其拉 = new Thread(() -> waitToFight(countDownLatch));
    Thread 哪吒 = new Thread(() -> waitToFight(countDownLatch));
    Thread 铠 = new Thread(() -> waitToFight(countDownLatch));

    大乔.start();
    兰陵王.start();
    安其拉.start();
    哪吒.start();
    铠.start();
    Thread.sleep(1000);
    countDownLatch.countDown();
    System.out.println("敌方还有5秒达到战场，全军出击！");
}

private static void waitToFight(CountDownLatch countDownLatch) {
    try {
        countDownLatch.await(); // 在此等待信号再继续
        System.out.println("收到，发起进攻！");
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}
```
CountDownLatch 的**核心方法**也不多：

- await()：等待 latch 降为 0；
- boolean await(long timeout, TimeUnit unit)：等待 latch 降为 0，但是可以设置超时时间。比如有玩家超时未确认，那就重新匹配，总不能为了某个玩家等到天荒地老。
- countDown()：latch 数量减 1；
- getCount()：获取当前的 latch 数量。