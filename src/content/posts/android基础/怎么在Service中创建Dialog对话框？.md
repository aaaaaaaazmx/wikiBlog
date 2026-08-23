---
title: "怎么在Service中创建Dialog对话框？"
published: 2020-08-14
description: "怎么在Service中创建Dialog对话框？"
tags: ["Android","基础"]
category: "android基础"
draft: false
slug: "android-basic-054"
---

# 怎么在Service中创建Dialog对话框？

1.在我们取得Dialog对象后，需给它设置类型，即：

```
dialog.getWindow().setType(WindowManager.LayoutParams.TYPE_SYSTEM_ALERT)
```

2.在Manifest中加上权限:
```
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINOW" />

```