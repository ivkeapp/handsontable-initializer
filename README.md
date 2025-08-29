
# handsontable-initializer

> A utility to quickly initialize Handsontable tables with advanced features: filters, sums, averages, custom renderers, and more.

## What problem does it solve?
This package makes it easy to set up Handsontable tables with:
- Filter inputs in headers
- Sums and averages in the footer
- Custom renderers for numbers, dates, booleans, and more
- Support for hidden columns, selection events, and advanced configuration

## Installation

```sh
npm install handsontable-initializer
```

## Usage (ESM)

```js
import initializeHandsontable from "handsontable-initializer";

const hot = initializeHandsontable("exampleContainer", {
	columns: [
		{ data: 'name', type: 'text' },
		{ data: 'balance', type: 'text', renderer: 'formatNumberRender' }
	],
	colHeaders: ['Name', 'Balance'],
	hiddenColumns: { columns: [2, 5] },
	afterSelectionEnd: (r, c) => console.log("Selected:", r, c),
	config: { data: myData }
});
```

## Usage (Browser UMD)

```html
<script src="https://cdn.jsdelivr.net/npm/jquery"></script>
<script src="https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/moment"></script>
<script src="dist/handsontable-initializer.js"></script>
<script>
	const hot = initializeHandsontable('exampleContainer', {
		columns: [ ... ],
		colHeaders: [ ... ],
		config: { data: [ ... ] }
	});
</script>
```

## Features
- Filter inputs in headers
- Sums and averages in footer
- Custom renderers (see below)
- Boolean, integer, and date support
- Easily extendable

## Custom Renderers
You can use built-in Handsontable renderers or provide your own. Example:

```js
const columns = [
	{ data: 'balance', type: 'text', renderer: 'formatNumberRender' }
];
```

Available custom renderers:
- `formatNumberRender`
- `formatNumberWithoutColorRender`
- `dateFormat`
- `dateTimeFormat`
- `textWrapRenderer`
- `greenRenderer`
- `parentKeyLinkRenderer`
- `integerFormatterRenderer`
- `integerCeilRenderer`
- `editableColumnRenderer`
- `checkRenderer`
- `noteRenderer`
- `rendererPrice`
- `rendererPrice2`
- `blueRenderer`

## Example
See [`examples/basic.html`](examples/basic.html) for a working demo with CDN imports for jQuery, Handsontable, and your initializer.

## Contribution Guidelines
- Fork the repo, create a feature branch, and submit a pull request.
- Please add tests and update documentation for new features.

## Tribute to Handsontable

This project is built on top of the amazing [Handsontable](https://handsontable.com/) library. Handsontable is a powerful JavaScript data grid that makes working with tables and spreadsheets in web applications a joy. We deeply appreciate the work of the Handsontable team and their commitment to open source and developer experience. If you find this project useful, please consider supporting or contributing to Handsontable as well!

You can learn more and get started with Handsontable at [handsontable.com](https://handsontable.com/).

## License
MIT
