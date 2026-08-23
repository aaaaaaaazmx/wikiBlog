---
title: "Gradle 插件实现架构概述"
published: 2020-08-07
description: "Gradle 插件实现架构概述"
tags: ["Gradle","构建工具"]
category: "gradle"
draft: false
slug: "gradle-009"
---

https://juejin.cn/post/6844904142725447687
# 目录

- 一、[Gradle 插件实现架构概述](https://juejin.im/post/5ea7792e5188256da0323444#heading-4)
- 二、[了解 Android Gradle Plugin 的更新历史](https://juejin.im/post/5ea7792e5188256da0323444#heading-5)
   - 1、Android Gradle Plugin V3.5.0（2019 年 8 月）
   - 2、Android Gradle Plugin V3.4.0（2019 年 4 月）
   - 3、Android Gradle Plugin V3.3.0（2019 年 1 月）
   - 4、Android Gradle Plugin V3.2.0（2018 年 9 月）
   - 5、Android Gradle Plugin V3.1.0（2018 年 3 月）
   - 6、Android Gradle Plugin V3.0.0（2017 年 10 月）
   - 7、Android Gradle Plugin V2.3.0（2017 年 2 月）
- 三、[Gradle 构建核心流程解析](https://juejin.im/post/5ea7792e5188256da0323444#heading-28)
   - 1、LoadSettings
   - 2、Configure
   - 3、TaskGraph
   - 4、RunTasks
   - 5、Finished
- 四、[关于 Gradle 中依赖实现的原理](https://juejin.im/post/5ea7792e5188256da0323444#heading-43)
   - 1、通过 MethodMissing 机制，间接地调用 DefaultDependencyHandler 的 add 方法去添加依赖。
   - 2、不同的依赖声明，其实是由不同的转换器进行转换的。
   - 3、Project 依赖的本质是 Artifacts 依赖，也即 产物依赖。
   - 4、什么是 Gradle 中的 Configuration？
   - 5、Task 是如何发布自己 Artifacts 的？
- 五、[AppPlugin 构建流程](https://juejin.im/post/5ea68729f265da47e1596037#heading-2)
   - 1、准备工作
   - 2、configureProject 配置项目
   - 3、configureExtension 配置 Extension
   - 4、TaskManager#createTasksBeforeEvaluate 创建不依赖 flavor 的 task
   - 5、BasePlugin#createAndroidTasks 创建构建 task
- 六、[assembleDebug 打包流程浅析](https://juejin.im/post/5ea68729f265da47e1596037#heading-8)
   - 1、Android 打包流程回顾
   - 2、assmableDebug 打包流程浅析
- 七、[重要 Task 实现源码分析](https://juejin.im/post/5ea68729f265da47e1596037#heading-13)
   - 1、资源处理相关 Task
   - 2、将 Class 文件打包成 Dex 文件的过程
- 八、[总结](https://juejin.im/post/5ea68729f265da47e1596037#heading-44)
   - 最后的最后
# 一、Gradle 插件实现架构概述
Android Gradle plugin 团队在 Android Gradle V3.2.0 之前一直是都是用 Java 编写的 Gradle 插件，在 V3.2.0 便采用了 Kotlin 进行大面积的重写。尽管 Groovy 语法简洁，且其闭包的写法非常灵活，但是 Android Studio 对 Groovy 的支持非常不友好，因此，**目前写自定义的 Gradle 插件时我们还是尽量使用 Kotlin，这样能尽量避免编写插件时提示不够造成的坑**。
下面，我们就来看看 **Gradle 插件的整体实现架构**，如下图所示：
![image.png](https://cdn.nlark.com/yuque/0/2023/png/215777/1699455772556-cab2b71f-3d28-44c2-8947-926701b050f9.png)
**在最下层的是底层 Gradle 框架，它主要提供一些基础的服务，如 task 的依赖，有向无环图的构建等等**。
上面的则是 Google 编译工具团队的 Android Gradle plugin 框架，它主要是 **在 Gradle 框架的基础上，创建了很多与 Android 项目打包有关的 task 及 artifacts（每一个 task 执行完成之后通常都会输出产物）**。
最上面的则是开发者自定义的 Plugin，关于自定义 Plugin 通常有两种使用套路，如下所示：

- 1）、**在 Android Gradle plugin 提供的 task 的基础上，插入一些自定义的 task**。
- 2）、**增加 Transform 进行编译时代码注入**。
# 二、了解 Android Gradle Plugin 的更新历史
下表列出了各个 Android Gradle 插件版本所需的 Gradle 版本。**我们应该使用 Android Gradle Plugin 与 Gradle 这两者的最新版本以获得最佳的性能**。

| 插件版本 | 所需的 Gradle 版本 |
| --- | --- |
| 1.0.0 - 1.1.3 | 2.2.1 - 2.3 |
| 1.2.0 - 1.3.1 | 2.2.1 - 2.9 |
| 1.5.0 | 2.2.1 - 2.13 |
| 2.0.0 - 2.1.2 | 2.10 - 2.13 |
| 2.1.3 - 2.2.3 | 2.14.1+ |
| 2.3.0+ | 3.3+ |
| 3.0.0+ | 4.1+ |
| 3.1.0+ | 4.4+ |
| 3.2.0 - 3.2.1 | 4.6+ |
| 3.3.0 - 3.3.2 | 4.10.1+ |
| 3.4.0 - 3.4.1 | 5.1.1+ |
| 3.5.0+ | 5.4.1-5.6.4 |

目前最新的 Android Gradle Plugin 版本为 V3.6.2，Gradle 版本为 V5.6.4。下面，我们了解下 **Android Gradle Plugin 更新历史中比较重要的更新变化**。
## 1、Android Gradle Plugin V3.5.0（2019 年 8 月）
本次更新的重中之重是 **提高项目的构建速度**。
## 2、Android Gradle Plugin V3.4.0（2019 年 4 月）
**如果使用的是 Gradle 5.0 及更高版本，默认的 Gradle 守护进程内存堆大小会从 1 GB 降到 512 MB。这可能会导致构建性能降低。如果要替换此默认设置，请在项目的 gradle.properties 文件中指定 Gradle 守护进程堆大小**。
### 1）、新的 Lint 检查依赖项配置
**增加了新的依赖项配置 lintPublish，并更改了原有 lintChecks 的行为**，它们的作用分别如下所示：

- lintChecks：**仅用于在本地构建项目时运行的 Lint 检查**。
- lintPublish：**在已发布的 AAR 中启用 Lint 检查，这样使用此 AAR 的项目也会应用那些 Lint 检查**。

其示例代码如下所示：
```
groovy
 dependencies {
      // Executes lint checks from the ':lint' project at build time.
      lintChecks project(':lint')
      // Packages lint checks from the ':lintpublish' in the published AAR.
      lintPublish project(':lintpublish')
}
```
### 2）、Android 免安装应用功能插件弃用警告
在之前的版本可以使用 com.android.feature 插件构建免安装应用，现在建议使用动态功能插件，这样便可以通过单个 Android App Bundle 发布安装版应用和免安装应用。
### 3）、R8 默认处于启用状态
**R8 将 desugar（脱糖:将 .class 字节码转换为 .dex 字节码的过程）、压缩、混淆、优化和 dex 处理整合到了一个步骤中，从而显著提升了构建性能。R8 是在 Android Gradle Plugin V3.2.0 中引入的，对于使用插件 V3.4.0 及更高版本的应用和 Android 库项目来说，R8 已经默认处于启用状态**。
#### R8 引入之前的编译流程
![image.png](https://cdn.nlark.com/yuque/0/2023/png/215777/1699455795194-bfb5ec8c-fa6b-445d-b463-da4199e789cf.png)
#### R8 引入之后的编译流程
![image.png](https://cdn.nlark.com/yuque/0/2023/png/215777/1699455800602-db2b3afc-826f-4bc4-8ea2-2eca86030c80.png)
可以看到，**R8 组合了 Proguard、D8 的功能**。如果遇到因 R8 导致的编译失败的问题，可以配置以下代码停用 R8：
```
groovy
 # Disables R8 for Android Library modules only.
android.enableR8.libraries = false
# Disables R8 for all modules.
android.enableR8 = false
```
### 3）、弃用 ndkCompile
此时使用 ndkBuild 编译原生库会收到构建错误。我们应该 **使用 CMake 或 ndk-build 将 C 和 C++ 代码添加到项目中**。
## 3、Android Gradle Plugin V3.3.0（2019 年 1 月）
### 1）、为库项目更快地生成 R 类
**在老版本中，Android Gradle 插件会为项目的每个依赖项生成一个 R.java 文件，然后将这些 R 类和应用的其他类一起编译。现在，插件会直接生成包含应用的已编译 R 类的 JAR，而不会先编译中间的 R.java 类。这不仅可以显著提升包含多个库子项目和依赖项的项目的编译性能，还可以加快在 Android Studio 中索引文件的速度**。
## 4、Android Gradle Plugin V3.2.0（2018 年 9 月）
### 新的代码压缩器 R8
R8 是一种执行代码压缩和混淆的新工具，替代了 ProGuard。我们只需将以下代码添加到项目的 gradle.properties 文件中，即可开始使用 R8 的预览版本：
```
groovy
 android.enableR8 = true
```
### 使用 D8 进行 desugar 的功能现已默认处于启用状态
## 5、Android Gradle Plugin V3.1.0（2018 年 3 月）
### 新的 DEX 编译器 (D8)
**默认情况下，Android Studio 此时会使用名为 D8 的新 DEX 编译器。DEX 编译是指针对 ART （对于较早版本的 Android，则针对 Dalvik）将 .class 字节码转换为 .dex 字节码的过程。与之前的编译器（DX）相比，D8 的编译速度更快，输出的 DEX 文件更小，同时却能保持相同甚至更出色的应用运行时性能**。
如果在使用 D8 的过程中出现了问题，可以在 gradle.properties 配置以下代码暂时停用 D8 并使用 DX：
```
groovy
 android.enableD8=false
```
## 6、Android Gradle Plugin V3.0.0（2017 年 10 月）
### 1）、通过精细控制的任务图提升了多模块项目的并行性。
**更改依赖项时，Gradle 通过不重新编译那些无法被访问的依赖项 API 模块来加快编译速度**。此时可以利用 Gradle 的新依赖项配置（implementation、api、compileOnly 和 runtimeOnly）限制哪些依赖项会将其 API 泄露给其他模块。
### 2）、借助每个类的 dex 处理，可加快增量编译速度。
**每个类现在都会编译成单独的 DEX 文件，并且只会对修改过的类重新进行 dex 处理**。
### 3）、启用 Gradle 编译缓存优化某些任务来使用缓存的输出
启用 Gradle 编译缓存能够优化某些任务来使用缓存的输出，从而加快编译速度。
### 4）、AAPT2 默认已启用并改进了增量资源处理
如果在使用 AAPT2 时遇到了问题，我们可以停用 AAPT2，在 gradle.properties 文件中设置如下代码：
```
groovy
 android.enableAapt2=false
```
然后，**通过在命令行中运行 ./gradlew --stop 来重启 Gradle 守护进程**。
## 7、Android Gradle Plugin V2.3.0（2017 年 2 月）
### 1）、增加编译缓存
存储编译项目时 Android 插件生成的特定输出。使用缓存时，编译插件的速度会明显加快，因为编译系统在进行后续编译时可以直接重用这些缓存文件，而不必重新创建。此外，我们也可以 **使用 cleanBuildCache Task 去清除编译缓存**。
更老版本的的更新细节请查阅 [gradle-plugin](https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.android.google.cn%2Fstudio%2Freleases%2Fgradle-plugin%23updating-plugin)。
# 三、Gradle 构建核心流程解析
当我们输入 ./gradlew/gradle ... 命令之后，一个 Gradle 构建就开始了。它包含如下 三个步骤：

- 1）、首先，**初始化 Gradle 构建框架自身**。
- 2）、然后，**把命令行参数包装好送给 DefaultGradleLauncher**。
- 3）、最后，**触发 DefaultGradleLauncher 中 Gradle 构建的生命周期，并开始执行标准的构建流程**。

在开始深入源码之前，我们可以先自顶向下了解下 Gradle 构建的核心流程图，以便对 Gradle 的构建流程建立一个整体的感知。
![image.png](https://mmbiz.qpic.cn/mmbiz_png/LrDMVD5bqLWkpfu3WMQgPVqETicpibhdVWM9EVRic9wu4HCLud8vYOhfHRMKcbplIic9cslIYD8J18WFDho3ewJZpg/640?wx_fmt=png&amp;from=appmsg)
**当我们执行一个 gralde 命令时，便会调用 gradle/wrapper/gradle-wrapper.jar 里面 org.gradle.wrapper.GradleWrapperMain 类的 main 方法，它就是 gradle 的一个入口方法**。该方法的核心源码如下所示：
```
java
 public static void main(String[] args) throws Exception {
            
        ...
        
        // 1、索引到 gradle-wrapper.properties 文件中配置的 gradle zip 地址，并由此包装成一个 WrapperExecutor 实例。
        WrapperExecutor wrapperExecutor = WrapperExecutor.forWrapperPropertiesFile(propertiesFile);
        // 2、使用 wrapperExecutor 实例的 execute 方法执行 gradle 命令。
        wrapperExecutor.execute(args, new Install(logger, new Download(logger, "gradlew", "0"), new PathAssembler(gradleUserHome)), new BootstrapMainStarter());
}
```
然后，我们继续看看 wrapperExecutor 的 execute 方法，源码如下所示：
```
java
 public void execute(String[] args, Install install, BootstrapMainStarter bootstrapMainStarter) throws Exception {
        // 1、下载 gradle wrapper 需要的依赖与源码。
        File gradleHome = install.createDist(this.config);
        // 2、从这里开始执行 gradle 的构建流程。
        bootstrapMainStarter.start(args, gradleHome);
    }
```
首先，在注释1处，**会下载 gradle wrapper 需要的依赖与源码**。接着，在注释2处，**便会调用 bootstrapMainStarter 的 start 方法从这里开始执行 gradle 的构建流程。其内部最终会依次调用 DefaultGradleLauncher 的 getLoadedSettings、getConfiguredBuild、executeTasks 与 finishBuild 方法**，而它们对应的状态都定义在 DefaultGradleLauncher 中的 Stage 枚举类中，如下所示：
```
java
 private static enum Stage {
        LoadSettings,
        Configure,
        TaskGraph,
        RunTasks {
            String getDisplayName() {
                return "Build";
            }
        },
        Finished;

        private Stage() {
        }

        String getDisplayName() {
            return this.name();
        }
}
```
下面，我们就对这五个流程来进行详细地分析。
## 1、LoadSettings
当调用 getLoadedSettings 方法时便开始了加载 Setting.gradle 的流程。其源码如下所示：
```
java
 public SettingsInternal getLoadedSettings() {
        this.doBuildStages(DefaultGradleLauncher.Stage.LoadSettings);
        return this.gradle.getSettings();
}
```
这里又继续调用了 doBuildStages 方法进行处理，内部实现如下所示：
```
java
 private void doBuildStages(DefaultGradleLauncher.Stage upTo) {
        Preconditions.checkArgument(upTo != DefaultGradleLauncher.Stage.Finished, "Stage.Finished is not supported by doBuildStages.");

        try {
            // 当 Stage 是 RunTask 的时候执行。
            if (upTo == DefaultGradleLauncher.Stage.RunTasks && this.instantExecution.canExecuteInstantaneously()) {
                this.doInstantExecution();
            } else {
               // 当 Stage 不是 RunTask 的时候执行。 this.doClassicBuildStages(upTo);
            }
        } catch (Throwable var3) {
            this.finishBuild(upTo.getDisplayName(), var3);
        }

}
```
继续调用 doClassicBuildStages 方法，源码如下所示：
```
java
 private void doClassicBuildStages(DefaultGradleLauncher.Stage upTo) {
        // 1、当 Stage 为 LoadSettings 时执行 prepareSettings 方法去配置并生成 Setting 实例。
        this.prepareSettings();
        if (upTo != DefaultGradleLauncher.Stage.LoadSettings) {
            // 2、当 Stage 为 Configure 时执行 prepareProjects 方法去配置工程。
            this.prepareProjects();
            if (upTo != DefaultGradleLauncher.Stage.Configure) {
                // 3、当 Stage 为 TaskGraph 时执行 prepareTaskExecution 方法去构建 TaskGraph。
                this.prepareTaskExecution();
                if (upTo != DefaultGradleLauncher.Stage.TaskGraph) {
                   
                   // 4、当 Stage 为 RunTasks 时执行 saveTaskGraph 方法 与 runWork 方法保存 TaskGraph 并执行相应的 Tasks。 this.instantExecution.saveTaskGraph();
                   this.runWork();
                }
            }
        }
}
```
可以看到，doClassicBuildStages 方法是个很重要的方法，它对所有的 Stage 任务进行了分发，这里小结一下：

- 1）、**当 Stage 为 LoadSettings 时执行 prepareSettings 方法去配置并生成 Setting 实例**。
- 2）、**当 Stage 为 Configure 时执行 prepareProjects 方法去配置工程**。
- 3）、**当 Stage 为 TaskGraph 时执行 prepareTaskExecution 方法去构建 TaskGraph**。
- 4）、**当 Stage 为 RunTasks 时执行 saveTaskGraph 方法 与 runWork 方法保存 TaskGraph 并执行相应的 Tasks**。

然后，我们接着继续看看 prepareSettings 方法，其源码如下所示：
```
java
 private void prepareSettings() {
        if (this.stage == null) {
            // 1、回调 BuildListener.buildStarted() 回调接口。
            this.buildListener.buildStarted(this.gradle);
            // 2、调用 settingPreparer 接口的实现类 DefaultSettingsPreparer 的 prepareSettings 方法。
            this.settingsPreparer.prepareSettings(this.gradle);
            this.stage = DefaultGradleLauncher.Stage.LoadSettings;
        }
}
```
在 prepareSettings 方法做了两件事：

- 1）、**回调 BuildListener.buildStarted 接口**。
- 2）、**调用 settingPreparer 接口的实现类 DefaultSettingsPreparer 的 prepareSettings 方法**。

我们继续看到 DefaultSettingsPreparer 的 prepareSettings 方法，如下所示：
```
java
 public void prepareSettings(GradleInternal gradle) {
        // 1、执行 init.gradle，它会在每个项目 build 之前被调用，用于做一些初始化的操作。
        this.initScriptHandler.executeScripts(gradle);
        SettingsLoader settingsLoader = gradle.getParent() != null ? this.settingsLoaderFactory.forNestedBuild() : this.settingsLoaderFactory.forTopLevelBuild();
        // 2、调用 SettingLoader 接口的实现类 DefaultSettingsLoader 的 findAndLoadSettings 找到 Settings.gradle 文件的位置。
        settingsLoader.findAndLoadSettings(gradle);
}
```
在 prepareSettings 方法中做了两项处理：

- 1）、**执行 init.gradle，它会在每个项目 build 之前被调用，用于做一些初始化的操作**。
- 2）、**调用 SettingLoader 接口的实现类 DefaultSettingsLoader 的 findAndLoadSettings 找到 Settings.gradle 文件的位置**。

DefaultSettingLoader 的 findAndLoadSettings 方法关联的实现代码非常多，限于篇幅，我这里直接点出 **findAndLoadSettings 方法中的主要处理流程**：

- 1）、首先，**查找 settings.gradle 位置**。
- 2）、然后，**编译 buildSrc（Android 默认的 Plugin 目录）文件夹下的内容**。
- 3）、接着，**解析 gradle.properites 文件：这里会读取 gradle.properties 文件里的配置信息与命令行传入的配置属性并存储**。
- 4）、然后，**解析 settings.gradle 文件：这里最后会调用 BuildOperationScriptPlugin.apply 去执行 settings.gradle 文件**。
- 5）、最后，**根据 Settings.gradle 文件中获得的信息去创建 project 以及 subproject 实例**。
## 2、Configure
当执行完 LoadSetting 阶段之后，就会执行 Configure 阶段，而配置阶段所作的事情就是 **把 gradle 脚本编译成 class 文件并执行**。由前可知，此时会执行 prepareProjects 方法，如下所示：
```
java
 private void prepareProjects() {
        if (this.stage == DefaultGradleLauncher.Stage.LoadSettings) {
            // 1、调用 ProjectsPreparer 接口的实现类  DefaultProjectsPreparer 的 prepareProjects 方法。
            this.projectsPreparer.prepareProjects(this.gradle);
            this.stage = DefaultGradleLauncher.Stage.Configure;
        }
}
```
这里会继续调用 ProjectsPreparer 接口的实现类 DefaultProjectsPreparer 的 prepareProjects 方法。其源码如下所示：
```
java
 public void prepareProjects(GradleInternal gradle) {
        
        ...

        // 1、如果在 gradle.properties 文件中指定了参数 configure-on-demand，则只会配置主项目以及执行 task 所需要的项目。
        if (gradle.getStartParameter().isConfigureOnDemand()) {
            this.projectConfigurer.configure(gradle.getRootProject());
        } else {
            // 2、如果没有指定在 gradle.properties 文件中指定参数 configure-on-demand，则会调用 ProjectConfigurer 接口的实现类 TaskPathProjectEvaluator 的 configureHierarchy 方法去配置所有项目。
            this.projectConfigurer.configureHierarchy(gradle.getRootProject());
            (new ProjectsEvaluatedNotifier(this.buildOperationExecutor)).notify(gradle);
        }

        this.modelConfigurationListener.onConfigure(gradle);
}
```
在注释1处，**如果在 gradle.properties 文件中指定了参数 configure-on-demand，则只会配置主项目以及执行 task 所需要的项目。我们这里只看默认没有指定的情况**。否则，在注释2处，则会调用 ProjectConfigurer 接口的实现类 TaskPathProjectEvaluator 的 configureHierarchy 方法去配置所有项目。
我们接着继续看到 configureHierarchy 方法，如下所示：
```
java
 public void configureHierarchy(ProjectInternal project) {
        this.configure(project);
        Iterator var2 = project.getSubprojects().iterator();

        while(var2.hasNext()) {
            Project sub = (Project)var2.next();
            this.configure((ProjectInternal)sub);
        }
}
```
可以看到在 configureHierarchy 方法中使用了 Iterator 遍历并配置了所有 Project。**而 configure 方法最终会调用到 EvaluateProject 类的 run 方法**，如下所示：
```
java
 public void run(final BuildOperationContext context) {
            this.project.getMutationState().withMutableState(new Runnable() {
                public void run() {
                    try {
                        
                        EvaluateProject.this.state.toBeforeEvaluate();
                       
                        // 1、 回调 ProjectEvaluationListener 的 beforeEvaluate 接口。 
                        LifecycleProjectEvaluator.this.buildOperationExecutor.run(new LifecycleProjectEvaluator.NotifyBeforeEvaluate(EvaluateProject.this.project, EvaluateProject.this.state));
                       
                        if (!EvaluateProject.this.state.hasFailure()) {
                            EvaluateProject.this.state.toEvaluate();

                            try {
                               // 2、在 evaluate 方法中会设置默认的 init、wrapper task 和 默认插件，然后便会编译、执行 build.gradle 脚本
                               LifecycleProjectEvaluator.this.delegate.evaluate(EvaluateProject.this.project, EvaluateProject.this.state);
                            } catch (Exception var10) {
                                LifecycleProjectEvaluator.addConfigurationFailure(EvaluateProject.this.project, EvaluateProject.this.state, var10, context);
                            } finally {
                                EvaluateProject.this.state.toAfterEvaluate();
                                // 3、回调  ProjectEvaluationListener.afterEvaluate 接口。     
                                LifecycleProjectEvaluator.this.buildOperationExecutor.run(new LifecycleProjectEvaluator.NotifyAfterEvaluate(EvaluateProject.this.project, EvaluateProject.this.state));
                            }
                        }

                        if (EvaluateProject.this.state.hasFailure()) {
                            EvaluateProject.this.state.rethrowFailure();
                        } else {
                            context.setResult(ConfigureProjectBuildOperationType.RESULT);
                        }
                    } finally {
                        EvaluateProject.this.state.configured();
                    }

                }
            });
}
```
在 EvaluateProject 的 run 方法中有如下 **三个重要的处理**：

- 1）、**回调 ProjectEvaluationListener 的 beforeEvaluate 接口**。
- 2）、**在 evaluate 方法中会设置默认的 init、wrapper task 和 默认插件，然后便会编译并执行 build.gradle 脚本**。
- 3）、**回调 ProjectEvaluationListener.afterEvaluate 接口**。
## 3、TaskGraph
执行完 初始化阶段 与 配置阶段 之后，就会 **调用到 DefaultGradleLauncher 的 prepareTaskExecution 方法去创建一个由 Tasks 组成的一个有向无环图**。该方法如下所示：
```
java
 private void prepareTaskExecution() {
        if (this.stage == DefaultGradleLauncher.Stage.Configure) {
            // 1、调用 TaskExecutionPreparer 接口的实现类 BuildOperatingFiringTaskExecutionPreparer 的 prepareForTaskExecution 方法。
            this.taskExecutionPreparer.prepareForTaskExecution(this.gradle);
            this.stage = DefaultGradleLauncher.Stage.TaskGraph;
        }
}
```
这里继续调用了 TaskExecutionPreparer 接口的实现类 BuildOperatingFiringTaskExecutionPreparer 的 prepareForTaskExecution 方法，如下所示：
```
java
  public void prepareForTaskExecution(GradleInternal gradle) {
        this.buildOperationExecutor.run(new BuildOperatingFiringTaskExecutionPreparer.CalculateTaskGraph(gradle));
}
```
可以看到，这里使用 **buildOperationExecutor 实例执行了 CalculateTaskGraph 这个构建操作**，我们看到它的 run 方法，如下所示：
```
java
 public void run(BuildOperationContext buildOperationContext) {
            // 1、填充任务图
            final TaskExecutionGraphInternal taskGraph = this.populateTaskGraph();
            buildOperationContext.setResult(new Result() {
                 getRequestedTaskPaths() {
                    return this.toTaskPaths(taskGraph.getRequestedTasks());
                }

                
                public List<String> getExcludedTaskPaths() {
                    return this.toTaskPaths(taskGraph.getFilteredTasks());
                }

                private List<String> toTaskPaths(Set<Task> tasks) {
                    return ImmutableSortedSet.copyOf(Collections2.transform(tasks, new Function<Task, String>() {
                        public String apply(Task task) {
                            return task.getPath();
                        }
                    })).asList();
                }
            });
}
```
在注释1处，**直接调用了 populateTaskGraph 填充了 Tasks 有向无环图**。源码如下所示：
```
java
 TaskExecutionGraphInternal populateTaskGraph() {           
            // 1、这里又调用了 TaskExecutionPreparer 接口的另一个实现类 DefaultTaskExecutionPreparer 的 prepareForTaskExecution 方法。
            BuildOperatingFiringTaskExecutionPreparer.this.delegate.prepareForTaskExecution(this.gradle);
            return this.gradle.getTaskGraph();
}
```
可以看到，在注释1处，又调用了 TaskExecutionPreparer 接口的另一个实现类 DefaultTaskExecutionPreparer 的 prepareForTaskExecution 方法。该方法如下所示：
```
java
 public void prepareForTaskExecution(GradleInternal gradle) {
        // 1
        this.buildConfigurationActionExecuter.select(gradle);
        TaskExecutionGraphInternal taskGraph = gradle.getTaskGraph();
        // 2、根据 Tasks 与 Tasks 间的依赖信息填充 taskGraph 实例。
        taskGraph.populate();
        this.includedBuildControllers.populateTaskGraphs();
        if (gradle.getStartParameter().isConfigureOnDemand()) {
            (new ProjectsEvaluatedNotifier(this.buildOperationExecutor)).notify(gradle);
        }
}
```
在注释1处，调用了 **buildConfigurationActionExecuter 接口的 select 方法，这里采用了 策略 + 接口隔离 设计模式，后续会依次调用 ExcludedTaskFilteringBuildConfigurationAction 的 configure 方法、 DefaultTasksBuildExecutionAction 的 configure 方法、TaskNameResolvingBuildConfigurationAction 的 configure 方法**。
下面，我们依次来分析下其中的处理。
### 1）、ExcludedTaskFilteringBuildConfigurationAction#configure：处理需要排除的 task
```
java
 public void configure(BuildExecutionContext context) {
        // 1、获取被排除的 Tasks 名称，并依次把它们放入 filters 中。
        GradleInternal gradle = context.getGradle();
        Set<String> excludedTaskNames = gradle.getStartParameter().getExcludedTaskNames();
        if (!excludedTaskNames.isEmpty()) {
            Set<Spec<Task>> filters = new HashSet();
            Iterator var5 = excludedTaskNames.iterator();

            while(var5.hasNext()) {
                String taskName = (String)var5.next();
                filters.add(this.taskSelector.getFilter(taskName));
            }

            // 2、给 TaskGraph 实例添加要 filter 的 Tasks
            gradle.getTaskGraph().useFilter(Specs.intersect(filters));
        }

        context.proceed();
}
```
在注释1处，先获取了被排除的 Tasks 名称，并依次把它们放入 filters 中，接着在注释2处给 TaskGraph 实例添加了要 filter 的 Tasks。
可以看到，**这里给 TaskGraph 设置了 filter 去处理需要排除的 task，以便在后面计算依赖的时候排除相应的 task**。
### 2）、DefaultTasksBuildExecutionAction#configure：添加默认的 task
```
java
 public void configure(BuildExecutionContext context) {
        StartParameter startParameter = context.getGradle().getStartParameter();
        Iterator var3 = startParameter.getTaskRequests().iterator();

        TaskExecutionRequest request;
        // 1、如果指定了要执行的 Task，则什么也不做。
        do {
            if (!var3.hasNext()) {
                ProjectInternal project = context.getGradle().getDefaultProject();
                this.projectConfigurer.configure(project);
                List<String> defaultTasks = project.getDefaultTasks();
                // 2、如果没有指定 DefaultTasks，则输出 gradle help 信息。
                if (defaultTasks.size() == 0) {
                    defaultTasks = Collections.singletonList("help");
                    LOGGER.info("No tasks specified. Using default task {}", GUtil.toString(defaultTasks));
                } else {
                    LOGGER.info("No tasks specified. Using project default tasks {}", GUtil.toString(defaultTasks));
                }

                // 3、否则，添加默认的 Task。
                startParameter.setTaskNames(defaultTasks);
                context.proceed();
                return;
            }

            request = (TaskExecutionRequest)var3.next();
        } while(request.getArgs().isEmpty());

        context.proceed();
}
```
可以看到，DefaultTasksBuildExecutionAction 类的 configure 方法的处理分为如下三步：

- 1、**如果指定了要执行的 Task，则什么也不做**。
- 2、**如果没有指定 defaultTasks，则输出 gradle help 信息**。
- 3、**否则，添加默认的 defaultTasks**。
### 3）、TaskNameResolvingBuildConfigurationAction#configure：计算 task 依赖图
```
java
 public void configure(BuildExecutionContext context) {
        GradleInternal gradle = context.getGradle();
        TaskExecutionGraphInternal taskGraph = gradle.getTaskGraph();
        List<TaskExecutionRequest> taskParameters = gradle.getStartParameter().getTaskRequests();
        Iterator var5 = taskParameters.iterator();

        while(var5.hasNext()) {
            TaskExecutionRequest taskParameter = (TaskExecutionRequest)var5.next();
            // 1、解析 Tasks。
            List<TaskSelection> taskSelections = this.commandLineTaskParser.parseTasks(taskParameter);
            Iterator var8 = taskSelections.iterator();

            // 2、遍历并添加所有已选择的 Tasks 至 taskGraph 实例之中。
            while(var8.hasNext()) {
                TaskSelection taskSelection = (TaskSelection)var8.next();
                LOGGER.info("Selected primary task '{}' from project {}", taskSelection.getTaskName(), taskSelection.getProjectPath());
                taskGraph.addEntryTasks(taskSelection.getTasks());
            }
        }

        context.proceed();
}
```
这里主要做了 两个处理：

- 1）、解析 Tasks：**分析命令行中的 Task 的参数前面是否指定了 Project，例如 ':project:assembleRelease'，如果没有指定则选中 Project 下所有符合该 taskName 的 Task**。
- 2）、遍历并添加所有已选择的 Tasks 至 taskGraph 实例之中： **在内部会处理 dependson finalizedby mustrunafter shouldrunafter 等 Tasks 间的依赖关系，并会把信息保存在 TaskInfo 之中**。
### 4）、填充 task 依赖图
最后，我们再回到 DefaultTaskExecutionPreparer 的 prepareForTaskExecution 方法，在注释2处，我们就可以 **调用 taskGraph 的 populate 方法去根据这些 Tasks 与 Tasks 之间的依赖信息去填充 taskGraph 实例了**。
## 4、RunTasks
填充完 taskGraph 之后，我们就可以开始来执行这些 Tasks 了，我们看到 DefaultGradleLauncher 实例的 executeTasks 方法，如下所示：
```
java
 public GradleInternal executeTasks() {
        this.doBuildStages(DefaultGradleLauncher.Stage.RunTasks);
        return this.gradle;
}
```
在 doBuildStages 方法中又会调用 doClassicBuildStages 方法，源码如下所示：
```
java
  private void doClassicBuildStages(DefaultGradleLauncher.Stage upTo) {
        this.prepareSettings();
        if (upTo != DefaultGradleLauncher.Stage.LoadSettings) {
            this.prepareProjects();
            if (upTo != DefaultGradleLauncher.Stage.Configure) {
                this.prepareTaskExecution();
                if (upTo != DefaultGradleLauncher.Stage.TaskGraph) {
                    this.instantExecution.saveTaskGraph();
                    // 1
                    this.runWork();
                }
            }
        }
}
```
在注释1处，继续调用了 runWork 方法，如下所示：
```
java
 private void runWork() {
        if (this.stage != DefaultGradleLauncher.Stage.TaskGraph) {
            throw new IllegalStateException("Cannot execute tasks: current stage = " + this.stage);
        } else {
            List<Throwable> taskFailures = new ArrayList();
            // 1
            this.buildExecuter.execute(this.gradle, taskFailures);
            if (!taskFailures.isEmpty()) {
                throw new MultipleBuildFailures(taskFailures);
            } else {
                this.stage = DefaultGradleLauncher.Stage.RunTasks;
            }
        }
}
```
这里又继续 **调用了 buildExecuter 接口的实现类 DefaultBuildWorkExecutor 的 execute 方法**，其实现如下所示：
```
java
 public void execute(GradleInternal gradle, Collection<? super Throwable> failures) {
        this.execute(gradle, 0, failures);
}

private void execute(final GradleInternal gradle, final int index, final Collection<? super Throwable> taskFailures) {
        if (index < this.executionActions.size()) {
            // 1
            ((BuildExecutionAction)this.executionActions.get(index)).execute(new BuildExecutionContext() {
                public GradleInternal getGradle() {
                    return gradle;
                }

                public void proceed() {
                  // 2、执行完 executionActions 列表中的第一项后，便开始执行下一项。
                    DefaultBuildWorkExecutor.this.execute(gradle, index + 1, taskFailures);
                }
            }, taskFailures);
        }
}
```
### 1）、执行 DryRunBuildExecutionAction：处理 DryRun
可以看到，这里又调用了 BuildExecutionAction 接口的实现类 DryRunBuildExecutionAction 的 execute 方法，如下所示：
```
java
  public void execute(BuildExecutionContext context, Collection<? super Throwable> taskFailures) {
        GradleInternal gradle = context.getGradle();
        // 1、如果命令行里包含 --dry-run 参数，则会跳过该 Task 的执行，并输出 Task 的名称与执行的先后关系。
        if (gradle.getStartParameter().isDryRun()) {
            Iterator var4 = gradle.getTaskGraph().getAllTasks().iterator();

            while(var4.hasNext()) {
                Task task = (Task)var4.next();
                this.textOutputFactory.create(DryRunBuildExecutionAction.class).append(((TaskInternal)task).getIdentityPath().getPath()).append(" ").style(Style.ProgressStatus).append("SKIPPED").println();
            }
        } else {
            context.proceed();
        }
}
```
在注释1处，**如果命令行里包含了 --dry-run 参数，则会跳过该 Task 的执行，并输出 Task 的名称与执行的先后关系**。
### 2）、执行：SelectedTaskExecutionAction：使用线程执行被选择的 Tasks
执行完 DryRunBuildExecutionAction 后，我们再回到 DefaultBuildWorkExecutor 类的 execute 方法，在注释2处，**会执行 executionActions 列表中的下一项，即第二项：SelectedTaskExecutionAction**，我们看看它的 execute 方法，如下所示：
```
java
 public void execute(BuildExecutionContext context, Collection<? super Throwable> taskFailures) {
        
        ...

        taskGraph.addTaskExecutionGraphListener(new SelectedTaskExecutionAction.BindAllReferencesOfProjectsToExecuteListener());
        
        // 1、
        taskGraph.execute(taskFailures);
}
```
可以看到，这里直接调用了 TaskExecutionGraphInternal 接口的实现类 DefaultTaskExecutionGraph 的 execute 方法去执行 Tasks，其关键源码如下所示：
```
java
 public void execute(Collection<? super Throwable> failures) {
        ProjectExecutionServiceRegistry projectExecutionServices = new ProjectExecutionServiceRegistry();

        try {
            // 使用线程池执行 Task
            this.executeWithServices(projectExecutionServices, failures);
        } finally {
            projectExecutionServices.close();
        }
}
```
这里又继续调用了 DefaultTaskExecutionGraph 的 executeWithServices 方法使用线程池并行执行 Task，其核心源码如下所示：
```
java
 private void executeWithServices(ProjectExecutionServiceRegistry projectExecutionServices, Collection<? super Throwable> failures) {
        
        ...
        
        this.ensurePopulated();
        
        ...

        try {
            // 1
            this.planExecutor.process(this.executionPlan, failures, new DefaultTaskExecutionGraph.BuildOperationAwareExecutionAction(this.buildOperationExecutor.getCurrentOperation(), new DefaultTaskExecutionGraph.InvokeNodeExecutorsAction(this.nodeExecutors, projectExecutionServices)));
            LOGGER.debug("Timing: Executing the DAG took " + clock.getElapsed());
        } finally {
            ...
        }
}
```
最终，这里是 **调用了 PlanExecutor 接口的实现类 DefaultPlanExecutor 的 process 方法**，如下所示：
```
java
 public void process(ExecutionPlan executionPlan, Collection<? super Throwable> failures, Action<Node> nodeExecutor) {
        ManagedExecutor executor = this.executorFactory.create("Execution worker for '" + executionPlan.getDisplayName() + "'");

        try {
            WorkerLease parentWorkerLease = this.workerLeaseService.getCurrentWorkerLease();
            // 1、开始使用线程池异步执行 tasks
            this.startAdditionalWorkers(executionPlan, nodeExecutor, executor, parentWorkerLease);
            (new DefaultPlanExecutor.ExecutorWorker(executionPlan, nodeExecutor, parentWorkerLease, this.cancellationToken, this.coordinationService)).run();
            this.awaitCompletion(executionPlan, failures);
        } finally {
            executor.stop();
        }
}
```
在注释1处，使用了线程池去异步执行 tasks，如下所示：
```
java
 private void startAdditionalWorkers(ExecutionPlan executionPlan, Action<? super Node> nodeExecutor, Executor executor, WorkerLease parentWorkerLease) {
        LOGGER.debug("Using {} parallel executor threads", this.executorCount);

        for(int i = 1; i < this.executorCount; ++i) {
            executor.execute(new DefaultPlanExecutor.ExecutorWorker(executionPlan, nodeExecutor, parentWorkerLease, this.cancellationToken, this.coordinationService));
        }
}
```
需要了解的是，**用于执行 Task 的线程默认是 8 个线程。这里使用线程池执行了 DefaultPlanExecutor 的 ExecutorWorker，在它的 run 方法中最终会调用到 DefaultBuildOperationExecutor 的 run 方法去执行 Task。但在 Task 执行前还需要做一些预处理**。
### 3）、Task 执行前的一些预处理
在 DefaultBuildOperationExecutor 的 run 方法中只做了两件事，这里我们只需大致了解下即可，如下所示：

- 1、首先，**回调 TaskExecutionListener#beforeExecute**。
- 2、然后，**链式执行一系列对 Task 的通用处理**，其具体的处理如下所示： 
   - 1）、CatchExceptionTaskExecuter#execute：**增加 try catch，避免执行过程中发生异常**。
   - 2）、ExecuteAtMostOnceTaskExecuter#execute：**判断 task 是否执行过**。
   - 3）、SkipOnlyIfTaskExecuter#execute：**判断 task 的 onlyif 条件是否满足执行**。
   - 4）、SkipTaskWithNoActionsExecuter#execute：**跳过没有 action 的 task，如果没有 action 说明 task 不需要执行**。
   - 5）、ResolveTaskArtifactStateTaskExecuter#execute：**设置 artifact 的状态**。
   - 6）、SkipEmptySourceFilesTaskExecuter#execut：**跳过设置了 source file 且 source file 为空的 task，如果 source file 为空则说明 task 没有需要处理的资源**。
   - 7）、ValidatingTaskExecuter#execute：**确认 task 是否可以执行**。
   - 8）、ResolveTaskOutputCachingStateExecuter#execute：**处理 task 输出缓存**。
   - 9）、SkipUpToDateTaskExecuter#execute：**跳过 update-to-date 的 task**。
   - 10）、ExecuteActionsTaskExecuter#execute：**用来真正执行 Task 的 executer**。

可以看到，**在真正执行 Task 前需要经历一些通用的 task 预处理，最后才会调用 ExecuteActionsTaskExecuter 的 execute 方法去真正执行 Task**。
### 4）、真正执行 Task
```
java
 public TaskExecuterResult execute(final TaskInternal task, final TaskStateInternal state, final TaskExecutionContext context) {
        final ExecuteActionsTaskExecuter.TaskExecution work = new ExecuteActionsTaskExecuter.TaskExecution(task, context, this.executionHistoryStore, this.fingerprinterRegistry, this.classLoaderHierarchyHasher);
        // 使用 workExecutor 对象去真正执行 Task。
        final CachingResult result = (CachingResult)this.workExecutor.execute(new AfterPreviousExecutionContext() {
            public UnitOfWork getWork() {
                return work;
            }

            public Optional<String> getRebuildReason() {
                return context.getTaskExecutionMode().getRebuildReason();
            }

            public Optional<AfterPreviousExecutionState> getAfterPreviousExecutionState() {
                return Optional.ofNullable(context.getAfterPreviousExecution());
            }
        });
        ...
}
```
可以看到，这里使用了 workExecutor 对象去真正执行 Task，在执行时便会回调 ExecuteActionsTaskExecuter.TaskExecution 内部类的 execute 方法，其实现源码如下所示：
```
java
  public WorkResult execute(@Nullable InputChangesInternal inputChanges) {
            this.task.getState().setExecuting(true);

            WorkResult var2;
            try {
                ExecuteActionsTaskExecuter.LOGGER.debug("Executing actions for {}.", this.task);
               
                // 1、回调 TaskActionListener 的 beforeActions 接口。
                ExecuteActionsTaskExecuter.this.actionListener.beforeActions(this.task);
               
                // 2、内部会遍历执行所有的 Action。 
                ExecuteActionsTaskExecuter.this.executeActions(this.task, inputChanges);
                var2 = this.task.getState().getDidWork() ? WorkResult.DID_WORK : WorkResult.DID_NO_WORK;
            } finally {
                this.task.getState().setExecuting(false);
               
               // 3、回调 TaskActionListener.afterActions。 
               ExecuteActionsTaskExecuter.this.actionListener.afterActions(this.task);
            }

            return var2;
}
```
**在 ExecuteActionsTaskExecuter.TaskExecution 内部类的 execute 方法中做了三件事**，如下所示：

- 1）、**回调 TaskActionListener 的 beforeActions**。
- 2）、**内部会遍历执行 Task 所有的 Action。 => 执行 Task 就是执行其中包含的所有 Action，这便是 Task 的本质**。
- 3）、**回调 TaskActionListener.afterActions**。

**当执行完 Task 的所有 Action 之后，便会最终在 DefaultBuildOperationExecutor 的 run 方法中回调 TaskExecutionListener.afterExecute 来标识 Task 最终执行完成**。
## 5、Finished
在 Finished 阶段仅仅只干了一件比较重要的事情，就是 **回调 buildListener 的 buildFinished 接口**，如下所示：
```
java
 private void finishBuild(String action, @Nullable Throwable stageFailure) {
        if (this.stage != DefaultGradleLauncher.Stage.Finished) {
            ...

            try {
               
                 this.buildListener.buildFinished(buildResult);
            } catch (Throwable var7) {
                failures.add(var7);
            }

            this.stage = DefaultGradleLauncher.Stage.Finished;
            
            ...
        }
}
```
## 6、小结
从对 Gradle 执行 Task 的分析中可以看到 Task 的本质，其实就是一系列的 Actions。深入了解了 Gradle 的构建流程之后，我们再重新回归头来看看开始的那一张 Gradle 的构建流程图
此外，zhangyi54 做的 Gradle原理动画讲解([www.bilibili.com/video/av559…](https://link.juejin.cn?target=https%3A%2F%2Fwww.bilibili.com%2Fvideo%2Fav55941638%2F)) 将枯燥的原理流程视觉化了，值得推荐。需要注意区分的是，动画讲解的 Gradle 版本比较老，但是主要的原理还是一致的，可以放心观看。
注意：build.gradle 脚本的 buildscript 会在脚本的其它内容之前执行。
# 四、关于 Gradle 中依赖实现的原理
## 1、通过 MethodMissing 机制，间接地调用 DefaultDependencyHandler 的 add 方法去添加依赖
我们都知道，DependencyHandler 是用来进行依赖声明的一个类，但是在 DependencyHandler 并没有发现 implementation(), api(), compile() 这些方法，这是怎么回事呢？
其实这是 **通过 MethodMissing 机制，间接地调用 DependencyHandler 的实现 DefaultDependencyHandler 的 add() 方法将依赖添加进去的**。
### 那么，methodMissing 又是什么？
它是 **Groovy 语言的一个重要特性，这个特性允许在运行时 catch 对于未定义方法的调用**。
而 **Gradle 对这个特性进行了封装，一个类要想使用这个特性，只要实现 MixIn 接口即可**。代码如下所示：
```
java
 public interface MethodMixIn {
    MethodAccess getAdditionalMethods();
}
```
## 2、不同的依赖声明，其实是由不同的转换器进行转换的
例如如下两个依赖：

- 1）、DependencyStringNotationConverter： **将类似于 'androidx.appcompat:appcompat:1.1.0' 的常规依赖声明转换为依赖**。
- 2）、DependencyProjectNotationConverter： **将类似于 'project(":mylib")' 的依赖声明转换为依赖**。

此外，**除了 project 依赖，其它的依赖最终都会转换为 SelfResolvingDependency, 而这个依赖可以实现自我解析**。
## 3、Project 依赖的本质是 Artifacts 依赖，也即 产物依赖。
## 4、什么是 Gradle 中的 Configuration？
**implementation 与 api。但是，承担 moudle 或者 aar 依赖仅仅是 Configuration 表面的任务，依赖的实质就是获取被依赖项构建过程中产生的 Artifacts**。
**而对于大部分的 Task 来说，执行完之后都会有产物输出。而在各个 moudle 之间 Artifacts 的产生与消费则构成了一个完整的生产者-消费者模型**。
## 5、Task 是如何发布自己 Artifacts 的？
**每一个 task 都会调用 VariantScopeImpl 中的 publishIntermediateArtifact 方法将自己的产物进行发布，最后会调用到 DefaultVariant 的 artifact 方法对产物进行发布**。

# 参考链接：

---

1、Android Gradle Plugin V3.6.2 源码
2、Gradle V5.6.4 源码
3、[Android Plugin DSL Reference](https://link.juejin.cn?target=http%3A%2F%2Fgoogle.github.io%2Fandroid-gradle-dsl%2Fcurrent%2F)
4、[Gradle DSL Reference](https://link.juejin.cn?target=https%3A%2F%2Fdocs.gradle.org%2Fcurrent%2Fdsl%2Findex.html)
5、[designing-gradle-plugins](https://link.juejin.cn?target=https%3A%2F%2Fguides.gradle.org%2Fdesigning-gradle-plugins%2F)
6、[android-training => gradle](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2F5A59%2Fandroid-training%2Ftree%2Fmaster%2Fgradle)
7、[连载 | 深入理解Gradle框架之一：Plugin, Extension, buildSrc](https://link.juejin.cn?target=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzI1MzYzMjE0MQ%3D%3D%26mid%3D2247485042%26idx%3D1%26sn%3Dfe32711dbcb483f7a47dfa0e304087c4%26scene%3D21%23wechat_redirect)
8、[连载 | 深入理解gradle框架之二：依赖实现分析](https://link.juejin.cn?target=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzI1MzYzMjE0MQ%3D%3D%26mid%3D2247485061%26idx%3D1%26sn%3D7c935aecbb9b558e4d5d9dd2c3eb7f96%26scene%3D21%23wechat_redirect)
9、[连载 | 深入理解gradle框架之三：artifacts的发布](https://link.juejin.cn?target=https%3A%2F%2Fmp.weixin.qq.com%2Fs%2F-G0OHJrNHbjXTC7AHtVAKw)
10、[Android Gradle Plugin 源码解析（上）](https://link.juejin.cn?target=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzIwMTAzMTMxMg%3D%3D%26mid%3D2649492752%26idx%3D1%26sn%3D1d1ad65c63667d96b72452a492cbde58%26chksm%3D8eec86efb99b0ff9378916d061f70d56bc1c27c795ef5c36cd5692886c3cbb1109636951a5c3%26scene%3D38%23wechat_redirect)
11、[Android Gradle Plugin 源码解析（下）](https://link.juejin.cn?target=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzIwMTAzMTMxMg%3D%3D%26mid%3D2649492778%26idx%3D1%26sn%3Dbf18cd9b7e4fb5f08b1a698836807304%26chksm%3D8eec86d5b99b0fc30d7a85f4b4d0ffe4bbc4d00b5b5e89f0ef005048a5ce4c030f1aad74f69f%26scene%3D38%23wechat_redirect)
12、[Gradle 庖丁解牛（构建源头源码浅析）](https://link.juejin.cn?target=https%3A%2F%2Fblog.csdn.net%2Fyanbober%2Farticle%2Fdetails%2F60584621)
13、[Gradle 庖丁解牛（构建生命周期核心委托对象创建源码浅析）](https://link.juejin.cn?target=https%3A%2F%2Fblog.csdn.net%2Fyanbober%2Farticle%2Fdetails%2F65635040)

