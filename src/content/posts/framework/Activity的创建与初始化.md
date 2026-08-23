---
title: "Activity的创建与初始化"
published: 2024-10-04
description: "Activity的创建与初始化"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-002"
---

## Activity的创建与初始化

**Activity 启动主要涉及到3个进程。**

   1. **系统进程 SystemServer** （负责管理整个framework，是Zygote孵化的第一个进程）
   2. **App进程**（App进程是用户点击桌面icon时，通过Launcher进程请求SystemServer，再调用Zygote孵化的）
   3. **Zygote进程**（所有进程孵化都由Zygote完成，而Zygote是init进程的子进程，也由init进程孵化）
   4. 如果点击桌面icon启动还会涉及到 **Launcher进程**（Zygote孵化的第一个应用进程）


**Activity启动流程主要包含几步？**
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrIKc2OYCnict0lYdiaxAamoV7KQ5R4l6Fmh4uPzObnia2h79vIqRWrLCfiaQ/640?wx_fmt=png&from=appmsg)
我们以点击Launcher的一个icon为开始，整体扯一下Activity的启动过程，桌面其实就是LauncherApp的一个Activity

1. 当点击Launcher的icon开始，Launcher进程会像AMS发送点击icon的启动信息（这些信息就是在AndroidMainifest.xml中<intent-filter>标签定义的启动信息，数据由PackageManagerService解析出来）
2. AMS收到信息后会先后经过ActivityTaskManagerService->ActivityStartController->ActivityStarter内部类Request，然后把信息存到Request中，并通知Launcher进程让Activity休眠
> 补充个小知识点，这个过程会检测Activity在AndroidMainifest.xml的注册，如果没有注册就报错了

3. Launcher进程的ApplicationThread对象收到消息后调用handlePauseActivity()进行暂停，并通知AMS已经暂停。
> 实现细节：ActivityThread.sendMessage()通过ActivityThread的H类发送Handler消息，然后触发 mTransactionExecutor.execute(transaction)，
执行过程中依赖ActivityClientRecord.mLifecycleState数值并通过ClientTransactionHandler抽象类的实现（ActivityThread）进行分发。
注 ：ActivityClientRecord.mLifecycleState（-1 ~ 7分别代表 UNDEFINED, PRE_ON_CREATE, ON_CREATE, ON_START, ON_RESUME, ON_PAUSE, ON_STOP, ON_DESTROY, ON_RESTART）

4. AMS收到Launcher的已暂停消息后，会检查要启动的Activity所在的进程是否已经启动了，如果已经启动了就打开，如果未启动则通过Process.start(android.app.ActivityThread)来启动一个新的进程。
5. 进程创建好以后，会调用ActivityThread.main(),初始化MainLooper，并创建Application对象。然后Instrumentation.newApplication()反射创建Application，创建ContextImpl通过Application的attach方法与Application进行绑定，最终会调用Instrumentation.callApplicationOnCreate执行Application的onCreate函数进行一些初始化的工作。完成后会通知AMS进程已经启动好了。
> 通知过程：通过IActivityManager.attachApplication（IApplicationThread thread, long startSeq），将Application对象传入AMS

6. AMS收到app进程启动成功的消息后，从ActivityTaskManagerService中取出对应的Activity启动信息， 并通过ApplicationThreadProxy对象，调用其scheduleTransaction(ClientTransaction transaction)方法，具体要启动的Activity都在ClientTransaction对象中。
7. app进程的ApplicationThread收到消息后会调用ActiivtyThread.sendMessage()通过H发送Handler消息，在handleMessage方法的内部又会调用 mTransactionExecutor.execute(transaction);具体参考第3步
最终调用performLaunchActivity方法创建activity和context并将其做关联，然后通过mInstrumentation.callActivityOnCreate()->Activity.performCreate()->Activity.onCreate()回调到了Activity的生命周期。

还有一个图可以帮大家梳理以上流程
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrIbSHVt5WNGruhKNZayreRnuficswWPfNpkBJS2Vd81CsPWpszX5SEqiag/640?wx_fmt=png&from=appmsg)

