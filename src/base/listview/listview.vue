<template>
  <scroll
    @scroll="scroll"
    :listen-scroll="listenScroll"
    :probe-type="probeType"
    :data="data"
    class="listview"
    ref="listview"
  >
    <ul>
      <li v-for="(group,index) in data" :key="index" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <uL>
          <li
            @click="selectItem(item)"
            v-for="(item,index) in group.items"
            :key="index"
            class="list-group-item"
          >
            <img class="avatar" v-lazy="item.avatar" />
            <span class="name">{{item.name}}</span>
          </li>
        </uL>
      </li>
    </ul>
    <div
      class="list-shortcut"
      @touchstart="onShortcutTouchStart"
      @touchmove.stop.prevent="onShortcutTouchMove"
    >
      <ul>
        <li
          v-for="(item, index) in shortcutList"
          :data-index="index"
          :key="index"
          class="item"
          :class="{'current':currentIndex===index}"
        >{{item}}</li>
      </ul>
    </div>
    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <div class="fixed-title">{{fixedTitle}}</div>
    </div>
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>
<script type="text/ecmascript-6">
import Scroll from "base/scroll/scroll";
import Loading from "base/loading/loading";
import { getData } from "common/js/dom";
//定义一个字母栏的高度
const TITLE_HEIGHT = 30;
//定义好一个高 字体高度的值加上padding的值
const ANCHOR_HEIGHT = 18;
export default {
  props: {
    data: {
      type: Array,
      default: []
    }
  },
  computed: {
    shortcutList() {
      return this.data.map(group => {
        return group.title.substr(0, 1);
      });
    },

    fixedTitle() {
      if (this.scrollY > 0) {
        return "";
      }
      //因为一开始的啊fault的一个空数组 return肯定就是不存在  先看有没有 如果有去取 没有的话就空
      return this.data[this.currentIndex]
        ? this.data[this.currentIndex].title
        : "";
    }
  },
  data() {
    return {
      scrollY: -1,
      currentIndex: 0,
      diff: -1
    };
  },
  created() {
    this.probeType = 3;
    this.listenScroll = true;
    this.touch = {};
    this.listHeight = [];
  },
  methods: {
    selectItem(item) {
      this.$emit("select", item);
    },
    //点击这个时间滚到相应的元素
    onShortcutTouchStart(e) {
      //先拿到缩影
      let anchorIndex = getData(e.target, "index");
      //获取你手指触碰的第一个值 默认是第一个 0
      let firstTouch = e.touches[0];
      this.touch.y1 = firstTouch.pageY;
      this.touch.anchorIndex = anchorIndex;
      this._scrollTo(anchorIndex);
    },
    //滚动事件
    onShortcutTouchMove(e) {
      // 当前位和滚动位置的差 来算出一个data 可以算出我滚动到那个元素
      let firstTouch = e.touches[0];
      //记录当前（一开始点的）锚点
      this.touch.y2 = firstTouch.pageY;
      //知道的偏差就除于18向下取整  就可以知道偏移了几个锚点
      let delta = ((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT) | 0;
      //parseInt转化整形数
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta;
      this._scrollTo(anchorIndex);
    },
    refresh() {
      this.$refs.listview.refresh();
    },

    scroll(pos) {
      //实时获取滚动的Y轴的距离
      this.scrollY = pos.y;
    },
    //计算一个高度 当我们的data发生变化的时候 计算高度
    _calculateHeight() {
      //定义为一个空
      this.listHeight = [];
      // 计算listGroup 每个元素的高度
      const list = this.$refs.listGroup;
      let height = 0;
      //遍历一下我们的listGroup
      this.listHeight.push(height);
      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        //因为他是一个demo 可以直接用clientHeight获取他的高度
        height += item.clientHeight;
        //this.listHeight就可以push出去获取各个高度
        this.listHeight.push(height);
        //当scrollY 变化的时候listHeight去做对比就可以知道他落在那个区间就可以得到anchorIndex
      }
    },
    _scrollTo(index) {
      //当他为0的时候不作任何反应
      if (!index && index !== 0) {
        return;
      }
      //边界条件判断
      if (index < 0) {
        index = 0;
      } else if (index > this.listHeight.length - 2) {
        index = this.listHeight.length - 2;
      }
      // 点击字母的时候获取他的当前字母的列表位置
      this.scrollY = -this.listHeight[index];
      //点击字母跳转到想对应的歌手
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0);
    }
  },
  watch: {
    data() {
      //data发生变化我们延时去计算
      setTimeout(() => {
        this._calculateHeight();
      }, 20);
    },
    //获取 listHeight 的变化
    scrollY(newY) {
      const listHeight = this.listHeight;
      // 当滚动到顶部，newY>0
      if (newY > 0) {
        this.currentIndex = 0;
        return;
      }
      // 在中间部分滚动
      //遍历listHeight 对比上限和下限距离 怎么判断scrollY落在那个区间
      //如果大于上限小于下限就知道他落在那个区间了
      for (let i = 0; i < listHeight.length - 1; i++) {
        //当前下限
        let height1 = listHeight[i];
        //当前上限
        let height2 = listHeight[i + 1];
        //如果落在上限和下限的之间 
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i;
          //height2上限的值减去我滚的值  newY就是一个负值
          this.diff = height2 + newY;
          // console.log(this.currentIndex)
          return;
        }
      }
      // 当滚动到底部，且-newY大于最后一个元素的上限
      this.currentIndex = listHeight.length - 2;
    },
    diff(newVal) {
      //如果说newVal 》0 小于一个高度（TITLE_HEIGHT） 向上偏移 否则就是一个0
      let fixedTop =
        newVal > 0 && newVal < TITLE_HEIGHT ? newVal - TITLE_HEIGHT : 0;

      if (this.fixedTop === fixedTop) {
        return;
      }
      this.fixedTop = fixedTop;
      //改变fixed
      this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`;
    }
  },
  components: {
    Scroll,
    Loading
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.listview {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $color-background;

  .list-group {
    padding-bottom: 30px;

    .list-group-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }

    .list-group-item {
      display: flex;
      align-items: center;
      padding: 20px 0 0 30px;

      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }

      .name {
        margin-left: 20px;
        color: $color-text-l;
        font-size: $font-size-medium;
      }
    }
  }

  .list-shortcut {
    position: absolute;
    z-index: 30;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    padding: 20px 0;
    border-radius: 10px;
    text-align: center;
    background: $color-background-d;
    font-family: Helvetica;

    .item {
      padding: 3px;
      line-height: 1;
      color: $color-text-l;
      font-size: $font-size-small;

      &.current {
        color: $color-theme;
      }
    }
  }

  .list-fixed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;

    .fixed-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
  }

  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
