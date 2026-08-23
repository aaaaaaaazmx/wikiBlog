---
title: "你能自己设计实现一个 HashMap 吗？"
published: 2023-12-13
description: "你能自己设计实现一个 HashMap 吗？"
tags: ["Java","集合","数据结构"]
category: "java集合"
draft: false
slug: "java-collection-013"
---

### 你能自己设计实现一个 HashMap 吗？
这道题**快手**常考。
不要慌，红黑树版咱们多半是写不出来，但是数组+链表版还是问题不大的，详细可见： [手写 HashMap，快手面试官直呼内行！](https://mp.weixin.qq.com/s/Z9yoRZW5itrtgbS-cj0bUg)。
整体的设计：

- 散列函数：hashCode()+除留余数法
- 冲突解决：链地址法
- 扩容：节点重新 hash 获取位置

![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1Sq674fu0KbGAca6WM6MQmGmZ8wmV5gFRK5Sc2JiakfsyjmzlhQaUTTfA/640?wx_fmt=png&from=appmsg)
完整代码：
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLUiaU5ZLPSGibccpzhq12eP1S7hCdSbsOY1vtpBXNJicicAMR5xxTaaibhTxFsfstXIxkglW6xRCmB6Tgw/640?wx_fmt=png&amp;from=appmsg)

