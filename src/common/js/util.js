// import {set } from "shelljs"

function getRandomInt(min, max) {
    //上下取整          +1是为了去到上线的值
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export function shuffle(arr) {
    let _arr = arr.slice()
    for (let i = 0; i < _arr.length; i++) {
        let j = getRandomInt(0, i)
        let t = _arr[i]
        _arr[i] = _arr[j]
        _arr[j] = t
    }
    return _arr
}

//节流函数 当我们对一个函数节流就会返回一个新的函数 然后延迟执行函数 多次调用还是执行一次


export function debounce(func, delay) {
    let timer

    return function(...args) {
        //如果被执行有这个tiemr就延时
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            func.apply(this, args)
        }, delay)
    }
}