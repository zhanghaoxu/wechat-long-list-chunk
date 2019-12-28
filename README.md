# wechat-long-list-chunk
支持列表项内容高度不确定、简单易用的微信小程序长列表组件。

# 快速上手

## 微信版本库要求
微信版本库 >= 2.2.3

## 使用之前

在开始使用之前，你需要先阅读以下相关官方文档：
[微信小程序自定义组件](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/) 的相关文档。


## 如何安装

### 方式一. 通过 npm 安装

通过 `npm` 安装，需要依赖小程序基础库 `2.2.3` 以上版本，同时依赖开发者工具的 `npm` 构建，[详见 npm 支持](https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html)。

```bash
# Using npm
npm i wechat-long-list-chunk -S --production

# Using yarn
yarn add wechat-long-list-chunk --production
```

### 方式二. 通过下载代码

通过 [GitHub](https://github.com/zhanghaoxu/wechat-long-list-chunk) 下载代码，然后将 `miniprogram_dist` 目录，拷贝到自己的项目中的组件目录，并重命名文件夹为组件名，例如`wechat-long-list-chunk`。

```bash
git clone https://github.com/zhanghaoxu/wechat-long-list-chunk.git
cd wechat-long-list-chunk
```

## 如何使用

### 业务数据列表list增量更新

一般业务场景下，列表数据都是有分页的，这种场景下，我们很容易构造二维数组，增量更新`list`，这样可以有效提高`setData`的性能。同时，这样可以减少chunk监听数量，提高效率。示例代码：

```js
setData({
  [`list[${this.data.list.length}]`] = nextPageList
})
```

### 在 page.json 中引入组件
1. 通过npm方式安装（不要忘记在微信开发者工具进行构建）
```json
"usingComponents": {
    "wechat-long-list-chunk": "wechat-long-list-chunk"
}
```

2. 通过直接复制模块到项目中的方式安装
```json
"usingComponents": {
    "wechat-long-list-chunk": "path/to/wechat-long-list-chunk"
}
```

### 在 page.wxml 中使用组件

```html
<!--
  @@param chunkId （type String）chunk唯一标识
  @@param list (type Array) 实际业务列表数组
  <card-list> 实际业务列表组件
-->

  <wechat-long-list-chunk
    wx:for="{{list}}" 
    wx:key="index"
    chunkId="{{index}}">
      <card-list list="{{item}}"></card-list>
  </wechat-long-list-chunk>

```

虽然这个需求使用的不多，但支持同一页面多个长列表使用。

## 原理分析

1. （列表项高度不固定）长列表性能问题

长列表性能问题是前端业务领域经常遇到的问题。在web端和native端有成熟的“虚拟长列表”解决方案来解决长列表渲染的性能问题。

“虚拟长列表”是什么，如何实现，作者就不在这里赘述了，网上的教程一搜一大把；但其思想是真正能够解决实际问题的：通过动态改变可视区域上下部分区域的内容渲染，达到类似长列表浏览的体验，在列表不断变长的过程中，“虚拟长列表”相较于传统长列表具有明显的性能优势。

实际业务中的长列表可以分为两类：列表项目高度不固定、列表项目高度固定。

作者在参与的一些小程序项目中，遇到的很大一部分需求是列表项目不固定的，然鹅，微信社区所提供的一些解决方案如[recycle-view](https://developers.weixin.qq.com/miniprogram/dev/extended/functional/recycle-view.html)并不能解决作者所遇到的问题。

实现列表项目高度不固定的虚拟长列表方案需要实现以下几个问题：


(1) 如何监听每一项的内容是否超高指定区域

与列表项目高度固定所不同，我们不能通过计算得到每一项所在的位置。因此，通过监听scroll事件是行不通的。

微信小程序从版本库1.9.3开始支持的[InteractionObserver API](https://developers.weixin.qq.com/miniprogram/dev/api/wxml/wx.createIntersectionObserver.html)可以解决我们的监听的问题。通过这个API，我们可以指定一个（可见区域上下的）固定监听区域，以此区域为参考点，监听每个item是否进入/离开此区域，以此控制item的渲染结果。

(2) 监听到item 进入/离开需要做哪些操作，以此达到类似“虚拟长列表”的效果？

首先，小程序是不能操作dom的，因此，不能通过动态修改padding/margin的方式来进行高度填充，作者想到的实现方案是将每一项item的高度进行记录，然后外层套一个空壳，当item离开监听区域时，卸载item的内容（释放相关内存），只保留一个空壳。

(3) 顺着上面的思路，如果每一项item都添加监听，成本是不是太高了？

是的。这里我们可以引入chunk（块）的概念，多个item形成一个chunk，对每个chunk进行监听，这样可以大幅减少监听成本。

(4) 分块如何去做？

一般的业务中，数据列表都是分页的，后一页的数据列表拼接到前面的数据，慢慢的，数据项变得越来越多。

我们知道小程序`setData`在长列表中的一个优化手段是将一维数组转化为二维数组，这样可以对数据进行增量更新，大幅提高`setData`的效率：

```js
setData({
  [`list[${this.data.list.length}]`] = nextPageList
})
```
而这里，也是我们进行chunk的地方，以上的以分页的数据进行chunk后，监听的单位变成chunk，而不再是item。


2. 组件易用性问题

组件的易用性是很多开发者关心的问题。

我们想尽量以无侵入和低成本的方式引入解决方案，而对现有的业务影响没有影响。类似于高阶组件的思想，以外层组件进行能力扩展，通过插槽实现业务内容分发是一个通用的解决方式。

很可惜，小程序不支持类似于vue中的作用域插槽`scopeSlot`，这意味着，我们无法将数据从外层组件传递数据到内层组件，数据的传递从能力扩展组件到实际业务组件断开了！这就导致无法对数据做一些额外的处理。（这里也希望微信官方加紧支持作用域插槽）

因此，我们不得不引入一种封装性不是特别好的方案：需要开发者自己书写循环语句：`wx:for`。

## 预览

用 [微信web开发者工具](https://mp.weixin.qq.com/debug/wxadoc/dev/devtools/download.html) 打开 `tools/demo` 目录（请注意，不是整个项目）。

## 贡献

有任何意见或建议都欢迎提 issue

## License

MIT

