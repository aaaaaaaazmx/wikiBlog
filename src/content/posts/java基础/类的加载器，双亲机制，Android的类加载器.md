---
title: "类的加载器，双亲机制，Android的类加载器"
published: 2022-11-11
description: "类的加载器，双亲机制，Android的类加载器"
tags: ["Java","基础"]
category: "java基础"
draft: false
slug: "java-basic-066"
---

# 类的加载器，双亲机制，Android的类加载器

## 类的加载器，双亲机制，Android的类加载器。

- 类的生命周期：1.加载；2.验证；3.准备；4.解析；5.初始化；6.使用；7.卸载
- 类加载过程：1.加载：获取类的二进制字节流；生成方法区的运行时存储结构；在内存中生成 Class 对象 2.验证：确保该 Class 字节流符合虚拟机要求 3.准备：初始化静态变量 4.解析：将常量池的符号引用替换为直接引用 5.初始化：执行静态块代码、类变量赋值
- 类加载时机：1.实例化对象 2.调用类的静态方法 3.调用类的静态变量（放入常量池的常量除外）
- 类加载器：负责加载 class 文件 1.引导类加载器 - 没有父类加载器 2.拓展类加载器 - 继承自引导类加载器 3.系统类加载器 - 继承自拓展类加载器
- 双亲委托模型：
    - 当要加载一个 class 时，会先逐层向上让父加载器先加载，加载失败才会自己加载
    - 为什么叫双亲？不考虑自定义加载器，系统类加载器需要网上询问两层，所以叫双亲
    - 判断是否是同一个类时，除了类信息，还必须时同一个类加载器
    - 优点：防止重复加载，父加载器加载过了就没必要加载了；安全，防止篡改核心库类


## 类的加载器

大家都知道，一个Java程序都是由若干个.class文件组织而成的一个完整的Java应用程序，当程序在运行时，即会调用该程序的一个入口函数来调用系统的相关功能，而这些功能都被封装在不同的class文件当中，所以经常要从这个class文件中要调用另外一个class文件中的方法，如果另外一个文件不存在的话，则会引发系统异常。
    
而程序在启动的时候，并不会一次性加载程序所要用到的class文件，而是根据程序的需要，通过Java的类加载制（ClassLoader）来动态加载某个class文件到内存当的，从而只有class文件被载入到了内存之后，才能被其它class文件所引用。所以ClassLoader就是用来动态加载class件到内存当中用的。

## 双亲机制

类的加载就是虚拟机通过一个类的全限定名来获取描述此类的二进制字节流，而完成这个加载动作的就是类加载器。

类和类加载器息息相关，判定两个类是否相等，只有在这两个类被同一个类加载器加载的情况下才有意义，否则即便是两个类来自同一个Class文件，被不同类加载器加载，它们也是不相等的。

> 注：这里的相等性保函Class对象的equals()方法、isAssignableFrom()方法、isInstance()方法的返回结果以及Instance关键字对对象所属关系的判定结果等。

**类加载器可以分为三类：**

- 启动类加载器（Bootstrap ClassLoader）：负责加载<JAVA_HOME>\lib目录下或者被-Xbootclasspath参数所指定的路径的，并且是被虚拟机所识别的库到内存中。

- 扩展类加载器（Extension ClassLoader）：负责加载<JAVA_HOME>\lib\ext目录下或者被java.ext.dirs系统变量所指定的路径的所有类库到内存中。

- 应用类加载器（Application ClassLoader）：负责加载用户类路径上的指定类库，如果应用程序中没有实现自己的类加载器，一般就是这个类加载器去加载应用程序中的类库。

1. 原理介绍

ClassLoader使用的是双亲委托模型来搜索类的，每个ClassLoader实例都有一个父类加载器的引用（不是继承的关系，是一个包含的关系），虚拟机内置的类加载器（Bootstrap ClassLoader）本身没有父类加载器，但可以用作其它lassLoader实例的的父类加载器。

当一个ClassLoader实例需要加载某个类时，它会在试图搜索某个类之前，先把这个任务委托给它的父类加载器，这个过程是由上至下依次检查的，首先由最顶层的类加载器Bootstrap ClassLoader试图加载，如果没加载到，则把任务转交给Extension ClassLoader试图加载，如果也没加载到，则转交给App ClassLoader 进行加载，如果它也没有加载得到的话，则返回给委托的发起者，由它到指定的文件系统或网络等待URL中加载该类。
    
