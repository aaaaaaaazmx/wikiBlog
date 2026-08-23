---
title: "Android混淆原理"
published: 2020-01-21
description: "Android混淆原理"
tags: ["Android","进阶"]
category: "android进阶"
draft: false
slug: "android-adv-007"
---

# Android混淆原理

Java 是一种跨平台、解释型语言，Java 源代码编译成的class文件中有大量包含语义的变量名、方法名的信息，很容易被反编译为Java 源代码。为了防止这种现象，我们可以对Java字节码进行混淆。混淆不仅能将代码中的类名、字段、方法名变为无意义的名称，保护代码，也由于移除无用的类、方法，并使用简短名称对类、字段、方法进行重命名缩小了程序的size。

ProGuard由shrink、optimize、obfuscate和preverify四个步骤组成，每个步骤都是可选的，需要哪些步骤都可以在脚本中配置。  参见ProGuard官方介绍。

- 压缩(Shrink): 侦测并移除代码中无用的类、字段、方法、和特性(Attribute)。
- 优化(Optimize): 分析和优化字节码。
- 混淆(Obfuscate): 使用a、b、c、d这样简短而无意义的名称，对类、字段和方法进行重命名。
上面三个步骤使代码size更小，更高效，也更难被逆向工程。

- 预检(Preveirfy):  在java平台上对处理后的代码进行预检。

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/LrDMVD5bqLWU3NG9ghOdpQnBk2ibUK4S2YkBxJoJftsOSMNtQoUiaKfy0UmpLobyzeCcHkjiazWNwAtE8fuegF6SQ/640?wx_fmt=jpeg)


Proguard读入input jars(or wars,zips or directories)，经过四个步骤生成处理之后的jars(or wars,ears,zips or directories),Optimization步骤可选择多次进行。

为了确定哪些代码应该被保留，哪些代码应该被移除或混淆，需要确定一个或多个Entry Point。Entry Point经常是带有main methods,applets,midlets的classes,它们在混淆过程中会被保留。我们来看一下Proguard的几个步骤如何处理Entry Points。  

在压缩阶段，Proguard从上述Entry Points开始遍历搜索哪些类和类成员被使用。其他没有被使用的类和类成员会移除。
在优化阶段，Proguard进一步设置非Entry Point的类和方法为private、static和final来进行优化，不使用的参数会被移除，某些方法会被标记被内联。
在混淆阶段，Proguard重命名非Entry Points的类和类成员。
预检阶段是唯一没有触及Entry Points的阶段。


# 更多参考
- https://cloud.tencent.com/developer/article/1071753