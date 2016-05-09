'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _lodash = require('lodash');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

const resolveConnection = function resolveConnection(table) {
  let getExtraConditions = arguments.length <= 1 || arguments[1] === undefined ? (0, _lodash.constant)({}) : arguments[1];

  // Because we are trying to generate very dynamic queries we use the `sql`
  // module as it lets us guarantee saftey against SQL injection, and is easier
  // to modify than a string.
  const tableSql = table.sql();

  return (source, args, _ref) => {
    let client = _ref.client;
    const orderBy = args.orderBy;
    const first = args.first;
    const last = args.last;
    const after = args.after;
    const before = args.before;
    const offset = args.offset;
    const descending = args.descending;

    const conditions = _objectWithoutProperties(args, ['orderBy', 'first', 'last', 'after', 'before', 'offset', 'descending']);

    // Add extra conditions to the leftover `conditions` argument.


    (0, _lodash.assign)(conditions, getExtraConditions(source, args));

    // Throw an error if `orderBy` is not defined.
    if (!orderBy) throw new Error('`orderBy` not defined in properties. `orderBy` is required for creating cursors.');

    // If both `first` and `last` are defined, throw an error.
    if (first && last) throw new Error('Cannot define both a `first` and a `last` argument.');

    // Transforms object keys (which are field names) into column names.
    const getConditionsObject = (0, _lodash.once)(() => {
      // If there are no conditions, just return `'true'`.
      if ((0, _lodash.isEmpty)(conditions)) return 'true';

      return (0, _lodash.mapKeys)(conditions, (value, fieldName) => table.columns.find(column => column.getFieldName() === (0, _lodash.camelCase)(fieldName)).name);
    });

    const getRowCursorValue = row => row[orderBy] || '';

    const getRows = (0, _lodash.once)(_asyncToGenerator(function* () {
      // Start our query.
      let query = tableSql.select(tableSql.star());

      // Add the conditions for `after` and `before` which will narrow our
      // range.
      if (before) query = query.where(tableSql[orderBy].lt(before));
      if (after) query = query.where(tableSql[orderBy].gt(after));

      // Add the conditions…
      query = query.where(getConditionsObject());

      // Create the ordering statement and add it to the query.
      // If a `last` argument was defined we are querying from the bottom so we
      // need to flip our order.
      const actuallyDescending = last ? !descending : descending;
      query = query.order(tableSql[orderBy][actuallyDescending ? 'descending' : 'ascending']);

      // Set the correct range.
      if (first) query = query.limit(first);
      if (last) query = query.limit(last);
      if (offset) query = query.offset(offset);

      // Run the query.

      var _ref2 = yield client.queryAsync(query.toQuery());

      let rows = _ref2.rows;

      // If a `last` argument was defined we flipped our query ordering (see
      // the above `ORDER BY` addition), so now we need to flip it back so the
      // user gets what they expected.

      if (last) rows = rows.reverse();

      return rows.map(function (row) {
        return (0, _lodash.assign)(row, { table });
      });
    }));

    const getStartCursor = (0, _lodash.once)(() => getRows().then(rows => {
      const row = rows[0];
      return row ? getRowCursorValue(row) : null;
    }));

    const getEndCursor = (0, _lodash.once)(() => getRows().then(rows => {
      const row = rows[rows.length - 1];
      return row ? getRowCursorValue(row) : null;
    }));

    // The properties are in getters so that they are lazy. If we don’t need a
    // thing, we don’t need to make associated requests until the getter is
    // called.
    //
    // Also, the `pageInfo` stuff is not nested in its own object because it
    // turns out that pattern just increases cyclomatic complexity for no good
    // reason.
    return {
      get hasNextPage() {
        return(
          // Get the `endCursor`. We will need it.
          getEndCursor().then(endCursor => {
            if (!endCursor) return false;
            return client.queryAsync(
            // Try to find one row with a greater cursor. If one exists
            // we know there is a next page.
            tableSql.select('null').where(tableSql[orderBy][descending ? 'lt' : 'gt'](endCursor)).where(getConditionsObject()).limit(1).toQuery()).then(_ref3 => {
              let rowCount = _ref3.rowCount;
              return rowCount !== 0;
            });
          })
        );
      },

      get hasPreviousPage() {
        return(
          // Get the `startCursor`. We will need it.
          getStartCursor().then(startCursor => {
            if (!startCursor) return false;
            return client.queryAsync(
            // Try to find one row with a lesser cursor. If one exists
            // we know there is a previous page.
            tableSql.select('null').where(tableSql[orderBy][descending ? 'gt' : 'lt'](startCursor)).where(getConditionsObject()).limit(1).toQuery()).then(_ref4 => {
              let rowCount = _ref4.rowCount;
              return rowCount !== 0;
            });
          })
        );
      },

      // Gets the first cursor in the resulting items.
      get startCursor() {
        return getStartCursor();
      },

      // Gets the last cursor in the resulting items.
      get endCursor() {
        return getEndCursor();
      },

      // Runs a SQL query to get the count for this query with the provided
      // condition. Also makes sure only the parsed count is returned.
      get totalCount() {
        // There is a possibility that `count` will be so big JavaScript can’t
        // parse it :|
        return client.queryAsync(tableSql.select(tableSql.count('count')).where(getConditionsObject()).toQuery()).then(_ref5 => {
          var _ref5$rows = _slicedToArray(_ref5.rows, 1);

          let count = _ref5$rows[0].count;
          return parseInt(count, 10);
        });
      },

      get nodes() {
        return getRows();
      },

      get edges() {
        // Returns the rows with a generated `cursor` field for more details.
        return getRows().then(rows => rows.map(row => ({
          cursor: getRowCursorValue(row),
          node: row
        })));
      }
    };
  };
};

