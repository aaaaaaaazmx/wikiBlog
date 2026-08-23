---
title: "JVM 里 new 对象时，堆会发生抢占吗？JVM是怎么设计来保证线程安全的？"
published: 2021-02-26
description: "JVM 里 new 对象时，堆会发生抢占吗？JVM是怎么设计来保证线程安全的？"
tags: ["Java","JVM","虚拟机"]
category: "java虚拟机"
draft: false
slug: "jvm-004"
---


## JVM 里 new 对象时，堆会发生抢占吗？JVM是怎么设计来保证线程安全的？
会，假设JVM虚拟机上，每一次new 对象时，指针就会向右移动一个对象size的距离，一个线程正在给A对象分配内存，指针还没有来的及修改，另一个为B对象分配内存的线程，又引用了这个指针来分配内存，这就发生了抢占。
有两种可选方案来解决这个问题：
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLVXLYDoDiczicKRxlzxL22yDHXgBatOKoT8gxpEHal5v20KRiaMGDJFE6EJ8C2GsCbT2EyUibKGD0YteA/640?wx_fmt=png&from=appmsg)
堆抢占和解决方案

- 采用CAS分配重试的方式来保证更新操作的原子性
- 每个线程在Java堆中预先分配一小块内存，也就是本地线程分配缓冲（Thread Local AllocationBuffer，TLAB），要分配内存的线程，先在本地缓冲区中分配，只有本地缓冲区用完了，分配新的缓存区时才需要同步锁定。