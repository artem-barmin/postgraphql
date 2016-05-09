'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _dataloader = require('dataloader');

var _dataloader2 = _interopRequireDefault(_dataloader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * Creates a resolver for querying a single value.
 *
 * The last parameter, `getColumnValues` is a function which gets `source` and
 * `args` and returns values for each of the second argument’s columns.
 *
 * @param {Table} table - The table we will be selecting from.
 * @param {Column[]} columns - The columns which will be filtered against.
 * @param {Function} getColumnValues - A function to get values for columns.
 * @returns {Function} - A function to be fed into `resolve`.
 */
const resolveTableSingle = (table, columns, getColumnValues) => {
  if (columns.length === 0) throw new Error('To resolve a single row, some columns must be used.');

  const queryTuple = `(${ columns.map(column => `"${ column.table.schema.name }"."${ column.table.name }"."${ column.name }"`).join(', ') })`;

  // We aren’t using the `sql` module here because the most efficient way to
  // run this query is with the `= any (…)` field. This feature is PostgreSQL
  // specific and can’t be done with `sql`.
  const query = {
    name: `${ table.schema.name }_${ table.name }_single`,
    text: `select * from "${ table.schema.name }"."${ table.name }" where ${ queryTuple } = any ($1)`
  };

  // Because we don’t want to run 30+ SQL queries to fetch single rows if we
  // are fetching relations for a list, we optimize with a `DataLoader`.
  //
  // Note that there is a performance penalty in that if we are selecting 100+
  // rows we will have to run an aggregate `find` method for each row that was
  // queried. However, this is still much better than running 100+ SQL queries.
  // In addition, if we are selecting a lot of repeats, we can memoize this
  // operation.
  //
  // This is a memoized function because we don’t have another way of
  // accessing `client` which is local to the resolution context.
  const getDataLoader = (0, _lodash.memoize)(client => new _dataloader2['default']((() => {
    var ref = _asyncToGenerator(function* (columnValueses) {
      // Query the client with our list of column values and prepared query.
      // Results can be returned in any order.

      var _ref = yield client.queryAsync({
        name: query.name,
        text: query.text,
        values: [columnValueses]
      });

      const rowCount = _ref.rowCount;
      const rows = _ref.rows;

      // Gets the row from the result set given a few column values.

      let getRow = function getRow(columnValues) {
        return rows.find(function (row) {
          return (0, _lodash.every)(columns.map(function (_ref2, i) {
            let name = _ref2.name;
            return String(row[name]) === String(columnValues[i]);
          }));
        });
      };

      // If there are 25% less values in our result set then this means there are
      // some duplicates and memoizing `getRow` could cause some performance gains.
      //
      // Note that this memoization should be tinkered with in the future to
      // determine the best memoization tradeoffs.
      if (columnValueses.length * 0.75 >= rowCount) getRow = (0, _lodash.memoize)(getRow, function (columnValues) {
        return columnValues.join(',');
      });

      return columnValueses.map(getRow);
    });

    return function (_x) {
      return ref.apply(this, arguments);
    };
  })()));

  // Make sure we use a `WeakMap` for the cache so old `Client`s are not held
  // in memory.
  getDataLoader.cache = new WeakMap();

  return (() => {
    var ref = _asyncToGenerator(function* (source, args, _ref3) {
      let client = _ref3.client;

      const values = getColumnValues(source, args);
      if (!values) return null;
      const row = yield getDataLoader(client).load(values);
      if (!row) return row;
      row.table = table;
      return row;
    });

    return function (_x2, _x3, _x4) {
      return ref.apply(this, arguments);
    };
  })();
};

exports['default'] = resolveTableSingle;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ncmFwaHFsL3Jlc29sdmVUYWJsZVNpbmdsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWFBLE1BQU0scUJBQXFCLENBQUMsS0FBRCxFQUFRLE9BQVIsRUFBaUIsZUFBakIsS0FBcUM7QUFDOUQsTUFBSSxRQUFRLE1BQVIsS0FBbUIsQ0FBdkIsRUFDRSxNQUFNLElBQUksS0FBSixDQUFVLHFEQUFWLENBQU47O0FBRUYsUUFBTSxhQUNKLENBQUMsQ0FBRCxHQUFJLFFBQVEsR0FBUixDQUFZLFVBQ2QsQ0FBQyxDQUFELEdBQUksT0FBTyxLQUFQLENBQWEsTUFBYixDQUFvQixJQUF4QixFQUE2QixHQUE3QixHQUFrQyxPQUFPLEtBQVAsQ0FBYSxJQUEvQyxFQUFvRCxHQUFwRCxHQUF5RCxPQUFPLElBQWhFLEVBQXFFLENBQXJFLENBREUsRUFFRixJQUZFLENBRUcsSUFGSCxDQUFKLEVBRWEsQ0FGYixDQURGOzs7OztBQVFBLFFBQU0sUUFBUTtBQUNaLFVBQU0sQ0FBQyxBQUFELEdBQUcsTUFBTSxNQUFOLENBQWEsSUFBaEIsRUFBcUIsQ0FBckIsR0FBd0IsTUFBTSxJQUE5QixFQUFtQyxPQUFuQyxDQURNO0FBRVosVUFBTSxDQUFDLGVBQUQsR0FBa0IsTUFBTSxNQUFOLENBQWEsSUFBL0IsRUFBb0MsR0FBcEMsR0FBeUMsTUFBTSxJQUEvQyxFQUFvRCxRQUFwRCxHQUE4RCxVQUE5RCxFQUF5RSxXQUF6RTtBQUZNLEdBQWQ7Ozs7Ozs7Ozs7Ozs7QUFnQkEsUUFBTSxnQkFBZ0IscUJBQVEsVUFBVTtBQUFBLGdDQUFlLFdBQU0sY0FBTixFQUF3Qjs7OztBQUFBLGlCQUdsRCxNQUFNLE9BQU8sVUFBUCxDQUFrQjtBQUNqRCxjQUFNLE1BQU0sSUFEcUM7QUFFakQsY0FBTSxNQUFNLElBRnFDO0FBR2pELGdCQUFRLENBQUMsY0FBRDtBQUh5QyxPQUFsQixDQUg0Qzs7QUFBQSxZQUdyRSxRQUhxRSxRQUdyRSxRQUhxRTtBQUFBLFlBRzNELElBSDJELFFBRzNELElBSDJEOzs7O0FBVTdFLFVBQUksU0FBUztBQUFBLGVBQWdCLEtBQUssSUFBTCxDQUFVO0FBQUEsaUJBQ3JDLG1CQUFNLFFBQVEsR0FBUixDQUFZLGlCQUFXLENBQVg7QUFBQSxnQkFBRyxJQUFILFNBQUcsSUFBSDtBQUFBLG1CQUFpQixPQUFPLElBQUksSUFBSixDQUFQLE1BQXNCLE9BQU8sYUFBYSxDQUFiLENBQVAsQ0FBdkM7QUFBQSxXQUFaLENBQU4sQ0FEcUM7QUFBQSxTQUFWLENBQWhCO0FBQUEsT0FBYjs7Ozs7OztBQVNBLFVBQUksZUFBZSxNQUFmLEdBQXdCLElBQXhCLElBQWdDLFFBQXBDLEVBQ0UsU0FBUyxxQkFBUSxNQUFSLEVBQWdCO0FBQUEsZUFBZ0IsYUFBYSxJQUFiLENBQWtCLEdBQWxCLENBQWhCO0FBQUEsT0FBaEIsQ0FBVDs7QUFFRixhQUFPLGVBQWUsR0FBZixDQUFtQixNQUFuQixDQUFQO0FBQ0QsS0F2QnVDOztBQUFBO0FBQUE7QUFBQTtBQUFBLE9BQWxCLENBQXRCOzs7O0FBMkJBLGdCQUFjLEtBQWQsR0FBc0IsSUFBSSxPQUFKLEVBQXRCOztBQUVBO0FBQUEsZ0NBQU8sV0FBTyxNQUFQLEVBQWUsSUFBZixTQUFvQztBQUFBLFVBQWIsTUFBYSxTQUFiLE1BQWE7O0FBQ3pDLFlBQU0sU0FBUyxnQkFBZ0IsTUFBaEIsRUFBd0IsSUFBeEIsQ0FBZjtBQUNBLFVBQUksQ0FBQyxNQUFMLEVBQWEsT0FBTyxJQUFQO0FBQ2IsWUFBTSxNQUFNLE1BQU0sY0FBYyxNQUFkLEVBQXNCLElBQXRCLENBQTJCLE1BQTNCLENBQWxCO0FBQ0EsVUFBSSxDQUFDLEdBQUwsRUFBVSxPQUFPLEdBQVA7QUFDVixVQUFJLEtBQUosR0FBWSxLQUFaO0FBQ0EsYUFBTyxHQUFQO0FBQ0QsS0FQRDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVFELENBakVEOztxQkFtRWUsa0IiLCJmaWxlIjoicmVzb2x2ZVRhYmxlU2luZ2xlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbWVtb2l6ZSwgZXZlcnkgfSBmcm9tICdsb2Rhc2gnXG5pbXBvcnQgRGF0YUxvYWRlciBmcm9tICdkYXRhbG9hZGVyJ1xuXG4vKipcbiAqIENyZWF0ZXMgYSByZXNvbHZlciBmb3IgcXVlcnlpbmcgYSBzaW5nbGUgdmFsdWUuXG4gKlxuICogVGhlIGxhc3QgcGFyYW1ldGVyLCBgZ2V0Q29sdW1uVmFsdWVzYCBpcyBhIGZ1bmN0aW9uIHdoaWNoIGdldHMgYHNvdXJjZWAgYW5kXG4gKiBgYXJnc2AgYW5kIHJldHVybnMgdmFsdWVzIGZvciBlYWNoIG9mIHRoZSBzZWNvbmQgYXJndW1lbnTigJlzIGNvbHVtbnMuXG4gKlxuICogQHBhcmFtIHtUYWJsZX0gdGFibGUgLSBUaGUgdGFibGUgd2Ugd2lsbCBiZSBzZWxlY3RpbmcgZnJvbS5cbiAqIEBwYXJhbSB7Q29sdW1uW119IGNvbHVtbnMgLSBUaGUgY29sdW1ucyB3aGljaCB3aWxsIGJlIGZpbHRlcmVkIGFnYWluc3QuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBnZXRDb2x1bW5WYWx1ZXMgLSBBIGZ1bmN0aW9uIHRvIGdldCB2YWx1ZXMgZm9yIGNvbHVtbnMuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IC0gQSBmdW5jdGlvbiB0byBiZSBmZWQgaW50byBgcmVzb2x2ZWAuXG4gKi9cbmNvbnN0IHJlc29sdmVUYWJsZVNpbmdsZSA9ICh0YWJsZSwgY29sdW1ucywgZ2V0Q29sdW1uVmFsdWVzKSA9PiB7XG4gIGlmIChjb2x1bW5zLmxlbmd0aCA9PT0gMClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RvIHJlc29sdmUgYSBzaW5nbGUgcm93LCBzb21lIGNvbHVtbnMgbXVzdCBiZSB1c2VkLicpXG5cbiAgY29uc3QgcXVlcnlUdXBsZSA9XG4gICAgYCgke2NvbHVtbnMubWFwKGNvbHVtbiA9PlxuICAgICAgYFwiJHtjb2x1bW4udGFibGUuc2NoZW1hLm5hbWV9XCIuXCIke2NvbHVtbi50YWJsZS5uYW1lfVwiLlwiJHtjb2x1bW4ubmFtZX1cImBcbiAgICApLmpvaW4oJywgJyl9KWBcblxuICAvLyBXZSBhcmVu4oCZdCB1c2luZyB0aGUgYHNxbGAgbW9kdWxlIGhlcmUgYmVjYXVzZSB0aGUgbW9zdCBlZmZpY2llbnQgd2F5IHRvXG4gIC8vIHJ1biB0aGlzIHF1ZXJ5IGlzIHdpdGggdGhlIGA9IGFueSAo4oCmKWAgZmllbGQuIFRoaXMgZmVhdHVyZSBpcyBQb3N0Z3JlU1FMXG4gIC8vIHNwZWNpZmljIGFuZCBjYW7igJl0IGJlIGRvbmUgd2l0aCBgc3FsYC5cbiAgY29uc3QgcXVlcnkgPSB7XG4gICAgbmFtZTogYCR7dGFibGUuc2NoZW1hLm5hbWV9XyR7dGFibGUubmFtZX1fc2luZ2xlYCxcbiAgICB0ZXh0OiBgc2VsZWN0ICogZnJvbSBcIiR7dGFibGUuc2NoZW1hLm5hbWV9XCIuXCIke3RhYmxlLm5hbWV9XCIgd2hlcmUgJHtxdWVyeVR1cGxlfSA9IGFueSAoJDEpYCxcbiAgfVxuXG4gIC8vIEJlY2F1c2Ugd2UgZG9u4oCZdCB3YW50IHRvIHJ1biAzMCsgU1FMIHF1ZXJpZXMgdG8gZmV0Y2ggc2luZ2xlIHJvd3MgaWYgd2VcbiAgLy8gYXJlIGZldGNoaW5nIHJlbGF0aW9ucyBmb3IgYSBsaXN0LCB3ZSBvcHRpbWl6ZSB3aXRoIGEgYERhdGFMb2FkZXJgLlxuICAvL1xuICAvLyBOb3RlIHRoYXQgdGhlcmUgaXMgYSBwZXJmb3JtYW5jZSBwZW5hbHR5IGluIHRoYXQgaWYgd2UgYXJlIHNlbGVjdGluZyAxMDArXG4gIC8vIHJvd3Mgd2Ugd2lsbCBoYXZlIHRvIHJ1biBhbiBhZ2dyZWdhdGUgYGZpbmRgIG1ldGhvZCBmb3IgZWFjaCByb3cgdGhhdCB3YXNcbiAgLy8gcXVlcmllZC4gSG93ZXZlciwgdGhpcyBpcyBzdGlsbCBtdWNoIGJldHRlciB0aGFuIHJ1bm5pbmcgMTAwKyBTUUwgcXVlcmllcy5cbiAgLy8gSW4gYWRkaXRpb24sIGlmIHdlIGFyZSBzZWxlY3RpbmcgYSBsb3Qgb2YgcmVwZWF0cywgd2UgY2FuIG1lbW9pemUgdGhpc1xuICAvLyBvcGVyYXRpb24uXG4gIC8vXG4gIC8vIFRoaXMgaXMgYSBtZW1vaXplZCBmdW5jdGlvbiBiZWNhdXNlIHdlIGRvbuKAmXQgaGF2ZSBhbm90aGVyIHdheSBvZlxuICAvLyBhY2Nlc3NpbmcgYGNsaWVudGAgd2hpY2ggaXMgbG9jYWwgdG8gdGhlIHJlc29sdXRpb24gY29udGV4dC5cbiAgY29uc3QgZ2V0RGF0YUxvYWRlciA9IG1lbW9pemUoY2xpZW50ID0+IG5ldyBEYXRhTG9hZGVyKGFzeW5jIGNvbHVtblZhbHVlc2VzID0+IHtcbiAgICAvLyBRdWVyeSB0aGUgY2xpZW50IHdpdGggb3VyIGxpc3Qgb2YgY29sdW1uIHZhbHVlcyBhbmQgcHJlcGFyZWQgcXVlcnkuXG4gICAgLy8gUmVzdWx0cyBjYW4gYmUgcmV0dXJuZWQgaW4gYW55IG9yZGVyLlxuICAgIGNvbnN0IHsgcm93Q291bnQsIHJvd3MgfSA9IGF3YWl0IGNsaWVudC5xdWVyeUFzeW5jKHtcbiAgICAgIG5hbWU6IHF1ZXJ5Lm5hbWUsXG4gICAgICB0ZXh0OiBxdWVyeS50ZXh0LFxuICAgICAgdmFsdWVzOiBbY29sdW1uVmFsdWVzZXNdLFxuICAgIH0pXG5cbiAgICAvLyBHZXRzIHRoZSByb3cgZnJvbSB0aGUgcmVzdWx0IHNldCBnaXZlbiBhIGZldyBjb2x1bW4gdmFsdWVzLlxuICAgIGxldCBnZXRSb3cgPSBjb2x1bW5WYWx1ZXMgPT4gcm93cy5maW5kKHJvdyA9PlxuICAgICAgZXZlcnkoY29sdW1ucy5tYXAoKHsgbmFtZSB9LCBpKSA9PiBTdHJpbmcocm93W25hbWVdKSA9PT0gU3RyaW5nKGNvbHVtblZhbHVlc1tpXSkpKVxuICAgIClcblxuICAgIC8vIElmIHRoZXJlIGFyZSAyNSUgbGVzcyB2YWx1ZXMgaW4gb3VyIHJlc3VsdCBzZXQgdGhlbiB0aGlzIG1lYW5zIHRoZXJlIGFyZVxuICAgIC8vIHNvbWUgZHVwbGljYXRlcyBhbmQgbWVtb2l6aW5nIGBnZXRSb3dgIGNvdWxkIGNhdXNlIHNvbWUgcGVyZm9ybWFuY2UgZ2FpbnMuXG4gICAgLy9cbiAgICAvLyBOb3RlIHRoYXQgdGhpcyBtZW1vaXphdGlvbiBzaG91bGQgYmUgdGlua2VyZWQgd2l0aCBpbiB0aGUgZnV0dXJlIHRvXG4gICAgLy8gZGV0ZXJtaW5lIHRoZSBiZXN0IG1lbW9pemF0aW9uIHRyYWRlb2Zmcy5cbiAgICBpZiAoY29sdW1uVmFsdWVzZXMubGVuZ3RoICogMC43NSA+PSByb3dDb3VudClcbiAgICAgIGdldFJvdyA9IG1lbW9pemUoZ2V0Um93LCBjb2x1bW5WYWx1ZXMgPT4gY29sdW1uVmFsdWVzLmpvaW4oJywnKSlcblxuICAgIHJldHVybiBjb2x1bW5WYWx1ZXNlcy5tYXAoZ2V0Um93KVxuICB9KSlcblxuICAvLyBNYWtlIHN1cmUgd2UgdXNlIGEgYFdlYWtNYXBgIGZvciB0aGUgY2FjaGUgc28gb2xkIGBDbGllbnRgcyBhcmUgbm90IGhlbGRcbiAgLy8gaW4gbWVtb3J5LlxuICBnZXREYXRhTG9hZGVyLmNhY2hlID0gbmV3IFdlYWtNYXAoKVxuXG4gIHJldHVybiBhc3luYyAoc291cmNlLCBhcmdzLCB7IGNsaWVudCB9KSA9PiB7XG4gICAgY29uc3QgdmFsdWVzID0gZ2V0Q29sdW1uVmFsdWVzKHNvdXJjZSwgYXJncylcbiAgICBpZiAoIXZhbHVlcykgcmV0dXJuIG51bGxcbiAgICBjb25zdCByb3cgPSBhd2FpdCBnZXREYXRhTG9hZGVyKGNsaWVudCkubG9hZCh2YWx1ZXMpXG4gICAgaWYgKCFyb3cpIHJldHVybiByb3dcbiAgICByb3cudGFibGUgPSB0YWJsZVxuICAgIHJldHVybiByb3dcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCByZXNvbHZlVGFibGVTaW5nbGVcbiJdfQ==