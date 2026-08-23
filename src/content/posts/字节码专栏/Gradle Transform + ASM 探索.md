---
title: "Gradle Transform + ASM 探索"
published: 2020-06-28
description: "Gradle Transform + ASM 探索"
tags: ["字节码","JVM","专栏"]
category: "字节码专栏"
draft: false
slug: "bytecode-002"
---

## 前言
使用 Gradle Transform + ASM 实现代码插桩的使用已经非常普遍。本文试图探索如何更加快速简洁的利用 Transform 实现代码插桩，并尝试实现

- 通过注解对任意类当中所有的方法**实现计算方法耗时**的插桩
- 通过配置实现对任意类（主要是针对第三方库）当中指定方法的**实现计算方法耗时**的插桩
- 对工程中所有的点击事件进行插桩，方便埋点或确定代码位置
- ……
## Transform + ASM 能做什么
简单来说就是利用 AGP 提供的 Transform 接口，在应用打包的流程中，对 java/kotlin 编译生成的 class 文件进行二次写操作，插入一些自定义的逻辑。这些逻辑一般是重复且有规律的，并且大概率和业务逻辑无关的。
一些统计应用数据的 SDK，会在页面展现和退出的生命周期函数里，在应用编译期插入统计相关的逻辑，统计页面展现数据；这种对开发者非常透明的实现，一方面接入成本非常低，另一方面也减少了三方库对现有工程的显示侵入，尽可能的减少了耦合。
也有常见的代码耗时统计的实现，在方法体开始的时候，利用 System.currentTimeMillis() 方法记录开始时间，在方法返回之前，进行统计。当然，这样的功能早在 2013 年已经由[JakeWharton](https://github.com/JakeWharton) 大神用 aspectj的方案 [实现过了](https://github.com/JakeWharton/hugo)。
## Transform 基本流程
关于如何创建一个基于的 Gradle 插件项目，以及如何在 Plugin 中注册的具体实现就不展开了，网上可以找到好多这种教程，这里从 Transform 的实现说起。
[![image.png](https://cdn.nlark.com/yuque/0/2023/png/215777/1699347761228-058694d4-e1f9-4064-bc1d-f016e494cf45.png)](https://rebooters.github.io/2020/01/04/Gradle-Transform-ASM-%E6%8E%A2%E7%B4%A2/transform.png)
可以看到实现一个自定义的 Transform 需要做的事情还是非常有规律的。继承 Transform 这个抽象类，覆写这几个方法一般来说就够用了。每个方法具体的功能从方法名就可以了解了。

- getName 这个transform 的名称，一个应用内可以由多个 Transform，因此需要一个名称标记，方便后面调试。
- getInputTypes 输入类型，ContentType 是一个枚举，这个输入类型是什么意思呢？其实看一下这个枚举的定义你就明白了。
```
enum DefaultContentType implements ContentType {
        /**
         * The content is compiled Java code. This can be in a Jar file or in a folder. If
         * in a folder, it is expected to in sub-folders matching package names.
         */
        CLASSES(0x01),

        /** The content is standard Java resources. */
        RESOURCES(0x02);

        private final int value;

        DefaultContentType(int value) {
            this.value = value;
        }

        
        public int getValue() {
            return value;
        }
    }
```

**这里可以注意一下，使用 Transform 我们还可以对 resources 文件做处理**，你应该听说过或者用过 [AndResGuard](https://github.com/shwenzhang/AndResGuard) 来混淆资源文件吧，看到这里你是不是觉得自己也有点思路了呢。

- isIncremental 是否支持增量编译。对于一个稍微庞大点儿的项目，Gradle 现有的构建流程其实已经很耗时了，对于耗时这件事归根结底唯一的解决方法就是并行和缓存，但是 Gradle 的很多任务是有依赖关系的，所以并行在很大程度上受到了限制。因此，缓存就成为了唯一可以去突破的方向。**一个自定义的 Transform 在可能的情况，支持增量编译，可以节省报一些编译时间和资源**，当然，由于 Transform 要实现功能的限制，必须每一次全量编译，那么一定要记得删除上一次编译编译的产物，以免产生 bug。关于如何实现这些细节，后面会有介绍。
- getScopes 定义这个 Transform 要处理那些输入文件。ScopeType 同样是一个枚举，看一下他的定义。
```
enum Scope implements ScopeType {
       /** Only the project (module) content */
       PROJECT(0x01),
       /** Only the sub-projects (other modules) */
       SUB_PROJECTS(0x04),
       /** Only the external libraries */
       EXTERNAL_LIBRARIES(0x10),
       /** Code that is being tested by the current variant, including dependencies */
       TESTED_CODE(0x20),
       /** Local or remote dependencies that are provided-only */
       PROVIDED_ONLY(0x40),

       /**
        * Only the project's local dependencies (local jars)
        *
        * @deprecated local dependencies are now processed as {@link #EXTERNAL_LIBRARIES}
        */
       
       PROJECT_LOCAL_DEPS(0x02),
       /**
        * Only the sub-projects's local dependencies (local jars).
        *
        * @deprecated local dependencies are now processed as {@link #EXTERNAL_LIBRARIES}
        */
       
       SUB_PROJECTS_LOCAL_DEPS(0x08);

       private final int value;

       Scope(int value) {
           this.value = value;
       }

       
       public int getValue() {
           return value;
       }
   }
```

可以预知，这个范围定义的越小，我们的 Transform 需要处理的输入就越少，执行也就越快。

- transform(transformInvocation: TransformInvocation?) 进行输入内容的处理。

这里需要再次强调一点：**一个工程内会有多个 Transform，你定义的 Transform 在处理的是上一个 Transform 经过处理的输出，而经过你处理的输出，会由下一个 Transform 进行处理**。所有的 transform 任务一般都在 app/build/intermediates/transform/ 这个目录下可以看到。
### transform() 深入
transform()方法的参数 TransformInvocation 是一个接口，提供了一些关于输入的一些基本信息。利用这些信息我们就可以获得编译流程中的 class 文件进行操作。
[![image.png](https://cdn.nlark.com/yuque/0/2023/png/215777/1699347761981-264250cc-89a0-4df2-ac3b-686c0ced447a.png)](https://rebooters.github.io/2020/01/04/Gradle-Transform-ASM-%E6%8E%A2%E7%B4%A2/transforms.png)
从上图可以看到，transform 处理输入的思路还是很简单的，就是从TransformInvocation 获取到总的输入后，分别按照 class目录 和 jar文件 集合的方式进行遍历处理。（这里简单讨论普遍情况，当然 TransformInvocation 接口还提供了 getReferencedInputs，getSecondaryInputs 这些接口，让使用者处理一些特殊的输入，上图并没有体现，暂时不展开讨论）
transform 的核心难点有以下几个点：

- **正确、高效的进行文件目录、jar 文件的解压、class 文件 IO 流的处理，保证在这个过程中不丢失文件和错误的写入**
- **高效的找到要插桩的结点，过滤掉无效的 class**
- **支持增量编译**
## 实践
上面说了一些流程和概念，下面就通过一个实例 (参考自 [Koala](https://github.com/lijiankun24/Koala)) 来具体看一下一个基于注解，在 transform 任务执行的过程中通过 ASM 插入统计方法耗时、参数、输出的实现。非常感谢 [Koala](https://github.com/lijiankun24/Koala)，感谢 [lijiankun24](https://github.com/lijiankun24) 的开源。
### 效果
为了方便后期叙述，这里首先看一下使用方式和最终效果。
#### 添加注解
我们在 MainActivity 中的部分方法添加注解
```
class MainActivity : AppCompatActivity() {

    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        test()
        test2("a",100)
        test3()
        test4()
        val result = Util.dp2Px(10)
    }

    
    private fun test() {
        println("just test")
    }

    
    private fun test2(para1: String, para2: Int): Int {
        return 0
    }

    
    private fun test3(): View {
        return TextView(this)
    }

    private fun test4(){
        println("nothing")
    }
}

```

MainActivity 中除了 test4()之外的所有方法，都打上了 @Cat 注解，并且所有方法都会被调用。
#### 输出日志
```
2020-01-04 11:32:13.784 E: ┌───────────────────────────────────------───────────────────────────────────------
2020-01-04 11:32:13.784 E: │ class's name:       com/engineer/android/myapplication/MainActivity
2020-01-04 11:32:13.784 E: │ method's name:      test
2020-01-04 11:32:13.785 E: │ method's arguments: []
2020-01-04 11:32:13.785 E: │ method's result:    null
2020-01-04 11:32:13.791 E: │ method cost time:   1ms
2020-01-04 11:32:13.791 E: └───────────────────────────────────------───────────────────────────────────------
2020-01-04 11:32:13.791 E: ┌───────────────────────────────────------───────────────────────────────────------
2020-01-04 11:32:13.791 E: │ class's name:       com/engineer/android/myapplication/MainActivity
2020-01-04 11:32:13.792 E: │ method's name:      test2
2020-01-04 11:32:13.792 E: │ method's arguments: [a, 100]
2020-01-04 11:32:13.792 E: │ method's result:    0
2020-01-04 11:32:13.793 E: │ method cost time:   0ms
2020-01-04 11:32:13.793 E: └───────────────────────────────────------───────────────────────────────────------
2020-01-04 11:32:13.794 E: ┌───────────────────────────────────------───────────────────────────────────------
2020-01-04 11:32:13.795 E: │ class's name:       com/engineer/android/myapplication/MainActivity
2020-01-04 11:32:13.795 E: │ method's name:      test3
2020-01-04 11:32:13.796 E: │ method's arguments: []
2020-01-04 11:32:13.796 E: │ method's result:    android.widget.TextView{8a9397d V.ED..... ......ID 0,0-0,0}
2020-01-04 11:32:13.796 E: │ method cost time:   1ms
2020-01-04 11:32:13.796 E: └───────────────────────────────────------───────────────────────────────────------
2020-01-04 11:32:13.797 E: ┌───────────────────────────────────------───────────────────────────────────------
2020-01-04 11:32:13.797 E: │ class's name:       com/engineer/android/myapplication/MainActivity
2020-01-04 11:32:13.797 E: │ method's name:      onCreate
2020-01-04 11:32:13.798 E: │ method's arguments: [null]
2020-01-04 11:32:13.798 E: │ method's result:    null
2020-01-04 11:32:13.798 E: │ method cost time:   156ms
2020-01-04 11:32:13.798 E: └───────────────────────────────────------───────────────────────────────────------
```

可以看到，日志输出了除 test4() 方法之外所有方法的方法耗时、方法参数、方法名称、方法返回值等信息，下面就来看看实现细节。
### 实现细节
##### 主动调用
首先，对于一个上述的功能，如果用我们直接手写代码的方式，应该是很简单的。
打印的日志有一些方法的信息，因此需要一个类来承载这些信息。

- MethodInfo
```
data class MethodInfo(
    var className: String = "",
    var methodName: String = "",
    var result: Any? = "",
    var time: Long = 0,
    var params: ArrayList<Any?> = ArrayList()
)
```
按照常规思路，我们需要在方法开始的时候，记录一下开始时间，方法 return 之前再次记录一下时间，然后计算出耗时。

- MethodManager
```
object MethodManager {

    private val methodWareHouse = ArrayList<MethodInfo>(1024)

    
    fun start(): Int {
        methodWareHouse.add(MethodInfo())
        return methodWareHouse.size - 1
    }

    
    fun end(result: Any?, className: String, methodName: String, startTime: Long, id: Int) {
        val method = methodWareHouse[id]
        method.className = className
        method.methodName = methodName
        method.result = result
        method.time = System.currentTimeMillis() - startTime
        BeautyLog.printMethodInfo(method)
    }

}
```
这里定义了两个方法 start 和 end ，顾名思义就是在方法开始和结束的时候调用，并通过参数传递一些关键信息，最后打印这些信息。
这样我们可以在任何一个方法中调用这些方法
```
fun foo(){
    val index =MethodManager.start()
    val start = System.currentTimeMillis()
    
    // some thing foo do
    
    MethodManager.end("",this.localClassName,"foo",start,index)
}
```
诚然这样的代码写起来很简单，但是一方面这些代码和 foo 方法本来要做的事情是没有关系的，如果为了单次测试方法耗时加上去，有点丑陋；再有就是如果有多个方法需要检测耗时，需要把这样的代码写很多次。因此，便有了通过 Transform + ASM 实现代码插桩的需求。
##### 插桩实现
在一个方法内，我们自己写上述代码很简单，代开 IDE 找到对应的类文件，定位到要计算耗时的方法，在方法体开始和结束之前插入代码。但是，对于编译器来说，这些没有规律的事情是非常麻烦的。因此，为了方便，我们通过定义注解的方式，方便编译器在代码编译阶段可以快速定位要插桩的位置。
这里定义了一个注解 Cat, 为啥取名 Cat，因为猫很萌啊。
```
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.CLASS)
public@interface Cat {
}
```
按照上图 transform(transformInvocation: TransformInvocation?) 处理输入流程的流程，我们可以对所有的 class 文件进行处理。
这里以处理 directoryInputs 为例
```
input.directoryInputs.forEach { directoryInput ->
                if (directoryInput.file.isDirectory) {
                    FileUtils.getAllFiles(directoryInput.file).forEach {
                        val file = it
                        val name = file.name
                        println("directory")
                        println("name ==$name")
                        if (name.endsWith(".class") && name != ("R.class")
                            && !name.startsWith("R\$") && name != ("BuildConfig.class")
                        ) {

                            val reader = ClassReader(file.readBytes())
                            val writer = ClassWriter(reader, ClassWriter.COMPUTE_MAXS)
                            val visitor = CatClassVisitor(writer)
                            reader.accept(visitor, ClassReader.EXPAND_FRAMES)

                            val code = writer.toByteArray()
                            val classPath = file.parentFile.absolutePath + File.separator + name
                            val fos = FileOutputStream(classPath)
                            fos.write(code)
                            fos.close()
                        }
                    }
                }

                val dest = transformInvocation.outputProvider?.getContentLocation(
                    directoryInput.name,
                    directoryInput.contentTypes,
                    directoryInput.scopes,
                    Format.DIRECTORY
                )


                FileUtils.copyDirectoryToDirectory(directoryInput.file, dest)
            }
```
这里的操作很简单，就是遍历所有的 class 文件，对所有符合条件的 Class 通过 ASM 提供的接口进行处理，通过访问者模式，提供一个自定义的 ClassVisitor 即可。这里我们的自定义 ClassVisitor 就是 CatClassVisitor,在 CatClassVisitor 内部的 visitMethod 实现中再次使用访问者的模式，返回一个自定义的 CatMethodVisitor，在其内部我们会根据方法注解，确定当前方法是否需要进行插桩。
```
override fun visitAnnotation(desc: String, visible: Boolean): AnnotationVisitor {
      // 当前方法的注解，是否是我们定义的注解。
      if (Constants.method_annotation == desc) {
          isInjected = true
      }
      return super.visitAnnotation(desc, visible)
  }

override fun onMethodEnter() {
      if (isInjected) {
          
          methodId = newLocal(Type.INT_TYPE)
          mv.visitMethodInsn(
              Opcodes.INVOKESTATIC,
              Constants.method_manager,
              "start",
              "()I",
              false
          )
          mv.visitIntInsn(Opcodes.ISTORE, methodId)

          ... more details ...
      }
  }

override fun onMethodExit(opcode: Int) {
      if (isInjected) {

          ... other details ...

          mv.visitMethodInsn(
              Opcodes.INVOKESTATIC,
              Constants.method_manager,
              "end",
              "(Ljava/lang/Object;Ljava/lang/String;Ljava/lang/String;JI)V",
              false
          )
      }
  }
```
可以看到这样我们就确定了要进行代码插桩的位置，关于 ASM 代码插桩的具体细节已在[当 Java 字节码遇到 ASM](https://zhuanlan.zhihu.com/p/102327062) 有过介绍，这里不再展开。此处具体实现可以[查看源码](https://github.com/REBOOTERS/AndroidAnimationExercise/tree/master/buildSrc/src/main/kotlin/com/engineer/plugin/transforms/cat)。
当然，我们还需要处理输入为 jarInputs 的场景。在组件化开发的时候，很多时候，我们是通过依赖 aar 包的方式，依赖其他小伙伴提供的业务组件或基础组件。或者是当我们依赖第三方库的时候，其实也是在依赖 aar。这时候，如果缺少了对 jarInputs 的处理，会导致插桩功能的缺失。但是从上面的流程图可以看到，对 jarInputs 的处理只是多了解压缩的过程，后续还是对 class 文件的遍历写操作。
##### 增量编译
说到 Transform 必须要谈的一个点就是增量编译，其实关于增量编译的实现，通过查看 AGP 自带的几个 Transform 可以看到其实很简单。
```
if (transformInvocation.isIncremental) {
                    when (jarInput.status ?: Status.NOTCHANGED) {
                        Status.NOTCHANGED -> {
                        }
                        Status.ADDED, Status.CHANGED -> transformJar(
                            function,
                            inputJar,
                            outputJar
                        )
                        Status.REMOVED -> FileUtils.delete(outputJar)
                    }
                } else {
                    transformJar(function, inputJar, outputJar)
                }
```
所有的输入都是带状态的，根据这些状态做不同的处理就好了。当然，也可以根据前面提到的 getSecondaryInputs 提供的输入进行处理支持增量编译。
#### 简化 Transform 流程
回顾上面提到的 transform 处理流程及三个关键点，参考官方提供的 CustomClassTransform 我们可以抽象出一个更加通用的 Transform 基类。
**默认支持 增量编译，处理文件 IO 的操作**
```
abstract class BaseTransform : Transform() {

    // 将对 class 文件的 asm 操作，处理完之后的再次复制，抽象为一个 BiConsumer
    abstract fun provideFunction(): BiConsumer<InputStream, OutputStream>?

    // 默认的 class 过滤器，处理 .class 结尾的所有内容 （Maybe 可以扩展）
    open fun classFilter(className: String): Boolean {
        return className.endsWith(SdkConstants.DOT_CLASS)
    }

    // Transform 使能开关
    open fun isEnabled() = true

    ... else function ...

    // 默认支持增量编译
    override fun isIncremental(): Boolean {
        return true
    }
   

    override fun transform(transformInvocation: TransformInvocation?) {
        super.transform(transformInvocation)

        val function = provideFunction()

        ......

        if (transformInvocation.isIncremental.not()) {
            outputProvider.deleteAll()
        }

        for (ti in transformInvocation.inputs) {
            for (jarInput in ti.jarInputs) {
                 ......
                if (transformInvocation.isIncremental) {
                    when (jarInput.status ?: Status.NOTCHANGED) {
                        Status.NOTCHANGED -> {
                        }
                        Status.ADDED, Status.CHANGED -> transformJar(
                            function,
                            inputJar,
                            outputJar
                        )
                        Status.REMOVED -> FileUtils.delete(outputJar)
                    }
                } else {
                    transformJar(function, inputJar, outputJar)
                }
            }
            for (di in ti.directoryInputs) {

                ......
                
                if (transformInvocation.isIncremental) {
                    for ((inputFile, value) in di.changedFiles) {

                        ......

                        transformFile(function, inputFile, out)

                        ......
                    }
                } else {
                    for (`in` in FileUtils.getAllFiles(inputDir)) {
                        if (classFilter(`in`.name)) {
                            val out =
                                toOutputFile(outputDir, inputDir, `in`)
                            transformFile(function, `in`, out)
                        }
                    }
                }
            }
        }
    }


    
    open fun transformJar(
        function: BiConsumer<InputStream, OutputStream>?,
        inputJar: File,
        outputJar: File
    ) {
        Files.createParentDirs(outputJar)
        FileInputStream(inputJar).use { fis ->
            ZipInputStream(fis).use { zis ->
                FileOutputStream(outputJar).use { fos ->
                    ZipOutputStream(fos).use { zos ->
                        var entry = zis.nextEntry
                        while (entry != null && isValidZipEntryName(entry)) {
                            if (!entry.isDirectory && classFilter(entry.name)) {
                                zos.putNextEntry(ZipEntry(entry.name))
                                apply(function, zis, zos)
                            } else { // Do not copy resources
                            }
                            entry = zis.nextEntry
                        }
                    }
                }
            }
        }
    }

    
    open fun transformFile(
        function: BiConsumer<InputStream, OutputStream>?,
        inputFile: File,
        outputFile: File
    ) {
        Files.createParentDirs(outputFile)
        FileInputStream(inputFile).use { fis ->
            FileOutputStream(outputFile).use { fos -> apply(function, fis, fos) }
        }
    }


    
    open fun apply(
        function: BiConsumer<InputStream, OutputStream>?,
        `in`: InputStream,
        out: OutputStream
    ) {
        try {
            function?.accept(`in`, out)
        } catch (e: UncheckedIOException) {
            throw e.cause!!
        }
    }
}

```
以上对 transform 处理流程中，文件 IO，增量编译的细节进行了封装处理。把对 class 的写操作和二次复制，统一为 InputStream 和 OutoutStream 对象的处理。
## 使用注解实现类中所有方法的插桩
前面我们通过定义注解 Cat 的方式，详细实现了一次方法耗时的插桩。但是这个注解的使用范围被限定在了方法上，如果我们想要对一个类里多个方法的耗时同时进行检测的时候，就比较繁琐了。因此，我们可以就这个注解简单升级一下，实现一个支持 Class 内所有方法耗时检测的插桩实现。
### 注解定义 Tiger
Tiger 顾名思义，这里的实现就是在照猫画虎。
```
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.CLASS)
public @interface Tiger {
}
```
### Transform 实现
```
class TigerTransform : BaseTransform() {

    override fun provideFunction(): BiConsumer<InputStream, OutputStream>? {
        return BiConsumer { t, u ->
            val reader = ClassReader(t)
            val writer = ClassWriter(reader, ClassWriter.COMPUTE_MAXS)
            val visitor = TigerClassVisitor(writer)
            reader.accept(visitor, ClassReader.EXPAND_FRAMES)
            val code = writer.toByteArray()
            u.write(code)
        }
    }

    override fun getName(): String {
        return "tiger"
    }
}
```
通过直接继承刚才定义的 Transform 抽象类，我们可以把精力集中在如何处理 Class 文件的写入和输入上，也就是这里的 InputStream 和 OutputStream 的处理，直接和 ASM 的 ClassReader 以及 ClassWriter 接口交互。不必再关心增量编译，TransformInvocation 的输出和输入的 IO 这些内部细节了。
我们看一下 TigerClassVisitor
```
class TigerClassVisitor(classVisitor: ClassVisitor) : ClassVisitor(Opcodes.ASM6, classVisitor) {

    private var needHook = false
    private lateinit var mClassName: String

    override fun visit(
        version: Int, access: Int, name: String,
        signature: String?, superName: String?, interfaces: Array<String>?
    ) {
        super.visit(version, access, name, signature, superName, interfaces)
        println("hand class $name")
        mClassName = name
    }

    override fun visitAnnotation(desc: String?, visible: Boolean): AnnotationVisitor {
        if (desc.equals(Constants.class_annotation)) {
            println("find $desc ,start hook ")
            needHook = true
        }
        return super.visitAnnotation(desc, visible)
    }

    override fun visitMethod(
        access: Int,
        name: String?,
        desc: String?,
        signature: String?,
        exceptions: Array<out String>?
    ): MethodVisitor {


        var methodVisitor = super.visitMethod(access, name, desc, signature, exceptions)

        if (needHook) {
            .... hook visitor ...
        }

        return methodVisitor
    }
}
```
这里的关键就是 visitAnnotation 方法，在这个回调方法里，我们可以获取到当前 Class 的注解，而当这个 Class 的注解和我们定义的 Tiger 注解相等时，我们就可以对这个类当中的所有方法进行耗时检测代码的插桩了，在 visitMethod 方法内耗时代码的插桩，上面已经实现过了。
我们可以到应用的 build 目录下查看插桩代码是否生效，比如 app/build/intermediates/transforms/tiger/{flavor}/{packageName}/xxx/
目录下找到编译产物。
```

public class Util {
    private static final float DENSITY;

    public Util() {
        int var1 = MethodManager.start();
        long var2 = System.nanoTime();
        MethodManager.end((Object)null, "com/engineer/android/myapplication/Util", "<init>", var2, var1);
    }

    public static int dp2Px(int dp) {
        int var1 = MethodManager.start();
        MethodManager.addParams(new Integer(dp), var1);
        long var2 = System.nanoTime();
        int var10000 = Math.round((float)dp * DENSITY);
        MethodManager.end(new Integer(var10000), "com/engineer/android/myapplication/Util", "dp2Px", var2, var1);
        return var10000;
    }

    public static void sleep(long seconds) {
        int var2 = MethodManager.start();
        MethodManager.addParams(new Long(seconds), var2);
        long var3 = System.nanoTime();

        try {
            Thread.sleep(seconds);
        } catch (InterruptedException var6) {
            var6.printStackTrace();
        }

        MethodManager.end((Object)null, "com/engineer/android/myapplication/Util", "sleep", var3, var2);
    }

    public static void nothing() {
        int var0 = MethodManager.start();
        long var1 = System.nanoTime();
        System.out.println("do nothing,just test");
        MethodManager.end((Object)null, "com/engineer/android/myapplication/Util", "nothing", var1, var0);
    }

    static {
        int var0 = MethodManager.start();
        long var1 = System.nanoTime();
        DENSITY = Resources.getSystem().getDisplayMetrics().density;
        MethodManager.end((Object)null, "com/engineer/android/myapplication/Util", "<clinit>", var1, var0);
    }
}
```
可以看到这个打了 Tiger 注解的Util类，其所有方法内部都已经有插桩代码了。之后这些方法被调用的时候，就可以看到方法耗时了。如果有其他类的方法也需要同样的功能，要做的事情很简但，只需要用 Tiger 注解就可以了。
## 配置任意类中方法的插桩
上面的实现都是基于我们已有的代码做文章，但是有时候我们在做性能优化的时候，会需要统计一些我们使用的开源库的方法耗时，对于 public 方法也许还好，但是对于 private 方法或者是其他一些场景，就会比较麻烦了，需要借助代理模式（动态代理或静态代理）来实现我们需要的功能，或者是其他手段，但是这样的手段没有通用性，这次换个库要用，可能又要写一遍类似的功能，或者你也可以把三方库源码拉下来直接改也是可以的。
这里其实可以借助 ASM 稍微做一些辅助，简化这些工作。这里以 Glide 为例。
```
Glide.with(this).load(url).into(imageView);
```
上面的代码相信大家都不陌生，假设（只是假设）现在需要对统计 load 方法和 into 方法的耗时，那么怎么做呢？
思考一下上面的两个实现，我们是基于注解确定了类和方法名，从而实现在特定的类或特定的方法中插入统计方法耗时的逻辑。那么现在这些方法的源码都无法访问了，注解也没法加了，怎么办呢？那就从问题的根本出发，直接由使用者告诉 transform 到底要在哪个类的哪个方法进行方法耗时的统计。
我们可以像 build.gradle 的 android 闭包一样，自己定义一个这样的结点。
```
open class TransformExtension {
    // class 为键，方法名为值得一个 map
    var tigerClassList = HashMap<String, ArrayList<String?>>()

}
```
在 build.gradle 文件中配置信息
```
transform {
    tigerClassList = ["com/bumptech/glide/RequestManager": ["load"],
                      "com/bumptech/glide/RequestBuilder": ["into"]]
}
```
然后分别在 ClassVisitor 和 MethodVisitor 中根据类名和方法名确定要进行插桩的结点。
```
init {
    ....
    classList = transform?.tigerClassList
}

override fun visit(
    version: Int, access: Int, name: String,
    signature: String?, superName: String?, interfaces: Array<String>?
) {
    super.visit(version, access, name, signature, superName, interfaces)
    mClassName = name
    if (classList?.contains(name) == true) {
        methodList = classList?.get(name) ?: ArrayList()
        needHook = true
    }
}
```
可以简单看一下结果
```
19407-19407 E/0Cat: ┌───────────────────────────────────------───────────────────────────────────------
19407-19407 E/1Cat: │ class's name:       com/bumptech/glide/RequestManager
19407-19407 E/2Cat: │ method's name:      load
19407-19407 E/3Cat: │ method's arguments: [http://t8.baidu.com/it/u=1484500186,1503043093&fm=79&app=86&f=JPEG?w=1280&h=853]
19407-19407 E/4Cat: │ method's result:    com.bumptech.glide.RequestBuilder@9a29abdf
19407-19407 E/5Cat: │ method cost time:   1.52 ms
19407-19407 E/6Cat: └───────────────────────────────────------───────────────────────────────────------
19407-19407 E/0Cat: ┌───────────────────────────────────------───────────────────────────────────------
19407-19407 E/1Cat: │ class's name:       com/bumptech/glide/RequestBuilder
19407-19407 E/2Cat: │ method's name:      into
19407-19407 E/3Cat: │ method's arguments: [Target for: androidx.appcompat.widget.AppCompatImageView{24ec8f4 V.ED..... ......I. 0,0-0,0 #7f08007c app:id/image}, null, com.bumptech.glide.RequestBuilder@31a00c76, com.bumptech.glide.util.Executors$1@1098060]
19407-19407 E/4Cat: │ method's result:    Target for: androidx.appcompat.widget.AppCompatImageView{24ec8f4 V.ED..... ......I. 0,0-0,0 #7f08007c app:id/image}
19407-19407 E/5Cat: │ method cost time:   5.78 ms
19407-19407 E/6Cat: └───────────────────────────────────------───────────────────────────────────------
19407-19407 E/0Cat: ┌───────────────────────────────────------───────────────────────────────────------
19407-19407 E/1Cat: │ class's name:       com/bumptech/glide/RequestBuilder
19407-19407 E/2Cat: │ method's name:      into
19407-19407 E/3Cat: │ method's arguments: [androidx.appcompat.widget.AppCompatImageView{24ec8f4 V.ED..... ......I. 0,0-0,0 #7f08007c app:id/image}]
19407-19407 E/4Cat: │ method's result:    Target for: androidx.appcompat.widget.AppCompatImageView{24ec8f4 V.ED..... ......I. 0,0-0,0 #7f08007c app:id/image}
19407-19407 E/5Cat: │ method cost time:   10.88 ms
19407-19407 E/6Cat: └───────────────────────────────────------───────────────────────────────────------
```
可以看到，插桩已经成功了，RequestManager 的 load 方法打印了完整的方法信息，延伸一下，是不是可以在这里统计一下，到底用 Glide 加载过哪些 url 呢？当然，如上日志也看到，RequestBuilder 当中打印了两个 into 方法，通过方法名插桩是有点粗暴，目标类当中如果有多个同名的方法（方法重载），那么这些方法都会被插桩。这个问题其实也可以通过提供方法 desc (也就是方法参数，返回值等信息) 来做更精确的匹配。但是，这里如果只是做测试，这样粗粒度的也是可以的，毕竟这样对三方库的插桩还是比较hack的，线上环境最好还是不要使用。
## Android 中点击事件的统计
_这里的点击事件泛指实现了 View.OnClickListener_ 接口的点击事件
在一个成熟的 App 中肯定会包含埋点，埋点其实就是在统计用户的行为。比如打开了哪个页面，点击了哪个按钮，使用了哪个功能？通过对这些行为的统计，通过数据就可以获知用户最常用的功能，方便产品做决策。
关于点击行为这件事，首先想想平时我们都是怎么实现的？无非就是两种情况，要么就是实现 View.OnClickListener 这个接口，然后在 onClick 方法中展开；要么就是匿名内部类，同样是在 onClick 方法展开。因此，如何确定 onClick 方法就成了我们需要关注的问题。我们不能按照之前方法名 equals 的简单规则进行定位。因为这样无法避免方法重名或者是参数重名的问题，假设某个小伙伴写了一个和 onClick(View view) 同名的普通方法，我们实际定位的 hook 结点可能就不是点击事件发生时的结点。因此，我们需要确保 ASM 访问的类实现了 android.view.View.OnClickListener 这个接口。
```
override fun visit(
    version: Int,
    access: Int,
    name: String?,
    signature: String?,
    superName: String?,
    interfaces: Array<out String>?
) {
    super.visit(version, access, name, signature, superName, interfaces)
    className = name

          interfaces?.forEach {
            if (it == "android/view/View\$OnClickListener") {
                println("bingo , find click in class : $className")
                hack = true
            }
        }
    
}
```
这个实现其实也很简单，ClassVisitor 的 visit 方法提供了当前类实现了的所有接口，因此这里简单判断一下会比较准确。当然，这里也可以同时判断其他接口，比如我们要对应用内所有 TabBar 的选中事件进行插桩，就可判断当前类是否实现了 
com.google.android.material.bottomnavigation.BottomNavigationView.OnNavigationItemSelectedListener 这个接口。
由于 Transform 会访问 javac 编译生成的所有 class，包括匿名内部类，因此这里对于普通类和匿名内部类可以统一处理。（关于匿名内部类和普通类的使用 ASM 的差异可以[参考这篇](https://rebooters.github.io/2020/01/12/ASM-%E5%8C%BF%E5%90%8D%E5%86%85%E9%83%A8%E7%B1%BB%E7%9A%84%E5%A4%84%E7%90%86/))。
当前类是否实现了接口确定之后，下一步就可以按照方法名及方法的参数和返回值进行更加精确的匹配了。
```
override fun visitMethod(
        access: Int,
        name: String?,
        desc: String?,
        signature: String?,
        exceptions: Array<out String>?
    ): MethodVisitor {
        var methodVisitor = super.visitMethod(access, name, desc, signature, exceptions)
        if (hack) {
            if (name.equals("onClick") && desc.equals("(Landroid/view/View;)V")) {
                methodVisitor =
                    TrackMethodVisitor(className, Opcodes.ASM6, methodVisitor, access, name, desc)
            }
        }

        return methodVisitor
    }
```
插桩的具体代码，本质上和之前的几个实现都是类似的，这里就不再贴代码了。这里简单看一下效果。
```
E/0Track: ┌───────────────────────────────────------───────────────────────────────────------
E/1Track: │ class's name:             com.engineer.android.myapplication.SecondActivity
E/2Track: │           view's id:      com.engineer.android.myapplication:id/button
E/3Track: │ view's package name:      com.engineer.android.myapplication
E/4Track: └───────────────────────────────────------───────────────────────────────────------
```
当一个点击事件发生时，我们可以获取实现这个点击事件的类，这个点击事件的 id 和包名。通过这些信息，我们就可以大概得知这个点击事件是在哪个页面（哪个业务）。因此，这个实现也可以帮助我们定位代码，有时候面对一份完全陌生的代码，很难定位到你所使用的功能到底在代码的哪个角落里，通过这个 Transform 实现，可以简单定位一下范围。
自己测试的时候发现，在 Java 中如果使用了 lambda 表达式来实现匿名内部类，那么是不会按照常规的匿名内部类那样处理，并不会生成额外的匿名类。因此，对于使用 lambda 表达式实现的点击事件，这样是无法处理的。（暂时也没想到其他比较好的替代方案）
看到这里，你是不是有一些想法了呢? 是不是可以考虑实现基于 Activity/Fragment 生命周期的代码插桩，来统计页面的展现时间和次数呢？是不是可以考虑将代码里的 Log.d 这样的代码统一删除掉？是不是可以将代码中没有引用和调用的代码删除掉呢？（这个可能有点难）
## 总结
首先明确一下，以上所有实现都是基于 Transform + ASM 技术栈的探索，只是简单的学习和了解一下 Transform + ASM 能够做什么以及怎么做。因此，部分实现也许有瑕疵甚至是 bug。[源码](https://github.com/REBOOTERS/AndroidAnimationExercise) 已同步到 Github 如果有想法，可以提 issue。
通过对 Gradle Transform + ASM 的简单探索，可以看到在工程构建的过程中，从源码（包括java/kotlin/资源文件/其他） 到中间的 class 再到 dex 文件直至最终的 apk 文件生成，在整个过程中有很多的 task 被执行。而在 class 到 dex 这之间，利用 ASM 还是可以做很多文章的。
这里我们只是简单的打印了 log，其实对一些关键信息，我们完全可以进行插桩式的收集，比如在 Glide 内部插入统计加载图片 URL 的代码，比如关键方法（例如 Application 的 onCreate 方法）的耗时统计，有时候我们关心的并不一定是具体的数据，而是数据所呈现出来的趋势。可以通过代码插桩将这些信息批量保存在本地甚至是上传到服务器，在后续流程中进一步的分析和拆解一些关键数据。
## 参考文档
[详解Android Gradle生成字节码流程](https://zhuanlan.zhihu.com/p/98909010)
[从 Java 字节码到 ASM 实践](https://juejin.im/post/5bfa8ed8e51d451d3b51fd31)
[App流畅度优化：利用字节码插桩实现一个快速排查高耗时方法的工具](https://juejin.im/post/5da33dc56fb9a04e35597a47)
[ByteX](https://github.com/bytedance/ByteX)
