export function debounce(fn, wait) {
	let timer;
	return function (e) {
		if (timer) clearTimeout(timer);
		timer = setTimeout(fn, wait, e);
	};
}
