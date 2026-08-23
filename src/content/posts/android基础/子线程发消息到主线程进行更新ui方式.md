---
title: "子线程发消息到主线程进行更新ui方式"
published: 2022-05-16
description: "子线程发消息到主线程进行更新ui方式"
tags: ["Android","基础"]
category: "android基础"
draft: false
slug: "android-basic-049"
---

# 子线程发消息到主线程进行更新ui方式

android给我们提供了一些接口用于在异步线程中更新UI，比如 AsyncTask(),runOnUiThread(),View.post()方法等等,但是这些方法的底层都是调用handler来完成。具体的细节如下：

### 方式一： 在子线程中可以使用Activity的runOnUiThread方法更新
```
    new Thread(){
        public void run(){
            runOnUiThread(new Runnable(){
                @Override
                public void run(){
                    //更新UI
                }
            });
        }
    }
```
其实原理是Handler的post方法，其内部代码如下：
```
    public final void runOnUiThread(Runnable action) {
        if (Thread.currentThread() != mUiThread) {
            mHandler.post(action);
        } else {
            action.run();
        }
    }
```
先判断当前的线程是不是主线程，如果是，则直接运行，如果不是，调用post方法，所以最终仍旧是使用handler来进行的处理。

### 用View.post()方法更新
```
    imageView.post(new Runnable(){
        @Override
        public void run(){
            // 更新UI
        }
    });
```
View中的post源码如下：
```
    public boolean post(Runnable action) {
        final AttachInfo attachInfo = mAttachInfo;
        if (attachInfo != null) {
            return attachInfo.mHandler.post(action);
        }
    ​
        // Postpone the runnable until we know on which thread it needs to run.
        // Assume that the runnable will be successfully placed after attach.
        getRunQueue().post(action);
        return true;
    }
```
所以View自己内部也是有自己的异步处理机制，从上面代码就可以看出，调用的是HandlerActionQueue 的post方法，而在Handler内部调用post的时候，先执行的是sendMessageDelayed方法，然后执行sendMessageAtTime方法，紧接着执行enqueueMessage，最终执行的是queue.enqueueMessage，最终执行的方式都是一样的。


**总结：无论是哪种UI更新方式，其核心内容依旧还是Handler机制。**
