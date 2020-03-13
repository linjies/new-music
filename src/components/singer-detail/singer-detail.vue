<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>
<script  type="text/ecmascript-6">
import { mapGetters } from "vuex";
import { getSingerDetail } from "api/singer";
import { ERR_OK } from "api/config";
import { createSong, isValidMusic, processSongsUrl } from "common/js/song";
import MusicList from "components/music-list/music-list";
export default {
  computed: {
    title() {
      return this.singer.name;
    },
    bgImage() {
      return this.singer.avatar;
    },
    ...mapGetters(["singer"])
  },
  data() {
    return {
      songs: []
    };
  },
  created() {
    this._getDetail();
  },
  methods: {
    _getDetail() {
      //如果在我们歌手1列表刷新的话返回我们的列表
      if (!this.singer.id) {
        this.$router.push("/singer");
        return;
      }
      getSingerDetail(this.singer.id).then(res => {
        if (res.code == ERR_OK) {
          //拿到_normalizeSongs 传入数据
          processSongsUrl(this._normalizeSongs(res.data.list)).then(songs => {
            this.songs = songs;
          });
        }
      });
    },
    //遍历我们的数据
    _normalizeSongs(list) {
      let ret = [];
      list.forEach(item => {
        //拿到musicData数据
        let { musicData } = item;
        //封装一下createSong 不要写那么多重复的代码
        if (musicData.songid && musicData.albummid) {
          //拿到歌手信息和歌手的图片
          ret.push(createSong(musicData));
          //  console.log(musicData.songid);
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
  transition: all 0.3s;
}

.slide-enter, .slide-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>