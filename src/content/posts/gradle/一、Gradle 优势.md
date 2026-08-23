---
title: "一、Gradle 优势"
published: 2023-01-05
description: "一、Gradle 优势"
tags: ["Gradle","构建工具"]
category: "gradle"
draft: false
slug: "gradle-007"
---

[https://juejin.cn/post/6844904132092903437](https://juejin.cn/post/6844904132092903437)

从明面上看，Gradle 是一款强大的构建工具，而且许多文章也仅仅都把 Gradle 当做一款工具对待。但是，Gradle 不仅仅是一款强大的构建工具，它看起来更像是一个编程框架。**Gradle 的组成可以细分为如下三个方面**：

- 1）、groovy 核心语法：**包括 groovy 基本语法、闭包、数据结构、面向对象等等**。
- 2）、Android DSL（build scrpit block）：**Android 插件在 Gradle 所特有的东西，我们可以在不同的 build scrpit block 中去做不同的事情**。
- 3）、Gradle API：**包含 Project、Task、Setting 等等（本文重点）**。

可以看到，Gradle 的语法是以 groovy 为基础的，而且，它还有自己独有的 API，所以我们可以把 Gradle 认作是一款编程框架，利用 Gradle 我们可以在编程中去实现项目构建过程中的所有需求。需要注意的是，想要随心所欲地使用 Gradle，我们必须提前掌握好 groovy，如果对 groovy 还不是很熟悉的建议看看
《深入探索Gradle自动化构建技术（二、Groovy 筑基篇）》
需要注意的是，Groovy 是一门语言，而 DSL 一种特定领域的配置文件，Gradle 是基于 Groovy 的一种框架工具，而 gradlew 则是 gradle 的一个兼容包装工具。
# 一、Gradle 优势
## 1、更好的灵活性
在灵活性上，Gradle 相对于 Maven、Ant 等构建工具， 其 **提供了一系列的 API 让我们有能力去修改或定制项目的构建过程**。例如我们可以 **利用 Gradle 去动态修改生成的 APK 包名**，但是如果是使用的 Maven、Ant 等工具，我们就必须等生成 APK 后，再手动去修改 APK 的名称。
## 2、更细的粒度
在粒度性上，使用 Maven、Ant 等构建工具时，我们的源代码和构建脚本是独立的，而且我们也不知道其内部的处理是怎样的。但是，我们的 Gradle 则不同，它 **从源代码的编译、资源的编译、再到生成 APK 的过程中都是一个接一个来执行的**。
此外，**Gradle 构建的粒度细化到了每一个 task 之中。并且它所有的 Task 源码都是开源的，在我们掌握了这一整套打包流程后，我们就可以通过去修改它的 Task 去动态改变其执行流程**。例如 Tinker 框架的实现过程中，它通过动态地修改 Gradle 的打包过程生成 APK 的同时，也生成了各种补丁文件。
## 3、更好的扩展性
在扩展性上，**Gradle 支持插件机制，所以我们可以复用这些插件，就如同复用库一样简单方便**。
## 4、更强的兼容性
Gradle 不仅自身功能强大，而且它还能 **兼容所有的 Maven、Ant 功能，也就是说，Gradle 吸取了所有构建工具的长处**。
可以看到，Gradle 相比于其它构建工具，其好处不言而喻，而其 **最核心的原因就是因为 Gradle 是一套编程框架**。
# 二、Gradle 构建生命周期
Gradle 的构建过程分为 三部分：初始化阶段、配置阶段和执行阶段。下面分别来详细了解下它们。
## 1、初始化阶段
首先，在这个阶段中，会读取根工程中的 setting.gradle 中的 include 信息，确定有多少工程加入构建，然后，**会为每一个项目（build.gradle 脚本文件）创建一个个与之对应的 Project 实例，最终形成一个项目的层次结构**。 与初始化阶段相关的脚本文件是 **settings.gradle**，而一个 **settings.gradle** 脚本对应一个 **Settings** 对象，我们最常用来声明项目的层次结构的 **include** 就是 **Settings** 对象下的一个方法，**在 Gradle 初始化的时候会构造一个 Settings 实例对象，以执行各个 Project 的初始化配置**。
### settings.gradle
在 **settings.gradle** 文件中，我们可以 **在 Gradle 的构建过程中添加各个生命周期节点监听**，其代码如下所示：
```

gradle.addBuildListener(new BuildListener() {
    void buildStarted(Gradle var1) {
        println '开始构建'
    }
    void settingsEvaluated(Settings var1) {
        // var1.gradle.rootProject 这里访问 Project 对象时会报错，
        // 因为还未完成 Project 的初始化。
        println 'settings 评估完成（settings.gradle 中代码执行完毕）'
    }
    void projectsLoaded(Gradle var1) {
        println '项目结构加载完成（初始化阶段结束）'
        println '初始化结束，可访问根项目：' + var1.gradle.rootProject
    }
    void projectsEvaluated(Gradle var1) {
        println '所有项目评估完成（配置阶段结束）'
    }
    void buildFinished(BuildResult var1) {
        println '构建结束 '
    }
})
```
编写完相应的 Gradle 生命周期监听代码之后，我们就可以在 Build 输出界面看到如下信息：
```
Executing tasks: [clean, :app:assembleSpeedDebug] in project
/Users/quchao/Documents/main-open-project/Awesome-WanAndroid
settings评估完成（settins.gradle中代码执行完毕）
项目结构加载完成（初始化阶段结束）
初始化结束，可访问根项目：root project 'Awesome-WanAndroid'
Configuration on demand is an incubating feature.
> Configure project :app
gradlew version > 4.0
WARNING: API 'variant.getJavaCompiler()' is obsolete and has been
replaced with 'variant.getJavaCompileProvider()'.
It will be removed at the end of 2019.
For more information, see
https://d.android.com/r/tools/task-configuration-avoidance.
To determine what is calling variant.getJavaCompiler(), use
-Pandroid.debug.obsoleteApi=true on the command line to display more
information.
skip tinyPicPlugin Task!!!!!!
skip tinyPicPlugin Task!!!!!!
所有项目评估完成（配置阶段结束）
> Task :clean UP-TO-DATE
:clean spend 1ms
...
> Task :app:clean
:app:clean spend 2ms
> Task :app:packageSpeedDebug
:app:packageSpeedDebug spend 825ms
> Task :app:assembleSpeedDebug
:app:assembleSpeedDebug spend 1ms
构建结束 
Tasks spend time > 50ms:
    ...
```
此外，在 settings.gradle 文件中，我们可以指定其它 project 的位置，这样就可以将其它外部工程中的 moudle 导入到当前的工程之中了。示例代码如下所示：
```
if (useSpeechMoudle) {
    // 导入其它 App 的 speech 语音模块
    include "speech"
    project(":speech").projectDir = new File("../OtherApp/speech")
}
```
## 2、配置阶段
配置阶段的任务是 **执行各项目下的 build.gradle 脚本，完成 Project 的配置，与此同时，会构造 Task 任务依赖关系图以便在执行阶段按照依赖关系执行 Task**。而在配置阶段执行的代码通常来说都会包括以下三个部分的内容，如下所示：

- 1)、**build.gralde 中的各种语句**。
- 2)、**闭包**。
- 3)、**Task 中的配置段语句**。

