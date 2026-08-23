---
title: "Android渲染系列之Window、Activity、View之间关系"
published: 2026-01-11
description: "Android渲染系列之Window、Activity、View之间关系"
tags: ["自定义View","Android","UI"]
category: "自定义View专栏"
draft: false
slug: "custom-view-003"
---

# Android渲染系列之Window、Activity、View之间关系
---

本篇开始介绍渲染中贴近我们实际开发的概念。

## Window概念

Android窗口主要分为两种：

- **应用窗口**：一个activity有一个主窗口，弹出的对话框也有一个窗口，Menu菜单也是一个窗口。在同一个activity中，主窗口、对话框、Menu窗口之间通过该activity关联起来。

应用相关的窗口表示类是PhoneWindow，其继承于Window，针对手机屏幕做了一些优化工作，里面核心的是mDecorView这个变量，mDecorView是一个顶层的View，窗口的添加就是通过调用getDecorView()获取到mDecorView并且调WindowManager.addView()把该View添加到WindowManager中。

> 但也有例外，比如悬浮窗口虽然与activity相关联，但并不是PhoneWindow，直接调用通过WindowManager.addView()添加。

如果我们想给所有的应用都加一个比如最大、最小化、关闭的导航条，那只需更改mDecorView即可（Android N为支持多窗口将DecorView从PhoneWindow中分离成一个单独的文件）。

- **公共界面的窗口**：如最近运行对话框、关机对话框、状态栏下拉栏、锁屏界面等。这些窗口都是**系统级别的窗口，不从属于任何应用，和activity没有任何关系**。这种窗口没有任何窗口类来封装，也是直接调用WindowManager.addView()来把一个view添加到WindowManager中。

先来张宏观概览的图

![Window、Activity、View关系概览](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWAIklV9PKgzibQ0Hczl4jJnc9fO0R7nT5KYMUKxJEshBhcl5e11WXWfaxoYdzMsFJ0dMcL73CQJKA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=0)

- 每个 Activity 均包含一个 Window 对象，即 Activity 和 Window 是一对一的关系
- Window 是一个抽象类，其唯一的实现类是 PhoneWindow
- PhoneWindow 内部包含一个 DecorView，DecorView 是 FrameLayout 的子类，其内部包含一个 LinearLayout，LinearLayout 中又包含两个自上而下的 childView，即 ActionBar 和 ContentParent。

> 我们平时在 Activity 中调用的 setContentView 方法实际上就是在向 ContentParent 执行 addView 操作

windows是承载actvity和view的载体，下面以window为核心把actvity和view串联起来

- **Window**：窗口，在代码层次上是一个抽象类，真正的实现类在PhoneWindow里，用来管理View的展示以及事件的分发，在概念上表示的是一个窗口。Android 中所有的视图都是通过 Window 来呈现的，例如 Activity、Dialog 和 Toast 等，它们实际上都是挂载在 Window 上的
- **Activity**：Android四大组件之一，也是我们最常见的页面的宿主，通过setContentView将xml布局，解析并展示到页面上；**一个 Activity 对应一个 Window**也就是 PhoneWindow，一个 PhoneWindow 持有一个**DecorView**的实例，DecorView 本身是一个 FrameLayout。
- **View**：Android的视图，是各种炫酷控件的最终父类，维护了绘制流程以及事件的分发和处理；

## Window的创建

### Activity#onCreate

首先是actvity先启动，就是开启了PhoneWindow的创建

- 在 Activity 创建过程中执行 scheduleLaunchActivity() 之后便调用到了 handleLaunchActivity() 方法。
- Activity 里新建一个 PhoneWindow 对象

> Activity 里新建一个 PhoneWindow 对象。在 Android 中，Window 是个抽象的概念， Android 中 Window 的具体实现类是 PhoneWindow，Activity 和 Dialog 中的 Window 对象都是 PhoneWindow。

同时window得到一个 WindowManager 对象，不过 WindowManager 是一个抽象类，这个 WindowManager 的具体实现是在 WindowManagerImpl 中，(类似 Context 和 ContextImpl)

```java
public void setWindowManager(WindowManager wm, IBinder appToken, String appName, boolean hardwareAccelerated) {
    ...
    mWindowManager = ((WindowManagerImpl)wm).createLocalWindowManager(this);
    ...
}
```

