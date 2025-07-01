const fs = require('node:fs');

/*
		node o.js>o.html

	TODO
		write each item to own file
		write tags to tag files
 */
const gallery = require('./gallery.json');

const writeFile = async (url, body) => {
	const spl =  url.split( '/' );
	const path = spl.slice( 0, -1 ).join( '/' );
	const filename = spl.slice(spl.length - 1);

	try {
		if (path.length) {
			fs.mkdirSync(path, { recursive: true });
		}
		fs.writeFileSync(url,
`<DOCTYPE html>
<!-- github.com/xpollen8/gallery.davidwhittemore.com -->
	<html>
		${body}
	</html>
`);
		// file written successfully
	} catch (err) {
		console.error(err);
	}
	console.log(`Wrote to ${url}`);
}

const tags = {};

const cleanup = (s) => {
	return s.replace(/<p>/ig, '<p />');
}

const urlSafe = (u) => u?.replace(/\W/g, ' ')?.replace(/  /g, ' ')?.replace(/ /g, '_')?.replace(/__/g, '_')?.replace(/_$/g, '')?.replace(/^_/g, '')?.toLowerCase();
const fileBasename = (t) => `${urlSafe(t)}`;

const globalStyle = `
	.gallery_nav { font-weight: 900; }
	body { background-color:#2222cc; color:#dedede; font: 1em Arial, san-serif; }
	a { color: #ccccff; text-decoration: underline; text-decoration-color: #666; }
	a:visited { color: #ccccff; }
`;

const thumbnailStyle = `
	.thumb { max-width: 250px; border: 1px solid gray; padding: .25em; text-align: center; margin: .5em; }
`;

const footer = () => `
	<div style="display: flex; flex-wrap: wrap; justify-content: space-evenly; background-color: black; border: 1px solid grey; max-width: 1485px; margin: 5 auto; padding: .5em;">
		<div style="width: 50%;">
			<a href="https://davidwhittemore.com" style="letter-spacing: 3px;"> David Whittemore </a>
			<br />
			<a href="https://davidwhittemore.com/htdb/copyright.html"> &copy; 1985-${new Date().getFullYear()} </a>
		</div>
		<div style="width: 50%;">
			<a href="https://adjective.com"><img
				alt="try yr luck!"
				src="https://adjective.com/images/random/_${Math.floor(Math.random() * (693 - 1 + 1) + 1)}.jpg"
				style="float:right;"></a>
		</div>
	</div>
`;

const itemStyle = `
	.gallery { display: flex; flex-wrap: wrap; justify-content: center; background-color: black; border: 1px solid grey; max-width: 1515px; margin: 5 auto; }
	.column { flex: 1; }
	.photo-container { width: 100%; max-width: 750px; margin: 0 auto; }
	.text-container { margin: .5em auto; padding-right: .5em; padding-left: 1em; }
	.photo-container img { width: 100%; height: auto; }
	.body { margin-left: 1em; }
	@media screen and (max-width: 750px) {
		.gallery { flex-direction: column; gap: .5em; }
		.body { margin-left: 0em; }
		.column { flex: none; }
		.photo-container { max-width: 750px; width: 100%; }
		.text-container { padding-left: .5em; padding-right: .5em; }
	}
	.gallery_head { text-decoration: none; }
	.image { max-width: auto; max-height: auto; }
	.title { font-size: 1.5em; color: white; padding-bottom: .5em; }
	.date { padding-top: 1em; font-weight: 900; }
	.details { border: 1px solid white;  background: white; padding: .25em; }
	.details > a { color: black; }
	.ago { font-size: .75em; color: #9f9f9f; }
`;

const fontsize = (t) => {
	const frac = tags[t]?.length / Object.keys(tags)?.length;
	const value = Math.max(0, Math.min(1, frac));
	// Calculate scaled value using natural logarithm
	return 0.8 + ((Math.log(value + 1) / Math.log(2)) * 3);
}

const simpleTag = (t) => {
	const [ X, val ] = t?.split(':');
	if (val) return val;
	return t;
}

