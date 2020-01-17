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

	function calc(frac, gap, un) {
		var pct = +(frac * 100).toFixed(6);

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

	const prefix = opts.parent ? ".fl" : "";
	const prefixChildren = opts.parent ? prefix + " > " : "";

	CSS[prefixChildren + ".fi"] = {
		width: 0,
		flexGrow: 1,
	};

	CSS[prefixChildren + ".fi-a"] = {
		width: "auto",
		flexGrow: 1,
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
		CSS[prefixChildren + ".fi-" + col] = {
			width: calc(col/COLS.length, 0),
		};
	});

	COLS.forEach(col => {
		CSS[prefixChildren + ".o-" + col] = {
			order: col,
		};
	});

	GAPS.forEach((g, i) => {
		let gnum = i + 1;
		let flg = prefix + ".g" + gnum;
		let flgx = prefix + ".g" + gnum + "x";
		let flgy = prefix + ".g" + gnum + "y";

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
			let sels = (
				flg + " > .fi-" + col
				+ "," +
				flgx + " > .fi-" + col
			);

			CSS[sels] = {
				width: calc(col/COLS.length, g[0], g[1]),
			};
		});
	});

	// TODO: this whole block needs to move inwards after the media queries
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

		// 2b. re-enable flex-grow for flex children without col specifiers
		// tofix: this is not correct unconditionally since it enables flex-grow for
		// e.g. at lg+ screen sizes & .fi-md.fi-6-lg (when there's another masking rule)
		mq[prefixChildren + ".fi-" + bp] = {
			width: 0,
			flexGrow: 1,
		};

		mq[prefixChildren + ".fi-a-" + bp] = {
			width: "auto",
			flexGrow: 1,
		};

		mq[".m0-" + bp] = {
			margin: "0 !important"
		};

		mq[".p0-" + bp] = {
			padding: "0 !important"
		};

		COLS.forEach(col => {
			mq[prefixChildren + ".fi-" + col + "-" + bp] = {
				width: calc(col/COLS.length, 0),
			};
		});

		COLS.forEach(col => {
			mq[prefixChildren + ".o-" + col + "-" + bp] = {
				order: col,
			};
		});

		CSS["@media (min-width:" + BREAKS[bp] + "px)"] = mq;
	}

	let tail = {};

	GAPS.forEach((g, i) => {
		// todo: .g2 > .fi / .fi-a ?
		let gnum = i + 1;
		let flg = prefix + ".g" + gnum;
		let flgx = prefix + ".g" + gnum + "x";
		let flgy = prefix + ".g" + gnum + "y";

		for (let bp in BREAKS) {
			let mq = {};
			let px1 = BREAKS[bp];

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

			COLS.forEach(col => {
				let sels = (
					flg + "-" + bp + " > .fi-" + col
					+ "," +
					flgx + "-" + bp + " > .fi-" + col
				);

				mq[sels] = {
					width: calc(col/COLS.length, g[0], g[1]),
				};
			});

			COLS.forEach(col => {
				let sels = (
					flg + " > .fi-" + col + "-" + bp
					+ "," +
					flgx + " > .fi-" + col + "-" + bp
				);

				mq[sels] = {
					width: calc(col/COLS.length, g[0], g[1]),
				};
			});

			for (let bp2 in BREAKS) {
				let px2 = BREAKS[bp2];

				if (px2 > px1) {
					let mq2 = {};

					COLS.forEach(col => {
						for (let bp1 in BREAKS) {
							if (bp1 < bp)
								continue;

							let sels = (
								flg + "-" + bp1 + " > .fi-" + col + "-" + bp2
								+ "," +
								flgx + "-" + bp1 + " > .fi-" + col + "-" + bp2
							);

							mq2[sels] = {
								width: calc(col/COLS.length, g[0], g[1]),
							};
						}
					});

					// 2b. re-enable flex-grow for flex children without col specifiers
					mq2[
						flg + " > .fi-" + bp2
						+ "," +
						flgx + " > .fi-" + bp2
						+ "," +
						flg + "-" + bp + " > .fi-" + bp2
						+ "," +
						flgx + "-" + bp + " > .fi-" + bp2
					] = {
						width: 0,
						flexGrow: 1,
					};

					mq2[
						flg + " > .fi-a-" + bp2
						+ "," +
						flgx + " > .fi-a-" + bp2
						+ "," +
						flg + "-" + bp + " > .fi-a-" + bp2
						+ "," +
						flgx + "-" + bp + " > .fi-a-" + bp2
					] = {
						width: "auto",
						flexGrow: 1,
					};

					tail["@media (min-width:" + px2 + "px)" + '\t'.repeat(gnum)] = mq2;
				}
				else {
					COLS.forEach(col => {
						let sels = (
							flg + "-" + bp + " > .fi-" + col + "-" + bp2
							+ "," +
							flgx + "-" + bp + " > .fi-" + col + "-" + bp2
						);

						mq[sels] = {
							width: calc(col/COLS.length, g[0], g[1]),
						};
					});
				}
			}

			CSS["@media (min-width:" + px1 + "px)" + ' '.repeat(gnum)] = mq;
		}
	});

	Object.assign(CSS, tail);

	return CSS;
}

exports.generate = generate;