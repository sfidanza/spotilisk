import * as esbuild from 'esbuild';
import { clean } from 'esbuild-plugin-clean';
import { copy } from 'esbuild-plugin-copy';
import eslint from 'esbuild-plugin-eslint';
import hash from './build/plugins/esbuild-plugin-hash.js';
import stylelint from './build/plugins/esbuild-plugin-stylelint.js';
import tpl from './build/plugins/esbuild-plugin-tpl.js';
import chokidar from 'chokidar';

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
            patterns: [ 'target/*' ]
        }),
        hash({
            srcdir: 'src/',
            index: 'index.html'
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

await esbuild.build(config);

const LCINFO = '\x1b[34m%s\x1b[0m'; //blue
const LCWARN = '\x1b[33m%s\x1b[0m'; //yellow
const isWatch = process.argv.includes('--watch');
if (isWatch) {
    const ctx = await esbuild.context(config);
    // Replace esbuild's watch by chokidar's to trigger rebuild on html and images as well
    // await ctx.watch();

    console.log(LCINFO, '[watch] build finished, watching for changes...');
    chokidar.watch('./src', { ignoreInitial: true, usePolling: true }).on('all', async (event, path) => {
        console.log(LCWARN, event, path);
        await ctx.rebuild();
        console.log(LCINFO, '[watch] build finished, watching for changes...');
    });
}
