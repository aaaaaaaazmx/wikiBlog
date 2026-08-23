---
title: "1、Gradle生命周期"
published: 2020-11-19
description: "1、Gradle生命周期"
tags: ["Gradle","构建工具"]
category: "gradle"
draft: false
slug: "gradle-001"
---

[https://juejin.cn/post/7170684769083555877](https://juejin.cn/post/7170684769083555877)


# 1、Gradle生命周期
Gradle的生命周期也是一个非常重要的概念，当你了解它之后，就会明白很多事，也能在生命周期的各个阶段做一些切面处理的「黑科技」。
## 1.1、三个阶段
Gradle分三个阶段评估和运行构建，分别是 Initialization (初始化)、Configuration (配置) 和 Execution (执行)，且任何的构建任务都会执行这个三个阶段。

- 在 Initialization (初始化) 阶段，Gradle会决定构建中包含哪些项目，并会为每个项目创建Project实例。为了决定构建中会包含哪些项目，Gradle首先会寻找settings.gradle来决定此次为单项目构建还是多项目构建，单项目就是module，多项目即project+app+module(1+n)。
- 在 Configuration (配置) 阶段，Gradle会评估构建项目中包含的所有构建脚本，随后应用插件、使用DSL配置构建，并在最后注册Task，同时惰性注册它们的输入，因为并不一定会执行。
- 最后，在 Execution (执行) 阶段，Gradle会执行构建所需的Task集合。
## 1.2、生命周期的本质
生命周期的本质是在各个阶段把任务(Task)组合起来，然后按照我们的意图去构建项目。
Task是Gradle构建的核心，其模型为有向无环图(DAG)。Task之间是有依赖的，Gradle会在构建期间(配置阶段)来生成依赖关系图，也就是Task集合。
这个Task集合的由来就是由上述的三个阶段组成，首先是初始化阶段，要明确哪些项目参与构建，然后配置阶段去解析所有参与构建项目的配置，这其中就包括注册Task，项目的配置决定了Task的执行顺序，比如某个子项目里有一个自定义的Task依赖了某个自带Task去做某些事情，那这个自定义的Task也是要加到集合里的，最后是执行阶段，依次执行集合里面的Task去构建apk。
所以反向来推，一个apk是由很多文件组成的，这些文件是由Tasks执行的输入输出和merge组合的，而要具体执行哪些Task，即要打出什么样的包，是由生命周期的三个阶段决定的。
DAG图例：
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1699453100450-e87b1a22-b52a-4541-884b-64471a34a118.webp)
# 2、Initialization (初始化)
在 Initialization (初始化) 阶段，Gradle会决定构建中包含哪些项目，并会为每个项目创建Project实例。为了决定构建中会包含哪些项目，Gradle首先会寻找settings.gradle来决定此次为单项目构建还是多项目构建。
## 2.1、settings.gradle
### 2.1.1、Settings
前文中我们介绍到build.gradle里面的配置和方法调用委托的是Project对象，同样是构建脚本的settings.gradle里面的配置和方法调用委托的是Settings对象。
在Gradle构建时会创建一个Settings实例，并根据它执行设置文件。Settings实例和settings.gradle文件是一对一的对应关系。
Settings：声明实例化和配置参与构建Project实例的层次结构所需的配置。
### 2.1.2、项目管理
Gradle支持单项目或多项目构建：

- 单项目构建，settings.gradle文件是可选的；
- 多项目构建，settings.gradle文件是必需的，且必须位于项目的根目录下；

多项目构建的settings.gradle文件：
```
scss
 pluginManagement {
    repositories {
        gradlePluginPortal()
        google()
        mavenCentral()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "GradleX"
include ':app'
include ':lib'
```
目录：
```
erlang
 .
├── app
│   ...
│   └── build.gradle
├── lib
│   ...
│   └── build.gradle
└── settings.gradle
```
核心是include，表示给指定的项目添加到构建中，它可以指向我们项目包含的module路径，也可以指向硬盘中子项目的绝对路径，这在项目aar和源码切换的时候非常方便，也是编译提速的重要手段之一。
### 2.1.3、插件管理
settings.gradle除了管理项目之外，另一个比较重要的就是管理插件(Plugin)，即pluginManagement。
#### 2.1.3.1、插件仓库
```
scss
 pluginManagement {
    repositories {
        gradlePluginPortal()
        google()
        mavenCentral()
    }
}
```
在pluginManagement中，repositories指定了插件所需要的下载仓库地址。如果自定义的插件发布在私有仓库，就需要在这里加上私有仓库的地址才可以找到你的插件。
#### 2.1.3.2、插件替换
pluginManagement配置是由PluginManagementSpec接口类解析的，其下有5个方法：
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1699453100515-dc88b544-8074-44c4-a1f5-3f9650acb3d1.webp)
includeBuild方法需要在7.0版本之后才可用。
我们主要用到的是resolutionStrategy:
```
java
 @HasInternalProtocol
public interface PluginResolutionStrategy {

    /**
     * Adds an action that is executed for each plugin that is resolved.
     * The {@link PluginResolveDetails} parameter contains information about
     * the plugin that was requested and allows the rule to modify which plugin
     * will actually be resolved.
     */
    void eachPlugin(Action<? super PluginResolveDetails> rule);

}
```
PluginResolutionStrategy允许在PluginRequest之前对其进行修改，并有唯一回调eachPlugin，eachPlugin的参数类型是PluginResolveDetails。
PluginResolveDetails：

