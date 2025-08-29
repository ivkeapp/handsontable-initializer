/**  
* Handsontable initializer function
* Dependencies: jQuery, Handsontable
* Author: Ivan Žarković
* Created: 29.10.2024.
* Last modified: 25.04.2025. (change this if you modify the file.)
* Version: alpha 0.2
* @param {String} containerId - The ID of the container element for the Handsontable instance
* @param {object} options - Configuration options for the Handsontable instance
* @param {Array} options.columns - Array of column definitions
* @param {Array} options.colHeaders - Array of column header labels
* @param {Array} options.hiddenColumns - Array of column indexes to hide
* @param {Function} options.afterSelectionEnd - Callback function for selection events
* @param {object} options.config - Optional overrides for default configuration settings
* @param {Array} options.columnsToSum - Optional array of column indexes to sum in the footer
* @param {Array} options.columnsToAverage - Optional array of column indexes to average in the footer
* @param {Array} options.columnsToAverageInteger - Optional array of column indexes to average in the footer
* @param {Array} options.columnsToSumInteger - Optional array of column indexes to sum as integers in the footer
* @param {Array} options.booleanColumnIndexes - Optional array of column indexes with boolean values
* @param {object} options.countVisibleRows - Optional title and index of column to show number of visible rows
*/

/** UPDATES:
 * 1. 22.01.2025. - fillHandle: false, // omogućava funkcionalnost povlačenja ("drag-and-fill") vrednosti iz selektovanog reda ili ćelije u druge redove/ćelije. Povlačenjem ručice (mali kvadrat na donjem desnom uglu selektovane ćelije) kopirate podatke na više ćelija.
 * 2. 22.01.2025. - countVisibleRows - dodata opcija za prikaz broja vidljivih redova u tabeli.
 * 3. 12.02.2025 - prikaz checkbox-ova - ako je tip kolone checkbox i ako nije postavljen renderer, koristi se Handsontable.renderers.CheckboxRenderer.
 * 4. 12.02.2025 - dodavanje afterChange callback-a
 * 5. 14.02.2025 - dodavanje beforeColumnSort callback-a, afterColumnSort callback-a i afterDeselect callback-a
 * 6. 18.02.2025 - sklonila afterChange, beforeColumnSort, afterColumnSort, afterDeselect callback-e
 * 7. 25.04.2025. - dodata opcija za prosecnu vrednost u footeru - columnsToAverageInteger
*/

