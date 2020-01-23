function generate(opts) {
	const COLS = Array(opts.cols || 12).fill(1).map((x, y) => x + y);

	const BREAKS = opts.breaks || {
	//	xs: 320,
		sm: 375,
		md: 768,
		lg: 1024,
		xl: 1280,
		xxl: 1920,
	};

	const GAPS = (opts.gaps || []).map(g => {
		let m = /([0-9.]+)(\S*)/g.exec(g);
		return [m[1], m[2] || "px"];
	});

	function round6(val) {
		return Math.round(val * 1e6) / 1e6;
	}

	function calc(frac, gap, un) {
		const pct = round6(frac * 100);

		if (gap == 0)
			return pct + "%";

		return "calc(" + pct + "% - " + gap + (un || "px") + ")";
	}

	function halfGap(g) {
		return g[0]/2 + g[1];
	}

	const CSS = {
		".fl": {
			display: "flex",
			flexFlow: "row wrap",
			justifyContent: "center",

			// * is considered "slow" :/
			"> *": {
				flex: "1 1 100%",
			},

			// 3. prevent image flex items from being stretched vertically
			"> img": {
				alignSelf: "center"
			},
		},
		".m0": {
			margin: "0 !important",
		},
		".p0": {
			padding: "0 !important",
		},
	};

	let hidden = [];

	for (let bp in BREAKS) {
		hidden.push(
			".v-" + bp,
			".v-" + bp + "-rel",
			".v-" + bp + "-abs",
			".v-" + bp + "-fix",
			".v-" + bp + "-stk",
		);
	}

	// todo: how to prevent tabindex? opacity: 0?, visibility: hidden?
	const hideCss = {
		position: "fixed",		// !important
		top: "100%",			// !important
		left: "100%",			// !important
		"-webkit-user-select": "none",
	//	"-moz-user-select": "none",
		"-ms-user-select": "none",
		userSelect: "none",
	};

	const showCss = {
		left: "auto",
		top: "auto",
		"-webkit-user-select": "auto",
	//	"-moz-user-select": "auto",
		"-ms-user-select": "auto",
		userSelect: "auto",
	};

	CSS[hidden.join(",")] = hideCss;

	const prefix = opts.parent ? ".fl" : "";
	const prefixChildren = opts.parent ? prefix + " > " : "";

	COLS.forEach(col => {
		CSS[prefixChildren + ".o-" + col] = {
			order: col,
		};
	});

	const fi = {
		flex: "1 1 0",
	};

	const fia = {
		flex: "1 1 auto",
	};

	CSS[prefixChildren + ".fi"] = fi;

	CSS[prefixChildren + ".fi-a"] = fia;

	COLS.forEach(col => {
		CSS[prefixChildren + ".fi-" + col] = {
			flex: "0 0 " + calc(col/COLS.length, 0),
		};
	});

	for (let bp in BREAKS) {
		let px = BREAKS[bp];
		let mq = {};

		// hidden at bp+
		mq[".h-" + bp] = hideCss;

		mq[
			".v-" + bp + "," +
			".v-" + bp + "-rel," +
			".v-" + bp + "-abs," +
			".v-" + bp + "-fix," +
			".v-" + bp + "-stk"
		] = showCss;

		// visible at bp+
		mq[".v-" + bp]			= {position: "static"};
		mq[".v-" + bp + "-rel"]	= {position: "relative"};
		mq[".v-" + bp + "-abs"]	= {position: "absolute"};
		mq[".v-" + bp + "-fix"]	= {position: "fixed"};
		mq[".v-" + bp + "-stk"]	= {position: "sticky"};

		// width snapping to bp
		mq[".bp"] = {
			maxWidth: BREAKS[bp] + "px"
		};

		mq[".m0-" + bp] = {
			margin: "0 !important"
		};

		mq[".p0-" + bp] = {
			padding: "0 !important"
		};

		COLS.forEach(col => {
			mq[prefixChildren + ".o-" + col + "-" + bp] = {
				order: col,
			};
		});

		mq[prefixChildren + ".fi-" + bp] = fi;

		mq[prefixChildren + ".fi-a-" + bp] = fia;

		// define widths at this bp for all cols
		COLS.forEach(col => {
			mq[prefixChildren + ".fi-" + col + "-" + bp] = {
				flex: "0 0 " + calc(col/COLS.length, 0),
			};
		});

		CSS["@media (min-width:" + BREAKS[bp] + "px)"] = mq;
	}


	GAPS.forEach((g, i) => {
		let gnum = i + 1;
		let flg  = prefix + ".g" + gnum;
		let flgx = flg + "x";
		let flgy = flg + "y";

		// set up gap containers
		CSS[flg] = {
			padding: halfGap(g),
		};

		CSS[flgx] = {
			paddingLeft: halfGap(g),
			paddingRight: halfGap(g),
		};

		CSS[flgy] = {
			paddingTop: halfGap(g),
			paddingBottom: halfGap(g),
		};

		CSS[flg + " > *"] = {
			margin: halfGap(g),
		};

		CSS[flgx + " > *"] = {
			marginLeft: halfGap(g),
			marginRight: halfGap(g),
		};

		CSS[flgy + " > *"] = {
			marginTop: halfGap(g),
			marginBottom: halfGap(g),
		};

		COLS.forEach(col => {
			let sels = [
				flg  + " > .fi-" + col,
				flgx + " > .fi-" + col,
			];

			CSS[sels.join()] = {
				flex: "0 0 " + calc(col/COLS.length, g[0], g[1]),
			};
		});

		for (let bp in BREAKS) {
			let px = BREAKS[bp];
			let mq = {};

			// set up gap containers for this bp
			mq[flg + "-" + bp] = {
				padding: halfGap(g),
			};

			mq[flgx + "-" + bp] = {
				paddingLeft: halfGap(g),
				paddingRight: halfGap(g),
			};

			mq[flgy + "-" + bp] = {
				paddingTop: halfGap(g),
				paddingBottom: halfGap(g),
			};

			mq[flg + "-" + bp + " > *"] = {
				margin: halfGap(g),
			};

			mq[flgx + "-" + bp + " > *"] = {
				marginLeft: halfGap(g),
				marginRight: halfGap(g),
			};

			mq[flgy + "-" + bp + " > *"] = {
				marginTop: halfGap(g),
				marginBottom: halfGap(g),
			};

			mq[[
				flg  + " > .fi-" + bp,
				flgx + " > .fi-" + bp,
				flg  + "-" + bp + " > .fi",
				flgx  + "-" + bp + " > .fi",
			].join()] = fi;

			mq[[
				flg  + " > .fi-a-" + bp,
				flgx + " > .fi-a-" + bp,
				flg  + "-" + bp + " > .fi-a",
				flgx  + "-" + bp + " > .fi-a",
			].join()] = fia;

			COLS.forEach(col => {
				let sels = [
					flg  + " > .fi-" + col + "-" + bp,
					flgx + " > .fi-" + col + "-" + bp,
					flg  + "-" + bp + " > .fi-" + col,
					flgx + "-" + bp + " > .fi-" + col,
				];

				mq[sels.join()] = {
					flex: "0 0 " + calc(col/COLS.length, g[0], g[1]),
				};
			});

			let sels1 = [];
			let sels2 = [];

			for (let bp2 in BREAKS) {
				let px2 = BREAKS[bp2];

				if (px2 <= px) {
					sels1.push(
						flg  + "-" + bp + " > .fi-" + bp2,
						flgx + "-" + bp + " > .fi-" + bp2,
					);

					sels2.push(
						flg  + "-" + bp + " > .fi-a-" + bp2,
						flgx + "-" + bp + " > .fi-a-" + bp2,
					);
				}
			}

			mq[sels1.join()] = fi;
			mq[sels2.join()] = fia;

			let sels3 = [];
			let sels4 = [];

			for (let bp2 in BREAKS) {
				let px2 = BREAKS[bp2];

				if (px2 <= px) {
					sels3.push(
						flg  + "-" + bp2 + " > .fi-" + bp,
						flgx + "-" + bp2 + " > .fi-" + bp,
					);

					sels4.push(
						flg  + "-" + bp2 + " > .fi-a-" + bp,
						flgx + "-" + bp2 + " > .fi-a-" + bp,
					);
				}
			}

			mq[sels3.join()] = fi;
			mq[sels4.join()] = fia;

			for (let bp2 in BREAKS) {
				let px2 = BREAKS[bp2];

				if (px2 <= px) {
					COLS.forEach(col => {
						mq[
							flg  + "-" + bp + " > .fi-" + col + "-" + bp2
							+ "," +
							flgx + "-" + bp + " > .fi-" + col + "-" + bp2
						] = {
							flex: "0 0 " + calc(col/COLS.length, g[0], g[1]),
						};
					});
				}
			}

			for (let bp2 in BREAKS) {
				let px2 = BREAKS[bp2];

				if (px2 <= px) {
					COLS.forEach(col => {
						mq[
							flg  + "-" + bp2 + " > .fi-" + col + "-" + bp
							+ "," +
							flgx + "-" + bp2 + " > .fi-" + col + "-" + bp
						] = {
							flex: "0 0 " + calc(col/COLS.length, g[0], g[1]),
						};
					});
				}
			}

			CSS["@media (min-width:" + BREAKS[bp] + "px)" + '\t'.repeat(gnum)] = mq;
		}
	});

	return CSS;
}

exports.generate = generate;