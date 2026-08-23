---
title: "自定义Gragle插件"
published: 2022-05-03
description: "自定义Gragle插件"
tags: ["Gradle","构建工具"]
category: "gradle"
draft: false
slug: "gradle-011"
---

[https://juejin.cn/post/7267091810380136508](https://juejin.cn/post/7267091810380136508)


# 1、前言
Gradle插件开发在Android进阶知识中是占有一定比例的，特别是在性能优化领域，基本都会涉及，而且跟我们日常的编译打包也息息相关，加上有不少招聘要求里也明确要有Gradle插件开发经验，所以即使大部分人的日常开发中可能用不到插件开发，但也心向往之。
# 2、Gradle插件是什么
Gradle插件(Plugin)是一种用于扩展和定制 Gradle构建系统功能的机制。Gradle是一个强大的构建自动化工具，用于构建和管理各种类型的项目，从简单的Java应用到复杂的多模块企业级项目。插件为Gradle提供了灵活性，允许开发者根据特定需求添加自定义行为和功能。
Gradle插件可以执行各种任务，包括编译代码、执行测试、打包文件、生成文档等等。插件可以访问和操作 Gradle的构建模型，如项目、任务、依赖关系等，从而实现对构建过程的控制和定制。
Gradle提供了丰富的插件生态系统，可以使用现有的官方插件或第三方插件来增强构建过程。许多流行的框架和工具，如 Android、Spring Boot、Kotlin 等，都有相应的Gradle插件，使得与这些技术栈的集成变得更加简单和高效。
比如大家熟悉的Android插件com.android.application：
```
bash
 plugins {
    id 'com.android.application'
}
```
通过编写自己的Gradle插件，你可以定制和扩展 Gradle 构建系统，以适应特定项目的需求。你可以在插件中定义自定义任务、配置扩展、操作项目属性、应用其他插件等。插件使得构建过程变得可控和可定制，从而提高开发效率。
# 3、为什么要写插件
写插件的意义：

1. 封装，把具体的逻辑抽出去，项目只要运行插件就行了，不用放在某一个build.gradle文件中，而降低build.gradle的可读性；
2. 复用，把通用的逻辑抽出去，用的时候只要apply应用插件即可，不用一遍一遍的复制，也可以提供给别的项目使用；
3. 定制：如果需要在编译期做一些插桩、Hook之类的自定义操作，也需要用到编译插件；
# 4、插件写在哪
[上文](https://juejin.cn/post/7248207744087277605)我们介绍了Gradle Task，其中有提到Task写在哪，那Plugin又写在哪呢？
插件Plugin可以写在3个地方：

1. 跟Task一样，写在build.gradle文件中，作用域当前Project；
2. 写在buildSrc里，作用域当前项目所有Project；
3. 写在单独项目里，发布后可提供给所有项目所有Project；

根据自己需求，结合插件作用域，写在不同的位置即可。
# 5、自定义插件
编写一个插件Plugin其实挺简单的，只需要实现Plugin接口，并实现唯一apply方法即可。
我们就直接写在build.gradle文件中：
```
typescript
 class YechaoaPlugin implements Plugin<Project> {

    @Override
    void apply(Project project) {
        println("这是插件：${this.class.name}")
    }
}

apply plugin: YechaoaPlugin
//apply(plugin: YechaoaPlugin)
```
这实际上是一个内联类。
写完别忘了apply依赖上。第9行的apply方法是调用的PluginAware接口的apply()方法，参数是一个map，用来映射Plugin Id。
sync输出：
```
markdown
 > Configure project :app
这是插件：YechaoaPlugin
...
```
在[上一文](https://juejin.cn/post/7248207744087277605)Task详解中提到，Task是Project中的一个方法，所以我们需要通过Project去创建一个Task。示例中YechaoaPlugin类实现了Plugin接口并实现唯一apply方法，而apply方法中提供了Project对象，那我们就也可以在Plugin中去创建一个Task。
```
dart
 class YechaoaPlugin implements Plugin<Project> {

    @Override
    void apply(Project project) {
        println("这是插件：${this.class.name}")
        project.task("YechaoaPluginTask") { task ->
            task.doLast {
                println("这是插件：${this.class.name}，它创建了一个Task：${task.name}")
            }
        }
    }
}
```
如上，我们在Plugin里创建了一个Task，这时候sync是不会执行Task里面的打印的，得单独去执行这个Task。
执行：
```
bash
 ./gradlew YechaoaPluginTask
```
输出：
```
arduino
 > Task :app:YechaoaPluginTask
这是插件：YechaoaPlugin，它创建了一个Task：YechaoaPluginTask
```
ok，最基本的Plugin编写就是这么简单。
结合以上两次输出，不管是单纯的在Plugin里打印也好，还是在Plugin里创建Task，当我们依赖YechaoaPlugin插件的时候，即apply plugin: YechaoaPlugin，这个apply会把这个插件放进PluginContainer里，类似TaskContainer，同时这个apply也是在编译阶段执行Plugin接口的apply()方法，所以sync执行构建后会有输出，执行的Task也是在有向无环图里。
# 6、自定义插件扩展
在[Gradle系列的第二章](https://juejin.cn/post/7160337743552675847)里，通过源码分析了android{ }闭包是怎么来的，android{ }闭包是我们非常熟悉的配置，通过DSL的方式，我们经常会在里面配置compileSdk、buildTypes等。
而在自定义插件的时候经常也会有这种自定义配置的需求，通过这些自定义的配置可以让我们的插件提供更丰富的能力。这些配置就是通过扩展插件来的。
## 6.1、定义扩展对象
```
vbnet
 interface YechaoaPluginExtension{
    Property<String> getTitle()
}
```
可以是一个接口，也可以是一个类。
## 6.2、把扩展添加给Plugin并使用
```
dart
 class YechaoaPlugin implements Plugin<Project> {

    @Override
    void apply(Project project) {
        println("这是插件：${this.class.name}")
        def extension = project.extensions.create("yechaoa", YechaoaPluginExtension)
        project.task("YechaoaPluginTask") { task ->
            task.doLast {
                println("这是插件${this.class.name}，它创建了一个Task：${task.name}")
                println(extension.title.get())
            }
        }
    }
}
```
project.extensions.create()方法接收两个参数：

1. 第一个是名字，比如yechaoa、android；
2. 第二个就是扩展对象，然后返回这个扩展对象，通过这个扩展对象的方法就可以获取自定义的配置参数；
## 6.3、配置参数
```
ini
 yechaoa.massage = "【Gradle-8】Gradle插件开发指南"
```
一个配置可以直接省略写，也可以这么写
```
ini
 yechaoa {
  	massage = "【Gradle-8】Gradle插件开发指南"
}
```
如果没有设置配置参数的话，Gradle也提供了默认值的设置：
```
swift
 extension.title.convention("默认配置title")
```
如果是类对象，就定义一下setter/getter。
如果有多个配置怎么写？扩展多个配置属性就好了。
## 6.4、嵌套扩展
如下，android { }里面还有defaultConfig { }
```
arduino
 android {
    namespace 'com.yechaoa.gradlex'
    compileSdk 32

    defaultConfig {
        applicationId "com.yechaoa.gradlex"
        ...
    }
}
```
嵌套扩展其实也很简单，就是套娃。
上面我们用接口定义了扩展属性，下面换一种写法，用class对象来定义。
### 6.4.1、定义扩展
```
arduino
 class YechaoaPluginExtension {
    String title
    int chapter
    SubExtension subExtension

    YechaoaPluginExtension(Project project) {
        subExtension = project.extensions.create('sub', SubExtension.class)
    }
}
class SubExtension {
    String author
}
```
多定义了一个SubExtension类，然后在YechaoaPluginExtension实例化的时候加到ExtensionContainer中。
如果要类嵌套的话也行，得是内联类，不然编译识别不了。
### 6.4.2、获取扩展属性
```
dart
 class YechaoaPlugin implements Plugin<Project> {

    @Override
    void apply(Project project) {
        println("这是插件：${this.class.name}")
        def extension = project.extensions.create("yechaoa", YechaoaPluginExtension)
        // 设置默认值 可以定义set()方法 然后在这里set
        project.task("YechaoaPluginTask") { task ->
            task.doLast {
                println("这是插件${this.class.name}，它创建了一个Task：${task.name}")
                println("title = ${extension.title}")
                println("chapter = ${extension.chapter}")
                println("author = ${extension.subExtension.author}")
            }
        }
    }
}
```
相比于上面接口定义的示例，少了Property对象的.get()，也去掉了设置的默认值的环节，如果想要的话，在类对象里定义setter/getter方法就行，其它逻辑不变。
### 6.4.3、使用
```
ini
 yechaoa {
    title = "【Gradle-8】Gradle插件开发指南"
    chapter = 8
    sub {
        author = "yechaoa"
    }
}
```
闭包配置中，多了一个sub{ }闭包，就是我们YechaoaPluginExtension类中定义的。
### 6.4.4、执行
```
bash
 ./gradlew YechaoaPluginTask
```
### 6.4.5、输出
```
ini
 > Task :app:YechaoaPluginTask
title = 【Gradle-8】Gradle插件开发指南
chapter = 8
author = yechaoa
```
### 6.4.6、完整代码
```
dart
 class YechaoaPluginExtension {
    String title
    int chapter
    SubExtension subExtension

    YechaoaPluginExtension(Project project) {
        subExtension = project.extensions.create('sub', SubExtension.class)
    }
}
class SubExtension {
    String author
}

class YechaoaPlugin implements Plugin<Project> {

    @Override
    void apply(Project project) {
        println("这是插件：${this.class.name}")
        def extension = project.extensions.create("yechaoa", YechaoaPluginExtension)
        // 设置默认值 可以定义set()方法 然后在这里set
        project.task("YechaoaPluginTask") { task ->
            task.doLast {
                println("这是插件${this.class.name}，它创建了一个Task：${task.name}")
                println("title = ${extension.title}")
                println("chapter = ${extension.chapter}")
                println("author = ${extension.subExtension.author}")
            }
        }
    }
}

apply plugin: YechaoaPlugin

yechaoa {
    title = "【Gradle-8】Gradle插件开发指南"
    chapter = 8
    sub {
        author = "yechaoa"
    }
}
```
现在yechaoa{ }这个配置是不是很熟悉了：
```
ini
 yechaoa {
    title = "【Gradle-8】Gradle插件开发指南"
    chapter = 8
    sub {
        author = "yechaoa"
    }
}
```
是不是跟android{ }一毛一样：
```
arduino
 android {
    namespace 'com.yechaoa.gradlex'
    compileSdk 32

    defaultConfig {
        applicationId "com.yechaoa.gradlex"
        ...
    }
}
```
# 7、编写在单独项目中
上面我们的Plugin是写在build.gradle文件中的，而一般在实际项目中，为了更好的复用，一般都是写在buildSrc或者单独的项目中。
而写在build.gradle文件中和写在buildSrc或者单独的项目中还是有一些区别的，下面带大家一起看下在单独项目中是如果来写的（等同于buildSrc）。
_**来个简单的，就写一个打印项目中所有依赖的Plugin吧。**_
## 7.1、新建Module
新建一个名称为plugin的Module，类型选择为Library或下面的Java or Kotlin Library
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1699454658169-661eab05-635f-457e-a526-9231b0b6b46b.webp)
新建Module之后，会有默认的文件目录，多余的文件都可以删掉的。
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1699454658175-6948e721-aa57-4db3-8cde-f19916afc985.webp)
我们可以看到main文件夹下有java文件夹，Gradle Plugin可以用java写，也可以用kotlin、groovy来学，喜欢用什么就可以在main文件下新建对应语言的文件夹接口，比如kotlin文件夹。
## 7.2、新建文件添加依赖
### 7.2.1、新建类
新建一个DependenciesPlugin类：
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1699454658168-d387b34c-09c2-4279-94d7-dc9796061fa5.webp)
但是这时候还是不能编写Plugin的，因为你这个module里面并没有依赖Gradle相关API。
### 7.2.2、添加依赖
在Gradle 6.4及以后就不用再添加gradleApi()来配置Plugin的依赖啥的了，直接一个java-gradle-plugin插件搞定，它会自动把java、gradleApi()依赖添加到项目中。
并且不需要像以前在src/main/resources/META-INF/gradle-plugins/xxx.properties中来配置你的implementation-class了，直接一个gradlePlugin{ }配置搞定，Gradle会自动生成META-INF描述文件。
在plugin>build.gradle文件中依赖插件：
```
bash
 plugins {
    id 'java-gradle-plugin'
}
```
配置如下：
```
ini
 gradlePlugin{
    plugins{
        DependenciesPlugin{
            id = 'com.yechaoa.plugin.dependencies'
            implementationClass = 'com.yechaoa.plugin.DependenciesPlugin'
        }
    }
}
```

- id：apply时引用的plugin id；
- implementationClass：Plugin路径；

在Gradle 6.4以前：
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1699454658213-27cb87ed-4b2e-4333-ab28-b007973dfe1c.webp)
```
ini
 implementation-class=com.yechaoa.plugin.DependenciesPlugin
```
因为以前这些文件夹、配置全是手动的，很繁琐，相比之下，现在更爽多了。
## 7.3、编写Plugin
```
java
 package com.yechaoa.plugin;


import org.gradle.api.Plugin;
import org.gradle.api.Project;

/**
 * GitHub : https://github.com/yechaoa
 * CSDN : http://blog.csdn.net/yechaoa
 * <p>
 * Created by yechao on 2023/8/8.
 * Describe :
 */
class DependenciesPlugin implements Plugin<Project> {

    @Override
    public void apply(Project project) {
        System.out.println(">>>>>>>>  " + this.getClass().getName());
    }
}
```

