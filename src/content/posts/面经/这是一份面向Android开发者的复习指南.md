---
title: "这是一份面向Android开发者的复习指南"
published: 2025-06-21
description: "这是一份面向Android开发者的复习指南"
tags: ["面试","面经"]
category: "面经"
draft: false
slug: "interview-013"
---

链接：https://juejin.cn/post/6844904138019438605

> **进技术交流群，添加微信：uestc_xsf，(备注加群)，不定期分享学习资料，前进路上不孤单**

## 前言
相信很多同学都会有这样的感受，前三天刚刚复习的知识点，今天问的时候怎么就讲不出个所以然了呢？
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116306527-102cad32-aeb0-47b6-a003-3a58f72f674f.webp)

本文的目的就是致力于帮助大家尽可能的建立Android知识体系，希望大家会喜欢~
## 必读
#### 知识结构
覆盖的知识点有Android、Java、Kotlin、Jvm、网络和设计模式。
#### 面向人群
正在求职的中高级Android开发
#### 食用指南
和大部分人一样，我在复习完第一遍Android知识的情况下，看到相关的知识回答的仍然不能够令自己满意。
在第二遍系统复习的时候，我**着重记住每个知识点的关键字，根据这些关键字拼凑出大概的知识点**，最后看到每个知识点的时候，就知道大概会问哪些内容，达到这种境界以后，你就可以从容的面对每次面试了。
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116306552-f65357ba-f007-4bbc-a4a0-7e0d6e347263.webp)

简单的做法就是为每个知识点建立脑图，尽可能把自己想到的关键点罗列出来，也就是下面每个章节前面的脑图。
除此以外，我还为大家提供了可能会问到的面试题。
## 一、Android基础
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116306555-7d4350d5-eed6-40a9-9b83-45b7b581aded.webp)

Android基础知识点比较多，看图。
_建议阅读：_
《Android开发艺术探索》
### 1. Activity
#### # Activity的四大启动模式，以及应用场景？
Activity的四大启动模式：

- standard：标准模式，每次都会在活动栈中生成一个新的Activity实例。通常我们使用的活动都是标准模式。
- singleTop：栈顶复用，如果Activity实例已经存在栈顶，那么就不会在活动栈中创建新的实例。比较常见的场景就是给通知跳转的Activity设置，因为你肯定不想前台Activity已经是该Activity的情况下，点击通知，又给你再创建一个同样的Activity。
- singleTask：栈内复用，如果Activity实例在当前栈中已经存在，就会将当前Activity实例上面的其他Activity实例都移除栈。常见于跳转到主界面。
- singleInstance：单实例模式，创建一个新的任务栈，这个活动实例独自处在这个活动栈中。
#### # Activity中onStart和onResume的区别？onPause和onStop的区别？
首先，Activity有三类：

- 前台Activity：活跃的Activity，正在和用户交互的Activity。
- 可见但非前台的Activity：常见于栈顶的Activity背景透明，处在其下面的Activity就是可见但是不可和用户交互。
- 后台Activity：已经被暂停的Activity，比如已经执行了onStop方法。

所以，onStart和onStop通常指的是当前活动是否位于前台这个角度，而onResume和onPause从是否可见这个角度来讲的。
### 2. 屏幕适配
#### # 平时如何有使用屏幕适配吗？原理是什么呢？
平时的屏幕适配一般采用的头条的屏幕适配方案。简单来说，以屏幕的一边作为适配，通常是宽。
原理：设备像素px和设备独立像素dp之间的关系是
```
ini
 px = dp * density
```
假设UI给的设计图屏幕宽度基于360dp，那么设备宽的像素点已知，即px，dp也已知，360dp，所以density = px / dp，之后根据这个修改系统中跟density相关的知识点即可。
### 3. Android消息机制
#### # Android消息机制介绍？
Android消息机制中的四大概念：

- ThreadLocal：当前线程存储的数据仅能从当前线程取出。
- MessageQueue：具有时间优先级的消息队列。
- Looper：轮询消息队列，看是否有新的消息到来。
- Handler：具体处理逻辑的地方。

过程：

1. 准备工作：创建Handler，如果是在子线程中创建，还需要调用Looper#prepare()，在Handler的构造函数中，会绑定其中的Looper和MessageQueue。
2. 发送消息：创建消息，使用Handler发送。
3. 进入MessageQueue：因为Handler中绑定着消息队列，所以Message很自然的被放进消息队列。
4. Looper轮询消息队列：Looper是一个死循环，一直观察有没有新的消息到来，之后从Message取出绑定的Handler，最后调用Handler中的处理逻辑，这一切都发生在Looper循环的线程，这也是Handler能够在指定线程处理任务的原因。
#### # Looper在主线程中死循环为什么没有导致界面的卡死？

1. 导致卡死的是在Ui线程中执行耗时操作导致界面出现掉帧，甚至ANR，Looper.loop()这个操作本身不会导致这个情况。
2. 有人可能会说，我在点击事件中设置死循环会导致界面卡死，同样都是死循环，不都一样的吗？Looper会在没有消息的时候阻塞当前线程，释放CPU资源，等到有消息到来的时候，再唤醒主线程。
3. App进程中是需要死循环的，如果循环结束的话，App进程就结束了。

