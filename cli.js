#!/usr/bin/env node
'use strict';

process.title = 'flecks';

// node cli.js --cols 12 --breaks sm:375 md:768 lg:1024 xl:1280 xxl:1920 --gaps 8 16 24 32 48 --out ./dist/flecks.css

const { generate } = require('./src/flecks');

const fs = require('fs');

const cssobj_core = require('cssobj-core');
const genCss = require('cssobj-plugin-gencss');
const defaultUnit = require('cssobj-plugin-default-unit');

const argv = require('yargs-parser')(process.argv.slice(2), {array: ['breaks','gaps'], boolean: ['noparent']});

if (argv.breaks) {
	let o = {};
	argv.breaks.forEach(b => {
		let [bp, px] = b.split(':');
		o[bp] = +px;
	});
	argv.breaks = o;
}

if (!argv.out)
	argv.out = './dist/flecks.css'

const cssobj = cssobj_core({
	plugins: [
		defaultUnit('px'),
		genCss({indent: '  ', newLine: '\n'}),
	]
});

let cssStruct = generate({
	cols: argv.cols,
	breaks: argv.breaks,
	gaps: argv.gaps,
	parent: !argv.noparent,
});

let css = cssobj(cssStruct).css.replace(/\s\s+\{/gm, '{');

fs.writeFileSync(argv.out, css, 'utf8');

let cssMin = css
	.replace(/\s+/gm,' ')
	.replace(/ ?\; ?/g, ";")
	.replace(/ ?\{ ?/g, "{")
	.replace(/ ?;?\} ?/g, "}")
	.replace(/ ?\: ?/g, ':')
	.replace(/ ?\> ?/g, '>');	// todo: all combinators

fs.writeFileSync(argv.out.replace('.css', '.min.css'), cssMin, 'utf8');