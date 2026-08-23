---
title: "SurfaceView原理分析"
published: 2024-08-14
description: "SurfaceView原理分析"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-030"
---

# SurfaceView原理分析
常见问题

- 什么是surfaceview
- 它是如何渲染的(子线程)
- 双缓存机制是怎么回事？

**什么是SurfaceView**
SurfaceView从Android 1.0(API level 1)时就有 。它继承自类View，因此它本质上是一个View。
但与普通View不同的是，它有自己的Surface。
我们知道，一般的Activity包含的多个View会组成View hierachy的树形结构，只有最顶层的DecorView，也就是根结点视图，才是对WMS可见的。这个DecorView在WMS中有一个对应的WindowState。相应地，在SF中对应的Layer。
**而SurfaceView自带一个Surface，这个Surface在WMS中有自己对应的WindowState，在SF中也会有自己的Layer。**

也就是说，虽然在App端它仍在View hierachy中，但在Server端（WMS和SF），它与宿主窗口是分离的。**这样的好处是对这个Surface的渲染可以放到单独线程去做**，渲染时可以有自己的GL context。

这对于一些游戏、视频等性能相关的应用非常有益，因为它不会影响主线程对事件的响应。但它也有缺点，因为这个Surface不在View hierachy中，它的显示也不受View的属性控制，所以不能进行平移，缩放等变换，也不能放在其它ViewGroup中，一些View中的特性也无法使用。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrIeo2CZQC9RRWKlctfZRaUAiaLhQ8AzANEoibMS0bEckkhImpb37p0ibHRw/640?wx_fmt=png&from=appmsg)

**如何渲染的**

View的绘制是由ViewRootImpl的Surface对象将绘制后的ui数据交给WindowManagerService，WindowManagerService会将多个Surface数据合并成一整屏的ui数据，交给SurfaceFlinger渲染对应的Layer。

而SurfaceView内部维护着一块Surface用于ui数据的的绘制，同时在WindowManagerService端会创建一个新的surface对象，对应着SurfaceFlinger的一个新的Layer，因此SurfaceView中绘制的数据就由新的Layer，而不是宿主DecorView的Layer；
> 意思就是SurfaceView有和宿主DecorView对应的ViewRootImpl一样的一套绘制渲染模型，两者分别独立渲染。


SurfaceView虽然具有独立的surface，不过它仍然是宿主窗口的视图结构中的一个结点，它仍然是可以参与到宿主窗口的绘制流程中去的。在绘制的过程中，每一个子视图的成员函数draw或者dispatchDraw都会被调用到，以便它们可以绘制自己的UI

具体是SurfaceView、SurfaceHolder、Surface互相配合

- SurfaceView是拥有独立绘图层的特殊View。
- Surface就是指SurfaceView所拥有的那个绘图层，其实它就是内存中的一段绘图缓冲区。
- **SurfaceView中具有两个Surface，也就是我们所说的双缓冲机制**
- SurfaceHolder顾名思义就是Surface的持有者，SurfaceView就是通过过SurfaceHolder来对Surface进行管理控制的。并且SurfaceView.getHolder方法可以获取SurfaceView相应的SurfaceHolder。
- Surface是在SurfaceView所在的Window可见的时候创建的。我们可以使用SurfaceHolder.addCallback方法来监听Surface的创建与销毁的事件。
> SurfaceView另起一个线程对自己的Surface进行刷新。需要注意的是SurfaceHolder.Callback的所有回调方法都是在主线程中回调的


**双缓存机制**

SurfaceView在更新视图时用到了两张 Canvas
- 一张 frontCanvas 
- 一张 backCanvas 

每次实际显示的是 frontCanvas ，backCanvas 存储的是上一次更改前的视图。

当你在播放这一帧的时候，它已经提前帮你加载好后面一帧了，所以播放起视频很流畅。 
当使用lockCanvas（）获取画布时，得到的实际上是backCanvas 而不是正在显示的 frontCanvas ，之后你在获取到的 backCanvas 上绘制新视图，再 unlockCanvasAndPost（canvas）此视图，那么上传的这张 canvas 将替换原来的 frontCanvas 作为新的frontCanvas ，原来的 frontCanvas 将切换到后台作为 backCanvas 。

例如，如果你已经先后两次绘制了视图A和B，那么你再调用 lockCanvas（）获取视图，获得的将是A而不是正在显示的B，之后你将重绘的 A 视图上传，那么 A 将取代 B 作为新的 frontCanvas 显示在SurfaceView 上，原来的B则转换为backCanvas。 相当与多个线程，交替解析和渲染每一帧视频数据。
**

