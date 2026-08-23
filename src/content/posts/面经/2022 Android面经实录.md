---
title: "2022 Android面经实录"
published: 2022-02-10
description: "2022 Android面经实录"
tags: ["面试","面经"]
category: "面经"
draft: false
slug: "interview-001"
---

链接：https://juejin.cn/post/707211040473795798

> **进技术交流群，添加微信：uestc_xsf，(备注加群)，不定期分享学习资料，前进路上不孤单**

### 1. 前言
春水初盛，垂钓者络绎不绝，鱼儿按捺不住，拍打着尾鳍纷纷跃出水面，沽个好价。
本篇真实的记录了我从 准备->复习->面试 的全过程，分享一些我的真实经验，希望能帮到大家。
### 2. 准备工作
开始准备工作之前，首先思考几个问题：

- 如何准备
- 需要复习哪些东西
- 该怎么复习
- 怎么复习最高效
- 职业规划
1. 如何准备，从哪里开始着手？首先是想好自己是否真的需要换工作，确定好需要换之后就开始写简历，将个人技能点、业务经验、业务成绩等写上去。
2. 需要复习哪些东西？我个人认为首先是复习Java基础和Android基础，然后再根据简历上写的技能点和业务经历，复习相关的知识点。有时候，你做过的某个东西，可能叙述出来不是特别清晰，或者根本就想不起来具体是怎么做的了，这个时候就需要复习代码回顾一下。

下面是一些我需要复习的点：

- 项目经历，业务，难点
- Java基础,JVM，集合原理
- Android基础,View体系，View绘制流程，事件分发，屏幕刷新，动画原理
- 常见三方库原理
- Jetpack
- Android Framework
- 算法
- Kotlin
1. 该怎么复习？将以前学习该部分时写过的博客或者笔记拿出来复习，结合源码。如果是以前没有写过相关笔记的，就找一下相关的技术文章，汇总，看一波。
2. 怎么复习最高效？一个技术点或者做过的业务，最好是先复习一下，然后用自己的话把它描述出来，最好是写成文字，记录到云笔记上，方便随时复习。当然，这只是一个点的复习方式。而简历上有很多很多个这样的点，我们需要设置一个**dead line**，设置一个复习总时长，到哪个日期截止，必须在那个日期结束前复习完成。然后**将需要复习的点详细安排到每一天**，每天需要复习哪些东西，必须当天完成，禁止自己拖到第二天，最好是明天的任务内容今天就把它完成了，然后明天就去复习后天的任务内容。给自己留有余地，即使某天没时间复习，也不至于落后于计划。最好是开始复习计划之前就把每一个知识点需要看的东西全部给列出来，比如需要复习哪篇笔记、哪篇文章、哪部分代码等，到时在复习的时候就无需关心该复习哪里，直接照着之前安排好的计划开整就行了。

下面是一些我在复习时的部分计划，完成时打个勾
![](https://raw.githubusercontent.com/xfhy/Android-Notes/master/Images/2022%E9%98%B6%E6%A2%AF%E8%AE%A1%E5%88%92.png)

1. 职业规划？开始找工作之前，最好是先想好自己下一份工作想做什么，去怎么样的公司，将来想怎么发展。
### 3. 我的复习资料
这块大家尽量按照自己简历的内容来进行专项复习，下面是一些我复习时用到的资料。因为这些都是自己的技能点，所以复习要稍微加快一下速度，控制好复习总时长。
#### 3.1 算法部分

- 打遍天下二叉树 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAlgorithm%2F%25E6%2589%2593%25E9%2581%258D%25E5%25A4%25A9%25E4%25B8%258B%25E4%25BA%258C%25E5%258F%2589%25E6%25A0%2591.md)
- labuladong的fucking-algorithm [github.com/labuladong/…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Flabuladong%2Ffucking-algorithm)
#### 3.2 Java基础

