const COLS = [1,2,3,4,5,6,7,8,9,10,11,12];

const GAPS = [8, 16, 24, 32, 48];

const WIDTHS = {
	xs: 320,
	sm: 375,		// 360?
//	ms: 412,		// S9+ (iphones are 414)
//	ms: 667,		// useless breakpoint, no one browses with 667x
	md: 768,
	lg: 1024,
	xl: 1280,
	xxl: 1920,		// 1600
};

function calc(frac, gap) {
	var pct = +(frac * 100).toFixed(6);

	if (gap == 0)
		return pct + "%";

	return "calc(" + pct + "% - " + gap + "px)";
}

const FLECKS = {
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

FLECKS[".fi"] = {
	width: "auto",
};

let flexGrow1 = [".fi"];
let displayNone = [];

for (let bp in WIDTHS) {
	flexGrow1.push(".fi-" + bp);
	displayNone.push(".v-" + bp);
}

FLECKS[flexGrow1.join(",")] = {
	flexGrow: 1,
};

FLECKS[displayNone.join(",")] = {
	display: "none",
};

COLS.forEach(col => {
	FLECKS[".fi-" + col] = {
		width: calc(col/COLS.length, 0),
	};
});

COLS.forEach(col => {
	FLECKS[".o-" + col] = {
		order: col,
	};
});

GAPS.forEach((g, i) => {
	let gnum = i + 1;
	let flg = ".fl.g" + gnum;
	let flgx = ".fl.g" + gnum + "x";
	let flgy = ".fl.g" + gnum + "y";

	FLECKS[flg] = {
		padding: g/2,
	};

	FLECKS[flgx] = {
		paddingLeft: g/2,
		paddingRight: g/2,
	};

	FLECKS[flgy] = {
		paddingTop: g/2,
		paddingBottom: g/2,
	};

	FLECKS[flg + " > *"] = {
		margin: g/2,
	};

	FLECKS[flgx + " > *"] = {
		marginLeft: g/2,
		marginRight: g/2,
	};

	FLECKS[flgy + " > *"] = {
		marginTop: g/2,
		marginBottom: g/2,
	};

	COLS.forEach(col => {
		let sels = (
			flg + " > .fi-" + col
			+ "," +
			flgx + " > .fi-" + col
		);

		FLECKS[sels] = {
			width: calc(col/COLS.length, g),
		};
	});
});

for (let bp in WIDTHS) {
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
		maxWidth: WIDTHS[bp] + "px"
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

			for (let bp2 in WIDTHS) {
				sels += "," + (flg + "-" + bp + " > .fi-" + col + "-" + bp2);
				sels += "," + (flgx + "-" + bp + " > .fi-" + col + "-" + bp2);
			}

			mq[sels] = {
				width: calc(col/COLS.length, g),
			};
		});
	});

	FLECKS["@media (min-width:" + WIDTHS[bp] + "px)"] = mq;
}

exports.flecks = FLECKS;