1. 新建一个类实现Plugin接口；
2. 在apply方法中实现自己的逻辑，这里示例打印；

到此，Plugin的基本雏形就有了。
添加依赖使用：
```
arduino
 apply plugin: 'com.yechaoa.plugin.dependencies'
```
但是现在外部项目还用不了，直接引用这个 会出现找不到plugin的情况(not found)。
```
python
 Plugin with id 'com.yechaoa.plugin.dependencies' not found.
```
因为这个Plugin是在单独项目中写的，准确的来说，跟别的项目其实是没有关系的，想要找到这个插件，就得发布这个插件才行。
## 7.4、本地发布
本地发布要比远端发布简单多了，虽然远端发布也不难，只是繁琐。
### 7.4.1、Maven插件
首先，比较常用的仓库是maven，在plugin>build.gradle文件中先依赖一个maven发布的插件'maven-publish'
```
bash
 plugins {
    id 'maven-publish'
}

dependencies {
    implementation 'com.android.tools.build:gradle:7.3.0'
}
```
### 7.4.2、发布配置
添加发布配置
```
csharp
 group 'com.yechaoa.plugin'
version '1.0.0'

publishing {
    // 配置Plugin GAV
    publications {
        maven(MavenPublication) {
            groupId = group
            artifactId = 'dependencies'
            version = version

            from components.java
        }
    }
    // 配置仓库地址
    repositories {
        maven {
            url layout.buildDirectory.dir("maven-repo")
        }
    }
}
```
### 7.4.3、执行发布操作
```
bash
 ./gradlew publish
```
或者在Android Studio右边Gradle可视化的面板点击运行publish：
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1699454658628-bf4675b4-012a-4409-bc39-3417c0a6913b.webp)
### 7.4.4、生成产物
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1699454658623-30c66170-4ff6-416c-b31d-73e4bc15537a.webp)
ok，这时候build文件夹下已经有本地发布配置的maven-repo文件夹了。
可以再确认一下maven的元数据和pom文件：
```
xml
 <metadata>
  <groupId>com.yechaoa.plugin</groupId>
  <artifactId>dependencies</artifactId>
  <versioning>
    <latest>1.0.0</latest>
    <release>1.0.0</release>
    <versions>
      <version>1.0.0</version>
    </versions>
    <lastUpdated>20230809154815</lastUpdated>
  </versioning>
</metadata>
```
## 7.5、使用
ok，本地发布完了，要想使用这个插件，跟我们正常依赖插件是一样的流程。
三步走：

