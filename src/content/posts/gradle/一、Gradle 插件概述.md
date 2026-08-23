---
title: "一、Gradle 插件概述"
published: 2021-02-01
description: "一、Gradle 插件概述"
tags: ["Gradle","构建工具"]
category: "gradle"
draft: false
slug: "gradle-008"
---

https://juejin.cn/post/6844904135314128903
# 一、Gradle 插件概述
自定义 Gradle 插件的本质就是把逻辑独立的代码进行抽取和封装，以便于我们更高效地通过插件依赖这一方式进行功能复用。
而在 Android 下的 gradle 插件共分为 两大类，如下所示：

- 1、脚本插件：同普通的 gradle 脚本编写形式一样，通过 apply from: 'JsonChao.gradle' 引用。
- 2、对象插件：通过插件全路径类名或 id 引用，它主要有 三种编写形式，如下所示： 
   - 1）、在当前构建脚本下直接编写。
   - 2）、在 buildSrc 目录下编写。
   - 3）、在完全独立的项目中编写。

下面👇，我们就先来看看如何编写一个脚本插件。
# 二、脚本插件
同普通的 gradle 脚本编写形式一样，我们既可以写在 build.gradle 里面，也可以自己新建一个 gradle 脚本文件进行编写。
```
groovy
 class PluginDemo implements Plugin<Project> {

    @Override
    void apply(Project target) { 
        println 'Hello author!'
    } 
}
```
然后，在需要使用的 gradle 脚本中通过 apply plugin： pluginName 的方式即可引用对应的插件。
```
groovy
 apply plugin: PluginDemo
```
# 三、运用 buildSrc 默认插件目录
在完成几个自定义 Gradle 插件之后，我发现在 buildSrc 目录下编写插件的方式是开发效率最高的，首先，buildSrc 是默认的插件目录，其次，在 buildSrc 目录下与独立工程的插件工程一样，也能够发布插件，这里仅仅只需对某些配置做一些调整即可，下面，我们就来看看如何来创建一个自定义 Gradle 插件。
## 1、创建一个能运行起来的空 Plugin
首先需要了解的是，buildSrc 目录是 gradle 默认的构建目录之一，该目录下的代码会在构建时自动地进行编译打包，然后它会被添加到 buildScript 中的 classpath 下，所以不需要任何额外的配置，就可以直接被其他模块中的 gradle 脚本引用。此外，关于 buildSrc，我们还需要注意以下 两点：

- 1）、buildSrc 的执行时机不仅早于任何⼀个 project（build.gradle），而且也早于 settings.gradle。
- 2）、settings.gradle 中如果配置了 ':buildSrc' ，buildSrc ⽬录就会被当做是子 Project ， 因会它会被执行两遍。所以在 settings.gradle 里面应该删掉 ':buildSrc' 的配置。
### 插件 moudle 创建三部曲

- 1）、新建一个 module，并将其命名为 buildSrc。这样，Gradle 默认会将其识别会工程的插件目录。
- 2）、src 目录下删除仅保留一个空的 main 目录，并在 main 目录下新建 1 个 groovy 目录与 1 个 resources 目录。
- 3）、将 buildSrc 中的 build.gradle 中的所有配置删去，并配置 groovy、resources 为源码目录与相关依赖即可。配置代码如下所示：
```
groovy
 apply plugin: 'groovy'

repositories {
    google()
    mavenCentral()
    jcenter()
}

dependencies {
    // Groovy DSL
    implementation localGroovy()
    // Gradle DSL
    implementation gradleApi()

    // Android DSL
    implementation 'com.android.tools.build:gradle:3.6.2'

    // ASM V7.1
    implementation group: 'org.ow2.asm', name: 'asm', version: '7.1'
    implementation group: 'org.ow2.asm', name: 'asm-commons', version: '7.1'

}

sourceSets {
    main {
        groovy {
            srcDir 'src/main/groovy'
        }

        resources {
            srcDir 'src/main/resources'
        }
    }
}
```
### 插件创建二部曲

- 1）、首先，在我的 main 目录下创建一个递归文件夹 "com.json.chao.study"，里面直接新建一个名为 CustomGradlePlugin 的普通文件。然后，在文件中写入 'class CustomGradlePlugin' ，这时 CustomGradlePlugin 会被自动识别为类，接着将其实现 Plugin 接口，其中的 apply 方法就是插件被引入时要执行的方法，这样，自定义插件类就基本完成了，CustomGradlePlugin 类的代码如下所示：
```
groovy
 /**
 * 自定义插件
 */
class CustomGradlePlugin implements Plugin<Project> {

    /**
     * 插件被引入时要执行的方法
     * @param project 引入当前插件的 project
     */
    @Override
    void apply(Project project) {
        println "Hello plugin..." + project.name
    }
}
```

