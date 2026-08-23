---
title: "MainThread 和 RenderThread区别"
published: 2024-01-19
description: "MainThread 和 RenderThread区别"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-025"
---

# MainThread 和 RenderThread区别

MainThread 和 RenderThread，也就是大家熟悉的**主线程**和**渲染线程**
## 主线程
Android App 的进程是基于 Linux 的，其管理也是基于 Linux 的进程管理机制，Fork 出来的进程，我们这里可以把他看做主线程，但是这个线程还没有和 Android 进行连接，所以无法处理 Android App 的 Message ；由于 Android App 线程运行**基于消息机制** ，那么这个 Fork 出来的主线程需要和 Android 的 Message 消息绑定，才能处理 Android App 的各种 Message
这里就引入了 **ActivityThread** ，确切的说，ActivityThread 应该起名叫 ProcessThread 更贴切一些。ActivityThread 连接了 Fork 出来的进程和 App 的 Message ，他们的通力配合组成了我们熟知的 Android App 主线程。所以说 ActivityThread 其实并不是一个 Thread，而是他初始化了 Message 机制所需要的 MessageQueue、Looper、Handler ，而且其 Handler 负责处理大部分 Message 消息，所以我们习惯上觉得 ActivityThread 是主线程，其实他只是主线程的一个逻辑处理单元。

**ActivityThread 的创建**
App 进程 fork 出来之后，回到 App 进程，查找 ActivityThread 的 Main函数
```
static final Runnable childZygoteInit(
        int targetSdkVersion, String[] argv, ClassLoader classLoader) {
    RuntimeInit.Arguments args = new RuntimeInit.Arguments(argv);
    return RuntimeInit.findStaticMain(args.startClass, args.startArgs, classLoader);
}
```
这里的 startClass 就是 ActivityThread，找到之后调用，逻辑就到了ActivityThread的main函数，main 函数处理完成之后，主线程就算是正式上线开始工作
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrIURviaLhtyLnLnSU3ypKqKXTRMIudBRib9v8TUxBvW9cJ9PxjQmuzWCUw/640?wx_fmt=png&from=appmsg)
Android 四大组件都是运行在主线程上的

## 渲染线程
渲染线程也就是 RenderThread ，最初的 Android 版本里面是没有渲染线程的，渲染工作都是在主线程完成，使用的也都是 CPU ，调用的是 libSkia 这个库，

RenderThread 是在 Android Lollipop 中新加入的组件，负责承担一部分之前主线程的渲染工作，减轻主线程的负担

**软件绘制**
我们一般提到的硬件加速，指的就是 GPU 加速，这里可以理解为用 RenderThread 调用 GPU 来进行渲染加速 。 硬件加速在目前的 Android 中是默认开启的， 所以如果我们什么都不设置，那么我们的进程默认都会有主线程和渲染线程(有可见的内容)。我们如果在 App 的 AndroidManifest 里面，在 Application 标签里面加一个
```
android:hardwareAccelerated="false"
```

关闭硬件加速，系统检测到你这个 App 关闭了硬件加速，就不会初始化 RenderThread，直接 cpu 调用 libSkia 来进行渲染 这就是软件绘制

**硬件加速绘制**
正常情况下，硬件加速是开启的，主线程的 draw 函数并没有真正的执行 drawCall ，而是把要 draw 的内容记录到 DIsplayList 里面，同步到 RenderThread 中，一旦同步完成，主线程就可以被释放出来做其他的事情，RenderThread 则继续进行渲染工作


## 二者的分工
主线程负责处理进程 Message、处理 Input 事件、处理 Animation 逻辑、处理 Measure、Layout、Draw ，更新 DIsplayList ，但是不涉及 SurfaceFlinger 打交道；渲染线程负责渲染渲染相关的工作，一部分工作也是 CPU 来完成的，一部分操作是调用 OpenGL 函数来完成的
当启动硬件加速后，在 Measure、Layout、Draw 的 Draw 这个环节，Android 使用 DisplayList 进行绘制而非直接使用 CPU 绘制每一帧。DisplayList 是一系列绘制操作的记录，抽象为 RenderNode 类，这样间接的进行绘制操作的优点如下

1. DisplayList 可以按需多次绘制而无须同业务逻辑交互
2. 特定的绘制操作（如 translation， scale 等）可以作用于整个 DisplayList 而无须重新分发绘制操作
3. 当知晓了所有绘制操作后，可以针对其进行优化：例如，所有的文本可以一起进行绘制一次
4. 可以将对 DisplayList 的处理转移至另一个线程（也就是 RenderThread）
5. 主线程在 sync 结束后可以处理其他的 Message，而不用等待 RenderThread 结束