- Java集合源码复习一遍
- ArrayList源码解析 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2F%25E9%259B%2586%25E5%2590%2588%2FArrayList%25E6%25BA%2590%25E7%25A0%2581%25E8%25A7%25A3%25E6%259E%2590.md)
- LinkedList源码解析 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2F%25E9%259B%2586%25E5%2590%2588%2FLinkedList%25E6%25BA%2590%25E7%25A0%2581%25E8%25A7%25A3%25E6%259E%2590.md)
- CopyOnWriteArrayList源码解析 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2F%25E9%259B%2586%25E5%2590%2588%2FCopyOnWriteArrayList%25E6%25BA%2590%25E7%25A0%2581%25E8%25A7%25A3%25E6%259E%2590.md)
- HashMap源码解析 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2F%25E9%259B%2586%25E5%2590%2588%2FHashMap%25E6%25BA%2590%25E7%25A0%2581%25E8%25A7%25A3%25E6%259E%2590.md)
- ConcurrentHashMap源码解析 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2F%25E9%259B%2586%25E5%2590%2588%2FConcurrentHashMap%25E6%25BA%2590%25E7%25A0%2581%25E8%25A7%25A3%25E6%259E%2590.md)
- TreeMap 和 LinkedHashMap [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2F%25E9%259B%2586%25E5%2590%2588%2FTreeMap%25E5%2592%258CLinkedHashMap.md)
- HashSet 和 TreeSet [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2F%25E9%259B%2586%25E5%2590%2588%2FHashSet%25E5%2592%258CTreeSet.md)
- Android中的Bundle,SparseArray和ArrayMap [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2F%25E9%259B%2586%25E5%2590%2588%2FAndroid%25E4%25B8%25AD%25E7%259A%2584Bundle%2CSparseArray%25E5%2592%258CArrayMap.md)
- 从源码角度彻底搞懂String,StringBuffer,StringBuilder_20180420 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2F%25E5%259F%25BA%25E7%25A1%2580%2F%25E4%25BB%258E%25E6%25BA%2590%25E7%25A0%2581%25E8%25A7%2592%25E5%25BA%25A6%25E5%25BD%25BB%25E5%25BA%2595%25E6%2590%259E%25E6%2587%2582String%2CStringBuffer%2CStringBuilder_20180420.md)
- String [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2F%25E5%259F%25BA%25E7%25A1%2580%2FString.md)
- 泛型 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2F%25E5%259F%25BA%25E7%25A1%2580%2F%25E6%25B3%259B%25E5%259E%258B.md)
- 异常 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2F%25E5%259F%25BA%25E7%25A1%2580%2F%25E5%25BC%2582%25E5%25B8%25B8.md)
- 反射 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2F%25E5%259F%25BA%25E7%25A1%2580%2F%25E5%258F%258D%25E5%25B0%2584.md)
- 注解 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2F%25E5%259F%25BA%25E7%25A1%2580%2F%25E6%25B3%25A8%25E8%25A7%25A3.md)
- 反射性能开销原理及优化 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2F%25E5%259F%25BA%25E7%25A1%2580%2F%25E5%258F%258D%25E5%25B0%2584%25E6%2580%25A7%25E8%2583%25BD%25E5%25BC%2580%25E9%2594%2580%25E5%258E%259F%25E7%2590%2586%25E5%258F%258A%25E4%25BC%2598%25E5%258C%2596.md)
- 《深入理解Java虚拟机》
- JVM内存数据区域 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2FJVM%2F1.JVM%25E5%2586%2585%25E5%25AD%2598%25E6%2595%25B0%25E6%258D%25AE%25E5%258C%25BA%25E5%259F%259F.md)
- HotSpot虚拟机对象 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2FJVM%2F2.HotSpot%25E8%2599%259A%25E6%258B%259F%25E6%259C%25BA%25E5%25AF%25B9%25E8%25B1%25A1.md)
- 垃圾收集器与内存分配策略 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2FJVM%2F3.%25E5%259E%2583%25E5%259C%25BE%25E6%2594%25B6%25E9%259B%2586%25E5%2599%25A8%25E4%25B8%258E%25E5%2586%2585%25E5%25AD%2598%25E5%2588%2586%25E9%2585%258D%25E7%25AD%2596%25E7%2595%25A5.md)
- Java字节码(class文件)解读 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2FJVM%2F4.Java%25E5%25AD%2597%25E8%258A%2582%25E7%25A0%2581(class%25E6%2596%2587%25E4%25BB%25B6)%25E8%25A7%25A3%25E8%25AF%25BB.md)
- 字节码指令简介 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2FJVM%2F5.%25E5%25AD%2597%25E8%258A%2582%25E7%25A0%2581%25E6%258C%2587%25E4%25BB%25A4%25E7%25AE%2580%25E4%25BB%258B.md)
- 虚拟机类加载机制 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2FJVM%2F6.%25E8%2599%259A%25E6%258B%259F%25E6%259C%25BA%25E7%25B1%25BB%25E5%258A%25A0%25E8%25BD%25BD%25E6%259C%25BA%25E5%2588%25B6.md)
- 虚拟机字节码执行引擎 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2FJVM%2F7.%25E8%2599%259A%25E6%258B%259F%25E6%259C%25BA%25E5%25AD%2597%25E8%258A%2582%25E7%25A0%2581%25E6%2589%25A7%25E8%25A1%258C%25E5%25BC%2595%25E6%2593%258E.md)
- 前端编译与优化 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2FJVM%2F8.%25E5%2589%258D%25E7%25AB%25AF%25E7%25BC%2596%25E8%25AF%2591%25E4%25B8%258E%25E4%25BC%2598%25E5%258C%2596.md)
- 后端编译与优化 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2FJVM%2F9.%25E5%2590%258E%25E7%25AB%25AF%25E7%25BC%2596%25E8%25AF%2591%25E4%25B8%258E%25E4%25BC%2598%25E5%258C%2596.md)
- Java内存模型与线程 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2FJVM%2F10.Java%25E5%2586%2585%25E5%25AD%2598%25E6%25A8%25A1%25E5%259E%258B%25E4%25B8%258E%25E7%25BA%25BF%25E7%25A8%258B.md)
- 线程安全与锁优化 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FJava%2FJVM%2F11.%25E7%25BA%25BF%25E7%25A8%258B%25E5%25AE%2589%25E5%2585%25A8%25E4%25B8%258E%25E9%2594%2581%25E4%25BC%2598%25E5%258C%2596.md)
- 拉钩教育-《Android 工程师进阶34讲》
- 拉钩教育-《Java 并发编程 78 讲》
#### 3.3 Android