// SRB - Uputstvo za korišćenje Handsontable inicijalizatora:
/*
1. Dodavanje JavaScript fajla
	- Na dnu HTML dokumenta, dodajte sledeći red kako biste učitali fajl za inicijalizaciju Handsontable komponente:
    
	<script src="/js/handsontableInitializer.js?ver={$smarty.now}"></script>
    
	- U okviru `{literal}` Smarty taga, dodajte JavaScript koji će se pokrenuti kada se dokument učita:
    
	{literal}
	<script type="text/javascript">
		$(document).ready(function(){
			// Ostatak koda ide ovde
		});
	</script>
	{/literal}

2. Inicijalizacija Handsontable tabele
	- Kreirajte konfiguraciju tabele i definišite sve potrebne kolone, zaglavlja i opcije.
	- Pozovite `initializeHandsontable` funkciju sa parametrima:

	a) Primer funkcije za inicijalizaciju:
	// Definišite funkcije za događaje selekcije (primeri): function onAfterDeselect() { console.log("Selekcija ćelija je poništena."); }

	function onAfterSelection(row, col, row2, col2, preventScrolling, selectionLayerLevel) { console.log("Selekcija počinje u redu:", row, "koloni:", col, "i završava se u redu:", row2, "koloni:", col2); }

	$(document).ready(function(){ // Dummy podaci za prikaz const data = [ { name: 'John', surname: 'Doe', ... balance: 5900.13 }, { name: 'Jane', surname: 'Smith', ... balance: 100000.55 }, // Dalji podaci... ];

		// Definišite kolone sa podacima i zaglavlja kolona
		const columns = [
			{ data: 'name', type: 'text' },
			{ data: 'surname', type: 'text' },
			// Ostale kolone...
			{ data: 'balance', type: 'text', renderer: formatNumberRender }
		];

		const colHeaders = [
			'Name', 'Surname', 'Address', 'Postal Code', 'Unique ID', 'Passport ID',
			'Age', 'Gender', 'Phone', 'City', 'State', 'Country', 'Balance'
		];

		// Inicijalizacija Handsontable instance
		initializeHandsontable('exampleContainer', {
			columns: columns,
			colHeaders: colHeaders,
			hiddenColumns: { columns: [4, 5] }, // Sakriva kolone po potrebi
			afterSelectionEnd: function(row, col, row2, col2) {
				console.log('Selekcija završena na:', row, col, row2, col2);
				const selectedRowData = this.getDataAtRow(row);
				console.log(selectedRowData, 'Izabrani podaci za red');
				const selectedRangeData = this.getData(row, col, row2, col2);
				console.log(selectedRangeData, 'Podaci za izabrani opseg');
			},
			config: {
				data: data,                         
				rowHeaders: false,                  
				stretchH: 'all',                    
				viewportColumnRenderingOffset: 5,   
				viewportRowRenderingOffset: 50,     
				afterDeselect: onAfterDeselect,     
				afterSelection: onAfterSelection    
			}
		});
	});
	3. Dostupni renderi i prilagođeni render
	- Kroz `columns` konfiguraciju možete koristiti podrazumevane Handsontable rendere kao što su: `TextRenderer`, `NumericRenderer`, i slično.
	- Ukoliko nije postavljen renderer u koloni, koristiće se podrazumevani `TextRenderer`.
	- Ako je potreban prilagođeni renderer, navedite ga unutar definicije kolone, kao u primeru `renderer: formatNumberRender`.
*/

