const webpack = require('webpack')
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const os = require('os')

const base = path.resolve(__dirname, 'mixin');

function getBuild() {
    var date = new Date();
    return `${date.getMonth()+1}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;
}

const plugins = [
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
];

const mixinList = ['lottie', 'echart', 'demo', 'siri-curve', 'disk-cover', 'timeline', 'audio-chart'];
const entry = {};
for (let mixin of mixinList) {
    entry[mixin] = [path.resolve(base, 'src', `${mixin}.js`)];
}

module.exports = {
    entry,
    output: {
        filename: process.env.NODE_ENV === 'production' ? '[name].min.js' : '[name].js',
        path: path.resolve(base, 'dst'),
        globalObject: 'this',
        library: 'mixin',
        libraryTarget: 'umd',
        libraryExport: 'default'
    },
    resolve: {
        // 自动补全的扩展名
        extensions: ['.js', '.json', '.ts'],
        fallback: {
            "fs": false,
            "tls": false,
            "net": false,
            "zlib": false,
            "http": false,
            "https": false,
            "stream": false,
            "crypto": false,
            "url": false,
            "util": false,
            "os": false,
            "assert": false,
            "constants": false,
            'react-native-fs': false,
            "path": require.resolve("path-browserify"),
	        "events": false,
	    }
    },
    module: {
        rules: [
            // 它会应用到普通的 `.js` 文件
            // 以及 `.vue` 文件中的 `<script>` 块
            {
                test: /\.js$/,
                loader: 'babel-loader'
            },
            // 它会应用到普通的 `.css` 文件
            // 以及 `.vue` 文件中的 `<style>` 块
            {
                test: /\.css$/,
                use: [
                    { loader: "style-loader", options: { attributes: { mira: "player" } } },
                    'css-loader',
                ]
            },
            {
                test: /\.less$/,
                use: [
                    { loader: "style-loader", options: { attributes: { mira: "player" } } },
                    'css-loader',
                    'less-loader',
                ]
            }
        ]
    },
    optimization: {
        minimize: process.env.NODE_ENV === 'production',
    },
    plugins,
    watchOptions: {
        ignored: ['*/mixin/dst/*']
    },
    externals: [],
};