从这里可以看出 每个 Activity 会有一个 WindowManager 对象，这个 mWindowManager 就是和 WindowManagerService 进行通信，也是 WindowManagerService 识别 View 具体属于那个 Activity 的关键，创建时传入 IBinder 类型的 mToken 这个 Activity 的 mToken是一个 IBinder，WindowManagerService 就是通过这个 IBinder 来管理 Activity 里的 View。

**这样actvity创建时候通过wms获取到了一个window**

下面再看看view是如何关联起来的

### 根View(DecorView)的创建

回调 Activity.onCreate() 后，会执行 **setContentView()** 方法将我们写的 Layout 布局页面设置给 Activity。

```java
public void setContentView(@LayoutRes int layoutResID) {
    getWindow().setContentView(layoutResID);
    initWindowDecorActionBar();
}
```

最终到 PhoneWindow.installDecor()：

```java
private void installDecor() {
    //根据不同的 Theme，创建不同的 DecorView，DecorView 是一个 FrameLayout
}
```

创建了**PhoneWindow**，和**DecorView**，但目前**二者也没有任何关系**，

> 产生关系是在ActivityThread.performResumeActivity 中，因此我们经常谈到的一个问题 create阶段是无法测量view的宽高原因也是在此

### 小结

用一个图来展示本节内容,activity 创建后从wms拿到window然后创建DecorView

![Activity创建流程](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWAIklV9PKgzibQ0Hczl4jJnAcxUlAtQzBVibqU9ZliaaHOKWuSPUiaJB57tbAfgianx4oHic2jdGLN2COg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=1)

## Windows显示

### Activity#onResume

create之后调用**activity.performResume()**，调用 r.activity.makeVisible，将 DecorView 添加到当前的 Window 上。

ActivityThread.handleResumeActivity()：

```java
final void handleResumeActivity(IBinder token, boolean clearHide, boolean isForward, boolean reallyResume) {
    //执行到 onResume()
    ActivityClientRecord r = performResumeActivity(token, clearHide);
    if (r != null) {
        final Activity a = r.activity;
        boolean willBeVisible = !a.mStartedActivity;
        ...
        if (r.window == null && !a.mFinished && willBeVisible) {
            ……
            a.mDecor = decor;
            ……
            if (a.mVisibleFromClient) {
                a.mWindowAdded = true;
                wm.addView(decor, l);
            }
        }
        ...
        if (!r.activity.mFinished && willBeVisible
            && r.activity.mDecor != null && !r.hideForNow) {
            ...
            mNumVisibleActivities++;
            if (r.activity.mVisibleFromClient) {
                //添加视图，详见下面分析
                r.activity.makeVisible();
            }
        }
        //resume 完成
        if (reallyResume) {
            ActivityManagerNative.getDefault().activityResumed(token);
        }
    } else {
        ...
    }
}

void makeVisible() {
    if (!mWindowAdded) {
        ViewManager wm = getWindowManager();
        //详见下面分析
        wm.addView(mDecor, getWindow().getAttributes());
        mWindowAdded = true;
    }
    mDecor.setVisibility(View.VISIBLE);
}
```

WindowManager 的 addView 的具体实现在**WindowManagerImpl**中，而 WindowManagerImpl 的 addView 又会调用 WindowManagerGlobal.addView()。

### ViewRootImpl

ViewRootImpl是View中的最高层级，属于所有View的根（但ViewRootImpl不是View，只是实现了ViewParent接口），实现了View和WindowManager之间的通信协议，实现的具体细节在WindowManagerGlobal这个类当中。

**WindowManager和DecorView之间的桥梁**

- 创建ViewRootImpl

通过WindowManagerGlobal.addView()：

```java
public void addView(View view, ViewGroup.LayoutParams params,Display display, Window parentWindow) {
    ...
    ViewRootImpl root = new ViewRootImpl(view.getContext(), display);
    view.setLayoutParams(wparams);
    mViews.add(view);
    mRoots.add(root);
    mParams.add(wparams);
    root.setView(view, wparams, panelParentView);
    ...
}
```

这个过程创建一个**ViewRootImpl**，并将**之前创建的 DecoView 作为参数传入，以后 DecoView 的事件都由 ViewRootImpl 来管理了**，比如，DecoView 上添加 View，删除 View。ViewRootImpl 实现了 ViewParent 这个接口，这个接口最常见的一个方法是 requestLayout()。此时

- DecorView被渲染绘制到屏幕上显示
- DecorView可以接收屏幕触摸事件

此时view的宽高才可以被测量出来