- 2）、接着，在 resources 目录下创建一个 META-INF.gradle-plugins 的递归目录，里面新建一个 "com.json.chao.study.properties" 文件，其中 '.properties' 前面的名字即为 自定义插件的名字，在该文件中，我们需要标识该插件对应的插件实现类，代码如下所示： implementation-class=com.json.chao.study.CustomGradlePlugin 这样，一个最简单的自定义插件就完成了。接着，我们直接在 app moudle 下的 build.gradle 文件中使用 'apply plugin: 'com.json.chao.study' 引入我们定义好的插件然后同步工程即可看到如下输出：
```
groovy
 ...
> Configure project :app
Hello plugin...app
...
```
可以看到，通过 id 引用的方式，我们可以隐藏类名等细节，使得插件的引用变得更加容易。
## 2、使用自定义 Extension 与 Task
### 1、自定义 Extension
在 深度探索 Gradle 自动化构建技术（三、Gradle 核心解密） 一文中我们讲解了如何创建一个版本信息管理的 task，这里我们就可以直接将它接入到 gradle 的构建流程之中。为了能让 App 传入相关的版本信息和生成的版本信息文件路径，我们需要一个用于配置版本信息的 Extension，其实质就是一个实体类，如下所示：
```
groovy
 /*
 * Description: 负责 Release 版本管理的扩展属性区域
 *
 * @author quchao
 */
class ReleaseInfoExtension {

    String versionName;
    String versionCode;
    String versionInfo;
    String fileName;
}
```
然后，在我们的 CustomGradlePlugin 的 apply 方法中加入下面代码去创建用于设置版本信息的扩展属性，如下所示：
```
groovy
 // 创建用于设置版本信息的扩展属性
project.extensions.create("releaseInfo", ReleaseInfoExtension.class)
```
在 project.extensions.create 方法的内部其实质是 通过 project.extensions.create() 方法来获取在 releaseInfo 闭包中定义的内容并通过反射将闭包的内容转换成一个 ReleaseInfoExtension 对象。
最后，我们就可以在 app moudle 的 build.gradle 脚本中使用 releaseInfo 去配置扩展属性，代码如下所示：
```
groovy
 releaseInfo {
    versionCode = "1"
    versionName = "1.0.0"
    versionInfo = "第一个版本~"
    fileName = "releases.xml"
}
```
### 2、自定义 Task
使用自定义扩展属性 Extension 仅仅是为了让使用插件者有配置插件的能力。而插件还得借助自定义 Task 来实现相应的功能，这里我们需要创建一个更新版本信息的 Task，我们将其命名为 ReleaseInfoTask，其具体实现代码如下所示：
```
groovy
 /**
 * 更新版本信息的 Task
 */
class ReleaseInfoTask extends DefaultTask {

    ReleaseInfoTask() {
        // 1、在构造器中配置了该 Task 对应的 Task group，即 Task 组，并为其添加上了对应的描述信息。
        group = 'version_manager'
        description = 'release info update'
    }

    // 2、在 gradle 执行阶段执行
    @TaskAction
    void doAction() {
        updateVersionInfo();
    }

    private void updateVersionInfo() {
        // 3、从 realeaseInfo Extension 属性中获取相应的版本信息
        def versionCodeMsg = project.extensions.releaseInfo.versionCode;
        def versionNameMsg = project.extensions.releaseInfo.versionName;
        def versionInfoMsg = project.extensions.releaseInfo.versionInfo;
        def fileName = project.extensions.releaseInfo.fileName;
        def file = project.file(fileName)
        // 4、将实体对象写入到 xml 文件中
        def sw = new StringWriter()
        def xmlBuilder = new MarkupBuilder(sw)
        if (file.text != null && file.text.size() <= 0) {
            //没有内容
            xmlBuilder.releases {
                release {
                    versionCode(versionCodeMsg)
                    versionName(versionNameMsg)
                    versionInfo(versionInfoMsg)
                }
            }
            //直接写入
            file.withWriter { writer -> writer.append(sw.toString())
            }
        } else {
            //已有其它版本内容
            xmlBuilder.release {
                versionCode(versionCodeMsg)
                versionName(versionNameMsg)
                versionInfo(versionInfoMsg)
            }
            //插入到最后一行前面
            def lines = file.readLines()
            def lengths = lines.size() - 1
            file.withWriter { writer ->
                lines.eachWithIndex { line, index ->
                    if (index != lengths) {
                        writer.append(line + '\r\n')
                    } else if (index == lengths) {
                        writer.append('\r\r\n' + sw.toString() + '\r\n')
                        writer.append(lines.get(tlengths))
                    }
                }
            }
        }
    }
}
```
首先，在注释1处，我们 在构造器中配置了该 Task 对应的 Task group，即 Task 组，并为其添加上了对应的描述信息。接着，在注释2处，我们 使用了 @TaskAction 注解标注了 doAction 方法，这样它就会在 gradle 执行阶段执行。在注释3处，我们 使用了 project.extensions.releaseInfo.xxx 一系列 API 从 realeaseInfo Extension 属性中了获取相应的版本信息。最后，注释4处，就是用来 实现该 task 的核心功能，即将实体对象写入到 xml 文件中。
可以看到，一般的插件 task 都会遵循前三个步骤，最后一个步骤就是用来实现插件的核心功能。 当然，最后别忘了在我们的 CustomGradlePlugin 的 apply 方法中加入下面代码去创建 ReleaseInfoTask 实例，代码如下所示：
```
groovy
 // 创建用于更新版本信息的 task
project.tasks.create("releaseInfoTask", ReleaseInfoTask.class)
```
# 四、变体（Variants）的作用
要理解 Variants 的作用，就必须先了解 flavor、dimension 与 variant 这三者之间的关系。在 android gradle plugin V3.x 之后，每个 flavor 必须对应一个 dimension，可以理解为 flavor 的分组，然后不同 dimension 里的 flavor 会组合成一个 variant。示例代码如下所示：
```
groovy
 flavorDimensions "size", "color"

productFlavors {
    JsonChao {
        dimension "size"
    }
    small {
        dimension "size"
    }
    blue {
        dimension "color"
    }
    red {
        dimension "color"
    }
}
```
在 Android 对 Gradle 插件的扩展支持之中，其中最常用的便是 利用变体（Variants）来对构建过程中的各个默认的 task 进行 hook。关于 Variants 共有 三种类型，如下所示：