exports['default'] = resolveConnection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ncmFwaHFsL3Jlc29sdmVDb25uZWN0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7OztBQUVBLE1BQU0sb0JBQW9CLFNBQXBCLGlCQUFvQixDQUFDLEtBQUQsRUFBOEM7QUFBQSxNQUF0QyxrQkFBc0MseURBQWpCLHNCQUFTLEVBQVQsQ0FBaUI7Ozs7O0FBSXRFLFFBQU0sV0FBVyxNQUFNLEdBQU4sRUFBakI7O0FBRUEsU0FBTyxDQUFDLE1BQUQsRUFBUyxJQUFULFdBQThCO0FBQUEsUUFBYixNQUFhLFFBQWIsTUFBYTtBQUFBLFVBQzNCLE9BRDJCLEdBQ2dELElBRGhELENBQzNCLE9BRDJCO0FBQUEsVUFDbEIsS0FEa0IsR0FDZ0QsSUFEaEQsQ0FDbEIsS0FEa0I7QUFBQSxVQUNYLElBRFcsR0FDZ0QsSUFEaEQsQ0FDWCxJQURXO0FBQUEsVUFDTCxLQURLLEdBQ2dELElBRGhELENBQ0wsS0FESztBQUFBLFVBQ0UsTUFERixHQUNnRCxJQURoRCxDQUNFLE1BREY7QUFBQSxVQUNVLE1BRFYsR0FDZ0QsSUFEaEQsQ0FDVSxNQURWO0FBQUEsVUFDa0IsVUFEbEIsR0FDZ0QsSUFEaEQsQ0FDa0IsVUFEbEI7O0FBQUEsVUFDaUMsVUFEakMsNEJBQ2dELElBRGhEOzs7OztBQUluQyx3QkFBTyxVQUFQLEVBQW1CLG1CQUFtQixNQUFuQixFQUEyQixJQUEzQixDQUFuQjs7O0FBR0EsUUFBSSxDQUFDLE9BQUwsRUFDRSxNQUFNLElBQUksS0FBSixDQUFVLGtGQUFWLENBQU47OztBQUdGLFFBQUksU0FBUyxJQUFiLEVBQ0UsTUFBTSxJQUFJLEtBQUosQ0FBVSxxREFBVixDQUFOOzs7QUFHRixVQUFNLHNCQUFzQixrQkFBSyxNQUFNOztBQUVyQyxVQUFJLHFCQUFRLFVBQVIsQ0FBSixFQUNFLE9BQU8sTUFBUDs7QUFFRixhQUFPLHFCQUFRLFVBQVIsRUFBb0IsQ0FBQyxLQUFELEVBQVEsU0FBUixLQUN6QixNQUFN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YXNzaWduLCBtYXBLZXlzLCBvbmNlLCBpc0VtcHR5LCBjYW1lbENhc2UgfSBmcm9tICdsb2Rhc2gnXG5cbmNvbnN0IHJlc29sdmVDb25uZWN0aW9uID0gKHRhYmxlLCBnZXRFeHRyYUNvbmRpdGlvbnMgPSBjb25zdGFudCh7fSkpID0+IHtcbiAgLy8gQmVjYXVzZSB3ZSBhcmUgdHJ5aW5nIHRvIGdlbmVyYXRlIHZlcnkgZHluYW1pYyBxdWVyaWVzIHdlIHVzZSB0aGUgYHNxbGBcbiAgLy8gbW9kdWxlIGFzIGl0IGxldHMgdXMgZ3VhcmFudGVlIHNhZnRleSBhZ2FpbnN0IFNRTCBpbmplY3Rpb24sIGFuZCBpcyBlYXNpZXJcbiAgLy8gdG8gbW9kaWZ5IHRoYW4gYSBzdHJpbmcuXG4gIGNvbnN0IHRhYmxlU3FsID0gdGFibGUuc3FsKClcblxuICByZXR1cm4gKHNvdXJjZSwgYXJncywgeyBjbGllbnQgfSkgPT4ge1xuICAgIGNvbnN0IHsgb3JkZXJCeSwgZmlyc3QsIGxhc3QsIGFmdGVyLCBiZWZvcmUsIG9mZnNldCwgZGVzY2VuZGluZywgLi4uY29uZGl0aW9ucyB9ID0gYXJnc1xuXG4gICAgLy8gQWRkIGV4dHJhIGNvbmRpdGlvbnMgdG8gdGhlIGxlZnRvdmVyIGBjb25kaXRpb25zYCBhcmd1bWVudC5cbiAgICBhc3NpZ24oY29uZGl0aW9ucywgZ2V0RXh0cmFDb25kaXRpb25zKHNvdXJjZSwgYXJncykpXG5cbiAgICAvLyBUaHJvdyBhbiBlcnJvciBpZiBgb3JkZXJCeWAgaXMgbm90IGRlZmluZWQuXG4gICAgaWYgKCFvcmRlckJ5KVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdgb3JkZXJCeWAgbm90IGRlZmluZWQgaW4gcHJvcGVydGllcy4gYG9yZGVyQnlgIGlzIHJlcXVpcmVkIGZvciBjcmVhdGluZyBjdXJzb3JzLicpXG5cbiAgICAvLyBJZiBib3RoIGBmaXJzdGAgYW5kIGBsYXN0YCBhcmUgZGVmaW5lZCwgdGhyb3cgYW4gZXJyb3IuXG4gICAgaWYgKGZpcnN0ICYmIGxhc3QpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBkZWZpbmUgYm90aCBhIGBmaXJzdGAgYW5kIGEgYGxhc3RgIGFyZ3VtZW50LicpXG5cbiAgICAvLyBUcmFuc2Zvcm1zIG9iamVjdCBrZXlzICh3aGljaCBhcmUgZmllbGQgbmFtZXMpIGludG8gY29sdW1uIG5hbWVzLlxuICAgIGNvbnN0IGdldENvbmRpdGlvbnNPYmplY3QgPSBvbmNlKCgpID0+IHtcbiAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBjb25kaXRpb25zLCBqdXN0IHJldHVybiBgJ3RydWUnYC5cbiAgICAgIGlmIChpc0VtcHR5KGNvbmRpdGlvbnMpKVxuICAgICAgICByZXR1cm4gJ3RydWUnXG5cbiAgICAgIHJldHVybiBtYXBLZXlzKGNvbmRpdGlvbnMsICh2YWx1ZSwgZmllbGROYW1lKSA9PlxuICAgICAgICB0YWJsZS5jb2x1bW5zLmZpbmQoY29sdW1uID0+IGNvbHVtbi5nZXRGaWVsZE5hbWUoKSA9PT0gY2FtZWxDYXNlKGZpZWxkTmFtZSkpLm5hbWVcbiAgICAgIClcbiAgICB9KVxuXG4gICAgY29uc3QgZ2V0Um93Q3Vyc29yVmFsdWUgPSByb3cgPT4gcm93W29yZGVyQnldIHx8ICcnXG5cbiAgICBjb25zdCBnZXRSb3dzID0gb25jZShhc3luYyAoKSA9PiB7XG4gICAgICAvLyBTdGFydCBvdXIgcXVlcnkuXG4gICAgICBsZXQgcXVlcnkgPSB0YWJsZVNxbC5zZWxlY3QodGFibGVTcWwuc3RhcigpKVxuXG4gICAgICAvLyBBZGQgdGhlIGNvbmRpdGlvbnMgZm9yIGBhZnRlcmAgYW5kIGBiZWZvcmVgIHdoaWNoIHdpbGwgbmFycm93IG91clxuICAgICAgLy8gcmFuZ2UuXG4gICAgICBpZiAoYmVmb3JlKSBxdWVyeSA9IHF1ZXJ5LndoZXJlKHRhYmxlU3FsW29yZGVyQnldLmx0KGJlZm9yZSkpXG4gICAgICBpZiAoYWZ0ZXIpIHF1ZXJ5ID0gcXVlcnkud2hlcmUodGFibGVTcWxbb3JkZXJCeV0uZ3QoYWZ0ZXIpKVxuXG4gICAgICAvLyBBZGQgdGhlIGNvbmRpdGlvbnPigKZcbiAgICAgIHF1ZXJ5ID0gcXVlcnkud2hlcmUoZ2V0Q29uZGl0aW9uc09iamVjdCgpKVxuXG4gICAgICAvLyBDcmVhdGUgdGhlIG9yZGVyaW5nIHN0YXRlbWVudCBhbmQgYWRkIGl0IHRvIHRoZSBxdWVyeS5cbiAgICAgIC8vIElmIGEgYGxhc3RgIGFyZ3VtZW50IHdhcyBkZWZpbmVkIHdlIGFyZSBxdWVyeWluZyBmcm9tIHRoZSBib3R0b20gc28gd2VcbiAgICAgIC8vIG5lZWQgdG8gZmxpcCBvdXIgb3JkZXIuXG4gICAgICBjb25zdCBhY3R1YWxseURlc2NlbmRpbmcgPSBsYXN0ID8gIWRlc2NlbmRpbmcgOiBkZXNjZW5kaW5nXG4gICAgICBxdWVyeSA9IHF1ZXJ5Lm9yZGVyKHRhYmxlU3FsW29yZGVyQnldW2FjdHVhbGx5RGVzY2VuZGluZyA/ICdkZXNjZW5kaW5nJyA6ICdhc2NlbmRpbmcnXSlcblxuICAgICAgLy8gU2V0IHRoZSBjb3JyZWN0IHJhbmdlLlxuICAgICAgaWYgKGZpcnN0KSBxdWVyeSA9IHF1ZXJ5LmxpbWl0KGZpcnN0KVxuICAgICAgaWYgKGxhc3QpIHF1ZXJ5ID0gcXVlcnkubGltaXQobGFzdClcbiAgICAgIGlmIChvZmZzZXQpIHF1ZXJ5ID0gcXVlcnkub2Zmc2V0KG9mZnNldClcblxuICAgICAgLy8gUnVuIHRoZSBxdWVyeS5cbiAgICAgIGxldCB7IHJvd3MgfSA9IGF3YWl0IGNsaWVudC5xdWVyeUFzeW5jKHF1ZXJ5LnRvUXVlcnkoKSlcblxuICAgICAgLy8gSWYgYSBgbGFzdGAgYXJndW1lbnQgd2FzIGRlZmluZWQgd2UgZmxpcHBlZCBvdXIgcXVlcnkgb3JkZXJpbmcgKHNlZVxuICAgICAgLy8gdGhlIGFib3ZlIGBPUkRFUiBCWWAgYWRkaXRpb24pLCBzbyBub3cgd2UgbmVlZCB0byBmbGlwIGl0IGJhY2sgc28gdGhlXG4gICAgICAvLyB1c2VyIGdldHMgd2hhdCB0aGV5IGV4cGVjdGVkLlxuICAgICAgaWYgKGxhc3QpIHJvd3MgPSByb3dzLnJldmVyc2UoKVxuXG4gICAgICByZXR1cm4gcm93cy5tYXAocm93ID0+IGFzc2lnbihyb3csIHsgdGFibGUgfSkpXG4gICAgfSlcblxuICAgIGNvbnN0IGdldFN0YXJ0Q3Vyc29yID0gb25jZSgoKSA9PiBnZXRSb3dzKCkudGhlbihyb3dzID0+IHtcbiAgICAgIGNvbnN0IHJvdyA9IHJvd3NbMF1cbiAgICAgIHJldHVybiByb3cgPyBnZXRSb3dDdXJzb3JWYWx1ZShyb3cpIDogbnVsbFxuICAgIH0pKVxuXG4gICAgY29uc3QgZ2V0RW5kQ3Vyc29yID0gb25jZSgoKSA9PiBnZXRSb3dzKCkudGhlbihyb3dzID0+IHtcbiAgICAgIGNvbnN0IHJvdyA9IHJvd3Nbcm93cy5sZW5ndGggLSAxXVxuICAgICAgcmV0dXJuIHJvdyA/IGdldFJvd0N1cnNvclZhbHVlKHJvdykgOiBudWxsXG4gICAgfSkpXG5cbiAgICAvLyBUaGUgcHJvcGVydGllcyBhcmUgaW4gZ2V0dGVycyBzbyB0aGF0IHRoZXkgYXJlIGxhenkuIElmIHdlIGRvbuKAmXQgbmVlZCBhXG4gICAgLy8gdGhpbmcsIHdlIGRvbuKAmXQgbmVlZCB0byBtYWtlIGFzc29jaWF0ZWQgcmVxdWVzdHMgdW50aWwgdGhlIGdldHRlciBpc1xuICAgIC8vIGNhbGxlZC5cbiAgICAvL1xuICAgIC8vIEFsc28sIHRoZSBgcGFnZUluZm9gIHN0dWZmIGlzIG5vdCBuZXN0ZWQgaW4gaXRzIG93biBvYmplY3QgYmVjYXVzZSBpdFxuICAgIC8vIHR1cm5zIG91dCB0aGF0IHBhdHRlcm4ganVzdCBpbmNyZWFzZXMgY3ljbG9tYXRpYyBjb21wbGV4aXR5IGZvciBubyBnb29kXG4gICAgLy8gcmVhc29uLlxuICAgIHJldHVybiB7XG4gICAgICBnZXQgaGFzTmV4dFBhZ2UgKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIC8vIEdldCB0aGUgYGVuZEN1cnNvcmAuIFdlIHdpbGwgbmVlZCBpdC5cbiAgICAgICAgICBnZXRFbmRDdXJzb3IoKVxuICAgICAgICAgIC50aGVuKGVuZEN1cnNvciA9PiB7XG4gICAgICAgICAgICBpZiAoIWVuZEN1cnNvcikgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICBjbGllbnQucXVlcnlBc3luYyhcbiAgICAgICAgICAgICAgICAvLyBUcnkgdG8gZmluZCBvbmUgcm93IHdpdGggYSBncmVhdGVyIGN1cnNvci4gSWYgb25lIGV4aXN0c1xuICAgICAgICAgICAgICAgIC8vIHdlIGtub3cgdGhlcmUgaXMgYSBuZXh0IHBhZ2UuXG4gICAgICAgICAgICAgICAgdGFibGVTcWxcbiAgICAgICAgICAgICAgICAuc2VsZWN0KCdudWxsJylcbiAgICAgICAgICAgICAgICAud2hlcmUodGFibGVTcWxbb3JkZXJCeV1bZGVzY2VuZGluZyA/ICdsdCcgOiAnZ3QnXShlbmRDdXJzb3IpKVxuICAgICAgICAgICAgICAgIC53aGVyZShnZXRDb25kaXRpb25zT2JqZWN0KCkpXG4gICAgICAgICAgICAgICAgLmxpbWl0KDEpXG4gICAgICAgICAgICAgICAgLnRvUXVlcnkoKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIC50aGVuKCh7IHJvd0NvdW50IH0pID0+IHJvd0NvdW50ICE9PSAwKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICAgIH0sXG5cbiAgICAgIGdldCBoYXNQcmV2aW91c1BhZ2UgKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIC8vIEdldCB0aGUgYHN0YXJ0Q3Vyc29yYC4gV2Ugd2lsbCBuZWVkIGl0LlxuICAgICAgICAgIGdldFN0YXJ0Q3Vyc29yKClcbiAgICAgICAgICAudGhlbihzdGFydEN1cnNvciA9PiB7XG4gICAgICAgICAgICBpZiAoIXN0YXJ0Q3Vyc29yKSByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIGNsaWVudC5xdWVyeUFzeW5jKFxuICAgICAgICAgICAgICAgIC8vIFRyeSB0byBmaW5kIG9uZSByb3cgd2l0aCBhIGxlc3NlciBjdXJzb3IuIElmIG9uZSBleGlzdHNcbiAgICAgICAgICAgICAgICAvLyB3ZSBrbm93IHRoZXJlIGlzIGEgcHJldmlvdXMgcGFnZS5cbiAgICAgICAgICAgICAgICB0YWJsZVNxbFxuICAgICAgICAgICAgICAgIC5zZWxlY3QoJ251bGwnKVxuICAgICAgICAgICAgICAgIC53aGVyZSh0YWJsZVNxbFtvcmRlckJ5XVtkZXNjZW5kaW5nID8gJ2d0JyA6ICdsdCddKHN0YXJ0Q3Vyc29yKSlcbiAgICAgICAgICAgICAgICAud2hlcmUoZ2V0Q29uZGl0aW9uc09iamVjdCgpKVxuICAgICAgICAgICAgICAgIC5saW1pdCgxKVxuICAgICAgICAgICAgICAgIC50b1F1ZXJ5KClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAudGhlbigoeyByb3dDb3VudCB9KSA9PiByb3dDb3VudCAhPT0gMClcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgICB9LFxuXG4gICAgICAvLyBHZXRzIHRoZSBmaXJzdCBjdXJzb3IgaW4gdGhlIHJlc3VsdGluZyBpdGVtcy5cbiAgICAgIGdldCBzdGFydEN1cnNvciAoKSB7XG4gICAgICAgIHJldHVybiBnZXRTdGFydEN1cnNvcigpXG4gICAgICB9LFxuXG4gICAgICAvLyBHZXRzIHRoZSBsYXN0IGN1cnNvciBpbiB0aGUgcmVzdWx0aW5nIGl0ZW1zLlxuICAgICAgZ2V0IGVuZEN1cnNvciAoKSB7XG4gICAgICAgIHJldHVybiBnZXRFbmRDdXJzb3IoKVxuICAgICAgfSxcblxuICAgICAgLy8gUnVucyBhIFNRTCBxdWVyeSB0byBnZXQgdGhlIGNvdW50IGZvciB0aGlzIHF1ZXJ5IHdpdGggdGhlIHByb3ZpZGVkXG4gICAgICAvLyBjb25kaXRpb24uIEFsc28gbWFrZXMgc3VyZSBvbmx5IHRoZSBwYXJzZWQgY291bnQgaXMgcmV0dXJuZWQuXG4gICAgICBnZXQgdG90YWxDb3VudCAoKSB7XG4gICAgICAgIC8vIFRoZXJlIGlzIGEgcG9zc2liaWxpdHkgdGhhdCBgY291bnRgIHdpbGwgYmUgc28gYmlnIEphdmFTY3JpcHQgY2Fu4oCZdFxuICAgICAgICAvLyBwYXJzZSBpdCA6fFxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIGNsaWVudC5xdWVyeUFzeW5jKFxuICAgICAgICAgICAgdGFibGVTcWxcbiAgICAgICAgICAgIC5zZWxlY3QodGFibGVTcWwuY291bnQoJ2NvdW50JykpXG4gICAgICAgICAgICAud2hlcmUoZ2V0Q29uZGl0aW9uc09iamVjdCgpKVxuICAgICAgICAgICAgLnRvUXVlcnkoKVxuICAgICAgICAgIClcbiAgICAgICAgICAudGhlbigoeyByb3dzOiBbeyBjb3VudCB9XSB9KSA9PiBwYXJzZUludChjb3VudCwgMTApKVxuICAgICAgICApXG4gICAgICB9LFxuXG4gICAgICBnZXQgbm9kZXMgKCkge1xuICAgICAgICByZXR1cm4gZ2V0Um93cygpXG4gICAgICB9LFxuXG4gICAgICBnZXQgZWRnZXMgKCkge1xuICAgICAgICAvLyBSZXR1cm5zIHRoZSByb3dzIHdpdGggYSBnZW5lcmF0ZWQgYGN1cnNvcmAgZmllbGQgZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgICAgcmV0dXJuIGdldFJvd3MoKS50aGVuKHJvd3MgPT4gcm93cy5tYXAocm93ID0+ICh7XG4gICAgICAgICAgY3Vyc29yOiBnZXRSb3dDdXJzb3JWYWx1ZShyb3cpLFxuICAgICAgICAgIG5vZGU6IHJvdyxcbiAgICAgICAgfSkpKVxuICAgICAgfSxcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgcmVzb2x2ZUNvbm5lY3Rpb25cbiJdfQ==