function initializeHandsontable(containerId, {
	columns,                      // Required
	colHeaders,                   // Required
	hiddenColumns,                // Required
	afterSelectionEnd,            // Required
	config = {},                  // Optional overrides for defaults
	columnsToSum = [],            // Optional columns to sum
	columnsToAverage = [],        // Optional columns to average
	columnsToAverageInteger = [], // Optional columns to average as integers
	columnsToSumInteger = [],     // Optional columns to sum as integers
	booleanColumnIndexes = [],    // Optional columns with boolean values
	countVisibleRows = {},        // Optional column to show number of visible rows
}) {
	// Initialize elements and event listeners for filter inputs in headers
	var getInitializedElements = function(colIndex) {
		var div = document.createElement('div');
		var input = document.createElement('input');
		input.className = 'filter-input';
		input.addEventListener('click', function(e) {
			e.stopPropagation();
			$(this).focus();
		});
		div.className = 'filterHeader';
		addEventListeners(input, colIndex);
		div.appendChild(input);
		return div;
	};

	var addInput = function(col, TH) {
		if (typeof col !== 'number' || col < 0 || TH.querySelector('.filter-input')) return;
		TH.appendChild(getInitializedElements(col));
	};

	var doNotSelectColumn = function(event, coords) {
		if (coords.row === -1 && event.realTarget.nodeName === 'INPUT') {
			event.stopImmediatePropagation();
			this.deselectCell();
		}
		if (coords.row === -1 && event.realTarget.nodeName !== 'SPAN') {
			event.stopImmediatePropagation();
			this.deselectCell();
		}
	};

	const isEmptyObject = function(obj) {
		return Object.keys(obj).length === 0 && obj.constructor === Object;
	}

	// Define calculateFooterSums after hot is initialized
	const calculateFooterSums = function(ht) {
		const data = ht.getData();
		const filteredData = data.filter(row => row.some(cell => cell !== null));

		// Calculate sums for each column specified in columnsToSum
		columnsToSum.forEach(columnIndex => {
			const columnSum = filteredData.reduce((acc, row) => acc + (parseFloat(row[columnIndex]) || 0), 0);
			const footerCell = ht.rootElement.querySelector(`.sumCol-${columnIndex}`);
			if (footerCell) {
				footerCell.textContent = parseFloat(columnSum).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
			}
		});

		// Calculate averages for each column specified in columnsToAverage
		columnsToAverage.forEach(columnIndex => {
			let sum = 0;
			let count = 0;

			filteredData.forEach(row => {
				const value = parseFloat(row[columnIndex]);
				if (!isNaN(value)) {
					sum += value;
					count++;
				}
			});

			const average = count > 0 ? (sum / count).toFixed(2) : 0; // Avoid division by zero
			const footerCell = ht.rootElement.querySelector(`.avgCol-${columnIndex}`);
			if (footerCell) {
				footerCell.textContent = 'Prosečno: ' + parseFloat(average).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
			}
		});
        
		// Calculate averages for each column specified in columnsToAverageInteger
		columnsToAverageInteger.forEach(columnIndex => {
			let sum = 0;
			let count = 0;

			filteredData.forEach(row => {
				const value = parseFloat(row[columnIndex]);
				if (!isNaN(value)) {
					sum += value;
					count++;
				}
			});

			const average = count > 0 ? (sum / count) : 0; // Avoid division by zero
			const footerCell = ht.rootElement.querySelector(`.avgCol-${columnIndex}`);
			if (footerCell) {
				footerCell.textContent = 'Prosečno: ' + parseInt(average);
			}
		});

		// Calculate sums for each column specified in columnsToSumInteger
		columnsToSumInteger.forEach(columnIndex => {
			const columnSum = filteredData.reduce((acc, row) => acc + (parseInt(row[columnIndex]) || 0), 0);
			const footerCell = ht.rootElement.querySelector(`.sumCol-${columnIndex}`);
			if (footerCell) {
				footerCell.textContent = columnSum;
			}
		});

		// Calculate the number of visible rows if countVisibleRows is not null
		if(!isEmptyObject(countVisibleRows)) {
			const footerCell = ht.rootElement.querySelector(`.countRows`);
			if (footerCell) {
				footerCell.textContent = countVisibleRows.title + ht.getData().length;
			}
		}
	};

	// var debounceFn = Handsontable.helper.debounce(function(colIndex, event) {
	//     var column = hot.getSourceDataAtCol(colIndex)[0];
	//     var filtersPlugin = hot.getPlugin('filters');
	//     filtersPlugin.removeConditions(colIndex);
	//     if (typeof(column) == 'number') {
	//         filtersPlugin.addCondition(colIndex, 'begins_with', [event.realTarget.value]);
	//     } else {
	//         filtersPlugin.addCondition(colIndex, 'contains', [event.realTarget.value]);
	//     }
	//     filtersPlugin.filter();
	// }, 200);

	// Check if the formula is valid and return the formula stack - new version 30.10.2024.
	var debounceFn = Handsontable.helper.debounce(function(colIndex, event) {
		var column = hot.getSourceDataAtCol(colIndex)[0];
		var filtersPlugin = hot.getPlugin('filters');
		filtersPlugin.removeConditions(colIndex);

		if (typeof(column) == 'number') {
			if (booleanColumnIndexes.includes(colIndex)) {
				if (event.realTarget.value.toLowerCase() === 'da') {
					filtersPlugin.addCondition(colIndex, 'begins_with', ['1']);
				} else if (event.realTarget.value.toLowerCase() === 'ne') {
					filtersPlugin.addCondition(colIndex, 'begins_with', ['0']);
				}
			} else {
				filtersPlugin.addCondition(colIndex, 'begins_with', [event.realTarget.value]);
			}
		} else {
			filtersPlugin.addCondition(colIndex, 'contains', [event.realTarget.value]);
		}

		filtersPlugin.filter();
	}, 200); 

	function addEventListeners(input, colIndex) {
		input.addEventListener('keydown', function(event) {
			$('.filter-btn').removeClass('filter-btn-active');
			debounceFn(colIndex, event);
		});
	}

	// Default renderers for Handsontable
	const defaultRenderers = {
		text: Handsontable.renderers.TextRenderer,
		numeric: Handsontable.renderers.NumericRenderer,
		checkbox: Handsontable.renderers.CheckboxRenderer,
		date: Handsontable.renderers.DateRenderer,
		formatNumberRender: formatNumberRender,
		formatNumberWithoutColorRender:formatNumberWithoutColorRender,
		dateFormat: dateFormat,
		dateTimeFormat: dateTimeFormat,
		textWrapRenderer: textWrapRenderer,
		greenRenderer: greenRenderer,
		parentKeyLinkRenderer: parentKeyLinkRenderer,
		integerFormatterRenderer: integerFormatterRenderer,
		integerCeilRenderer: integerCeilRenderer,
		editableColumnRenderer: editableColumnRenderer,
		checkRenderer: checkRenderer,
		noteRenderer: noteRenderer,
		rendererPrice: rendererPrice,
		rendererPrice2: rendererPrice2,
		blueRenderer: blueRenderer,
	};

	// Default configuration settings
	const defaultConfig = {
		data: [],
		rowHeaders: false,
		manualColumnResize: true,
		manualRowResize: true,
		manualColumnMove: true,
		outsideClickDeselects: false,
		manualRowMove: true,
		columnSorting: true,
		renderAllRows: false,
		sortIndicator: true,
		filters: true,
		fillHandle: false, // onemogucava pejstovanje prilikom razvlacenja celija
		stretchH: 'none',
		viewportColumnRenderingOffset: 10,
		viewportRowRenderingOffset: 10,
		selectionMode: 'multiple',
		dropdownMenu: ['make_read_only', '---------', 'alignment', '---------', 'filter_by_condition', 'filter_by_value', 'filter_action_bar'],
		currentRowClassName: 'currentRow',
		className: 'table-header-filters',
		beforeOnCellMouseDown: doNotSelectColumn,
		afterGetColHeader: addInput,
		beforeKeyDown: function(event) {
			if (event.keyCode === 46 || event.keyCode === 8) {
				Handsontable.Dom.stopImmediatePropagation(event);
			}
			if ((event.ctrlKey && event.keyCode == 88) || (event.ctrlKey && event.keyCode === 86)) {
				event.isImmediatePropagationEnabled = false;
				event.preventDefault();
			}
		},
		outsideClickDeselects: function(target) {
			let element = target;
			while (element) {
				if (element.classList && element.classList.contains('doNotDeselect')) {
					return false; // Disable deselection when clicking on elements with the class 'doNotDeselect'
				}
				element = element.parentElement;
			}
			hot.deselectCell();
		},
		afterFilter: function(formulaStack) {
			if(myFormulas !== undefined) {
				myFormulas = checkArgs(formulaStack);
				if(myFormulas.length !=0 ){
					$('.createFilters').removeAttr('disabled');
					$('.resetFiltersBtn').removeAttr('disabled');
				}else {
					$('.createFilters').attr('disabled','disabled');
					$('.resetFiltersBtn').attr('disabled','disabled');
				}
			}
			if(columnsToAverage.length > 0 || columnsToSum.length > 0 || columnsToSumInteger.length > 0 || columnsToAverageInteger.length > 0) calculateFooterSums(this); // Recalculate sums after filtering
		},
		afterInit: function() {
			if(columnsToAverage.length > 0 || columnsToSum.length > 0 || columnsToSumInteger.length > 0 || columnsToAverageInteger.length > 0 || !isEmptyObject(countVisibleRows)) {
				const ht = this;
				const footer = document.createElement('tfoot');
				const tr = document.createElement('tr');
        
				// Create empty <td> elements for sums and averages
				for (let i = 0; i < ht.countCols(); i++) {
					const td = document.createElement('td');
        
					// If countVisibleRows is set, add a class for easy selection
					if(i == countVisibleRows.column) { // If the column index is the countVisibleRows index, add a class for showing the number of visible rows
						td.className = `countRows`;
						td.style.background = '#d1e7ff';
					}

					// If the column index is in columnsToSum, add a class for easy selection
					if (columnsToSum.includes(i)) {
						td.className = `sumCol-${i} htRight`;
						td.style.background = '#bff2b6';
					}
                    
					// If the column index is in columnsToAverage, add a class for easy selection
					if (columnsToAverage.includes(i)) {
						td.className = `avgCol-${i} htRight`;
						td.style.background = '#d1e7ff'; // Different background for averages
					}

					// If the column index is in columnsToAverageInteger, add a class for easy selection
					if (columnsToAverageInteger.includes(i)) {
						td.className = `avgCol-${i} htRight`;
						td.style.background = '#d1e7ff'; // Different background for averages
					}

					// If the column index is in columnsToSumInteger, add a class for easy selection
					if (columnsToSumInteger.includes(i)) {
						td.className = `sumCol-${i} htRight`;
						td.style.background = '#bff2b6';
					}
        
					tr.appendChild(td);
				}
        
				footer.appendChild(tr);
				ht.rootElement.querySelector('.htCore').appendChild(footer);
        
				// Calculate initial footer sums and averages
				calculateFooterSums(ht);
			}
		},
	};

	// Combine defaults with required parameters and any additional configuration overrides
	const mergedConfig = Object.assign({}, defaultConfig, config, {
		columns: columns.map(col => {
			// prikaz checkbox-ova:
			if (col.type === 'checkbox' && !col.renderer) {
				col.renderer = Handsontable.renderers.CheckboxRenderer;
			}

			return {
				...col,
				renderer: defaultRenderers[col.renderer] || col.renderer || Handsontable.renderers.TextRenderer
			};
		}),
		colHeaders: colHeaders,
		hiddenColumns: hiddenColumns,
		afterSelectionEnd: config.afterSelectionEnd || afterSelectionEnd,
		// Combine default and custom afterFilter callbacks
		afterFilter: function(formulaStack) {
			// Execute default afterFilter behavior
			defaultConfig.afterFilter.call(this, formulaStack);

			// Execute custom afterFilter behavior, if provided
			if (typeof config.afterFilter === 'function') {
				config.afterFilter.call(this, formulaStack);
			}
		}
	});

	// Find the container element by ID
	const container = document.getElementById(containerId);

	// Log an error if the container element is not found and return null
	if (!container) {
		console.error(`Container with ID ${containerId} not found.`);
		return null;
	}

	// Initialize Handsontable with the combined configuration
	const hot = new Handsontable(container, mergedConfig);

	return hot;
}