const safeBlogurl = (g) => safeDate(g.dt) + "/" + urlSafe(g.caption) + ".html";

const header = ({ oldest, newest, style, title }) => {
	const random =  Math.floor((Math.random() * (newest - oldest + 1))) + oldest;
	return  `<head>
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>
	David Whittemore's Two Hundred Fifty Pixels Wide : ${title}
	</title>
		<style>
			${globalStyle}
			${style}
		</style>
	</head>
	<body>
	<div style="flex-wrap: wrap; display: flex; align-items: center; justify-content: space-between; padding: .5em; background: black; border: 1px solid grey; max-width: 1500px; margin: 5 auto;">
		<div>
			<div style="color: white; font-size: 1.5em;">
				<a class="gallery_head" href="/">David Whittemore's photo gallery</a>
			</div>
		</div>
		<div>
			<span class="gallery_nav">
			<!--<a class="gallery_nav" href="/gallery">Featured</a> ..-->
			<a class="gallery_nav" title="${gallery[oldest].caption}" href="https://gallery.davidwhittemore.com/${safeBlogurl(gallery[oldest])}">Oldest</a> ..
			<a class="gallery_nav" title="${gallery[newest].caption}" href="https://gallery.davidwhittemore.com/${safeBlogurl(gallery[newest])}">Newest</a> ..
			<a class="gallery_nav" title="${gallery[random].caption}" href="https://gallery.davidwhittemore.com/${safeBlogurl(gallery[random])}">Random</a> ..
			<a class="gallery_nav" title="show all thumbnails" href="https://gallery.davidwhittemore.com/thumbnails.html">431 Thumbnails</a>
			</span>
		</div>
	</div>
	`;
}

const prettyDate = (d) => {
	return `${d.split(' ')[0]?.replace(/-00-00/, '')}`;
}

const safeDate = (d) => d?.substr(0, 10)?.replace(/-/g, '/')?.replace(/\/00\/00/, '');

const oldest = 0;
const newest = gallery?.length - 1;

const templatize = (i) => {
	const g = gallery[i];
	const prev = i ? i - 1 : newest;
	const next = i < newest ? i + 1 : 0;
	const { body, image, thumb, caption, dt, date, blogdate, blogtitle, camera, media, lens, height, width } = g;
	const blogurl = safeBlogurl(g);
	return [ blogurl, `
${header({ oldest, newest, style: itemStyle, title: blogtitle })}
<div style="flex-wrap: wrap; display: flex; align-items: center; justify-content: space-between; padding: .25em; background: black; border: 1px solid grey; max-width: 1500px; margin: 5 auto;">
	<div>
		<a href="https://gallery.davidwhittemore.com/${safeBlogurl(gallery[oldest])}"><img
			alt="[oldest]"
			src="${gallery[oldest].thumb.replace('500', '100')}"
			width="${width * .15}"
			align=absmiddle></a>
		<a href="https://gallery.davidwhittemore.com/${safeBlogurl(gallery[prev])}"><img
			alt="[prev]"
			src="${gallery[prev].thumb.replace('500', '100')}"
			width="${width * .15}"
			align=absmiddle></a>
	</div>
	<div>
		<a href="https://gallery.davidwhittemore.com/${safeBlogurl(gallery[next])}"><img
			alt="[next]"
			src="${gallery[next].thumb.replace('500', '100')}"
			width="${width * .15}"
			align=absmiddle></a>
		<a href="https://gallery.davidwhittemore.com/${safeBlogurl(gallery[newest])}"><img
			alt="[newest]"
			src="${gallery[newest].thumb.replace('500', '100')}"
			width="${width * .15}"
			align=absmiddle></a>
	</div>
</div>
<div class="gallery">
	<div class="column">
		<div class="photo-container">
			<a href="${image}"><img class="image" src="${thumb?.replace('500', '750')}" alt="${caption}" width="750" height="${(height / 500) * 750}"></a>
			<div class="details">
				${g?.tags.map(t => { return `<a title="Filter by: ${t}" href="https://gallery.davidwhittemore.com/tags/${fileBasename(t)}.html" style="font-size: ${fontsize(t)}em; margin-right: .25em;">${simpleTag(t)}</a>` })?.join(' .. ')}
			</div>
		</div>
	</div>
	<div class="column">
		<div class="text-container">
			<div class="title">${caption}</div>
			<div class="body">${body}</div>
			<div id="dt" style="display: none;">${dt}</div>
			<div class="date">${prettyDate(dt)}</div>
			<div class="ago" id="fromnow"/>
		</div>
	</div>
</div>
<script>
	const data = ${JSON.stringify(g)};
	const dt = new Date(document.getElementById('dt')?.innerHTML).getTime();
	const fromnow = document.getElementById('fromnow');

	function time_ago(input) {
		const date = (input instanceof Date) ? input : new Date(input);
		const formatter = new Intl.RelativeTimeFormat('en');
		const ranges = {
			years: 3600 * 24 * 365.25,
			months: 3600 * 24 * 30.43,
			weeks: 3600 * 24 * 7,
			days: 3600 * 24,
			hours: 3600,
			minutes: 60,
			seconds: 1
		};
		const secondsElapsed = (date.getTime() - Date.now()) / 1000;
		for (let key in ranges) {
			if (ranges[key] < Math.abs(secondsElapsed)) {
				const delta = secondsElapsed / ranges[key];
				return formatter.format(Math.round(delta), key);
			}
		}
	}
	function calcFromNow(fromnow) {
			fromnow.innerHTML = "(" + time_ago(dt) + ")";
	}

	if (fromnow && dt) {
			calcFromNow(fromnow);  // initial
			setInterval(function(){ calcFromNow(fromnow); }, 30000);   // every 30 second
	}
</script>
</div>
${footer()}
</body>
` ];
}

