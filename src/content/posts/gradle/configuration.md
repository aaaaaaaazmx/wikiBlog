---
title: "configuration"
published: 2023-08-29
description: "configuration"
tags: ["Gradle","构建工具"]
category: "gradle"
draft: false
slug: "gradle-002"
---

# 0.引言

## 0.1：configuration是什么？
什么是gradle中的configuration？先从感性认识，那就是平常我们在编译中写的compile，implementation，provided，compileOnly等等，都是configuration。这样看的话，**configuration承担了项目或者aar依赖的作用**。然而，它到底是如何起作用的？比如，一个app module依赖一个library module，它到底是如何在我们点击编译（或者用命令行编译）之后，开始驱动整个项目的编译的。而这个问题的核心就是，它是如何保证这两个project的任务能够有机地组合起来，在保证任务并行的同时，又能够很好地组织好任务的依赖关系？以Manifest为例，app module是如何能够merge到library module的manifest信息的？是在plugin内部有设置task的依赖关系吗？这里先剧透一点，就是承担项目或者aar依赖只是configuration表面的任务，对于项目依赖来说，它真正的作用，其实是当project A依赖project B时，它就拥有了对于project B中产物的所有权，即它能够获取到project B中的产物。

## 0.2：artifacts是什么？
artifacts的意思就是产物，_实际上对于大部分task来说，执行完之后都会有产物输出，输出的就叫artifacts_。而与artifacts密切关联的有以下几个类：

- ArtifactCollection
- FileCollection

之所以有FileCollection是因为基本上所有的AndroidTask的输出都是文件。ArtifactCollection的定义如下：
![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575989637266-640be22c-40e4-43ca-b92d-e63a2c6cd5e5.jpeg)
这3个方法的作用，其实注释已经写得很清楚了，分别如下：

- getArtifactFiles()用于返回包含有所有产物的文件集合，这个方法的返回值可作为一个task的input，利用这个input构建起task之间的依赖关系，具体如何构建在后面会提到。
- getArtifacts()用于返回解析好的artifacts，如果没有解析，则会进行解析。在这个过程中，如果需要的话，可能会下载artifact的metadata和artifact文件。
- getFailures()返回在解析产物的过程中出现的异常。

FileCollection的定义如下：
![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575989637331-372bafb3-46fe-44c6-8534-f98370b3eda3.jpeg)
注意FileCollection继承的接口，分别有Iterable，AntBuilderAware和Buildable，特别注意Buildable这个接口，它里面含有任务依赖信息，其定义如下：

![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575989637262-ba95e6fd-2fe4-464e-abf0-fdf548403733.jpeg)

一个Buildable对象代表一个或多个artifact，这些artifacts也是由一个或多个task产生的。

## 0.3 artifacts发布
在android gradle plugin框架中，绝大部分的task都是AbstractTask的子类，并且具有inputs和outputs，这也很好理解，在编译过程中，每个task都需要一些输入，执行完成之后，会生成一些产物，即outputs。在讨论inputs之前，我们先讨论一个task的outputs。本文以输出类型为LIBRARY_MANIFEST的产物发布为例进行讨论。那android gradle plugin中的task是如何将自己的产物发布出去呢？起点就在VariantScopeImpl中的addTaskOutput()方法中。在进行分析之前，先看一下核心流程图：      
  ![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575989637277-72150666-5eb8-40e5-8551-a8366243c0e8.jpeg)

其中上部分绿色的流程是在android gradle plugin中，而下半部分黄色的是在gradle中。

