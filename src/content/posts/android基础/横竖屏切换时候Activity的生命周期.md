---
title: "横竖屏切换时候Activity的生命周期"
published: 2025-10-19
description: "横竖屏切换时候Activity的生命周期"
tags: ["Android","基础"]
category: "android基础"
draft: false
slug: "android-basic-058"
---

# 横竖屏切换时候Activity的生命周期

不设置Activity的android:configChanges时，切屏会重新回调各个生命周期，切横屏时会执行一次，切竖屏时会执行两次。

设置Activity的android:configChanges=”orientation”时，切屏还是会调用各个生命周期，切换横竖屏只会执行一次

设置Activity的android:configChanges=”orientation |keyboardHidden”时，切屏不会重新调用各个生命周期，只会执行onConfigurationChanged方法
