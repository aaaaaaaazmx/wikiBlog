---
title: "bitmap recycler的变化"
published: 2023-11-16
description: "bitmap recycler的变化"
tags: ["Android","基础"]
category: "android基础"
draft: false
slug: "android-basic-013"
---

# bitmap recycler的变化

在Android中，Bitmap的存储分为两部分，
- 一部分是Bitmap的数据，
- 一部分是Bitmap的引用。

在Android2.3时代，Bitmap的引用是放在堆中的，而Bitmap的数据部分是放在栈中的，需要用户调用recycle方法手动进行内存回收，而在Android2.3之后，整个Bitmap，包括数据和引用，都放在了堆中，这样，整个Bitmap的回收就全部交给GC了，这个recycle方法就再也不需要使用了。

bitmap recycler引发的问题：当图像的旋转角度小余两个像素点之间的夹角时，图像即使旋转也无法显示，因此，系统完全可以认为图像没有发生变化。这时系统就直接引用同一个对象来进行操作，避免内存浪费。