# 1.起点：addTaskOutput()
前面我们说过，以输出类型为LIBRARY_MANIFEST的产物发布为例，其中LIBRARY_MANIFEST的调用在TaskManager中，如下:
![](https://cdn.nlark.com/yuque/0/2019/png/215777/1575989637280-df905c95-3629-4833-a11b-77ef1580ce58.png)
注意其中的taskName就是processManifest这个task的名称。
而addTaskOutput()方法如下:
![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575989637280-a045a093-b2b1-4405-a920-21056ef53c06.jpeg)
首先看super.addTaskOutput()方法，调用的是TaskOutputHolderImpl.addTaskOutput()方法，如下：
![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575989637271-4067f957-85ee-4209-99fb-c53997a7f3cf.jpeg)
这个方法很简单，主要做了以下事情：

- 由于outputMap缓存了之前发布的结果，所以通过outputMap是否包含当前outputType，以防止重复发布。
- 调用createCollection()方法创建ConfigurableFileCollection对象，并且将此对象缓存到outputMap中。

而createCollection()方法如下：
![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575989637294-444345ea-2155-4a2c-843e-6922361cca70.jpeg)
这里getProject().files(file);其实是调用了DefaultProject的files()方法，从这里就进入gradle层，下一小节分析。

## 1.1 DefaultProject.files()方法分析

该方法如下：

![](https://cdn.nlark.com/yuque/0/2019/png/215777/1575989637277-1f04ceb0-d753-4da9-b7f9-b6b96d12a5ec.png)
而getFileOperations()实际上返回的是DefaultFileOperations对象，该对象的files()方法如下：

![](https://cdn.nlark.com/yuque/0/2019/png/215777/1575989637292-1042c535-7d83-470e-8cde-aaa5759383b6.png)
显然，这里返回的是DefaultConfigurableFileCollection对象，这里可以先简单地把DefaultConfigurableFileCollection当作文件和编译依赖的包装类。
## 1.2 TaskOutputHolderImpl.createCollection()分析

再回到android gradle plugin层的TaskOutputHolderImpl中的createCollection()方法，其后面的语句为：
![](https://cdn.nlark.com/yuque/0/2019/png/215777/1575989637347-05959614-fad5-42a4-b6e2-42dc7e93bfdb.png)
即如果taskName不为空，则为DefaultConfigurableFileCollection对象collection设置编译依赖。而DefaultConfigurableFileCollection的builtBy()方法如下：
![](https://cdn.nlark.com/yuque/0/2019/png/215777/1575989637540-3ac09fa3-54f5-4bfa-b7e5-2647aa0b5e2f.png)
其中buildDependency是在构造方法中创建的DefaultTaskDependency对象，显然，这里就是将编译依赖的task添加到buildDependency中。
至此，VariantScopeImpl.addTaskOutput()中的super.addTaskOutput()方法就分析完了。总结起来就是：

- 创建了DefaultConfigurableFileCollection对象，并且将file添加到其中，而taskName则添加到编译依赖中。
- 将创建的DefaultConfigurableFileCollection缓存到outputMap中。

如果在super调用中没有抛出异常，并且传入的file确实是File对象的话，则执行variantPublishingSpec.getSpec(outputType); 在下一小节分析这个方法。

## 1.3 VariantPublishingSpec.getSpec()方法分析


VariantPublishingSpec.getSpec()方法如下：
![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575989637306-cd499db3-e0e4-425c-bd81-9f2e896d6d61.jpeg)
这个方法先判断outputMap有没有初始化，如果没有，则先进行初始化。outputMap的初始化分为以下两部分：

- 创建HashMap对象。
- 遍历taskSpecs，然后将taskSpec的信息放入outputMap中，其中key为taskSpec的outputType，value则为taskSpec自身。之后就是以taskOutputType的值为key，在outputMap中找出相应的value并返回，如果没有找到，则再在parentSpec中找一遍。

那么，为了后面的分析，我们先看一下OutputType到底有哪些类型，以及taskSpecs到底是什么。OutputType和TaskOutputType都是定义在TaskOutputHolder中的内部类，其定义如下：
![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575989637307-31e6fccd-0901-4408-afb1-a0287a30c303.jpeg)
显然，OutputType就是表示为输出类型的接口，而TaskOutputType则是task的输出类型，并且为了使用方便，定义成了枚举类。这里选择其中的几个进行讲解。

- JAVAC. 显然就是javac这个java编译task的输出。
- LIBRARY_CLASSES. aar module对外输出的classes。
- APP_CLASSES. apk module对外输出的classes。
- FEATURE_CLASSES. feature module对外输出的classes。
- PROCESSED_RES. aapt输出的编译好的资源。
- PACKAGED_RES. aar module对外输出的资源。
- …

再看taskSpecs，要了解清楚它是怎么来的。需要先看懂outputSpec()和variantSpec()这两个方法。先看outputSpec()这个方法，如下：
![image.gif](https://cdn.nlark.com/yuque/0/2019/gif/215777/1575989637661-380fd8c0-c705-4213-b4a8-a95f0d8124b7.gif)
可见，这个方法就只是返回一个OutputPublishingSpec对象，OutputPublishingSpec的构造方法为：
![image.gif](https://cdn.nlark.com/yuque/0/2019/gif/215777/1575989637636-844abf93-758b-4508-a504-314442edbb48.gif)
显然，它就只是简单地赋值。需要注意的是它的3个参数：

- outputType为OutputType类型的参数，表示输出类型，在前面已经分析过。
### 1.3.1 ArtifactType分析
artifactType为ArtifactType类型的参数，表示产物类型，其定义如下：
![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575989637320-6b9499c9-b491-44d0-9683-920098b0efc4.jpeg)
在这里可以看到所有的产物类型了，比如CLASSES，JAR，MANIFEST，ASSETS等等。
### 1.3.2 PublishedConfigType
publishedConfigTypes为发布的configuration的类型集合，因为有些产物可发布到多个configuration中。注意PublishedConfigType定义如下：
![](https://cdn.nlark.com/yuque/0/2019/png/215777/1575989637379-07fdea91-2178-4ed9-8e12-5c74e18a5f91.png)
而variantSpec()方法则如下：

![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575989637346-72660f7f-8dc9-4ba5-b2ec-b6374be82dfb.jpeg)
显然，它也就是先利用variantType和taskSpecs创建VariantPublishingSpec对象，然后将其放入缓存中。
而VariantPublishingSpec的构造方法如下：
![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575989637536-6e2a23ad-3abe-4a35-ab1b-107ca5c9224b.jpeg)
显然，这里也是非常简单的赋值操作，可见，taskSpecs就是在构造方法中被赋值的。
在VariantPublishingSpec的static块中，就有很多的variantSpec()方法调用，如下：
![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575989637318-fdbeb038-c12e-4b6a-b056-1e3ff6eb5541.jpeg)
以VariantType.DEFAULT为例，它表示为默认的variant类型，它对应的OutputPublishingSpec对象非常多，有通过outputSpec(MANIFEST_METADATA, ArtifactType.MANIFEST_METADATA, API_ELEMENTS_ONLY)构造的OutputPublishingSpec对象，它表示输出类型为MANIFES_METADATA的task，其对应的产物类型为ArtifactType.MANIFEST_METADATA，可输出到的configuration类型为API_ELEMENTS_ONLY；类似的，可作出如下总结，详细情况请看下一小节。
在这里，我们先看一下VaraintType的定义，如下：
![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575989637411-d286d061-f5a9-4f2e-a8ab-ec39a7513503.jpeg)
显然，AGP层的VariantType和gradle层的VariantType对应关系如下：
![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575989637343-41e7ceaf-f0f0-4485-9a17-6eec18a638d0.jpeg)
#### 1.3.2.1 VariantType为DEFAULT
前面说过，VariantType为DEFAULT的含义就是build variant为Application的情形；这种类型下，有以下输出类型与产物类型的组合 。

- 输出类型为APK的task，其对应的产物类型为ArtifactType.APK，可输出的configuration类型（集合）为RUNTIME_ELEMENTS，而RUNTIME_ELEMENTS_ONLY的定义如下：

![](https://cdn.nlark.com/yuque/0/2019/png/215777/1575989637413-736e8fff-9656-47c3-b83d-fe6c4f65028a.png)

- 可见，实际上就只包含RUNTIME_ELEMENTS：
- 输出类型为APK_MAPPING的task，其产物类型为ArtifactType.APK_MAPPING，可输出的configuration类型(集合)为API_ELEMENTS_ONLY，而API_ELEMENTS_ONLY的定义如下：

![](https://cdn.nlark.com/yuque/0/2019/png/215777/1575989637379-a4fa8cb4-7915-492d-90a4-bb92c0825149.png)

- 可见，它就只包含API_ELEMENTS；
- 输出类型为MERGED_ASSETS的task，其产物类型为ArtifactType.ASSETS，可输出的configuration类型（集合）为BUNDLE_ELEMENTS_ONLY，类似地，BUNDLE_ELEMENTS_ONLY中也只包含BUNDLE_ELEMENTS；

其他的不说了，感兴趣的童鞋可以自己去看。**1.3.2.2 VariantType为LIBRARY**前面说过，VariantType为LIBRARY对应的是build variant为library的情形。此时，有以下输出类型与产物类型的组合 。

- 输出类型为LIBRARY_MANIFEST的task，其产物类型为ArtifactType.MANIFEST，可输出到的configuration类型（集合）为API_AND_RUNTIME_ELEMENTS；API_AND_RUNTIME_ELEMENTS的定义如下：

![](https://cdn.nlark.com/yuque/0/2019/png/215777/1575989637567-fd22a647-f9f2-4a20-ba0c-f8c1acce18b0.png)

- 显然，它包含了API_ELEMENTS和RUNTIME_ELEMENTS这两种configuration类型，用通俗地话说就是这个task的产物可分别给出到编译时和运行时的configuration中；
- 输出类型为LIBRARY_ASSETS的task，其产物类型为ArtifactType.ASSETS，可输出到的configuration类型为RUNTIME_ELEMENTS_ONLY，即只能输出到运行时的configuration中；
- 输出类型为LIBRARY_CLASSES的task，其产物类型为ArtifactType.CLASSES，可输出到的configuration类型集合为API_AND_RUNTIME_ELEMENTS，即可输出到编译时和运行时的configuration中；
- 输出类型为FULL_JAR的task，其产物类型为ArtifactType.JAR，可输出到的类型为API_AND_RUNTIME_ELEMENTS；
- 输出类型为LIBRARY_JNI的task，其产物类型为ArtifactType.JNI，可输出到的configuration类型为RUNTIME_ELEMENTS_ONLY。
#### 1.3.2.3 VariantType为FEATURE
前面分析过，VariantType.FEATURE对应的就是build variant为feature的情形；此时有以下输出类型与产物类型的组合。

- 输出类型为METADATA_FEATURE_MANIFEST的task，其产物类型为ArtifactType.METADATA_FEATURE_MANIFEST，可输出到的configuration类型为METADATA_ELEMENTS_ONLY；
- 输出类型为FEATURE_APPLICATION_ID_DECLARATION的task，其产物类型为ArtifactType.FEATURE_APPLICATION_ID_DECLARATION，可输出到的configuration类型为API_ELEMENTS_ONLY；
- 输出类型为FEATURE_CLASSES的task，其产物类型为ArtifactType.CLASSES，可输出到的configuration类型为API_ELEMENTS_ONLY；
- 输出类型为APK的task，其产物类型为ArtifactType.CLASSES，可输出的configuration类型为API_ELEMENTS_ONLY；
### 1.3.3 variantPublishingSpec.getSpec(outputType)的结果
在本文开头说过，输出类型为LIBRARY_MANIFEST，而在VariantPublishingSpec中，有如下语句：
![](https://cdn.nlark.com/yuque/0/2019/png/215777/1575989637415-147c2ab6-ece5-4d5e-bd1f-73721face98f.png)
可见，outputType为LIBRARY_MANIFEST，对应的产物类型为ArtifactType.MANIFEST；即此时返回的OutputPublishingSpec对象中outputType为LIBRARY_MANIFEST，产物类型为ArtifactType.MANIFEST，可输出的configuration类型为API_AND_RUNTIME_ELEMENTS。即taskSpec.getArtifactType()为ArtifactType.MANIFEST，taskSpec.getPublishedConfigTypes()为只包含API_AND_RUNTIME_ELEMENTS的Set。之后，调用publishIntermediateArtifact()方法，在下一章分析这个方法的调用流程。
# 2. publishIntermediateArtifact()
VariantScopeImpl的publishIntermediateArtifact()方法如下：
![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575989637378-83e643b9-78c0-4743-bad4-38f304ef7fb9.jpeg)
可以看到，这个方法中对于所有的configuration类型都作了处理，上一章说过，由于LIBRARY_MANIFEST对应的publishConfigTypes为API_AND_RUNTIME_ELEMENTS，即同时包含了API_ELEMENTS和RUNTIME_ELEMENTS，之后调用publishArtifactToConfiguration()方法发布到相应的configurion。就以RUNTIME_ELEMENTS为例，则发布到buildVaraintRuntimeElements这个configuration中，比如build variant为debug时，则为debugRuntimeElements。下面分析publishArtifactToConfiguration()方法，如下：
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWkpfu3WMQgPVqETicpibhdVW56gEeE5ZmOVLn9We4qJh4oHGrcd9WLicYFUGlcxmbYqKGVWgbxS2oYw/640?wx_fmt=png&amp;from=appmsg)
这个configuratiton是DefaultConfiguration对象，下面开始就进入gradle层的代码进行分析。
## 2.1 DefaultConfiguration.getOutgoing()方法分析
getOutgoing()方法如下：
![](https://cdn.nlark.com/yuque/0/2019/png/215777/1575989638617-557b1e8b-952a-4200-9468-9b49b65c0353.png)
结合outgoing初始化的代码，可知outgoing是DefaultConfigurationPublications对象。
再回到android gradle plugin层，下一步调用outgoing的variants()方法，DefaultConfigurationPublications的variants()方法如下：
![](https://cdn.nlark.com/yuque/0/2019/png/215777/1575989637447-45ad05eb-bf0f-4aa3-a2a3-6f27475fb982.png)

可见，就只是执行Action的execute()方法，不过在执行之前，先调用了getVariants()方法以传入NamedDomainObjectContainer给action调用。
getVariants()方法如下：
![image.gif](https://cdn.nlark.com/yuque/0/2019/gif/215777/1575989637636-c881a70d-2488-44fe-b634-83ee6ac1be7a.gif)
可见，这里是先创建一个ConfigurationVariantFactory对象，然后传入此对象以创建FactoryNamedDomainObjectContainer对象。

## 2.2 FactoryNamedDomainObjectContainer.create()
之后调用的action为：
![image.gif](https://cdn.nlark.com/yuque/0/2019/gif/215777/1575989637641-c669c8e7-245c-44d5-b275-ca3580e3aa53.gif)
而FactoryNamedDomainObjectContainer.create()方法如下：
![image.gif](https://cdn.nlark.com/yuque/0/2019/gif/215777/1575989637637-50e3e258-4453-48ac-b521-ebdeb25cb45a.gif)
重载的create()方法为：

![](https://cdn.nlark.com/yuque/0/2019/png/215777/1575989637378-bc628fd0-94a7-42a4-bcf9-3b8ccefeae30.png)
这个方法的作用就是根据传入的type创建相应的对象，并且添加到缓存中，最后再调用configAction.execute()方法。create()方法是在AbstractNamedDomainObjectContainer中，而FactoryNamedDomainObjectContainer中实现的doCreate()方法如下：
![](https://cdn.nlark.com/yuque/0/2019/png/215777/1575989637404-9d002e95-31d2-42d1-8f75-165356d99aca.png)

可见，就是调用factory去创建，而factory为DefaultConfigurationPublications中的ConfigurationVariantFactory对象，其定义如下：
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWkpfu3WMQgPVqETicpibhdVWF6dqUWlrGJBzrIZQvu1doBJTaB34ibWvk9O7tWQaibxaNNe5hgiaCn4ew/640?wx_fmt=png&amp;from=appmsg)

可见，其实就是通过instantiator创建一个DefaultVariant对象。前面说过，artifactType的值为ArtifactType.MANIFEST, 其getType()返回的值为"android-manifest"，所以创建的这个DefaultVariant对象的name为"android-manifest"。
## 2.3 DefaultVariant.artifact()方法

回到VariantScopeImpl中，在创建name为"android-manifest"的DefaultVariant对象之后，执行的action为：
![](https://cdn.nlark.com/yuque/0/2019/png/215777/1575989637445-eb2d7256-fd4f-4d6a-824a-6ac4d5333d1f.png)
显然，这里执行的其实是DefaultVariant的artifact()方法，其方法如下：
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWkpfu3WMQgPVqETicpibhdVWPTVkk9ibRVDE3msKpGsxTEsP6xeOmLBGialibsepiaTegBN4ITOq7gv13A/640?wx_fmt=png&amp;from=appmsg)
可见，这里先是利用artifactNotationParser创建一个ConfigurablePublishArtifact对象，然后添加到缓存中。之后执行配置操作。
配置操作也非常简单，如下：
![](https://cdn.nlark.com/yuque/0/2019/png/215777/1575989637563-588cfe00-8cc4-4727-8ba3-f638b25be2f5.png)
显然，就是为ConfigurablePublishArtifact对象设置类型和编译依赖。
# 3.总结

通过上面android gradle plugin层和gradle层的流程梳理，可以得到以下结论：

- 需要对外发布的artifacts，都有一个OutputType和与之对应的ArtifactType。
- 需要对外发布的artifacts，都有一个PublishedConfigType集合，表示这个artifacts能够发布到哪些类型的configuration中。
- 在gradle层会创建一个名为artifactType.getType()的DefaultVariant对象并缓存起来。
- 在gradle层会创建一个ConfigurablePublishArtifact对象（这个对象缓存在DefaultVariant中），并且会为其设置type和builtBy属性，其中的builtBy就是要生成这个产物所依赖的task。

最后，本文的核心流程可概括如下：![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWkpfu3WMQgPVqETicpibhdVW0kAdIz2iaX9pWqZK6nHPt7MbLCHdWoJPudmLwxGViauc6uB2q5uyAdIA/640?wx_fmt=png&amp;from=appmsg)到这里，android gradle plugin和gradle一起构建的生产者-消费者模型就呼之欲出了。显然，本文只讲了左边的发布流程，至于右边的消费流程，且听下回分解。