- 《安卓开发艺术探索》
- 死磕Android_View工作原理你需要知道的一切 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E7%25B3%25BB%25E7%25BB%259F%25E6%25BA%2590%25E7%25A0%2581%25E8%25A7%25A3%25E6%259E%2590%2F%25E6%25AD%25BB%25E7%25A3%2595Android_View%25E5%25B7%25A5%25E4%25BD%259C%25E5%258E%259F%25E7%2590%2586%25E4%25BD%25A0%25E9%259C%2580%25E8%25A6%2581%25E7%259F%25A5%25E9%2581%2593%25E7%259A%2584%25E4%25B8%2580%25E5%2588%2587.md)
- 死磕Android_App_启动过程（含_Activity_启动过程） [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E7%25B3%25BB%25E7%25BB%259F%25E6%25BA%2590%25E7%25A0%2581%25E8%25A7%25A3%25E6%259E%2590%2F%25E6%25AD%25BB%25E7%25A3%2595Android_App_%25E5%2590%25AF%25E5%258A%25A8%25E8%25BF%2587%25E7%25A8%258B%25EF%25BC%2588%25E5%2590%25AB_Activity_%25E5%2590%25AF%25E5%258A%25A8%25E8%25BF%2587%25E7%25A8%258B%25EF%25BC%2589.md)
- 死磕Android_Service启动流程分析(一) [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E7%25B3%25BB%25E7%25BB%259F%25E6%25BA%2590%25E7%25A0%2581%25E8%25A7%25A3%25E6%259E%2590%2F%25E6%25AD%25BB%25E7%25A3%2595Android_Service%25E5%2590%25AF%25E5%258A%25A8%25E6%25B5%2581%25E7%25A8%258B%25E5%2588%2586%25E6%259E%2590(%25E4%25B8%2580).md)
- 死磕Android_Service绑定流程分析(二) [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E7%25B3%25BB%25E7%25BB%259F%25E6%25BA%2590%25E7%25A0%2581%25E8%25A7%25A3%25E6%259E%2590%2F%25E6%25AD%25BB%25E7%25A3%2595Android_Service%25E7%25BB%2591%25E5%25AE%259A%25E6%25B5%2581%25E7%25A8%258B%25E5%2588%2586%25E6%259E%2590(%25E4%25BA%258C).md)
- 死磕Android_BroadcastReceiver_工作过程 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E7%25B3%25BB%25E7%25BB%259F%25E6%25BA%2590%25E7%25A0%2581%25E8%25A7%25A3%25E6%259E%2590%2F%25E6%25AD%25BB%25E7%25A3%2595Android_BroadcastReceiver_%25E5%25B7%25A5%25E4%25BD%259C%25E8%25BF%2587%25E7%25A8%258B.md)
- Lifecycle_原理解析 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E7%25B3%25BB%25E7%25BB%259F%25E6%25BA%2590%25E7%25A0%2581%25E8%25A7%25A3%25E6%259E%2590%2FLifecycle_%25E5%258E%259F%25E7%2590%2586%25E8%25A7%25A3%25E6%259E%2590.md)
- ViewModel_使用及原理解析 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E7%25B3%25BB%25E7%25BB%259F%25E6%25BA%2590%25E7%25A0%2581%25E8%25A7%25A3%25E6%259E%2590%2FViewModel_%25E4%25BD%25BF%25E7%2594%25A8%25E5%258F%258A%25E5%258E%259F%25E7%2590%2586%25E8%25A7%25A3%25E6%259E%2590.md)
- Jetpack全家桶 [juejin.cn/post/701364…](https://juejin.cn/post/7013640663824597005)
- 学习Android Jetpack? 实战和教程这里全都有！ [juejin.cn/post/684490…](https://juejin.cn/post/6844903889574051848)
- Lifecycle [juejin.cn/post/689387…](https://juejin.cn/post/6893870636733890574)
- LiveData [juejin.cn/post/690314…](https://juejin.cn/post/6903143273737814029)
- ViewModel [juejin.cn/post/691501…](https://juejin.cn/post/6915012483421831175)
- MVVM [juejin.cn/post/692132…](https://juejin.cn/post/6921321173661777933)
- DataBinding [juejin.cn/post/692385…](https://juejin.cn/post/6923859213403979789)
- Handler机制你需要知道的一切 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E7%25B3%25BB%25E7%25BB%259F%25E6%25BA%2590%25E7%25A0%2581%25E8%25A7%25A3%25E6%259E%2590%2FHandler%25E6%259C%25BA%25E5%2588%25B6%25E4%25BD%25A0%25E9%259C%2580%25E8%25A6%2581%25E7%259F%25A5%25E9%2581%2593%25E7%259A%2584%25E4%25B8%2580%25E5%2588%2587.md)
- 死磕Android_ContentProvider_启动 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E7%25B3%25BB%25E7%25BB%259F%25E6%25BA%2590%25E7%25A0%2581%25E8%25A7%25A3%25E6%259E%2590%2F%25E6%25AD%25BB%25E7%25A3%2595Android_ContentProvider_%25E5%2590%25AF%25E5%258A%25A8.md)
- LiveData_使用及原理解析 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E7%25B3%25BB%25E7%25BB%259F%25E6%25BA%2590%25E7%25A0%2581%25E8%25A7%25A3%25E6%259E%2590%2FLiveData_%25E4%25BD%25BF%25E7%2594%25A8%25E5%258F%258A%25E5%258E%259F%25E7%2590%2586%25E8%25A7%25A3%25E6%259E%2590.md)
- Window,Activity,View三者关系 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E7%25B3%25BB%25E7%25BB%259F%25E6%25BA%2590%25E7%25A0%2581%25E8%25A7%25A3%25E6%259E%2590%2FWindow%2CActivity%2CView%25E4%25B8%2589%25E8%2580%2585%25E5%2585%25B3%25E7%25B3%25BB.md)
- Handler同步屏障 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E7%25B3%25BB%25E7%25BB%259F%25E6%25BA%2590%25E7%25A0%2581%25E8%25A7%25A3%25E6%259E%2590%2FHandler%25E5%2590%258C%25E6%25AD%25A5%25E5%25B1%258F%25E9%259A%259C.md)
- Choreographer原理及应用 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E7%25B3%25BB%25E7%25BB%259F%25E6%25BA%2590%25E7%25A0%2581%25E8%25A7%25A3%25E6%259E%2590%2FChoreographer%25E5%258E%259F%25E7%2590%2586%25E5%258F%258A%25E5%25BA%2594%25E7%2594%25A8.md)
- Handler相关知识点大全 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E7%25B3%25BB%25E7%25BB%259F%25E6%25BA%2590%25E7%25A0%2581%25E8%25A7%25A3%25E6%259E%2590%2FHandler%25E7%259B%25B8%25E5%2585%25B3%25E7%259F%25A5%25E8%25AF%2586%25E7%2582%25B9%25E5%25A4%25A7%25E5%2585%25A8.md)
- LeakCanary 原理探究 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E4%25B8%2589%25E6%2596%25B9%25E5%25BA%2593%25E5%258E%259F%25E7%2590%2586%2FLeakCanary_%25E5%258E%259F%25E7%2590%2586%25E6%258E%25A2%25E7%25A9%25B6.md)
- OkHttp3 原理探究 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E4%25B8%2589%25E6%2596%25B9%25E5%25BA%2593%25E5%258E%259F%25E7%2590%2586%2FOkHttp3_%25E5%258E%259F%25E7%2590%2586%25E6%258E%25A2%25E7%25A9%25B6.md)
- Retrofit 原理解析 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E4%25B8%2589%25E6%2596%25B9%25E5%25BA%2593%25E5%258E%259F%25E7%2590%2586%2FRetrofit_%25E5%258E%259F%25E7%2590%2586%25E8%25A7%25A3%25E6%259E%2590.md)
- Glide主流程源码解析 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E4%25B8%2589%25E6%2596%25B9%25E5%25BA%2593%25E5%258E%259F%25E7%2590%2586%2FGlide%25E4%25B8%25BB%25E6%25B5%2581%25E7%25A8%258B%25E6%25BA%2590%25E7%25A0%2581%25E8%25A7%25A3%25E6%259E%2590.md)
- RxJava3原理解析 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E4%25B8%2589%25E6%2596%25B9%25E5%25BA%2593%25E5%258E%259F%25E7%2590%2586%2FRxJava3%25E5%258E%259F%25E7%2590%2586%25E8%25A7%25A3%25E6%259E%2590.md)
- Android-skin-support 换肤原理详解 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E4%25B8%2589%25E6%2596%25B9%25E5%25BA%2593%25E5%258E%259F%25E7%2590%2586%2FAndroid-skin-support%25E6%258D%25A2%25E8%2582%25A4%25E5%258E%259F%25E7%2590%2586%25E8%25AF%25A6%25E8%25A7%25A3.md)
- 屏幕适配 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E5%25AE%259E%25E6%2588%2598%25E5%25B8%25B8%25E8%25A7%2581%25E9%2597%25AE%25E9%25A2%2598%2F%25E5%25B1%258F%25E5%25B9%2595%25E9%2580%2582%25E9%2585%258D.md)
- 插件化 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E5%25AE%259E%25E6%2588%2598%25E5%25B8%25B8%25E8%25A7%2581%25E9%2597%25AE%25E9%25A2%2598%2F%25E6%258F%2592%25E4%25BB%25B6%25E5%258C%2596.md)
- 热更新 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E5%25AE%259E%25E6%2588%2598%25E5%25B8%25B8%25E8%25A7%2581%25E9%2597%25AE%25E9%25A2%2598%2F%25E7%2583%25AD%25E6%259B%25B4%25E6%2596%25B0.md)
- Gradle系列(一) Groovy 基础 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2FGradle%2FGradle%25E7%25B3%25BB%25E5%2588%2597(%25E4%25B8%2580)_Groovy_%25E5%259F%25BA%25E7%25A1%2580.md)
- Gradle系列(二) Gradle执行顺序和task [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2FGradle%2FGradle%25E7%25B3%25BB%25E5%2588%2597(%25E4%25BA%258C)_Gradle%25E6%2589%25A7%25E8%25A1%258C%25E9%25A1%25BA%25E5%25BA%258F%25E5%2592%258Ctask.md)
- Gradle系列(三) Gradle配置构建和渠道包 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2FGradle%2FGradle%25E7%25B3%25BB%25E5%2588%2597(%25E4%25B8%2589)_Gradle%25E9%2585%258D%25E7%25BD%25AE%25E6%259E%2584%25E5%25BB%25BA%25E5%2592%258C%25E6%25B8%25A0%25E9%2581%2593%25E5%258C%2585.md)
- Gradle系列(四) Gradle插件 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2FGradle%2FGradle%25E7%25B3%25BB%25E5%2588%2597(%25E5%259B%259B)_Gradle%25E6%258F%2592%25E4%25BB%25B6.md)
- Gradle系列 插件练习-动态移除权限 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2FGradle%2FGradle%25E7%25B3%25BB%25E5%2588%2597_%25E6%258F%2592%25E4%25BB%25B6%25E7%25BB%2583%25E4%25B9%25A0-%25E5%258A%25A8%25E6%2580%2581%25E7%25A7%25BB%25E9%2599%25A4%25E6%259D%2583%25E9%2599%2590.md)
- 手把手教大家用Transform API和ASM实现一个防快速点击案例 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2FGradle%2F%25E6%2589%258B%25E6%258A%258A%25E6%2589%258B%25E6%2595%2599%25E5%25A4%25A7%25E5%25AE%25B6%25E7%2594%25A8Transform_API%25E5%2592%258CASM%25E5%25AE%259E%25E7%258E%25B0%25E4%25B8%2580%25E4%25B8%25AA%25E9%2598%25B2%25E5%25BF%25AB%25E9%2580%259F%25E7%2582%25B9%25E5%2587%25BB%25E6%25A1%2588%25E4%25BE%258B.md)
- Android进程间通信: 深入浅出AIDL [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E5%25A4%259A%25E8%25BF%259B%25E7%25A8%258B%2FAIDL%25E8%25AF%25A6%25E8%25A7%25A3.md)
- Android进程间通信: Messenger详解 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E5%25A4%259A%25E8%25BF%259B%25E7%25A8%258B%2FMessenger%25E8%25AF%25A6%25E8%25A7%25A3.md)
- Android进程间通信: Binder详解 [github.com/xfhy/Androi…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxfhy%2FAndroid-Notes%2Fblob%2Fmaster%2FBlogs%2FAndroid%2F%25E5%25A4%259A%25E8%25BF%259B%25E7%25A8%258B%2FBinder%25E8%25AF%25A6%25E8%25A7%25A3.md)
- 硬核！Android 应用启动全流程深度剖析！（进程创建+消息机制+Activity组件管理+Application和Activity初始化+UI布局与绘制+RenderThread渲染+SurfaceFlinger合成） [mp.weixin.qq.com/s/b6-leHKQZ…](https://link.juejin.cn?target=https%3A%2F%2Fmp.weixin.qq.com%2Fs%2Fb6-leHKQZkuxkjll-1109A)
- Choreographer原理及应用 [blog.csdn.net/xfhy_/artic…](https://link.juejin.cn?target=https%3A%2F%2Fblog.csdn.net%2Fxfhy_%2Farticle%2Fdetails%2F115436765%3Fspm%3D1001.2014.3001.5502)
- 终于懂了，屏幕刷新 [juejin.cn/post/686375…](https://juejin.cn/post/6863756420380196877)
- View工作原理 [juejin.cn/post/685457…](https://juejin.cn/post/6854573212374663182)
- 编译基础 [juejin.cn/post/684490…](https://juejin.cn/post/6844904106545414157)
- Android插件化原理（一）Activity插件化 [juejin.cn/post/684490…](https://juejin.cn/post/6844903613865672718)
- ClassLoader [liuwangshu.cn/tags/ClassL…](https://link.juejin.cn?target=http%3A%2F%2Fliuwangshu.cn%2Ftags%2FClassLoader%2F)
- hencoder全部Kotlin部分 [rengwuxian.com/tag/kotlin/](https://link.juejin.cn?target=https%3A%2F%2Frengwuxian.com%2Ftag%2Fkotlin%2F)
- hencoder全部自定义View部分 [rengwuxian.com/tag/custom-…](https://link.juejin.cn?target=https%3A%2F%2Frengwuxian.com%2Ftag%2Fcustom-view%2F)
- 协程原理 [juejin.cn/post/686254…](https://juejin.cn/post/6862548590092140558)
- flow [juejin.cn/post/691480…](https://juejin.cn/post/6914802148614242312)
- 反思｜官方也无力回天？Android SharedPreferences的设计与实现 [juejin.cn/post/688450…](https://juejin.cn/post/6884505736836022280)
- ActivityThread的理解 [blog.csdn.net/hzwailll/ar…](https://link.juejin.cn?target=https%3A%2F%2Fblog.csdn.net%2Fhzwailll%2Farticle%2Fdetails%2F85339714)
- 了解AMS [liuwangshu.cn/tags/Activi…](https://link.juejin.cn?target=http%3A%2F%2Fliuwangshu.cn%2Ftags%2FActivityManagerService%2F)
- Android Gradle 自定义Task 详解 [blog.csdn.net/zhaoyanjun6…](https://link.juejin.cn?target=https%3A%2F%2Fblog.csdn.net%2Fzhaoyanjun6%2Farticle%2Fdetails%2F76408024)
- 编译打包流程 [juejin.cn/post/684490…](https://juejin.cn/post/6844904106545414157)
- Android Gradle 看这一篇就够了 [juejin.cn/post/684490…](https://juejin.cn/post/6844903446814916621#comment)
### 4. 技术面试真题
只记录了部分公司和部分题目，有时候面试完忘记记录了，后面就想不起来了。
公司1：

- 包体积优化
- handler原理
- 如何退出app
- synchronized和lock
- 鸿蒙了解过吗
- flutter了解过吗，compose呢
- 跨进程通信，线程通信
- 组件化是怎么做的
- 做过的项目，主要负责什么
- 担任的角色
- 最难的是什么？怎么解决的
- 开发流程是怎么样的？有做设计文档吗？
- 职业规划，为什么做安卓？鸿蒙有了解吗？
- 平时怎么学习的？最近学了什么？给工作带来了哪些好处？
- 看过哪些技术书籍
- 平时有什么爱好
- 对你想要去的公司团队有什么要求？或者说你想去什么氛围的项目组？

公司2：

- sleep和wait区别
- mvp
- 组件化
- livedata，viewmodel原理
- 内存优化
- 启动优化
- leakcanary原理
- 换肤原理
- 怎么hook ams

公司3：

- volatile、synchronized、原子类的原理
- 数据库优化是怎么做的
- 性能优化
- kotlin伴生对象和init
- 斐波拉契序列
- 反转链表

公司4：

- fragment生命周期
- 屏幕刷新机制
- binder理解
- bindService校验: 权限，包名
- https的原理
- 响应式编程
- 热修复:class和资源
- invalidate 和 postInvalidate区别
- handler原理，sendMessageDelayed是怎么实现的，为什么不卡主线程，底层是如何通知进程这边恢复阻塞的
- java掌握到什么程度了，kotlin呢？android呢？
- 响应式编程
- 看过哪些书？推荐一本你觉得不错的书，为什么不错
- android最近这2年值得关注的框架
- 敏捷开发模式
- 你给你自己的水平打分，计划怎么完善和精进自己的技术栈

公司5：

- app启动过程+activity启动过程，activity启动过程中的launchmode的原理
- handler
- java 方法重载问题，泛型相关
- 卡顿优化，冷启动优化，线上监控方式
- 慢函数线上监控

公司6：

- 3个线程如何依次执行
- 设计一个图片加载库，lrucache原理，linkedhashmap实现
- lifecycle,viewmodel原理
- view事件分发

公司7：

- gc roots
- JVM垃圾回收算法，Android虚拟机垃圾回收算法
- 分代回收思想
- Java类加载机制
- 线程池有几种，分别是什么特征，自定义线程池需要注意什么，核心线程数是多少
- hashmap原理（红黑树会退成链表吗？什么情况下？），ConcurrentHashMap原理，Hashtable原理
- StringBuilder和StringBuffer原理
- 反射原理及其优缺点
- 泛型拿来做什么的
- synchronized用法及原理，1.6做了哪些优化，Mark word
- 常用的三方库原理，随便挑一个说
- 换肤原理
- 动画有哪几种，属性动画原理,vsync
- View绘制流程
- 短时间内多次调用requestLayout，哪些View会重绘
- 冷启动优化
- 包体积优化
- 插件化原理，startActivity
- mvc,mvp,mvvm
- requestLayout流程
- 算法1：反转单词
- 算法2：环形链表求环入口节点，不准用快慢指针，O(1)空间复杂度，O(n)时间复杂度，可修改链表节点的指针和数据。不能在链表节点中新增属性

公司8：

- 说一下项目的架构，哪一块是你主要负责的？说一下是怎么设计的
- livedata原理
- handler原理
- 组件化传递大数据
- 单例里面的数据线程安全
- 内存优化，卡顿优化，冷启动优化
- 怎么检测已发生了内存泄露的对象？不知道那个对象是谁
- 协程和RxJava原理，区别

公司9：

- view绘制流程
- 事件分发流程，外部拦截法，内部拦截法
- Kotlin协程，协程原理，怎么开协程，怎么切线程
- viewpager内部view高度不一致，怎么解决
- startActivity流程
- 启动优化，包体积优化
- livedata原理
- gradle 马甲包
- 换肤原理
- 协程状态机
- let和also区别
- mvvm
### 5. HR面
一般HR面就比较轻松了，不会涉及什么高难度的问题。一般就问问你为什么离职、住哪里、有对象吗、结婚了吗、有小孩吗、小孩多大了、买房了吗、哪里人，然后HR还会介绍公司的情况、产品、公司规划、福利之类的。下面这些是我在网络上搜集的一些比较重要的问题，需要详细向HR了解清楚。
每个问题都很重要，必问

- 工资是*12 ？
- 有年终吗？
- 五险一金是全额？多少比例？
- 加班有钱？
- 晋升制度，涨薪制度
- 年假？
- 绩效考评是怎么样的？
- 午休时间，上下班时间
- 双休？
- 试用期多久？转正标准
- 工作强度
### 6. 其他注意事项

- 技术复盘：在每轮技术面试完成后，肯定是有些问题回答得不好的，或者是没有答上来的，回去之后需要及时整理并复习，最好是能用自己的话复述一下这个问题。
- 提前了解好要去面试的公司的产品、方向
- 提前了解好当前公司办理离职需要多久
- 社保和公积金不能断
- 尽量远程面试，避免耽搁现在的工作
### 7. 最后
现在正值金三银四招聘旺季，祝正在求职的伙伴都能找到自己喜欢的工作。



