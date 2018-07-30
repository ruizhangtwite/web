var path = require('path');
var Webpack = require("webpack");
module.exports = {
    entry: {
        modules: ['./src/libs/flexgrid.css', 'mint-ui/lib/style.css',  './src/libs/font-awesome.min.css',
            'vue', 'mint-ui', 'vue-resource', 'vue-router', 'vuex',
           './src/libs/cordova.js']
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: "[name].dll.js",
        library: '[name]'
    },
    module: {
        rules: [{
            test: /\.vue$/,
            use: 'vue-loader'
        }, {
            test: /\.css$/,
            use: ["style-loader","css-loader"]
        }, {
            test: /\.js$/,
            exclude: /node_modules|vue\/dist|vue-router\/|vue-loader\/|vue-hot-reload-api\/|jquery/,
            use: 'babel-loader',
            query: {
                presets: ['es2015', 'stage-2']
            }
        }, {
            test: /\.ttf$/,
            use: 'url-loader',
            query: {
                //不设置大小，存为base64
                name: 'font/[name].[ext]'
            }
        }]
    },
    resolve: {
        alias: {
            //别名，这样require('vue')时会加载下面的文件
            'vue$': 'vue/dist/vue.js',
            'mint-ui$': 'mint-ui/lib/mint-ui.common.js'
        },
        extensions: ['', '.js']
    },
    plugins: [
        new Webpack.DllPlugin({
            path: path.join(__dirname, "dist", "[name]-manifest.json"),
            name: "[name]"
        })
        // new Webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false
        //     }
        // })
    ]
}