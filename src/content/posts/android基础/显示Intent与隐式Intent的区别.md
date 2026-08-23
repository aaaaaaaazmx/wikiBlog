---
title: "显示Intent与隐式Intent的区别"
published: 2020-06-01
description: "显示Intent与隐式Intent的区别"
tags: ["Android","基础"]
category: "android基础"
draft: false
slug: "android-basic-055"
---

# 显示Intent与隐式Intent的区别

- 对明确指出了目标组件名称的Intent，我们称之为“显式Intent”。

- 对于没有明确指出目标组件名称的Intent，则称之为“隐式 Intent”。

对于隐式意图，在定义Activity时，指定一个intent-filter，当一个隐式意图对象被一个意图过滤器进行匹配时，将有三个方面会被参考到：

- 动作(Action)

- 类别(Category)

- 数据(Data)

```
    <activity android:name=".MainActivity"  android:label="@string/app_name">
                <intent-filter>
                    <action android:name="com.wpc.test" />
                    <category android:name="android.intent.category.DEFAULT" />
                    <data android:mimeType="image/gif"/>
                </intent-filter>
    </activity>
```    