需要注意的是，**执行任何 Gradle 命令，在初始化阶段和配置阶段的代码都会被执行**。
## 3、执行阶段
**在配置阶段结束后，Gradle 会根据各个任务 Task 的依赖关系来创建一个有向无环图，我们可以通过 Gradle 对象的 getTaskGraph 方法来得到该有向无环图 => TaskExecutionGraph，并且，当有向无环图构建完成之后，所有 Task 执行之前，我们可以通过 whenReady(groovy.lang.Closure) 或者 addTaskExecutionGraphListener(TaskExecutionGraphListener) 来接收相应的通知**，其代码如下所示：
```
gradle.getTaskGraph().addTaskExecutionGraphListener(new
TaskExecutionGraphListener() {
    @Override
    void graphPopulated(TaskExecutionGraph graph) {
    }
})
```
然后，Gradle 构建系统会通过调用 gradle <任务名> 来执行相应的各个任务。
## 4、Hook Gradle 各个生命周期节点
这里借用 joe_H 的 Gradle 生命周期时序图来讲解一下 Gradle 生命周期的整个流程，如下图所示：
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1699451363318-6d6cf65f-1d4a-403f-a627-adb263f1e05e.webp)
可以看到，整个 Gradle 生命周期的流程包含如下 **四个部分**：

- 1）、首先，**解析 settings.gradle 来获取模块信息，这是初始化阶段**。
- 2）、然后，**配置每个模块，配置的时候并不会执行 task**。
- 3）、接着，**配置完了以后，有一个重要的回调 project.afterEvaluate，它表示所有的模块都已经配置完了，可以准备执行 task 了**。
- 4）、最后，**执行指定的 task 及其依赖的 task**。

在 Gradle 构建命令中，最为复杂的命令可以说是 gradle build 这个命令了，因为项目的构建过程中需要依赖很多其它的 task。
### 注意事项

- 1）、**每一个 Hook 点对应的监听器一定要在回调的生命周期之前添加**。
- 2）、**如果注册了多个 project.afterEvaluate 回调，那么执行顺序将与注册顺序保持一致**。
## 5、获取构建各个阶段、任务的耗时情况
了解了 Gradle 生命周期中的各个 Hook 方法之后，我们就可以 **利用它们来获取项目构建各个阶段、任务的耗时情况**，在 settings.gradle 中加入如下代码即可：
```
long beginOfSetting = System.currentTimeMillis()
def beginOfConfig
def configHasBegin = false
def beginOfProjectConfig = new HashMap()
def beginOfProjectExcute
gradle.projectsLoaded {
    println '初始化阶段，耗时：' + (System.currentTimeMillis() -
beginOfSetting) + 'ms'
}
gradle.beforeProject { project ->
    if (!configHasBegin) {
        configHasBegin = true
        beginOfConfig = System.currentTimeMillis()
    }
    beginOfProjectConfig.put(project, System.currentTimeMillis())
}
gradle.afterProject { project ->
    def begin = beginOfProjectConfig.get(project)
    println '配置阶段，' + project + '耗时：' +
(System.currentTimeMillis() - begin) + 'ms'
}
gradle.taskGraph.whenReady {
    println '配置阶段，总共耗时：' + (System.currentTimeMillis() -
beginOfConfig) + 'ms'
    beginOfProjectExcute = System.currentTimeMillis()
}
gradle.taskGraph.beforeTask { task ->
    task.doFirst {
        task.ext.beginOfTask = System.currentTimeMillis()
    }
    task.doLast {
        println '执行阶段，' + task + '耗时：' +
(System.currentTimeMillis() - task.beginOfTask) + 'ms'
    }
}
gradle.buildFinished {
    println '执行阶段，耗时：' + (System.currentTimeMillis() -
beginOfProjectExcute) + 'ms'
}
```
在 Gradle 中，执行每一种类型的配置脚本就会创建与之对应的实例，而在 Gradle 中如 **三种类型的配置脚本**，如下所示：

- 1）、Build Scrpit：**对应一个 Project 实例，即每个 build.gradle 都会转换成一个 Project 实例**。
- 2）、Init Scrpit：**对应一个 Gradle 实例，它在构建初始化时创建，整个构建执行过程中以单例形式存在**。
- 3）、Settings Scrpit：**对应一个 Settings 实例，即每个 settings.gradle 都会转换成一个 Settings 实例**。

可以看到，一个 Gradle 构建流程中会由一至多个 project 实例构成，而每一个 project 实例又是由一至多个 task 构成。下面，我们就来认识下 Project。
# 三、Project
Project 是 Gradle 构建整个应用程序的入口，所以它非常重要，我们必须对其有深刻地了解。不幸的是，网上几乎没有关于 project 讲解的比较好的文章，不过没关系，下面，我们将会一起来深入学习 project api 这部分。
由前可知，每一个 build.gradle 都有一个与之对应的 Project 实例，而在 build.gradle 中，我们通常都会配置一系列的项目依赖，如下面这个依赖：
```
implementation 'com.github.bumptech.glide:glide:4.8.0'
```
类似于 implementation、api 这种依赖关键字，在本质上它就是一个方法调用，在上面，我们使用 implementation() 方法传入了一个 map 参数，参数里面有三对 key-value，完整写法如下所示：
```
implementation group: 'com.github.bumptech.glide' name:'glide' version:'4.8.0'
```
**当我们使用 implementation、api 依赖对应的 aar 文件时，Gradle 会在 repository 仓库 里面找到与之对应的依赖文件，你的仓库中可能包含 jcenter、maven 等一系列仓库，而每一个仓库其实就是很多依赖文件的集合服务器, 而他们就是通过上述的 group、name、version 来进行归类存储的**。
## 1、Project 核心 API 分解
在 Project 中有很多的 API，但是根据它们的 **属性和用途** 我们可以将其分解为 **六大部分**，如下图所示：
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1699451363331-577a755b-c8dd-46bb-8b20-17a1052bd59b.webp)
对于 Project 中各个部分的作用，我们可以先来大致了解下，以便为 Project 的 API 体系建立一个整体的感知能力，如下所示：

