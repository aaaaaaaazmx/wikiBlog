---
title: "谈谈Android启动流程"
published: 2022-10-17
description: "谈谈Android启动流程"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-056"
---

# 谈谈Android启动流程

> 这里会使用面试的视角来看这个问题，知其然即可，如果需要知其所以然还需要自己多下功夫

这个问题也是一个比较常见的问题，通常是作为一道前置性问题，考察一下面试者的底子，然后顺着这个问题扩展开

对于启动流程的这个问题呢，我们可以从以下3个点去回答

1. 启动的顺序
2. 相关核心进程以及作用
3. 进入桌面

> _请看到最后哦，会给出一张图来总结下这个问题_


# 启动顺序
当我们按下手机开机按键之后就开始了Android系统的启动，

1. **首先就是上电过程，加载Bootloader**

当按下电源按键后，引导芯片代码开始从预定义的地方（固化在 ROM 中的预设代码）开始执行，芯片上的 ROM 会寻找 Bootloader 代码，并加载到内存（RAM）中

这里我们最好也跟面试官聊下2个重要的概念** Bootloader**和**Rom**

Android 系统虽然也是基于 Linux 系统的，但是由于 Android 属于嵌入式设备，并没有像 PC 那样的 BIOS 程序。 取而代之的是 **Bootloader —— 系统启动加载器**。 它类似于PC的 BIOS，完成由硬件启动到操作系统的过度


在系统加载前，用以初始化硬件设备，建立内存空间的映像图，为最终调用系统内核准备好环境。

在PC中 BIOS是放在系统盘中比如C盘，但是Android并没有硬盘 取而代之的 **ROM**,
Bootloader就是存放其中，ROM跟硬盘一样也是会划分不同的区域，用于放置不同的程序，主要如下：

- /boot：存放引导程序，包括内核和内存操作程序。
- /system：相当于电脑 C 盘，存放 Android 系统及系统应用。
- /recovery：恢复分区，可以进入该分区进行系统恢复。
- /data：用户数据区，包含了用户的数据：联系人、短信、设置、用户安装的程序。
- /cache：安卓系统缓存区，保存系统最常访问的数据和应用程序。
- /misc：包含一些杂项内容，如系统设置和系统功能启用禁用设置。
- /sdcard：用户自己的存储区，可以存放照片，音乐，视频等文件。



2. **加载linux内核阶段**

接着 Bootloader 开始执行，Bootloader 会读取 ROM 找到操作系统并将 Linux 内核加载到 RAM 中。

当 Linux 内核启动后会初始化各种软硬件环境，加载驱动程序，挂载根文件系统，Linux 内核加载的最后阶段会启动并执行第一个**用户空间进程 init 进程**。

> init 进程是第一个用户进程pid=1，那么pid=0是什么呢 idle进程


3. **init进程**

第一个**用户空间进程 pid=1，**当系统启动完成之后，init进程会作为守护进程监视其它进程。在Linux中所有的进程都是由init进程直接或间接fork出来的，在init进程启动的过程中，会相继启动servicemanager(binder服务管理者)、Zygote进程。而Zygote又会创建system_server进程以及app进程

init 进程启动分为前后两部分，前一部分是在内核启动的，主要是完成创建和内核初始化工作，内容都是跟 Linux 内核相关的；后一部分是在用户空间启动的，主要完成 Android 系统的初始化工作。

Android 系统一般会在根目录下放一个 init 的可执行文件，也就是说 Linux 系统的 init 进程在内核初始化完成后，就直接执行 init 这个文件，这个文件的源代码在/system/core/init/init.cpp。
主要分为3个阶段，前2个阶段都是在初始化环境做些准备，第三阶段解析init.rc才是重头戏

- init 进程第一阶段   FirstStageMain

init进程启动的第一步，init 进程第一阶段做的主要工作是挂载分区，创建设备节点和一些关键目录，初始化日志输出系统，启用 SELinux 安全策略。

- init 进程第二阶段   SetupSelinux

init 进程第二阶段主要工作是初始化属性系统，解析 SELinux 的匹配规则，处理子进程终止信号，启动系统属性服务，可以说每一项都很关键。如果说第一阶段是为属性系统、SELinux 做准备，那么第二阶段就是真正去把这些落实的。

- init.rc 文件解析   SecondStageMain

这一阶段 init 进程做了许多重要的事情，比如解析 init.rc 文件，这里配置了所有需要执行的 action 和需要启动的 service，init 进程根据语法一步步去解析 init.rc，将这些配置转换成一个个数组、队列，然后开启无限循环去处理这些数组、队列中的 command 和 service，并且通过 epoll 监听子进程结束和属性设置。

init.rc 文件是 Android 系统的重要配置文件，位于 /system/core/rootdir/ 目录中。 主要功能是定义了系统启动时需要执行的一系列 action 及执行特定动作、设置环境变量和属性和执行特定的 service。
以上过程如下图所示
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1N2OwE2gaavQc4bAbGBx9u6cG38LJhk4b4IqNoNNBNVfz5NaksXlCsA/640?wx_fmt=png&from=appmsg)