- 1）、applicationVariants：只适用于 app plugin。
- 2）、libraryVariants：只适用于 library plugin。
- 3）、testVariants：在 app plugin 与 libarary plugin 中都适用。
## 1、使用 applicationVariants
为了讲解 applicationVariants 的作用，我们需要先在 app moudle 的 build.gradle 文件中配置几个 flavor，代码如下所示：
```
groovy
 productFlavors {
    douyin {}
    weixin {}
    google {}
}
```
### 1）、使用 applicationVariants.all 在配置阶段之后去获取所有 variant 的 name 与 baseName
然后，我们可以 使用 applicationVariants.all 在配置阶段之后去获取所有 variant 的 name 与 baseName。代码如下所示：
```
groovy
 this.afterEvaluate {
    this.android.applicationVariants.all { variant ->
        def name = variant.name
        def baseName = variant.baseName
        println "name: $name, baseName: $baseName"
    }
}
```
最后，执行 gradle clean task，其输出信息如下所示：
```
gradle
 > Configure project :app
name: douyinDebug, baseName: douyin-debug
name: douyinRelease, baseName: douyin-release
name: weixinDebug, baseName: weixin-debug
name: weixinRelease, baseName: weixin-release
name: googleDebug, baseName: google-debug
name: googleRelease, baseName: google-release
可以看到，name 与 baseName 的区别：baiduDebug 与 baidu-debug 。
```
### 2）、使用 applicationVariants.all 在配置阶段之后去修改输出的 APK 名称
```
groovy
 this.afterEvaluate {
    this.android.applicationVariants.all { variant ->
        variant.outputs.each {
            // 由于我们当前的变体是 application 类型的，所以
            // 这个 output 就是我们 APK 文件的输出路径，我们
            // 可以通过重命名这个文件来修改我们最终输出的 APK 文件
            outputFileName = "app-${variant.baseName}-${variant.versionName}.apk"
            println outputFileName
        }
    }
}
```
执行 gradle clean task，其输出信息如下所示：
```
groovy
 > Configure project :app
app-debug-1.0.apk
app-release-1.0.apk
```
### 3）、对 applicationVariants 中的 Task 进行 Hook
我们可以在 android.applicationVariants.all 的闭包中通过 variant.task 来获取相应的 Task。代码如下所示：
```
groovy
 this.afterEvaluate {
    this.android.applicationVariants.all { variant ->
        def task = variant.checkManifest
        println task.name
    }
}
```
然后，执行 gradle clean task，其输出信息如下所示：
```
gradle
 checkDebugManifest
checkReleaseManifest
```
既然可以获取到变体中的 Task，我们就可以根据不同的 Task 类型来做特殊处理。例如，我们可以利用 variants 去解决插件化开发中的痛点：编写一个对插件化项目中的各个插件自动更新的脚本，其核心代码如下所示：
```
groovy
 this.afterEvaluate {
    this.android.applicationVariants.all { variant ->
        // checkManifest 这个 Task 在 Task 容器中
        // 靠前的位置，我们可以在这里预先更新插件。
        def checkTask = variant.checkManifest
        checkTask.doFirst {
            def bt = variant.buildType.name
            if (bt == 'qa' || bt == 'preview'
                    || bt == 'release') {
                update_plugin(bt)
            }
        }
    }
}
```
至于 update_plugin 的实现，主要就是一些插件安全校验与下载的逻辑，这部分其实跟 Gradle 没有什么联系，如果有需要，可以在 Awesome-WanAndroid 项目下查看。
# 五、Transform
众所周知，Google 官方在 Android Gradle V1.5.0 版本以后提供了 Transfrom API, 允许第三方 Plugin 在打包成 .dex 文件之前的编译过程中操作 .class 文件，我们需要做的就是实现 Transform 来对 .class 文件遍历以拿到所有方法，修改完成后再对原文件进行替换即可。
总的来说，Gradle Transform 的功能就是把输入的 .class 文件转换为目标字节码文件。 下面，我们来了解一下 Transform 的两个基础概念。
## 1、TransformInput
TransformInput 可认为是所有输入文件的一个抽象，它主要包括两个部分，如下所示：

