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
				//	1. mobile-first: by default, all flex children are full width
				width: "100%",
				//	2a. .fi-<col>* flex children should not grow, so it's disabled here to avoid having to disable it everywhere
				flex: "0 1 auto",
			},

			// 3. prevent image flex items from being stretched vertically
			"> img": {
				alignSelf: "center"
			}
		},
	};


	/* 2b. re-enable it for flex children without col specifiers */

	CSS[".fi"] = {
		width: "auto",
	};

	let flexGrow1 = [".fi"];
	let displayNone = [];

	for (let bp in BREAKS) {
		flexGrow1.push(".fi-" + bp);
		displayNone.push(".v-" + bp);
	}

	CSS[flexGrow1.join(",")] = {
		flexGrow: 1,
	};

	CSS[displayNone.join(",")] = {
		display: "none",
	};

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
		mq[".h-" + bp] = {
			display: "none",
		};

		// visible at bp+
		mq[".v-" + bp] = {
			display: "inline-block",
		};

		// width snapping to bp
		mq[".bp"] = {
			maxWidth: BREAKS[bp] + "px"
		};

		mq[".fi-" + bp] = {
			width: "auto",
		};

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
					flg + " > .fi-" + col + "-" + bp
					+ "," +
					flg + "-" + bp + " > .fi-" + col
					+ "," +
					flgx + " > .fi-" + col + "-" + bp
					+ "," +
					flgx + "-" + bp + " > .fi-" + col
				);

				for (let bp2 in BREAKS) {
					sels += "," + (flg + "-" + bp + " > .fi-" + col + "-" + bp2);
					sels += "," + (flgx + "-" + bp + " > .fi-" + col + "-" + bp2);
				}

				mq[sels] = {
					width: calc(col/COLS.length, g),
				};
			});
		});

		CSS["@media (min-width:" + BREAKS[bp] + "px)"] = mq;
	}

	return CSS;
}

exports.generate = generate;