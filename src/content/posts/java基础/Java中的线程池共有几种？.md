---
title: "Java中的线程池共有几种？"
published: 2024-03-29
description: "Java中的线程池共有几种？"
tags: ["Java","基础"]
category: "java基础"
draft: false
slug: "java-basic-021"
---

# Java中的线程池共有几种？

## 什么是线程池，如何使用？为什么要使用线程池？

答：线程池就是事先将多个线程对象放到一个容器中，使用的时候就不用new线程而是直接去池中拿线程即可，节
省了开辟子线程的时间，提高了代码执行效率。

## Java中的线程池共有几种？

Java有四种线程池：

- 第一种：newCachedThreadPool

不固定线程数量，且支持最大为Integer.MAX_VALUE的线程数量:

    public static ExecutorService newCachedThreadPool() {
        // 这个线程池corePoolSize为0，maximumPoolSize为Integer.MAX_VALUE
        // 意思也就是说来一个任务就创建一个woker，回收时间是60s
        return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                    60L, TimeUnit.SECONDS,
                                    new SynchronousQueue<Runnable>());
    }
    
可缓存线程池：

1、线程数无限制。
2、有空闲线程则复用空闲线程，若无空闲线程则新建线程。
3、一定程序减少频繁创建/销毁线程，减少系统开销。

- 第二种：newFixedThreadPool

一个固定线程数量的线程池:

    public static ExecutorService newFixedThreadPool(int nThreads, ThreadFactory threadFactory) {
        // corePoolSize跟maximumPoolSize值一样，同时传入一个无界阻塞队列
        // 该线程池的线程会维持在指定线程数，不会进行回收
        return new ThreadPoolExecutor(nThreads, nThreads,
                                    0L, TimeUnit.MILLISECONDS,
                                    new LinkedBlockingQueue<Runnable>(),
                                    threadFactory);
    }
    
定长线程池：

1、可控制线程最大并发数（同时执行的线程数）。
2、超出的线程会在队列中等待。

- 第三种：newSingleThreadExecutor

可以理解为线程数量为1的FixedThreadPool:

    public static ExecutorService newSingleThreadExecutor() {
        // 线程池中只有一个线程进行任务执行，其他的都放入阻塞队列
        // 外面包装的FinalizableDelegatedExecutorService类实现了finalize方法，在JVM垃圾回收的时候会关闭线程池
        return new FinalizableDelegatedExecutorService
            (new ThreadPoolExecutor(1, 1,
                                    0L, TimeUnit.MILLISECONDS,
                                    new LinkedBlockingQueue<Runnable>()));
    }

单线程化的线程池：

1、有且仅有一个工作线程执行任务。
2、所有任务按照指定顺序执行，即遵循队列的入队出队规则。

- 第四种：newScheduledThreadPool。

支持定时以指定周期循环执行任务:

    public static ScheduledExecutorService newScheduledThreadPool(int corePoolSize) {
        return new ScheduledThreadPoolExecutor(corePoolSize);
    }
    
注意：前三种线程池是ThreadPoolExecutor不同配置的实例，最后一种是ScheduledThreadPoolExecutor的实例。
