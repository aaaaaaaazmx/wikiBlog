---
title: "从Activity创建到View展现"
published: 2022-10-29
description: "从Activity创建到View展现"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-046"
---

# 从Activity创建到View展现
这里解释还能解答一下问题

1. 为什么要有设计Window？
2. 子线程真的不能更新UI吗？
3. 为什么在Activity的onCreate方法中无法获取View的宽和高？

Activity、Window、WindowManager、DecorView、ViewRootImpl，分别解释一下它们的作用。

- **Activity**：Activity像是一个指挥官，它不处理具体的事务，只在适当的时候指挥Window/WindowManager工作。例如：在attach时创建Window对象、**onResume**后通知WindowManager添加view。
- **Window**：Window是一个窗口，它是View的容器。Android中的视图以View树的形式组织在一起，而View树必须依附在Window上才能工作。一个Window对应着一个View树。启动Activity时会创建一个Window，显示Dialog时也会创建一Window。因此Activity内部可以有多个Window。由于View的测量、布局、绘制只是在View树内进行的，因此一个Window内View的改动不会影响到另一个Window。Window是一个抽象类，它只有一个实现类PhoneWindow。
- **WindowManager**：WindowManager是Window的管理类。它不直接操作Window，而是操作Window内的DecorView。WindowManager是一个接口。它的具体实现类是WindowManagerImpl。
- **DecorView**是View树的顶级View，它是FrameLayout的子类。根据Activity设置的Theme，DecorView会有不同布局。但无论布局怎么变，DecorView都有一个Id为R.id.content的FrameLayout。Activity.setContentView()方法就是在这个FrameLayout中添加子View。
- **ViewRootImpl **是连接WindowManager和DecorView的纽带，View的三大流程均是通过ViewRootImpl来完成的。
```
public interface WindowManager{
    public void addView(View view, ViewGroup.LayoutParams params);
    public void updateViewLayout(View view, ViewGroup.LayoutParams params);
    public void removeView(View view);
}
```

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrIQgj11zj9EQoiczjzLTlmZyDlyMzfIW2ibZh9WdLdG537Ud5FTQoeruVg/640?wx_fmt=png&from=appmsg)
在介绍下handleLaunchActivity()方法是启动Activity的核心方法。
handleLaunchActivity()主要调用了两个方法：performLaunchActivity()和handleResumeActivity()

- performLaunchActivity：完成Activity的创建，以及调用Activity的 onCreate()和onStart()方法
> performLaunchActivity()主要做了以下几件事：
> 1. 创建Activity。
> 2. 创建Context。
> 3. 调用Activity.attach()，创建Window，关联WindowManager。
> 4. 调用Activity.onCreate()。
> 5. 调用Activity.onStart()。

- handleResumeActivity：调用Activity的onResume()方法，处理View的呈现。

**Activity.onCreate()的调用流程**
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrIWiakLh2h3RRpdPdS0ADTJDAC1KRkxmP0QXo5osn9X690vFBpxW19YrA/640?wx_fmt=png&from=appmsg)
整个ViewTree都构建好了。
其中 在Activity.attach()方法执行时会创建Window并为Window关联WindowManager

然后处理 handleResumeActivity()处理的事情比较多。主要将create创建的ViewTree添加到Window里
主要有以下几个过程：

1. 通过performResumeActivity()处理Activity的onRestart onResume的生命周期。
2. 将DecorView设置为InVisible。
3. 通过WindowManager.addView()将DecorView绘制完成。
4. 将DecorView设置为Visiable。
5. 通知AMS Activity启动完成。

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrIQ0b2VwPpqZKG1VZ7nBY95PicULnhDweXTwA1PqelSk2fFeLl1a7FhhQ/640?wx_fmt=png&from=appmsg)

这里都能回答之前的2个问题：

- 子线程真的不能更新UI吗？

更新视图时，线程检查是在ViewRootImpl的checkThread()中。ViewRootImpl的初始化是在Activity的onResume()方法之后。因此，如果有子线程在onResume之前更新UI是可以成功的。当然还有一种Hook ViewRootImpl的mThread的方法也可以更新UI。这里不做介绍了。

- Activity的onCreate方法为什么无法获取View的宽和高？

这个问题和子线程不能更新UI的问题很像，也是方法执行时机的一个问题。View的measure、layout、draw。发生在Activity.onResume()之后，因此在onResume()之前都是无法获取View的宽、高等信息的。


最后监听屏幕刷新信号，当信号到来之后遍历ViewTree进行Measure、Layout、Draw操作，最终渲染到屏幕上，此时我们的App界面就显示出来了。


![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrIQmvjtzupvqcpjfv6ykIicNGicZa5LcnGiakTljHicIQrv3ibCB3TNeeRuKA/640?wx_fmt=png&from=appmsg)
