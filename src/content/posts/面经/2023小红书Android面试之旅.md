---
title: "2023小红书Android面试之旅"
published: 2023-01-06
description: "2023小红书Android面试之旅"
tags: ["面试","面经"]
category: "面经"
draft: false
slug: "interview-002"
---

# 一面
- 自我介绍
- 看你写了很多文章，拿你理解最深刻的一篇出来讲一讲讲了Binder相关内容
- Binder大概分了几层
- 哪些方法调用会涉及到Binder通信
- 大概讲一下startActivity的流程，包括与AMS的交互
- 全页面停留时长埋点是怎么做的我在项目中做过的内容，主要功能是计算用户在每个Activity的停留时长，并且支持多进程。这里的多进程支持主要是通过以ContentProvider作为中介，然后通过ContentResolver.call方法去调用它的各种方法以实现跨进程
- 动态权限申请是什么详见 [Android动态权限申请从未如此简单](https://juejin.cn/post/7225516176171188285) 这篇文章
- 你做的性能监测工具，FPS是怎么采集的
- 性能监测工具用在了什么场景
- 有没有通过这个性能监测工具去做一些优化
- 图片库，例如Glide，一般对Bitmap有哪些优化点
- 过期的Bitmap可以复用吗
- 有没有基于ASM插桩做过一些插件
- 讲了一下当时做过的一个个人项目 [FastInflate](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fdreamgyf%2FFastInflate)这个项目没能达到最终的目标，但通过做这个项目学习了很多新知识，比如APT代码生成、阅读了LayoutInflater源码、AppCompatDelegateImpl实现的LayoutInflater.Factory2会极大的拖慢布局创建的速度等
- 怎么优化布局创建速度提示了预加载，但我当时脑抽在纠结xml的缓存，没想到可以提前把视图先创建好
- 说一下你觉得你最擅长或者了解最透的点我回答的自定义View
- 解决过View的滑动冲突吗
- 讲解了一个之前写过的开源控件 [SwipeLoadingLayout](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fdreamgyf%2FSwipeLoadingLayout)
- 一般遇到困难的解决方案是什么
- 算法题：[反转链表](https://link.juejin.cn?target=https%3A%2F%2Fleetcode.cn%2Fproblems%2Freverse-linked-list%2F)
- 反问阶段
   - 咱们组主要负责哪些内容
   - 主要使用Java还是KotlinKotlin
   - 小红书的面试一般是怎么个流程？多少轮？一般三轮技术面，一轮HR面
   - 面试完一般多久会给到结果比较快，一两天的样子
# 二面

- 自我介绍
- 为什么这个时间节点想要出来换工作呢
- 在B站这些年做了什么
- 做了哪些基础组件讲解了一下之前写的 [SwipeLoadingLayout](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fdreamgyf%2FSwipeLoadingLayout)
- 介绍一下Android的事件传递机制
- 你写的这个分享模块是如何设计的对外采用流式调用的形式，内部通过策略模式区分不同的平台以及分享类型，给每个平台创建了一个中间Activity作为分享SDK请求的发起方（SDK.getApi().share()）以及分享结果的接收方（onActivityResult），然后通过广播将分享的结果送入到分享模块内进行处理，最终调用用户设置的分享回调告知结果
- 看你之前在扇贝的时候有开发过一些性能监测工具，那有做过性能优化吗
- 你是如何收集这些性能数据的
- 有没有对哪方面做过一些针对性的优化
- Android系统为什么会触发ANR，它的机制是什么
- 有解过ANR相关的问题吗？有哪几种类型？
- 算法题：[二叉树的层序遍历](https://link.juejin.cn?target=https%3A%2F%2Fleetcode.cn%2Fproblems%2Fbinary-tree-level-order-traversal%2F)
- Queue除了LinkedList还有哪些实现类
- 现在还在面其他公司吗？你自己后面职业生涯的选择是怎么样的？
- 给我介绍了一下团队，说我面试的这个部门应该说是小红书最核心的团队，包括主页、搜索、图文、视频等等都在部门业务范畴内，部门主要分三层，除了业务层之外还有基础架构层以及性能优化层
- 反问阶段
   - 部门分三层的话，那新人进来的话是需要从业务层做起吗？不是这样的，我们首先会考虑这个同学能干什么，然后会考虑这个同学愿意去做什么，进来后，有经验的同学也会来带你的，不会一上来就让你抗输出，总之会把人放到适合他的团队里
   - 小红书会使用到一些跨端技术吗？会，之前在一些新的App上使用的Flutter，现在主要用的是RN，还会使用到一些DSL，这个不能算跨段。为什么在小红书社区App中跨端技术提及的比较少，是因为小红书App非常重视用户体验，对性能的要求比较高
# 三面

- 自我介绍
- 介绍一下目前负责的业务
- 工作过程中有碰到过什么难题，最后是怎么解决的一开始脑抽了没想到该说什么，随便扯了一个没啥技术含量的东西，又扯了一个之前做的信号捕获的工具，后来回忆起来了，重新说了一个关于DEX编排的东西（主DEX中方法数超过65535导致打包失败，写了个脚本将一部分Class从主DEX中移除到其他DEX中）
- 如何设计一个头像的自定义View，要求使头像展示出来是一个圆形
- 介绍一下Android事件的分发流程
- 如何处理View的防误触
- 怎么处理滑动冲突
- Activity在onCreate方法中调用了finish方法，那它的生命周期会是怎样的
- 如果我想判断一个Activity中的一个View的尺寸，那我什么时候能够拿到
- RecyclerView如何实现一个吸顶效果
- Java和Koltin你哪个用的比较多
- 有用过Kotlin的协程吗
- Kotlin中的哪些Feature你用的多，觉得写的好呢
- 你是怎么理解MVVM的
- 你有用过Jetpack Compose吗
- 有用过kotlin中的by lazy和lateinit吗
- kotlin中怎么实现单例，怎么定义一个类的静态变量
- 算法题：[增量元素之间的最大差值](https://link.juejin.cn?target=https%3A%2F%2Fleetcode.cn%2Fproblems%2Fmaximum-difference-between-increasing-elements%2F)
- 你这次看机会的原因是什么
- 反问阶段我感觉之前问的差不多了，这次就没再问什么问题了
# HR面

- 现在是离职还是在职状态
- 介绍一下之前负责的工作
- 用户量怎么样
- 这个项目是从0到1开发的吗
- 这个业务有什么特点，对于客户端开发有什么挑战与困难
- 团队分工是怎样的
- 这个项目能做成现在这个样子，你自己的核心贡献有哪些
- 这个事情对你来说有什么收获吗
- 在B站的工作节奏是怎么样的
- 离职的原因是什么呢
- 你自己希望找一个什么样的环境或者什么阶段的业务
- 你对小红书有什么了解吗
- 未来两三年对于职业发展的想法
- 你觉得现在有什么限制了你或者你觉得你需要提升哪些部分
- 反问阶段
   - 问了一些作息、福利待遇之类的问题
# 总结
小红书面试总体而言给我的体验是很好的，每轮面试后基本上都是当天就能出结果，然后约下一轮的面试。最终从一面到HR面结束出结果，一共花了9天时间，还是挺快的。二面结束后，一面的面试官加我微信说小红书目前很缺人，感兴趣的同学也可以来试试。

链接：https://juejin.cn/post/7304267413637333029

