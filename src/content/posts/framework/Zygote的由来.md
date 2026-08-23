---
title: "Zygote的由来"
published: 2021-04-11
description: "Zygote的由来"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-040"
---

> 这里会使用面试的视角来看这个问题，知其然即可，如果需要知其所以然还需要自己多下功夫


这道题呢，主要是考察你对framework的基本认识是怎样的，要是这个都答不好，基本上面试官是不想继续在framework这个话题上和你继续纠缠了。

对于zygote的理解这道题呢 我们通常可以从以下4个方面，由浅入深的解答

1. Zygote的由来及作用
2. Zygote的如何打开java世界大门
   1. native到java世界
   2. 开启桌面
   3. SystemServer的一些细节
3. 创建其他子进程
4. Zygote的一些经典问题
5. 小结

能把前3点讲清楚基本上就得分了

> _请看到最后哦，会给出一张图来总结下这个问题_

# Zygote的由来
首先我们得回答一下什么是Zygote，以及它的作用

Zygote是个大名鼎鼎的进程，是Android系统启动过程中**第一个Java进程**的名称，一般称作**孵化器**。
它的**作用**简而言之就是

- 打开java世界的大门
- fork出 SystemServer 接受SystemServer的请求，fork出新的应用进程，如launch
- 共享资源

当我们手机按电源键系统启动时候就会开始创建zygote进程

由于安卓是Linux系统，启动之后开始进行** linux的加电**、**加载linux内核**，然后开启**init进程**，

init 是用户空间的第一个进程，init 进程通过**解析init.rc 文件 **并fork出一些比较重要的进程比如servicemanager(binder的管家)、还有我们今天的主角**Zygote**,  Zygote又会创建system_server进程以及app进程。

流程如下：
![image.png](https://cdn.nlark.com/yuque/0/2024/png/215777/1709141436128-315b9c46-9e00-438d-aeda-733d9747ecc4.png)           
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1JTo9NZlT0FukibZr3sSz2sbcYZRVKIO46YSZOoMhSZc8FkClXkZFQOw/640?wx_fmt=png&amp;from=appmsg)

这里得稍微提一下init进程，init进程(pid=1),是Linux系统的用户进程，**init进程是所有用户进程的鼻祖**。

# Zygote的如何开启java世界大门
## Native到Java世界
有了zygote进程之后，就要开始发挥它的作用了。上面提到

- 打开Java世界的大门
- 孵化SystemServer 接受SystemServer的请求，fork出新的应用进程，如launch
- 共享资源

其中zygote如何完成从linux打开java世界的大门，这里是考察问题的重点
这个过程主要分为三步

- 启动虚拟机
- 注册Android的JNI函数
- 进入Java世界

如下图所示
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1KYkicyYIC0SvK7cygRvPjLuHDHQVj16JmQcWbcnbNeibgOEAeOfvnyzA/640?wx_fmt=png&amp;from=appmsg)
**Native层**
在app_main.cpp中执行main()函数

- 构造AppRuntime对象，执行其start方法，启动Zygote进程

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1iclX83xG0kj3ZtCxTYNdNdt31VfNVleShDp18Udy5K2J6vbUgWUWBhg/640?wx_fmt=png&amp;from=appmsg)

- 并创建**Java虚拟机**、注册一系列的JNI函数将Java和Native层关联起来
- 通过JNI调用Java方法，执行com.android.internal.os.ZygoteInit 的 main 方法

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1uNFohHT7h3JicWeKJHVcz20Io3luqBnHFBJ9m6NG1F4VsblXn6vv3Kw/640?wx_fmt=png&amp;from=appmsg)

**Java**

- 完成Native层切换到Java层，反射执行ZygoteInit.java main()函数 **fork system_server进程**，system_server为所有App提供服务包括ams、wms等，可以说是系统的核心进程之一
- 预加载进程公共资源类以及资源(后续fork的子进程可以复用，加快后续进程创建速度） 
- 使用registerZygoteSocket方法创建服务器端Socket，zygote便会将自身挂起，并循环监(runSelectLoop)听来自system_server创建子进程的Socket请求。

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1MLGyDyrRe1YXbzD115QEEXNQAAlq8IUGSH0VQqznE2qS9hj8AOicibwg/640?wx_fmt=png&amp;from=appmsg)
这样就从linux世界来到了java世界，此时要注意 zygote已经进入loop循环休眠，交给systemserver来进行后续的处理
## 开启桌面
不过此时你的手机可能还是下图这个状态，并没有到熟悉的桌面，
![image.png](https://cdn.nlark.com/yuque/0/2024/png/215777/1708972036744-8829316b-e21e-410e-935e-3b4aa29057ce.png)

这里还需要zygotefork出来的systemServer来帮忙进入桌面launcher 我们再来仔细看下这块

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck12p10r8fXogLfJmtWSib5CmU6qHPia4UBUG2owm3NA78BnIhMhibatsXFw/640?wx_fmt=png&amp;from=appmsg)

