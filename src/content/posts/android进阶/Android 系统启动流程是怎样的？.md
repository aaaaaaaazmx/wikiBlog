---
title: "Android 系统启动流程是怎样的？"
published: 2022-07-10
description: "Android 系统启动流程是怎样的？"
tags: ["Android","进阶"]
category: "android进阶"
draft: false
slug: "android-adv-004"
---

# Android 系统启动流程是怎样的？


## Bootloader开始到启动launcher app的整个流程的回答。

概要分析
从系统角度看，Android的启动过程可分为3个大的阶段：
- 1）Bootloader引导阶段
- 2）装载和启动Linux内核阶段
- 3）启动Android系统阶段，当然这个阶段很复杂，大体可以可分为如下阶段：
    - 3.1）启动Init进程
    - 3.2）启动Zygote
    - 3.3）启动SystemService
    - 3.4）启动SystemServer
    - 3.5）启动Home


### Bootloader引导阶段
当按下电源键开机时，最先运行的就是Bootloader。
Bootloader的主要作用是初始化基本的硬件设备（如 CPU、内存、Flash等）并且建立内存空间映射，为装载Linux内核准备好合适的运行环境。
一旦Linux内核装载完毕，Bootloader将会从内存中清除掉
如果在Bootloader运行期间，按下预定义的的组合键，可以进入系统的更新模块。Android的下载更新可以选择进入Fastboot模式或者Recovery模式:

Fastboot是Android设计的一套通过USB来更新Android分区映像的协议，方便开发人员快速更新指定分区。
Recovery是Android特有的升级系统。利用Recovery模式可以进行恢复出厂设置，或者执行OTA、补丁和固件升级。进入Recovery模式实际上是启动了一个文本模式的Linux

### 装载和启动Linux内核
Android 的 boot.img 存放的就是Linux内核和一个根文件系统

Bootloader会把boot.img映像装载进内存
然后Linux内核会执行整个系统的初始化
然后装载根文件系统
最后启动Init进程

### 启动Init进程
Linux内核加载完毕后，会首先启动Init进程，Init进程是系统的第一个进程。
Init进程启动过程中，会解析Linux的配置脚本init.rc文件。根据init.rc文件的内容，Init进程会做如下的事物：

- 装载Android的文件系统
- 创建系统目录
- 初始化属性系统
- 启动Android系统重要的守护进程，像USB守护进程、adb守护进程、vold守护进程、rild守护进程等
- 最后，Init进程也会作为守护进程来执行修改属性请求，重启崩溃的进程等操作

### 启动ServiceManager
ServiceManager由Init进程启动。ServiceManager的主要作用是管理Binder服务，负责Binder服务的注册与查找。ServcieManager 是一个守护进程，这个进程会一直存在于后台。当SystemServer启动 AMS，WMS，PMS等服务的时候，会将服务的binder注册到ServiceManager中，由ServcieManager来进行统一的保存。当某个进程如App进程想调用AMS和其他进程通信的时候，就会去ServiceManager中获取AMS的binder，然后通过这个binder来调用AMS的代码进行相关的操作。
5.启动Zygote进程
Init进程初始化结束时，会启动Zygote进程。Zygote进程负责fork出应用进程，是所有应用进程的父进程

Zygote进程初始化时会创建Android 虚拟机、预装载系统的资源文件和Java类
所有从Zygote进程fork出的用户进程都将继承和共享这些预加载的资源，不用浪费时间重新加载，加快的应用程序的启动过程
启动结束后，Zygote进程也将变为守护进程，负责响应启动APK的请求。

更多关于zygote启动流程的细节请注意学习后面的zygote相关的章节

### 启动SystemServer
SystemServer是Zygote进程fork出的第一个进程，也是整个Android系统的核心进程

SystemServer中运行着Android系统大部分的Binder服务
SystemServer首先启动本地服务SensorManager
接着启动包括ActivityManagerService、WindowsManagerService、PackageManagerService在内的所有Java服务

更多关于SystemServer章节的细节请学习后面的SystemServer相关的章节。
7.启动MediaServer
MediaServer由Init进程启动。它包含了一些多媒体相关的本地Binder服务，包括：CameraService、AudioFlingerService、MediaPlayerService、AudioPolicyService
8.启动Launcher

SystemServer加载完所有的Java服务后，最后会调用ActivityManagerService的SystemReady()方法
在SystemReady()方法中，会发出Intent<android.intent,category.HOME>
凡是响应这个Intent的apk都会运行起来，一般Launcher应用才回去响应这个Intent

总结
总的来说，系统启动流程是先通电，然后进入BootLoader引导阶段，然后再启动linux系统，然后再启动Android系统各进程。由底层开始启动，逐步启动上层的过程。

