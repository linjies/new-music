export function hasClass(el, className) {
    let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
    return reg.test(el.className)
}


//封装slider组件的方法
export function addClass(el, className) {
    if (hasClass(el, className)) {
        return
    }

    let newClass = el.className.split(' ')
    newClass.push(className)
    el.className = newClass.join(' ')
}
//封装字母点击跳到相应数据的方法
export function getData(el, name, val) {
    //获取data- 属性 如果说有这个值就 val return
    const prefix = 'data-'
    name = prefix + name
    if (val) {
        return el.setAttribute(name, val)
    } else {
        return el.getAttribute(name)
    }
}



let elementStyle = document.createElement('div').style

let vendor = (() => {
    let transformNames = {
        //各大 浏览器的Transform
        webkit: 'webkitTransform',
        Moz: 'MozTransform',
        O: 'OTransform',
        ms: 'msTransform',
        //这个就是标准的transform
        standard: 'transform'
    }

    //遍历一下transformNames（各大浏览器的transform） 
    for (let key in transformNames) {
        if (elementStyle[transformNames[key]] !== undefined) {
            return key
        }
    }
    //如果全部都不对应就false
    return false
})()

export function prefixStyle(style) {
    if (vendor === false) {
        return false
    }

    //如果浏览器都不符合就让他执行标准的standard
    if (vendor === 'standard') {
        return style
    }

    return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}