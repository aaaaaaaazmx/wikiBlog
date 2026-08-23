---
title: "自定义view效率高于xml定义吗？说明理由"
published: 2022-08-03
description: "自定义view效率高于xml定义吗？说明理由"
tags: ["Android","基础"]
category: "android基础"
draft: false
slug: "android-basic-063"
---

# 自定义view效率高于xml定义吗？说明理由

自定义view效率高于xml定义：

1、少了解析xml。

2.、自定义View 减少了ViewGroup与View之间的测量,包括父量子,子量自身,子在父中位置摆放,当子view变化时,父的某些属性都会跟着变化。


