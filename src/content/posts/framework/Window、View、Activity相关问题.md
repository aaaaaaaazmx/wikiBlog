---
title: "Window、View、Activity相关问题"
published: 2025-01-11
description: "Window、View、Activity相关问题"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-038"
---

## Window、View、Activity相关问题
**1、Window是什么？**
表示一个窗口的概念，是所有View的直接管理者，任何视图都通过Window呈现(点击事件由Window->DecorView->View; Activity的setContentView底层通过Window完成)

- Window是一个抽象类，唯一实现类是PhoneWindow
- 创建Window需要通过WindowManager创建，WindowManager是外界访问Window的入口
- Window具体实现位于WindowManagerService中，WindowManager和WindowManagerService的交互是通过IPC完成

**2、Window的内部机制**

- Window和View通过ViewRootImpl建立联系
- Window并不是实际存在的，而是以View的形式存在
- WindowManager的三个接口方法也是针对View的
- 实际使用中无法直接访问Window，必须通过WindowManager
- View是视图的呈现方式，但是不能单独存在，必须依附在Window这个抽象的概念上
- WMS把所有的用户消息发给View/ViewGroup，但是在View/ViewGroup处理消息的过程中，有一些操作是公共的, Window把这些公共行为抽象出来, 这就是Window。

**3、Window有哪几种类型**
FrameWork定义了三种窗口类型，三种类型定义在WindowManager,通过LayoutParams.type设置。

- 应用窗口，对应于一个Activity。加载Activity由AmS完成，创建一个应用窗口只能在Activity内部完成（层级1~99）。
- 子窗口，必须依附于任何类型的父窗口（层级1000~1999）。
- 系统窗口，不需要对应任何Activity，如：状态栏，导航栏,普通应用程序不能创建系统窗口，必须要有系统应用权限.（层级2000~2999）。

WindowManager为这个三类进行了细化，把每一种类型都有int常量标识，WmS进行窗口叠加的时候会按照该int常量的大小分配不同层，int值越大层位置越靠上面。

**4.WindowManager的三个主要功能：添加、更新、删除View**
```javascript
public interface ViewManager{
    public void addView(View view, ViewGroup.LayoutParams params); //添加View
    public void updateViewLayout(View view, ViewGroup.LayoutParams params); //更新View
    public void removeView(View view); //删除View
}
```


**5.Activity中setContentView()发生了什么**
Activity中setContentView()后实际通过getWindow().setContentView()交由PhoneWindow处理，
PhoneWindow中主要做两件事，通

- 过installDecor()初始化mDecor(DecorView)
- generateLayout()来初始化mContentParent(ViewGroup), 

然后通过inflate将我们的setContentView传入的View或者layout布局文件填充到这个mContentParent中。
其中在generateLayout（）实际上就是在根据我们requestFeature设置的style(如FULL_SCREEN，NO_ACTION_BAR)加载对应的布局[容器](https://cloud.tencent.com/product/tke?from_column=20065&from=20065)(这里也可以解释为什么我们getWindow.requestFeature时必须在setContentView()之前)，这个容器中会有一个id为content的FrameLayout，
这个FrameLayout就是上面所说的mContentParent, 也就是说我们setContentView()最终是设置到这里。

**6.DecorView是什么？**
DecoreView本质就是一个FrameLayout，是Activity中的顶级View，如果我们不设置任何主题style，默认加载的DecorView会addView以下布局文件 
![](https://mmbiz.qpic.cn/mmbiz_jpg/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrIk44MicoDS1x993mAsCqyFmwmr4ib5VGOBkXmEK082rqR7IYQsYHwhc8A/640?wx_fmt=webp&from=appmsg)
**7.Activity、Window、DecorView、View之间的关系**
每个Activity 包含了一个Window 对象，这个对象是由PhoneWindow做的实现。
而 PhoneWindow 将DecorView作为了一个应用窗口的根View，
这个DecorView 又把屏幕划分为了两个区域：

- 一个是 TitleView,也就是ActionBar或者TitleBar，
- 一个是 ContentView，

我们平时在 Xml 文件中写的布局正好是展示在 ContentView 中的。
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrIibE4IAS0qLIBMV65vCAQ4VGp4WkOcQBtnWYeGuYxrGnEOyJ2wept4fQ/640?wx_fmt=png&from=appmsg)
**8.DecorView何时才被WindowManager真正添加到Window中？**

- 即使Activity的布局已经成功添加到DecorView中，DecorView此时还没有添加到Window中
- ActivityThread的**handleResumeActivity**方法中，首先会调用Activity的onResume方法，接着调用Activity的makeVisible()方法
- makeVisible()中通过WindowManager.addView()完成了DecorView的添加和显示两个过程

```javascript
void makeVisible() {
  //1. 将`DecorView`添加到`Window`中(通过WindowManager)
    if (!mWindowAdded) {
        ViewManager wm = getWindowManager();
        wm.addView(mDecor, getWindow().getAttributes());
        mWindowAdded = true;
    }
  //2. 将DecorView显示出来
    mDecor.setVisibility(View.VISIBLE);
}
```


**9、ViewRoot是什么**
ViewRoot对应**ViewRootImpl类，它是连接WMS和DecorView的纽带**

但它却并不属于View树的一份子，并不是View的子类也不是View的父类，但它实现了ViewParent接口，所以可以作为名义上的View的父视图。

WindowManager.addView()内部实际是由WindowManagerGlobal完成的，
WindowManagerGlobal中有三个列表，

- 一个是保存View的mViews列表
- 一个是保存ViewRootImpl的mRoots列表
- 一个是保存WindowManager.LayoutParams的mParams列表，

WindowManager每一次addView()都会创建一个对应的ViewRootImpl，在调用ViewRoot.setView后将decorView交给ViewRootImpl。ViewRootImpl中调用performTraversals方法，然后便开始测量布局绘画了，界面才得以显示出来，这就是View的绘制流程起点。

**10、Token是什么？**
类型为IBinder，是一个Binder对象。
主要分两种Token：

- 指向Window的token: 主要是实现WmS和应用所在进程通信。
- 指向ActivityRecord的token: 主要是实现WMS和AMS通信的。

**11、Token的使用场景？**
Activity创建时，AMS中需要根据Token去找到对应的ActivityRecord。
Popupwindow的showAtLocation第一个参数需要传入View，这个View就是用来获取Token的。
Android 5.0新增空间SnackBar同理也需要一个View来获取Token

**12、WindowSession是什么**
在WindowManager的addView中会创建ViewRootImpl，内部会通过WMS去获取WindowSession
WindowSession的类型是IWindowSession，本身是Binder对象，真正实现类是Session
作用: 表示一个Active Client Session 每个进程一般都有一个Session对象 用于WindowManager交互

