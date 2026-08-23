---
title: "ApplicationContext和ActivityContext的区别"
published: 2020-04-24
description: "ApplicationContext和ActivityContext的区别"
tags: ["Android","基础"]
category: "android基础"
draft: false
slug: "android-basic-008"
---

# ApplicationContext和ActivityContext的区别

这是两种不同的context，也是最常见的两种.

- 第一种中context的生命周期与Application的生命周期相关的，context随着Application的销毁而销毁，伴随application的一生，与activity的生命周期无关.



- 第二种中的context跟Activity的生命周期是相关的，但是对一个Application来说，Activity可以销毁几次，那么属于Activity的context就会销毁多次.


至于用哪种context，得看应用场景。还有就是，在使用context的时候，小心内存泄露，防止内存泄露，注意一下几个方面：

- 不要让生命周期长的对象引用activity context，即保证引用activity的对象要与activity本身生命周期是一样的。
- 对于生命周期长的对象，可以使用application context。
- 避免非静态的内部类，尽量使用静态类，避免生命周期问题，注意内部类对外部对象引用导致的生命周期变化。