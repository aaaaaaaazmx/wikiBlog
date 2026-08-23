---
title: "谈谈对Android中Zygote的理解(1)"
published: 2023-04-18
description: "谈谈对Android中Zygote的理解(1)"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-057"
---

# 谈谈对Android中Zygote的理解
### Zygote是什么？
Zygote进程大名鼎鼎，英文叫做受精卵，一般叫做孵化器，安卓上其他的应用进程都是由它孵化的,是Android系统启动过程中第一个Java进程的名称。
当我们手机按电源键系统启动时候就会开始创建zygote进程, 由于安卓是Linux内核，启动之后开始进行linux的加电、加载linux内核，然后开启init进程，init是用户空间的第一个进程。
init进程通过解析init.rc文件并fork出相应的进程比如binder的管家servicemanager、还有我们今天的主角Zygote。

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1YG9N1d7uqGwyhMUfVMzG88YJ0QO7BUxjX2JCYKsT9tUCxOQgVI3YIQ/640?wx_fmt=png&from=appmsg)
### Zygote的作用是什么？
对于Zygote的作用实际上可以概括为以下两点：

- 创建SystemServer
- 孵化应用进程

### Zygote的启动过程

- Zygote进程在Init进程启动过程中被以service服务的形式启动：

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1sVcdobHlZtoUCTp8dYH2nsmuyBGV60OJJggKhKeXgv0peiaF7gfcAFg/640?wx_fmt=png&from=appmsg)

- 调用app_main.cpp的main函数中的AppRuntime的start方法来启动Zygote进程
- 调用startVm函数来创建虚拟机，调用startReg函数为java虚拟机注册JNI方法
- 通过toSlashClassName找到ZygoteInit，通过GetStaticMethedID函数找到main方法然后调用，ZygoteInit的main方法是由Java语言编写的，当前的运行逻辑在Native中，这就需要JNI来调用Java，**这样Zygote就从Native层进入了Java框架层。**

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1dBJhu3avicE87O1wJZIOkbIcoFbnQFd0ibFr0FrwUY49shc5jqPUfibXA/640?wx_fmt=png&from=appmsg)
```
service zygote /system/bin/app_process -Xzygote /system/bin --zygote --start-system-server
class main
socket zygote stream 660 root system
```

- ZygoteInit的main方法
   - 通过registerServerSocket方法来创建一个Server端的socket，这个name为zygote的socket用于等待ActivityManagerService请求Zygote来创建新的应用程序进程
   - 预加载，预加载项如下：
```
preloadClasses();
preloadResources();
preloadOpenGL();
preloadSharedLibraries();
preloadTextResources();
WebViewFactory.prepareWebViewInZygote();
...
```
Zygote进程预加载系统资源后，然后通过它孵化出其他的虚拟机进程，进而共享虚拟机内存和框架层资源，这样大幅度提高应用程序的启动和运行速度。

   - 启动SystemServer进程
   - 执行runSelectLoop()方法等待消息去创建应用进程

有几个图可以帮助我们了解一下
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1Jv7jibplKhnDQe5vTgdTdz8EsJbJRpZ8I2Yib0hUwqfMeVpKZIaaoHYA/640?wx_fmt=png&from=appmsg)

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1Ge4RUxszHJGStLfQrcRR3U8icib11yc68njtC9ibrl2GNfPjH4vo0M0Yg/640?wx_fmt=png&from=appmsg)

**总结**
Zygote是一个C/S模型，Zygote进程作为服务端，它主要负责创建Java虚拟机，加载系统资源，启 动SystemServer进程，以及在后续运行过程中启动普通的应用程序，其他进程作为客户端向它发 出“孵化”请求，而Zygote接收到这个请求后就“孵化”出一个新的进程。比如，当点击Launcher里 的 应用程序图标去启动一个新的应用程序进程时，这个请求会到达框架层的核心服务 ActivityManagerService中，当AMS收到这个请求后，它通过调用Process类发出一个“孵化”子进 程的Socket请求，而Zygote监听到这个请求后就立刻fork一个新的进程出来
