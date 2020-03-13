import { mapGetters, mapMutations, mapActions } from 'vuex'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/util'



export const playlistMixin = {
    computed: {
        //拿到播放列表
        ...mapGetters([
            'playlist'
        ])
    },
    mounted() {
        this.handlePlaylist(this.playlist)
    },
    activated() {
        this.handlePlaylist(this.playlist)
    },
    watch: {
        playlist(newVal) {
            this.handlePlaylist(newVal)
        }
    },
    methods: {
        handlePlaylist() {
            throw new Error('component must implement handlePlaylist method')
        }
    }
}


//player.vue和playlist.vue两个组件的共享js 
export const playerMixin = {
    computed: {
        iconMode() {
            return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
        },
        ...mapGetters([
            "sequenceList",
            "currentSong",
            "playlist",
            "mode",
            'favoriteList'
        ]),
        favoriteIcon() {
            return this.getFavoriteIcon(this.currentSong)
        }
    },
    methods: {
        changeMode() {
            const mode = (this.mode + 1) % 3
            this.setPlayMode(mode)
            let list = null
            if (mode === playMode.random) {
                list = shuffle(this.sequenceList)
            } else {
                list = this.sequenceList
            }
            this.resetCurrentIndex(list)
            this.setPlaylist(list)
        },
        resetCurrentIndex(list) {
            let index = list.findIndex((item) => {
                return item.id === this.currentSong.id
            })
            this.setCurrentIndex(index)
        },
        toggleFavorite(song) {
            if (this.isFavorite(song)) {
                this.deleteFavoriteList(song)
            } else {
                this.saveFavoriteList(song)
            }
        },
        //点击收藏切换样式
        getFavoriteIcon(song) {
            if (this.isFavorite(song)) {
                return 'icon-favorite'
            }
            return 'icon-not-favorite'
        },
        //先判断我们的song是不是在我们的Favorite
        isFavorite(song) {
            const index = this.favoriteList.findIndex((item) => {
                return item.id === song.id
            })
            return index > -1
        },
        ...mapMutations({
            setPlayMode: 'SET_PLAY_MODE',
            setPlaylist: 'SET_PLAYLIST',
            setCurrentIndex: 'SET_CURRENT_INDEX',
            setPlayingState: 'SET_PLAYING_STATE'
        }),
        ...mapActions([
            'saveFavoriteList',
            'deleteFavoriteList'
        ])
    }
}


export const searchMixin = {
    data() {
        return {
            query: '',
            refreshDelay: 100
        }
    },

    computed: {
        ...mapGetters(["searchHistory"])
    },
    methods: {
        //调用我们searchBox里面的blur
        blurInput() {
            this.$refs.searchBox.blur();
        },
        //添加和查询（搜索）
        addQuery(query) {
            this.$refs.searchBox.setQuery(query)
        },
        //保存搜索结果
        saveSearch() {
            this.saveSearchHistory(this.query)
        },
        onQueryChange(query) {
            this.query = query;
        },
        ...mapActions([
            "saveSearchHistory",
            "deleteSearchHistory"
        ])
    }

}