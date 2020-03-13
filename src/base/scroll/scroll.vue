<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
import BScroll from "better-scroll";

export default {
  props: {
    probeType: {
      type: Number,
      default: 1
    },
    click: {
      type: Boolean,
      default: true
    },
    //监听我们 歌手通讯录的Y 滚动事件
    listenScroll: {
      type: Boolean,
      default: false
    },
    data: {
      type: Array,
      default: null
    },
    //搜索结果滚动到底部刷新
    pullup: {
      type: Boolean,
      default: false
    },
    beforeScroll: {
      type: Boolean,
      default: false
    },
    refreshDelay: {
      type: Number,
      default: 20
    }
  },
  mounted() {
    setTimeout(() => {
      this._initScroll();
    }, 20);
  },
  methods: {
    _initScroll() {
      if (!this.$refs.wrapper) {
        return;
      }
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click
      });
      //监听scroll
      if (this.listenScroll) {
        let me = this;
        //派发一个事件出去 调用this.$emit 派发一个scroll事件
        //pos是一个对象 有X和Y轴的属性
        this.scroll.on("scroll", pos => {
          me.$emit("scroll", pos);
        });
      }
      if (this.pullup) {
        //当他滚动结束后派发的事件（只有一次）
        this.scroll.on("scrollEnd", () => {
          //如果Y值小于this.scroll.max 就快要滚动到底部了
          if (this.scroll.y <= this.scroll.maxScrollY + 50) {
            //scrollToEnd是表示滚动到底部了 scrollEnd 是表示scroll听取了
            this.$emit("scrollToEnd");
          }
        });
      }

      if (this.beforeScroll) {
        this.scroll.on("beforeScrollStart", () => {
          this.$emit("beforeScroll");
        });
      }
    },
    enable() {
      this.scroll && this.scroll.enable();
    },
    disable() {
      this.scroll && this.scroll.disable();
    },
    refresh() {
      this.scroll && this.scroll.refresh();
    },
    //滚动到相应的位置
    scrollTo() {
      this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments);
    },
    scrollToElement() {
      this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments);
    }
  },
  watch: {
    data() {
      setTimeout(() => {
        this.refresh();
      }, this.refreshDelay);
    }
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus"></style>