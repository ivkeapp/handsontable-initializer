import type Handsontable from 'handsontable';
import type moment from 'moment';

export interface HandsontableInitializerOptions {
  columns: Array<any>;
  colHeaders: Array<string>;
  hiddenColumns: { columns: number[] };
  afterSelectionEnd: (...args: any[]) => void;
  config?: Partial<Handsontable.GridSettings>;
  columnsToSum?: number[];
  columnsToAverage?: number[];
  columnsToAverageInteger?: number[];
  columnsToSumInteger?: number[];
  booleanColumnIndexes?: number[];
  countVisibleRows?: { title: string; column: number };
}

export default function initializeHandsontable(
  containerId: string,
  options: HandsontableInitializerOptions
): Handsontable;
