---
title: "Java的匿名内部类有哪些限制？"
published: 2023-08-22
description: "Java的匿名内部类有哪些限制？"
tags: ["Java","基础"]
category: "java基础"
draft: false
slug: "java-basic-023"
---

# Java的匿名内部类有哪些限制？

## 考察匿名内部类的概念和用法（初级）

- 匿名内部类的名字：没有人类认知意义上的名字
- 只能继承一个父类或实现一个接口
- 包名.OuterClass\$1，表示定位的第一个匿名内部类。外部类加$N，N是匿名内部类的顺序。

## 考察语言规范以及语言的横向对比等（中级）

匿名内部类的继承结构：Java中的匿名内部类不可以继承，只有内部类才可以有实现继承、实现接口的特性。而Kotlin是的匿名内部类是支持继承的，如
    
    val runnableFoo = object: Foo(),Runnable { 
            override fun run() { 
            
            } 
    }
    
    
## 作为考察内存泄漏的切入点（高级）

匿名内部类的构造方法（深入源码字节码探索语言本质的能力）：

- 匿名内部类会默认持有外部类的引用，可能会导致内存泄漏。
- 由编译器生成的。

其参数列表包括

- 外部对象（定义在非静态域内）
- 父类的外部对象（父类非静态）
- 父类的构造方法参数（父类有构造方法且参数列表不为空）
- 外部捕获的变量（方法体内有引用外部final变量）

Lambda转换(SAM类型，仅支持单一接口类型）：

如果CallBack是一个interface，不是抽象类，则可以转换为Lambda表达式。
    
    CallBack callBack = () -> { 
            ... 
    };
    
    
## 总结

- 没有人类认知意义上的名字。
- 只能继承一个父类或实现一个接口。
- 父类是非静态的类型，则需父类外部实例来初始化。
- 如果定义在非静态作用域内，会引用外部类实例。
- 只能捕获外部作用域内的final变量。
- 创建时只有单一方法的接口可以用Lambda转换。


## 为什么Java里的匿名内部类只能访问final修饰的外部变量？

匿名内部类用法：

    public class TryUsingAnonymousClass {
        public void useMyInterface() {
            final Integer number = 123;
            System.out.println(number);
    
            MyInterface myInterface = new MyInterface() {
                @Override
                public void doSomething() {
                    System.out.println(number);
                }
            };
            myInterface.doSomething();
    
            System.out.println(number);
        }
    }
    
编译后的结果

    class TryUsingAnonymousClass\$1
            implements MyInterface {
        private final TryUsingAnonymousClass this\$0;
        private final Integer paramInteger;
    
        TryUsingAnonymousClass\$1(TryUsingAnonymousClass this\$0, Integer paramInteger) {
            this.this\$0 = this\$0;
            this.paramInteger = paramInteger;
        }
    
        public void doSomething() {
            System.out.println(this.paramInteger);
        }
    }
    
因为匿名内部类最终会编译成一个单独的类，而被该类使用的变量会以构造函数参数的形式传递给该类，例如：Integer paramInteger，如果变量不定义成final的，paramInteger在匿名内部类被可以被修改，进而造成和外部的paramInteger不一致的问题，为了避免这种不一致的情况，因次Java规定匿名内部类只能访问final修饰的外部变量。