> ViewRootImpl 是个 ViewParent，在 DecoView 添加的 View 时，就会将 View 中的 ViewParent 设为 DecoView 所在的 ViewRootImpl，View 的 ViewParent 相同时，理解为这些 View 在一个 View 链上。所以每当调用 View 的 requestLayout()时，其实是调用到 ViewRootImpl，ViewRootImpl 会控制整个事件的流程。
>
> 可以看出一个 ViewRootImpl 对添加到 DecoView 的所有 View 进行事件管理。

ViewRootImpl,它是WindowManager和DecorView之间的桥梁，View的三大流程（测量，布局，绘制）都是通过ViewRootImpl来完成的。

- ViewRootImpl的setView

ViewRootImpl的setView方法最终会将View添加到WindowManagerService中。

在ViewRoomImpl的setView中做了很多事情:

- 通过requestLayout开始performTraversals那套测量、布局、绘制流程，这会让关联的View也执行了measure、layout、draw流程。
- 创建InputChannel，在注释3中将InputChannel添加到WindowManagerService中创建socketpair（一对socket）用于发送和接收事件
- 添加View到WindowManagerService，这里是通过mWindowSession来完成的，它的定义是final IWindowSession mWindowSession;，它其实是WindowManagerGlobal中的单例对象

### 小结

![ViewRootImpl流程](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWAIklV9PKgzibQ0Hczl4jJnCHj6kxZvniccoicGQLcDr0J1YQMBD7u3v8zzLGVciaSOGiaWqo6CMRJhsg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=2)

## 常见面试问题

### Actvity、Window、DecorView创建时机

- ActivityThread中执行performLaunchActivity，从而生成了Activity的实例
- performLaunchActivity中，在创建Activity实例的同时，会调用Activity的内部方法attach.在该方法中完成window的初始化
- 用户执行Activity的setContentView方法，内部是调用PhoneWindow的setContentView方法，在PhoneWindow中完成DecorView的创建

> - Activity中的setContentView
> - PhoneWindow中的setContentView
> - PhoneWindow中的installDecor

### Dialog为什么不能使用Application的Context

- Dialog窗口类型是TYPE_APPLICATION，与Activity一样
- TYPE_APPLICATION要求Token不能为null，Application没有AppWindowToken

### Activity中的mDecor和Window里面的mDecor有什么关系？

- 两者指向同一个对象，都是DecorView
- Activity中的mDecor是通过ActivityThread中的handleResumeActivity方法来赋值的

### ViewRoot是什么？ViewRootImpl又是什么？

- ViewRoot的实现类是ViewRootImpl，是WindowManagerService和DecorView的纽带
- ViewRoot不是View的根节点
- View的绘制是从ViewRootImpl的performTraversals方法开始的

### ViewRootImpl何时创建？

当window被装进WindowManager时，完成ViewRootImpl的创建，最终是通过WindowManagerGlobal.addView方法中进行创建的（onResume阶段）

### Activity中的Window何时被装进WindowManager？

- 发生在Activity的onResume阶段
- 执行顺序
  - ActivityThread中的handleResumeActivity
  - Activity中的makeVisible

## 总结

从表面上看Activity参与度比较低，大部分View的添加操作都被封装到Window中进行实现，而Activity相当于是提供给开发人员的一个管理类，通过它能更简单地实现Window和View的操作逻辑。

- 一个Activity中有一个Window，也就是PhoneWindow对象，在PhoneWindow中有一个DecorView，在setContentView中会将layout填充到此DecorView中
- 一个应用进程中只有一个WindowManagerGlobal对象，单例
- 每一个PhoneWindow对应一个ViewRootImpl对象
- WindowManagerGlobal通过ViewRootImpl的setView方法，完成Window的添加过程
- ViewRootImpl的setView方法中主要完成两件事情：View渲染以及接收触摸事件
- Dialog和Toast都有自己的Window，而PopupWindow没有只是而是将view加到DecorView

## 参考

- https://mp.weixin.qq.com/s?__biz=MzAxMTI4MTkwNQ==&mid=2650826734&idx=1&sn=6496ff519cb6c372b898a8f513cf38e8
- https://github.com/xfhy/Android-Notes/blob/master/Blogs/Android/系统源码解析/Window,Activity,View三者关系.md
- https://blog.csdn.net/freekiteyu/article/details/79408969
- https://juejin.cn/post/6942303848996274213#heading-2
