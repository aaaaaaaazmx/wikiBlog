---
title: "SurfaceView的双缓冲"
published: 2023-06-23
description: "SurfaceView的双缓冲"
tags: ["Android","进阶"]
category: "android进阶"
draft: false
slug: "android-adv-030"
---

# SurfaceView的双缓冲


android中 View是通过刷新来重绘视图，系统通过发出`VSYNC`信号来进行屏幕的重绘，刷新的时间间隔是`16ms`,如果我们可以在16ms以内将绘制工作完成，则没有任何问题，如果我们绘制过程逻辑很复杂，并且我们的界面更新还非常频繁，这时候就会造成界面的卡顿，影响用户体验，为此Android提供了`SurfaceView`来解决这一问题

SurfaceView 继承自View，是 Android 中一种比较特殊的视图（View），

- 它跟普通View最大的区别是它有自己的Surface，在WMS中有对应的WindowState，在SurfaceFlinger中有Layer
- 一般的Activity包含的多个View会组成View hierachy的树形结构，**只有最顶层的DecorView，也就是根结点视图，才是对WMS可见的**。这个**DecorView在WMS中有一个对应的WindowState**。相应地，**在SF中对应的Layer**。
- 而**SurfaceView自带一个Surface，这个Surface在WMS中有自己对应的WindowState**，在SF中也会有自己的Layer。虽然在App端它仍在View hierachy中，但在Server端（WMS和SF）中，**它与宿主窗口是分离的**。这样的好处是对这个Surface的渲染可以放到单独线程去做，渲染时可以有自己的GL context。这对于一些游戏、视频等性能相关的应用非常有益，因为它不会影响主线程对事件的响应。

综合这些特点，SurfaceView 一般用在游戏、视频、摄影等一些复杂 UI 且高效的图像的显示，这类的图像处理都需要开单独的线程来处理。

缺点：

Surface不在View hierachy中，它的显示也不受View的属性控制，所以不能进行平移，缩放等变换，也不能放在其它ViewGroup中。SurfaceView 不能嵌套使用

# View 和SurfaceView的区别

`View`和`SurfaceView`的区别:
1 . View适用于主动更新的情况，而SurfaceView则适用于被动更新的情况，比如频繁刷新界面。
2 . View在主线程中对页面进行刷新，而SurfaceView则开启一个子线程来对页面进行刷新。
3 . View在绘图时没有实现双缓冲机制，SurfaceView在底层机制中就实现了双缓冲机制。



# SurfaceView的双缓冲

SurfaceView拥有独立的绘图表面，即它不与宿主窗口共享一个绘图表面，由于拥有独立的绘图表面，因此SurfaceView的UI就可以在一个独立的线程中进行绘制，这样可以避免画图任务繁重的时候造成主线程阻塞，从而提高了程序的反应速度。在游戏开发中多用到SurfaceView，游戏中的背景、人物、动画等等尽量在画布canvas中画出。 

SurfaceView的核心在于提供了2个线程，**UI线程和渲染线程**

-  所有SurfaceView和SurfaceHolder.Callback的方法都应该在UI线程里调用，一般来说就是应用程序主线程。渲染线程所要访问的各种变量应该作同步处理。 
- 由于surface可能被销毁，它只在SurfaceHolder.Callback.surfaceCreated()和 SurfaceHolder.Callback.surfaceDestroyed()之间有效，所以要确保渲染线程访问的是合法有效的surface。

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLVL3hMlxFAX8574YC0p4uLNh4ic75ibtzicVSq8ibv5Okz5055KX9ubWMGslZF6Ax9ydSNCISIgWTqchQ/640?wx_fmt=png&amp;from=appmsg)



这摘录了一段网上对于双缓冲技术的介绍
> 双缓冲技术是游戏开发中的一个重要的技术。当一个动画争先显示时，程序又在改变它，前面还没有显示完，程序又请求重新绘制，这样屏幕就会不停地闪烁。而双缓冲技术是把要处理的图片在内存中处理好之后，再将其显示在屏幕上。双缓冲主要是为了解决 反复局部刷屏带来的闪烁。把要画的东西先画到一个内存区域里，然后整体的一次性画出来。


在运用时可以理解为：SurfaceView在更新视图时用到了两张Canvas，一张frontCanvas和一张backCanvas，每次实际显示的是frontCanvas，backCanvas存储的是上一次更改前的视图，当使用lockCanvas（）获取画布时，得到的实际上是backCanvas而不是正在显示的frontCanvas，之后你在获取到的backCanvas上绘制新视图，再unlockCanvasAndPost（canvas）此视图，那么上传的这张canvas将替换原来的frontCanvas作为新的frontCanvas，原来的frontCanvas将切换到后台作为backCanvas。例如，如果你已经先后两次绘制了视图A和B，那么你再调用lockCanvas（）获取视图，获得的将是A而不是正在显示的B，之后将重绘的C视图上传，那么C将取代B作为新的frontCanvas显示在SurfaceView上，原来的B则转换为backCanvas。


