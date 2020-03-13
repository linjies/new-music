import { playMode } from 'common/js/config'
import { loadSearch, loadPlay, loadFavorite } from 'common/js/cache'
const state = {
    singer: {},
    //音乐播放或者停止 ture播放
    playing: false,
    //展开和收起
    fullScreen: false,
    //播放列表
    playlist: [],
    //歌曲顺序列表
    sequenceList: [],
    //播放选择（顺序，单曲，随机）
    mode: playMode.sequence,
    //当前播放索影
    currentIndex: -1,
    //歌单对象
    disc: {},
    //排行榜
    topList: {},
    //搜索信息记录
    searchHistory: loadSearch(),
    //播放历史从我们的缓存读
    playHistory: loadPlay(),
    //我喜欢的歌曲
    favoriteList: loadFavorite()
}

export default state