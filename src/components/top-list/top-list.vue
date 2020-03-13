<template>
  <transition name="slide">
    <music-list :songs="songs"  :rank="rank" :title="title" :bg-image="bgImage"></music-list>
  </transition>
</template>

<script>
import MusicList from "components/music-list/music-list";
import { getMusicList } from "api/rank";
import { mapGetters } from "vuex";
import { ERR_OK } from "api/config";
import { createSong, isValidMusic, processSongsUrl } from 'common/js/song'


export default {
  computed: {
    title() {
      return this.topList.topTitle;
    },
    bgImage() {
      //不要我们封面的图片，拿我们歌曲第一张图片
      if (this.songs.length) {
        return this.songs[0].image;
      }
      return "";
      // 歌曲列表的封面图片
      // return this.topList.picUrl
    },
    ...mapGetters(["topList"])
  },
  created() {
    this._getMusicList();
  },
  data() {
    return {
      songs: [],
      rank: true
    };
  },
  methods: {
    _getMusicList() {
      // 当我们在歌曲曲列表刷新的时候就返回上一级
      if (!this.topList.id) {
        this.$router.push("/rank");
        return;
      }

      getMusicList(this.topList.id).then(res => {
        if (res.code === ERR_OK) {
          //为了准确拿到我们的有效数据对比
          processSongsUrl(this._normalizeSongs(res.songlist)).then((songs) => {
              this.songs = songs
            })
        }
      });
    },
    _normalizeSongs(list) {
      //定义空数组
      let ret = [];
      //foreach 回调拿到item
      list.forEach(item => {
        const musicData = item.data;
        //如果需要拿到有效的音乐 就push出去返回到我们的数据里面
         if (isValidMusic(musicData)) {
            ret.push(createSong(musicData))
          }
      });
      return ret;
    }
  },
  components: {
    MusicList
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter, .slide-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>
