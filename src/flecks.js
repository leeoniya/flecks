function generate(opts) {
	const COLS = Array(opts.cols || 12).fill(1).map((x, y) => x + y);
	const BREAKS = opts.breaks || {
		xs: 320,
		sm: 375,
		md: 768,
		lg: 1024,
		xl: 1280,
		xxl: 1920,
	};
	const GAPS = opts.gaps || [];

	function calc(frac, gap) {
		var pct = +(frac * 100).toFixed(6);

		if (gap == 0)
			return pct + "%";

		return "calc(" + pct + "% - " + gap + "px)";
	}

	const CSS = {
		".fl": {
			display: "flex",
			flexFlow: "row wrap",
			justifyContent: "center",

			// * is considered "slow" :/
			"> *": {
				// 1. mobile-first: by default, all flex children are full width
				width: "100%",
				// 2a. .fi-<col>* flex children should not grow, so it's disabled here to avoid having to disable it everywhere
				flex: "0 1 auto",
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

	CSS[".fi"] = {
		width: "auto",
	};

	let flexGrow1 = [".fi"];
	let hidden = [];

	for (let bp in BREAKS) {
		// 2b. re-enable flex-grow for flex children without col specifiers
		flexGrow1.push(".fi-" + bp);
		hidden.push(
			".v-" + bp,
			".v-" + bp + "-rel",
			".v-" + bp + "-abs",
			".v-" + bp + "-fix",
			".v-" + bp + "-stk",
		);
	}

	CSS[flexGrow1.join(",")] = {
		flexGrow: 1,
	};

	// todo: how to prevent tabindex? opacity: 0?, visibility: hidden?
	const hideCss = {
		position: "fixed",		// !important
		top: "100%",			// !important
		left: "100%",			// !important
		"-webkit-user-select": "none",
		"-moz-user-select": "none",
		"-ms-user-select": "none",
		userSelect: "none",
	};

	const showCss = {
		left: "auto",
		top: "auto",
		"-webkit-user-select": "auto",
		"-moz-user-select": "auto",
		"-ms-user-select": "auto",
		userSelect: "auto",
	};

	CSS[hidden.join(",")] = hideCss;

	COLS.forEach(col => {
		CSS[".fi-" + col] = {
			width: calc(col/COLS.length, 0),
		};
	});

	COLS.forEach(col => {
		CSS[".o-" + col] = {
			order: col,
		};
	});

	GAPS.forEach((g, i) => {
		let gnum = i + 1;
		let flg = ".fl.g" + gnum;
		let flgx = ".fl.g" + gnum + "x";
		let flgy = ".fl.g" + gnum + "y";

		CSS[flg] = {
			padding: g/2,
		};

		CSS[flgx] = {
			paddingLeft: g/2,
			paddingRight: g/2,
		};

		CSS[flgy] = {
			paddingTop: g/2,
			paddingBottom: g/2,
		};

		CSS[flg + " > *"] = {
			margin: g/2,
		};

		CSS[flgx + " > *"] = {
			marginLeft: g/2,
			marginRight: g/2,
		};

		CSS[flgy + " > *"] = {
			marginTop: g/2,
			marginBottom: g/2,
		};

		COLS.forEach(col => {
			let sels = (
				flg + " > .fi-" + col
				+ "," +
				flgx + " > .fi-" + col
			);

			CSS[sels] = {
				width: calc(col/COLS.length, g),
			};
		});
	});

	for (let bp in BREAKS) {
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

		mq[".fi-" + bp] = {
			width: "auto",
		};
/*
		mq[".m0-" + bp] = {
			margin: "0 !important"
		};

		mq[".p0-" + bp] = {
			padding: "0 !important"
		};
*/
		COLS.forEach(col => {
			mq[".fi-" + col + "-" + bp] = {
				width: calc(col/COLS.length, 0),
			};
		});

		COLS.forEach(col => {
			mq[".o-" + col + "-" + bp] = {
				order: col,
			};
		});

		GAPS.forEach((g, i) => {
			let gnum = i + 1;
			let flg = ".fl.g" + gnum;
			let flgx = ".fl.g" + gnum + "x";
			let flgy = ".fl.g" + gnum + "y";

			mq[flg + "-" + bp] = {
				padding: g/2,
			};

			mq[flgx + "-" + bp] = {
				paddingLeft: g/2,
				paddingRight: g/2,
			};

			mq[flgy + "-" + bp] = {
				paddingTop: g/2,
				paddingBottom: g/2,
			};

			mq[flg + "-" + bp + " > *"] = {
				margin: g/2,
			};

			mq[flgx + "-" + bp + " > *"] = {
				marginLeft: g/2,
				marginRight: g/2,
			};

			mq[flgy + "-" + bp + " > *"] = {
				marginTop: g/2,
				marginBottom: g/2,
			};

			COLS.forEach(col => {
				let sels = (
					flg + "-" + bp + " > .fi-" + col
					+ "," +
					flgx + "-" + bp + " > .fi-" + col
				);

				mq[sels] = {
					width: calc(col/COLS.length, g),
				};
			});

			COLS.forEach(col => {
				let sels = (
					flg + " > .fi-" + col + "-" + bp
					+ "," +
					flgx + " > .fi-" + col + "-" + bp
				);

				mq[sels] = {
					width: calc(col/COLS.length, g),
				};
			});

			for (let bp2 in BREAKS) {
				COLS.forEach(col => {
					let sels = (
						flg + "-" + bp + " > .fi-" + col + "-" + bp2
						+ "," +
						flgx + "-" + bp + " > .fi-" + col + "-" + bp2
					);

					mq[sels] = {
						width: calc(col/COLS.length, g),
					};
				});
			}
		});

		CSS["@media (min-width:" + BREAKS[bp] + "px)"] = mq;
	}

	return CSS;
}

exports.generate = generate;