- 1）、DirectoryInput 集合：表示以源码方式参与项目编译的所有目录结构与其目录下的源码文件。
- 2）、JarInput 集合：表示以 jar 包方式参与项目编译的所有本地 jar 包和远程 jar 包。需要注意的是，这个 jar 所指也包括 aar。
## 2、TransformOutputProvider
表示 Transform 的输出，利用它我们可以获取输出路径等信息。
## 3、实现 Transform
### 1、首先，配置 Android DSL 相关的依赖：
```
groovy
 // 由于 buildSrc 的执行时机要早于任何一个 project，因此需要⾃⼰添加仓库 
repositories {
    google()
    jcenter() 
}

dependencies {
    // Android DSL
    implementation 'com.android.tools.build:gradle:3.6.2'
}
```
### 2、然后，继承 com.android.build.api.transform.Transform ，创建⼀个 Transform 的子类
其创建步骤可以细分为五步，如下所示：

- 1）、重写 getName 方法：返回对应的 Task 名称。
- 2）、重写 getInputTypes 方法：确定对那些类型的结果进行转换。
- 3）、重写 getScopes 方法：指定插件的适用范围。
- 4）、重写 isIncremental 方法：表示是否支持增量更新。
- 5）、重写 transform 方法：进行具体的转换过程。

下面👇，我们来分别来进行详细讲解。
#### 1）、重写 getName 方法：返回对应的 Task 名称
每一个 Transform 都有一个与之对应的 Transform task，这里便是返回的 task name。它会出现在 app/build/intermediates/transforms 目录下。其代码如下所示：
```
groovy
  /**
  * 每一个 Transform 都有一个与之对应的 Transform task，
  * 这里便是返回的 task name。它会出现在
  * app/build/intermediates/transforms 目录下
  *
  * @return Transform Name
  */
 @Override
 String getName() {
     return "MyCustomTransform"
 }
```
#### 2）、重写 getInputTypes 方法：确定对那些类型的结果进行转换
getInputTypes 方法用于确定我们需要对哪些类型的结果进行转换：如字节码、资源⽂件等等。目前 ContentType 有六种枚举类型，通常我们使用比较频繁的有前两种，如下所示：

- 1、CONTENT_CLASS：表示需要处理 java 的 class 文件。
- 2、CONTENT_JARS：表示需要处理 java 的 class 与 资源文件。
- 3、CONTENT_RESOURCES：表示需要处理 java 的资源文件。
- 4、CONTENT_NATIVE_LIBS：表示需要处理 native 库的代码。
- 5、CONTENT_DEX：表示需要处理 DEX 文件。
- 6、CONTENT_DEX_WITH_RESOURCES：表示需要处理 DEX 与 java 的资源文件。

