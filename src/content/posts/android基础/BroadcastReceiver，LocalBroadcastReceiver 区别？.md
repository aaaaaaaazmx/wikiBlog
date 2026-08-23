---
title: "BroadcastReceiver，LocalBroadcastReceiver 区别？"
published: 2022-10-26
description: "BroadcastReceiver，LocalBroadcastReceiver 区别？"
tags: ["Android","基础"]
category: "android基础"
draft: false
slug: "android-basic-014"
---

# BroadcastReceiver，LocalBroadcastReceiver 区别？

##### 1、应用场景

   1、BroadcastReceiver用于应用之间的传递消息；

   2、而LocalBroadcastManager用于应用内部传递消息，比broadcastReceiver更加高效。

##### 2、安全

   1、BroadcastReceiver使用的Content API，所以本质上它是跨应用的，所以在使用它时必须要考虑到不要被别的应用滥用；

   2、LocalBroadcastManager不需要考虑安全问题，因为它只在应用内部有效。

##### 3、原理方面

(1) 与BroadcastReceiver是以 Binder 通讯方式为底层实现的机制不同，LocalBroadcastManager 的核心实现实际还是 Handler，只是利用到了 IntentFilter 的 match 功能，至于 BroadcastReceiver 换成其他接口也无所谓，顺便利用了现成的类和概念而已。

(2) LocalBroadcastManager因为是 Handler 实现的应用内的通信，自然安全性更好，效率更高。

