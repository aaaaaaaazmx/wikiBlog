---
title: "LeakCanary实现原理"
published: 2020-08-03
description: "LeakCanary实现原理"
tags: ["Android","进阶"]
category: "android进阶"
draft: false
slug: "android-adv-023"
---

# LeakCanary实现原理

##### 这个库是做什么用？

内存泄露检测框架。

##### 为什么要在项目中使用这个库？

- 针对Android Activity组件完全自动化的内存泄漏检查，在最新的版本中，还加入了android.app.fragment的组件自动化的内存泄漏检测。
- 易用集成，使用成本低。
- 友好的界面展示和通知。

##### 这个库都有哪些用法？对应什么样的使用场景？

直接从application中拿到全局的 refWatcher 对象，在Fragment或其他组件的销毁回调中使用refWatcher.watch(this)检测是否发生内存泄漏。

##### 这个库的优缺点是什么，跟同类型库的比较？

检测结果并不是特别的准确，因为内存的释放和对象的生命周期有关也和GC的调度有关。

##### 这个库的核心实现原理是什么？如果让你实现这个库的某些核心功能，你会考虑怎么去实现？

主要分为如下7个步骤：

- 1、RefWatcher.watch()创建了一个KeyedWeakReference用于去观察对象。
- 2、然后，在后台线程中，它会检测引用是否被清除了，并且是否没有触发GC。
- 3、如果引用仍然没有被清除，那么它将会把堆栈信息保存在文件系统中的.hprof文件里。
- 4、HeapAnalyzerService被开启在一个独立的进程中，并且HeapAnalyzer使用了HAHA开源库解析了指定时刻的堆栈快照文件heap dump。
- 5、从heap dump中，HeapAnalyzer根据一个独特的引用key找到了KeyedWeakReference，并且定位了泄露的引用。
- 6、HeapAnalyzer为了确定是否有泄露，计算了到GC Roots的最短强引用路径，然后建立了导致泄露的链式引用。
- 7、这个结果被传回到app进程中的DisplayLeakService，然后一个泄露通知便展现出来了。

简单来说就是：

在一个Activity执行完onDestroy()之后，将它放入WeakReference中，然后将这个WeakReference类型的Activity对象与ReferenceQueque关联。这时再从ReferenceQueque中查看是否有该对象，如果没有，执行gc，再次查看，还是没有的话则判断发生内存泄露了。最后用HAHA这个开源库去分析dump之后的heap内存（主要就是创建一个HprofParser解析器去解析出对应的引用内存快照文件snapshot）。

流程图：

![image](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUw9BicVvmviceybO8w5pgneyreoPAUxNqu5zrpvIVyh4OcbPLibIqmaESicMt53hp1H3NiaT2qsych9CA/640?wx_fmt=png)
(https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUw9BicVvmviceybO8w5pgneyreoPAUxNqu5zrpvIVyh4OcbPLibIqmaESicMt53hp1H3NiaT2qsych9CA/640?wx_fmt=png)

源码分析中一些核心分析点：

AndroidExcludedRefs：它是一个enum类，它声明了Android SDK和厂商定制的SDK中存在的内存泄露的case，根据AndroidExcludedRefs这个类的类名就可看出这些case都会被Leakcanary的监测过滤掉。

buildAndInstall()（即install方法）这个方法应该仅仅只调用一次。

debuggerControl : 判断是否处于调试模式，调试模式中不会进行内存泄漏检测。为什么呢？因为在调试过程中可能会保留上一个引用从而导致错误信息上报。

watchExecutor : 线程控制器，在 onDestroy() 之后并且主线程空闲时执行内存泄漏检测。

gcTrigger : 用于 GC，watchExecutor 首次检测到可能的内存泄漏，会主动进行 GC，GC 之后会再检测一次，仍然泄漏的判定为内存泄漏，最后根据heapDump信息生成相应的泄漏引用链。

gcTrigger的runGc()方法：这里并没有使用System.gc()方法进行回收，因为system.gc()并不会每次都执行。而是从AOSP中拷贝一段GC回收的代码，从而相比System.gc()更能够保证进行垃圾回收的工作。

    Runtime.getRuntime().gc();

子线程延时1000ms；

System.runFinalization();

install方法内部最终还是调用了application的registerActivityLifecycleCallbacks()方法，这样就能够监听activity对应的生命周期事件了。

在RefWatcher#watch()中使用随机的UUID保证了每个检测对象对应的key 的唯一性。

在KeyedWeakReference内部，使用了key和name标识了一个被检测的WeakReference对象。在其构造方法中将弱引用和引用队列 ReferenceQueue 关联起来，如果弱引用reference持有的对象被GC回收，JVM就会把这个弱引用加入到与之关联的引用队列referenceQueue中。即 KeyedWeakReference 持有的 Activity 对象如果被GC回收，该对象就会加入到引用队列 referenceQueue 中。

使用Android SDK的API Debug.dumpHprofData() 来生成 hprof 文件。

在HeapAnalyzerService（类型为IntentService的ForegroundService）的runAnalysis()方法中，为了避免减慢app进程或占用内存，这里将HeapAnalyzerService设置在了一个独立的进程中。

##### 你从这个库中学到什么有价值的或者说可借鉴的设计思想？