因为我们需要修改的是字节码，所以直接返回 TransformManager.CONTENT_CLASS 即可，代码如下所示：
```
groovy
 /**
 * 需要处理的数据类型，目前 ContentType
 * 有六种枚举类型，通常我们使用比较频繁的有前两种：
 *      1、CONTENT_CLASS：表示需要处理 java 的 class 文件。
 *      2、CONTENT_JARS：表示需要处理 java 的 class 与 资源文件。
 *      3、CONTENT_RESOURCES：表示需要处理 java 的资源文件。
 *      4、CONTENT_NATIVE_LIBS：表示需要处理 native 库的代码。
 *      5、CONTENT_DEX：表示需要处理 DEX 文件。
 *      6、CONTENT_DEX_WITH_RESOURCES：表示需要处理 DEX 与 java 的资源文件。 
 *
 * @return
 */
@Override
Set<QualifiedContent.ContentType> getInputTypes() {
    // 用于确定我们需要对哪些类型的结果进行转换：如字节码、资源⽂件等等。
    // return TransformManager.RESOURCES
    return TransformManager.CONTENT_CLASS
}
```
#### 3）、重写 getScopes 方法：指定插件的适用范围
getScopes 方法则是用于确定插件的适用范围：目前 Scope 有 五种基本类型，如下所示：

- 1、PROJECT：只有项目内容。
- 2、SUB_PROJECTS：只有子项目。
- 3、EXTERNAL_LIBRARIES：只有外部库，
- 4、TESTED_CODE：由当前变体（包括依赖项）所测试的代码。
- 5、PROVIDED_ONLY：只提供本地或远程依赖项。

此外，还有一些复合类型，它们是都是由这五种基本类型组成，以实现灵活确定自定义插件的范围，这里通常是指定整个 project，也可以指定其它范围，其代码如下所示：
```
grooovy
 /**
 * 表示 Transform 要操作的内容范围，目前 Scope 有五种基本类型：
 *      1、PROJECT                   只有项目内容
 *      2、SUB_PROJECTS              只有子项目
 *      3、EXTERNAL_LIBRARIES        只有外部库
 *      4、TESTED_CODE               由当前变体（包括依赖项）所测试的代码
 *      5、PROVIDED_ONLY             只提供本地或远程依赖项
 *      SCOPE_FULL_PROJECT 是一个 Scope 集合，包含 Scope.PROJECT,
Scope.SUB_PROJECTS, Scope.EXTERNAL_LIBRARIES 这三项，即当前 Transform
的作用域包括当前项目、子项目以及外部的依赖库
 *
 * @return
 */
@Override
Set<? super QualifiedContent.Scope> getScopes() {
    // 适用范围：通常是指定整个 project，也可以指定其它范围
    return TransformManager.SCOPE_FULL_PROJECT
}
```
#### 4）、重写 isIncremental 方法：表示是否支持增量更新
isIncremental 方法用于确定是否支持增量更新，如果返回 true，TransformInput 会包含一份修改的文件列表，如果返回 false，则会进行全量编译，并且会删除上一次的输出内容。
```
grooovy
 @Override
boolean isIncremental() {
    // 是否支持增量更新
    // 如果返回 true，TransformInput 会包含一份修改的文件列表
    // 如果返回 false，会进行全量编译，删除上一次的输出内容
    return false
}
```
#### 5）、重写 transform 方法：进行具体的转换过程
在 transform 方法中，就是用来给我们进行具体的转换过程的。其实现代码如下所示：
```
groovy
 /**
 * 进行具体的转换过程
 *
 * @param transformInvocation
 */
@Override
void transform(TransformInvocation transformInvocation) throws
TransformException, InterruptedException, IOException {
    super.transform(transformInvocation)
    println '--------------- MyTransform visit start --------------- '
    def startTime = System.currentTimeMillis()
    def inputs = transformInvocation.inputs
    def outputProvider = transformInvocation.outputProvider
    // 1、删除之前的输出
    if (outputProvider != null)
        outputProvider.deleteAll()
    // Transform 的 inputs 有两种类型，一种是目录，一种是 jar
包，要分开遍历
    inputs.each { TransformInput input ->
        // 2、遍历 directoryInputs（本地 project 编译成的多个 class
⽂件存放的目录）
        input.directoryInputs.each { DirectoryInput directoryInput ->
            handleDirectory(directoryInput, outputProvider)
        }
        // 3、遍历 jarInputs（各个依赖所编译成的 jar 文件）
        input.jarInputs.each { JarInput jarInput ->
            handleJar(jarInput, outputProvider)
        }
    }
    def cost = (System.currentTimeMillis() - startTime) / 1000
    println '--------------- MyTransform visit end --------------- '
    println "MyTransform cost ： $cost s"
}
```
这里我们主要是做了三步处理，如下所示：

- 1）、删除之前的输出。
- 2）、遍历 directoryInputs（本地 project 编译成的多个 class ⽂件存放的目录）。
- 3）、遍历 jarInputs（各个依赖所编译成的 jar 文件）。