- 1）、Project API：**让当前的 Project 拥有了操作它的父 Project 以及管理它的子 Project 的能力**。
- 2）、Task 相关 API：**为当前 Project 提供了新增 Task 以及管理已有 Task 的能力。由于 task 非常重要，我们将放到第四章来进行讲解**。
- 3）、Project 属性相关的 Api：**Gradle 会预先为我们提供一些 Project 属性，而属性相关的 api 让我们拥有了为 Project 添加额外属性的能力**。
- 4）、File 相关 Api：**Project File 相关的 API 主要用来操作我们当前 Project 下的一些文件处理**。
- 5）、Gradle 生命周期 API：**即我们在第二章讲解过的生命周期 API**。
- 6）、其它 API：**添加依赖、添加配置、引入外部文件等等零散 API 的聚合**。
## 2、Project API
**每一个 Groovy 脚本都会被编译器编译成 Script 字节码，而每一个 build.gradle 脚本都会被编译器编译成 Project 字节码，所以我们在 build.gradle 中所写的一切逻辑都是在 Project 类内进行书写的**。下面，我们将按照由易到难的套路来介绍 Project 的一系列重要的 API。
需要提前说明的是，默认情况下我们选定根工程的 build.gradle 这个脚本文件中来学习 Project 的一系列用法，关于 getAllProject 的用法如下所示：
### 1、getAllprojects
getAllprojects 表示 **获取所有 project 的实例**，示例代码如下所示：
```
/**
 * getAllProjects 使用示例
 */
this.getProjects()

def getProjects() {
    println "<================>"
    println " Root Project Start "
    println "<================>"
    // 1、getAllprojects 方法返回一个包含根 project 与其子 project 的 Set 集合
    // eachWithIndex 方法用于遍历集合、数组等可迭代的容器，
    // 并同时返回下标，不同于 each 方法仅返回 project
    this.getAllprojects().eachWithIndex { Project project, int index ->
        // 2、下标为 0，表明当前遍历的是 rootProject
        if (index == 0) {
            println "Root Project is $project"
        } else {
            println "child Project is $project"
        }
    }
}
```
首先，我们使用了 def 关键字定义了一个 getProjects 方法。然后，在注释1处，我们调用了 getAllprojects 方法返回一个包含根 project 与其子 project 的 Set 集合，并链式调用了 eachWithIndex 遍历 Set 集合。接着，在注释2处，我们会判断当前的下标 index 是否是0，如果是，则表明当前遍历的是 rootProject，则输出 rootProject 的名字，否则，输出 child project 的名字。
下面，我们在命令行执行 ./gradlew clean，其运行结果如下所示：
```
quchao@quchaodeMacBook-Pro Awesome-WanAndroid % ./gradlew clean
settings 评估完成（settings.gradle 中代码执行完毕）
项目结构加载完成（初始化阶段结束）
初始化结束，可访问根项目：root project 'Awesome-WanAndroid'
初始化阶段，耗时：5ms
Configuration on demand is an incubating feature.

> Configure project :
<================>
 Root Project Start 
<================>
Root Project is root project 'Awesome-WanAndroid'
child Project is project ':app'
配置阶段，root project 'Awesome-WanAndroid'耗时：284ms

> Configure project :app
...
配置阶段，总共耗时：428ms

> Task :app:clean
执行阶段，task ':app:clean'耗时：1ms
:app:clean spend 2ms
构建结束 
Tasks spend time > 50ms:
执行阶段，耗时：9ms
```
可以看到，执行了初始化之后，就会先配置我们的 rootProject，并输出了对应的工程信息。接着，便会执行子工程 app 的配置。最后，执行了 clean 这个 task。
需要注意的是，**rootProject 与其旗下的各个子工程组成了一个树形结构，但是这颗树的高度也仅仅被限定为了两层**。
### 2、getSubprojects
getSubprojects 表示获取当前工程下所有子工程的实例，示例代码如下所示：
```
/**
 * getAllsubproject 使用示例
 */
this.getSubProjects()

def getSubProjects() {
    println "<================>"
    println " Sub Project Start "
    println "<================>"
    // getSubprojects 方法返回一个包含子 project 的 Set 集合
    this.getSubprojects().each { Project project ->
        println "child Project is $project"
    }
}
```
同 getAllprojects 的用法一样，getSubprojects 方法返回了一个包含子 project 的 Set 集合，这里我们直接使用 each 方法将各个子 project 的名字打印出来。其运行结果如下所示：
```
quchao@quchaodeMacBook-Pro Awesome-WanAndroid % ./gradlew clean
settings 评估完成（settings.gradle 中代码执行完毕）
...

> Configure project :
<================>
 Sub Project Start 
<================>
child Project is project ':app'
配置阶段，root project 'Awesome-WanAndroid'耗时：289ms

> Configure project :app
...
所有项目评估完成（配置阶段结束）
配置阶段，总共耗时：425ms

> Task :app:clean
执行阶段，task ':app:clean'耗时：1ms
:app:clean spend 2ms
构建结束 
Tasks spend time > 50ms:
执行阶段，耗时：9ms
```
可以看到，同样在 Gradle 的配置阶段输出了子工程的名字。
### 3、getParent
getParent 表示 **获取当前 project 的父类，需要注意的是，如果我们在根工程中使用它，获取的父类会为 null，因为根工程没有父类**，所以这里我们直接在 app 的 build.gradle 下编写下面的示例代码：
```
csharp
 ...

> Configure project :
配置阶段，root project 'Awesome-WanAndroid'耗时：104ms

> Configure project :app
gradlew version > 4.0
my parent project is Awesome-WanAndroid
配置阶段，project ':app'耗时：282ms

...

所有项目评估完成（配置阶段结束）
配置阶段，总共耗时：443ms

...
```
可以看到，这里输出了 app project 当前的父类，即 Awesome-WanAndroid project。
### 4、getRootProject
如果我们想在根工程仅仅获取当前的 project 实例该怎么办呢？**直接使用 getRootProject 即可在任意 build.gradle 文件获取当前根工程的 project 实例**，示例代码如下所示：
```
/**
 * 4、getRootProject 使用示例
 */
this.getRootPro()

def getRootPro() {
    def rootProjectName = this.getRootProject().name
    println "root project is $rootProjectName"
}
```
### 5、project
project 表示的是 **指定工程的实例，然后在闭包中对其进行操作**。在使用之前，我们有必要看看 project 方法的源码，如下所示：
```
/**
     * <p>Locates a project by path and configures it using the given closure. If the path is relative, it is
     * interpreted relative to this project. The target project is passed to the closure as the closure's delegate.</p>
     *
     * @param path The path.
     * @param configureClosure The closure to use to configure the project.
     * @return The project with the given path. Never returns null.
     * @throws UnknownProjectException If no project with the given path exists.
     */
    Project project(String path, Closure configureClosure);
```
可以看到，在 project 方法中两个参数，**一个是指定工程的路径，另一个是用来配置该工程的闭包**。下面我们看看如何灵活地使用 project，示例代码如下所示：
```
/**
 * 5、project 使用示例
 */

// 1、闭包参数可以放在括号外面
project("app") { Project project ->
    apply plugin: 'com.android.application'
}

// 2、更简洁的写法是这样的：省略参数
project("app") {
    apply plugin: 'com.android.application'
}
```
使用熟练之后，我们通常会采用注释2处的写法。
### 6、allprojects
allprojects 表示 **用于配置当前 project 及其旗下的每一个子 project**，如下所示：
```
/**
 * 6、allprojects 使用示例
 */

// 同 project 一样的更简洁写法
allprojects {
    repositories {
        google()
        jcenter()
        mavenCentral()
        maven {
            url "https://jitpack.io"
        }
        maven { url "https://plugins.gradle.org/m2/" }
    }
}
```
在 allprojects 中我们一般用来配置一些通用的配置，比如上面最常见的全局仓库配置。
### 7、subprojects
subprojects 可以 **统一配置当前 project 下的所有子 project**，示例代码如下所示：
```
groovy
 /**
 * 7、subprojects 使用示例：
 *    给所有的子工程引入 将 aar 文件上传置 Maven 服务器的配置脚本
 */
subprojects {
    if (project.plugins.hasPlugin("com.android.library")) {
        apply from: '../publishToMaven.gradle'
    }
}
```
在上述示例代码中，我们会先判断当前 project 旗下的子 project 是不是库，如果是库才有必要引入 publishToMaven 脚本。
## 3、project 属性
目前，在 project 接口里，仅仅预先定义了 **七个** 属性，其源码如下所示：
```
java
 public interface Project extends Comparable<Project>, ExtensionAware, PluginAware {
    /**
     * 默认的工程构建文件名称
     */
    String DEFAULT_BUILD_FILE = "build.gradle";

    /**
     * 区分开 project 名字与 task 名字的符号
     */
    String PATH_SEPARATOR = ":";

    /**
     * 默认的构建目录名称
     */
    String DEFAULT_BUILD_DIR_NAME = "build";

    String GRADLE_PROPERTIES = "gradle.properties";

    String SYSTEM_PROP_PREFIX = "systemProp";

    String DEFAULT_VERSION = "unspecified";

    String DEFAULT_STATUS = "release";
    
    ...
}
```
幸运的是，**Gradle 提供了 ext 关键字让我们有能力去定义自身所需要的扩展属性**。有了它便可以对我们工程中的依赖进行全局配置。下面，我们先从配置的远古时代讲起，以便让我们对 gradle 的 全局依赖配置有更深入的理解。
### ext 扩展属性
#### 1、远古时代
在 AS 刚出现的时候，我们的依赖配置代码是这样的：
```
java
 android {
    compileSdkVersion 27
    buildToolsVersion "28.0.3"
    ...
}
```
#### 2、刀耕火种
但是这种直接写值的方式显示是不规范的，因此，后面我们使用了这种方式：
```
java
 def mCompileSdkVersion = 27
def mBuildToolsVersion = "28.0.3"

android {
    compileSdkVersion mCompileSdkVersion
    buildToolsVersion mBuildToolsVersion
    ...
}
```
#### 3、铁犁牛耕
如果每一个子 project 都需要配置相同的 Version，我们就需要多写很多的重复代码，因此，我们可以利用上面我们学过的 subproject 和 ext 来进行简化：
```
java
 // 在根目录下的 build.gradle 中
subprojects {
    ext {
        compileSdkVersion = 27
        buildToolsVersion = "28.0.3"
    }
}

// 在 app moudle 下的 build.gradle 中
android {
    compileSdkVersion this.compileSdkVersion
    buildToolsVersion this.buildToolsVersion
    ...
}
```
#### 4、工业时代
使用 subprojects 方法来定义通用的扩展属性还是存在着很严重的问题，它跟之前的方式一样，还是会在每一个子 project 去定义这些被扩展的属性，此时，我们可以将 subprojects 去除，直接使用 ext 进行全局定义即可：
```
java
 // 在根目录下的 build.gradle 中
ext {
    compileSdkVersion = 27
    buildToolsVersion = "28.0.3"
}
```
#### 5、电器时代
当项目越来越大的时候，在根项目下定义的 ext 扩展属性越来越多，因此，我们可以将这一套全局属性配置在另一个 gradle 脚本中进行定义，这里我们通常会将其命名为 config.gradle，通用的模板如下所示：
```
java
 ext {

    android = [
            compileSdkVersion       : 27,
            buildToolsVersion       : "28.0.3",
            ...
            ]
            
    version = [
            supportLibraryVersion   : "28.0.0",
            ...
            ]
            
    dependencies = [
            // base
            "appcompat-v7"                      : "com.android.support:appcompat-v7:${version["supportLibraryVersion"]}",
            ...
            ]
            
    annotationProcessor = [
            "glide_compiler"                    : "com.github.bumptech.glide:compiler:${version["glideVersion"]}",
            ...
            ]
            
    apiFileDependencies = [
            "launchstarter"                                   : "libs/launchstarter-release-1.0.0.aar",
            ...
            ]
            
    debugImplementationDependencies = [
            "MethodTraceMan"                                  : "com.github.zhengcx:MethodTraceMan:1.0.7"
    ]

    releaseImplementationDependencies = [
            "MethodTraceMan"                                  : "com.github.zhengcx:MethodTraceMan:1.0.5-noop"
    ]
    
    ...
}
```
#### 6、更加智能化的现在
尽管有了很全面的全局依赖配置文件，但是，在我们的各个模块之中，还是不得不写一大长串的依赖代码，因此，我们可以 **使用遍历的方式去进行依赖**，其模板代码如下所示：
```
java
 // 在各个 moulde 下的 build.gradle 脚本下
def implementationDependencies = rootProject.ext.dependencies
def processors = rootProject.ext.annotationProcessor
def apiFileDependencies = rootProject.ext.apiFileDependencies

// 在各个 moulde 下的 build.gradle 脚本的 dependencies 闭包中
// 处理所有的 aar 依赖
apiFileDependencies.each { k, v -> api files(v)}

// 处理所有的 xxximplementation 依赖
implementationDependencies.each { k, v -> implementation v }
debugImplementationDependencies.each { k, v -> debugImplementation v } 
...

// 处理 annotationProcessor 依赖
processors.each { k, v -> annotationProcessor v }

// 处理所有包含 exclude 的依赖
debugImplementationExcludes.each { entry ->
    debugImplementation(entry.key) {
        entry.value.each { childEntry ->
            exclude(group: childEntry.key, module: childEntry.value)
        }
    }
}
```
也许未来随着 Gradle 的不断优化会有更加简洁的方式，如果你有更好地方式，我们可以来探讨一番。
### 在 gradle.properties 下定义扩展属性
除了使用 ext 扩展属性定义额外的属性之外，我们也可以在 gradle.properties 下定义扩展属性，其示例代码如下所示：
```
java
 // 在 gradle.properties 中
mCompileVersion = 27

// 在 app moudle 下的 build.gradle 中
compileSdkVersion mCompileVersion.toInteger()
```
## 4、文件相关 API
在 gradle 中，文件相关的 API 可以总结为如下 **两大类**：

