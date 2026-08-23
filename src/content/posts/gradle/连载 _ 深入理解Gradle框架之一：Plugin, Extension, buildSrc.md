---
title: "连载 _ 深入理解Gradle框架之一：Plugin, Extension, buildSrc"
published: 2024-01-23
description: "连载 _ 深入理解Gradle框架之一：Plugin, Extension, buildSrc"
tags: ["Gradle","构建工具"]
category: "gradle"
draft: false
slug: "gradle-012"
---

## 缘起
从2018年下半年开始，因为工作需要，开始深入了解Android Gradle plugin和Gradle框架，在看完Android Gradle plugin 3.1.x和3.2.x版本的源码之后，发现目前开源的几乎所有插件化框架，因为没有理解Android Gradle plugin的原理，打包代码的实现都非常混乱，导致的结果就是很难随着Android Gradle plugin的升级而快速升级，所以目前几乎所有开源的插件化项目都因不适应新的Gradle版本问题而不可用。
另一方面，**随着项目的迭代，引入越来越多的Gradle plugin，其中对于Transform的滥用是导致项目编译速度越来越慢的最重要的一个原因了，然而，实际上，对于Transform的使用是有很大的优化空间的。**
加上目前不管是中文还是英文，几乎所有这方面的文章都停留在基础使用的阶段，真正深入分析原理的几乎没有。
所以一直在酝酿写一个Gradle系列的文章，一方面让大家了解Android Gradle plugin的原理（尽管各个大版本之间有差别，然而大版本内基本是一脉相承），另一方面是在介绍原理的过程中，也会加入一些我觉得是Best Practice的Demo。
或许通过这个系列，能够引导大家都去改进自己实现的Plugin, 最终能够更快更好地实现自己的编译时功能。
p.s：因为基础使用的文章已经有太多了，对于这一块我基本上就是一笔带过，不会花太多笔墨。
## 系列说明
在讲解整个系列之前，先看一下Gradle的架构是怎样的，如下图所示：
![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575946370735-68d88827-596a-4b68-b647-cbd73c8a97be.jpeg)

- 在最下层的是底层Gradle框架，它主要提供一些基础服务，如task的依赖，有向无环图的构建等
- 上面的则是Google编译工具团队的Android Gradle plugin框架，它主要是在Gradle框架的基础上，创建了很多与Android项目打包有关的task及artifacts
- 最上面的则是开发者自定义的Plugin，一般是在Android Gradle plugin提供的task的基础上，插入一些自定义的task，或者是增加Transform进行编译时代码注入

为了简单起见，我将底层的Gradle框架和Android Gradle plugin框架统称为Gradle框架，整个系列文章其实分析的就是底层Gradle框架和Android Gradle plugin框架的原理，其中侧重点在Android Gradle plugin框架，因为这与我们日常编译息息相关，也是收益最大的部分。

这是深入理解Gradle框架系列的第一篇。整个系列共分为9篇，文章列表如下：

- 第1篇：入门文章，主要讲解Gradle Plugin以及Extension的多种用法，以及buildSrc及gradle插件调试的方法。
- 第2篇：从dependencies出发，阐述DependencyHandler的原理
- 第3篇：关于gradle configuration的预备知识介绍，以及artifacts的发布流程
- 第4篇：artifacts的获取流程
- 第5篇：从TaskManager出发，分析如ApplicationTaskManager，LibraryTaskManager中各主要的Task，最后给出当前版本的编译流程图
- 第6篇：比较3.2.1相比3.1.2中架构的变化
- 第7篇：关于Gradle Transform
- 第8篇：从打包的角度讲解app bundles的原理
- 第9篇：分析资源编译的流程，特别是aapt2的编译流程

我们会陆续更新，敬请期待。
## Plugin
**语言选择**
其实只要是JVM语言，都可以用来写插件，比如Android Gradle plugin团队，在3.2.0之前一直是用Java编写Gradle插件。
国内很多开源项目都是用Groovy编写的，Groovy的优势是书写方便，而且其闭包写法非常灵活，然而Groovy的缺点也非常明显，最大的一点不好就是IDE对其的支持非常不好，不仅仅是语法高亮没做好，还有导航跳转都极为有限，比如build.gradle中的方法跳转不到其定义处。
当然，我自己长期使用Groovy下来，也发现了它的一些缺点，比如each这个闭包，在运行时竟然会出现找不到其成员的情况。
以及出现开发者自定义的成员与其默认成员（Groovy中会为每个类增加一些默认成员）名称重合时，不能给出有效的提示，当然，这个问题我不确定是IDE的问题还是Groovy自身的编译器实现不够完善的问题。
其实到目前为止，**使用Kotlin进行插件开发是最好的选择**，有如下两个原因:

