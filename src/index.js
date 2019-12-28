/* eslint-disable no-console */
Component({
  data: {
    height: 0, // 卡片高度
    showChunk: true, // 控制是否显示当前的chunk内容
  },
  properties: {
    _chunkPrefix: {
      type: String,
      value: Math.random().toString(36).slice(-8)
    },
    chunkId: {
      type: String,
      value: ''
    },
    chunkObserveHeight: {
      type: Number,
      value: 2000
    },
    showLogInfo: {
      type: Boolean,
      value: false
    }
  },
  lifetimes: {
    detached() {
      try {
        if (this._chunkIntersectionObserver) this._chunkIntersectionObserver.disconnect()
      } catch (error) {
        console.log(error)
      }
      this._chunkIntersectionObserver = null
    },
    ready() {
      if (!this.checkCanIUserObserver()) {
        return
      }
      if (!this.checkCanIUserNextTick()) {
        setTimeout(() => {
          this.startObserverChunk()
        }, 20)
      } else {
        wx.nextTick(() => {
          this.startObserverChunk()
        })
      }
    }

  },
  methods: {
    startObserverChunk() {
      const chunkId = this.data._chunkPrefix + this.data.chunkId
      try {
        this._chunkIntersectionObserver = this.createIntersectionObserver()
        this._chunkIntersectionObserver.relativeToViewport({
          top: this.data.chunkObserveHeight,
          bottom: this.data.chunkObserveHeight
        })
          .observe(`#${chunkId}`, (res) => {
            const {intersectionRatio} = res
            // 超出预定范围
            if (intersectionRatio === 0) {
              if (this.data.showLogInfo) console.log('【卸载】', chunkId, '超过预定范围，从页面卸载')
              this.setData({
                showChunk: false
              })
              // 进入预定范围
            } else {
              if (this.data.showLogInfo) console.log('【进入】', chunkId, '达到预定范围，渲染进页面')
              this.setData({
                showChunk: true,
                height: res.boundingClientRect.height
              })
            }
          })
      } catch (error) {
        console.log(error)
      }
    },
    checkCanIUserObserver() {
      const result = wx.canIUse('createIntersectionObserver')
      if (this.data.showLogInfo) {
        if (result) {
          console.log('支持 InteractionObserver API，组件开启监听，开启虚拟长列表模式')
        } else {
          console.warn('不支持 InteractionObserver API，组件不会进行监听，回归普通长列表')
        }
      }
      return result
    },
    checkCanIUserNextTick() {
      const result = wx.canIUse('nextTick')
      if (this.data.showLogInfo) {
        if (result) {
          console.log('支持 nextTick API')
        } else {
          console.warn('不支持 nextTick API，使用setTimeout模拟')
        }
      }
      return result
    }
  }


})