- 1）、**路径获取 API**
   - getRootDir()
   - getProjectDir()
   - getBuildDir()
- 2）、**文件操作相关 API**
   - 文件定位
   - 文件拷贝
   - 文件树遍历
### 1）、路径获取 API
关于路径获取的 API 常用的有 **三种**，其示例代码如下所示：
```
java
 /**
 * 1、路径获取 API
 */
println "the root file path is:" + getRootDir().absolutePath
println "this build file path is:" + getBuildDir().absolutePath
println "this Project file path is:" + getProjectDir().absolutePath
```
然后，我们执行 ./gradlew clean，输出结果如下所示：
```
java
 > Configure project :
the root file path is:/Users/quchao/Documents/main-open-project/Awesome-WanAndroid
this build file path is:/Users/quchao/Documents/main-open-project/Awesome-WanAndroid/build
this Project file path is:/Users/quchao/Documents/main-open-project/Awesome-WanAndroid
配置阶段，root project 'Awesome-WanAndroid'耗时：538ms
```
### 2）、文件操作相关 API
#### 1、文件定位
常用的文件定位 API 有 file/files，其示例代码如下所示：
```
java
 // 在 rootProject 下的 build.gradle 中

/**
 * 1、文件定位之 file
 */
this.getContent("config.gradle")

def getContent(String path) {
    try {
        // 不同与 new file 的需要传入 绝对路径 的方式，
        // file 从相对于当前的 project 工程开始查找
        def mFile = file(path)
        println mFile.text 
    } catch (GradleException e) {
        println e.toString()
        return null
    }
}

/**
 * 1、文件定位之 files
 */
this.getContent("config.gradle", "build.gradle")

def getContent(String path1, String path2) {
    try {
        // 不同与 new file 的需要传入 绝对路径 的方式，
        // file 从相对于当前的 project 工程开始查找
        def mFiles = files(path1, path2)
        println mFiles[0].text + mFiles[1].text
    } catch (GradleException e) {
        println e.toString()
        return null
    }
}
```
#### 2、文件拷贝
常用的文件拷贝 API 为 copy，其示例代码如下所示：
```
java
 /**
 * 2、文件拷贝
 */
copy {
    // 既可以拷贝文件，也可以拷贝文件夹
    // 这里是将 app moudle 下生成的 apk 目录拷贝到
    // 根工程下的 build 目录
    from file("build/outputs/apk")
    into getRootProject().getBuildDir().path + "/apk/"
    exclude {
        // 排除不需要拷贝的文件
    }
    rename {
        // 对拷贝过来的文件进行重命名
    }
}
```
#### 3、文件树遍历
我们可以 **使用 fileTree 将当前目录转换为文件数的形式，然后便可以获取到每一个树元素（节点）进行相应的操作**，其示例代码如下所示：
```
java
 /**
 * 3、文件树遍历
 */
fileTree("build/outputs/apk") { FileTree fileTree ->
    fileTree.visit { FileTreeElement fileTreeElement ->
        println "The file is $fileTreeElement.file.name"
        copy {
            from fileTreeElement.file
            into getRootProject().getBuildDir().path + "/apkTree/"
        }
    }
}
```
## 5、其它 API
### 1、依赖相关 API
#### 根项目下的 buildscript
buildscript 中 **用于配置项目核心的依赖**。其原始的使用示例与简化后的使用示例分别如下所示：
##### 原始的使用示例
```
java
 buildscript { ScriptHandler scriptHandler ->
    // 配置我们工程的仓库地址
    scriptHandler.repositories { RepositoryHandler repositoryHandler ->
        repositoryHandler.google()
        repositoryHandler.jcenter()
        repositoryHandler.mavenCentral()
        repositoryHandler.maven { url 'https://maven.google.com' }
        repositoryHandler.maven { url "https://plugins.gradle.org/m2/" }
        repositoryHandler.maven {
            url uri('../PAGradlePlugin/repo')
        }
        // 访问本地私有 Maven 服务器
        repositoryHandler.maven {
            name "personal"
            url "http://localhost:8081:/JsonChao/repositories"
            credentials {
                username = "JsonChao"
                password = "123456"
            }
        }
    }
    
      // 配置我们工程的插件依赖
    dependencies { DependencyHandler dependencyHandler ->
        dependencyHandler.classpath 'com.android.tools.build:gradle:3.1.4'
       
        ...
    }
```
##### 简化后的使用示例
```
java
 buildscript {
    // 配置我们工程的仓库地址
    repositories {
        google()
        jcenter()
        mavenCentral()
        maven { url 'https://maven.google.com' }
        maven { url "https://plugins.gradle.org/m2/" }
        maven {
            url uri('../PAGradlePlugin/repo')
        }
    }
    
    // 配置我们工程的插件依赖
    dependencies {
        classpath 'com.android.tools.build:gradle:3.1.4'
        
        ...
    }
```
#### app moudle 下的 dependencies
**不同于 根项目 buildscript 中的 dependencies 是用来配置我们 Gradle 工程的插件依赖的，而 app moudle 下的 dependencies 是用来为应用程序添加第三方依赖的**。关于 app moudle 下的依赖使用这里我们 **需要注意下 exclude 与 transitive 的使用** 即可，示例代码如下所示：
```
java
 implementation(rootProject.ext.dependencies.glide) {
        // 排除依赖：一般用于解决资源、代码冲突相关的问题
        exclude module: 'support-v4' 
        // 传递依赖：A => B => C ，B 中使用到了 C 中的依赖，
        // 且 A 依赖于 B，如果打开传递依赖，则 A 能使用到 B 
        // 中所使用的 C 中的依赖，默认都是不打开，即 false
        transitive false 
}
```
### 2、外部命令执行
我们一般是 **使用 Gradle 提供的 exec 来执行外部命令**，下面我们就使用 exec 命令来 **将当前工程下新生产的 APK 文件拷贝到 电脑下的 Downloads 目录中**，示例代码如下所示：
```
java
 /**
 * 使用 exec 执行外部命令
 */
task apkMove() {
    doLast { 
        // 在 gradle 的执行阶段去执行
        def sourcePath = this.buildDir.path + "/outputs/apk/speed/release/"
        def destinationPath = "/Users/quchao/Downloads/"
        def command = "mv -f $sourcePath $destinationPath"
        exec {
            try {
                executable "bash"
                args "-c", command
                println "The command execute is success"
            } catch (GradleException e) {
                println "The command execute is failed"
            }
        }
    }
}
```
# 四、Task
只有 Task 才可以在 Gradle 的执行阶段去执行（**其实质是执行的 Task 中的一系列 Action**），所以 Task 的重要性不言而喻。
## 1、从一个例子 🌰 出发
首先，我们可以在任意一个 build.gradle 文件中可以去定义一个 Task，下面是一个完整的示例代码：
```
groovy
 // 1、声明一个名为 JsonChao 的 gradle task
task JsonChao
JsonChao {
    // 2、在 JsonChao task 闭包内输出 hello~，
    // 执行在 gradle 生命周期的第二个阶段，即配置阶段。
    println("hello~")
    // 3、给 task 附带一些 执行动作（Action），执行在
    // gradle 生命周期的第三个阶段，即执行阶段。
    doFirst {
        println("start")
    }
    doLast {
        println("end")
    }
}
// 4、除了上述这种将声明与配置、Action 分别定义
// 的方式之外，也可以直接将它们结合起来。
// 这里我们又定义了一个 Android task，它依赖于 JsonChao
// task，也就是说，必须先执行完 JsonChao task，才能
// 去执行 Android task，由此，它们之间便组成了一个
// 有向无环图：JsonChao task => Android task
task Andorid(dependsOn:"JsonChao") {
    doLast {
        println("end?")
    }
}
```
首先，在注释1处，我们声明了一个名为 JsonChao 的 gradle task。接着，在注释2处，在 JsonChao task 闭包内输出了 hello~，这里的代码将会执行在 gradle 生命周期的第二个阶段，即配置阶段。然后，在注释3处，这里 **给 task 附带一些了一些执行动作（Action），即 doFirst 与 doLast，它们闭包内的代码将执行在 gradle 生命周期的第三个阶段，即执行阶段**。
对于 doFirst 与 doLast 这两个 Action，它们的作用分别如下所示：