在 handleDirectory 与 handleJar 方法中则是进行了相应的 文件处理 && ASM 字节码修改。这里我直接放出 Transform 的通用模板代码，代码如下所示：
```
groovy
 class MyTransform extends Transform {

    
    /**
     * 每一个 Transform 都有一个与之对应的 Transform task，
     * 这里便是返回的 task name。它会出现在 app/build/intermediates/transforms 目录下
     *
     * @return Transform Name
     */
    @Override
    String getName() {
        return "MyCustomTransform"
    }

    /**
     * 需要处理的数据类型，目前 ContentType 有六种枚举类型，通常我们使用比较频繁的有前两种：
     *      1、CONTENT_CLASS：表示需要处理 java 的 class 文件。
     *      2、CONTENT_JARS：表示需要处理 java 的 class 与 资源文件。
     *      3、CONTENT_RESOURCES：表示需要处理 java 的资源文件。
     *      4、CONTENT_NATIVE_LIBS：表示需要处理 native 库的代码。
     *      5、CONTENT_DEX：表示需要处理 DEX 文件。
     *      6、CONTENT_DEX_WITH_RESOURCES：表示需要处理 DEX 与 java 的资源文件。
     *
     * @return
     */
    @Override
    Set<QualifiedContent.ContentType> getInputTypes() {
        // 用于确定我们需要对哪些类型的结果进行转换：如字节码、资源⽂件等等。
        // return TransformManager.RESOURCES
        return TransformManager.CONTENT_CLASS
    }

    /**
     * 表示 Transform 要操作的内容范围，目前 Scope 有五种基本类型：
     *      1、PROJECT                   只有项目内容
     *      2、SUB_PROJECTS              只有子项目
     *      3、EXTERNAL_LIBRARIES        只有外部库
     *      4、TESTED_CODE               由当前变体（包括依赖项）所测试的代码
     *      5、PROVIDED_ONLY             只提供本地或远程依赖项
     *      SCOPE_FULL_PROJECT 是一个 Scope 集合，包含 Scope.PROJECT, Scope.SUB_PROJECTS, Scope.EXTERNAL_LIBRARIES 这三项，即当前 Transform 的作用域包括当前项目、子项目以及外部的依赖库
     *
     * @return
     */
    @Override
    Set<? super QualifiedContent.Scope> getScopes() {
        // 适用范围：通常是指定整个 project，也可以指定其它范围
        return TransformManager.SCOPE_FULL_PROJECT
    }

    @Override
    boolean isIncremental() {
        // 是否支持增量更新
        // 如果返回 true，TransformInput 会包含一份修改的文件列表
        // 如果返回 false，会进行全量编译，删除上一次的输出内容
        return false
    }
    
    /**
     * 进行具体的转换过程
     *
     * @param transformInvocation
     */
    @Override
    void transform(TransformInvocation transformInvocation) throws TransformException, InterruptedException, IOException {
        super.transform(transformInvocation)
        println '--------------- MyTransform visit start --------------- '
        def startTime = System.currentTimeMillis()
        def inputs = transformInvocation.inputs
        def outputProvider = transformInvocation.outputProvider
        // 删除之前的输出
        if (outputProvider != null)
            outputProvider.deleteAll()

        // Transform 的 inputs 有两种类型，一种是目录，一种是 jar 包，要分开遍历
        inputs.each { TransformInput input ->
            // 遍历 directoryInputs（本地 project 编译成的多个 class ⽂件存放的目录）
            input.directoryInputs.each { DirectoryInput directoryInput ->
                handleDirectory(directoryInput, outputProvider)
            }

            // 遍历 jarInputs（各个依赖所编译成的 jar 文件）
            input.jarInputs.each { JarInput jarInput ->
                handleJar(jarInput, outputProvider)
            }
        }

        def cost = (System.currentTimeMillis() - startTime) / 1000
        println '--------------- MyTransform visit end --------------- '
        println "MyTransform cost ： $cost s"
    }

    static void handleJar(JarInput jarInput, TransformOutputProvider outputProvider) {
        if (jarInput.file.getAbsolutePath().endsWith(".jar")) {
            // 截取文件路径的 md5 值重命名输出文件，避免同名导致覆盖的情况出现
            def jarName = jarInput.name
            def md5Name = DigestUtils.md5Hex(jarInput.file.getAbsolutePath())
            if (jarName.endsWith(".jar")) {
                jarName = jarName.substring(0, jarName.length() - 4)
            }
            JarFile jarFile = new JarFile(jarInput.file)
            Enumeration enumeration = jarFile.entries()
            File tmpFile = new File(jarInput.file.getParent() + File.separator + "classes_temp.jar")
            // 避免上次的缓存被重复插入
            if (tmpFile.exists()) {
                tmpFile.delete()
            }
            JarOutputStream jarOutputStream = new JarOutputStream(new FileOutputStream(tmpFile))
            while (enumeration.hasMoreElements()) {
                JarEntry jarEntry = (JarEntry) enumeration.nextElement()
                String entryName = jarEntry.getName()
                ZipEntry zipEntry = new ZipEntry(entryName)
                InputStream inputStream = jarFile.getInputStream(jarEntry)
                if (checkClassFile(entryName)) {
                    // 使用 ASM 对 class 文件进行操控
                    println '----------- deal with "jar" class file <' + entryName + '> -----------'
                    jarOutputStream.putNextEntry(zipEntry)
                    ClassReader classReader = new ClassReader(IOUtils.toByteArray(inputStream))
                    ClassWriter classWriter = new ClassWriter(classReader, org.objectweb.asm.ClassWriter.COMPUTE_MAXS)
                    ClassVisitor cv = new MyCustomClassVisitor(classWriter)
                    classReader.accept(cv, EXPAND_FRAMES)
                    byte[] code = classWriter.toByteArray()
                    jarOutputStream.write(code)
                } else {
                    jarOutputStream.putNextEntry(zipEntry)
                    jarOutputStream.write(IOUtils.toByteArray(inputStream))
                }
                jarOutputStream.closeEntry()
            }
            jarOutputStream.close()
            jarFile.close()

            // 生成输出路径 dest：./app/build/intermediates/transforms/xxxTransform/...
            def dest = outputProvider.getContentLocation(jarName + md5Name,
                    jarInput.contentTypes, jarInput.scopes, Format.JAR)
            // 将 input 的目录复制到 output 指定目录
            FileUtils.copyFile(tmpFile, dest)
            tmpFile.delete()
        }
    }

    static void handleDirectory(DirectoryInput directoryInput, TransformOutputProvider outputProvider) {
        // 在增量模式下可以通过 directoryInput.changedFiles 方法获取修改的文件
//        directoryInput.changedFiles
        if (directoryInput.file.size() == 0)
            return
        if (directoryInput.file.isDirectory()) {
            /**遍历以某一扩展名结尾的文件*/
            directoryInput.file.traverse(type: FileType.FILES, nameFilter: ~/.*\.class/) {
                File classFile ->
                    def name = classFile.name
                    if (checkClassFile(name)) {
                        println '----------- deal with "class" file <' + name + '> -----------'
                        def classReader = new ClassReader(classFile.bytes)
                        def classWriter = new ClassWriter(classReader, ClassWriter.COMPUTE_MAXS)
                        def classVisitor = new MyCustomClassVisitor(classWriter)
                        classReader.accept(classVisitor, EXPAND_FRAMES)
                        byte[] codeBytes = classWriter.toByteArray()
                        FileOutputStream fileOutputStream = new FileOutputStream(
                                classFile.parentFile.absolutePath + File.separator + name
                        )
                        fileOutputStream.write(codeBytes)
                        fileOutputStream.close()
                    }
            }
        }
        /// 获取 output 目录 dest：./app/build/intermediates/transforms/hencoderTransform/
        def destFile = outputProvider.getContentLocation(
                directoryInput.name,
                directoryInput.contentTypes,
                directoryInput.scopes,
                Format.DIRECTORY
        )
        // 将 input 的目录复制到 output 指定目录
        FileUtils.copyDirectory(directoryInput.file, destFile)
    }

    /**
     * 检查 class 文件是否需要处理
     *
     * @param fileName
     * @return class 文件是否需要处理
     */
    static boolean checkClassFile(String name) {
        // 只处理需要的 class 文件
        return (name.endsWith(".class") && !name.startsWith("R\$")
                && "R.class" != name && "BuildConfig.class" != name
                && "android/support/v4/app/FragmentActivity.class" == name)
    }
```
编写完 Transform 的代码之后，我们就可以 在 CustomGradlePlugin 的 apply 方法中加入下面代码去注册 MyTransform 实例，代码如下所示：
```
groovy
 // 注册我们自定义的 Transform
def appExtension = project.extensions.findByType(AppExtension.class)
appExtension.registerTransform(new MyTransform());
```
上面的自定义 Transform 的代码就是一个标准的 Transorm + ASM 修改字节码的模板代码，在使用时，我们只需要编写我们自己的 MyClassVisitor 类去修改相应的字节码文件即可，关于 ASM 的使用可以参考我前面写的 深入探索编译插桩技术（四、ASM 探秘） 一文。
## 4、Transform 使用小结
我们可以自定义一个 Gradle Plugin，然后注册一个 Transform 对象，在 tranform 方法里，可以分别遍历目录和 jar 包，然后我们就可以遍历当前应用程序的所有 .class 文件，然后再利用 ASM 框架的 Core API 去加载相应的 .class 文件，并解析，就可以找到满足特定条件的 .class 文件和相关方法，最后去修改相应的方法以实现动态插入相应的字节码。
# 六、发布 Gradle 插件
发布插件可以分为 两种形式，如下所示：

