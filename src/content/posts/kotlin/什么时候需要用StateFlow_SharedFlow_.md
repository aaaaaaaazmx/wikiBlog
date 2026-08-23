---
title: "什么时候需要用StateFlow_SharedFlow_"
published: 2020-02-06
description: "什么时候需要用StateFlow_SharedFlow_"
tags: ["Kotlin","Android"]
category: "kotlin"
draft: false
slug: "kotlin-016"
---

#### 什么时候需要用StateFlow/SharedFlow?
##### 使用StateFlow的情况
还是使用实际的例子来说明，我们有一个用例，就是通过网络从后台用户信息接口获取用户列表并将其显示再UI中
现在我们的_ViewModel_中有一个_StateFlow_
```
StateFlow = SharedFlow
            .withInitialValue(initialValue)
            .replay(count=1)
            .distinctUntilChanged()
```
实际开发中，我们是可以使用_SharedFlow_获取_StateFlow_行为
```
val sharedFlow = MutableSharedFlow<Int>(
    replay = 1,
    onBufferOverflow = BufferOverflow.DROP_OLDEST
)
sharedFlow.emit(0) // initial value
val stateFlow = sharedFlow.distinctUntilChanged()
```
事实上，这是让我们可以自定义属于我们的_StateFlow_，比如说需要存储最后的两个值，我们就可以根据我们的用例执行_replay = 2_
```
val usersStateFlow = MutableStateFlow<UiState<List<User>>>(UiState.Loading)
```
在_Activity_中创建收集器
```
usersStateFlow.collect {

}
```
现在，只要我们进入到_Activity_中，就会开始订阅收集，将收集以下内容：
usersStateFlow：作为_StateFlow_加载状态采用初始值并立即发出
当我们的_viewModel_从网络中获取数据时，它将数据设置到 usersStateFlow。
```
usersStateFlow.value = UiState.Success(usersFromNetwork)
```
我们的_Activity_中的收集器将获取用户的数据并将其显示在 UI 中
试想一下，如果方向改变了呢，_ViewModel_将被保留，但我们在 Activity 中的收集器将重新订阅收集，由于_StateFlow_保留最后一个值，我们可以直接获取之前从网络设置的用户列表，这个时候优势在于我不需要在**重新请求网络接口了**
这个时候，我们尝试使用_SharedFlow_代替_StateFlow_看看
```
val usersSharedFlow = MutableSharedFlow<UiState<List<User>>>()
usersSharedFlow.collect {

}
```
现在，只要我们打开Activity，Activity就会订阅收集。由于使用了_SharedFlow_，因此不会在此处收集任何内容。
当我们的 _ViewModel_从网络中获取数据时。它将数据设置为_usersSharedFlow_。
```
usersSharedFlow.emit(UiState.Success(usersFromNetwork))
```
此时由于方向改变，_ViewModel_将被保留，我们在_Activity_中的收集器将重新订阅收集。由于使用不存储任何数据的_SharedFlow_，因此不会在此处收集任何内容。我们将不得不进行新的网络请求。
所以在这种情况下我们应该使用_StateFlow_而不是_SharedFlow_，为了避免不必要的频繁网络请求调用
##### 使用SharedFlow的情况
假设我们现在执行一项任务，如果该任务失败就必须显示_SnackBar_提示
在我们的_ViewModel_中创建一个_SharedFlow_
```
val showSnackbarSharedFlow = MutableSharedFlow<Boolean>()
```
同样的，我们的Activity中有一个收集器
```
showSnackbarSharedFlow.collect {

}
```
现在，只要我们打开Activity，Activity就会订阅收集。由于使用了 SharedFlow，因此不会在此处收集任何内容
然后，当我们的_viewModel_启动任务并失败的时候，它会将_showSnackbarSharedFlow_s设置为true，表示我们需要显示_Snackbar_
```
showSnackbarSharedFlow.emit(true)
```
如果方向改变，_ViewModel_将被保留，我们在 Activity 中的收集器将重新订阅收集。此处不会收集任何内容，因为_SharedFlow_不保留最后一个值。那很好。我们不应该在方向改变时再次显示_Snackbar_。
此时我们尝试使用_StateFlow_代替_SharedFlow_，但是如果方向改变了，_ViewModel_将被保留，我们在 Activity 中的收集器将重新订阅收集，因为_StateFlow_保留最后一个值。它将再次显示 Snackbar，那这样就不好，我们不应该在方向改变时再次显示_Snackbar_
所以，在这种情况下，我们应该使用_SharedFlow_而不是_StateFlow_。
具体什么时候使用StateFlow，什么时候ShardFlow,还请大家结合自身项目和需求的特点，选择合适的即可