////////////////////////////////////////////////////////////////////////
///////////////////////////////RENDERERS////////////////////////////////
////////////////////////////////////////////////////////////////////////

// Custom renderer for date only format
function dateFormat(instance, td, row, col, prop, value, cellProperties) {
	var escaped = Handsontable.helper.stringify(value);
	if (escaped !== '') {
		td.innerHTML = moment(escaped).format("YYYY-MM-DD");
	} else {
		Handsontable.renderers.TextRenderer.apply(this, arguments);
	}
	return td;
}

// Custom renderer for date and time format
function dateTimeFormat(instance, td, row, col, prop, value, cellProperties) {
	var escaped = Handsontable.helper.stringify(value);
	if (escaped !== '') {
		td.innerHTML = moment(escaped).format("YYYY-MM-DD HH:mm");
	} else {
		Handsontable.renderers.TextRenderer.apply(this, arguments);
	}
	return td;
}

// Custom text wrap renderer
function textWrapRenderer (instance, td, row, col, prop, value, cellProperties) {
	var escaped = Handsontable.helper.stringify(value), img;
	td.style = 'text-overflow: ellipsis; cursor: help;';
	td.className = 'htNoWrap';
	$(td).attr('title', escaped);
	td.innerHTML = escaped;

	return td;
}