- doFirst：**表示 task 执行最开始的时候被调用的 Action**。
- doLast：**表示 task 将执行完的时候被调用的 Action**。

需要注意的是，**doFirst 和 doLast 是可以被执行多次的**。
最后，注释4处，我们可以看到，除了注释1、2、3处这种将声明与配置、Action 分别定义的方式之外，也可以直接将它们结合起来。在这里我们又定义了一个 Android task，**它依赖于 JsonChao task，也就是说，必须先执行完 JsonChao task，才能 去执行 Android task，由此，它们之间便组成了一个 有向无环图：JsonChao task => Android task**。
执行 Android 这个 gradle task 可以看到如下输出结果：
```
ruby
 > Task :JsonChao
start
end
执行阶段，task ':JsonChao'耗时：1ms
:JsonChao spend 4ms
> Task :Andorid
end?
执行阶段，task ':Andorid'耗时：1ms
:Andorid spend 2ms
构建结束 
Tasks spend time > 50ms:
执行阶段，耗时：15ms
```
## 2、Task 的定义及配置
Task 常见的定义方式有 **两种**，示例代码如下所示：
```
java
 // Task 定义方式1：直接通过 task 函数去创建（在 "()" 可以不指定 group 与 description 属性）
task myTask1(group: "MyTask", description: "task1") {
    println "This is myTask1"
}

// Task 定义方式2：通过 TaskContainer 去创建 task
this.tasks.create(name: "myTask2") {
    setGroup("MyTask")
    setDescription("task2")
    println "This is myTask2"
}
```
定义完上述 Task 之后再同步项目，即可看到对应的 Task Group 及其旗下的 Tasks。
### Task 的属性
需要注意的是，**不管是哪一种 task 的定义方式，在 "()" 内我们都可以配置它的一系列属性**，如下：
```
groovy
 project.task('JsonChao3', group: "JsonChao", description: "my tasks",
dependsOn: ["JsonChao1", "JsonChao2"] ).doLast {
    println "execute JsonChao3 Task"
}
```
目前 **官方所支持的属性** 可以总结为如下表格：

