'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createConnectionType = require('../createConnectionType.js');

var _createConnectionType2 = _interopRequireDefault(_createConnectionType);

var _createConnectionArgs = require('../createConnectionArgs.js');

var _createConnectionArgs2 = _interopRequireDefault(_createConnectionArgs);

var _resolveConnection = require('../resolveConnection.js');

var _resolveConnection2 = _interopRequireDefault(_resolveConnection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * Gets the Relay connection specification compliant list field for a `Table`.
 *
 * @param {Table} table
 * @returns {GraphQLFieldConfig}
 */
const createListQueryField = table => ({
  // Make sure the type of this field is our connection type. This connection
  // type will expect functions (that cache their values) and not traditional
  // values. This improves performance when we don’t have to do potentially
  // expensive queries on fields we don’t actually need.
  type: (0, _createConnectionType2['default'])(table),

  description: 'Queries and returns a set of items with some metatadata for ' + `${ table.getMarkdownTypeName() }. Note that cursors will not work ` + 'across different `orderBy` values. If you want to reuse a cursor, make ' + 'sure you don’t change `orderBy`.',

  args: (0, _createConnectionArgs2['default'])(table),

  resolve: (0, _resolveConnection2['default'])(table)
});

exports['default'] = createListQueryField;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ncmFwaHFsL3F1ZXJ5L2NyZWF0ZUxpc3RRdWVyeUZpZWxkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7Ozs7O0FBUUEsTUFBTSx1QkFBdUIsVUFBVTs7Ozs7QUFLckMsUUFBTSx1Q0FBcUIsS0FBckIsQ0FMK0I7O0FBT3JDLGVBQ0UsaUVBQ0EsQ0FBQyxBQUFELEdBQUcsTUFBTSxtQkFBTixFQUFILEVBQStCLGtDQUEvQixDQURBLEdBRUEseUVBRkEsR0FHQSxrQ0FYbUM7O0FBYXJDLFFBQU0sdUNBQXFCLEtBQXJCLENBYitCOztBQWVyQyxXQUFTLG9DQUFrQixLQUFsQjtBQWY0QixDQUFWLENBQTdCOztxQkFrQmUsb0IiLCJmaWxlIjoiY3JlYXRlTGlzdFF1ZXJ5RmllbGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY3JlYXRlQ29ubmVjdGlvblR5cGUgZnJvbSAnLi4vY3JlYXRlQ29ubmVjdGlvblR5cGUuanMnXG5pbXBvcnQgY3JlYXRlQ29ubmVjdGlvbkFyZ3MgZnJvbSAnLi4vY3JlYXRlQ29ubmVjdGlvbkFyZ3MuanMnXG5pbXBvcnQgcmVzb2x2ZUNvbm5lY3Rpb24gZnJvbSAnLi4vcmVzb2x2ZUNvbm5lY3Rpb24uanMnXG5cbi8qKlxuICogR2V0cyB0aGUgUmVsYXkgY29ubmVjdGlvbiBzcGVjaWZpY2F0aW9uIGNvbXBsaWFudCBsaXN0IGZpZWxkIGZvciBhIGBUYWJsZWAuXG4gKlxuICogQHBhcmFtIHtUYWJsZX0gdGFibGVcbiAqIEByZXR1cm5zIHtHcmFwaFFMRmllbGRDb25maWd9XG4gKi9cbmNvbnN0IGNyZWF0ZUxpc3RRdWVyeUZpZWxkID0gdGFibGUgPT4gKHtcbiAgLy8gTWFrZSBzdXJlIHRoZSB0eXBlIG9mIHRoaXMgZmllbGQgaXMgb3VyIGNvbm5lY3Rpb24gdHlwZS4gVGhpcyBjb25uZWN0aW9uXG4gIC8vIHR5cGUgd2lsbCBleHBlY3QgZnVuY3Rpb25zICh0aGF0IGNhY2hlIHRoZWlyIHZhbHVlcykgYW5kIG5vdCB0cmFkaXRpb25hbFxuICAvLyB2YWx1ZXMuIFRoaXMgaW1wcm92ZXMgcGVyZm9ybWFuY2Ugd2hlbiB3ZSBkb27igJl0IGhhdmUgdG8gZG8gcG90ZW50aWFsbHlcbiAgLy8gZXhwZW5zaXZlIHF1ZXJpZXMgb24gZmllbGRzIHdlIGRvbuKAmXQgYWN0dWFsbHkgbmVlZC5cbiAgdHlwZTogY3JlYXRlQ29ubmVjdGlvblR5cGUodGFibGUpLFxuXG4gIGRlc2NyaXB0aW9uOlxuICAgICdRdWVyaWVzIGFuZCByZXR1cm5zIGEgc2V0IG9mIGl0ZW1zIHdpdGggc29tZSBtZXRhdGFkYXRhIGZvciAnICtcbiAgICBgJHt0YWJsZS5nZXRNYXJrZG93blR5cGVOYW1lKCl9LiBOb3RlIHRoYXQgY3Vyc29ycyB3aWxsIG5vdCB3b3JrIGAgK1xuICAgICdhY3Jvc3MgZGlmZmVyZW50IGBvcmRlckJ5YCB2YWx1ZXMuIElmIHlvdSB3YW50IHRvIHJldXNlIGEgY3Vyc29yLCBtYWtlICcgK1xuICAgICdzdXJlIHlvdSBkb27igJl0IGNoYW5nZSBgb3JkZXJCeWAuJyxcblxuICBhcmdzOiBjcmVhdGVDb25uZWN0aW9uQXJncyh0YWJsZSksXG5cbiAgcmVzb2x2ZTogcmVzb2x2ZUNvbm5lY3Rpb24odGFibGUpLFxufSlcblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlTGlzdFF1ZXJ5RmllbGRcbiJdfQ==