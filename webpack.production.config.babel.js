import CleanWebpackPlugin from 'clean-webpack-plugin'
import path from 'path'
import S3Plugin from 'webpack-s3-plugin'

const merge = require('webpack-merge')
const common = require('./webpack.common.config.babel.js')

module.exports = env => {
    const bucket = env && env.target === 'production' ? 'static.eventials.com' : 'static-stg.eventials.com'

    return merge(common, {
        mode: 'production',
        target: 'web',
        devtool: 'source-map',
        entry: './src/api.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'WsApi.[hash].js',
            library: 'WsApi',
            libraryTarget: 'var',
        },
        plugins: [
            new CleanWebpackPlugin(['dist']),
            new S3Plugin({
                include: /.*\.(js)/,
                s3Options: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                    region: 'us-east-1',
                },
                basePathTransform: () => {
                    return 'evWebSocket/assets/'
                },
                s3UploadOptions: {
                    Bucket: bucket,
                },
            }),
        ],
    })
}
