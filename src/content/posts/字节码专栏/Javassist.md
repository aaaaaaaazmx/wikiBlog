---
title: "Javassist"
published: 2024-05-27
description: "Javassist"
tags: ["字节码","JVM","专栏"]
category: "字节码专栏"
draft: false
slug: "bytecode-010"
---


# 目录

- [简介](#%E7%AE%80%E4%BB%8B)
- [基本功能演示](#%E5%9F%BA%E6%9C%AC%E5%8A%9F%E8%83%BD%E6%BC%94%E7%A4%BA)
   - [运行期修改类](#%E8%BF%90%E8%A1%8C%E6%9C%9F%E4%BF%AE%E6%94%B9%E7%B1%BB)
      - [原始类](#%E5%8E%9F%E5%A7%8B%E7%B1%BB)
      - [修改未加载过的类](#%E4%BF%AE%E6%94%B9%E6%9C%AA%E5%8A%A0%E8%BD%BD%E8%BF%87%E7%9A%84%E7%B1%BB)
      - [修改已加载过的类](#%E4%BF%AE%E6%94%B9%E5%B7%B2%E5%8A%A0%E8%BD%BD%E8%BF%87%E7%9A%84%E7%B1%BB)
   - [获取类基本信息](#%E8%8E%B7%E5%8F%96%E7%B1%BB%E5%9F%BA%E6%9C%AC%E4%BF%A1%E6%81%AF)
   - [创建一个新类](#%E5%88%9B%E5%BB%BA%E4%B8%80%E4%B8%AA%E6%96%B0%E7%B1%BB)
   - [重新生成类的字节码文件](#%E9%87%8D%E6%96%B0%E7%94%9F%E6%88%90%E7%B1%BB%E7%9A%84%E5%AD%97%E8%8A%82%E7%A0%81%E6%96%87%E4%BB%B6)
      - [原始类](#%E5%8E%9F%E5%A7%8B%E7%B1%BB)
      - [给类添加方法](#%E7%BB%99%E7%B1%BB%E6%B7%BB%E5%8A%A0%E6%96%B9%E6%B3%95)
      - [给类添加属性](#%E7%BB%99%E7%B1%BB%E6%B7%BB%E5%8A%A0%E5%B1%9E%E6%80%A7)
      - [修改类的方法](#%E4%BF%AE%E6%94%B9%E7%B1%BB%E7%9A%84%E6%96%B9%E6%B3%95)
      - [修改注解的值](#%E4%BF%AE%E6%94%B9%E6%B3%A8%E8%A7%A3%E7%9A%84%E5%80%BC)
   - [实现动态代理](#%E5%AE%9E%E7%8E%B0%E5%8A%A8%E6%80%81%E4%BB%A3%E7%90%86)

# 简介

[官网](http://www.javassist.org/)
[GitHub](https://github.com/jboss-javassist/javassist)
[WIKI -非常详细](https://github.com/jboss-javassist/javassist/wiki/Tutorial-1)

**Java bytecode engineering toolkit since 1999**

Javassist是一个`开源的分析、编辑和创建Java字节码的类库`。是由日本的 Shigeru Chiba 所创建的，它已加入了开放源代码 JBoss 应用服务器项目，通过使用 Javassist 对字节码操作为 JBoss 实现动态"AOP"框架。

关于java字节码的处理，目前有很多工具，如bcel，`ASM`。不过这些都需要直接跟`虚拟机指令`打交道。如果你不想了解虚拟机指令，可以采用javassist。**javassist是jboss的一个子项目，其主要的优点在于简单、快速。`直接使用java编码的形式，而不需要了解虚拟机指令，就能动态改变类的结构，或者动态生成类`**。

**官方简介**
Javassist（Java Programming Assistant）使Java`字节码`操作变得简单。它是一个用于在Java中编辑字节码的类库；它使Java程序能够在`运行时`定义新类，并在JVM加载时修改类文件。

> Javassist (Java Programming Assistant) makes Java `bytecode` manipulation simple. It is a class library for editing bytecodes in Java; it enables Java programs to define a new class at `runtime` and to modify a class file when the JVM loads it.


与其他类似的字节码编辑器不同，Javassist提供两个级别的API：`源级别和字节码级别`。如果用户使用源级API，他们可以在不了解`Java字节码规范`的情况下编辑class文件。整个API仅使用Java语言的词汇表进行设计。您甚至可以以源文本的形式指定插入的字节码; Javassist`即时`编译它。另一方面，字节码级API允许用户`直接`编辑class文件作为其他编辑器。

> Unlike other similar bytecode editors, Javassist provides two levels of API: `source level and bytecode level`. If the users use the source- level API, they can edit a class file without knowledge of `the specifications of the Java bytecode`. The whole API is designed with only the vocabulary of the Java language. You can even specify inserted bytecode in the form of source text; Javassist compiles it `on the fly`. On the other hand, the bytecode-level API allows the users to `directly` edit a class file as other editors.


# 基本功能演示

PS：这个框架在Android中可用，目前还没发现兼容性问题！

## 运行期修改类

### 原始类

```java
package com.bqt.test;  
  
public class Person {  
    public void hello(String s) {  
        System.out.println(s);  
    }  
}
```

### 修改未加载过的类

```java
ClassPool pool = ClassPool.getDefault();  
CtClass cc = pool.get("com.bqt.test.Person");  
CtMethod cm = cc.getDeclaredMethod("hello", new CtClass[] { pool.get("java.lang.String") });  
cm.setBody("{" + "System.out.println(\"你好：\" + $1);" + "}");  
  
cc.writeFile("d:/test");//保存到指定目录  
cc.toClass(); //加载修改后的类，注意：必须保证调用前此类未加载  
new Person().hello("包青天");
```

运行结果为：

```java
你好：包青天
```

> 注意，如果使用 JDK9 以下的JDK ，同时使用 3.20.0-GA 以上版本的 Javassist，调用 toClass 方法会报 StackWalker 异常


生成的类经反编译后的源码为：

```java
package com.bqt.test;  
      
import java.io.PrintStream;  
  
public class Person {  
    public void hello(String paramString) {  
        System.out.println("你好" + paramString);  
    }  
}
```

### 修改已加载过的类

**同个 Class 是不能在同个 ClassLoader 中加载两次的**，所以在输出 CtClass 的时候需要注意下。
例如上例中，如果在调用`toClass()` 前 Person 类已经加载过了，则直接报异常：

```java
new Person().hello("包青天");  
ClassPool.getDefault().get("com.bqt.test.Person").toClass();
```

```java
Exception in thread "main" javassist.CannotCompileException: by java.lang.LinkageError: loader (instance of  sun/misc/Launcher$AppClassLoader): attempted  duplicate class definition for name: "com/bqt/test/Person"  
    at javassist.ClassPool.toClass(ClassPool.java:1170)  
    at javassist.ClassPool.toClass(ClassPool.java:1113)  
    at javassist.ClassPool.toClass(ClassPool.java:1071)  
    at javassist.CtClass.toClass(CtClass.java:1264)  
    at com.bqt.test.Main.main(Main.java:9)  
Caused by: java.lang.LinkageError: loader (instance of  sun/misc/Launcher$AppClassLoader): attempted  duplicate class definition for name: "com/bqt/test/Person"  
    at java.lang.ClassLoader.defineClass1(Native Method)  
    at java.lang.ClassLoader.defineClass(Unknown Source)  
    at java.lang.ClassLoader.defineClass(Unknown Source)  
    at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)  
    at sun.reflect.NativeMethodAccessorImpl.invoke(Unknown Source)  
    at sun.reflect.DelegatingMethodAccessorImpl.invoke(Unknown Source)  
    at java.lang.reflect.Method.invoke(Unknown Source)  
    at javassist.ClassPool.toClass2(ClassPool.java:1183)  
    at javassist.ClassPool.toClass(ClassPool.java:1164)  
    ... 4 more
```

**解决方法：指定一个未加载的ClassLoader**
为了方便，Javassist 也提供一个 Classloader 供使用，例如

```java
new Person().hello("包青天");  
  
ClassPool pool = ClassPool.getDefault();  
CtClass cc = pool.get("com.bqt.test.Person");  
CtMethod cm = cc.getDeclaredMethod("hello", new CtClass[] { pool.get("java.lang.String") });  
cm.setBody("{" + "System.out.println(\"你好鸭：\" + $1);" + "}");  
cc.writeFile("d:/test");//保存到指定目录  
  
Translator translator = new Translator() {  
    @Override  
    public void start(ClassPool classPool) throws NotFoundException, CannotCompileException {  
        System.out.println("start");  
    }  
  
    @Override  
    public void onLoad(ClassPool classPool, String paramString) throws NotFoundException, CannotCompileException {  
        System.out.println("onLoad：" + paramString); //com.bqt.test.Person  
        new Person().hello("白乾涛"); //调用的是原始类的方法  
    }  
};  
Loader classLoader = new Loader(pool); //Javassist 提供的 Classloader  
classLoader.addTranslator(pool, translator); //监听 ClassLoader 的生命周期  
  
Class clazz = classLoader.loadClass("com.bqt.test.Person");  
new Person().hello("白乾涛2"); //调用的是原始类的方法  
clazz.getDeclaredMethod("hello", String.class).invoke(clazz.newInstance(), "你妹"); //调用的是新类的方法  
  
Class clazz2 = Class.forName("com.bqt.test.Person");  
clazz2.getDeclaredMethod("hello", String.class).invoke(clazz2.newInstance(), "你妹2"); //调用原始类的方法
```

打印日志：

```java
包青天  
start  
onLoad：com.bqt.test.Person  
白乾涛  
白乾涛2  
你好鸭：你妹  
你妹2
```

## 获取类基本信息

```java
ClassPool pool = ClassPool.getDefault();  
CtClass cc = pool.get("com.bqt.test.Person");  
  
byte[] bytes = cc.toBytecode();//得到字节码    
System.out.println(bytes.length);  
System.out.println(cc.getName());//获取类名    
System.out.println(cc.getSimpleName());//获取简要类名    
System.out.println(cc.getSuperclass().getName());//获取父类    
System.out.println(Arrays.toString(cc.getInterfaces()));//获取接口    
  
for (CtConstructor con : cc.getConstructors()) {//获取构造方法  
    System.out.println("构造方法 "+con.getLongName());  
}  
  
for (CtMethod method : cc.getMethods()) {//获取方法  
    System.out.println(method.getLongName());  
}
```

打印内容：

```java
562  
com.bqt.test.Person  
Person  
java.lang.Object  
[]  
构造方法 com.bqt.test.Person()  
java.lang.Object.equals(java.lang.Object)  
java.lang.Object.finalize()  
com.bqt.test.Person.hello2(java.lang.String)  
java.lang.Object.toString()  
java.lang.Object.getClass()  
java.lang.Object.notifyAll()  
java.lang.Object.hashCode()  
java.lang.Object.wait()  
java.lang.Object.notify()  
com.bqt.test.Person.hello(java.lang.String)  
java.lang.Object.wait(long)  
java.lang.Object.wait(long,int)  
java.lang.Object.clone()
```

获取注解信息

```java
Object[] annotations = cf.getAnnotations(); //获取类、方法、字段等上面定义的注解信息  
SerializedName annotation = (SerializedName) annotations[0]; //遍历判断注解类型  
System.out.println(annotation.value()); //获取注解的值
```

## 创建一个新类

```java
ClassPool pool = ClassPool.getDefault();  
CtClass cc = pool.makeClass("com.bqt.test.User");  
  
//创建属性  
cc.addField(CtField.make("private int id;", cc));  
cc.addField(CtField.make("private String name;", cc));  
  
//创建方法  
cc.addMethod(CtMethod.make("public String getName(){return name;}", cc));  
cc.addMethod(CtMethod.make("public void setName(String name){this.name = name;}", cc));  
  
//添加构造器  
CtConstructor constructor = new CtConstructor(new CtClass[] { CtClass.intType, pool.get("java.lang.String") }, cc);  
constructor.setBody("{this.id=id;this.name=name;}");  
cc.addConstructor(constructor);  
  
cc.writeFile("d:/test");
```

生成的类经反编译后的源码为：

```java
package com.bqt.test;  
  
public class User {  
    private int id;  
    private String name;  
  
    public User(int paramInt, String paramString) {  
        this.id = this.id;  
        this.name = this.name;  
    }  
  
    public String getName() {  
        return this.name;  
    }  
  
    public void setName(String paramString) {  
        this.name = paramString;  
    }  
}
```

## 重新生成类的字节码文件

### 原始类

```java
package com.bqt.test;  
  
public class Person {  
  
    public int hello(String s) {  
        return s.length();  
    }  
  
    public String hello2(String s) {  
        return s;  
    }  
}
```

### 给类添加方法

```java
ClassPool pool = ClassPool.getDefault();  
CtClass cc = pool.get("com.bqt.test.Person");  
  
//方式一  
CtMethod cm1 = CtMethod.make("public int add1(int a, String b){return a+b.length();}", cc);//第一种方式，完整的方法以字符串形式传递过去  
cc.addMethod(cm1); 
//cc.removeMethod(cm3) 删除一个方法  
  
//方式二  
CtClass[] parameters = new CtClass[] { CtClass.intType, pool.get("java.lang.String") };  
CtMethod cm2 = new CtMethod(CtClass.intType, "add2", parameters, cc);//第二种方式，返回值类型，方法名，参数，对象    
cm2.setModifiers(Modifier.PUBLIC);//访问范围    
cm2.setBody("{return $1+$2.length();}");//方法体  
cc.addMethod(cm2);  
  
cc.writeFile("D:/test");//保存到指定位置
```

生成的类经反编译后的源码为：

```java
package com.bqt.test;  
  
public class Person {  
    public int hello(String s) {  
        return s.length();  
    }  
  
    public String hello2(String s) {  
        return s;  
    }  
  
    public int add1(int paramInt, String paramString) {  
        return paramInt + paramString.length();  
    }  
  
    public int add2(int paramInt, String paramString) {  
        return paramInt + paramString.length();  
    }  
}
```

### 给类添加属性

```java
ClassPool pool = ClassPool.getDefault();  
CtClass cc = pool.get("com.bqt.test.Person");  
  
//方式一  
CtField cf = new CtField(CtClass.intType, "age", cc);  
cf.setModifiers(Modifier.PRIVATE);  
cc.addField(cf);  
cc.addMethod(CtNewMethod.getter("getAge", cf));  
cc.addMethod(CtNewMethod.setter("setAge", cf));  
  
//方式二  
CtField cf2 = CtField.make("private String name;", cc);  
cc.addField(cf2);  
cc.addMethod(CtNewMethod.getter("getName", cf2)); //快捷的添加get/set方法  
cc.addMethod(CtNewMethod.setter("setName", cf2));  
  
cc.writeFile("D:/test");//保存到指定位置
```

生成的类经反编译后的源码为：

```java
package com.bqt.test;  
  
public class Person {  
    private int age;  
    private String name;  
  
    public int hello(String s) {  
        return s.length();  
    }  
  
    public String hello2(String s) {  
        return s;  
    }  
  
    public int getAge() {  
        return this.age;  
    }  
  
    public void setAge(int paramInt) {  
        this.age = paramInt;  
    }  
  
    public String getName() {  
        return this.name;  
    }  
  
    public void setName(String paramString) {  
        this.name = paramString;  
    }  
}
```

### 修改类的方法

```java
ClassPool pool = ClassPool.getDefault();  
CtClass cc = pool.get("com.bqt.test.Person");  
  
//方式一  
CtMethod cm = cc.getDeclaredMethod("hello", new CtClass[] { pool.get("java.lang.String") });  
cm.insertBefore("System.out.println(\"调用前2\");");//调用前  
cm.insertBefore("System.out.println(\"调用前1\");");  
cm.insertAt(20094, "System.out.println(\"在指定行插入代码\");");//貌似行号胡乱写也可以  
cm.insertAfter("System.out.println(\"调用后1\");");//调用后  
cm.insertAfter("System.out.println(\"调用后2\");");//调用后  
  
//方式二  
CtMethod cm2 = cc.getDeclaredMethod("hello2", new CtClass[] { pool.get("java.lang.String") });  
cm2.setBody("{" + // 你只需要正常写代码逻辑就可以了，复制过来时，一些IDE，比如AS会自动帮你添加转义字符  
        "if ($1 == null) {\n" + //$0代表的是this，$1代表方法参数的第一个参数、$2代表方法参数的第二个参数  
        "\treturn \"\";\n" + //  
        "}\n" + //  
        "return  \"你好：\" + $1;" + //  
        "}");  
  
cc.writeFile("D:/test");//保存到指定位置
```

生成的类经反编译后的源码为：

```java
package com.bqt.test;  
  
import java.io.PrintStream;  
  
public class Person {  
    public int hello(String s) {  
        System.out.println("调用前1");  
        System.out.println("调用前2");  
        System.out.println("在指定行插入代码");  
        int i = s.length();  
        System.out.println("调用后1");  
        int j = i;  
        System.out.println("调用后2");  
        return j;  
    }  
  
    public String hello2(String paramString) {  
        if (paramString == null) {  
            return "";  
        }  
        return "你好：" + paramString;  
    }  
}
```

### 修改注解的值

```java
ClassPool pool = ClassPool.getDefault();  
CtClass cc = pool.get("com.bqt.test.Person");  
  
CtField cf = cc.getField("age");  
FieldInfo fInfo = cf.getFieldInfo();  
ConstPool cp = cc.getClassFile().getConstPool();  
  
//修改注解的值  
Annotation annotation = new Annotation(SerializedName.class.getName(), cp);//获取注解  
annotation.addMemberValue("value", new StringMemberValue("_AGE", cp));//设置注解指定字段的值  
  
AnnotationsAttribute annotationsAttribute = new AnnotationsAttribute(cp, AnnotationsAttribute.visibleTag);//获取注解信息  
annotationsAttribute.setAnnotation(annotation);//设置注解  
fInfo.addAttribute(annotationsAttribute);//添加(覆盖)注解信息  
  
cc.writeFile("D:/test");//保存到指定位置
```

修改前

```java
class Person {  
    @SerializedName("AGE")  
    public int age = 28;  
}
```

修改后

```java
class Person {  
    @SerializedName("_AGE")  
    public int age = 28;  
}
```

## 实现动态代理

```java
ClassPool pool = ClassPool.getDefault();  
CtClass cc = pool.get("com.bqt.test.Person");  
  
ProxyFactory factory = new ProxyFactory();//代理类工厂  
factory.setSuperclass(cc.toClass());//设置父类，ProxyFactory将会动态生成一个类，继承该父类  
  
//设置过滤器，判断哪些方法调用需要被拦截  
factory.setFilter(new MethodFilter() {  
    @Override  
    public boolean isHandled(Method m) {  
        return m.getName().startsWith("hello");  
    }  
});  
  
Class<?> clazz = factory.createClass();//创建代理类型  
Person proxy = (Person) clazz.newInstance();//创建代理实例  
  
//设置代理处理方法  
((ProxyObject) proxy).setHandler(new MethodHandler() {  
    @Override  
    public Object invoke(Object self, Method thisMethod, Method proceed, Object[] args) throws Throwable {  
        System.out.println(thisMethod.getName() + "被调用了");  
        try {  
            Object ret = proceed.invoke(self, args);//thisMethod为被代理方法，proceed为代理方法，self为代理实例，args为方法参数  
            System.out.println("返回值: " + ret);  
            return ret;  
        } finally {  
            System.out.println(thisMethod.getName() + "调用完毕");  
        }  
    }  
});  
  
//测试  
proxy.hello("包青天");  
System.out.println(proxy.getClass().getName()); //com.bqt.test.Person_$$_jvstee7_0
```

打印日志：

```java
hello被调用了  
返回值: 3  
hello调用完毕  
com.bqt.test.Person_$$_jvstee7_0
```


