const path = require('path')
const urls = require('./tools/urls')
process.noDeprecation = true

module.exports = {
    module: {
        rules: [{
            test: /\.vue$/,
            loader: 'vue-loader'
        }, {
            test: /\.css$/,
            use: [
                "style-loader",
                "css-loader"
            ]
        }, {
            test: /\.js$/,
            exclude: /node_modules|vue\/dist|vue-router\/|vue-loader\/|vue-hot-reload-api\/|baiduMap.js/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015', 'stage-2']
            }
        }, {
            test: /\.(png|jpg|gif|svg)$/,
            loader: 'url-loader',
            query: {
                limit: 8192,
                name: '/images/[hash:7].[name].[ext]'
            }
        }, {
            test: /\.ttf$/,
            loader: 'url-loader',
            query: {
                //不设置大小，存为base64
                name: 'font/[name].[ext]'
            }
        }]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.js',
            'mint-ui$': 'mint-ui/lib/mint-ui.common.js',
            'vue-router': 'vue-router/dist/vue-router.js'
        },
        modules: [
            path.join(urls.rootPath, 'src/libs'),
            "node_modules"
        ],
        extensions: ['.js']
    }
}