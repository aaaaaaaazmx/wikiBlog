---
title: "程序A能否接收到程序B的广播？"
published: 2020-06-19
description: "程序A能否接收到程序B的广播？"
tags: ["Android","基础"]
category: "android基础"
draft: false
slug: "android-basic-061"
---

# 程序A能否接收到程序B的广播？

能，使用全局的BroadCastRecevier能进行跨进程通信，但是注意它只能被动接收广播。此外，LocalBroadCastRecevier只限于本进程的广播间通信。
