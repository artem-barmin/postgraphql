'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createSingleQueryField = require('./createSingleQueryField.js');

var _createSingleQueryField2 = _interopRequireDefault(_createSingleQueryField);

var _createListQueryField = require('./createListQueryField.js');

var _createListQueryField2 = _interopRequireDefault(_createListQueryField);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * Creates the fields for a single table in the database. To see the type these
 * fields are used in and all the other fields exposed by a PostGraphQL query,
 * see `createQueryType`.
 *
 * @param {Table} table
 * @returns {GraphQLFieldConfig}
 */
const createQueryFields = table => {
  const fields = {};

  const singleField = (0, _createSingleQueryField2['default'])(table);
  const listField = (0, _createListQueryField2['default'])(table);

  // `createSingleQueryField` and others may return `null`, so we must check
  // for that.
  if (singleField) fields[table.getFieldName()] = singleField;
  if (listField) fields[`${ table.getFieldName() }Nodes`] = listField;

  return fields;
};

exports['default'] = createQueryFields;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ncmFwaHFsL3F1ZXJ5L2NyZWF0ZVF1ZXJ5RmllbGRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0FBVUEsTUFBTSxvQkFBb0IsU0FBUztBQUNqQyxRQUFNLFNBQVMsRUFBZjs7QUFFQSxRQUFNLGNBQWMseUNBQXVCLEtBQXZCLENBQXBCO0FBQ0EsUUFBTSxZQUFZLHVDQUFxQixLQUFyQixDQUFsQjs7OztBQUlBLE1BQUksV0FBSixFQUFpQixPQUFPLE1BQU0sWUFBTixFQUFQLElBQStCLFdBQS9CO0FBQ2pCLE1BQUksU0FBSixFQUFlLE9BQU8sQ0FBQyxBQUFELEdBQUcsTUFBTSxZQUFOLEVBQUgsRUFBd0IsS0FBeEIsQ0FBUCxJQUF5QyxTQUF6Qzs7QUFFZixTQUFPLE1BQVA7QUFDRCxDQVpEOztxQkFjZSxpQiIsImZpbGUiOiJjcmVhdGVRdWVyeUZpZWxkcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjcmVhdGVTaW5nbGVRdWVyeUZpZWxkIGZyb20gJy4vY3JlYXRlU2luZ2xlUXVlcnlGaWVsZC5qcydcbmltcG9ydCBjcmVhdGVMaXN0UXVlcnlGaWVsZCBmcm9tICcuL2NyZWF0ZUxpc3RRdWVyeUZpZWxkLmpzJ1xuXG4vKipcbiAqIENyZWF0ZXMgdGhlIGZpZWxkcyBmb3IgYSBzaW5nbGUgdGFibGUgaW4gdGhlIGRhdGFiYXNlLiBUbyBzZWUgdGhlIHR5cGUgdGhlc2VcbiAqIGZpZWxkcyBhcmUgdXNlZCBpbiBhbmQgYWxsIHRoZSBvdGhlciBmaWVsZHMgZXhwb3NlZCBieSBhIFBvc3RHcmFwaFFMIHF1ZXJ5LFxuICogc2VlIGBjcmVhdGVRdWVyeVR5cGVgLlxuICpcbiAqIEBwYXJhbSB7VGFibGV9IHRhYmxlXG4gKiBAcmV0dXJucyB7R3JhcGhRTEZpZWxkQ29uZmlnfVxuICovXG5jb25zdCBjcmVhdGVRdWVyeUZpZWxkcyA9IHRhYmxlID0+IHtcbiAgY29uc3QgZmllbGRzID0ge31cblxuICBjb25zdCBzaW5nbGVGaWVsZCA9IGNyZWF0ZVNpbmdsZVF1ZXJ5RmllbGQodGFibGUpXG4gIGNvbnN0IGxpc3RGaWVsZCA9IGNyZWF0ZUxpc3RRdWVyeUZpZWxkKHRhYmxlKVxuXG4gIC8vIGBjcmVhdGVTaW5nbGVRdWVyeUZpZWxkYCBhbmQgb3RoZXJzIG1heSByZXR1cm4gYG51bGxgLCBzbyB3ZSBtdXN0IGNoZWNrXG4gIC8vIGZvciB0aGF0LlxuICBpZiAoc2luZ2xlRmllbGQpIGZpZWxkc1t0YWJsZS5nZXRGaWVsZE5hbWUoKV0gPSBzaW5nbGVGaWVsZFxuICBpZiAobGlzdEZpZWxkKSBmaWVsZHNbYCR7dGFibGUuZ2V0RmllbGROYW1lKCl9Tm9kZXNgXSA9IGxpc3RGaWVsZFxuXG4gIHJldHVybiBmaWVsZHNcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlUXVlcnlGaWVsZHNcbiJdfQ==