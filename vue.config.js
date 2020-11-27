// this is vue.config.js
module.exports = {
    publicPath: process.env.NODE_ENV === "production"
        ? "/testCamera/"
        : "/",
    // 如果出現錯誤 : Error: No module factory available for dependency type: CssDependency ，就加這個
    css: {
        extract: false
    }
}