// Custom renderer for green background
function greenRenderer(instance, td, row, col, prop, value, cellProperties) {
	var escaped = Handsontable.helper.stringify(value);
	td.innerHTML = escaped;
	td.style.background = '#e8f9e5';    

	return td;
}

// Custom renderer for sales history
function parentKeyLinkRenderer(instance, td, row, col, prop, value, cellProperties) {
	var escaped = Handsontable.helper.stringify(value);
	td.innerHTML = "<span class='show-lager-reservation' data-key=" + escaped + ">" + escaped + "</span>";

	return td;
}

// Custom renderer for integer formatting - rounds down
function integerFormatterRenderer(instance, td, row, col, prop, value, cellProperties) {
	// Check if the value is a number
	if (typeof value === 'number') {
		// Removes decimals
		value = Math.floor(value);
	} else if (typeof value === 'string') {
		// Check if the value is a number and parse string to number
		value = parseFloat(value.replace(',', ''));
		if (isNaN(value)) {
			return value; // Returns original value if not a number or string
		} else {
			// Removes decimals
			value = Math.floor(value);
		}
	} else {
		return value; // Returns original value if not a number or string
	} 
	td.className = 'htRight htMiddle';
	// Returns the formatted value
	td.innerHTML = value;
	return td;
}

// Custom renderer for integer ceil
function integerCeilRenderer(instance, td, row, col, prop, value, cellProperties) {
	// Check the value type and remove any non-numeric characters if it's a string
	if (typeof value === 'string') {
		// Remove all but numbers, dots and minus sign
		value = value.replace(/[^0-9.\-]/g, '');
	}

	// Parse the value to a number or 0 if it's not a number
	value = parseFloat(value) || 0;

	// Round the number to the nearest integer and convert it to a string without decimal places
	value = Math.ceil(value).toString();
	td.className = "htRight";
	td.innerHTML = value;
	return td;
}