如果它们都没有加载到这个类时，则抛出ClassNotFoundException异常。否则将这个找到的类生成一个类的定义，将它加载到内存当中，最后返回这个类在内存中的Class实例对象。

**类加载机制：**

类的加载指的是将类的.class文件中的二进制数据读入到内存中，将其放在运行时数据区的方法去内，然后在堆区创建一个java.lang.Class对象，用来封装在方法区内的数据结构。类的加载最终是在堆区内的Class对象，Class对象封装了类在方法区内的数据结构，并且向Java程序员提供了访问方法区内的数据结构的接口。

**类加载有三种方式：**

1）命令行启动应用时候由JVM初始化加载

2）通过Class.forName（）方法动态加载

3）通过ClassLoader.loadClass（）方法动态加载

这么多类加载器，那么当类在加载的时候会使用哪个加载器呢？

这个时候就要提到类加载器的双亲委派模型，流程图如下所示：

![image](https://mmbiz.qpic.cn/mmbiz_jpg/LrDMVD5bqLWU3NG9ghOdpQnBk2ibUK4S2LjfzpR0uGdXicvgvHXP0NRZckLBH163ofZLPAZ2d3CftKBdBq2SfR7Q/640?wx_fmt=jpeg)

双亲委派模型的整个工作流程非常的简单，如下所示：

如果一个类加载器收到了加载类的请求，它不会自己立去加载类，它会先去请求父类加载器，每个层次的类加器都是如此。层层传递，直到传递到最高层的类加载器只有当 父类加载器反馈自己无法加载这个类，才会有当子类加载器去加载该类。

2. 为什么要使用双亲委托这种模型呢？

因为这样可以避免重复加载，当父亲已经加载了该类的时候，就没有必要让子ClassLoader再加载一次。

考虑到安全因素，我们试想一下，如果不使用这种委托模式，那我们就可以随时使用自定义的String来动态替代java核心api中定义的类型，这样会存在非常大的安全隐患，而双亲委托的方式，就可以避免这种情况，因为String已经在启动时就被引导类加载器（BootstrcpClassLoader）加载，所以用户自定义的ClassLoader永远也无法加载一个自己写的String，除非你改变JDK中ClassLoader搜索类的默认算法。

3. 但是JVM在搜索类的时候，又是如何判定两个class是相同的呢？

JVM在判定两个class是否相同时，不仅要判断两个类名否相同，而且要判断是否由同一个类加载器实例加载的。
    
只有两者同时满足的情况下，JVM才认为这两个class是相同的。就算两个class是同一份class字节码，如果被两个不同的ClassLoader实例所加载，JVM也会认为它们是两个不同class。
    
比如网络上的一个Java类org.classloader.simple.NetClassLoaderSimple，javac编译之后生成字节码文件NetClasLoaderSimple.class，ClassLoaderA和ClassLoaderB这个类加载器并读取了NetClassLoaderSimple.class文件并分别定义出了java.lang.Class实例来表示这个类，对JVM来说，它们是两个不同的实例对象，但它们确实是一份字节码文件，如果试图将这个Class实例生成具体的对象进行转换时，就会抛运行时异常java.lang.ClassCastException，提示这是两个不同的类型。

## Android类加载器

对于Android而言，最终的apk文件包含的是dex类型的文件，dex文件是将class文件重新打包，打包的规则又不是简单地压缩，而是完全对class文件内部的各种函数表进行优化，产生一个新的文件，即dex文件。因此加载某种特殊的Class文件就需要特殊的类加载器DexClassLoader。

可以动态加载Jar通过URLClassLoader

1.ClassLoader 隔离问题：JVM识别一个类是由 ClassLoaderid + PackageName + ClassName。

2.加载不同Jar包中的公共类：

- 让父ClassLoader加载公共的Jar，子ClassLoade加载包含公共Jar的Jar，此时子ClassLoader在加载Jar的时候会先去父ClassLoader中找。(只适用Java)
- 重写加载包含公共Jar的Jar的ClassLoader，在loClass中找到已经加载过公共Jar的ClassLoader，是把父ClassLoader替换掉。(只适用Java)
- 在生成包含公共Jar的Jar时候把公共Jar去掉。
