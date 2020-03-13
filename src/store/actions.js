import * as types from './mutation-types'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/util'
import { saveSearch, deleteSearch, clearSearch, savePlay, saveFavorite, deleteFavorite } from 'common/js/cache'

function findIndex(list, song) {
    return list.findIndex((item) => {
        return item.id === song.id
    })
}

// 选择播放 function 接收参数 结构为commit方法,state属性 第二个参数还有单曲歌曲列表和缩影list,index
export const selectPlay = function({ commit, state }, { list, index }) {
        commit(types.SET_SEQUENCE_LIST, list)
        commit(types.SET_PLAYLIST, list)
        commit(types.SET_CURRENT_INDEX, index)
        commit(types.SET_FULL_SCREEN, true)
        commit(types.SET_PLAYING_STATE, true)
    }
    //随机播放
export const randomPlay = function({ commit }, { list }) {
    commit(types.SET_PLAY_MODE, playMode.random)
    commit(types.SET_SEQUENCE_LIST, list)
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    commit(types.SET_CURRENT_INDEX, 0)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}


export const insertSong = function({ commit, state }, song) {
    let playlist = state.playlist.slice()
    let sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex
        //记录当前歌曲
    let currentSong = playlist[currentIndex]
        //查找当前列表中是否有待插入的歌曲并返回其索引
    let fpIndex = findIndex(playlist, song)
        // 因为是插入歌曲，所以索引+1( 这里++是因为当前缩影的下一个)
    currentIndex++
    // 插入这首歌到当前索引位置
    playlist.splice(currentIndex, 0, song)
        // 如果已经包含了这首歌
    if (fpIndex > -1) {
        // 如果当前插入的序号大于列表中的序号
        if (currentIndex > fpIndex) {
            //如果大于我们就删掉他，长度就减少  currentIndex--
            playlist.splice(fpIndex, 1)
            currentIndex--
        } else {
            playlist.splice(fpIndex + 1, 1)
        }
    }
    //获取sequencelist的位置，先定义一个量
    //获取他插入的位置
    let currentSIndex = findIndex(sequenceList, currentSong) + 1
    1
    let fsIndex = findIndex(sequenceList, song)

    sequenceList.splice(currentSIndex, 0, song)

    if (fsIndex > -1) {
        if (currentSIndex > fsIndex) {
            //如果插入到后面的，就把之前的缩影删除1个
            sequenceList.splice(fsIndex, 1)
        } else {
            //如果是插入之前就+ 一个然后删除
            sequenceList.splice(fsIndex + 1, 1)
        }
    }
    commit(types.SET_PLAYLIST, playlist)
    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_CURRENT_INDEX, currentIndex)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

export const saveSearchHistory = function({ commit }, query) {
    commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}
export const deleteSearchHistory = function({ commit }, query) {
    commit(type.SET_SEARCH_HISTORY, deleteSearch(query))

}
export const clearSearchHistory = function({ commit }) {
    commit(type.SET_SEARCH_HISTORY, clearSearch())

}

export const deleteSong = function({ commit, state }, song) {
    let playlist = state.playlist.slice()
    let sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex
        //拿到playlist这首歌的缩影 从我们playlist里面找到我们的song
    let pIndex = findIndex(playlist, song)
        //找到后删掉我们这首歌
    playlist.splice(pIndex, 1)
        //同上拿到缩影 然后删除if
    let sIndex = findIndex(sequenceList, song)
    sequenceList.splice(sIndex, 1)
        //删除我们做一个判断如果删除的歌曲在后面的话就 -- 或者我们删除了最后一首歌也要--
    if (currentIndex > pIndex || currentIndex === playlist.length) {
        currentIndex--
    }
    commit(types.SET_PLAYLIST, playlist)
    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_CURRENT_INDEX, currentIndex)
        //如果我们的播放列表清空了的话就SET_PLAYING_STATE为false
    const playingState = playlist.length > 0

    commit(types.SET_PLAYING_STATE, playingState)
        //        if (!playlist.length) {
        //            commit(types.SET_PLAYING_STATE, false)
        //        } else {
        //            commit(types.SET_PLAYING_STATE, true)
        //        }
}

export const deleteSongList = function({ commit }) {
    commit(types.SET_CURRENT_INDEX, -1)
    commit(types.SET_PLAYLIST, [])
    commit(types.SET_SEQUENCE_LIST, [])
    commit(types.SET_PLAYING_STATE, false)
}


export const savePlayHistory = function({ commit }, song) {
    commit(types.SET_PLAY_HISTORY, savePlay(song))
}

//当我们点喜欢（收藏）
export const saveFavoriteList = function({ commit }, song) {
    commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

//取消喜欢 收藏
export const deleteFavoriteList = function({ commit }, song) {
    commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}