---
title: "HandlerThread原理"
published: 2021-08-05
description: "HandlerThread原理"
tags: ["Android","基础"]
category: "android基础"
draft: false
slug: "android-basic-020"
---

# HandlerThread原理

1、HandlerThread原理

当系统有多个耗时任务需要执行时，每个任务都会开启个新线程去执行耗时任务，这样会导致系统多次创建和销毁线程，从而影响性能。

为了解决这一问题，Google提出了HandlerThread，HandlerThread本质上是一个线程类，它继承了Thread。HandlerThread有自己的内部Looper对象，可以进行loopr循环。

通过获取HandlerThread的looper对象传递给Handler对象，可以在handleMessage()方法中执行异步任务。

创建HandlerThread后必须先调用HandlerThread.start()方法，Thread会先调用run方法，创建Looper对象。当有耗时任务进入队列时，则不需要开启新线程，在原有的线程中执行耗时任务即可，否则线程阻塞。它在Android中的一个具体的使用场景是IntentService。

由于HanlderThread的run()方法是一个无限循环，因此当明确不需要再使用HandlerThread时，可以通过它的quit或者quitSafely方法来终止线程的执行。
    
2、HanlderThread的优缺点

- HandlerThread优点是异步不会堵塞，减少对性能的消耗。

- HandlerThread缺点是不能同时继续进行多任务处理，要等待进行处理，处理效率较低。

- HandlerThread与线程池不同，HandlerThread是一个串队列，背后只有一个线程。
