/**
 * PostCSS Configuration
 */
module.exports = {
    plugins: {
        'postcss-preset-env': {
            stage: 2,
            features: {
                'nesting-rules': true,
                'custom-properties': true,
                'gap-properties': true,
            },
            autoprefixer: {
                flexbox: 'no-2009',
            },
        },
        autoprefixer: {},
        cssnano: process.env.NODE_ENV === 'production' ? {
            preset: ['default', {
                discardComments: {
                    removeAll: true,
                },
                normalizeWhitespace: true,
                minifyFontValues: true,
                minifyGradients: true,
            }],
        } : false,
    },
};
