---
title: "Vsync同步机制"
published: 2024-11-06
description: "Vsync同步机制"
tags: ["Android","Framework"]
category: "framework"
draft: false
slug: "framework-037"
---

## Vsync同步机制
Vysnc垂直同步是Android在“黄油计划”中引入的一个重要机制，本质上是为了协调BufferQueue的应用生产者生成UI数据动作和SurfaceFlinger消费者的合成消费动作，避免出现画面撕裂的Tearing现象。Vysnc信号分为两种类型：

1. app类型的Vsync：**app类型的Vysnc信号由上层应用中的Choreographer根据绘制需求进行注册和接收，用于控制应用UI绘制上帧的生产节奏**。根据第7小结中的分析：应用在UI线程中调用invalidate刷新界面绘制时，需要先透过Choreographer向系统申请注册app类型的Vsync信号，待Vsync信号到来后，才能往主线程的消息队列放入待绘制任务进行真正UI的绘制动作；
2. sf类型的Vsync:**sf类型的Vsync是用于控制SurfaceFlinger的合成消费节奏**。应用完成界面的绘制渲染后，通过Binder调用queueBuffer接口将缓存数据返还给应用对应的BufferQueue时，会申请sf类型的Vsync，待SurfaceFlinger 在其UI线程中收到 Vsync 信号之后，便开始进行界面的合成操作。

Vsync信号的生成是参考屏幕硬件的刷新周期的，其架构如下图所示：

![image.png](https://mmbiz.qpic.cn/mmbiz_jpg/LrDMVD5bqLXusNIRWG3ibmRaWunjvaVrIouOxwQaSmfXqjhNfubH7MJRs6j2ibqwQVrc8rS9S2jGGc5KO8ckznEg/640?wx_fmt=webp&from=appmsg)