- Kotlin的语法糖完全不输于Groovy, 可以有效提高开发效率
- Kotlin是JetBrains自家的，IDE对其的支持更完善

可能正是这个原因，**Google编译工具组从3.2.0开始，新增的插件全部都是用Kotlin编写的。**
### 插件名与Plugin的关系
比如我们常用的apply plugin: ‘com.android.application’, 其实是对应的AppPlugin， 其声明在源码的META-INF中，如下图所示：
![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575946370868-b9c62da6-c498-41f4-9a71-f2a974a678a7.jpeg)
可以看到，不仅仅有com.android.appliation, 还有我们经常用到的com.android.library，以及com.android.feature, com.android.dynamic-feature。
以com.android.application.properties为例，其内容如下：
`implementation-class=com.android.build.gradle.AppPlugin`
其含义很清楚了，就表示com.android.application对应的插件实现类是com.android.build.gradle.AppPlugin这个类。
其他的类似，就不一一列举了。
### 定义插件的方法
要定义一个Gradle Plugin，则要实现Plugin接口，该接口如下：``

```java
public interface Plugin<T>{
    void apply(T var)
}
```

以我们经常用的AppPlugin和LibraryPlugin, 其继承关系如下：
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWkpfu3WMQgPVqETicpibhdVWke5YJ4R4ibekDLOt9L40yDX1ibjkcZgldaVnNU5Hxia3p549mOYTf1zUQ/640?wx_fmt=png&amp;from=appmsg)
注意，这是3.2.0之前的继承关系，在3.2.0之后，略微有些调整。
可以看到，LibraryPlugin和AppPlugin都继承自BasePlugin， 而BasePlugin实现了Plugin接口，如下：``
```java
public abstract class BasePlugin<E extends BaseExtension2>
        implements Plugin<Project>, ToolingRegistryProvider {
    @VisibleForTesting
    public static final GradleVersion GRADLE_MIN_VERSION =
            GradleVersion.parse(SdkConstants.GRADLE_MINIMUM_VERSION);
    private BaseExtension extension;
    private VariantManager variantManager;
    
    ...
    }
```

这里继承的层级多一层的原因是，有很多共同的逻辑可以抽出来放到BasePlugin中，然而大多数时候，我们可能没有这么复杂的关系，所以直接实现Plugin这个接口即可。
## Extension
Extension其实可以理解成Java中的Java bean，它的作用也是类似的，即获取输入数据，然后在插件中使用。
最简单的Extension为例，比如我定义一个名为Student的Extension，其定义如下：``

```java
class Student{
    String name
    int age
    boolean isMale
}
```

然后在Plugin的apply()方法中，添加这个Extension，不然编译时会出现找不到的情形：
`project.extensions.create("student",Student.**class**)`
这样，我们就可以在build.gradle中使用名为student的Extension了，如下：``

```java
student{
    name 'Mike'
    age 18
    isMale true
}
```

注意，这个名称要与创建Extension时的名称一致。
而获取它的方式也很简单：``

```java
Student studen = project.extensions.getByType(Student.class)
```

嵌套的Extension类似，不再赘述。
如果Extension中要包含固定数量的配置项，那很简单，类似下面这样就可以：``

```java
class Fruit{
    int count
    Fruit(Project project){
        project.extensions.create("apple",Apple,"apple")
        project.extension.create("banana",Banana,"banana")
    }
}
```

其配置如下：``

```java
fruit{
    count 3
    apple{
        name 'Big Apple'
        weight 580f
    }
    
    banana{
        name 'Yellow Banana'
        size 19f
    }
}
```

下面要说的是**包含不定数量的配置项的Extension**，就需要用到**NamedDomainObjectContainer**，比如我们常用的编译配置中的productFlavors，就是一个典型的包含不定数量的配置项的Extension。
但是，**如果我们不进行特殊处理，而是直接使用NamedDomainObjectContainer的话，就会发现这个配置项都要用=赋值**，类似下面这样。
接着使用Student, 如果我需要在某个配置项中添加不定项个Student输入，其添加方式如下：``

```java
NamedDomainObjectContainer<Student>studentContainer = project.container(Student)
project.extensions.add('team',studentContainer)
```

然而，此时其配置只能如下：``

```java
team{
    John{
       age=18
       isMale=true
    }
    Daisy{
        age=17
        isMale=false
    }
}
```

