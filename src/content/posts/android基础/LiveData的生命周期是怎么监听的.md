---
title: "LiveData的生命周期是怎么监听的"
published: 2024-01-27
description: "LiveData的生命周期是怎么监听的"
tags: ["Android","基础"]
category: "android基础"
draft: false
slug: "android-basic-028"
---

# LiveData的生命周期是怎么监听的

都知道LiveData会持有可被观察的数据。 **并且同时它也是一种可感知生命周期的组件**，意味着该组件重视其他app组件的生命周期，如Activity、Fragment，该组件能确保，仅仅在Activity\Fragment等组件都处于活跃的生命周期状态的时候，才去更新app组件。


     public void observe(@NonNull LifecycleOwner owner, @NonNull Observer<? super T> observer) {
            assertMainThread("observe");
            if (owner.getLifecycle().getCurrentState() == DESTROYED) {
                // ignore
                return;
            }
            LifecycleBoundObserver wrapper = new LifecycleBoundObserver(owner, observer);
            ObserverWrapper existing = mObservers.putIfAbsent(observer, wrapper);
            if (existing != null && !existing.isAttachedTo(owner)) {
                throw new IllegalArgumentException("Cannot add the same observer"
                        + " with different lifecycles");
            }
            if (existing != null) {
                return;
            }
            // 使用Lifecycle监听生命周期
            owner.getLifecycle().addObserver(wrapper);
    }


**可以看到其实LiveData就是借助了Lifecycle感知生命周期的。将LifecycleBoundObserver wrapper添加为观察者，当有生命周期变化时将会执行：onStateChanged**

在activeStateChanged中如果当前改变的状态为活跃状态（shouldBeActive():true），则会调用到considerNotify方法通知数据更新：

    private void considerNotify(ObserverWrapper observer) {
            if (!observer.mActive) {
                return;
            }
    ​
            if (!observer.shouldBeActive()) {
                observer.activeStateChanged(false);
                return;
            }
            //如果数据没有变化，无需通知
            if (observer.mLastVersion >= mVersion) {
                return;
            }
            observer.mLastVersion = mVersion;
            //noinspection unchecked
            observer.mObserver.onChanged((T) mData);
        }


数据在每次修改时，都会进行mVersion++，因此可以使用mVersion判断数据是否发生修改，如果未发生变化则不会发起回调。

    //postValue也会最终调用到setValue
    protected void setValue(T value) {
            assertMainThread("setValue");
            mVersion++; // 数据变化标记
            mData = value;
            dispatchingValue(null);
    }


**所以，LiveData的生命周期是通过Lifecycle监听的，同时LiveData会维护一个mVersion作为数据的版本号。当数据有修改时，才会进行通知回调。**