_建议阅读：_
[《Android中为什么主线程不会因为Looper.loop()里的死循环卡死？》](https://link.juejin.cn?target=https%3A%2F%2Fwww.zhihu.com%2Fquestion%2F34652589)
#### # IdleHandler介绍？
介绍： IdleHandler是在Hanlder空闲时处理空闲任务的一种机制。
执行场景：

- MessageQueue没有消息，队列为空的时候。
- MessageQueue属于延迟消息，当前没有消息执行的时候。

会不会发生死循环： 答案是否定的，MessageQueue使用计数的方法保证一次调用MessageQueue#next方法只会使用一次的IdleHandler集合。
### 4. View事件分发机制和View绘制原理
刚哥的《Android开发艺术探索》已经很全面了，建议阅读。
### 5. Bitmap
#### # Bitmap的内存计算方式？
在已知图片的长和宽的像素的情况下，影响内存大小的因素会有**资源文件位置和像素点大小**。
**像素点大小**： 常见的像素点有：

- ARGB_8888：4个字节
- ARGB_4444、ARGB_565：2个字节

**资源文件位置**： 不同dpi对应存放的文件夹 ![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116306653-0f61b63d-f792-49b2-93ca-d352ac72408c.webp) 比如一个一张图片的像素为180*180px，dpi(设备独立像素密度)为320，如果它仅仅存放在drawable-hdpi，则有：
```
ini
 横向像素点 = 180 * 320/240 + 0.5f = 240 px
纵向像素点 = 180 * 320/240 + 0.5f = 240 px
```
如果 如果它仅仅存放在drawable-xxhdpi，则有：
```
ini
 横向像素点 = 180 * 320/480 + 0.5f = 120 px
纵向像素点 = 180 * 320/480 + 0.5f = 120 px
```
所以，对于一张180*180px的图片，设备dpi为320，资源图片仅仅存在drawable-hdpi，像素点大小为ARGB_4444，最后生成的文件内存大小为：
```
ini
 横向像素点 = 180 * 320/240 + 0.5f = 240 px
纵向像素点 = 180 * 320/240 + 0.5f = 240 px
内存大小 = 240 * 240 * 2 = 115200byte 约等于 112.5kb
```
_建议阅读：_
[《Android Bitmap的内存大小是如何计算的？》](https://link.juejin.cn?target=https%3A%2F%2Fivonhoe.github.io%2F2017%2F03%2F22%2FBitmap%26Memory%2F)
#### # Bitmap的高效加载？
Bitmap的高效加载在Glide中也用到了，思路：

1. 获取需要的长和宽，一般获取控件的长和宽。
2. 设置BitmapFactory.Options中的inJustDecodeBounds为true，可以帮助我们在不加载进内存的方式获得Bitmap的长和宽。
3. 对需要的长和宽和Bitmap的长和宽进行对比，从而获得压缩比例，放入BitmapFactory.Options中的inSampleSize属性。
4. 设置BitmapFactory.Options中的inJustDecodeBounds为false，将图片加载进内存，进而设置到控件中。
## 二、Android进阶
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116306702-c8fd67ad-8128-43bf-8278-27186030d425.webp)
 Android进阶中重点考察Android Framework、性能优化和第三方框架。
### 1. Binder
#### # Binder的介绍？与其他IPC方式的优缺点？
Binder是Android中特有的IPC方式，引用《Android开发艺术探索》中的话(略有改动)：
从IPC角度来说，Binder是Android中的一种跨进程通信方式；Binder还可以理解为虚拟的物理设备，它的设备驱动是/dev/binder；从Android Framework来讲，Binder是Service Manager连接各种Manager和对应的ManagerService的桥梁。从面向对象和CS模型来讲，Client通过Binder和远程的Server进行通讯。
基于Binder，Android还实现了其他的IPC方式，比如AIDL、Messenger和ContentProvider。
与其他IPC比较：

- 效率高：除了内存共享外，其他IPC都需要进行两次数据拷贝，而因为Binder使用内存映射的关系，仅需要一次数据拷贝。
- 安全性好：接收方可以从数据包中获取发送发的进程Id和用户Id，方便验证发送方的身份，其他IPC想要实验只能够主动存入，但是这有可能在发送的过程中被修改。
#### # Binder的通信过程？Binder的原理？
图片： ![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116307945-ec4343ff-03de-4c79-a52d-3fd827274887.webp) 其实这个过程也可以从AIDL生成的代码中看出。
原理： ![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116308384-f72c4afe-0ef3-4ad2-8223-3e979ebb47bf.webp) Binder的结构： Client：服务的请求方。 Server：服务的提供方。 Service Manager：为Server提供Binder的注册服务，为Client提供Binder的查询服务，Server、Client和Service Manager的通讯都是通过Binder。 Binder驱动：负责Binder通信机制的建立，提供一系列底层支持。
从上图中，Binder通信的过程是这样的：

1. Server在Service Manager中注册：Server进程在创建的时候，也会创建对应的Binder实体，如果要提供服务给Client，就必须为Binder实体注册一个名字。
2. Client通过Service Manager获取服务：Client知道服务中Binder实体的名字后，通过名字从Service Manager获取Binder实体的引用。
3. Client使用服务与Server进行通信：Client通过调用Binder实体与Server进行通信。

更详细一点？
Binder通信的实质是利用内存映射，将用户进程的内存地址和内核的内存地址映射为同一块物理地址，也就是说他们使用的同一块物理空间，每次创建Binder的时候大概分配128的空间。数据进行传输的时候，从这个内存空间分配一点，用完了再释放即可。
### 2. 序列化
#### # Android有哪些序列化方式？
为了解决Android中内存序列化速度过慢的问题，Android使用了Parcelable。

| 对比 | Serializable | Parcelable |
| --- | --- | --- |
| 易用性 | 简单 | 不是很简单 |
| 效率 | 低 | 高 |
| 场景 | IO、网络和数据库 | 内存中 |

### 3. Framework
#### Zygote孕育进程过程？
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116308439-0159ac6b-0dd6-4eaf-bfb9-b27c6e5a1ac6.webp)
#### # Activity的启动过程？