注意，这里不需要name了，因为John和Daisy就是name了。
可是，这不科学呀，Groovy的语法不是可以省略么？就比如productFlavors这样：
![](https://cdn.nlark.com/yuque/0/2019/jpeg/215777/1575946370645-a2b15b53-cf3d-4c26-ab02-6477dd2e419e.jpeg)

要达到这样的效果其实并不难，只要做好以下两点：

- item Extension的定义中必须有name这个属性，因为在Factory中会在创建时为这个名称的属性赋值。定义如下：
```java
class Cat{
    String name
    String from
    float weight
}
```
`
`

- 需要定义一个实现了**NamedDomainObjectFactory接口**的类，这个类的构造方法中**必须有instantiator**这个参数，如下：

```java
class CatExtFactory implements NamedDomainObjectFactory<Cat>{
    private Instantiator instantiator
    
    CatExtFactory(Instantiator instantiator){
        this.instantiator=instantiator
    }
    
    @Override
    Cat create(String name){
        return instantiator.newInstance(Cat.class, name)
    }
}
```

此时，gradle配置文件中就可以类似这样写了：

```java
animal{
    count 58
    
    dog{
        from 'America'
        isMale false
    }
    
    catConfig{
        chinaCat{
            from 'China'
            weight 2900.8f
        }
        
        birman{
            from 'Burma'
            weight 5600.51f
        }
        
        shangHaiCat{
            from 'Shanghai'
            weight 3900.56f
        }
        
        beijingCat{
            from 'Beijing'
            weight 4500.09f
        }
    }
}
```

## Plugin Transform
Transform是Android Gradle plugin团队提供给开发者使用的一个抽象类，它的作用是提供接口让开发者可以在源文件编译成为class文件之后，dex之前进行字节码层面的修改。
借助javaassist，ASM这样的字节码处理工具，可在自定义的Transform中进行代码的插入，修改，替换，甚至是新建类与方法。
像美团点评的Robust，以及我开源的Andromeda项目中，都有在Transform中插入代码的示例。
如下是一个自定义Transform实现：

```java
public class AllenCompTransform extends Transform {
    private Project project;
    private IComponentProvider provider
    public AllenCompTransform(Project project,IComponentProvider componentProvider) {
        this.project = project;
        this.provider=componentProvider
    }
    @Override
    public String getName() {
        return "AllenCompTransform";
    }
    @Override
    public Set<QualifiedContent.ContentType> getInputTypes() {
        return TransformManager.CONTENT_CLASS;
    }
    @Override
    public Set<? super QualifiedContent.Scope> getScopes() {
        return TransformManager.SCOPE_FULL_PROJECT;
    }
    @Override
    public boolean isIncremental() {
        return false;
    }
    @Override
    public void transform(TransformInvocation transformInvocation) throws TransformException, InterruptedException, IOException {
        long startTime = System.currentTimeMillis();
        transformInvocation.getOutputProvider().deleteAll();
        File jarFile = transformInvocation.getOutputProvider().getContentLocation("main", getOutputTypes(), getScopes(), Format.JAR);
        if (!jarFile.getParentFile().exists()) {
            jarFile.getParentFile().mkdirs()
        }
        if (jarFile.exists()) {
            jarFile.delete();
        }
        ClassPool classPool = new ClassPool()
        project.android.bootClasspath.each{
            classPool.appendClassPath((String)it.absolutePath)
        }
        def box=ConvertUtils.toCtClasses(transformInvocation.getInputs(),classPool)
        CodeWeaver codeWeaver=new AsmWeaver(provider.getAllActivities(),provider.getAllServices(),provider.getAllReceivers())
        codeWeaver.insertCode(box,jarFile)
        System.out.println("AllenCompTransform cost "+(System.currentTimeMillis()-startTime)+" ms")
    }
}
```

## Gradle插件的发布
绝大多数Gradle插件，我们可能都是只要在公司内部使用，那么只要使用公司内部的maven仓库即可，即配置并运用maven插件，然后执行其upload task即可。这个很简单，不再赘述。
## 特殊的buildSrc
前面说过Gradle插件的发布，那如果我们在插件的代码编写阶段，总不能修改一点点代码，就发布一个版本，然后重新运用吧？
有人可能会说，那就不发布到maven仓库，而是发布到本地仓库呗，然而这样至多发布时节省一点点时间，仍然太麻烦。
幸好有buildSrc！
在buildSrc中定义的插件，可以直接在其他module中运用，而且是类似这种运用方式：
`apply plugin: wang.imallen.blog.comp.MainPlugin`
即直接apply具体的类，而不是其发布名称，这样的话，不管做什么修改，都能马上体现，而不需要等到重新发布版本。
## Gradle插件的调试
以调试:app:assembleRelease这个task为例，其实很简单，分如下两步即可：

- 新建remote target
- 在命令行输入`./gradlew --no-daemon -Dorg.gradle.debug=true :app:assembleRelease`
- 之后选择刚刚创建的remote target，然后点击调试按钮即可


