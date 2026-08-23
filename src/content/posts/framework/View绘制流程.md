---
title: "View绘制流程"
published: 2022-09-28
description: "View绘制流程"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-036"
---



**1、View绘制的起点**
当建立好了decorView与ViewRoot的关联后，ViewRoot类的requestLayout()方法会被调用，以完成应用程序用户界面的初次布局。实际被调用的是ViewRootImpl类的requestLayout()方法，这个方法的主要源码如下：

```javascript
@Override
public void requestLayout() {
  if (!mHandlingLayoutInLayoutRequest) {
    // 检查发起布局请求的线程是否为主线程
    checkThread();
    mLayoutRequested = true;
    scheduleTraversals();
  }
}
```
上面的方法中调用了scheduleTraversals()方法来调度一次完成的绘制流程，该方法会向主线程发送一个“遍历”消息，最终会导致ViewRootImpl的**performTraversals**()方法被调用。

**2、View的绘制流程**
View的绘制，有三个步骤：测量（measure），布局（layout），绘制（draw）, 从DecorView自上而下遍历整个View树，注意是所有View执行完一个步骤后，再进行下一步，而不是一个View执行完所有步骤再遍历下一个View。 
![](https://mmbiz.qpic.cn/mmbiz_jpg/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrI6PTR8RnEpnZias4SPTR4fyKFaLia9Vcz4zGhcVDccbYNXWvib2188VU1g/640?wx_fmt=webp&from=appmsg)
各步骤的主要工作：

- Measure：测量视图大小。从顶层父View到子View递归调用measure方法，measure方法又回调OnMeasure。
- Layout：确定View位置，进行页面布局。从顶层父View向子View的递归调用view.layout方法的过程，即父View根据上一步measure子View所得到的布局大小和布局参数，将子View放在合适的位置上。
- Draw：绘制视图。ViewRoot创建一个Canvas对象，然后调用OnDraw()。六个步骤：①、绘制视图的背景；②、保存画布的图层（Layer）；③、绘制View的内容；④、绘制View子视图，如果没有就不用；⑤、还原图层（Layer）；⑥、绘制滚动条。
> **简单介绍下MeasureSpec**
> MeasureSpec由两部分组成，一部分是测量模式，另一部分是测量的尺寸大小。

![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrIC8pia06AVdHZNlTm9apRcOyicMZibCuabFicicbWlMXpfEr5mTtgKEbMSkQ/640?wx_fmt=png&from=appmsg)
> Mode模式共分为三类：

- EXACTLY：对应LayoutParams中的match_parent和具体数值这两种模式。检测到View所需要的精确大小，这时候View的最终大小就是SpecSize所指定的值，
- AT_MOST ：对应LayoutParams中的wrap_content。View的大小不能大于父[容器](https://cloud.tencent.com/product/tke?from_column=20065&from=20065)的大小。
- UNSPECIFIED ：不对View进行任何限制，要多大给多大，一般用于系统内部，如ListView，ScrollView

**4、MeasureSpec的确定**
这个没啥好说的，理解+记忆这个表格，子View的MeasureSpec由父View根据自身的MeasureSpec和子View的LayoutParams来共同确定子View的MeasureSpec，注意，即使确定了子View的MeasureSpec并不一定决定了子View的大小，自定义View可以根据需要修改这个值，最终通过setMeasuredDimension（width,height）设置最终大小。
![](https://mmbiz.qpic.cn/mmbiz_jpg/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrIicKqftjW5RL4Pod1yoYKuFHzwTzVmkbCcbXV6TUgGyQCSb2Jqeica4Vg/640?wx_fmt=webp&from=appmsg)
**5、View执行onMeasure,onLayout的次数**
分析ViewRootImpl的源码，scheduleTraversales()内部会执行postCallBack触发mTraversalRunnable重新走一遍performTraversals(),第二次执行performTraversals()就会触发performDraw()。所以performTraversals()走了两次，那么肯定会走2次measure方法，但不一定走2次onMeasure()，读过View measure方法源码的都应知道measure方法做了2级测量优化：

- 1.如果flag不为forceLayout或者与上次测量规格（MeasureSpec）相比未改变，那么将不会进行重新测量（执行onMeasure方法），直接使用上次的测量值；
- 2.如果满足非强制测量的条件，即前后二次测量规格不一致，会先根据目前测量规格生成的key索引缓存数据，索引到就无需进行重新测量;如果targetSDK小于API 20则二级测量优化无效，依旧会重新测量，不会采用缓存测量值。



**6、getWidth()和getMeasuredWidth()的区别**
getMeasuredWidth()、getMeasuredHeight()必须在onMeasure之后使用才有效）getMeasuredWidth() 的取值最终来源于 setMeasuredDimension() 方法调用时传递的参数, getWidth()返回的是，mRight - mLeft，mRight、mLeft 变量分别表示 View 相对父容器的左右边缘位置，getWidth()与getHeight()方法必须在layout(int l, int t, int r, int b)执行之后才有效
**7、如何在onCreate中拿到View的宽度和高度**

- **View.post(runnable)**
```javascript
view.post(new Runnable() {            
            @Override
            public void run() {
                int width = view.getWidth();
                int measuredWidth = view.getMeasuredWidth();
                Log.i(TAG, "width: " + width);
                Log.i(TAG, "measuredWidth: " + measuredWidth);
            }
        });
```
利用Handler通信机制，发送一个Runnable到MessageQueue中，当View布局处理完成时，自动发送消息，通知UI进程。借此机制，巧妙获取View的高宽属性，代码简洁，相比ViewTreeObserver监听处理，还不需要手动移除观察者监听事件。

- **ViewTreeObserver.addOnGlobalLayoutListener()**

监听View的onLayout()绘制过程，一旦layout触发变化，立即回调onLayoutChange方法。 注意，使用完也要主要调用removeOnGlobalListener()方法移除监听事件。避免后续每一次发生全局View变化均触发该事件，影响性能。
```javascript
ViewTreeObserver vto = view.getViewTreeObserver();       
       vto.addOnGlobalLayoutListener(new OnGlobalLayoutListener() {
            @Override
            public void onGlobalLayout() {
                view.getViewTreeObserver().removeGlobalOnLayoutListener(this);
                Log.i(TAG, "width: " + view.getWidth());
                Log.i(TAG, "height: " + view.getHeight());
            }
        });
```
**8、invalidate和postInvalidate区别**
二者都会出发刷新View，并且当这个View的可见性为VISIBLE的时候，View的onDraw()方法将会被调用，invalidate()方法在 UI 线程中调用，重绘当前 UI。postInvalidate() 方法在非 UI 线程中调用，通过Handler通知 UI 线程重绘。

**9、requestLayout()的作用**
requestLayout()也可以达到重绘view的目的，但是与前两者不同，它会先调用onLayout()重新排版，再调用ondraw()方法。当view确定自身已经不再适合现有的区域时，该view本身调用这个方法要求parent view（父类的视图）重新调用他的onMeasure、onLayout来重新设置自己位置。特别是当view的layoutparameter发生改变，并且它的值还没能应用到view上时，这时候适合调用这个方法requestLayout()。 

**10、onDraw() 和dispatchDraw()的区别**

- 绘制View本身的内容，通过调用View.onDraw(canvas)函数实现
- 绘制自己的孩子通过dispatchDraw（canvas）实现

draw过程会调用onDraw(Canvas canvas)方法，然后就是dispatchDraw(Canvas canvas)方法, dispatchDraw()主要是分发给子组件进行绘制，我们通常定制组件的时候重写的是onDraw()方法。值得注意的是ViewGroup容器组件的绘制，当它没有背景时直接调用的是dispatchDraw()方法, 而绕过了draw()方法，当它有背景的时候就调用draw()方法，而draw()方法里包含了dispatchDraw()方法的调用。因此要在ViewGroup上绘制东西的时候往往重写的是dispatchDraw()方法而不是onDraw()方法，或者自定制一个Drawable，重写它的draw(Canvas c)和 getIntrinsicWidth()方法，然后设为背景。