- getRequested：获取请求的插件，返回PluginRequest对象，包含id、version、module信息；
- useModule：设置插件的模块；
- useVersion：设置插件的版本；
- getTarget：请求的目标插件；

插件替换主要用到的就是useModule方法：
```
python
 pluginManagement {
    resolutionStrategy {
        eachPlugin {
            if (requested.id.id == "org.gradle.sample") {
                useModule("com.yechaoa.plugin:gradlex:1.0")
            }
        }
    }
}
```
#### 2.1.3.3、插件版本
插件版本主要用到的是useVersion方法：
```
python
 pluginManagement {
    resolutionStrategy {
        eachPlugin {
            if (requested.id.id == "com.yechaoa.plugin") {
                useVersion("2.0")
            }
        }
    }
}
```
设置过版本后, 在所有的build script中通过 plugins { } 引入插件则无需再次指定版本。
## 2.2、如何寻找settings.gradle
前面已经介绍了settings.gradle的重要性，那Gradle在构建时是如何寻找settings.gradle文件的呢？

1. 首先会在项目的根目录下找settings.gradle文件，如果没找到，则作为单项目构建。
2. 如果找到了，会再次校验include配置的合法性，不合法，则继续作为单项目构建，合法，则作为多项目构建。
# 3、Configuration (配置)
在 Configuration (配置) 阶段，Gradle会评估构建项目中包含的所有构建脚本，随后应用插件、使用DSL配置构建，并在最后注册Task，同时惰性注册它们的输入，因为并不一定会执行。
注意：无论请求执行哪个Task，配置阶段都会执行。所以为了保持构建简洁高效，要避免在配置阶段执行任何耗时操作，类似android里面的onDraw方法。
简单的说，配置阶段就是创建Projec对象，执行我们的build.gradle文件，根据代码创建对应的Task依赖关系图。
## 3.1、Project
Gradle构建时，会根据Settings对象解析出来的项目结构为每个项目都创建一个Project对象，Project对象和build.gradle文件之间存在一对一的关系。
在Gradle生成Task依赖关系图之前，Project对象还做了几件事：

