---
title: "Context的理解"
published: 2020-07-08
description: "Context的理解"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-017"
---


# Context的理解
Context提供了关于应用环境全局信息的接口。它是一个抽象类，它的执行被Android系统所提供。它允许获取以应用为特征的资源和类型，是一个统领一些资源（应用程序环境变量等）的上下文。

就是说，它描述一个应用程序环境的信息（即上下文）；是一个抽象类，Android提供了该抽象类的具体实现类；通过它我们可以获取应用程序的资源和类（包括应用级别操作，如启动Activity，发广播，接受Intent等）。

既然上面Context是一个抽象类，那么肯定有他的实现类咯，我们在Context的源码中通过IDE可以查看到他的子类最终可以得到如下关系图：
![image.png](https://cdn.nlark.com/yuque/0/2024/png/215777/1713601623156-e1894c11-83fc-43b6-827b-a8b16f3ca8fc.png)
Context类本身是一个纯abstract类，它有两个具体的实现子类：ContextImpl和ContextWrapper

Context的两个子类分工明确，其中ContextImpl是Context的具体实现类，ContextWrapper是Context的包装类。Activity，Application，Service虽都继承自ContextWrapper（Activity继承自ContextWrapper的子类ContextThemeWrapper），但它们初始化的过程中都会创建ContextImpl对象，由ContextImpl实现Context中的方法。

**Context作用域**
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUauhK67TdzjU54dXicun0EOouRcoMGYhJlcycP2cxfINqV4Q3h5xW4l16LvRkCNwLGRibgCzVeiauRg/640?wx_fmt=png&from=appmsg)
从上图我们可以发现Activity所持有的Context的作用域最广，无所不能。因为Activity继承自ContextThemeWrapper，而Application和Service继承自ContextWrapper，很显然ContextThemeWrapper在ContextWrapper的基础上又做了一些操作使得Activity变得更强大，

### Activity里的this和getBaseContext有什么区别？
因为Activity继承ContextThemeWapper->ContextWapper->Context,所以this指的是自己，而getBaseContext里面返回的是mBase，也就是ContextImpl
### getAppilicationContext()和getApplication()有什么区别和限制
两者本质上没什么区别，都是返回的Application,但是getApplication的作用域小，只能在Activity和Service上调用比如 (context as Activity).getApplication(),context自己是无法直接调用getApplication的，但是context可以直接调用getAppilicationContext()，最终也是ContextImpl通过LoadApk来获取Application的，
### 应用组件的构造，oncreate、attachBaseContext调用顺序？
Application: 在应用进程启动的时候会通过ActivityThread的main入口里面会创建ActivityThread，并在onattch里面attachApplication->bindApplication->handleApplicationxxx........
里面会通过类加载器newInstance实例化Application，然后在通过attach方法里面的attachBaseContext将ContextImpl赋值给mBase，然后通过mInstrumentation去调用Application的onCreate方法。
这里我们可知 构造>attachBaseContext>onCreate

