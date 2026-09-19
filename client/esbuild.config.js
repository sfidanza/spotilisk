import * as esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import { clean, hash, eslint, stylelint, tpl, worldWatcher } from '@sfidanza/netherforge';

const config = {
    logLevel: 'info',
    entryPoints: [ 'src/app.js', 'src/app.css' ],
    entryNames: '[name]-[hash]',
    bundle: true,
    sourcemap: true,
    metafile: true,
    external: [ 'img/loader.gif' ],
    outdir: 'target/static/',
    plugins: [
        eslint(),
        stylelint(),
        clean({
            onStartPatterns: [ 'target/*' ]
        }),
        hash({
            srcdir: 'src/',
            index: [ 'index.html' ]
        }),
        tpl({
            files: [ 'src/templates/**/*.html' ],
            dest: 'app.json'
        }),
        copy({
            assets: {
                from: [ 'src/img/**/*' ],
                to: [ 'img/' ],
            }
        })
    ]
};

worldWatcher.oversee(esbuild, config);
