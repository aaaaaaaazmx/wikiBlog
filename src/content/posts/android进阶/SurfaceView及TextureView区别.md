---
title: "SurfaceView及TextureView区别"
published: 2022-06-27
description: "SurfaceView及TextureView区别"
tags: ["Android","进阶"]
category: "android进阶"
draft: false
slug: "android-adv-029"
---

# SurfaceView及TextureView区别
- SurfaceView是什么 ？
- SurfaceView优点及缺点？
- SurfaceView中双缓冲？
- TextureView是什么？
- TextureView优点及缺点？
- 两者的性能相比如何？
- 播放器应该选择谁？


### SurfaceView是什么？

它继承自类View，因此它本质上是一个View。但与普通View不同的是，它有自己的Surface。有自己的Surface，在WMS中有对应的WindowState，在SurfaceFlinger中有Layer。我们知道，一般的Activity包含的多个View会组成View hierachy的树形结构，只有最顶层的DecorView，也就是根结点视图，才是对WMS可见的。这个DecorView在WMS中有一个对应的WindowState。相应地，在SF中对应的Layer。而SurfaceView自带一个Surface，这个Surface在WMS中有自己对应的WindowState，在SF中也会有自己的Layer。虽然在App端它仍在View hierachy中，但在Server端（WMS和SF）中，它与宿主窗口是分离的。这样的好处是对这个Surface的渲染可以放到单独线程去做，渲染时可以有自己的GL context。这对于一些游戏、视频等性能相关的应用非常有益，因为它不会影响主线程对事件的响应。但它也有缺点，**因为这个Surface不在View hierachy中，它的显示也不受View的属性控制，所以不能进行平移，缩放等变换，也不能放在其它ViewGroup中，一些View中的特性也无法使用。**

![](https://cdn.nlark.com/yuque/0/2019/webp/215777/1577677029528-c57a934a-499c-4345-ba0a-32e3df050f6d.webp)


### SurfaceView优点及缺点

优点：可以在一个独立的线程中进行绘制，不会影响主线程
          使用双缓冲机制，播放视频时画面更流畅
缺点：Surface不在View hierachy中，它的显示也不受View的属性控制，所以不能进行平移，缩放等变换，也不能放在其它ViewGroup中。SurfaceView 不能嵌套使用

### SurfaceView中双缓冲

双缓冲：在运用时可以理解为：SurfaceView在更新视图时用到了两张Canvas，一张frontCanvas和一张backCanvas，每次实际显示的是frontCanvas，backCanvas存储的是上一次更改前的视图，当使用lockCanvas（）获取画布时，得到的实际上是backCanvas而不是正在显示的frontCanvas，之后你在获取到的backCanvas上绘制新视图，再unlockCanvasAndPost（canvas）此视图，那么上传的这张canvas将替换原来的frontCanvas作为新的frontCanvas，原来的frontCanvas将切换到后台作为backCanvas。例如，如果你已经先后两次绘制了视图A和B，那么你再调用lockCanvas（）获取视图，获得的将是A而不是正在显示的B，之后你讲重绘的C视图上传，那么C将取代B作为新的frontCanvas显示在SurfaceView上，原来的B则转换为backCanvas。

### TextureView是什么

在4.0(API level 14)中引入，与SurfaceView一样继承View，     它可以将内容流直接投影到View中，它可以将内容流直接投影到View中，可以用于实现Live preview等功能。**和SurfaceView不同，它不会在WMS中单独创建窗口，而是作为View hierachy中的一个普通View，因此可以和其它普通View一样进行移动，旋转，缩放，动画等变化。值得注意的是TextureView必须在硬件加速的窗口中。它显示的内容流数据可以来自App进程或是远端进程。从类图中可以看到，TextureView继承自View，它与其它的View一样在View hierachy中管理与绘制。TextureView重载了draw()方法，其中主要SurfaceTexture中收到的图像数据作为纹理更新到对应的HardwareLayer中。**SurfaceTexture.OnFrameAvailableListener用于通知TextureView内容流有新图像到来。SurfaceTextureListener接口用于让TextureView的使用者知道SurfaceTexture已准备好，这样就可以把SurfaceTexture交给相应的内容源。Surface为BufferQueue的Producer接口实现类，使生产者可以通过它的软件或硬件渲染接口为SurfaceTexture内部的BufferQueue提供graphic buffer。

TextureView优点及缺点

优点：支持移动、旋转、缩放等动画，支持截图
缺点：必须在硬件加速的窗口中使用，占用内存比SurfaceView高，在5.0以前在主线程渲染，5.0以后有单独的渲染线程。

谁的性能更优？

![](https://cdn.nlark.com/yuque/0/2019/webp/215777/1577677029524-e5c57925-8d56-4c5d-af83-fcdc5b201648.webp)

播放器应该选择谁？

从性能和安全性角度出发，**使用播放器优先选SurfaceView。**
1. 在android 7.0上系统surfaceview的性能比TextureView更有优势，支持对象的内容位置和包含的应用内容同步更新，平移、缩放不会产生黑边。 在7.0以下系统如果使用场景有动画效果，可以选择性使用TextureView
2. 由于失效(invalidation)和缓冲的特性，TextureView增加了额外1~3帧的延迟显示画面更新
3. TextureView总是使用GL合成，而SurfaceView可以使用硬件overlay后端，可以占用更少的内存带宽，消耗更少的能量
4. TextureView的内部缓冲队列导致比SurfaceView使用更多的内存
5. SurfaceView： 内部自己持有surface，surface 创建、销毁、大小改变时系统来处理的，通过surfaceHolder 的callback回调通知。当画布创建好时，可以将surface绑定到MediaPlayer中。SurfaceView如果为用户可见的时候，创建SurfaceView的SurfaceHolder用于显示视频流解析的帧图片，如果发现SurfaceView变为用户不可见的时候，则立即销毁SurfaceView的SurfaceHolder，以达到节约系统资源的目的