# 核心进程
核心进程在解析 init.rc文件中体现，主要是启动了 ServiceManager 和 Zygote 等服务

**ServiceManger**
ServiceManager 是 Binder IPC 通信过程中的守护进程，本身也是一个 Binder 服务。ServiceManager 进程主要是启动 Binder，提供服务的查询和注册。
关于ServiceManager请看单独介绍的一篇，这里也不再赘述了

**surface_flinger 进程**
SurfaceFlinger 负责图像绘制，是应用 UI 的核心，其功能是合成所有 Surface 并渲染到显示设备。把多个来源的图像数据，如需合成则进行合成 否则直接提交给display驱动进行显示
SurfaceFlinger 进程主要是启动 FrameBuffer，初始化显示系统。
后面会有文章单独介绍，这里不再赘述了

**media_server 进程**
MediaServer 进程主要是启动 AudioFlinger 音频服务，CameraService 相机服务。负责处理音频解析播放，相机相关的处理。

**Zygote进程**
Zygote进程是Android中所有Java进程的父进程。Zygote进程在Init进程启动过程中被以service服务的形式启动。主要功能：

- 注册底层功能的 JNI 函数到虚拟机
- 预加载 Java 类和资源 (节省下次进程创建的时间)
- fork 并启动 system_server 核心进程
- 作为守护进程监听处理“孵化新进程”的请求

关于zygote 请看zygote单独介绍的一篇，这里不再赘述了

# 进入桌面
Zygote 启动期间会 fork出核心进程system_server ，然后进入休眠(runSelectLoop)，System Server是Android系统的核心，托管了多个系统服务，如Activity Manager、Package Manager、Window Manager等。这些服务在System Server进程中启动，为应用程序提供了关键的系统功能。
最后调用createSystemContext()创建系统上下文，创建**ActivityThread(UI线程)**及开启各种服务等等。

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1SlzVnbRG81VKS6JohZw7ibLYS4rVbUsjDVxcGMetKz768tAZ1GU9V7A/640?wx_fmt=png&from=appmsg)

可以看到，SystemServer最重要的工作就是通过执行三个方法来启动所有服务

- startBootstrapServices();
- startCoreServices();
- startOtherServices();

分别对应引导服务、核心服务和其他服务：

- 引导服务(Bootstrap services)：这类服务包括 Installer，ActivityManagerService
PowerManagerService, DisplayManagerService, PackageManagerService, UserManagerService等
- 核心服务(Core services )： 这类服务包括 LightsService, BatteryService, UsageStatsServtce,
WebViewUpdateService等
- 其他服务：所有其它服务

所有的服务启动完成后会注册到 ServiceManager。 ActivityManagerService 服务启动完成后，会进入 ActivityManagerService.systemReady()，此时AMS启动桌面并且发送BOOT_COMPLETED广播，通过socket 唤醒Zygote 去fork Launcher进程，从而打开桌面
> 这块在 Zygote进程有详细介绍

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1TFe0Dm3hLr8rXs0sB4xO09COicwgsryWsglibfUVuE5op97J08pbMTLQ/640?wx_fmt=png&from=appmsg)
这里稍微补充下ActivityManagerService(AMS),App的启动都离不开它，它也是SystemServer启动的重要服务之一
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1vhKVOpf5TFvtIvMvlvMMo6LRDv1uxQXorzrDfaiaNTFblOiazUHhKDdw/640?wx_fmt=png&from=appmsg)
启动桌面 Launcher App，首先会通过 Zygote 进程 fork 一个新进程作为 App 进程，然后创建 Application，创建启动 Activity，最后用户才会看到桌面。

# 总结
答题得分点 接下来我们总结一下：

- **按下电源，ROM中的Bootloader会被加载到内存中**
- **Bootloader初始化软硬件环境后，启动Linux内核**
- **Linux内核启动会做设置缓存、加载驱动等一系列操作，启动完成后会启动init进程**
- **init进程会初始化属性服务，并且解析init.rc文件，启动zygote进程**
- **zygote进程启动会创建JVM，并为其注册JNI函数，然后创建服务端Socket，启动runselectLoop，进入休眠，启动system_server进程**
- **system_server启动AMS、PMS、WMS等各种服务**
- **AMS启动Launcher，systemServer通过socket唤起zygote fork Launcher进程，将已安装的应用图片显示在界面上。**

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1ibYM875I9kdvQKsjSUIlpB1N6AhLLklibMJiczbmhdWb4sQdP7SXdLGZg/640?wx_fmt=png&from=appmsg)
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1EclG5bGG6lD6S7iahLarzO4wxC965jKpOPnM2BP2fCfkn95wLDiaWYUQ/640?wx_fmt=png&from=appmsg)
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1jicf62qvZ5vcfFsrRtLNPygb3UNmzL8qaVyZChyCa1VSE5cDwibGcxdg/640?wx_fmt=png&from=appmsg)

