---
title: "Javassist字节码操作目录"
published: 2024-07-23
description: "Javassist字节码操作相关内容目录"
tags: ["字节码", "JVM", "Javassist"]
category: "字节码专栏"
draft: false
slug: "bytecode-index"
---


# 目录

- [简介](#%E7%AE%80%E4%BB%8B)
- [语法](#%E8%AF%AD%E6%B3%95)
   - [Class 搜索路径](#Class-%E6%90%9C%E7%B4%A2%E8%B7%AF%E5%BE%84)
   - [读取和输出字节码](#%E8%AF%BB%E5%8F%96%E5%92%8C%E8%BE%93%E5%87%BA%E5%AD%97%E8%8A%82%E7%A0%81)
   - [冻结Class](#%E5%86%BB%E7%BB%93Class)
   - [ClassPool](#ClassPool)
      - [减少内存溢出](#%E5%87%8F%E5%B0%91%E5%86%85%E5%AD%98%E6%BA%A2%E5%87%BA)
      - [级联ClassPools](#%E7%BA%A7%E8%81%94ClassPools)
      - [修改已有Class的name以创建一个新的Class](#%E4%BF%AE%E6%94%B9%E5%B7%B2%E6%9C%89Class%E7%9A%84name%E4%BB%A5%E5%88%9B%E5%BB%BA%E4%B8%80%E4%B8%AA%E6%96%B0%E7%9A%84Class)
   - [Class loader](#Class-loader)
      - [使用 javassist.Loader](#%E4%BD%BF%E7%94%A8-javassistLoader)
      - [修改系统Class](#%E4%BF%AE%E6%94%B9%E7%B3%BB%E7%BB%9FClass)
      - [动态重载Class](#%E5%8A%A8%E6%80%81%E9%87%8D%E8%BD%BDClass)
   - [Introspection 和定制](#Introspection-%E5%92%8C%E5%AE%9A%E5%88%B6)
      - [插入 source 文本在方法体前或者后](#%E6%8F%92%E5%85%A5-source-%E6%96%87%E6%9C%AC%E5%9C%A8%E6%96%B9%E6%B3%95%E4%BD%93%E5%89%8D%E6%88%96%E8%80%85%E5%90%8E)
      - [类型简介](#%E7%B1%BB%E5%9E%8B%E7%AE%80%E4%BB%8B)
      - [addCatch()](#addCatch)
   - [修改方法体](#%E4%BF%AE%E6%94%B9%E6%96%B9%E6%B3%95%E4%BD%93)
      - [替换方法中存在的 source](#%E6%9B%BF%E6%8D%A2%E6%96%B9%E6%B3%95%E4%B8%AD%E5%AD%98%E5%9C%A8%E7%9A%84-source)
      - [MethodCall](#MethodCall)
      - [ConstructorCall](#ConstructorCall)
      - [FieldAccess](#FieldAccess)
      - [NewExpr](#NewExpr)
      - [NewArray](#NewArray)
      - [Instanceof](#Instanceof)
      - [Cast](#Cast)
      - [Handler](#Handler)
   - [新增一个方法或者field](#%E6%96%B0%E5%A2%9E%E4%B8%80%E4%B8%AA%E6%96%B9%E6%B3%95%E6%88%96%E8%80%85field)
      - [递归方法](#%E9%80%92%E5%BD%92%E6%96%B9%E6%B3%95)
      - [新增field](#%E6%96%B0%E5%A2%9Efield)
      - [移除方法或者field](#%E7%A7%BB%E9%99%A4%E6%96%B9%E6%B3%95%E6%88%96%E8%80%85field)
   - [注解](#%E6%B3%A8%E8%A7%A3)
   - [引用包 import](#%E5%BC%95%E7%94%A8%E5%8C%85-import)
   - [限制](#%E9%99%90%E5%88%B6)

# 简介

[官网](http://www.javassist.org/)
[GitHub](https://github.com/jboss-javassist/javassist)
[WIKI -非常详细](https://github.com/jboss-javassist/javassist/wiki/Tutorial-1)
[参考](https://www.cnblogs.com/sunfie/p/5154246.html)

**Java bytecode engineering toolkit since 1999**

Javassist（Java Programming Assistant）使Java`字节码`操作变得简单。它是一个用于在Java中编辑字节码的类库；它使Java程序能够在`运行时`定义新类，并在JVM加载时修改类文件。

与其他类似的字节码编辑器不同，Javassist提供两个级别的API：`源级别和字节码级别`。如果用户使用源级API，他们可以在不了解`Java字节码规范`的情况下编辑class文件。整个API仅使用Java语言的词汇表进行设计。您甚至可以以源文本的形式指定插入的字节码; Javassist`即时`编译它。另一方面，字节码级API允许用户`直接`编辑class文件作为其他编辑器。

# 语法

## Class 搜索路径

Class 的载入是依靠 ClassPool，而 ClassPool.getDefault() 方法的搜索 Classpath 只是搜索 JVM 的同路径下的 class。当一个程序运行在 JBoss 或者 Tomcat 下，ClassPool Object 可能找到用户的 classes。Javassist 提供了四种动态加载classpath的方法。如下

```java
ClassPool pool = ClassPool.getDefault();  
  
//默认加载方式如 pool.insertClassPath(new ClassClassPath(this.getClass()));  
pool.insertClassPath("D:/test/gson-2.8.1.jar");//从文件加载  
pool.insertClassPath(new URLClassPath("www.javassist.org", 80, "/java/", "org.javassist."));//从URL中加载  
pool.insertClassPath(new ByteArrayClassPath("name", new byte[0]));//从byte[] 中加载  
  
CtClass cc = cp.makeClass(inputStream);//可以从输入流中加载class
```

## 读取和输出字节码

```java
ClassPool pool = ClassPool.getDefault();  
CtClass cc = pool.get("test.Rectangle"); //会从classpath中查询该类  
cc.setSuperclass(pool.get("test.Point"));//设置Rectangle的父类  
cc.writeFile("c://");//输出Rectangle.class文件到该目录中  
//byte[] b=cc.toBytecode(); //输出成二进制格式  
//Class clazz=cc.toClass();//输出并加载class 类，默认加载到当前线程的ClassLoader中，也可以选择输出的ClassLoader
```

这里可以看出，Javassist 的加载是依靠 ClassPool 类，输出方式支持三种。

## 冻结Class

当 CtClass 调用 writeFile()、toClass()、toBytecode() 这些方法的时候，**Javassist 会冻结 CtClass Object，对 CtClass object 的修改将不允许。**这个主要是为了警告开发者该类已经被加载，而 JVM 是不允许重新加载该类的。如果要突破该限制，方法如下：

```java
CtClasss cc = ...;  
//...  
cc.writeFile();  
cc.defrost();  
cc.setSuperclass(...);    // OK since the class is not frozen.
```

当 `ClassPool.doPruning=true` 的时候，Javassist 在 CtClass object 被冻结时，会释放存储在 ClassPool 对应的数据。这样做可以减少 javassist 的内存消耗。默认情况`ClassPool.doPruning=false`。例如：

```java
CtClasss cc = ...;  
cc.stopPruning(true);  
cc.writeFile();  
// cc没有被释放
```

提示：当调试时，可以调用 debugWriteFile()，该方法不会导致 CtClass 被释放。

## ClassPool

### 减少内存溢出

ClassPool 是一个 CtClass objects 的装载容器，当加载了 CtClass object 后，是不会被 ClassPool 释放的（默认情况下），这个是因为 CtClass object 有可能在下个阶段会被用到，当加载过多的 CtClass object 的时候，会造成 OutOfMemory 的异常。为了避免这个异常，javassist 提供几种方法，一种是在上面提到的 `ClassPool.doPruning` 这个参数，还有一种方法是调用 `CtClass.detach()` 方法，可以把 CtClass object 从 ClassPool 中移除。例如：

```java
CtClass cc = ... ;  
cc.writeFile();  
cc.detach();
```

另外一种方法是不用默认的 ClassPool 即不用 `ClassPool.getDefault()` 这个方式来生成，这样当 ClassPool 没被引用的时候，JVM 的垃圾收集会收集该类。例如

```java
ClassPool cp = new ClassPool(true); //ClassPool(true) 会默认加载Jvm的ClassPath  
// if needed, append an extra search path by appendClassPath()
```

### 级联ClassPools

javassist 支持级联的 ClassPool，即类似于`继承`。例如：

```java
ClassPool parent = ClassPool.getDefault();  
ClassPool child = new ClassPool(parent);  
child.insertClassPath("./classes");
```

### 修改已有Class的name以创建一个新的Class

当调用 setName 方法时，会直接修改已有的 Class 的类名，如果再次使用旧的类名，则会重新在 classpath 路径下加载。例如：

```java
ClassPool pool = ClassPool.getDefault();  
CtClass cc = pool.get("Point");  
cc.setName("Pair");  
CtClass cc1 = pool.get("Point"); //重新在 classpath 加载
```

对于一个被冻结(Frozen)的 CtClass object ，是不可以修改 class name 的，如果需要修改，则可以重新加载，例如：

```java
ClassPool pool = ClassPool.getDefault();  
CtClass cc = pool.get("Point");  
cc.writeFile(); // has frozened  
//cc.setName("Pair");//wrong since writeFile() has been called.  
CtClass cc2 = pool.getAndRename("Point", "Pair");
```

## Class loader

上面也提到，javassist 同个 Class 是不能在同个 ClassLoader 中加载两次的，所以在输出 CtClass 的时候需要注意下，例如：

```java
// 当Hello未加载的时候，下面是可以运行的。  
ClassPool cp = ClassPool.getDefault();  
CtClass cc = cp.get("Hello");  
Class c = cc.toClass();  
  
//下面这种情况，由于Hello2已加载，所以会出错  
Hello2 h = new Hello2();  
CtClass cc2 = cp.get("Hello2");  
Class c2 = cc.toClass();//这里会抛出java.lang.LinkageError 异常  
  
//解决加载问题，可以指定一个未加载的ClassLoader  
Class c3 = cc.toClass(new MyClassLoader());
```

### 使用 javassist.Loader

从上面可以看到，如果在同一个 ClassLoader 加载两次 Class 抛出异常，为了方便，javassist 也提供一个 Classloader 供使用，例如

```java
ClassPool pool = ClassPool.getDefault();  
CtClass ct = pool.get("test.Rectangle");  
ct.setSuperclass(pool.get("test.Point"));  
  
Loader cl = new Loader(pool);  
Class c = cl.loadClass("test.Rectangle");  
Object rect = c.newInstance();
```

为了方便监听 Javassist 自带的 ClassLoader 的生命周期，javassist 也提供了一个 listener，可以监听 ClassLoader 的生命周期，例如：

```java
public  interface Translator {  
    void start(ClassPool paramClassPool) throws NotFoundException, CannotCompileException;  
    void onLoad(ClassPool paramClassPool, String paramString) throws NotFoundException, CannotCompileException;  
}
```

```java
Loader cl = new Loader();  
cl.addTranslator(ClassPool, Translator);
```

### 修改系统Class

由JVM规范可知，system classloader 是比其他 classloader 是优先加载的，而 system classloader 主要是加载系统 Class，所以要修改系统 Class，如果默认参数运行程序是不可能修改的，如果需要修改也有一些办法，即在运行时加入`-Xbootclasspath/p:`，参数的意义可以参考其他文件。下面修改 String 的例子如下：

```java
ClassPool pool = ClassPool.getDefault();  
CtClass cc = pool.get("java.lang.String");  
CtField f = new CtField(CtClass.intType, "hiddenValue", cc);  
f.setModifiers(Modifier.PUBLIC);  
cc.addField(f);  
cc.writeFile(".");
```

### 动态重载Class

如果JVM运行时开启JPDA（Java Platform Debugger Architecture），则Class是运行被动态重新载入的。具体方式可以参考java.lang.Instrument。javassist也提供了一个运行期重载Class的方法，具体可以看API 中的 javassist.tools.HotSwapper。

## Introspection 和定制

javassist封装了很多很方便的方法以供使用，大部分使用只需要用这些API即可，如果不能满足，Javassist 也提供了一个低层的 API（具体参考 javassist.bytecode 包）来修改原始的Class。

### 插入 source 文本在方法体前或者后

CtMethod 和 CtConstructor 提供了 insertBefore()、insertAfter() 和 addCatch() 方法，它们可以插入一个 souce 文本到存在的方法的相应的位置。

javassist 包含了一个简单的编译器解析这 souce 文本成二进制插入到相应的方法体里。javassist 还支持插入一个代码段到指定的行数，前提是该行数需要在 class 文件里含有。插入的 source 可以关联 fields 和 methods，也可以关联方法的参数。但是关联方法参数的时，需要在程序编译时加上 `-g` 选项（该选项可以把本地变量的声明保存在 class 文件中，默认是不加这个参数的）。因为默认一般不加这个参数，所以 Javassist 也提供了一些特殊的变量来代表方法参数：`\$1,\$2,\$args`...要注意的是，插入的 source 文本中不能引用`方法本地变量`的声明，但是可以允许声明一个新的`方法本地变量`，除非在程序编译时加入`-g`选项。

方法的特殊变量说明：

| 变量 | 代表的意义 |
| :---: | :---: |
| `\$0` | this |
| `\$1` `\$2`... | actual parameters, `$n`代表是方法参数的第n个 |
| `\$args` | An array of parameters 方法所有参数的数组 |
| `$$` | All actual parameters 所有方法参数的简写 |
| `$cflow(...)` | cflow variable 方法调用的深度 |
| `$r` | The result type 方法返回值的类型 |
| `$w` | The wrapper type 包装类型 |
| `$_` | The resulting value 方法的返回值 |
| `$sig` | 方法参数的类型数组，数组的顺序为参数的顺序 |
| `$type` | 方法返回值的类型 |
| `\$class` | this 的类型，也就是`\$0`的类型 |


### 类型简介

- `$n`

`\$0`代码的是this，`\$1`代表方法参数的第一个参数、`\$2`代表方法参数的第二个参数，以此类推。例如实际方法：

```java
void move(int dx, int dy)
```

在此方法前打印两个参数的值：

```java
CtMethod m = cc.getDeclaredMethod("move"); //不指定参数时会修改此类中所有方法名为 move 的方法  
m.insertBefore("{ System.out.println($1); System.out.println($2); }");//打印dx，和dy
```

- `\$args`

`\$args` 指的是方法所有参数的数组，类似Object[]，如果参数中含有基本类型，则会转成其`包装类型`。需要注意的时候，`\$args[0]`对应的是`\$1,`而不是`\$0`。

- `$$`

`$$`是所有方法参数的简写，主要用在方法调用上。
For example, `m($$)` is equivalent to `m(\$1,\$2,...)`，
例如原方法 `move(String a,String b)`
则 `move($$)` 相当于`move(\$1,\$2)`
如果新增一个方法，方法含有move的所有参数，则可以这么写：`exMove($$, context)` ，相当于 `exMove(\$1, \$2, context)`

- `$cflow`

`$cflow`意思为控制流(control flow)，是一个`只读`的变量，值为一个`方法调用的深度`。例如：

```java
//原方法  
int fact(int n) {  
    if (n <= 1) return n;  
    else return n * fact(n - 1);  
}
```

```java
//javassist调用  
CtMethod cm = ...;  
cm.useCflow("fact");//这里代表使用了cflow  
//这里用了cflow，说明当深度为0的时候，就是开始当第一次调用fact的方法的时候，打印方法的第一个参数  
cm.insertBefore("if ($cflow(fact) == 0)"  
              + "    System.out.println(\"fact \" + $1);");
```

- `$r`

`$r`指的是方法返回值的类型，主要用在类型的转型上。例如：

```java
Object result = ... ;  
$_ = ($r)result;
```

如果返回值为基本类型的包装类型，则该值会自动转成基本类型；如返回值为Integer，则该值为int；如果返回值为void，则该值为null

- `$w`代表一个包装类型，主要用在转型上。比如：`Integer i = ($w)5;` 如果该类型不是基本类型，则会忽略。
- `$sig`指的是方法参数的类型（Class）数组，数组的顺序为参数的顺序。An array of `java.lang.Class` objects representing the formal parameter types
- `\$class` 指的是this的类型（Class）。也就是`\$0`的类型。A `java.lang.Class` object representing the class currently edited.

### addCatch()

addCatch() 指的是在方法中加入 try catch 块，需要注意的是，必须在插入的代码中加入 return 值。`$e`代表异常值。比如：

```java
CtMethod m = ...;  
CtClass etype = ClassPool.getDefault().get("java.io.IOException");  
m.addCatch("{ System.out.println($e); throw $e; }", etype);
```

实际代码如下：

```java
try {  
    //the original method body  
} catch (java.io.IOException e) {  
    System.out.println(e);  
    throw e;  
}
```

## 修改方法体

CtMethod 和CtConstructor 提供了 setBody() 的方法，可以替换方法或者构造函数里的所有内容。

| 变量 | 代表的意义 |
| :---: | :---: |
| `\$0, \$1, \$2` | this and actual parameters |
| \$args | An array of parameters. The type of \$args is Object[]. |
| $$ | All actual parameters.For example, m($$) is equivalent to m(\$1,\$2,...) |
| `$cflow(...)` | cflow variable |
| $r | The result type. It is used in a cast expression. |
| $w | The wrapper type. It is used in a cast expression. |
| $sig | An array of java.lang.Class objects representing the formal parameter types |
| $type | A java.lang.Class object representing the formal result type. |
| \$class | A java.lang.Class object representing the class currently edited. |


注意 `$_`变量(方法的返回值)不支持。

### 替换方法中存在的 source

javassist 允许修改方法里的其中一个表达式，`javassist.expr.ExprEditor` 这个class 可以替换该表达式。例如：

```java
CtMethod cm = ..;  
cm.instrument(new ExprEditor() {  
    @Override  
    public void edit(MethodCall m) throws CannotCompileException {  
        if (m.getClassName().equals("Point") && m.getMethodName().equals("move")) {  
            m.replace("{ $1 = 0; $_ = $proceed($$); }");  
        }  
    }  
});
```

注意：替换代码不是表达式而是语句或块。它不能或包含try-catch语句。

方法`instrument()`可以用来搜索方法体里的内容，比如调用一个方法，field访问，对象创建等。如果你想在某个`表达式前后插入方法`，则修改的souce如下：

```java
{ before-statements;  
  $_ = $proceed($$);  
  after-statements; }
```

### MethodCall

MethodCall 代表的是一个方法的调用。用`replace()`方法可以对调用的方法进行替换。

| 变量 | 代表的意义 |
| :---: | :---: |
| \$0 | The target object of the method call. |
| `\$1, \$2` | The parameters of the method call. |
| $_ | The resulting value of the method call. |
| $r | The result type of the method call. |
| \$class | A java.lang.Class object representing the class declaring the method. |
| $sig | An array of java.lang.Class objects representing the formal parameter types |
| $type | A java.lang.Class object representing the formal result type. |
| $proceed | The name of the method originally called in the expression. |


注意：`$w`, `\$args` 和 `$$`也是允许的。`\$0`不是this，是只调用方法的Object。`$proceed`指的是一个特殊的语法，而不是一个String。

> `\$0` is not equivalent to this, which represents the caller-side this object.
> `\$0` is null if the method is static.


### ConstructorCall

ConstructorCall 指的是一个构造函数，比如：this()、super()的调用。`ConstructorCall.replace()`是用来用替换一个块当调用构造方法的时候。

| 变量 | 代表的意义 |
| :---: | :---: |
| \$0 | The target object of the constructor call. This is equivalent to this. |
| `\$1, \$2` | The parameters of the constructor call. |
| \$class | A java.lang.Class object representing the class declaring the constructor. |
| $sig | An array of java.lang.Class objects representing the formal parameter types. |
| $proceed | The name of the constructor originally called in the expression. |


`$w`, `\$args` 和 `$$` 也是允许的。

### FieldAccess

FieldAccess 代表的是 Field 的访问类。

| 变量 | 代表的意义 |
| :---: | :---: |
| \$0 | The object containing the field accessed by the expression. |
| `\$1` | The value that would be stored in the field if the expression is write access. Otherwise, \$1 is not available. |
| $_ | The resulting value of the field access if the expression is read access. Otherwise, the value stored in $_ is discarded. |
| $r | The type of the field if the expression is read access. Otherwise, $r is void. |
| \$class | A java.lang.Class object representing the class declaring the field. |
| $type | A java.lang.Class object representing the field type. |
| $proceed | The name of a virtual method executing the original field access. . |


`$w`, `\$args` 和 `$$` 也是允许的。

> `\$0` is not equivalent to this.
> this represents the object that the method including the expression is invoked on.
> `\$0` is null if the field is static.


### NewExpr

NewExpr 代表的是一个 Object 的操作(但不包括数组的创建)。

| 变量 | 代表的意义 |
| :---: | :---: |
| \$0 | null |
| `\$1, \$2` | The parameters to the constructor. |
| $_ | The resulting value of the object creation. A newly created object must be stored in this variable. |
| $r | The type of the created object. |
| $sig | An array of java.lang.Class objects representing the formal parameter types |
| $type | A java.lang.Class object representing the class of the created object. |
| $proceed | The name of a virtual method executing the original object creation. . |


`$w`, `\$args` 和 `$$` 也是允许的。

### NewArray

NewArray 代表的是数组的创建。

| 变量 | 代表的意义 |
| :---: | :---: |
| \$0 | null |
| `\$1, \$2` | The size of each dimension. |
| $_ | The resulting value of the object creation. A newly created array must be stored in this variable. |
| $r | The type of the created object. |
| $type | A java.lang.Class object representing the class of the created array . |
| $proceed | The name of a virtual method executing the original array creation. . |


`$w`, `\$args` 和 `$$` 也是允许的。

### Instanceof

Instanceof 代表的是 Instanceof 表达式。

| 变量 | 代表的意义 |
| :---: | :---: |
| \$0 | null |
| \$1 | The value on the left hand side of the original instanceof operator. |
| $_ | The resulting value of the expression. The type of $_ is boolean. |
| $r | The type on the right hand side of the instanceof operator. |
| $type | A java.lang.Class object representing the type on the right hand side of the instanceof operator. |
| $proceed | The name of a virtual method executing the original instanceof expression. |


$proceed

- It takes one parameter (the type is java.lang.Object) and returns true
- if the parameter value is an instance of the type on the right hand side of
- the original instanceof operator. Otherwise, it returns false.

`$w`, `\$args` 和 `$$` 也是允许的。

### Cast

Cast 代表的是一个转型表达式。

| 变量 | 代表的意义 |
| :---: | :---: |
| \$0 | null |
| \$1 | The value the type of which is explicitly cast. |
| $_ | The resulting value of the expression. |
| $r | the type after the explicit casting, or the type surrounded by ( ). |
| $type | A java.lang.Class object representing the same type as $r. |
| $proceed | The name of a virtual method executing the original type casting. |


- `$_`：The type of $_ is the same as the type after the explicit casting, that is, the type surrounded by ( ).
- `$proceed`：It takes one parameter of the type java.lang.Object and returns it after the explicit type casting specified by the original expression.

`$w`, `\$args` 和 `$$` 也是允许的。

### Handler

Handler 代表的是一个 try catch 声明。

| 变量 | 代表的意义 |
| :---: | :---: |
| \$1 | The exception object caught by the catch clause. |
| $r | the type of the exception caught by the catch clause. It is used in a cast expression. |
| $w | The wrapper type. It is used in a cast expression. |
| $type | A java.lang.Class object representing |
| the type of the exception caught by the catch clause. |  |


## 新增一个方法或者field

Javassist 允许开发者创建一个新的方法或者构造方法，例如：

```java
CtClass point = ClassPool.getDefault().get("Point");  
CtMethod m = CtNewMethod.make("public int xmove(int dx) { x += dx; }", point);  
point.addMethod(m);//新增方法
```

在方法中调用其他方法，例如：

```java
CtClass point = ClassPool.getDefault().get("Point");  
CtMethod m = CtNewMethod.make("public int ymove(int dy) { $proceed(0, dy); }", point, "this", "move");
```

其效果如下：

```java
public int ymove(int dy) {  
    this.move(0, dy);  
}
```

下面是 javassist 提供另一种新增一个方法，您可以先创建一个抽象方法，然后再给它一个方法体：

```java
CtClass cc = ... ;  
CtMethod m = new CtMethod(CtClass.intType, "move", new CtClass[] { CtClass.intType }, cc);  
cc.addMethod(m);  
m.setBody("{ x += $1; }");  
cc.setModifiers(cc.getModifiers() & ~Modifier.ABSTRACT);
```

如果将抽象方法添加到类中，Javassist 会使类抽象化，则必须在调用 setBody 之后将类显式更改回非抽象类。

> Since Javassist makes a class abstract if an abstract method is added to the class, you have to explicitly change the class back to a non-abstract one after calling setBody().


### 递归方法

```java
CtClass cc = ... ;  
CtMethod m = CtNewMethod.make("public abstract int m(int i);", cc);  
CtMethod n = CtNewMethod.make("public abstract int n(int i);", cc);  
cc.addMethod(m);  
cc.addMethod(n);  
m.setBody("{ return ($1 <= 0) ? 1 : (n($1 - 1) * $1); }");  
n.setBody("{ return m($1); }");  
cc.setModifiers(cc.getModifiers() & ~Modifier.ABSTRACT);
```

### 新增field

```java
CtClass point = ClassPool.getDefault().get("Point");  
CtField f = new CtField(CtClass.intType, "z", point);  
point.addField(f); //新增Field  
//point.addField(f, "0");// initial value is 0.
```

或者：

```java
CtClass point = ClassPool.getDefault().get("Point");  
CtField f = CtField.make("public int z = 0;", point);  
point.addField(f);
```

### 移除方法或者field

调用`removeField()`或者`removeMethod()`。

## 注解

```java
public @interface Author {  
    String name();  
    int year();  
}
```

获取注解信息：

```java
CtClass cc = ClassPool.getDefault().get("Point");  
Object[] all = cc.getAnnotations(); //获取注解信息：  
Author a = (Author)all[0];  
System.out.println("name: " + a.name() + ", year: " + a.year());
```

## 引用包 import

```java
ClassPool pool = ClassPool.getDefault();  
pool.importPackage("java.awt"); //引用包  
CtClass cc = pool.makeClass("Test");  
CtField f = CtField.make("public Point p;", cc);  
cc.addField(f);
```

## 限制

- 不支持 java5.0 的新增语法。不支持注解修改，但可以通过底层的 javassist 类来解决，具体参考：javassist.bytecode.annotation
- `不支持数组的初始化`，如`String[]{"1","2"}`，除非只有数组的容量为1
- 不支持`内部类和匿名类`
- 不支持 `continue` 和 `btreak` 表达式。
- 对于继承关系，有些不支持。例如

```java
class A {}   
class B extends A {}   
class C extends B {}   
  
class X {   
    void foo(A a) { .. }   
    void foo(B b) { .. }   
}
```

如果调用 x.foo(new C())，可能会调用 foo(A) 。

- 推荐开发者用`#`分隔一个 class name 和 static method 或者 static field。例如：

`javassist.CtClass.intType.getName()`

推荐用

`javassist.CtClass#intType.getName()`
