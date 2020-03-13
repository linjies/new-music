<template>
  <div class="singer" ref="singer">
    <list-view @select="selectSinger" :data="singers" ref="list"></list-view>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
import ListView from "base/listview/listview";
import { getSingerList } from "api/singer";
import { ERR_OK } from "api/config";
import Singer from "common/js/singer";
import { mapMutations } from "vuex";
import { playlistMixin } from "common/js/mixin";

//定义热门 数据20条
const HOT_SINGER_LEN = 20;
const HOT_NAME = "热门";

export default {
  mixins: [playlistMixin],
  data() {
    return {
      singers: []
    };
  },
  created() {
    this._getSingerList();
  },
  methods: {
    handlePlaylist(playlist) {
      //设定bottom 如果有歌曲就加 60px 否则空
      const bottom = playlist.length > 0 ? "60px" : "";
      this.$refs.singer.style.bottom = bottom;

      this.$refs.list.refresh();
    },
    //歌手路由
    selectSinger(singer) {
      this.$router.push({
        path: `/singer/${singer.id}`
      });
      this.setSinger(singer);
    },
    _getSingerList() {
      getSingerList().then(res => {
        if (res.code === ERR_OK) {
          this.singers = this._normalizeSinger(res.data.list);
        }
      });
    },
    _normalizeSinger(list) {
      //定义热门数据
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      };
      //遍历我们的热门数据
      list.forEach((item, index) => {
        if (index < HOT_SINGER_LEN) {
          map.hot.items.push(
            new Singer({
              //push我们的歌曲id和名字
              name: item.Fsinger_name,
              id: item.Fsinger_mid
            })
          );
        }
        const key = item.Findex;
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          };
        }
        map[key].items.push(
          new Singer({
            name: item.Fsinger_name,
            id: item.Fsinger_mid
          })
        );
      });
      // 为了得到有序列表，我们需要处理 map
      //其他数组
      let ret = [];
      // 热门空数组
      let hot = [];
      //按字母顺序排列
      for (let key in map) {
        let val = map[key];
        //正则校验 a到z 就把他添加到数组
        if (val.title.match(/[a-zA-Z]/)) {
          ret.push(val);
        }
        //如果是热门数组就把他push我们的hot里面
        else if (val.title === HOT_NAME) {
          hot.push(val);
        }
      }
      //ret一个分类方法  按字母的深序排列
      ret.sort((a, b) => {
        //如果 a.title 减 b.title 大于零的话就ture
        return a.title.charCodeAt(0) - b.title.charCodeAt(0);
      });
      return hot.concat(ret);
    
    },
    ...mapMutations({
      setSinger: "SET_SINGER"
    })
  },
  components: {
    ListView
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.singer {
  position: fixed;
  top: 88px;
  bottom: 0;
  width: 100%;
}
</style>
