const fs = require('fs');

const cssobj_core = require('cssobj-core');
const genCss = require('cssobj-plugin-gencss');
const defaultUnit = require('cssobj-plugin-default-unit');

const cssobj = cssobj_core({
  plugins: [
	defaultUnit('px'),
    genCss({indent: '  ', newLine: '\n'}),
  ]
});

const { flecks } = require('./src/flecks.js');

let compiled = cssobj(flecks).css;

fs.writeFileSync('./dist/flecks.css', compiled, 'utf8');

let CleanCSS = require('clean-css');
let options = {
//	format: 'beautify',
	level: 2,
};

let output = new CleanCSS(options).minify(compiled);

fs.writeFileSync('./dist/flecks.min.css', output.styles, 'utf8');