// Custom renderer for editable column
function editableColumnRenderer(instance, td, row, col, prop, value, cellProperties) {
	var escaped = Handsontable.helper.stringify(value);
	td.innerHTML = escaped;
	td.style.background = '#e8f9e5';
	td.className = 'htRight editableColumn';

	return td;
}

// Custom checkbox renderer (displaying a checkmark or a cross icon)
function checkRenderer(instance, td, row, col, prop, value, cellProperties) {
   var escaped = Handsontable.helper.stringify(value);
   td.className="htMiddle htCenter";
	 if (escaped == 1) {
	   td.innerHTML = '<i style="color:#73c164;" class="fas fa-check"></i>';
   } else {
	   // Render as text
	  td.innerHTML= '<i style="color:#ff0000;" class="fas fa-times"></i>';
   }
   return td;
}

// Custom note renderer (displaying a comment icon)
function noteRenderer(instance, td, row, col, prop, value, cellProperties) {
   var escaped = Handsontable.helper.stringify(value);
   td.style = "cursor:help";

   if (!escaped) {
	   td.innerHTML = '';
   } else {
	   td.setAttribute('title', escaped);
	   td.className = 'htMiddle htCenter';
	   td.innerHTML = '<i class="fas fa-comment table-icon icon-light-blue"></i>';
   }

   return td;
}

// Custom price renderer (2 decimal places, comma as thousands separator) - two types  
var rendererPrice = function(data, type, row, meta){
	data = parseFloat(data).toFixed(2).replace(',', '.').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
	return data;
}
var rendererPrice2 = function(data, type, row, meta) {
	data = parseFloat(data).toFixed(2);
	return data;
};

// Custom renderer for blue background
function blueRenderer(instance, td, row, col, prop, value, cellProperties) {
   var escaped = Handsontable.helper.stringify(value);
   td.innerHTML = '<div class="custom-editable-col">'+escaped+'</div>';
   td.style = 'width: 100%;';
   td.style.background = '#e8f0fd';
   td.className = 'htMiddle';

   return td;
}

// Custom renderer for number format with 2 decimal places and comma as thousands separator and green background
function formatNumberRender(instance, td, row, col, prop, value, cellProperties) {
	var escaped = Handsontable.helper.stringify(value);
	td.className = 'htRight htMiddle';
	td.style.backgroundColor = '#e8f9e5';
	td.innerHTML = parseFloat(escaped).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
	return td;
}
function formatNumberWithoutColorRender(instance, td, row, col, prop, value, cellProperties) {
	var escaped = Handsontable.helper.stringify(value);
	td.className = 'htRight htMiddle';
	td.innerHTML = parseFloat(escaped).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
	return td;
}
// Custom renderer for number format with 2 decimal places and comma as thousands separator and green background
function formatFooterNumber(td, value) {
	// var escaped = Handsontable.helper.stringify(value);
	td.className = 'htRight htMiddle';
	td.textContent = parseFloat(value).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
	// return td;
}

export default initializeHandsontable;