- 引入插件
- 配置属性
- 编译依赖
### 3.1.1、引入插件
```
bash
 plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}
```
plugins是Project对象的一个方法，用于设置当前模块所使用的插件。
### 3.1.2、配置属性
```
arduino
 android {
    namespace 'com.yechaoa.gradlex'
    compileSdk 32

    defaultConfig {
        applicationId "com.yechaoa.gradlex"
        minSdk 23
        targetSdk 32
        versionCode 1
        versionName "1.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    // ...
}
```
[前文](https://juejin.cn/post/7160337743552675847)我们分析过android { } 配置的源码，android { } 配置实际是 id 'com.android.application' 插件的DSL配置，也就是说我们在build.gradle中所有的配置其实都是通过DSL对插件的配置，这些配置会影响插件的执行，从而影响整个构建流程。
### 3.1.3、编译依赖
```
arduino
 dependencies {

    implementation 'androidx.core:core-ktx:1.7.0'
    implementation 'androidx.appcompat:appcompat:1.4.1'
    implementation 'com.google.android.material:material:1.5.0'
    
    // ...
}
```
dependencies { } 里面除了官方库之外，我们还经常在里面添加所需要的三方库，比如okhttp、glide等等。
模块自有的三方依赖可以直接在build.gradle中添加仓库下载地址：
```
scss
 repositories {
    mavenCentral()
    // other url
}
```
等同于7.0之前的subprojects { }，settings.gradle中的dependencyResolutionManagement>repositories等同于7.0之前的allprojects { } 。
前文[【Gradle-2】一文搞懂Gradle配置](https://juejin.cn/post/7160337743552675847#heading-48)中漏了一点dependencyResolutionManagement里面的repositoriesMode，即Gradle对于allprojects { } 和subprojects { }中的依赖解析策略。
```
scss
 dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
```
repositoriesMode：

- PREFER_PROJECT：默认值，优先使用build.gradle中的repositories { }，忽略settings.gradle中的repositories { } ；
- PREFER_SETTINGS：优先settings.gradle中的repositories { } ，忽略build.gradle中的repositories { }；
- FAIL_ON_PROJECT_REPOS：这个厉害了，表示在build.gradle中声明的repositories { }会导致编译错误；

如果只有app模块，可以把仓库地址都写在dependencyResolutionManagement>repositories里面，如果有多个模块，且依赖差别很大，还是建议分开写，毕竟从仓库找依赖也是耗时的，虽然并不是编译痛点...（可忽略）
当然Project对象也不止干这些事，通用来讲是这样，但你也可能有一些额外的配置，比如发布publishing等。
# 4、Execution (执行)
在 Execution (执行) 阶段，Gradle会执行构建所需的Task集合。
其实这个阶段才是真正的编译打包，于Android而言，比如我们常见的compileDebugJavaWithJavac、mergeDebugNativeLibs等等。
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1699453100479-7b8e7fa6-3ff6-4489-85db-2505649ad660.webp)
# 5、Hook生命周期
Gradle在生命周期的各个阶段提供了丰富的回调，这对我们做切面处理时非常有用。
![](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWkpfu3WMQgPVqETicpibhdVW5kpqXdsrNn5aaoic9mNP4ib8EbMEv7csR0gGw5XKKoYelZ1HD3xJnPAw/640?wx_fmt=png&amp;from=appmsg)
## 5.1、Initialization Hook
初始化阶段Hook，即Hook Settings对象。当settings.gradle被评估(evaluate)完毕，此时已经有初始化过的Settings对象。
我们可以通过gradle.settingsEvaluated方法添加Hook，例如在settings.gradle中：
```
go
 println("---Gradle：开始初始化了")
gradle.settingsEvaluated {
    println("---Gradle：settingsEvaluated Settings对象评估完毕")
}
```
此时可以获取到Settings对象，上面我们介绍到Settings对象主要是用来管理项目和插件的，此时就可以做一些全局的操作，比如所有项目的增加某个插件。
gradle.settingsEvaluated执行完是gradle.projectsLoaded：
```
go
 gradle.projectsLoaded {
    println("---Gradle：projectsLoaded 准备加载Project对象了")
}
```
projectsLoaded回调时已经根据settings.gradle创建了各个模块的Project对象，我们可以引用Project对象从而设置一些hook：
```
go
 gradle.allprojects{
    beforeEvaluate {
        println("---Gradle：Projec beforeEvaluate Project开始评估，对象是 = "+project.name)
    }
    afterEvaluate {
        println("---Gradle：Projec afterEvaluate Project评估完毕，对象是 = "+project.name)
    }
}
```
但此时还属于Initialization(初始化)阶段，还没到Configuration(配置)阶段，所以Project对象只包含了项目的基本信息，是拿不到build.gradle里面的配置信息的，所以此阶段可用对象是Settings，Gradle对象是任何阶段都可用的。
## 5.2、Configuration Hook
初始化执行完就进入Configuration(配置)阶段，在配置阶段就可以拿到所有参与构建的项目的配置，首先会执行root project下的build.gradle，然后是module project下的build.gradle。
此时可以Hook Project对象的执行前和执行后，因为是Project对象，就不能写在settings.gradle里面了，要写在build.gradle里面：
```
go
 project.beforeEvaluate {
    println("---project：beforeEvaluate Project开始评估，对象是 = " + project.name)
}

project.afterEvaluate {
    println("---project：afterEvaluate Project评估完毕，对象是 = " + project.name)
}
```
通过执行日志发现project.beforeEvaluate方法并没有执行，是因为该hook点在执行到build.gradle的内容是已经走过了，所以不会生效。
project.afterEvaluate回调执行，即表示Project对象evaluate完毕，此时可以获取到Project对象里面的配置信息了。因为这个阶段Project对象刚刚配置完毕, 因此很多动态任务都是在这个阶段添加到构建中的。
所有Project对象evaluate完毕之后，会回调gradle.projectsEvaluated：
```
go
 gradle.projectsEvaluated {
    println("---Gradle：projectsEvaluated 所有Project对象评估完毕")
}
```
至此，一次构建的所有对象都已创建完毕，有控制总体的Gradle对象，和统筹参与模块的Settings对象，以及各个子模块的Project对象。
## 5.3、Execution Hook
Gradle会在Execution (执行) 阶段执行Task，我们可以添加TaskExecutionListener来Hook Task的执行：
```
typescript
 gradle.addBuildListener(new TaskExecutionListener(){

    @Override
    void beforeExecute(Task task) {
        println("---Gradle：Task beforeExecute---")

    }

    @Override
    void afterExecute(Task task, TaskState state) {
        println("---Gradle：Task afterExecute---")
    }
})
```
7.3以前可用，7.3之后已经废弃了，并且会导致编译报错，因为在配置缓存的情况下，为了保证无论是否开启配置缓存都一致的API，只好干掉了...
Gradle为了编译提速牺牲了好多啊，开发适配这个绝对又要被吐槽...
Task是Gradle中最小的构建单元，Action是最小的执行单元。
可以添加TaskActionListener来Hook Task Action的执行：
```
typescript
 gradle.addBuildListener(new TaskActionListener(){

    @Override
    void beforeActions(Task task) {
        println("---Gradle：Task beforeActions---")
    }

    @Override
    void afterActions(Task task) {
        println("---Gradle：Task afterActions---")
    }
})
```
同TaskExecutionListener一样，也被干掉了，且编译报错。
@deprecated This type is not supported when configuration caching is enabled.
## 5.4、构建结束
当所有Task执行完毕，也就意味着构建结束，会回调gradle.buildFinished：
```
go
 gradle.buildFinished {
    println("---Gradle：buildFinished 构建结束了")
}
```
也是废弃了，原因同上，只不过编译不报错了...
除了gradle.xxx这种方式添加hook点之外，还可以用gradle.addListener()的方式，效果一样。
```
less
 gradle.addListener(new BuildListener() {
    @Override
    void settingsEvaluated(Settings settings) {

    }

    @Override
    void projectsLoaded(Gradle gradle) {

    }

    @Override
    void projectsEvaluated(Gradle gradle) {

    }

    @Override
    void buildFinished(BuildResult result) {

    }
})
```
### 5.4.1、整体输出
看下整体输出结果，进一步体验Gradle的生命周期和构建流程。
```
markdown
 Executing tasks: [:app:assembleDebug] in project /Users/yechao/AndroidStudioProjects/GradleX

---Gradle：开始初始化了
---Gradle：settingsEvaluated Settings对象评估完毕
---Gradle：projectsLoaded 准备加载Project对象了

> Configure project :
---Gradle：Projec beforeEvaluate Project开始评估，对象是 = GradleX
---Gradle：Projec afterEvaluate Project评估完毕，对象是 = GradleX

> Configure project :app
---Gradle：Projec beforeEvaluate Project开始评估，对象是 = app
---Gradle：Projec afterEvaluate Project评估完毕，对象是 = app
---project：afterEvaluate Project评估完毕，对象是 = app
---Gradle：projectsEvaluated 所有Project对象评估完毕

> Task :app:createDebugVariantModel UP-TO-DATE
> Task :app:preBuild UP-TO-DATE
...
> Task :app:assembleDebug
---Gradle：buildFinished 构建结束了

BUILD SUCCESSFUL in 3s
33 actionable tasks: 12 executed, 21 up-to-date

Build Analyzer results available
```
### 5.4.2、如何适配
那TaskActionListener和buildFinished废弃之后用什么代替呢，Gradle提供了Build Service的方式来代替。
Build Service可用于在执行任务时接收事件。为此，请创建并注册一个实现OperationCompletionListener的构建服务。然后，您可以使用BuildEventsListenerRegistry服务上的方法开始接收事件。
看起来更加复杂了...
What is that supposed to mean? What's a BuildEventsListenerRegistry? How do I use 'the methods'?
示例：
```
kotlin
 // build.gradle.kts

abstract class BuildListenerService :
    BuildService<BuildListenerService.Params>,
    org.gradle.tooling.events.OperationCompletionListener {

    interface Params : BuildServiceParameters

    override fun onFinish(event: org.gradle.tooling.events.FinishEvent) {
        println("BuildListenerService got event $event")
    }
}

val buildServiceListener = gradle.sharedServices.registerIfAbsent("buildServiceListener", BuildListenerService::class.java) { }

abstract class Services @Inject constructor(
    val buildEventsListenerRegistry: BuildEventsListenerRegistry
)

val services = objects.newInstance(Services::class)

services.buildEventsListenerRegistry.onTaskCompletion(buildServiceListener)
```
输出：
```
ruby
 > Task :service:vp:assemble UP-TO-DATE
> Task :assemble UP-TO-DATE
> Task :service:arc:processResources NO-SOURCE
> Task :service:ar:processResources UP-TO-DATE
> Task :service:ara:processResources UP-TO-DATE
BuildListenerService got event Task :service:vp:assemble UP-TO-DATE
BuildListenerService got event Task :assemble UP-TO-DATE
BuildListenerService got event Task :service:arc:processResources skipped
BuildListenerService got event Task :service:ar:processResources UP-TO-DATE
BuildListenerService got event Task :service:ara:processResources UP-TO-DATE
> Task :service:ti:kaptGenerateStubsKotlin UP-TO-DATE
BuildListenerService got event Task :service:ti:kaptGenerateStubsKotlin UP-TO-DATE
> Task :service:ac:kaptGenerateStubsKotlin UP-TO-DATE
BuildListenerService got event Task :service:ac:kaptGenerateStubsKotlin UP-TO-DATE
> Task :service:ti:kaptKotlin UP-TO-DATE
BuildListenerService got event Task :service:ti:kaptKotlin UP-TO-DATE
> Task :service:ti:compileKotlin NO-SOURCE
BuildListenerService got event Task :service:ti:compileKotlin skipped
> Task :service:ti:compileJava NO-SOURCE
BuildListenerService got event Task :service:ti:compileJava skipped
> Task :service:ti:processResources NO-SOURCE
```
还有一个外国友人的sample：[BuildService + projectsEvaluated callback example](https://link.juejin.cn?target=https%3A%2F%2Fgist.github.com%2Fbamboo%2Fb4c9678fc44aebc623fe849351ea95d3)
TaskExecutionListener > BuildEventsListenerRegistry：
```
java
 @Incubating
public interface BuildEventsListenerRegistry {
    /**
     * Subscribes the given listener to the finish events for tasks, if not already subscribed. The listener receives a {@link org.gradle.tooling.events.task.TaskFinishEvent} as each task completes.
     *
     * <p>The events are delivered to the listener one at a time, so the implementation does not need to be thread-safe. Also, events are delivered to the listener concurrently with
     * task execution and other work, so event handling does not block task execution. This means that a task finish event is delivered to the listener some time "soon" after the task
     * has completed. The events contain timestamps to allow you collect timing information.
     * </p>
     *
     * <p>The listener is automatically unsubscribed when the build finishes.</p>
     *
     * @param listener The listener to receive events. This must be a {@link org.gradle.api.services.BuildService} instance, see {@link org.gradle.api.services.BuildServiceRegistry}.
     */
    void onTaskCompletion(Provider<? extends OperationCompletionListener> listener);
}
```
buildFinished > OperationCompletionListener：
```
csharp
 public interface OperationCompletionListener {
    /**
     * Called when an operation completes.
     */
    void onFinish(FinishEvent event);
}
```
# 6、最后
本文先是介绍了Gradle生命周期的三个阶段，以及这三个阶段干了什么事，核心是三个对象（Gradle、Settings、Project），最后针对这个三个阶段介绍了对应的Hook点，相信看完本文，你对Gradle的生命周期和构建流程有了进一步的认识，如果有用，别忘了三连啊喂~
# 7、Github
[github.com/yechaoa/Gra…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fyechaoa%2FGradleX)
# 8、相关文档

- [Gradle Build Lifecycle](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fuserguide%2Fbuild_lifecycle.html)
- [Gradle 与 AGP 构建 API: 配置您的构建文件](https://juejin.cn/post/7044011519591317534)
- [Gradle](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fdsl%2Forg.gradle.api.invocation.Gradle.html)
- [Gradle Settings](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fdsl%2Forg.gradle.api.initialization.Settings.html%23org.gradle.api.initialization.Settings%3Ainclude(java.lang.String%255B%255D))
- [PluginManagementSpec](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fdsl%2Forg.gradle.plugin.management.PluginManagementSpec.html)
- [Gradle Project](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fdsl%2Forg.gradle.api.Project.html)
- [Dependency Management](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fuserguide%2Fdependency_management.html)
- [Mastering Gradle](https://juejin.cn/book/6844733819363262472/section/6844733819421999118)
- [Gradle BuildListener](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fjavadoc%2Forg%2Fgradle%2FBuildListener.html)
- [Upgrading your build from Gradle 7.x to the latest](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fuserguide%2Fupgrading_version_7.html)
- [Configuration cache](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fuserguide%2Fconfiguration_cache.html%23config_cache%3Arequirements%3Abuild_listeners)
- [Shared Build Services](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fuserguide%2Fbuild_services.html%23operation_listener)

