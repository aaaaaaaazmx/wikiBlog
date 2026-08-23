---
title: "子线程真的不能更新UI 吗？"
published: 2020-02-10
description: "子线程真的不能更新UI 吗？"
tags: ["Android","进阶"]
category: "android进阶"
draft: false
slug: "android-adv-040"
---

# 子线程真的不能更新UI 吗？


**先说结论 是可以**。

**只有创建了view树的线程，才能访问它的子view，比如我们这个view树实在子线程创建的，那么子线程确实可以访问，如果换成主线程，那么前后线程不一致确实会抛异常**。


这个问题其实挺迷惑人的，通常在我们的认知中，UI线程或者叫主线程才能更新UI的

## 正常认知 主线程更新UI
一般情况，我们在子线程直接操作UI，没有用handler切到主线程，就会报下面这个错。

> android.view.ViewRootImpl$CalledFromWrongThreadException: Only the original thread that created a view hierarchy can touch its views.

这是由于ViewRootImpl的checkThread方法中

```
    void checkThread() {
        if (mThread != Thread.currentThread()) {
            throw new CalledFromWrongThreadException(
                    "Only the original thread that created a view hierarchy can touch its views.");
        }
    }
```    

在 window创建时，会调用windowManager.addView添加window时会给这个window创建一个ViewRootImpl实例：然后ViewRootImpl构造方法中会拿到当前的线程，

```
    public ViewRootImpl(Context context, Display display) {
        mContext = context;
        ...
        mThread = Thread.currentThread();
        ...
    }
```    

所以在ViewRootImpl的checkThread()中，确实是 拿 当前想要更新UI的线程 和 添加window时的线程作比较，不是同一个线程机会报错。

通过window的相关知识，我们还知道，Activity也是一个window，window的添加是在ActivityThread的handleResumeActivity()。**ActivityThread就是主线程，所以Activity的view访问只能在主线程中**。
一般情况，UI就是指Activity的view，这也是我们通常称主线程为UI线程的原因

这里补充一点，那为**啥要一定需要checkThread**呢？
 > 因为UI控件不是线程安全的。那为啥不加锁呢？一是加锁会让UI访问变得复杂；二是加锁会降低UI访问效率，会阻塞一些线程访问UI。所以干脆使用单线程模型处理UI操作，使用时用Handler切换即可。



## 子线程更新UI

符合2个条件
1. 绕过ViewRootImpl的checkThread检查
2. 创建view树和更新view树都是子线程

最经典的是在**onCreat**时候 psotDelay弹toast

```
     new Thread(new Runnable() {
        @Override
        public void run() {
            //因为添加window是IPC操作，回调回来时，需要handler切换线程，所以需要Looper
            Looper.prepare();

            addWindow(button);

            new Handler().postDelayed(new Runnable() {
                @Override
                public void run() {
                    button.setText("文字变了！！！");
                }
            },3000);

            Toast.makeText(MainActivity.this, "子线程showToast", Toast.LENGTH_SHORT).show();

            //开启looper，循环取消息。
            Looper.loop();
        }
    }).start();
```
因为viewRootImpl是在Activity的window添加在首次onResume之后执行的的，那ViewRootImpl的创建也是在这之后，所以onCreate到onResume期间也就无法checkThread了
 
 
 
 