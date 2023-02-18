import {TransformOptions} from '@babel/core';

export default {
    presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript',
    ],
} as TransformOptions
