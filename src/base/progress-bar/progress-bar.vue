<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div
        class="progress-btn-wrapper"
        ref="progressBtn"
        @touchstart.prevent="progressTouchStart"
        @touchmove.prevent="progressTouchMove"
        @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { prefixStyle } from "common/js/dom";

const progressBtnWidth = 16;
const transform = prefixStyle("transform");

export default {
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },

  created() {
    //共享数据
    this.touch = {};
  },
  methods: {
    progressTouchStart(e) {
      //初始化·
      this.touch.initiated = true;
      //初始化点击坐标(横向坐标)startX记录
      this.touch.startX = e.touches[0].pageX;
      //记录progress进度条滚动的宽都
      this.touch.left = this.$refs.progress.clientWidth;
    },
    progressTouchMove(e) {
      //如果没有经过初始化
      if (!this.touch.initiated) {
        return;
      }
      //触摸进度条的宽度
      const deltaX = e.touches[0].pageX - this.touch.startX;
      //算出progress的位置
      const offsetWidth = Math.min(
        this.$refs.progressBar.clientWidth - progressBtnWidth,
        Math.max(0, this.touch.left + deltaX)
      );
      this._offset(offsetWidth);
    },
    progressTouchEnd() {
      this.touch.initiated = false;
      this._triggerPercent();
    },
    progressClick(e) {
      const rect = this.$refs.progressBar.getBoundingClientRect();
      const offsetWidth = e.pageX - rect.left;
      this._offset(offsetWidth);
      // 这里当我们点击 progressBtn 的时候，e.offsetX 获取不对
      // this._offset(e.offsetX)
      this._triggerPercent();
    },
    _triggerPercent() {
      this.$emit("percentChange", this._getPercent());
    },
    _getPercent() {
      //进度条宽度
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
      //progress进度条滚动的宽都 除于进度条宽度
       return  this.$refs.progress.clientWidth / barWidth;
    },
    _offset(offsetWidth) {
      //进度条移动
      this.$refs.progress.style.width = `${offsetWidth}px`;
      //圆点随进度条走动
      this.$refs.progressBtn.style[
        transform
      ] = `translate3d(${offsetWidth}px,0,0)`;
    },
        setProgressOffset(percent) {
      if (percent >= 0 && !this.touch.initiated) {
          //进度条宽度
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
           //偏移的宽度 歌曲播放的比列 乘上我们的宽度就得到我们偏移的宽度
        const offsetWidth = percent * barWidth;
        this._offset(offsetWidth);
      }
    },
  },
  watch: {
    percent(newPercent) {
     this.setProgressOffset(newPercent);
    }
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.progress-bar {
  height: 30px;

  .bar-inner {
    position: relative;
    top: 13px;
    height: 4px;
    background: rgba(0, 0, 0, 0.3);

    .progress {
      position: absolute;
      height: 100%;
      background: $color-theme;
    }

    .progress-btn-wrapper {
      position: absolute;
      left: -8px;
      top: -13px;
      width: 30px;
      height: 30px;

      .progress-btn {
        position: relative;
        top: 7px;
        left: 7px;
        box-sizing: border-box;
        width: 16px;
        height: 16px;
        border: 3px solid $color-text;
        border-radius: 50%;
        background: $color-theme;
      }
    }
  }
}
</style>