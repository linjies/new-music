<template>
  <div class="player" v-show="playlist.length>0">
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image" />
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div
          class="middle"
          @touchstart.prevent="middleTouchStart"
          @touchmove.prevent="middleTouchMove"
          @touchend="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" ref="imageWrapper">
                <img ref="image" :class="cdCls" class="image" :src="currentSong.image" />
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p
                  ref="lyricLine"
                  class="text"
                  :class="{'current': currentLineNum ===index}"
                  v-for="(line,index) in currentLyric.lines"
                  :key="index"
                >{{line.txt}}</p>
              </div>
              <div class="pure-music" v-show="isPureMusic">
                <p>{{pureMusicLyric}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow==='cd'}"></span>
            <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar
                ref="progressBar"
                :percent="percent"
                @percentChange="onProgressBarChange"
                @percentChanging="onProgressBarChanging"
              ></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i class="needsclick" @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i @click="toggleFavorite(currentSong)" class="icon" :class="favoriteIcon"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <div class="imgWrapper" ref="miniWrapper">
            <img ref="miniImage" :class="cdCls" width="40" height="40" :src="currentSong.image" />
          </div>
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <audio
      ref="audio"
      @playing="ready"
      @error="error"
      @timeupdate="updateTime"
      @ended="end"
      @pause="paused"
    ></audio>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import Scroll from "base/scroll/scroll";
import animations from "create-keyframe-animation";
import { prefixStyle } from "common/js/dom";
import { playMode } from "common/js/config";
import ProgressBar from "base/progress-bar/progress-bar";
//园型滚动条组件
import ProgressCircle from "base/progress-circle/progress-circle";
import Lyric from "lyric-parser";
const transitionDuration = prefixStyle("transitionDuration");
const transform = prefixStyle("transform");
import Playlist from "components/playlist/playlist";
import { playerMixin } from "common/js/mixin";

