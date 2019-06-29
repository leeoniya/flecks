// node build.js --cols 12 --breaks xs:320 sm:375 md:768 lg:1024 xl:1280 xxl:1920 --gaps 8 16 24 32 48 --out ./dist/flecks.css

const { generate } = require('./src/flecks.js');

const fs = require('fs');

const cssobj_core = require('cssobj-core');
const genCss = require('cssobj-plugin-gencss');
const defaultUnit = require('cssobj-plugin-default-unit');

let CleanCSS = require('clean-css');

const argv = require('yargs-parser')(process.argv.slice(2), {array: ['breaks','gaps']});

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
});

let css = cssobj(cssStruct).css;

fs.writeFileSync(argv.out, css, 'utf8');

let cssMin = new CleanCSS({level: 2}).minify(css).styles;

fs.writeFileSync(argv.out.replace('.css', '.min.css'), cssMin, 'utf8');