1. 在settings.gradle文件中配置插件仓库地址
```
arduino
 pluginManagement {
    repositories {
        // ...
        maven {
            url './maven-repo'
        }
    }
}
```

1. 在project>build.gradle文件中添加插件依赖
```
scss
 buildscript {
    dependencies {
        classpath('com.yechaoa.plugin:dependencies:1.0.0')
    }
}
```

1. 在app:build.gradle文件中依赖我们的plugin
```
bash
 plugins {
    id 'com.yechaoa.plugin.dependencies'
}
```
以上配置都是在app模块中添加的，即需要使用的模块。
编译看效果：
```
shell
 > Configure project :app
>>>>>>>>  com.yechaoa.plugin.DependenciesPlugin
```
ok，正确打印出来了，说明我们自定义的plugin已经可以对外提供使用了。
注意：本地依赖使用的时候，要先发布，再依赖插件，否则就会出现cannot found找不到依赖的情况。
## 7.6、功能实现
上面的示例只是一个打印，继续实现我们的功能，把所有的依赖项打印出来。
打印依赖项的方式有很多，比如gradle命令
```
bash
 ./gradlew app:dependencies
```
那如果我要区分官方库和三方库怎么办呢，这时候就无法满足了。
下面改造一下上面的Plugin：
```
csharp
 class DependenciesPlugin implements Plugin<Project> {

    private final String TAG = "DependenciesPlugin >>>>> ";

    @Override
    public void apply(Project project) {
        System.out.println(TAG + this.getClass().getName());

        DependenciesPluginExtension extension = project.getExtensions().create("printDependencies", DependenciesPluginExtension.class);

        project.afterEvaluate(pro -> {

            /*
             * 扩展的配置要在 project.afterEvaluate 之后获取哦
             * 因为配置阶段完成，才能读取参数
             * 且配置完成，才能拿到所有的依赖
             */

            // 默认开启打印
            extension.getEnable().convention(false);

            if (extension.getEnable().get()) {
                // debug/release也可以加配置
                System.out.println(TAG + "已开启依赖打印");

                AppExtension androidExtension = project.getExtensions().getByType(AppExtension.class);

                androidExtension.getApplicationVariants().all(applicationVariant -> {
                    System.out.println(TAG + ">>>>>>>>  applicationVariant.getName() = " + applicationVariant.getName());
                    // 方式一：build.gradle 文件中添加的依赖
                    Configuration configuration = project.getConfigurations().getByName(applicationVariant.getName() + "CompileClasspath");
                    Set<Dependency> allDependencies = configuration.getAllDependencies();
//                for (Dependency dependency : allDependencies) {
//                    System.out.println(TAG + "dependency === " + dependency.getGroup() + ":" + dependency.getName() + ":" + dependency.getVersion());
//                }

                    List<String> androidLibs = new ArrayList<>();
                    List<String> otherLibs = new ArrayList<>();

                    // 方式二：所有的依赖，包括依赖中的依赖
                    configuration.getResolvedConfiguration().getLenientConfiguration().getAllModuleDependencies().forEach(resolvedDependency -> {
                        ModuleVersionIdentifier identifier = resolvedDependency.getModule().getId();
                        //System.out.println(TAG + "identifier === " + identifier.getGroup() + ":" + identifier.getName() + ":" + identifier.getVersion());
                        if (identifier.getGroup().contains("androidx") || identifier.getGroup().contains("com.google") || identifier.getGroup().contains("org.jetbrains")) {
                            androidLibs.add(identifier.getGroup() + ":" + identifier.getName() + ":" + identifier.getVersion());
                        } else {
                            otherLibs.add(identifier.getGroup() + ":" + identifier.getName() + ":" + identifier.getVersion());
                        }
                    });

                    System.out.println("--------------官方库 start--------------");
                    androidLibs.forEach(System.out::println);
                    System.out.println("--------------官方库 end--------------");

                    System.out.println("--------------三方库 start--------------");
                    otherLibs.forEach(System.out::println);
                    System.out.println("--------------三方库 end--------------");
                });
            } else {
                System.out.println(TAG + "已关闭依赖打印");
            }
        });

    }
}
```
扩展：
```
csharp
 interface DependenciesPluginExtension {
    Property<Boolean> getEnable();
}
```
使用：
```
ini
 printDependencies {
    enable = true
}
```
小结：