![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116308349-1ad8f4f2-111f-4635-8a58-b02496a0ca8b.webp)
_建议阅读：_
[《3分钟看懂Activity启动流程》](https://link.juejin.cn?target=https%3A%2F%2Fwww.jianshu.com%2Fp%2F9ecea420eb52)
#### # App的启动过程？
介绍一下App进程和System Server进程如何联系： ![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116308346-c034ff9f-f860-4da8-82be-517382cfd634.webp)

- ActivityThread：依赖于Ui线程，实际处理与AMS中交互的工作。
- ActivityManagerService：负责Activity、Service等的生命周期工作。
- ApplicationThread：System Server进程中ApplicatonThreadProxy的服务端，帮助System Server进程跟App进程交流。
- System Server：Android核心的进程，掌管着Android系统中各种重要的服务。

![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116308528-819729b6-3638-4972-934d-eee11a1c70b6.webp)
具体过程：

1. 用户点击App图标，Lanuacher进程通过Binder联系到System Server进程发起startActivity。
2. System Server通过Socket联系到Zygote，fork出一个新的App进程。
3. 创建出一个新的App进程以后，Zygote启动App进程的ActivityThread#main()方法。
4. 在ActivtiyThread中，调用AMS进行ApplicationThread的绑定。
5. AMS发送创建Application的消息给ApplicationThread，进而转交给ActivityThread中的H，它是一个Handler，接着进行Application的创建工作。
6. AMS以同样的方式创建Activity，接着就是大家熟悉的创建Activity的工作了。

#### # Apk的安装过程？
_建议阅读：_
[《Android Apk安装过程分析》](https://link.juejin.cn?target=https%3A%2F%2Fwww.jianshu.com%2Fp%2F953475cea991)
#### # Activity启动过程跟Window的关系？
_建议阅读：_
[《简析Window、Activity、DecorView以及ViewRoot之间的错综关系》](https://link.juejin.cn?target=https%3A%2F%2Fwww.jianshu.com%2Fp%2F8766babc40e0)

#### # Activity、Window、ViewRoot和DecorView之间的关系？
_建议阅读：_
[《总结UI原理和高级的UI优化方式》](https://juejin.cn/post/6844903974294781965)
### 4. Context
#### # 关于Context的理解？
_建议阅读：_
[《Android Context 上下文 你必须知道的一切》](https://link.juejin.cn?target=https%3A%2F%2Fblog.csdn.net%2Flmj623565791%2Farticle%2Fdetails%2F40481055)
### 5. 断点续传
#### # 多线程断点续传？
基础知识：

- Http基础：在Http请求中，可以加入请求头Range，下载指定区间的文件数。
- RandomAccessFile：支持随机访问，可以从指定位置进行数据的读写。

有了这个基础以后，思路就清晰了：

1. 通过HttpUrlConnection获取文件长度。
2. 自己分配好线程进行制定区间的文件数据的下载。
3. 获取到数据流以后，使用RandomAccessFile进行指定位置的读写。
### 6. 性能优化
#### # 平时做了哪些性能优化？
_建议阅读：_
[《Android 性能优化最佳实践》](https://juejin.cn/post/6844903641032163336)
### 7. 第三方库
一定要在熟练使用后再去查看原理。
#### # Glide
Glide考察的频率挺高的，常见的问题有：

- Glide和其他图片加载框架的比较？
- 如何设计一个图片加载框架？
- Glide缓存实现机制？
- Glide如何处理生命周期？
- ...

_建议阅读：_
[《Glide最全解析》](https://link.juejin.cn?target=https%3A%2F%2Fblog.csdn.net%2Fsinyu890807%2Fcategory_9268670.html)
[《面试官：简历上最好不要写Glide，不是问源码那么简单》](https://juejin.cn/post/6844903986412126216)
#### # OkHttp
OkHttp常见知识点：

- 责任链模式
- interceptors和networkInterceptors的区别？

建议看一遍源码，过程并不复杂。
#### # Retrofit
Retrofit常见问题：

- 设计模式和封层解耦的理念
- 动态代理

建议看一遍源码，过程并不复杂。
#### # RxJava
RxJava难在各种操作符，我们了解一下大致的设计思想即可。
建议寻找一些RxJava的文章。
#### # Android Jetpack(非必须)
我主要阅读了Android Jetpack中以下库的源码：

- Lifecycle：观察者模式，组件生命周期中发送事件。
- DataBinding：核心就是利用LiveData或者Observablexxx实现的观察者模式，对16进制的状态位更新，之后根据这个状态位去更新对应的内容。
- LiveData：观察者模式，事件的生产消费模型。
- ViewModel：借用Activty异常销毁时存储隐藏Fragment的机制存储ViewModel，保证数据的生命周期尽可能的延长。
- Paging：设计思想。

以后有时间再给大家做源码分析。
_建议阅读：_
[《Android Jetpack源码分析系列》](https://link.juejin.cn?target=https%3A%2F%2Fblog.csdn.net%2Fmq2553299%2Fcolumn%2Finfo%2F24151)
### 8. 插件化和组件化
这个我基本没用过，等用过了，再和大家分享。
## 三、Java基础
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116309342-6e103190-5aa4-4b6c-8b4a-44ae50e76fd9.webp)
Java基础中考察频率比较高的是Object、String、面向对象、集合、泛型和反射。
### 1. Object
#### # equals和==的区别？equals和hashcode的关系？

- ==：基本类型比较值，引用类型比较地址。
- equals：默认情况下，equals作为对象中的方法，比较的是地址，不过可以根据业务，修改equals方法。

equals和hashcode之间的关系：
默认情况下，equals相等，hashcode必相等，hashcode相等，equals不是必相等。hashcode基于内存地址计算得出，可能会相等，虽然几率微乎其微。
### 2. String
#### # String、StringBuffer和StringBuilder的区别？

- String：String属于不可变对象，每次修改都会生成新的对象。
- StringBuilder：可变对象，非多线程安全。
- StringBuffer：可变对象，多线程安全。

大部分情况下，效率是：StringBuilder>StringBuffer>String。
### 3. 面向对象的特性
#### # Java中抽象类和接口的特点？
共同点：

- 抽象类和接口都不能生成具体的实例。
- 都是作为上层使用。

不同点：

- 抽象类可以有属性和成员方法，接口不可以。
- 一个类只能继承一个类，但是可以实现多个接口。
- 抽象类中的变量是普通变量，接口中的变量是静态变量。
- 抽象类表达的是is-a的关系，接口表达的是like-a的关系。
#### # 关于多态的理解？
多态是面向对象的三大特性：继承、封装和多态之一。
多态的定义：允许不同类对同一消息做出响应。
多态存在的条件：

1. 要有继承。
2. 要有复写。
3. 父类引用指向子类对象。

Java中多态的实现方式：接口实现，继承父类进行方法重写，同一个类中的方法重载。
### 4. 集合
#### # HashMap的特点是什么？HashMap的原理？
HashMap的特点：

1. 基于Map接口，存放键值对。
2. 允许key/value为空。
3. 非多线程安全。
4. 不保证有序，也不保证使用的过程中顺序不会改变。

简单来讲，核心是**数组+链表/红黑树**，HashMap的原理就是存键值对的时候：

1. 通过键的Hash值确定数组的位置。
2. 找到以后，如果该位置无节点，直接存放。
3. 该位置有节点即位置发生冲突，遍历该节点以及后续的节点，比较key值，相等则覆盖。
4. 没有就新增节点，默认使用链表，相连节点数超过8的时候，在jdk 1.8中会变成红黑树。
5. 如果Hashmap中的数组使用情况超过一定比例，就会扩容，默认扩容两倍。

当然这是存入的过程，其他过程可以自行查阅。这里需要注意的是：

- key的hash值计算过程是高16位不变，低16位和高16位取抑或，让更多位参与进来，可以有效的减少碰撞的发生。
- 初始数组容量为16，默认不超过的比例为0.75。

### 5. 泛型
#### # 说一下对泛型的理解？
泛型的本质是**参数化类型，在不创建新的类型的情况下，通过泛型指定不同的类型来控制形参具体限制的类型**。也就是说在泛型的使用中，操作的数据类型被指定为一个参数，这种参数可以被用在类、接口和方法中，分别被称为泛型类、泛型接口和泛型方法。
泛型是Java中的一种语法糖，能够在代码编写的时候起到类型检测的作用，但是虚拟机是不支持这些语法的。
泛型的优点：

1. 类型安全，避免类型的强转。
2. 提高了代码的可读性，不必要等到运行的时候才去强制转换。
#### # 什么是类型擦除？
不管泛型的类型传入哪一种类型实参，对于Java来说，都会被当成同一类处理，在内存中也只占用一块空间。通俗一点来说，就是泛型只作用于代码编译阶段，在编译过程中，对于正确检验泛型结果后，会将泛型的信息擦除，也就是说，成功编译过后的class文件是不包含任何泛型信息的。
### 6. 反射
#### # 动态代理和静态代理
静态代理很简单，运用的就是代理模式： ![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116309704-ab8b727a-7fb7-4a44-ba53-04184256ec41.webp)
声明一个接口，再分别实现一个真实的主题类和代理主题类，通过让代理类持有真实主题类，从而控制用户对真实主题的访问。
动态代理指的是在运行时动态生成代理类，即代理类的字节码在运行时生成并载入当前的ClassLoader。
动态代理的原理是使用反射，思路和上面的一致。
使用动态代理的好处：

1. 不需要为RealSubject写一个形式完全一样的代理类。
2. 使用一些动态代理的方法可以在运行时制定代理类的逻辑，从而提升系统的灵活性。
## 四、Java并发
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116309452-3446fbf2-d62f-4c72-a1bb-92fb53a70690.webp) Java并发中考察频率较高的有线程、线程池、锁、线程间的等待和唤醒、线程特性和阻塞队列等。
### 1. 线程
#### # 线程的状态有哪些（待修改）？
线程的状态有：

- new：新创建的线程
- Ready：准备就绪的线程，由于CPU分配的时间片的关系，此时的任务不在执行过程中。
- Running：正在执行的任务
- Block：被阻塞的任务
- Time Waiting：计时等待的任务
- Terminated：终止的任务

附上一张状态转换的图： ![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116309705-25495640-7c24-4be5-a0b5-5ad2a56c7ab6.webp)
#### # 线程中wait和sleep的区别？
wait方法既释放cpu，又释放锁。 sleep方法只释放cpu，但是不释放锁。
#### # 线程和进程的区别？
线程是CPU调度的最小单位，一个进程中可以包含多个线程，在Android中，一个进程通常是一个App，App中会有一个主线程，主线程可以用来操作界面元素，如果有耗时的操作，必须开启子线程执行，不然会出现ANR，除此以外，进程间的数据是独立的，线程间的数据可以共享。
### 2. 线程池
线程池的地位十分重要，基本上涉及到跨线程的框架都使用到了线程池，比如说OkHttp、RxJava、LiveData以及协程等。
#### # 与新建一个线程相比，线程池的特点？

1. 节省开销： 线程池中的线程可以重复利用。
2. 速度快：任务来了就能开始，省去创建线程的时间。
3. 线程可控：线程数量可空和任务可控。
4. 功能强大：可以定时和重复执行任务。
#### # 线程池中的几个参数是什么意思，线程池的种类有哪些？
线程池的构造函数如下：
```
java
 public ThreadPoolExecutor(int corePoolSize,
                          int maximumPoolSize,
                          long keepAliveTime,
                          TimeUnit unit,
                          BlockingQueue<Runnable> workQueue) {
	this(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue,
             Executors.defaultThreadFactory(), defaultHandler);
}
```
参数解释如下：

- corePoolSize：核心线程数量，不会释放。
- maximumPoolSize ：允许使用的最大线程池数量，非核心线程数量，闲置时会释放。
- keepAliveTime ：闲置线程允许的最大闲置时间。
- unit ：闲置时间的单位。
- workQueue ：阻塞队列，不同的阻塞队列有不同的特性。

线程池分为四个类型：

- CachedThreadPool：闲置线程超时会释放，没有闲置线程的情况下，每次都会创建新的线程。
- FixedThreadPool：线程池只能存放指定数量的线程池，线程不会释放，可重复利用。
- SingleThreadExecutor：单线程的线程池。
- ScheduledThreadPool：可定时和重复执行的线程池。
#### # 线程池的工作流程？
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116309647-ef8cfbe4-b9e9-4693-8711-e070667ede86.webp)_图片来自_[《线程池是怎样工作的》](https://link.juejin.cn?target=https%3A%2F%2Fwww.jianshu.com%2Fp%2F9de89960ec01)
简而言之：

1. 任务来了，优先考虑核心线程。
2. 核心线程满了，进入阻塞队列。
3. 阻塞队列满了，考虑非核心线程（图上好像少了这个过程）。
4. 非核心线程满了，再触发拒绝任务。
### 3. 锁
#### # 死锁触发的四大条件？

1. 互斥锁
2. 请求与保持
3. 不可剥夺
4. 循环的请求与等待
#### # synchronized关键字的使用？synchronized的参数放入对象和Class有什么区别？
synchronized关键字的用法：

- 修饰方法
- 修饰代码块：需要自己提供锁对象，锁对象包括对象本身、对象的Class和其他对象。

放入对象和Class的区别是：

1. 锁住的对象不同：成员方法锁住的实例对象，静态方法锁住的是Class。
2. 访问控制不同：如果锁住的是实例，只会针对同一个对象方法进行同步访问，多线程访问同一个对象的synchronized代码块是串行的，访问不同对象是并行的。如果锁住的是类，多线程访问的不管是同一对象还是不同对象的synchronized代码块是都是串行的。
#### # synchronized的原理？
任何一个对象都有一个monitor与之相关联，JVM基于进入和退出mointor对象来实现代码块同步和方法同步，两者实现细节不同：

- 代码块同步：在编译字节码的时候，代码块起始的地方插入monitorenter 指令，异常和代码块结束处插入monitorexit指令，线程在执行monitorenter指令的时候尝试获取monitor对象的所有权，获取不到的情况下就是阻塞
- 方法同步：synchronized方法在method_info结构有AAC_synchronized标记，线程在执行的时候获取对应的锁，从而实现同步方法
#### # synchronized和Lock的区别？
主要区别：

1. synchronized是Java中的关键字，是Java的内置实现；Lock是Java中的接口。
2. synchronized遇到异常会释放锁；Lock需要在发生异常的时候调用成员方法Lock#unlock()方法。
3. synchronized是不可以中断的，Lock可中断。
4. synchronized不能去尝试获得锁，没有获得锁就会被阻塞； Lock可以去尝试获得锁，如果未获得可以尝试处理其他逻辑。
5. synchronized多线程效率不如Lock，不过Java在1.6以后已经对synchronized进行大量的优化，所以性能上来讲，其实差不了多少。
#### # 悲观锁和乐观锁的举例？以及它们的相关实现？
悲观锁和乐观锁的概念：

- 悲观锁：悲观锁会认为，修改共享数据的时候其他线程也会修改数据，因此只在不会受到其他线程干扰的情况下执行。这样会导致其他有需要锁的线程挂起，等到持有锁的线程释放锁
- 乐观锁：每次不加锁，每次直接修改共享数据假设其他线程不会修改，如果发生冲突就直接重试，直到成功为止

举例：

- 悲观锁：典型的悲观锁是独占锁，有synchronized、ReentrantLock。
- 乐观锁：典型的乐观锁是CAS，实现CAS的atomic为代表的一系列类
#### # CAS是什么？底层原理？
CAS全称Compare And Set，核心的三个元素是：内存位置、预期原值和新值，执行CAS的时候，会将内存位置的值与预期原值进行比较，如果一致，就将原值更新为新值，否则就不更新。 底层原理：是借助CPU底层指令cmpxchg实现原子操作。
### 4. 线程间通信
#### # notify和notifyAll方法的区别？
notify随机唤醒一个线程，notifyAll唤醒所有等待的线程，让他们竞争锁。
#### # wait/notify和Condition类实现的等待通知有什么区别？
synchronized与wait/notify结合的等待通知只有一个条件，而Condition类可以实现多个条件等待。
### 5. 多线程间的特性
#### # 多线程间的有序性、可见性和原子性是什么意思？

- 原子性：执行一个或者多个操作的时候，要么全部执行，要么都不执行，并且中间过程中不会被打断。Java中的原子性可以通过独占锁和CAS去保证
- 可见性：指多线程访问同一个变量的时候，一个线程修改了变量的值，其他线程能够立刻看得到修改的值。锁和volatile能够保证可见性
- 有序性：程序执行的顺序按照代码先后的顺序执行。锁和volatile能够保证有序性
#### # happens-before原则有哪些？
Java内存模型具有一些先天的有序性，它通常叫做happens-before原则。
如果两个操作的先后顺序不能通过happens-before原则推倒出来，那就不能保证它们的先后执行顺序，虚拟机就可以随意打乱执行指令。happens-before原则有：

1. 程序次序规则：单线程程序的执行结果得和看上去代码执行的结果要一致。
2. 锁定规则：一个锁的lock操作一定发生在上一个unlock操作之后。
3. volatile规则：对volatile变量的写操作一定先行于后面对这个变量的对操作。
4. 传递规则：A发生在B前面，B发生在C前面，那么A一定发生在C前面。
5. 线程启动规则：线程的start方法先行发生于线程中的每个动作。
6. 线程中断规则：对线程的interrupt操作先行发生于中断线程的检测代码。
7. 线程终结原则：线程中所有的操作都先行发生于线程的终止检测。
8. 对象终止原则：一个对象的初始化先行发生于他的finalize()方法的执行。

前四条规则比较重要。
#### # volatile的原理？
**可见性** 如果对声明了volatile的变量进行写操作的时候，JVM会向处理器发送一条Lock前缀的指令，将这个变量所在缓存行的数据写入到系统内存。
多处理器的环境下，其他处理器的缓存还是旧的，为了保证各个处理器一致，会通过嗅探在总线上传播的数据来检测自己的数据是否过期，如果过期，会强制重新将系统内存的数据读取到处理器缓存。
**有序性**Lock前缀的指令相当于一个内存栅栏，它确保指令排序的时候，不会把后面的指令拍到内存栅栏的前面，也不会把前面的指令排到内存栅栏的后面。
### 6. 阻塞队列
#### # 通常的阻塞队列有哪几种，特点是什么？

- ArrayBlockQueue：基于数组实现的有界的FIFO(先进先出)阻塞队列。
- LinkedBlockQueue：基于链表实现的无界的FIFO(先进先出)阻塞队列。
- SynchronousQueue：内部没有任何缓存的阻塞队列。
- PriorityBlockingQueue：具有优先级的无限阻塞队列。
#### # ConcurrentHashMap的原理
数据结构的实现跟HashMap一样，不做介绍。
JDK 1.8之前采用的是分段锁，核心类是一个Segment，Segment继承了ReentrantLock，每个Segment对象管理若干个桶，多个线程访问同一个元素的时候只能去竞争获取锁。
JDK 1.8采用了CAS + synchronized，插入键值对的时候如果当前桶中没有Node节点，使用CAS方式进行更新，如果有Node节点，则使用synchronized的方式进行更新。
## 五、Jvm
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116309996-867f5fb0-79c5-469b-b661-cb9a031ebe00.webp) Jvm中考察频率较高的内容有：Jvm内存区域的划分、GC机制和类加载机制。
_建议阅读：_
《深入理解Java虚拟机》
### 1. Java内存模型
#### # Jvm内存区域是如何划分的？
内存区域划分：

- 程序计数器：当前线程的字节码执行位置的指示器，线程私有。
- Java虚拟机栈：描述的Java方法执行的内存模型，每个方法在执行的同时会创建一个栈帧，存储着局部变量、操作数栈、动态链接和方法出口等，线程私有。
- 本地方法栈：本地方法执行的内存模型，线程私有。
- Java堆：所有对象实例分配的区域。
- 方法区：所有已经被虚拟机加载的类的信息、常量、静态变量和即时编辑器编译后的代码数据。
#### # Jvm内存模型是怎么样的？

1. Java规定所有变量的内存都需要存储在主内存。
2. 每个线程都有自己的工作内存，线程中使用的所有变量以及对变量的操作都基于工作内存，工作内存中的所有变量都从主内存读取过来的。
3. 不同线程间的工作内存无法进行直接交流，必须通过主内存完成。 ![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116310568-78eaa041-dfe7-4fa3-94e7-9ecb822805ad.webp) 主内存和工作内存之间的交互协议，即变量如何从主内存传递到工作内存、工作内存如何将变量传递到主内存，Java内存模型定义了8种操作来完成，并且每一种操作都是原子的，不可再分的。
| 类型 | 说明 |
| --- | --- |
| lock | 作用于主内存的变量，把一个变量标识一个线程独占的状态 |
| unlock | 作用于主内存的变量，把一个处于锁定状态的变量释放出来 |
| read | 把一个变量从主内存传输到工作内存，以便随后的load使用 |
| load | 把read操作读取的变量存储到工作内存的变量副本中 |
| use | 把工作内存中的变量的值传递给执行引擎，每当虚拟机执行到一个需要使用变量的字节码指令的时候都会执行这个操作 |
| assign | 把一个从执行引擎中接收到的变量赋值给工作内存中的变量，每当虚拟机遇到赋值的字节码指令都会执行这个操作 |
| store | 把工作内存中的一个变量的值传递给主内存，以便以后的write使用 |
| write | 把store传递过来的工作内存中的变量写入到主内存中的变量 |

#### # String s1 = "abc"和String s2 = new String("abc")的区别，生成对象的情况

1. 指向方法区："abc"是常量，所以它会在方法区中分配内存，如果方法区已经给"abc"分配过内存，则s1会直接指向这块内存区域。
2. 指向Java堆：new String("abc")是重新生成了一个Java实例，它会在Java堆中分配一块内存。

所以s1和s2的内存地址肯定不一样，但是内容一样。
### 2. GC机制
#### # 如何判断对象可回收？
判断一个对象可以回收通常采用的算法是引用几算法和可达性算法。由于互相引用导致的计数不好判断，Java采用的可达性算法。
可达性算法的思路是：通过一些列被成为GC Roots的对象作为起始点，自上往下从这些起点往下搜索，搜索所有走过的路径称为引用链，如果一个对象没有跟任何引用链相关联的时候，则证明该对象不可用，所以这些对象就会被判定为可以回收。
可以被当作GC Roots的对象包括：

- Java虚拟机栈中的引用的对象
- 方法区中静态属性引用的对象
- 方法区中常量引用的对象
- 本地方法中JNI引用的对象
#### # GC的常用算法？

- 标记 - 清除：首先标记出需要回收的对象，标记完成后统一回收所有被标记的对象。容易产生碎片空间。
- 复制算法：它将可用的内存分为两块，每次只用其中的一块，当需要内存回收的时候，将存活的对象复制到另一块内存，然后将当前已经使用的内存一次性回收掉。需要浪费一半的内存。
- 标记 - 整理：让存活的对象向一端移动，之后清除边界外的内存。
- 分代搜集：根据对象存活的周期，Java堆会被分为新生代和老年代，根据不同年代的特性，选择合适的GC收集算法。
#### # Minar GC和Full GC的区别？

- Minar GC：频率高、针对新生代。
- Full GC：频率低、发生在老年代、通常会伴随一次Minar GC和速度慢。
#### # 说一下四种引用以及他们的区别？

- 强引用：强引用还在，垃圾搜集器就不会回收被引用的对象。
- 软引用：对于软引用关联的对象，在系统发生内存溢出异常之前，将会把这些对象列进回收范围进行第二次回收，如果这次回收还没有足够的内存，才会抛出内存溢出异常。
- 弱引用：被若引用关联的对象只能存活到下一次GC之前。
- 虚引用：为对象设置虚引用的目的仅仅是为了GC之前收到一个系统通知。
### 3. 类加载
#### # 类加载的过程？
类加载的过程可以分为：

1. 加载：将类的全限定名转化为二进制流，再将二进制流转化为方法区中的类型信息，从而生成一个Class对象。
2. 验证：对类的验证，包括格式、字节码、属性等。
3. 准备：为类变量分配内存并设置初始值。
4. 解析：将常量池的符号引用转化为直接引用。
5. 初始化：执行类中定义的Java程序代码，包括类变量的赋值动作和构造函数的赋值。
6. 使用
7. 卸载

只有加载、验证、准备、初始化和卸载的这个五个阶段的顺序是确定的。
#### # 类加载的机制，以及为什么要这样设计？
类加载的机制是双亲委派模型。大部分Java程序需要使用的类加载器包括：

- 启动类加载器：由C++语言实现，负责加载Java中的核心类。
- 扩展类加载器：负责加载Java扩展的核心类之外的类。
- 应用程序类加载器：负责加载用户类路径上指定的类库。

双亲委派模型如下： ![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116310421-b85d071c-601f-4d14-9832-ba690cae6bc8.webp) 双亲委派模型要求出了顶层的启动类加载器之外，其他的类加载器都有自己的父加载器，通过组合实现。
双亲委派模型的工作流程： 当一个类加载的任务来临的时候，先交给父类加载器完成，父类加载器交给父父类加载器完成，知道传递给启动类加载器，如果完成不了的情况下，再依次往下传递类加载的任务。
这样设计的原因： 双亲委派模型能够保证Java程序的稳定运行，不同层次的类加载器具有不同优先级，所有的对象的父类Object，无论哪一个类加载器加载，最后都会交给启动类加载器，保证安全。
## 六、kotlin
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116310564-af1c9af7-9cd2-4784-b26d-eb6de5e67373.webp)
_建议阅读：_
《Kotlin》实战
### 1. 基础
#### # ==、===和equal的区别？
==和equal的作用相同，===比较内存地址
#### # var和val的区别？

- var：可变引用，具有可读和可写权限，值可变，类型不可变
- val：不可变引用，具有可读权限，值不可变，但是对象的属性可变
### 2. 函数
#### # Kotlin中默认参数的作用以及原理？
作用：配合@JavaOverloads可以解决Java调用Kotlin函数重载的问题。 原理：Kotlin编译的默认参数是被编译到调用的函数中的，所以默认参数改变的时候，是需要重新编译这个函数的。
#### # Kotlin中顶层函数的原理
顶层函数实质就是Java中的静态函数，可以通过Kotlin中的@Jvm:fileName自动生成对应的Java调用类名。
#### # 中缀函数是什么？注意点？
中缀函数需要是用infix关键字修饰，如downTo：
```
kotlin
 public infix fun Int.downTo(to: Int): IntProgression {
    return IntProgression.fromClosedRange(this, to, -1)
}
```
注意点是函数的参数只能有一个，函数的参与者只能有两个。
#### # 解构函数的本质？
解构声明将对象中的所有属性，解构成一组属性变量，而且这些变量可以单独使用，可以单数使用的原因是通过获取对应的component()方法对应着类中每个属性的值，这些属性的值被存储在局部变量中，所以解构声明的实质是局部变量。
#### # 扩展函数的本质？
扩展函数的本质就是对应Java中的静态函数，这个静态函数参数为接受者类型的对象，然后利用这个对象去访问对象中的属性和成员方法，最后返回这个对象的本身。
#### # 扩展函数和成员函数的区别？

1. 实质不同：扩展函数实质是静态函数，是外部函数，成员函数是内部函数。
2. 权限不同：扩展函数访问不了私有的属性和成员方法，成员函数可以。
3. 继承：扩展函数不可复写，成员函数可以复写。

它们的使用方式类似。
### 3. 类、对象和接口
#### # Kotlin中常用的类的修饰符有哪些？

- open：运行创建子类或者复写子类的方法。
- final：不允许创建子类和复写子类的方法。
- abstract：抽象类，必须复写子类的方法。

在Kotlin中，默认的类和方法的修饰符都是final的，如果想让类和方法能够被继承或者复写，需要显示的添加open修饰符。
#### # Kotlin中可见性修饰符有哪些？

- public：所有地方可见
- protected：子类中可见
- private：类中可见
- internal：模块中可见，一个模块就是一组一起编译的Kotlin文件

Java默认的访问权限是包访问权限，Kotlin中默认的访问权限是public。
#### # Kotlin中的内部类和Java中的内部类有什么不同？

- Kotlin：默认相当于Java中的静态内部类，如果想访问类中的成员方法和属性，需要添加inner关键字修饰。
- Java：默认持有外部类引用，可以访问成员方法和属性，如果想声明为静态内部类，需要添加static关键字修饰。
#### # Kotlin属性代理背后原理？
可以简单理解为属性的settter、getter访问器内部实现交给了代理对象来实现，相当于使用一个代理对象代替了原来简单属性的读写过程，而暴露外部属性操作还是不变 的，照样是属性赋值和读取，只是setter、getter内部具体实现变了。
#### # object和companion object的一些特点？
共同点： 定义单例的一种方式，提供静态成员和方法。
不同点：

- object：用来生成匿名内部类。
- companion object：提供工厂方法，访问私有的构造方法。
### 4. lambda
#### # lambda表达式有几种？

- 普通表达式：()->R。
- 带接收者对象的表达式：T.()->R，可以访问接收者对象的属性和成员方法。如apply。
#### # kotlin和Java内部类或者lambda表达式访问局部变量有什么不同？

- Java中的内部类：局部变量必须是final声明的，无法去修改局部变量的值。
- Kotlin中lambda表达式：不要求final声明，对于非final修饰的lambda表达式，可以修改局部变量的值。

如果想在Java中的内部类修改外层局部变量的值，有两种方法：用数组包装或者提供包装类，Kotlin中lambda能够访问并修改局部变量的本质就是提供了一层包装类：
```
kotlin
 class Ref<T>(var value:T)
```
修改局部变量的值就是修改value中的值。
#### # 使用lambda表达式访问的局部变量有什么不同？
默认情况下，局部变量的生命周期会被限制在声明这个变量的函数中，但是如果它被lambda捕捉了，使用这个变量的代码可以被存储并稍后执行。
```
kotlin
 class Apple {
    lateinit var num:(() -> Int)
    
    fun initCount(){
        val count = 2
        num = fun():Int{
            return count * count
        }
    }

    fun res():Int{
        return num()
    }
}

fun main(args: Array<String>) {
    val a = Apple()
    a.initCount()
    val res = a.res()
    println(res)
}
```
如上面代码所示，局部变量count就被存储在lambda表达式中，最后通过Apple#res方法引用表达式。
原理：**当你捕捉final变量的时候，它的值会和lambda代码一起存储**。对于非final变量，它的值会被封装在一层包装器中，包装器的引用会和lambda代码一起被存储。
带来的问题：默认情况下，lambda表达式会生成匿名内部类，在非显示声明对象的情况下可以多次重用，但是如果捕获了局部变量，每次调用的时候都需要生成新的实例。
#### # 序列是什么？集合类和序列的操作符比较？
Sequence(序列)是一种惰性集合，可以更高效地对元素进行链式操作，不需要创建额外的集合保存过程中产生的中间结果，简单来讲，就是序列中所有的操作都是按顺序应用在每一个元素中。比如：
```
kotlin
 fun main(args: Array<String>) {
    val list = mutableListOf<String>("1","2","3","4","5","6","7","8","9")
    val l = list.asSequence()
            .filter { it.toCharArray()[0] < '4' }
            .map { it.toInt() * it.toInt() }
            .toList()
}
```
对于上述序列中的"1"，它会先执行filter，再执行map，之后再对"2"重复操作。除此以外，序列中所有的中间操作都是惰性的。
集合和序列操作符的比较：

- 集合类：map和filter方法是内联，不会生成匿名类的实例，但每次进行map和filter都会生成新的集合，当数据量大的时候，消耗的内存也比较大。
- 序列：map和fitler非内联，会生成匿名类实例，但不需要创建额外的集合保存中间操作的结果。
#### # 为什么要使用内联函数？内联函数的作用？
使用lambda表达式可能带来的开销：

1. lambda表达式正常会被编译成匿名类。
2. 正常情况下，使用lambda表达式至少会生成一个对象，如果很不幸的使用了局部变量，那么每次使用该lambda表达式都会生成一个新的对象，导致使用lambda的效率比不使用还要低。

使用内联函数可以减少运行时的开销。内联函数主要作用：

1. 使用内联函数可以减少中间类和对象的创建，进而提升性能。主要原因是内联函数可以做到函数被使用的时候编译器不会生成函数调用的代码，而是使用函数实现的真实代码区替换每一次的调用。
2. 结合reified实化类型参数，解决泛型类型运行时擦除的问题。
### 5. 类型系统
#### # Kotlin中的基本数据类型的理解？
在Kotlin中，使用的时候是不区分基本类型的，统一如下： Int、Byte、Short、Long、Float、Double、Char和Boolean。
使用统一的类型并不意味着Kotlin中所有的基本类型都是引用类型，大多数情况下，对于变量、参数、返回类型和属性都会被编译成基本类型，泛型类会被编译成Java中的包装类，即引用类型。
#### # 只读集合和可变集合的区别？
在Kotlin中，集合会被分为两大类型，只读集合和可变集合。

- 只读集合：对集合只有读取权限。
- 可变集合：能够删除、新增、修改和读取元素。

但是有一点需要注意，只读集合不一定是不可变的，如果你使用的变量是只读集合，它可能是众多集合引用中的一个，任何一个集合引用都有可能是可变集合。
#### # Array和IntArray的区别？
Array<Int>相当于Java中的Integer[]，IntArray对应Java中的int[]。
#### # 使用实化类型参数解决泛型擦除的原理是什么？
内联函数的原理是编译器把实现的字节码动态插入到每一次调用的地方。实化类型参数也正是基于这个原理，每次调用实化类型参数的函数的时候，编译器都知道此次作为泛型类型实参的具体类型，所以编译器每次调用的时候生成不同类型实参调用的字节码插入到调用点。
### 6. 协程
#### # 协程是什么？协程的有什么特点？
Kotlin官方文档上说：
协程的本质是轻量级的线程。
为什么说它是轻量级的线程，因为从官方角度来讲，创建十万个协程没什么问题打印任务不会存在问题，创建十万个线程会造成内存问题，可能会造成内存溢出。但是这个对比有问题，因为协程本质上是基于Java的线程池的，你去用线程池创建十万个打印任务是不会造成内存溢出的。
从上面我们可以得出结果，协程就是基于线程实现的更上层的Api，只不过它可以用阻塞式的写法写出非阻塞式的代码，避免了大量的回调，核心就是协程可以帮我自动的切换线程。
#### # 协程的原理？
很多人都会讲，协程中处理耗时任务，协程会先挂起，执行完，再切回来。我在这就浅显的分析这两步。

- 挂起：协程挂起的时候会从挂起处将后面的代码封装成续体，协程挂起的时候，将挂起的任务根据调度器放到线程池中执行，会有一个线程监视任务的完成情况。
- 线程切回：监视线程看到任务结束以后，根据需要再切到指定的线程中（主线程or子线程），执行续体中剩余的代码。

详解请查看：
[《Kotlin/JVM 协程实现原理》](https://link.juejin.cn?target=https%3A%2F%2Fwww.jianshu.com%2Fp%2Fd23c688feae7)
## 七、网络
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116310593-0937f361-99e9-4b9a-b7f7-09fe85d0cd1e.webp) 掌握网络知识其实是需要一个系统的过程，在时间充裕的情况下，建议还是系统化的学习。
高频网络知识有TCP、HTTP和HTTPS。
_建议阅读：_
[《趣谈网络协议》](https://link.juejin.cn?target=https%3A%2F%2Ftime.geekbang.org%2Fcolumn%2Fintro%2F85)
《图解Http》
### 1. HTTP和HTTPS
#### # HTTP是哪一层的协议，常见的HTTP状态码有哪些，分别代表什么意思？
HTTP协议是应用层的协议。
常见的HTTP状态码有：

| 类别 | 解释 |
| --- | --- |
| 1xx | 请求已经接收，继续处理 |
| 2xx | 服务器已经正确处理请求，比如200 |
| 3xx | 重定向，需要做进一步的处理才能完成请求 |
| 4xx | 服务器无法理解的请求，比如404，访问的资源不存在 |
| 5xx | 服务器收到请求以后，处理错误 |

#### # HTTP 1.1 和HTTP 2有什么区别？
HTTP 2.0基于HTTP 1.1，与HTTP 2.0增加了：

- 二进制格式：HTTP 1.1使用纯文本进行通信，HTTP 2.0使用二进制进行传输。
- Head压缩：对已经发送的Header使用键值建立索引表，相同的Header使用索引表示。
- 服务器推送：服务器可以进行主动推送
- 多路复用：一个TCP连接可以划分成多个流，每个流都会分配Id，客户端可以借助流和服务端建立全双工进行通信，并且流具有优先级。 ![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116310704-683daf88-6539-46fd-851e-3e52d44c1f6e.webp)
#### # HTTP和HTTPS有什么区别？
简单来说，HTTP和HTTPS的关系是这样的
```
ini
 HTTPS = HTTP + SSL/TLS
```
区别如下： HTTP作用于应用层，使用80端口，起始地址是http://，明文传输，消息容易被拦截，串改。 HTTPS作用域传输层，使用443端口，起始地址是https://，需要下载CA证书，传输的过程需要加密，安全性高。
#### # SSL/TLS的握手过程？
这里借用[《趣谈网络协议》](https://link.juejin.cn?target=https%3A%2F%2Ftime.geekbang.org%2Fcolumn%2Fintro%2F85)的图片： ![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116311429-1a2f6fbb-75dd-47e1-9964-6560a95e0246.webp)
#### # HTTPS传输过程中是如何处理进行加密的？为什么有对称加密的情况下仍然需要进行非对称加密？
过程和上图类似，依次获取证书，公钥，最后生成对称加密的钥匙进行对称加密。
对称加密可以保证加密效率，但是不能解决密钥传输问题；非对称加密可以解决传输问题，但是效率不高。
### 2. TCP相关
#### # TCP的三次握手过程，为什么需要三次，而不是两次或者四次？
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116311496-0a1c7c21-c9fa-4559-bc5a-4a259f4dcd76.webp) 只发送两次，服务端是不知道自己发送的消息能不能被客户端接收到。 因为TCP握手是三次，所以此时双方都已经知道自己发送的消息能够被对方收到，所以，第四次的发送就显得多余了。
#### # TCP的四次挥手过程？
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116311935-7c672b79-b7f0-4b18-af68-f693ccf6c142.webp) 大致意思就是：

- Client：我要断开连接了
- Server：我收到你的消息了
- Server：我也要断开连接了
- Client：收到你要断开连接的消息了

之后Client等待两个MSL(数据包在网络上生存的最长时间)，如果服务端没有回消息就彻底断开了。
#### # TCP和UDP有什么区别？

- TCP：基于字节流、面向连接、可靠、能够进行全双工通信，除此以外，还能进行流量控制和拥塞控制，不过效率略低
- UDP：基于报文、面向无连接、不可靠，但是传输效率高。

总的来说，TCP适用于传输效率要求低，准确性要求高或要求有连接。而UDP适用于对准确性要求较低，传输效率要求较高的场景，比如语音通话、直播等。
#### # TCP为什么是一种可靠的协议？如何做到流量控制和拥塞控制？

- TCP可靠：是因为可以做到数据包发送的有序、无差错和无重复。
- 流量控制：是通过滑动窗口实现的，因为发送发和接收方消息发送速度和接收速度不一定对等，所以需要一个滑动窗口来平衡处理效率，并且保证没有差错和有序的接收数据包。
- 拥塞控制：慢开始和拥塞避免、快重传和快恢复算法。这写算法主要是为了适应网络中的带宽而作出的调整。
## 八、设计模式
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1698116311563-86e802a7-31b4-432d-a1fa-6d7110ccec21.webp)
 经常考察的设计模式不多，但是我们应该在平时业务中应该多多思考，用一些设计模式会不会更好。
_建议阅读：_
[《Android 源码设计模式解析与实战》](https://link.juejin.cn?target=https%3A%2F%2Fbook.douban.com%2Fsubject%2F26644935%2F)
### 1. 六大原则
设计模式的六大原则是：

- 单一职责：合理分配类和函数的职责
- 开闭原则：开放扩展，关闭修改
- 里式替换：继承
- 依赖倒置：面向接口
- 接口隔离：控制接口的粒度
- 迪米特：一个类应该对其他的类了解最少
### 2. 单例模式
单例模式被问到的几率很大，通常会问如下几种问题。
#### # 单例的常用写法有哪几种？
**懒汉模式**
```
java
 public class SingleInstance {
	private static SingleInstance instance;
	private SingleInstance() {}
	public static synchronized SingleInstance getInstance() {
		if(instance == null) {
			instance = new SingleInstance();
		}
		return instance;
	}
}
```
该模式的主要问题是每次获取实例都需要同步，造成不必要的同步开销。 **DCL模式**
```
java
 public class SingleInstance {
	private static SingleInstance instance;
	private SingleInstance() {}
	public static SingleInstance getInstance() {
		if(instance == null) {
			synchronized (SingleInstance.class) {
				if(instance == null) {
					instance = new SingleInstance();
				}
			}
		}
		return instance;
	}
}
```
高并发环境下可能会发生问题。 **静态内部类单例**
```
java
 public class SingleInstance {
	private SingleInstance() {}
	public static SingleInstance getInstance() {
		return SingleHolder.instance;
	}
	
	private static class SingleHolder{
		private static final SingleInstance instance = new SingleInstance();
	}
}
```
**枚举单例**
```
java
 public enum SingletonEnum {
	INSTANCE
}
```
优点：线程安全和反序列化不会生成新的实例
#### # DCL模式会有什么问题？
对象生成实例的过程中，大概会经过以下过程：

1. 为对象分配内存空间。
2. 初始化对象中的成员变量。
3. 将对象指向分配的内存空间（此时对象就不为null）。

由于Jvm会优化指令顺序，也就是说2和3的顺序是不能保证的。在多线程的情况下，当一个线程完成了1、3过程后，当前线程的时间片已用完，这个时候会切换到另一个线程，另一个线程调用这个单例，会使用这个还没初始化完成的实例。 解决方法是使用volatile关键字：
```
java
 public class SingleInstance {
	private static volatile SingleInstance instance;
	private SingleInstance() {}
	public static SingleInstance getInstance() {
		if(instance == null) {
			synchronized (SingleInstance.class) {
				if(instance == null) {
					instance = new SingleInstance();
				}
			}
		}
		return instance;
	}
}
```
### 3. 需要关注的设计模式
重点了解以下的几种常用的设计模式：

- 工厂模式和抽象工厂模式：注意他们的区别。
- 责任链模式：View的事件分发和OkHttp的调用过程都使用到了责任链模式。
- 观察者模式：重要性不言而喻。
- 代理模式：建议了解一下动态代理。
### 4. MVC\MVP\MVVM
MVC、MVP和MVVM应该是设计模式中考察频率最高的知识点了，严格意义上来说，它们不能算是设计模式，而是框架。
#### # MVC、MVP和MVVM是什么？
图片已有，不再给出

- MVC：Model-View-Controller，是一种分层解偶的框架，Model层提供本地数据和网络请求，View层处理视图，Controller处理逻辑，存在问题是Controller层和View层的划分不明显，Model层和View层的存在耦合。
- MVP：Model-View-Presenter，是对MVC的升级，Model层和View层与MVC的意思一致，但Model层和View层不再存在耦合，而是通过Presenter层这个桥梁进行交流。
- MVVM：Model-View-ViewModel，不同于上面的两个框架，ViewModel持有数据状态，当数据状态改变的时候，会自动通知View层进行更新。
#### # MVC和MVP的区别是什么？
MVP是MVC的进一步解耦，简单来讲，在MVC中，View层既可以和Controller层交互，又可以和Model层交互；而在MVP中，View层只能和Presenter层交互，Model层也只能和Presenter层交互，减少了View层和Model层的耦合，更容易定位错误的来源。
#### # MVVM和MVP的最大区别在哪？
MVP中的每个方法都需要你去主动调用，它其实是被动的，而MVVM中有数据驱动这个概念，当你的持有的数据状态发生变更的时候，你的View你可以监听到这个变化，从而主动去更新，这其实是主动的。
#### # ViewModel如何知道View层的生命周期？
事实上，如果你仅仅使用ViewModel，它是感知不了生命周期，它需要结合LiveData去感知生命周期，如果仅仅使用DataBinding去实现MVVM，它对数据源使用了弱引用，所以一定程度上可以避免内存泄漏的发生。
## 九、算法题
没什么好说的，Leetcode + 《剑指Offer》，着重记住一些解决问题的思路。
除此以外，你还得记住一些常用的算法：排序、反转链表、树的遍历和手写LruCache，这些都写不出来，就尴尬了。
如果你不想阅读书籍，可以参考一下这个Github，亲眼见证了从3k Star到34k Star，跪了：
【fucking-algorithm】：[github.com/labuladong/…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Flabuladong%2Ffucking-algorithm)
## 十、简历
简历中最重要的是项目经历和技能掌握。
可能有的同学会说，我天天在公司拧螺丝，根本没什么东西可写。
所以我们在平时的工作中，不应该仅仅满足于写一些业务代码，而应该常常思考：

- 在结合的业务的情况下，我可以再做一点什么？
- 对于已经写完的代码，我还可以做哪一些优化？
## 写在最后
经常听到一些同学调侃，Boss不聘、前程堪忧、拉不上钩，确实，今年的大环境比较严峻，但是一些高级岗位仍然稀缺。
谈一下我自己，小厂背景、18年毕业、普通学校，所以，大厂都没给过面试机会，好在前两周内推成功了，我也抓住了这次机会，成功获得了大厂的Offer。
所以我想表达什么？**打铁还需自身硬，一定是得建立完比较完整的知识体系的前提下，当机会来临的时候，才能够稳稳地把握住**，希望和大家共勉~






> **关注公众号 Android茶话会，回复 高清大图，下载本次文章中的大图。**



