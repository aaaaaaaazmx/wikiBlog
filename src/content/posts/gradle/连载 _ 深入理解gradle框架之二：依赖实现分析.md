---
title: "连载 _ 深入理解gradle框架之二：依赖实现分析"
published: 2021-06-15
description: "连载 _ 深入理解gradle框架之二：依赖实现分析"
tags: ["Gradle","构建工具"]
category: "gradle"
draft: false
slug: "gradle-013"
---

## **0.引言**
大家在日常开发中，见过最多的可能就是下面3种依赖声明:

- implementation “org.jetbrains.kotlin:kotlin-stdlib-jdk7:$kotlin_version”

- implementation project(":applemodule")

- implementation fileTree(dir:‘libs’, include:[’*.jar’])


业务复杂一点的，可能会涉及类似下面这种:

- implementation project(path: ‘:applemdoule’)

- implementation project(path: ‘:applemodule’, configuration: ‘configA’)


那这些不同的依赖声明，到底有何不同呢？
以及它们内部的机制是怎样的？

## **1. 从implemenation说起**
像如下代码是如何起作用的呢？
![](https://cdn.nlark.com/yuque/0/2019/png/215777/1575989352134-c4c59ac3-8b6a-4fab-bff6-c6c30649214b.png)
按照groovy的语法，这里要执行的是DependencyHandler的implementation()方法，参数则为’com.android.support:appcompat-v7:25.1.0’.
可是我们可以看到，DependencyHandler中并没有implementation()这个方法，那么这是怎么回事呢？
### **1.1 MethodMissing**
这其实涉及到groovy语言的一个重要特性: methodMissing, 这个特性允许在运行时catch对于未定义方法的调用。
gradle对这个特性进行了封装，一个类要想使用这个特性，只要实现MixIn接口即可，这个接口如下:
![](https://cdn.nlark.com/yuque/0/2019/png/215777/1575989352149-ec9c9dd9-fefd-4ee1-9109-9bb3bf3dbdef.png)
其中MethodAccess接口如下:
![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575989352128-4ceaaf6c-df9e-4e3b-b46a-7dbea1391ba9.jpeg)
也就是说，对于DependeancyHandler中未定义的方法(如implementation()方法),只要hasMeethod()返回true, 就 最终会调用到MethodAccess的实现者的tryInvokeMethod()方法中，其中name为configuration名称，argusments就是’com.android.support:appcompat-v7:25.1.0’这个参数。
那DependencyHandler接口的实现者DefaultDependencyHandler是如何实现MethodMixIn这个接口的呢?
![](https://cdn.nlark.com/yuque/0/2019/png/215777/1575989352150-e55b243e-e520-404a-bce2-2b0ba321f658.png)
非常简单，就是直接返回dynamicMethods这个成员，而dynamicMethods的赋值在DefaultDependencyHandler的构造方法中，如下:
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWkpfu3WMQgPVqETicpibhdVWbhic6OUfGMD2NVuqlLFmFmjVSIAGeJJVP9HqsFKszIg8mahsn9MWS6A/640?wx_fmt=png&amp;from=appmsg)
而DynamicAddDependencyMethods类定义如下:
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWkpfu3WMQgPVqETicpibhdVW0utBHjK1XQxvRbuVIiaqOCtV9ETdAoE8XfiaSPqTNeJnf92xZ7LfnHBQ/640?wx_fmt=png&amp;from=appmsg)
注意到它是实现了MethodAccess这个接口的，首先看它的hasMethod()方法，很简单，返回true的条件是:

- 参数长度不为0

- configuration必须是已经定义过的


然后再看tryInvokeMethod(), 它会先通过configurationsContainer找到对应的configuration, 然后分如下几种情况:

- 参数个数为2，并且第2个参数是Closure

- 参数个数为1

- 其他情形


不过不管哪种情形，都会先调用dependencyAdder的add()方法，而dependencyAdder是DefaultDependencyHandler.DirectDependencyAdder对象，其add()方法如下:
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWkpfu3WMQgPVqETicpibhdVWj0rkrianIEzXkjpzhicgy8kKOwNbqsn9s8t6PsPLpw33gLCbQLVPdc5g/640?wx_fmt=png&from=appmsg)
可见，其实是调用外部类DefaultDependencyHandler的doAdd()方法，在下一小节分析该方法。
### **1.2 DefaultDependencyHandler.doAdd()方法分析**
doAdd()方法如下:
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWkpfu3WMQgPVqETicpibhdVWwItTQk6f3OqRfjX8crAnqhrFCibtWQXfxHmWaAsfqYMY5S36tb7PcUw/640?wx_fmt=png&amp;from=appmsg)
可见，这里会先判断dependencyNotation是否为Configuration, 如果是的话，就让当前的configuration继承自other这个configuration,而继承的意思就是，后续所有添加到other的依赖，也会添加到当前这个configuration中。
为什么还要考虑参数中的dependencyNotation是否为Configuration的情形呢？
其实就是考虑到有诸如implementation project(path: ‘:applemodule’, configuration: ‘configA’)这样的依赖声明。
至于依赖的创建过程，在下一节进行分析。

