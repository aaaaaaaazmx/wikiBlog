---
title: "viewmodel原理"
published: 2024-04-08
description: "viewmodel原理"
tags: ["Kotlin","Android"]
category: "kotlin"
draft: false
slug: "kotlin-015"
---

> 可能会问你Viewmodel跟Activity哪个先销毁、Viewmodel跟Activity是怎么进行生命周期的绑定的

Viewmodel的两个重要类：**ViewModelProvider**和**ViewmodelStore**。其实就是我们使用时用到的

```
// 这里this接收的其实是一个`ViewModelStoreOwner`是一个接口，我们的AppCompatActivity已经实现了
aViewModel = ViewModelProvider(this).get(AViewModel::class.java)

```
- ViewModelStore 是一个存储 ViewModel 的容器，用于存储与某个特定的生命周期相关联的 ViewModel

是一个全局的容器，实际上就是一个HashMap。


- ViewModelProvider用于管理ViewModel实例的创建和获取

其实这里设计的理念也比较好理解，比如旋转屏幕这个场景，我们会使用Viewmodel来保存数据，因为他数据不会被销毁，之所以不被销毁不用想也只是肯定是脱离Activity或者Fragment保存的。


Viewmodel是什么时候回收的呢？

在Activity或者Fragment销毁其实只是移除了他的引用，当内存不足时gc会回收或者手动调用clear方法回收。所以回答Activity和Viewmodel谁的生命周期比较长时就知道了，只要不是手动清除肯定是ViewModel的生命周期比Activity长。
因为ViewModel一直存在，所以如果太多需要做一些优化，原则很简单，就是把ViewModel细分，有些没必要保存的手动清除，有些需要全局的就使用单例。