- 1）、发布插件到本地仓库。
- 2）、发布插件到远程仓库。

下面，我们就来使用 mavenDeployer 插件来将插件分别发布在本地仓库和远程仓库。
## 1、发布插件到本地仓库
引入 maven 插件之后，我们在 uploadArchives 加入想要上传的仓库地址与相关配置即可，这样 Gradle 在执行 uploadArchives 时将生成和上传 pom.xml 文件，将插件上传至本地仓库的示例代码如下所示：
```
groovy
 apply plugin: 'maven'

uploadArchives {
    repositories {
        mavenDeployer {
            // 上传到当前项目根目录下的本地 repo 目录中
            repository(url: uri('../repo'))

            pom.groupId = 'com.json.chao.study'
            pom.artifactId = 'custom-gradle-plugin'
            pom.version = '1.0.0'
        }
    }
}
```
可以看到，这里我们将本地仓库路径指定为了根目录下的 repo 文件夹。此外，我们需要配置插件中的一些属性信息，通常包含如下三种：

- 1)、groupId：组织/公司名称。
- 2)、artifactId：项目/模块名称。
- 3)、version：项目/模块的当前版本号。
## 2、发布插件到远程仓库
```
groovy
 apply plugin: 'maven'

uploadArchives {
    configuration = configurations.archives
    repositories {
        mavenDeployer {
            repository(url: MAVEN_REPO_RELEASE_URL) {
                authentication(userName: "JsonChao", password: "123456")
            }
            
            pom.groupId = 'com.json.chao.study'
            pom.artifactId = 'custom-gradle-plugin'
            pom.version = '1.0.0'
        }
    }
}
```
不同于发布插件到本地仓库的方式，发布插件到远程仓库仅仅是将 repository 中的 url 替换为 远程 maven 仓库的 url，并将需要认证的 userName 与 password 进行配置即可。将插件配置好了之后，我们就可以通过 ./gradlew uploadArchivers 来执行这个 task，实现将插件发布到本地/远程仓库。
# 七、调试 Gradle 插件
### 1、首先，我们需要在 AndroidStudio 中增加一个 Remote 配置，如下图所示：
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1699454707013-1bd99bd5-0f5b-4f24-95a6-ea96cff71eb6.webp)
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1699454707013-25c9a784-d5da-47df-b5a5-f5f0a106015f.webp)
![](https://cdn.nlark.com/yuque/0/2023/webp/215777/1699454707238-0b04c393-fc2f-4aed-b5be-2a9616cd7a8b.webp)
最后，我们只需要输入插件的 Name 即可，我们这里的插件名字是 plugin-release。
### 2、在命令行输入如下命令开启 debug 调试相应的 Task（调试的 task 中比较多的是 assembleRelease 这个 Task，因为我们最常做的就是对打包流程进行 Hook），如下所示：
```
gradle
 ./gradlew --no-daemon -Dorg.gradle.debug=true :app:assembleRelease
```
### 3、最后，我们在插件代码中打好相应的断点，选中我们上一步创建的 Remote 配置，点击 Debug 按钮即可开始调试我们的自定义插件代码了。
# 八、总结
在本文中，我们一起学习了如何自定义一个 Gradle 插件，如果你还没创建一个属于自己的自定义 Gradle 插件，我强烈建议你去尝试一下。当然，仅仅会制造一个自定义 Gradle 插件还远远不够，在下一篇文章中，我们会来全方位地深入剖析 Gradle 插件架构体系中涉及的核心原理，尽请期待~

### 参考链接：

- 1、自定义 Gradle 插件 官方文档
- 2、Android Plugin DSL
- 3、Transform API
- 4、一篇文章带你了解Gradle插件的所有创建方式
- 5、写给 Android 开发者的 Gradle 系列（三）撰写 plugin
- 6、Gradle Transform API 的基本使用
- 7、如何开发一款高性能的 gradle transform
- 8、gradle超详细解析
- 9、【Android】函数插桩（Gradle + ASM）

