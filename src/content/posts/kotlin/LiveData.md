---
title: "LiveData"
published: 2025-11-28
description: "LiveData"
tags: ["Kotlin","Android"]
category: "kotlin"
draft: false
slug: "kotlin-010"
---


# LiveData

> 上下游的通知，就是一个简化版的rxjava

1. LiveData持有一个观察者列表，可以添加和删除观察者。
2. 当LiveData数据发生变化时，会通知观察者列表中的所有观察者。
3. LiveData可以感知Activity和Fragment的生命周期，当它们处于激活状态时才会通知观察者，避免了内存泄漏和空指针异常。
4. LiveData还支持线程切换，可以在后台线程更新数据，然后在主线程中通知观察者更新UI。




LiveData提供了setValue和postValue两个方法来设置数据通知

- setValue:方法只能在主线程调用，不依赖Handler机制来回调，
- postValue:可以在任何线程调，同步到主线程依赖于Handler，需要等待主线程空闲时才会执行更新操作。


# LifeCycle
> 用于监听生命周期，包含三个角色。LifecycleOwner、LifecycleObserver和Lifecycle

- LifecycleObserver是Lifecycle的观察者。viewmodel默认就实现了这个接口
- LifecycleOwner是具有生命周期的组件，如Activity、Fragment等，它持有一个Lifecycle对象
- Lifecycle是LifecycleOwner的生命周期管理器，它定义了生命周期状态和转换关系，并负责通知LifecycleObserver状态变化的事件


了解这三个角色其实就很容易理解了，本质上LifeCycle也是一个观察者模式，管理数据的是LifeCycle，生命周期的状态都是通过它来完成的。而我们写代码的时候要写的一句是
**getLifecycle().addObserver(xxLifeCycleObserver())** 是添加一个观察者，这个观察者就能收到相应的通知了。

