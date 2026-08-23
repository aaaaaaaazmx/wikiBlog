---
title: "能说一下JVM的内存区域吗？"
published: 2021-03-16
description: "能说一下JVM的内存区域吗？"
tags: ["Java","JVM","虚拟机"]
category: "java虚拟机"
draft: false
slug: "jvm-017"
---


## 能说一下JVM的内存区域吗？
JVM内存区域最粗略的划分可以分为堆和栈，当然，按照虚拟机规范，可以划分为以下几个区域：
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLVXLYDoDiczicKRxlzxL22yDH7FfuekV22fcO0Aa3yQuj8R7yiauxuBY2saYwlkWMF4OsLTY4WnCE9hg/640?wx_fmt=png&from=appmsg)
Java虚拟机运行时数据区
JVM内存分为线程私有区和线程共享区，其中方法区和堆是线程共享区，虚拟机栈、本地方法栈和程序计数器是线程隔离的数据区。
**1、程序计数器**
程序计数器（Program Counter Register）也被称为PC寄存器，是一块较小的内存空间。
它可以看作是当前线程所执行的字节码的行号指示器。
**2、Java虚拟机栈**
Java虚拟机栈（Java Virtual Machine Stack）也是线程私有的，它的生命周期与线程相同。
Java虚拟机栈描述的是Java方法执行的线程内存模型：方法执行时，JVM会同步创建一个栈帧，用来存储局部变量表、操作数栈、动态连接等。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLVXLYDoDiczicKRxlzxL22yDHFCHSBLAL3pY60ibeWuKpCvSrTK1col8jk0d0hx0jEp0VWCGjTJnvricg/640?wx_fmt=png&from=appmsg)
Java虚拟机栈
**3、本地方法栈**
本地方法栈（Native Method Stacks）与虚拟机栈所发挥的作用是非常相似的，其区别只是虚拟机栈为虚拟机执行Java方法（也就是字节码）服务，而本地方法栈则是为虚拟机使用到的本地（Native）方法服务。
Java 虚拟机规范允许本地方法栈被实现成固定大小的或者是根据计算动态扩展和收缩的。
**4、Java堆**
对于Java应用程序来说，Java堆（Java Heap）是虚拟机所管理的内存中最大的一块。Java堆是被所有线程共享的一块内存区域，在虚拟机启动时创建。此内存区域的唯一目的就是存放对象实例，Java里“**几乎**”所有的对象实例都在这里分配内存。
Java堆是垃圾收集器管理的内存区域，因此一些资料中它也被称作“GC堆”（Garbage Collected Heap，）。从回收内存的角度看，由于现代垃圾收集器大部分都是基于分代收集理论设计的，所以Java堆中经常会出现新生代、老年代、Eden空间、From Survivor空间、To Survivor空间等名词，需要注意的是这种划分只是根据垃圾回收机制来进行的划分，不是Java虚拟机规范本身制定的。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLVXLYDoDiczicKRxlzxL22yDHPkj9VDao5M8PTy748SibfMrXuraicXibxZDvpYWtBib55E4NXGQ55QMUsg/640?wx_fmt=png&from=appmsg)
Java 堆内存结构
**5.方法区**
方法区是比较特别的一块区域，和堆类似，它也是各个线程共享的内存区域，用于存储已被虚拟机加载的类型信息、常量、静态变量、即时编译器编译后的代码缓存等数据。
它特别在Java虚拟机规范对它的约束非常宽松，所以方法区的具体实现历经了许多变迁，例如jdk1.7之前使用永久代作为方法区的实现。
