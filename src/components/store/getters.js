export const singer = state => state.singer

export const playing = state => state.playing
export const fullScreen = state => state.fullScreen
export const playlist = state => state.playlist
export const sequenceList = state => state.sequenceList
export const mode = state => state.mode
export const currentIndex = state => state.currentIndex

export const currentSong = (state) => {
    //直接通过currentSong 来取currentIndex 否则就一个空
    return state.playlist[state.currentIndex] || {}
}