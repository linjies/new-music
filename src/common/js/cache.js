import storage from 'good-storage'

const SEARCH_KEY = '__search__'
    //定义最多保存15条搜索记录
const SEARCH_MAX_LEN = 15

//定义一个播放列表的储存
const PLAY_KEY = '__play__'
    //可以储存50首歌曲
const PLAY_MAX_LEN = 50


//定义喜欢 收藏 的储存
const FAVORITE_KEY = "__favorite__"
    //可储存200条
const FAVORITE_MAX_LEN = 200

//插入的数组封装一个方法 arr：数组 val：值  compare：比较函数  maxLem：最大值
function insertArray(arr, val, compare, maxLem) {
    //定义缩影  findIndex es6 的一个数组api 查找我们数组中有没有某个元素
    const index = arr.findIndex(compare)
        //如果是第一条数据
    if (index === 0) {
        return
    }
    //如果index>0 就说有数据，并且还不是在第一的位置 就把之前的数据删除 然后差进来
    if (index > 0) {
        arr.splice(index, 1)
    }
    arr.unshift(val)
        //设置有最大值的限制 
    if (maxLem && arr.length > maxLem) {
        // 如果大于的话把数组最后一个pop出来
        arr.pop()
    }
    //总结：先查找有没有数据 如果有的话写第一个什么都不做 如果没有的话就直接插入，如果有的话删除在插入
}

//封装一个删除的方法组件 当compare为ture的时候就删除
function deleteFromArray(arr, compare) {
    const index = arr.findIndex(compare)
        //大于-1就删除
    if (index > -1) {
        arr.splice(index, 1)
    }
}



export function saveSearch(query) {
    //首先我们要得到当前search的储存空间情况
    //没有储存过的话就是一个空数组
    let searches = storage.get(SEARCH_KEY, [])
        //每个seaches都是item 所以返回出去
    insertArray(searches, query, (item) => {
            return item === query
        }, SEARCH_MAX_LEN)
        //保存完数组
    storage.set(SEARCH_KEY, searches)
    return searches
}

//本地缓存去读取我们的loadSearch
export function loadSearch() {
    return storage.get(SEARCH_KEY, [])
}

//单个删除
export function deleteSearch(query) {
    let searches = storage.get(SEARCH_KEY, [])
    deleteFromArray(searches, (item) => {
            return item === query
        })
        //保存完数组
    storage.set(SEARCH_KEY, searches)
    return searches
}

//全部清空 直接调用我们的SEARCH_KEY return 一个空数组
export function clearSearch() {
    storage.remove(SEARCH_KEY)
    return []
}

//储存歌曲
export function savePlay(song) {
    // 拿到当前列表没有就空
    let songs = storage.get(PLAY_KEY, [])
        // 用插入数组的方法把son插入到songs里面 然后同时传入一个比较函数 也就是这个song在里面的话就挪到前面去
    insertArray(songs, song, (item) => {
            return item.id === song.id
        }, PLAY_MAX_LEN)
        //如果插进去以后 把新的数组缓存到我们的本地 返回一个新的数组
    storage.set(PLAY_KEY, songs)
    return songs
}

//读取歌曲
export function loadPlay() {
    //直接拿到我们的列表
    return storage.get(PLAY_KEY, [])
}
//收藏
export function saveFavorite(song) {
    //拿到收藏的歌曲列表
    let songs = storage.get(FAVORITE_KEY, [])
        //把当前的歌曲插入到songs里面
    insertArray(songs, song, (item) => {
            //如果当前歌曲等于我们的收藏歌曲就插进去我们的列表组里
            return song.id === item.id

        }, FAVORITE_MAX_LEN)
        //存储返回一个新的songs
    storage.set(FAVORITE_KEY, songs)
    return songs
}
// 删除
export function deleteFavorite(song) {
    //一样拿到歌曲
    let songs = storage.get(FAVORITE_KEY, [])
    deleteFromArray(songs, (item) => {
            return song.id === item.id
        })
        //存储返回一个新的songs
    storage.set(FAVORITE_KEY, songs)
    return songs
}

//加载初始化列表
export function loadFavorite() {
    return storage.get(FAVORITE_KEY, [])
}