export default {
  mixins: [playerMixin],
  data() {
    return {
      songReady: false,
      currentTime: 0,
      radius: 32,
      currentLyric: null,
      currentShow: "cd",
      currentLineNum: 0,
      playingLyric: "",
      isPureMusic: false,
      pureMusicLyric: ""
    };
  },
  computed: {
    cdCls() {
       return this.playing ? 'play' : ''
    },
    playIcon() {
      return this.playing ? "icon-pause" : "icon-play";
    },
    disableCls() {
      return this.songReady ? "" : "disable";
    },
    miniIcon() {
      return this.playing ? "icon-pause-mini" : "icon-play-mini";
    },
    //
    percent() {
      //当前播放的时间除于总时长
      return this.currentTime / this.currentSong.duration;
    },
    ...mapGetters(["currentIndex", "fullScreen", "playing"])
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    Playlist
  },
  created() {
    this.touch = {};
  },
  mounted() {
    // console.log(123456);
    console.log(this.$store.state);
  },
  methods: {
    //点击歌曲列表显示和隐藏
    showPlaylist() {
      //这样就可以调用我们playlist组件的show方法
      this.$refs.playlist.show();
    },
    //播放器收起
    back() {
      this.setFullScreen(false);
    },
    //播放器展开
    open() {
      this.setFullScreen(true);
    },
    enter(el, done) {
      const { x, y, scale } = this._getPosAndScale();
      let animation = {
        0: {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0,0,0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0,0,0) scale(1)`
        }
      };
      animations.registerAnimation({
        name: "move",
        animation,
        presets: {
          duration: 400,
          easing: "linear"
        }
      });
      animations.runAnimation(this.$refs.cdWrapper, "move", done);
    },
    afterEnter() {
      animations.unregisterAnimation("move");
      this.$refs.cdWrapper.style.animation = "";
    },
    leave(el, done) {
      this.$refs.cdWrapper.style.transition = "all 0.4s";
      const { x, y, scale } = this._getPosAndScale();
      this.$refs.cdWrapper.style[
        transform
      ] = `translate3d(${x}px,${y}px,0) scale(${scale})`;
      const timer = setTimeout(done, 400);
      this.$refs.cdWrapper.addEventListener("transitionend", () => {
        clearTimeout(timer);
        done();
      });
    },
    afterLeave() {
      this.$refs.cdWrapper.style.transition = "";
      this.$refs.cdWrapper.style[transform] = "";
    },
    togglePlaying() {
      if (!this.songReady) {
        return;
      }
      this.setPlayingState(!this.playing);
      //当歌曲暂停的时候 歌词滚动也暂停
      if (this.currentLyric) {
        this.currentLyric.togglePlay();
      }
    },
    _getPosAndScale() {
      //定义宽度
      const targetWidth = 40;
      //定义左边的值
      const paddingLeft = 40;
      //定义底部的值
      const paddingBottom = 30;
      //定义顶部的值
      const paddingTop = 80;
      //定义width = 浏览器窗口的宽度*0.8
      const width = window.innerWidth * 0.8;
      // 我们的targetWidth 除于我们定义的width （算出了我们初始的缩放比列）
      const scale = targetWidth / width;
      //拿到X的坐标
      const x = -(window.innerWidth / 2 - paddingLeft);
      //拿到Y值（正值）
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom;
      return {
        x,
        y,
        scale
      };
    },
    /**
     * 计算内层Image的transform，并同步到外层容器
     * @param wrapper
     * @param inner
     */
    syncWrapperTransform(wrapper, inner) {
      if (!this.$refs[wrapper]) {
        return;
      }
      let imageWrapper = this.$refs[wrapper];
      let image = this.$refs[inner];
      let wTransform = getComputedStyle(imageWrapper)[transform];
      let iTransform = getComputedStyle(image)[transform];
      imageWrapper.style[transform] =
        wTransform === "none" ? iTransform : iTransform.concat(" ", wTransform);
    },

    format(interval) {
      //向下取整互0
      interval = interval | 0;
      //获取分
      const minute = (interval / 60) | 0;
      //获取秒
      const second = this._pad(interval % 60);
      return `${minute}:${second}`;
    },
    onProgressBarChange(percent) {
      //缓存一下歌曲百分比的值
      const currentTime = this.currentSong.duration * percent;
      //  当前歌曲的时间 乘以percent(百分比)
      this.$refs.audio.currentTime = currentTime;
      if (!this.playing) {
        this.togglePlaying();
      }
      // 当进度条拖动的时候歌词也跟随着动
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000);
      }
    },
    //拿两位数
    _pad(num, n = 2) {
      let len = num.toString().length;
      while (len < n) {
        num = "0" + num;
        len++;
      }
      return num;
    },
    //拿到歌曲时间
    updateTime(e) {
      this.currentTime = e.target.currentTime;
    },
    onProgressBarChanging(percent) {
      this.currentTime = this.currentSong.duration * percent;
      if (this.currentLyric) {
        this.currentLyric.seek(this.currentTime * 1000);
      }
    },
    //准备好歌曲的时候
    ready() {
      // 监听 playing 这个事件可以确保慢网速或者快速切换歌曲导致的 DOM Exception
      this.songReady = true;
      this.canLyricPlay = true;
      //拿到我们当前播放的歌曲
      this.savePlayHistory(this.currentSong);
      // 如果歌曲的播放晚于歌词的出现，播放的时候需要同步歌词
      if (this.currentLyric && !this.isPureMusic) {
        this.currentLyric.seek(this.currentTime * 1000);
      }
    },
    paused() {
      this.setPlayingState(false);
      if (this.currentLyric) {
        this.currentLyric.stop();
      }
    },
    error() {
      clearTimeout(this.timer);
      this.songReady = true;
    },
    //上一首歌
    prev() {
      if (!this.songReady) {
        return;
      }
      //边界条件判断 因为我们的currentIndex = 0+1的时候index == this.playlist.length  index就等于0
      if (this.playlist.length === 1) {
        this.loop();
      } else {
        let index = this.currentIndex - 1;
        if (index == -1) {
          index = this.playlist.length - 1;
        }
        this.setCurrentIndex(index);
        if (!this.playing) {
          this.togglePlaying();
        }
      }
    },
    //下一首歌
    next() {
      if (!this.songReady) {
        return;
      }
      //边界条件判断 因为我们的currentIndex = 0+1的时候index == this.playlist.length  index就等于0
      if (this.playlist.length === 1) {
        this.loop();
      } else {
        let index = this.currentIndex + 1;
        if (index == this.playlist.length) {
          index = 0;
        }
        this.setCurrentIndex(index);
        if (!this.playing) {
          this.togglePlaying();
        }
      }
    },
    end() {
      if (this.mode === playMode.loop) {
        this.loop();
      } else {
        this.next();
      }
    },
    loop() {
      this.$refs.audio.currentTime = 0;
      this.$refs.audio.play();
      //单曲循环的时候 歌词会默认回到初始化
      if (this.currentLyric) {
        this.currentLyric.seek(0);
      }
    },
    getLyric() {
      this.currentSong
        .getLyric()
        .then(lyric => {
          //做一个判断 如果说我们的currentSong.getLyric变了的话不等于lyric
          if (this.currentSong.lyric !== lyric) {
            // (也就是我们这首的歌曲不等于我们这首歌的时候就返回一个空)
            return;
          }
          this.currentLyric = new Lyric(lyric, this.handleLyric);
          this.isPureMusic = !this.currentLyric.lines.length;
          if (this.isPureMusic) {
            this.pureMusicLyric = this.currentLyric.lrc
              .replace(timeExp, "")
              .trim();
            this.playingLyric = this.pureMusicLyric;
          } else {
            if (this.playing && this.canLyricPlay) {
              // 这个时候有可能用户已经播放了歌曲，要切到对应位置
              this.currentLyric.seek(this.currentTime * 1000);
            }
          }
          console.log(this.currentLyric);
        })
        .catch(() => {
          this.currentLyric = null;
          this.playingLyric = "";
          this.currentLineNum = 0;
        });
    },
    //歌词滚动列表
    handleLyric({ lineNum, txt }) {
      this.currentLineNum = lineNum;
      //让歌词保持在中间高亮显示 当大于五行就调用lineEl
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5];
        //滚动元素（歌词）1秒动画时间
        this.$refs.lyricList.scrollToElement(lineEl, 1000);
      } else {
        //五行之内就在顶部
        this.$refs.lyricList.scrollTo(0, 0, 1000);
      }
      //调用playingLyric = 歌词
      this.playingLyric = txt;
    },
    //触摸启动
    middleTouchStart(e) {
      this.touch.initiated = true;
      // 用来判断是否是一次移动
      this.touch.moved = false;
      const touch = e.touches[0];
      //记录X和Y坐标
      this.touch.startX = touch.pageX;
      this.touch.startY = touch.pageY;
    },
    middleTouchMove(e) {
      if (!this.touch.initiated) {
        return;
      }
      const touch = e.touches[0];
      //维护X轴Y轴的坐标
      const deltaX = touch.pageX - this.touch.startX;
      const deltaY = touch.pageY - this.touch.startY;
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return;
      }
      if (!this.touch.moved) {
        this.touch.moved = true;
      }
      //因为我们不是在左边停着就是又边停着 所以left有两种状态
      const left = this.currentShow === "cd" ? 0 : -window.innerWidth;
      const offsetWidth = Math.min(
        0,
        Math.max(-window.innerWidth, left + deltaX)
      );
      //定义百分比percent 滚动的宽度比上我们的整体宽度的比列
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth);
      this.$refs.lyricList.$el.style[
        transform
      ] = `translate3d(${offsetWidth}px,0,0)`;
      this.$refs.lyricList.$el.style[transitionDuration] = 0;
      //当我们的百分比percent越大 透明度越小 反之越小就越大
      this.$refs.middleL.style.opacity = 1 - this.touch.percent;
      // 把middleL 设为0
      this.$refs.middleL.style[transitionDuration] = 0;
    },
    middleTouchEnd() {
      if (!this.touch.moved) {
        return;
      }
      //宽度
      let offsetWidth;
      //透明度
      let opacity;
      if (this.currentShow === "cd") {
        //如果滚动的比列大于0.1就滑动过去
        if (this.touch.percent > 0.1) {
          //最终停留的位置
          offsetWidth = -window.innerWidth;
          //透明度变化
          opacity = 0;
          //同时改变我们的currentShow = "lyric"
          this.currentShow = "lyric";
        } else {
          offsetWidth = 0;
          //透明度变化
          opacity = 1;
        }
        //否则就左向右划
      } else {
        //同样左划10%的话就返回
        if (this.touch.percent < 0.9) {
          offsetWidth = 0;
          //返回 currentShow = "cd"
          this.currentShow = "cd";
          opacity = 1;
          //如果没有滑动的话还是-window.innerWidth 不变
        } else {
          offsetWidth = -window.innerWidth;
          opacity = 0;
        }
      }
      //定义300毫秒
      const time = 300;
      //设置最终位置
      this.$refs.lyricList.$el.style[
        transform
      ] = `translate3d(${offsetWidth}px,0,0)`;
      //滑动动画延迟
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`;

      this.$refs.middleL.style.opacity = opacity;
      this.$refs.middleL.style[transitionDuration] = `${time}ms`;
      this.touch.initiated = false;
    },
    ...mapMutations({
      setFullScreen: "SET_FULL_SCREEN"
    }),
    ...mapActions(["savePlayHistory"])
  },
  watch: {
    currentSong(newSong, oldSong) {
      if (!newSong.id || !newSong.url || newSong.id === oldSong.id) {
        return;
      }
      this.songReady = false;
      this.canLyricPlay = false;
      if (this.currentLyric) {
        this.currentLyric.stop();
        this.currentTime = 0;
        this.playingLyric = "";
        this.currentLineNum = 0;
      }
      this.$refs.audio.src = newSong.url;
      this.$refs.audio.play();
      // 若歌曲 5s 未播放，则认为超时，修改状态确保可以切换歌曲。
      clearTimeout(this.timer);
      //为了保证我们的这个定时运行一次
      this.timer = setTimeout(() => {
        this.songReady = true;
      }, 5000);
      this.getLyric();
    },
    playing(newPlaying) {
      if (!this.songReady) {
        return;
      }
      const audio = this.$refs.audio;
      this.$nextTick(() => {
        newPlaying ? audio.play() : audio.pause();
      });
      if (!newPlaying) {
        if (this.fullScreen) {
          this.syncWrapperTransform("imageWrapper", "image");
        } else {
          this.syncWrapperTransform("miniWrapper", "miniImage");
        }
      }
    },
    fullScreen(newVal) {
      if (newVal) {
        setTimeout(() => {
          this.$refs.lyricList.refresh();
        }, 20);
      }
    }
  }
};
</script>


<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.player {
  .normal-player {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 150;
    background: $color-background;

    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);
    }

    .top {
      position: relative;
      margin-bottom: 25px;

      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;

        .icon-back {
          display: block;
          padding: 9px;
          font-size: $font-size-large-x;
          color: $color-theme;
          transform: rotate(-90deg);
        }
      }

      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        no-wrap();
        font-size: $font-size-large;
        color: $color-text;
      }

      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text;
      }
    }

    .middle {
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;

      .middle-l {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;

        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          box-sizing: border-box;
          height: 100%;

          .cd {
            width: 100%;
            height: 100%;
            border-radius: 50%;

            .image {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border-radius: 50%;
              border: 10px solid rgba(255, 255, 255, 0.1);
            }

            .play {
              animation: rotate 20s linear infinite;
            }
          }
        }

        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;

          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
        }
      }

      .middle-r {
        display: inline-block;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;

        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;

          .text {
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;

            &.current {
              color: $color-text;
            }
          }

          .pure-music {
            padding-top: 50%;
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
          }
        }
      }
    }

    .bottom {
      position: absolute;
      bottom: 50px;
      width: 100%;

      .dot-wrapper {
        text-align: center;
        font-size: 0;

        .dot {
          display: inline-block;
          vertical-align: middle;
          margin: 0 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: $color-text-l;

          &.active {
            width: 20px;
            border-radius: 5px;
            background: $color-text-ll;
          }
        }
      }

      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 80%;
        margin: 0px auto;
        padding: 10px 0;

        .time {
          color: $color-text;
          font-size: $font-size-small;
          flex: 0 0 30px;
          line-height: 30px;
          width: 30px;

          &.time-l {
            text-align: left;
          }

          &.time-r {
            text-align: right;
          }
        }

        .progress-bar-wrapper {
          flex: 1;
        }
      }

      .operators {
        display: flex;
        align-items: center;

        .icon {
          flex: 1;
          color: $color-theme;

          &.disable {
            color: $color-theme-d;
          }

          i {
            font-size: 30px;
          }
        }

        .i-left {
          text-align: right;
        }

        .i-center {
          padding: 0 20px;
          text-align: center;

          i {
            font-size: 40px;
          }
        }

        .i-right {
          text-align: left;
        }

        .icon-favorite {
          color: $color-sub-theme;
        }
      }
    }

    &.normal-enter-active, &.normal-leave-active {
      transition: all 0.4s;

      .top, .bottom {
        transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
      }
    }

    &.normal-enter, &.normal-leave-to {
      opacity: 0;

      .top {
        transform: translate3d(0, -100px, 0);
      }

      .bottom {
        transform: translate3d(0, 100px, 0);
      }
    }
  }

  .mini-player {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 180;
    width: 100%;
    height: 60px;
    background: $color-highlight-background;

    &.mini-enter-active, &.mini-leave-active {
      transition: all 0.4s;
    }

    &.mini-enter, &.mini-leave-to {
      opacity: 0;
    }

    .icon {
      flex: 0 0 40px;
      width: 40px;
      height: 40px;
      padding: 0 10px 0 20px;

      .imgWrapper {
        height: 100%;
        width: 100%;

        img {
          border-radius: 50%;

          &.play {
            animation: rotate 10s linear infinite;
          }

          &.pause {
            animation-play-state: paused;
          }
        }
      }
    }

    .text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      line-height: 20px;
      overflow: hidden;

      .name {
        margin-bottom: 2px;
        no-wrap();
        font-size: $font-size-medium;
        color: $color-text;
      }

      .desc {
        no-wrap();
        font-size: $font-size-small;
        color: $color-text-d;
      }
    }

    .control {
      flex: 0 0 30px;
      width: 30px;
      padding: 0 10px;

      .icon-play-mini, .icon-pause-mini, .icon-playlist {
        font-size: 30px;
        color: $color-theme-d;
      }

      .icon-mini {
        font-size: 32px;
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