| 选型 | 描述 | 默认值 |
| --- | --- | --- |
| "name" | task 名字 | 无，必须指定 |
| "type" | 需要创建的 task Class | DefaultTask |
| "action" | 当 task 执行的时候，需要执行的闭包 closure 或 行为 Action | null |
| "overwrite" | 替换一个已存在的 task | false |
| "dependsOn" | 该 task 所依赖的 task 集合 | [] |
| "group" | 该 task 所属组 | null |
| "description" | task 的描述信息 | null |
| "constructorArgs" | 传递到 task Class 构造器中的参数 | null |

#### 使用 "$" 来引用另一个 task 的属性
在这里，我们可以 **在当前 task 中使用 "$" 来引用另一个 task 的属性**，示例代码如下所示：
```
groovy
 task Gradle_First() {

}

task Gradle_Last() {
    doLast {
        println "I am not $Gradle_First.name"
    }
}
```
#### 使用 ext 给 task 自定义需要的属性
当然，除了使用已有的属性之外，我们也可以 **使用 ext 给 task 自定义需要的属性**，代码如下所示：
```
groovy
 task Gradle_First() {
    ext.good = true
}

task Gradle_Last() {
    doFirst {
        println Gradle_First.good
    }
    doLast {
        println "I am not $Gradle_First.name"
    }
}
```
#### 使用 defaultTasks 关键字标识默认执行任务
此外，我们也可以 **使用 defaultTasks 关键字 来将一些任务标识为默认的执行任务**，代码如下所示：
```
java
 defaultTasks "Gradle_First", "Gradle_Last"

task Gradle_First() {
    ext.good = true
}

task Gradle_Last() {
    doFirst {
        println Gradle_First.goodg
    }
    doLast {
        println "I am not $Gradle_First.name"
    }
}
```
### 注意事项
**每个 task 都会经历 初始化、配置、执行 这一套完整的生命周期流程**。
## 3、Task 的执行详解
Task 通常使用 doFirst 与 doLast 两个方式用于在执行期间进行操作。其示例代码如下所示：
```
java
 // 使用 Task 在执行阶段进行操作
task myTask3(group: "MyTask", description: "task3") {
    println "This is myTask3"
    doFirst {
        // 老二
        println "This group is 2"
    }

    doLast {
        // 老三
        println "This description is 3"
    }
}

// 也可以使用 taskName.doxxx 的方式添加执行任务
myTask3.doFirst {
    // 这种方式的最先执行 => 老大
    println "This group is 1"
}
```
### Task 执行实战
接下来，我们就使用 doFirst 与 doLast 来进行一下实战，来实现 **计算 build 执行期间的耗时**，其完整代码如下所示：
```
java
 // Task 执行实战：计算 build 执行期间的耗时
def startBuildTime, endBuildTime
// 1、在 Gradle 配置阶段完成之后进行操作，
// 以此保证要执行的 task 配置完毕
this.afterEvaluate { Project project ->
    // 2、找到当前 project 下第一个执行的 task，即 preBuild task
    def preBuildTask = project.tasks.getByName("preBuild")
    preBuildTask.doFirst {
        // 3、获取第一个 task 开始执行时刻的时间戳
        startBuildTime = System.currentTimeMillis()
    }
    // 4、找到当前 project 下最后一个执行的 task，即 build task
    def buildTask = project.tasks.getByName("build")
    buildTask.doLast {
        // 5、获取最后一个 task 执行完成前一瞬间的时间戳
        endBuildTime = System.currentTimeMillis()
        // 6、输出 build 执行期间的耗时
        println "Current project execute time is ${endBuildTime - startBuildTime}"
    }
}
```
## 4、Task 的依赖和执行顺序
指定 Task 的执行顺序有 **三种** 方式，如下图所示：
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1699451363367-3cc9998c-17d9-4d94-9be7-5e74a773b139.webp)
### 1）、dependsOn 强依赖方式
dependsOn 强依赖的方式可以细分为 **静态依赖和动态依赖**，示例代码如下所示：
#### 静态依赖
```
java
 task task1 {
    doLast {
        println "This is task1"
    }
}

task task2 {
    doLast {
        println "This is task2"
    }
}

// Task 静态依赖方式1 (常用）
task task3(dependsOn: [task1, task2]) {
    doLast {
        println "This is task3"
    }
}

// Task 静态依赖方式2
task3.dependsOn(task1, task2)
```
#### 动态依赖
```
java
 // Task 动态依赖方式
task dytask4 {
    dependsOn this.tasks.findAll { task ->
        return task.name.startsWith("task")
    }
    doLast {
        println "This is task4"
    }
}
```
### 2）、通过 Task 指定输入输出
我们也可以通过 Task 来指定输入输出，使用这种方式我们可以 **高效地实现一个 自动维护版本发布文档的 gradle 脚本**，其中输入输出相关的代码如下所示：
```
java
 task writeTask {
  inputs.property('versionCode', this.versionCode)
  inputs.property('versionName', this.versionName)
  inputs.property('versionInfo', this.versionInfo)
  // 1、指定输出文件为 destFile
  outputs.file this.destFile
  doLast {
    //将输入的内容写入到输出文件中去
    def data = inputs.getProperties()
    File file = outputs.getFiles().getSingleFile()
    
    // 写入版本信息到 XML 文件
    ...
    
}

task readTask {
  // 2、指定输入文件为上一个 task（writeTask） 的输出文件 destFile
  inputs.file this.destFile
  doLast {
    //读取输入文件的内容并显示
    def file = inputs.files.singleFile
    println file.text
  }
}

task outputwithinputTask {
  // 3、先执行写入，再执行读取
  dependsOn writeTask, readTask
  doLast {
    println '输入输出任务结束'
  }
}
```
首先，我们定义了一个 WirteTask，然后，在注释1处，指定了输出文件为 destFile， 并写入版本信息到 XML 文件。接着，定义了一个 readTask，并在注释2处，指定输入文件为上一个 task（即 writeTask） 的输出文件。最后，在注释3处，**使用 dependsOn 将这两个 task 关联起来，此时输入与输出的顺序是会先执行写入，再执行读取**。这样，一个输入输出的实际案例就实现了。如果想要查看完整的实现代码，请查看 [Awesome-WanAndroid 的 releaseinfo.gradle 脚本](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2FJsonChao%2FAwesome-WanAndroid%2Fblob%2Fmaster%2Freleaseinfo.gradle)。
此外，在 [McImage](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2FsmallSohoSolo%2FMcImage) 中就利用了 dependsOn 的方式将自身的 task 插入到了 Gradle 的构建流程之中，关键代码如下所示：
```
kotlin
 // inject task
(project.tasks.findByName(chmodTask.name) as Task).dependsOn(mergeResourcesTask.taskDependencies.getDependencies(mergeResourcesTask))
(project.tasks.findByName(mcPicTask.name) as Task).dependsOn(project.tasks.findByName(chmodTask.name) as Task)
mergeResourcesTask.dependsOn(project.tasks.findByName(mcPicTask.name))
```
### 通过 API 指定依赖顺序
除了 dependsOn 的方式，我们还可以在 task 闭包中**通过 mustRunAfter 方法指定 task 的依赖顺序**，需要注意的是，**在最新的 gradle api 中，mustRunAfter 必须结合 dependsOn 强依赖进行配套使用**，其示例代码如下所示：
```
java
 // 通过 API 指定依赖顺序
task taskX {
    mustRunAfter "taskY"

    doFirst {
        println "this is taskX"
    }
}

task taskY {
    // 使用 mustRunAfter 指定依赖的（一至多个）前置 task
    // 也可以使用 shouldRunAfter 的方式，但是是非强制的依赖
//    shouldRunAfter taskA
    doFirst {
        println "this is taskY"
    }
}

task taskZ(dependsOn: [taskX, taskY]) {
    mustRunAfter "taskY"
    doFirst {
        println "this is taskZ"
    }
}
```
## 5、Task 类型
除了定义一个新的 task 之外，我们也可以**使用 type 属性来直接使用一个已有的 task 类型**（很多文章都说的是继承一个已有的类，不是很准确），比如 Gradle 自带的 Copy、Delete、Sync task 等等。示例代码如下所示：
```
groovy
 // 1、删除根目录下的 build 文件
task clean(type: Delete) {
    delete rootProject.buildDir
}
// 2、将 doc 复制到 build/target 目录下
task copyDocs(type: Copy) {
    from 'src/main/doc'
    into 'build/target/doc'
}
// 3、执行时会复制源文件到目标目录，然后从目标目录删除所有非复制文件
task syncFile(type:Sync) {
    from 'src/main/doc'
    into 'build/target/doc'
}
```
## 6、挂接到构建生命周期
我们可以使用 gradle 提供的一系列生命周期 API 去挂接我们自己的 task 到构建生命周期之中，比如使用 afterEvaluate 方法 将我们第三小节定义的 writeTask 挂接到 gradle 配置完所有的 task 之后的时刻，示例代码如下所示：
```
java
 // 在配置阶段执行完之后执行 writeTask
this.project.afterEvaluate { project ->
  def buildTask = project.tasks.findByName("build")
  doLast {
    buildTask.doLast {
      // 5.x 上使用 finalizedBy
      writeTask.execute()
    }
  }
}
```
需要注意的是，配置完成之后，我们需要在 app moudle 下引入我们定义的 releaseinfo 脚本，引入方式如下：
```
groovy
 apply from: this.project.file("releaseinfo.gradle")
```
# 五、SourceSet
SourceSet 主要是 **用来设置我们项目中源码或资源的位置的**，目前它最常见的两个使用案例就是如下 **两类**：

