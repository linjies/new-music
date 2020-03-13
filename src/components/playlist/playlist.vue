<template>
  <transition name="list-fade">
    <div class="playlist" @click="hide" v-show="showflag">
      <div class="list-wrapper" @click.stop>
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="iconMode" @click="changeMode"></i>
            <span class="text">{{modeText}}</span>
            <span class="clear" @click="showConfirm">
              <i class="icon-clear"></i>
            </span>
          </h1>
        </div>
        <scroll ref="listContent" :data="sequenceList" class="list-content">
          <transition-group name="list" tag="ul">
            <li
              ref="listItem"
              class="item"
              @click="selectItem(item,index)"
              :key="item.id"
              v-for="(item,index) in sequenceList"
            >
              <i class="current" :class="getCurrentIcon(item)"></i>
              <span class="text">{{item.name}}</span>
              <span @click.stop="toggleFavorite(item)" class="like">
                <i :class="getFavoriteIcon(item)"></i>
              </span>
              <span class="delete" @click.stop="deleteone(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <div class="list-operate">
          <div class="add" @click="addSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div @click="hide" class="list-close">
          <span>关闭</span>
        </div>
      </div>
      <confirm ref="confirm" @confirm="confirmClear" text="是否清空播放列表" confirmBtnText="清空"></confirm>
      <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>

<script>
import { mapActions } from "vuex";
import { playMode } from "common/js/config";
import Scroll from "base/scroll/scroll";
import Confirm from "base/confirm/confirm";
import { playerMixin } from "common/js/mixin";
import AddSong from "components/add-song/add-song";
export default {
  mixins: [playerMixin],
  data() {
    return {
      showflag: false
    };
  },
  computed: {
    modeText() {
      return this.mode === playMode.sequence
        ? "顺序播放"
        : this.mode === playMode.random
        ? "随机播放"
        : "单曲循环";
    }
  },
  methods: {
    showConfirm() {
      this.$refs.confirm.show();
    },
    //清空歌曲列表
    confirmClear() {
      //调用vuex里面的清空列表
      this.deleteSongList();
      //也调用我们的隐藏
      this.hide();
    },

    show() {
      this.showflag = true;
      //因为这里调用显示了，所以要重新计算高度，计时器刷新一下
      setTimeout(() => {
        this.$refs.listContent.refresh();
        //调用我们的scrollToCurrent
        // this.scrollToCurrent(this.currentSong);
        this.scrollToCurrent(this.currentSong);
      }, 50);
    },
    hide() {
      this.showflag = false;
    },
    //拿到当前播放列表的id 然后他家播放列的样式
    getCurrentIcon(item) {
      if (this.currentSong.id === item.id) {
        return "icon-play";
      }
      return "";
    },
    selectItem(item, index) {
      if (this.mode === playMode.random) {
        index = this.playlist.findIndex(song => {
          return song.id === item.id;
        });
      }
      this.setCurrentIndex(index);
      this.setPlayingState(true);
    },
    //让我们的歌曲滚动到我们当前的歌曲
    scrollToCurrent(current) {
      const index = this.sequenceList.findIndex(song => {
        return current.id === song.id;
      });
      //scrollToElement就是对应到我们的滚动到的列表元素(li)
      //也就是找到当前歌曲在我们列表的一个缩影，然后这个缩影就可以访问到我们第几个li（列表）
      this.$refs.listContent.scrollToElement(this.$refs.listItem[index], 300);
    },
    //当前歌曲列表删除歌曲
    deleteone(item) {
      this.deleteSong(item);
      if (!this.playlist.length) {
        this.hide();
      }
    },
    // 点击就调用我们add-song的组件显示
    addSong() {
      this.$refs.addSong.show();
    },

    //共用资源了所以不需要了
    // ...mapMutations({
    //   setCurrentIndex: "SET_CURRENT_INDEX",
    //   setPlayingState: "SET_PLAYING_STATE"
    // }),
    ...mapActions(["deleteSong", "deleteSongList"])
  },
  watch: {
    currentSong(newSong, oldSong) {
      //如果我们这个组件不显示或者newSong.id和oldSong.id相等
      if (!this.showflag || newSong.id === oldSong.id) {
        //我们什么都不做
        return;
      }
      this.scrollToCurrent(newSong);
    }
  },
  components: {
    Scroll,
    Confirm,
    AddSong
  }
};
</script>


<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.playlist {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 200;
  background-color: $color-background-d;

  &.list-fade-enter-active, &.list-fade-leave-active {
    transition: opacity 0.3s;

    .list-wrapper {
      transition: all 0.3s;
    }
  }

  &.list-fade-enter, &.list-fade-leave-to {
    opacity: 0;

    .list-wrapper {
      transform: translate3d(0, 100%, 0);
    }
  }

  &.list-fade-enter, .list-wrapper {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: $color-highlight-background;

    .list-header {
      position: relative;
      padding: 20px 30px 10px 20px;

      .title {
        display: flex;
        align-items: center;

        .icon {
          margin-right: 10px;
          font-size: 30px;
          color: $color-theme-d;
        }

        .text {
          flex: 1;
          font-size: $font-size-medium;
          color: $color-text-l;
        }

        .clear {
          extend-click();

          .icon-clear {
            font-size: $font-size-medium;
            color: $color-text-d;
          }
        }
      }
    }

    .list-content {
      max-height: 240px;
      overflow: hidden;

      .item {
        display: flex;
        align-items: center;
        height: 40px;
        padding: 0 30px 0 20px;
        overflow: hidden;

        &.list-enter-active, &.list-leave-active {
          transition: all 0.1s;
        }

        &.list-enter, &.list-leave-to {
          height: 0;
        }

        .current {
          flex: 0 0 20px;
          width: 20px;
          font-size: $font-size-small;
          color: $color-theme-d;
        }

        .text {
          flex: 1;
          no-wrap();
          font-size: $font-size-medium;
          color: $color-text-d;
        }

        .like {
          extend-click();
          margin-right: 15px;
          font-size: $font-size-small;
          color: $color-theme;

          .icon-favorite {
            color: $color-sub-theme;
          }
        }

        .delete {
          extend-click();
          font-size: $font-size-small;
          color: $color-theme;
        }
      }
    }

    .list-operate {
      width: 140px;
      margin: 20px auto 30px auto;

      .add {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        border: 1px solid $color-text-l;
        border-radius: 100px;
        color: $color-text-l;

        .icon-add {
          margin-right: 5px;
          font-size: $font-size-small-s;
        }

        .text {
          font-size: $font-size-small;
        }
      }
    }

    .list-close {
      text-align: center;
      line-height: 50px;
      background: $color-background;
      font-size: $font-size-medium-x;
      color: $color-text-l;
    }
  }
}
</style>