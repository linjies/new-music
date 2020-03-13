const express = require("express")

const app = express()
const path = require('path')
app.use('/', express.static(path.join(__dirname, './dist')))

app.get('/', (_, res) => {
    res.sendFile(__dirname, './dist', './index.html')
})
app.listen(8888, () => {
    console.log(`服务器启动成功 `);

})