1. 先是加了一个配置enable来判断是否需要打印依赖；
2. 在项目评估完成之后（project.afterEvaluate），获取项目配置（Configuration）；
3. 通过Configuration获取所有的依赖（getAllModuleDependencies）；
4. 遍历获取GAV，并分类；
5. 最后打印出来；

这里有一点需要注意，我们需要在project.afterEvaluate方法中去获取扩展配置，因为apply plugin的执行时机早于扩展配置，否则获取不到扩展配置的值。
编译运行输出：
```
makefile
 > Configure project :app
>>>>>>>>  com.yechaoa.plugin.DependenciesPlugin
>>>>>>>>  applicationVariant.getName() = debug

--------------官方库 start--------------
com.google.android.material:material:1.8.0
androidx.appcompat:appcompat:1.5.0
org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.7.10

...（省略部分）
    
org.jetbrains.kotlinx:kotlinx-coroutines-bom:1.6.1
androidx.arch.core:core-runtime:2.1.0
org.jetbrains.kotlinx:kotlinx-coroutines-core-jvm:1.6.1
--------------官方库 end--------------
--------------三方库 start--------------
com.squareup.okhttp3:okhttp:4.10.0
com.squareup.retrofit2:retrofit:2.9.0
com.squareup.okio:okio:3.0.0
com.squareup.okio:okio-jvm:3.0.0
--------------三方库 end--------------
```
ok，在独立项目中自定义插件，把所有的依赖区分并打印出来的效果就实现了。
# 8、总结
我们先是介绍了Gradle插件，然后以最基本的写法上手，然后又介绍了Plugin扩展的实现和用法，最后以一个小例子介绍了Plugin在独立项目中的编写、发布和供外部使用的过程。
总体而言，难度一般，但是也有一些小细节需要注意，比如对Gradle生命周期的掌握、使用插件的流程等。
# 9、最后
有朋友反馈之前的文章虽然都写的很棒，但是篇幅有点长，不是很好消化。。
虽然但是，Gradle的东西确实很多，后面会酌情精简一些。
写作不易，感谢支持~
# 10、GitHub
[github.com/yechaoa/Gra…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fyechaoa%2FGradleX)
# 11、相关文档

- [Developing Custom Gradle Plugins](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fuserguide%2Fcustom_plugins.html)
- [Gradle Plugin Development Plugin](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fuserguide%2Fjava_gradle_plugin.html%23java_gradle_plugin)
- [Using Gradle Plugins](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fuserguide%2Fplugins.html)
- [【Gradle-4】Gradle的生命周期](https://juejin.cn/post/7170684769083555877)
- [【Gradle-7】Gradle构建核心之Task指南](https://juejin.cn/post/7248207744087277605)