for (var i = 0 ; i < gallery.length ; i++) {
	const g = gallery[i];
	const { body, image, thumb, caption, dt, date, blogdate, blogtitle, blogurl, camera, media, lens, height, width } = g;
	g?.tags.forEach(t => {
		if (!tags[t]) tags[t] = [];
		tags[t].push({ caption, blogurl, thumb, dt });
	});
}

const thumbs = (title, array, url) => {
	const card = (t) => {
		return `<div class="thumb"><a href="https://gallery.davidwhittemore.com/${safeBlogurl(t)}"><img alt="${t.caption}" src="${t.thumb?.replace('500', '250')}" width="250"><p />${t.caption}</a><p />${t.dt?.substr(0, 4)}</div>`
	}

	const body = `${header({ oldest, newest, style: thumbnailStyle, title })}
	<div style="display: flex; flex-wrap: wrap; justify-content: center; background-color: black; border: 1px solid grey; max-width: 1485px; margin: 5 auto; padding: 1em;">
		<div style="font-size: 2em; color: white;">${title}</div>
	</div>
	<div style="display: flex; flex-wrap: wrap; justify-content: space-evenly; background-color: black; border: 1px solid grey; max-width: 1515px; margin: 5 auto;">
		${array.sort((a, b) => new Date(b.dt) - new Date(a.dt))?.map(card).join('')}
	</div>
	${footer()}
	</body>
`;
	writeFile(url, body);
}