## **2.依赖创建过程分析**
DefaultDependencyHandler的create()方法如下:
![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575989352155-8479b486-4675-4889-8e36-1d3336cd2868.jpeg)
其中的dependencyFactory为DefaultDependencyFactory对象，其createDependency()方法如下:
![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575989352135-9fb566a8-7e97-486e-98c7-0428afc55ad0.jpeg)
可见，它是直接调用dependencyNotationParser这个解析器对于dependencyNotation进行解析。
其中的dependencyNotationParser是实现了接口NotationParser<Object, Dependency>接口的对象。
为了找出这里的dependencyNotationParser到底是哪个类的实例，查看DefaultDependencyFactory的创建，如下:
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWkpfu3WMQgPVqETicpibhdVWlh3XrrMPehy1DK12JW2C7QiafdC7lL1DQCBcGrThtzRshX1iba0ylMiag/640?wx_fmt=png&amp;from=appmsg)
可见，它是通过DependencyNotationParser.parser()方法创建的，该方法如下:
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWkpfu3WMQgPVqETicpibhdVWC9MUfcTIMYFLXuYrt3JCUzG2voeODoU7tJ0Y5feP4kWfFpfKIT49kg/640?wx_fmt=png&amp;from=appmsg)
这个方法其实很好理解，它其实是创建了多个实现了接口NotationConverter的对象，然后将这些转换器都添加在一起，构成一个综合的转换器。
其中，
**DependencyStringNotationConverter负责将字符串类型的notation转换为DefaultExternalModuleDependency，也就是对应implementation 'com.android.support:appcompat-v7:25.1.0’这样的声明;**
**DependencyFilesNotationConverter将FileCollection转换为SelfResolvingDependency,也就是对应implementation fileTree(dir:‘libs’, include:[’*.jar’])这样的声明;**
**DependencyProjectNotationConverter将Project转换为ProjectDependency, 对应implementation project(":applemodule")这样的情形;**
**DependencyClasspathNotationConverter将ClasspathNotation转换为SelfResolvingDependency;**
到这里，就知道类似compile ‘com.android.support:appcompat-v7:25.1.0’，implementation project(’:applemodule’)这样的声明，其实是被不同的转换器，转换成了SelfResolvingDependency或者ProjectDependency.
这里可以看出，除了project依赖之外，其他都转换成SelfResolvingDependency, 所谓的SelfResolvingDependency其实是可以自解析的依赖，独立于repository.
ProjectDependency则不然，它与依赖于repository的，下面就分析ProjectDependency的独特之处。