- 1）、**修改 so 库存放位置**。
- 2）、**资源文件分包存放**。
## 1、修改 so 库存放位置
我们仅需在 app moudle 下的 android 闭包下配置如下代码即可修改 so 库存放位置：
```
java
 android {
    ...
    sourceSets {
        main {
            // 修改 so 库存放位置
            jniLibs.srcDirs = ["libs"]
        }
    }
}
```
## 2、资源文件分包存放
同样，在 app moudle 下的 android 闭包下配置如下代码即可将资源文件进行分包存放：
```
java
 android {
    sourceSets {
        main {
            res.srcDirs = ["src/main/res",
                           "src/main/res-play",
                           "src/main/res-shop"
                            ... 
                           ]
        }
    }
}
```
此外，我们也可以使用如下代码 **将 sourceSets 在 android 闭包的外部进行定义**：
```
groovy
 this.android.sourceSets {
    ...
}
```
# 六、Gradle 命令
Gradle 的命令有很多，但是我们通常只会使用如下两种类型的命令：

- 1）、**获取构建信息的命令**。
- 2）、**执行 task 的命令**。
## 1、获取构建信息的命令
```
gradlew
 // 1、按自顶向下的结构列出子项目的名称列表
./gradlew projects
// 2、分类列出项目中所有的任务
./gradlew tasks
// 3、列出项目的依赖列表
./gradlew dependencies
```
## 2、执行 task 的命令
常规的用于执行 task 的命令有 **四种**，如下所示：
```
gradlew
 // 1、用于执行多个 task 任务
./gradlew JsonChao Gradle_Last
// 2、使用 -x 排除单个 task 任务
./gradlew -x JsonChao
// 3、使用 -continue 可以在构建失败后继续执行下面的构建命令
./gradlew -continue JsonChao
// 4、建议使用简化的 task name 去执行 task，下面的命令用于执行 
// Gradle_Last 这个 task
./gradlew G_Last
```
而对于子目录下定义的 task，我们通常会使用如下的命令来执行它：
```
gradlew
 // 1、使用 -b 执行 app 目录下定义的 task
./gradlew -b app/build.gradle MyTask
// 2、在大型项目中我们一般使用更加智能的 -p 来替代 -b
./gradlew -p app MyTask
```
# 七、总结
至此，我们就将 Gradle 的核心 API 部分讲解完毕了，这里我们再来回顾一下本文的要点，如下所示：

