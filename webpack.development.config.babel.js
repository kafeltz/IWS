import CleanWebpackPlugin from 'clean-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'
import webpack from 'webpack'

module.exports = {
    mode: 'development',
    target: 'web',
    devtool: 'inline-source-map',
    entry: './playground/index.js',
    devServer: {
        contentBase: './dist',
        hot: true,
        inline: true,
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'evWebSocket.js',
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
        new HtmlWebpackPlugin({
            template: './playground/index.html',
        }),
    ],
}
