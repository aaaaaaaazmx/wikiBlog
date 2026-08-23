---
title: "Android View 滑动冲突解决方式以及原理(1)"
published: 2020-11-05
description: "Android View 滑动冲突解决方式以及原理(1)"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-005"
---

[Android View 滑动冲突解决方式以及原理 - 掘金](https://juejin.cn/post/6844903806308712456)
# Android View 滑动冲突解决方式以及原理

### 冲突原因
产生滑动冲突的场景主要有两种:

- 父ViewGroup和子View的滑动方向一致
- 父ViewGroup和子View的滑动方向不一致

### 冲突解决
滑动冲突主要有两种解决方式：

- 外部拦截法
- 内部拦截法



**外部拦截法**
外部拦截法主要是父容器去控制事件的拦截，若事件是父容器需要的，则进行拦截，不需要的则向下传递。父容器不能拦截DOWN事件或者UP事件。
> 比如 ViewPager和ListView显然产生了滑动冲突，我们来分析下。我们要的效果是在水平方向上滑动时ViewPager可以水平滚动，在竖直方向上滑动时，ListView可以滚动但ViewPager不动，因此我们需要为ViewGroup指定事件处理的条件

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrIQvDAXknBv2sHPtaZicrjKvuabibMO6xTAHPDnHq0QOFOh1fYU974KMlQ/640?wx_fmt=png&from=appmsg)
外部拦截时在重写ViewGroup的onInterceptTouchEvent方法时，ViewGroup不能拦截DOWN事件和UP事件。因为一旦ViewGroup拦截了DOWN事件，也就是和mFirstTouchTarget始终为空，同一事件序列中的其他事件都不会再往下传递；若ViewGroup拦截了UP事件，则子View就不会触发单击事件，因为子View的单击事件是在UP事件时被触发的

伪代码如下
```javascript
@Override
public boolean onInterceptTouchEvent(MotionEvent ev) {
    switch (ev.getAction()) {
        case MotionEvent.ACTION_MOVE:
            if (ViewPager需要此事件) {
                return true;
            }
            break;
        default:
            break;
    }
    return false;
}
```

**内部拦截法**
ViewGroup默认情况下不拦截事件，由子View去控制事件的处理，若子View需要此事件，则自己处理，否则交由父容器处理。使用内部拦截需要同时重写父ViewGroup的onInterceptTouchEvent和ViewGroup中需要解决冲突的子View的dispatchTouchEvent方法

内部拦截法是将事件控制权交给子View，若子View需要事件，则对事件进行处理，不需要则将事件传递给父ViewGroup，让父ViewGroup处理。
子View通过调用父ViewGroup的**requestDisallowInterceptTouchEvent**来干预父ViewGroup对事件的拦截状况
父ViewGroup不能拦截DOWN事件，至于MOVE或者UP事件的拦截状态要根据具体的情景

子view伪代码如下
```javascript
@Override
public boolean dispatchTouchEvent(MotionEvent ev) {
    switch (ev.getAction()) {
        case MotionEvent.ACTION_DOWN:
            //禁止父容器拦截事件
            getParent().requestDisallowInterceptTouchEvent(true);
            break;
        case MotionEvent.ACTION_MOVE:
            if (当期View不需要此事件) {
                // 允许父容器拦截事件
                getParent().requestDisallowInterceptTouchEvent(false);
            }
            break;
        default:
            break;
    }
    return super.dispatchTouchEvent(ev);
    }
```

ViewGroup 伪代码
```java
@Override
public boolean onInterceptTouchEvent(MotionEvent ev) {
switch (ev.getAction()) {
    case MotionEvent.ACTION_DOWN:
        return false;
    default:
        return true;
    }
}
```