- 一、Gradle 优势 
   - 1、更好的灵活性
   - 2、更细的粒度
   - 3、更好的扩展性
   - 4、更强的兼容性
- 二、Gradle 构建生命周期 
   - 1、初始化阶段
   - 2、配置阶段
   - 3、执行阶段
   - 4、Hook Gradle 各个生命周期节点
   - 5、获取构建各个阶段、任务的耗时情况
- 三、Project 
   - 1、Project 核心 API 分解
   - 2、Project API
   - 3、project 属性
   - 4、文件相关 API
   - 5、其它 API
- 四、Task 
   - 1、从一个例子 🌰 出发
   - 2、Task 的定义及配置
   - 3、Task 的执行详解
   - 4、Task 的依赖和执行顺序
   - 5、Task 类型
   - 6、挂接到构建生命周期
- 五、SourceSet 
   - 1、修改 so 库存放位置
   - 2、资源文件分包存放
- 六、Gradle 命令 
   - 1、获取构建信息的命令
   - 2、执行 task 的命令

Gradle 的核心 API 非常重要，这对我们高效实现一个 Gradle 插件无疑是必不可少的。因为 **只有扎实基础才能走的更远，愿我们能一同前行**。

# 参考链接：

---

- 1、[《慕课网之Gradle3.0自动化项目构建技术精讲+实战》6 - 8章](https://link.juejin.cn?target=https%3A%2F%2Fcoding.imooc.com%2Flearn%2Flist%2F206.html)
- 2、[Gradle DSL API 文档](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fdsl%2Forg.gradle.api.invocation.Gradle.html)
- 3、[Android Plugin DSL API 文档](https://link.juejin.cn?target=http%3A%2F%2Fgoogle.github.io%2Fandroid-gradle-dsl%2Fcurrent%2Findex.html)
- 4、[Gradle DSL => Project 官方 API 文档](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fjavadoc%2Forg%2Fgradle%2Fapi%2FProject.html)
- 5、[Gradle DSL => Task 官方 API 文档](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fjavadoc%2Forg%2Fgradle%2Fapi%2FTask.html)
- 6、[Gradle脚本基础全攻略](https://link.juejin.cn?target=https%3A%2F%2Fblog.csdn.net%2Fyanbober%2Farticle%2Fdetails%2F49314255)
- 7、[全面理解Gradle - 执行时序](https://link.juejin.cn?target=https%3A%2F%2Fblog.csdn.net%2Fsingwhatiwanna%2Farticle%2Fdetails%2F78797506)
- 8、[全面理解Gradle - 定义Task](https://link.juejin.cn?target=https%3A%2F%2Fblog.csdn.net%2Fsingwhatiwanna%2Farticle%2Fdetails%2F78898113)
- 9、[掌控 Android Gradle](https://link.juejin.cn?target=https%3A%2F%2Fkymjs.com%2Fcode%2F2018%2F02%2F25%2F01%2F)
- 10、[Gradle基础 - 构建生命周期和Hook技术](https://link.juejin.cn?target=https%3A%2F%2Fwww.jianshu.com%2Fp%2F0acdb31eef2d)


