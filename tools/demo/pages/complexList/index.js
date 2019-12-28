import Api from '../../utils/api'

Page({
  data: {
    list: []
  },
  onReachBottom() {
    this.loadMore()
  },
  onLoad() {
    this.loadMore()
  },

  loadMore() {
    const demoList = this.getList(20)
    this.setData({
      [`list[${this.data.list.length}]`]: demoList
    })
  },
  getList() {
    return Api.getNews()
  }

})
