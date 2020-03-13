<template>
  <scroll
    ref="suggest"
    class="suggest"
    :data="result"
    :pullup="pullup"
    :beforeScroll="beforeScroll"
    @scrollToEnd="searchMore"
    @beforeScroll="listScroll"
  >
    <ul class="suggest-list">
      <li
        @click="selectItem(item)"
        class="suggest-item"
        v-for="(item,index) in result"
        :key="index"
      >
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title></loading>
    </ul>
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script>
import Scroll from "base/scroll/scroll";
import Loading from "base/loading/loading";
import NoResult from "base/no-result/no-result";
import { search } from "api/search";
import { ERR_OK } from "api/config";
import { createSong, isValidMusic, processSongsUrl } from "common/js/song";
import { mapMutations, mapActions } from "vuex";
import Singer from "common/js/singer";

//定义一个常量（让语句化更强一点）这样我们在别的地方也有可以用
const TYPE_SINGER = "singer";
const perpage = 15;
export default {
  props: {
    query: {
      type: String,
      default: ""
    },
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  components: {
    Scroll,
    Loading,
    NoResult
  },
  data() {
    return {
      page: 1,
      result: [],
      pullup: true,
      beforeScroll: true,
      hasMore: true
    };
  },
  methods: {
    refresh() {
      this.$refs.suggest.refresh();
    },
    //搜索内容是歌手的时候点击进入歌手列表的路由 vuex传入mapMutations  setSinger: "SET_SINGER"
    selectItem(item) {
      if (item.type === TYPE_SINGER) {
        const singer = new Singer({
          id: item.singermid,
          name: item.singername
        });
        this.$router.push({
          path: `/search/${singer.id}`
        });
        this.setSinger(singer);
      } else {
        this.insertSong(item);
      }
      this.$emit("select", item);
    },
    //搜索更多
    searchMore() {
      if (!this.hasMore) {
        return;
      }
      this.page++;
      search(this.query, this.page, this.showSinger, perpage).then(res => {
        if (res.code === ERR_OK) {
          this._genResult(res.data).then(result => {
            this.result = this.result.concat(result);
          });
          this._checkMore(res.data);
        }
      });
    },

    getIconCls(item) {
      if (item.type === TYPE_SINGER) {
        return "icon-mine";
      } else {
        return "icon-music";
      }
    },
    getDisplayName(item) {
      if (item.type === TYPE_SINGER) {
        return item.singername;
      } else {
        return `${item.name}-${item.singer}`;
      }
    },
    search() {
      this.hasMore = true;
      //当我们输入框里面的值发生改变的时候我们的page也要改变（重置我们的操作）
      this.page = 1;
      //当改变的时候 suggest 要滚回顶部
      this.$refs.suggest.scrollTo(0, 0);
      search(this.query, this.page, this.showSinger, perpage).then(res => {
        if (res.code === ERR_OK) {
          this._genResult(res.data).then(result => {
            this.result = result;
          });
        }
      });
    },
    //搜索结果上拉加载的条件
    _checkMore(data) {
      const song = data.song;
      if (!song.list.length || song.curnum + (song.curpage - 1) * perpage >= song.totalnum
      ) {
        this.hasMore = false;
      }
    },
    //处理son和zhida的条件
    _genResult(data) {
      let ret = [];
      //如果data.zhida(直达) 并且 发起data.zhida.singerid(请求的歌手)
      if (data.zhida && data.zhida.singerid && this.page === 1) {
        //然后push请求出去 首先push一个data.zhida,type:'singer'用来区分搜索的是歌手还是歌曲
        ret.push({ ...data.zhida, ...{ type: TYPE_SINGER } });
      }
      return processSongsUrl(this._normalizeSongs(data.song.list)).then(
        songs => {
          ret = ret.concat(songs);
          return ret;
        }
      );
    },
    //定义一个方法处理我们的数据 list对应的话就是我们的song.list
    _normalizeSongs(list) {
      let ret = [];
      list.forEach(musicData => {
        if (isValidMusic(musicData)) {
          ret.push(createSong(musicData));
        }
      });
      return ret;
    },
    //监听滚动事件
    listScroll() {
      this.$emit("listScroll");
    },
    ...mapMutations({
      setSinger: "SET_SINGER"
    }),
    ...mapActions(["insertSong"])
  },
  watch: {
    query(newQuery) {
      if (!newQuery) {
        return;
      }
      this.search(newQuery);
    }
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.suggest {
  height: 100%;
  overflow: hidden;

  .suggest-list {
    padding: 0 30px;

    .suggest-item {
      display: flex;
      align-items: center;
      padding-bottom: 20px;
    }

    .icon {
      flex: 0 0 30px;
      width: 30px;

      [class^='icon-'] {
        font-size: 14px;
        color: $color-text-d;
      }
    }

    .name {
      flex: 1;
      font-size: $font-size-medium;
      color: $color-text-d;
      overflow: hidden;

      .text {
        no-wrap();
      }
    }
  }

  .no-result-wrapper {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>