## **3.DependencyHandler的project()方法分析**
### **3.1 ProjectDependency的创建过程**
DependencyHandler.project()方法是为了添加project依赖，而DefaultDependencyHandler.project()方法如下:
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWkpfu3WMQgPVqETicpibhdVW6owlnHBp1w3rAsPAaSTzMUiaiaVcYdwzMGw8U6BMV4x5uMd4KS5DGaSg/640?wx_fmt=png&from=appmsg)
其中dependencyFactory为DefaultDependencyFactory对象，其createProjectDependencyFromMap()方法如下:
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWkpfu3WMQgPVqETicpibhdVWIWicoKicDiaOMzLR5j46G1Cp58H36dfbmwcR5mUicY7Bx8Po63um0Nv9Wg/640?wx_fmt=png&from=appmsg)
其中的projectDependencyFactory为ProjectDependencyFactory对象，其createFromMap()方法如下:
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWkpfu3WMQgPVqETicpibhdVW0o68rO0KNKUVD9VwBYXd8oNhQh1YENkyLvGIZOhGpShrDbth0pjShA/640?wx_fmt=png&from=appmsg)
可见，它其实是依靠ProjectDependencyMapNotationConverter这个转换器实现将project转换为ProjectDependency的，而ProjectDependencyMapNotationConverter的定义非常简单:
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWkpfu3WMQgPVqETicpibhdVWqSuLlb5gtATOiaYjchlGCgpIia3OYzZNjSHdoLVB7oRX2ctes71v94uw/640?wx_fmt=png&amp;from=appmsg)
显然，就是先通过projectFinder找到相应的Project, 然后通过factory创建ProjectDependency
显然，就是根据传入的project和configuration名称，创建DefaultProjectDependency对象。
### **3.2 project依赖到底是如何体现的**
其实与configuration息息相关。

TaskDependencyImpl是一个内部类，其定义如下:
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWkpfu3WMQgPVqETicpibhdVWZXfwC0falxA3ROqUcn33Isic7dKCicv1b6tPCiaqnQjhCibrCowcLr7gFg/640?wx_fmt=png&amp;from=appmsg)
其中findProjectConfiguration()方法如下:
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWkpfu3WMQgPVqETicpibhdVWlM6ib8ulT4fhwJCUK8SE8crcJ9p7lHRB6dCI8slgeFDDQNQMA1UsWsw/640?wx_fmt=png&amp;from=appmsg)
这个方法的含义是，如果依赖project时指定了configuration(比如implementation project(":applemodule")时的implementation), 那就获取implementation这个configuration, 如果没用，那就使用default这个configuration.
再回到TaskDependencyImpl类中，注意如下两个调用:
![](https://cdn.nlark.com/yuque/0/2019/png/215777/1575989352172-2e6771be-199a-4acb-a89d-06da9d8b8fed.png)
这两个语句的真实含义如下:
1. configuration实现了FileCollection接口，而FileCollection继承自Buildable, 所以context.add(configuration);是将其作为一个Buildable对象添加进去。其中configuration是DefaultConfiguration对象，它实现了getBuildDependencies()方法，如下:
![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575989352195-ed316c63-5b9f-43c8-9a3e-cf0632324718.jpeg)
2. context.add(configuration.getAllArtifacts());这个，则是因为configuration.getAllArtifacts()获得的是DefaultPublishArtifactSet对象，而DefaultPublishArtifactSet也实现了Buildable接口，其getBuildDependencies()方法如下:
![](https://cdn.nlark.com/yuque/0/2019/png/215777/1575989352195-f12caba7-d7bb-4378-864f-d28357bae429.png)
其中的builtBy是内部类ArtifactsTaskDependency对象，而ArtifactsTaskDependency定义如下:
![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575989352192-d962e252-3003-453b-ad67-e665a1888181.jpeg)
可见，这里是直接将PublishArtifact对象添加到context中，而PublishArtifact中含有编译依赖。
关于artifacts以及PublishArtifact的知识点，会在第3篇中进行详细分析，敬请期待。

## **4.总结**
经过本文的分析，可得出如下结论:

- **DependencyHandler**是没有implementation(), api(), compile()这些方法的，是**通过MethodMissing机制**，间接地调用DependencyHandler的实现DefaultDependencyHandler的add()方法将依赖添加进去的；

- 如果dependencyNotation中含有configuration(如configA)，则让当前的configuration(如configB)继承这个configuration, 意思就是后续所有添加到configA的依赖，都会添加到configB中；

- 不同的依赖声明，其实是由不同的转换器进行转换的，比如DependencyStringNotationConverter负责将类似"org.jetbrains.kotlin:kotlin-stdlib-jdk7:$kotlin_version"这样的依赖声明转换为依赖，DependencyProjectNotationConverter负责将project(":applemodule")这样的依赖声明转换为依赖；

- 除了project依赖之外，其他的依赖最终都转换为SelfResolvingDependency, 即可自解析的依赖；

- project依赖的本质是artifacts依赖。




