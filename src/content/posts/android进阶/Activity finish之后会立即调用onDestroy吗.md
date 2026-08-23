---
title: "Activity finish之后会立即调用onDestroy吗"
published: 2022-11-03
description: "Activity finish之后会立即调用onDestroy吗"
tags: ["Android","进阶"]
category: "android进阶"
draft: false
slug: "android-adv-001"
---

# Activity finish之后会立即调用onDestroy吗


> 这个面试题比较细节了，本质上对系统idleHandler的细节延展

我们一般 认为在activity#finish() 之后，Activity 就会回调 onDestory() 并销毁，做资源的释放与解注册，避免造成内存和资源的泄露。

那么真实的情况是什么样的， finish() 之后，onDestory() 是立即被回调的吗？有没有可能存在阻塞的情况，导致 onDestory() 被延迟回调了？
如果被阻塞，系统有兜底策略吗？

如果都可以对答如流那就可以关闭这个文章了


## finish() 之后，onDestory() 是立即被回调的吗

答案是 No

我们知道FirstActivity跳转 SecondActivity， FirstActivity onPause之后，SecondActivity onCreate，等SecondActivity onResume之后，才会继续FirstActivity的 onStop和onDestry

```
FirstActivity: onPause, onPause() 距离 finish() ：6 ms
SecondActivity: onCreate
SecondActivity: onStart
SecondActivity: onResume
FirstActivity: onStop, onStop() 距离 finish() ：10033 ms
FirstActivity: onDestroy, onDestroy() 距离 finish() ：10037 ms
```

**显然不是立即回调的**

那么继续看下原理

### 驱动onStop/onDestroy执行的真相

直接看 ActivityThread.handleResumeActivity() 方法，handleResumeActivity() 方法是整个 UI 显示流程的重中之重，它首先会回调 Activity.onResume() , 然后将 DecorView 添加到 Window 上，其中又包括了创建 ViewRootImpl，创建 Choreographer，与 WMS 进行 Binder 通信，注册 vsync 信号，著名的 measure/draw/layout。



**在完成最终的界面绘制和显示之后，有这么一句代码 Looper.myQueue().addIdleHandler(new Idler())。**

又见到idleHandler

> IdleHandler它提供了一种机制，当主线程消息队列空闲时，会执行 IdleHandler 的回调方法，如果要是不熟悉可以看下 Android基础面试题，这里不展开了

所以 不出意外的话，当新的 Activity 完成页面绘制并显示之后，主线程就可以停下歇一歇，来执行 IdleHandler 了。再回来 handleResumeActivity() 中来，Looper.myQueue().addIdleHandler(new Idler())

## 系统的兜底

往往不出意外就是要出意外了

idlehandler是系统不忙的时候，要是此时很忙碌呢？比如SecondActivity的主线程一直很忙碌，那就会导致FirstActivity一直无法进行onDestroy的调用。
系统就会兜底，SecondActivity onResume 10s之后 会触发FirstActivity的onStop和onDestroy

这里直接给出核心代码，在Activity 的  **ActivityStackSuperVisor.resumeFocusedStackTopActivityLocked()**  方法。我这里就不带着大家追进去了，调用链如下。

```
ASS.resumeFocusedStackTopActivityLocked() -> 
ActivityStack.resumeTopActivityUncheckedLocked() -> 
ActivityStack.resumeTopActivityInnerLocked() -> 
ActivityRecord.completeResumeLocked() -> 
ASS.scheduleIdleTimeoutLocked()
```


# 小结

- Activity 的 onStop/onDestroy 是依赖 IdleHandler 来回调的，正常情况下当主线程空闲时会调用。
- 某些特殊场景下的问题，导致主线程迟迟无法空闲，onStop/onDestroy 也会迟迟得不到调用。系统提供了一个兜底机制，当 onResume() 回调 10s 之后，如果仍然没有得到调用，会主动触发