1. Zygote fork出systemserver，进入休眠。
2. SystemServer负责启动和管理整个Java frameWork。SystemServer进程在开启的时候，会初始化AMS、WMS、PMS等关键服务。同时会加载本地系统的服务库，调用createSystemContext()创建系统上下文，创建ActivityThread及开启各种服务等等。
3. systemserver中创建AMS服务(systemReady)，请求systemserver向zygote fork launcer进程 从而进入桌面

## SystemServer的一些细节
这里再补充一些systemserver的相关细节，当你聊到这里时候，面试官通常会问一下SystemServer，这里我们需要抓住3个要点

1. 是Zygote**孵化的第一个进程**
2. 负责启动核心系统服务，包含ActivityManager，WindowManager，PackageManager，PowerManager等
3. 触发Launcher启动

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck12NLQha7JwslLbxwqHe2JZmOtIibJ2TGlwFL2tf9sOSuaSEAAAcQQemA/640?wx_fmt=png&amp;from=appmsg)
我们来看下核心服务这里
System Server负责启动核心系统服务，主要分为3大类，
1.**startBootstrapServices 启动引导服务** 比如AMS（actvitymanagerservice）、PMS电池和包管理服务、DisplayManagerService、传感器服务等
2.**startCoreServices 启动核心服务** 如 电池状态管理服务、驱动加载服务、webview升级服务等
3.**startOtherServices 启动其他服务** 如 蓝牙服务、窗口管理服务wms、电话服务等
AMS中有个重要的方法**systemReady**，触发AMS启动 Launcher Activity(不同源码版本这里有些差异这里不再赘述),
从这里从通过socket唤起沉睡的zygote去创建launcer进程，从而进入桌面

## 

# Zygote创建其他子进程
当按下电源键到进入桌面这个过程zygote的创建以及作用介绍一遍之后，
面试官可能会继续问下，在桌面上点击比如微信图标 

zygote的过程，这里其实跟加载桌面进程有异曲同工之妙，如下图
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck10LABa8qGG6Nz96ric6TIhIY39LQzybyRTwdCia5hCx4AvGfiaic6WPdLpw/640?wx_fmt=png&amp;from=appmsg)

- Launcher App 收到点击请求，会执行startActivity，这个命令会通过Binder传递给system_server进程里的AMS(ActivityManagerService)模块
- AMS 发现对应的微信进程并没有启动，于是通过Socket发送创建微信进程的请求给Zygote
- Zygote 收到Socket请求后，fork 微信进程并执行对应的入口函数，之后就会显示出微信的界面了

Zygote是一个C/S模型，Zygote进程作为服务端，它主要负责创建Java虚拟机，加载系统资源，启 
动SystemServer进程，以及在后续运行过程中启动普通的应用程序，其他进程作为客户端向它发 
出“孵化”请求，而Zygote接收到这个请求后就“孵化”出一个新的进程。比如，当点击Launcher里 
的 应用程序图标去启动一个新的应用程序进程时，这个请求会到达框架层的核心服务 
ActivityManagerService中，当AMS收到这个请求后，它通过调用Process类发出一个“孵化”子进 
程的Socket请求，而Zygote监听到这个请求后就立刻fork一个新的进程出来

> runSelectLoop Zygote采用高效的I/O多路复用机制，保证在没有客户端连接请求或数据处理时休眠，否则响应客户端的请求。

# 2个经典问题
当你聊到这里基本上是大致说清楚的zygote了，这时候，面试官可能会继续追问，看看你对一些细节是否有些了解下面是2个比较经典的问题，这里使用问答机制

1. **Zygote的IPC通信机制为什么不采用binder？如果采用binder的话会有什么问题么？**

**fork**机制是单线程**fork**，也就是说**fork**出来的子进程只有一个线程，如果使用**binder**机制去实现进程间的通讯，因为**binder**机制有**binder**线程池，线程之间的安全由锁控制，所以当**fork**出现的子线程如果只有一个线程时，很可能会引起死锁，主要答出关键点单线程、死锁基本就ok了

2. **为什么后续进程由Zygote去fork进程，而不是由SystemServer去fork？**

由Zygote去专门处理fork进程和进程的资源，比如Android虚拟机和主题加载，JNI函数注册等，职责和分工更加明确，SystemServer进程除了需要启动其他系统服务，比如AMS，PMS等，还需要注册服务等等工作，而且SystemServer进程也是通过binder线程池去和其他进程通讯，所以由Zygote去fork进程，也是因为这样，所以才起了这个名字Zygote(孵化器) 。 
# 小结
答题得分点

1. zygote  initrc解析来的
2. zygote 作用，如何开启java世界的大门
3. 如何跟systemserver配合的 打开桌面launcer进程以及后续点击应用启动新的应用进程
4. 经典问题

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUGHgUuYAt58jImv3hCgck1JTo9NZlT0FukibZr3sSz2sbcYZRVKIO46YSZOoMhSZc8FkClXkZFQOw/640?wx_fmt=png&amp;from=appmsg)
