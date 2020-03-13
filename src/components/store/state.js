import { playMode } from 'common/js/config'
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
    currentIndex: -1
}

export default state