const indexStyle = ``;
const indexPage = () => {
return `
${header({ oldest, newest, style: indexStyle, title: `Enter` })}
<table border=0 style="margin: 30 auto; width: 100%;">
	<tr>
	<td align="center" valign="middle">
	<a href="https://gallery.davidwhittemore.com/2010/04/24/montezuma_cypress_sacramento_ca.html"><img style="max-width: 100%; max-height: 100%;"
		 src="https://davidwhittemore.com/images/gallery/thumb/250/201004241555_59390002_Sacramento_MontezumaCypress.jpg"
		 border=0 align=middle></a>
</td>
	<td align="center" valign="middle">
	<a href="https://gallery.davidwhittemore.com/1992/random_porch_party.html"><img style="max-width: 100%; max-height: 100%;"
		 src="https://davidwhittemore.com/images/gallery/thumb/250/porch_party.jpg"
		 border=0 align=middle></a>
</td>
	<td align="center" valign="middle">
	<a href="https://gallery.davidwhittemore.com/1987/fall_pond.html"><img style="max-width: 100%; max-height: 100%;"
		 src="https://davidwhittemore.com/images/gallery/thumb/250/fall_fountain.jpg"
		 border=0 align=middle></a>
</td>
	<tr>
	<td align="center" valign="middle">
	<a href="https://gallery.davidwhittemore.com/1990/11/05/pat_fish_first_avenue_minneapolis.html"><img style="max-width: 100%; max-height: 100%;"
		 src="https://davidwhittemore.com/images/gallery/thumb/250/19901105_PatFirstAvenue.jpg"
		 border=0 align=middle></a>
</td>
	<td align="center" valign="middle">
	<a href="https://gallery.davidwhittemore.com/1989/01/28/ham_in_the_trellis.html"><img style="max-width: 100%; max-height: 100%;"
		 src="https://davidwhittemore.com/images/gallery/thumb/250/19890128_TrellisHam.jpg"
		 border=0 align=middle></a>
</td>
	<td align="center" valign="middle">
	<a href="https://gallery.davidwhittemore.com/1987/02/21/snake_baby.html"><img style="max-width: 100%; max-height: 100%;"
		 src="https://davidwhittemore.com/images/gallery/thumb/250/snake.jpg"
		 border=0 align=middle></a>
</td>
	<tr>
	<td align="center" valign="middle">
	<a href="https://gallery.davidwhittemore.com/1989/06/16/alex_cosby_sets_a_fire.html"><img style="max-width: 100%; max-height: 100%;"
		 src="https://davidwhittemore.com/images/gallery/thumb/250/alex_fire.jpg"
		 border=0 align=middle></a>
</td>
	<td align="center" valign="middle">
	<a href="https://gallery.davidwhittemore.com/2010/07/14/capital_teas_annapolis_md.html"><img style="max-width: 100%; max-height: 100%;"
		 src="https://davidwhittemore.com/images/gallery/thumb/250/20100713_AnnapolisCapitalTeas.jpg"
		 border=0 align=middle></a>
</td>
	<td align="center" valign="middle">
	<a href="https://gallery.davidwhittemore.com/1989/03/16/blue_cafe.html"><img style="max-width: 100%; max-height: 100%;"
		 src="https://davidwhittemore.com/images/gallery/thumb/250/19890316_CafeFlashes.jpg"
		 border=0 align=middle></a>
</td>
	<tr>
	<td align="center" valign="middle">
	<a href="https://gallery.davidwhittemore.com/1988/10/27/they_might_be_giants.html"><img style="max-width: 100%; max-height: 100%;"
		 src="https://davidwhittemore.com/images/gallery/thumb/250/19881025_TMBG2.jpg"
		 border=0 align=middle></a>
</td>
	<td align="center" valign="middle">
	<a href="https://gallery.davidwhittemore.com/1986/allison_4x5_paper_negative.html"><img style="max-width: 100%; max-height: 100%;"
		 src="https://davidwhittemore.com/images/gallery/thumb/250/allison3.jpg"
		 border=0 align=middle></a>
</td>
	<td align="center" valign="middle">
	<a href="https://gallery.davidwhittemore.com/2001/11/18/we_spin.html"><img style="max-width: 100%; max-height: 100%;"
		 src="https://davidwhittemore.com/images/gallery/thumb/250/wespin.jpg"
		 border=0 align=middle></a>
</td>
	</tr>
	</table>
${footer()}
</body>
`;
}

for (var i = 0 ; i < gallery.length ; i++) {
	const [ url, body ] = templatize(i);
	writeFile(url, body);
}
// write tag files
Object.keys(tags)?.forEach((t, idx) => {
	thumbs(`Images tagged "${t}"`, tags[t], `tags/${urlSafe(t)}.html`);
});
// write thumbnail file
thumbs(`Thumbnails`, gallery, 'thumbnails.html');

writeFile('index.html', indexPage());
