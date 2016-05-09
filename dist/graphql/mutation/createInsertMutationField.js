'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

var _getColumnType = require('../getColumnType.js');

var _getColumnType2 = _interopRequireDefault(_getColumnType);

var _createTableType = require('../createTableType.js');

var _createTableType2 = _interopRequireDefault(_createTableType);

var _clientMutationId = require('./clientMutationId.js');

var _graphql = require('graphql');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * Creates a mutation which will create a new row.
 *
 * @param {Table} table
 * @returns {GraphQLFieldConfig}
 */
const createInsertMutationField = table => ({
  type: createPayloadType(table),
  description: `Creates a new node of the ${ table.getMarkdownTypeName() } type.`,

  args: {
    input: {
      type: new _graphql.GraphQLNonNull(createInputType(table))
    }
  },

  resolve: resolveInsert(table)
});

exports['default'] = createInsertMutationField;


const createInputType = table => new _graphql.GraphQLInputObjectType({
  name: `Insert${ table.getTypeName() }Input`,
  description: `The ${ table.getMarkdownTypeName() } to insert.`,
  fields: _extends({}, (0, _lodash.fromPairs)(table.columns.map(column => [column.getFieldName(), {
    type: (column.hasDefault ? _graphql.getNullableType : _lodash.identity)((0, _getColumnType2['default'])(column)),
    description: column.description
  }])), {
    clientMutationId: _clientMutationId.inputClientMutationId
  })
});

const createPayloadType = table => new _graphql.GraphQLObjectType({
  name: `Insert${ table.getTypeName() }Payload`,
  description: `Contains the ${ table.getMarkdownTypeName() } node inserted by the mutation.`,

  fields: {
    [table.getFieldName()]: {
      type: (0, _createTableType2['default'])(table),
      description: `The inserted ${ table.getMarkdownTypeName() }.`,
      resolve: source => source[table.name]
    },
    clientMutationId: _clientMutationId.payloadClientMutationId
  }
});

const resolveInsert = table => {
  // Note that using `DataLoader` here would not make very minor performance
  // improvements because mutations are executed in sequence, not parallel.
  //
  // A better solution for batch inserts is a custom batch insert field.
  const tableSql = table.sql();

  return (() => {
    var ref = _asyncToGenerator(function* (source, args, _ref) {
      let client = _ref.client;

      // Get the input object value from the args.
      const input = args.input;
      const clientMutationId = input.clientMutationId;
      // Insert the thing making sure we return the newly inserted row.

      var _ref2 = yield client.queryAsync(tableSql.insert((0, _lodash.fromPairs)(table.columns.map(function (column) {
        return [column.name, input[column.getFieldName()]];
      }).filter(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2);

        let value = _ref4[1];
        return value;
      }))).returning(tableSql.star()).toQuery());

      var _ref2$rows = _slicedToArray(_ref2.rows, 1);

      const row = _ref2$rows[0];

      // Return the first (and likely only) row.

      return {
        [table.name]: row ? (0, _lodash.assign)(row, { table }) : null,
        clientMutationId
      };
    });

    return function (_x, _x2, _x3) {
      return ref.apply(this, arguments);
    };
  })();
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ncmFwaHFsL211dGF0aW9uL2NyZWF0ZUluc2VydE11dGF0aW9uRmllbGQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7O0FBYUEsTUFBTSw0QkFBNEIsVUFBVTtBQUMxQyxRQUFNLGtCQUFrQixLQUFsQixDQURvQztBQUUxQyxlQUFhLENBQUMsMEJBQUQsR0FBNkIsTUFBTSxtQkFBTixFQUE3QixFQUF5RCxNQUF6RCxDQUY2Qjs7QUFJMUMsUUFBTTtBQUNKLFdBQU87QUFDTCxZQUFNLDRCQUFtQixnQkFBZ0IsS0FBaEIsQ0FBbkI7QUFERDtBQURILEdBSm9DOztBQVUxQyxXQUFTLGNBQWMsS0FBZDtBQVZpQyxDQUFWLENBQWxDOztxQkFhZSx5Qjs7O0FBRWYsTUFBTSxrQkFBa0IsU0FDdEIsb0NBQTJCO0FBQ3pCLFFBQU0sQ0FBQyxNQUFELEdBQVMsTUFBTSxXQUFOLEVBQVQsRUFBNkIsS0FBN0IsQ0FEbUI7QUFFekIsZUFBYSxDQUFDLElBQUQsR0FBTyxNQUFNLG1CQUFOLEVBQVAsRUFBbUMsV0FBbkMsQ0FGWTtBQUd6Qix1QkFDSyx1QkFDRCxNQUFNLE9BQU4sQ0FBYyxHQUFkLENBQWtCLFVBQVUsQ0FBQyxPQUFPLFlBQVAsRUFBRCxFQUF3QjtBQUNsRCxVQUFNLENBQUMsT0FBTyxVQUFQLDhDQUFELEVBQWlELGdDQUFjLE1BQWQsQ0FBakQsQ0FENEM7QUFFbEQsaUJBQWEsT0FBTztBQUY4QixHQUF4QixDQUE1QixDQURDLENBREw7QUFPRTtBQVBGO0FBSHlCLENBQTNCLENBREY7O0FBZUEsTUFBTSxvQkFBb0IsU0FDeEIsK0JBQXNCO0FBQ3BCLFFBQU0sQ0FBQyxNQUFELEdBQVMsTUFBTSxXQUFOLEVBQVQsRUFBNkIsT0FBN0IsQ0FEYztBQUVwQixlQUFhLENBQUMsYUFBRCxHQUFnQixNQUFNLG1CQUFOLEVBQWhCLEVBQTRDLCtCQUE1QyxDQUZPOztBQUlwQixVQUFRO0FBQ04sS0FBQyxNQUFNLFlBQU4sRUFBRCxHQUF3QjtBQUN0QixZQUFNLGtDQUFnQixLQUFoQixDQURnQjtBQUV0QixtQkFBYSxDQUFDLGFBQUQsR0FBZ0IsTUFBTSxtQkFBTixFQUFoQixFQUE0QyxDQUE1QyxDQUZTO0FBR3RCLGVBQVMsVUFBVSxPQUFPLE1BQU0sSUFBYjtBQUhHLEtBRGxCO0FBTU47QUFOTTtBQUpZLENBQXRCLENBREY7O0FBZUEsTUFBTSxnQkFBZ0IsU0FBUzs7Ozs7QUFLN0IsUUFBTSxXQUFXLE1BQU0sR0FBTixFQUFqQjs7QUFFQTtBQUFBLGdDQUFPLFdBQU8sTUFBUCxFQUFlLElBQWYsUUFBb0M7QUFBQSxVQUFiLE1BQWEsUUFBYixNQUFhOzs7QUFBQSxZQUVqQyxLQUZpQyxHQUV2QixJQUZ1QixDQUVqQyxLQUZpQztBQUFBLFlBR2pDLGdCQUhpQyxHQUdaLEtBSFksQ0FHakMsZ0JBSGlDOzs7QUFBQSxrQkFLakIsTUFBTSxPQUFPLFVBQVAsQ0FDNUIsU0FDQyxNQURELENBQ1EsdUJBQ04sTUFBTSxPQUFOLENBQ0MsR0FERCxDQUNLO0FBQUEsZUFBVSxDQUFDLE9BQU8sSUFBUixFQUFjLE1BQU0sT0FBTyxZQUFQLEVBQU4sQ0FBZCxDQUFWO0FBQUEsT0FETCxFQUVDLE1BRkQsQ0FFUTtBQUFBOztBQUFBLFlBQUksS0FBSjtBQUFBLGVBQWUsS0FBZjtBQUFBLE9BRlIsQ0FETSxDQURSLEVBTUMsU0FORCxDQU1XLFNBQVMsSUFBVCxFQU5YLEVBT0MsT0FQRCxFQUQ0QixDQUxXOztBQUFBLDRDQUtqQyxJQUxpQzs7QUFBQSxZQUsxQixHQUwwQjs7OztBQWlCekMsYUFBTztBQUNMLFNBQUMsTUFBTSxJQUFQLEdBQWMsTUFBTSxvQkFBTyxHQUFQLEVBQVksRUFBRSxLQUFGLEVBQVosQ0FBTixHQUErQixJQUR4QztBQUVMO0FBRkssT0FBUDtBQUlELEtBckJEOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBc0JELENBN0JEIiwiZmlsZSI6ImNyZWF0ZUluc2VydE11dGF0aW9uRmllbGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBmcm9tUGFpcnMsIGlkZW50aXR5LCBhc3NpZ24gfSBmcm9tICdsb2Rhc2gnXG5pbXBvcnQgZ2V0Q29sdW1uVHlwZSBmcm9tICcuLi9nZXRDb2x1bW5UeXBlLmpzJ1xuaW1wb3J0IGNyZWF0ZVRhYmxlVHlwZSBmcm9tICcuLi9jcmVhdGVUYWJsZVR5cGUuanMnXG5pbXBvcnQgeyBpbnB1dENsaWVudE11dGF0aW9uSWQsIHBheWxvYWRDbGllbnRNdXRhdGlvbklkIH0gZnJvbSAnLi9jbGllbnRNdXRhdGlvbklkLmpzJ1xuXG5pbXBvcnQge1xuICBnZXROdWxsYWJsZVR5cGUsXG4gIEdyYXBoUUxOb25OdWxsLFxuICBHcmFwaFFMT2JqZWN0VHlwZSxcbiAgR3JhcGhRTElucHV0T2JqZWN0VHlwZSxcbn0gZnJvbSAnZ3JhcGhxbCdcblxuLyoqXG4gKiBDcmVhdGVzIGEgbXV0YXRpb24gd2hpY2ggd2lsbCBjcmVhdGUgYSBuZXcgcm93LlxuICpcbiAqIEBwYXJhbSB7VGFibGV9IHRhYmxlXG4gKiBAcmV0dXJucyB7R3JhcGhRTEZpZWxkQ29uZmlnfVxuICovXG5jb25zdCBjcmVhdGVJbnNlcnRNdXRhdGlvbkZpZWxkID0gdGFibGUgPT4gKHtcbiAgdHlwZTogY3JlYXRlUGF5bG9hZFR5cGUodGFibGUpLFxuICBkZXNjcmlwdGlvbjogYENyZWF0ZXMgYSBuZXcgbm9kZSBvZiB0aGUgJHt0YWJsZS5nZXRNYXJrZG93blR5cGVOYW1lKCl9IHR5cGUuYCxcblxuICBhcmdzOiB7XG4gICAgaW5wdXQ6IHtcbiAgICAgIHR5cGU6IG5ldyBHcmFwaFFMTm9uTnVsbChjcmVhdGVJbnB1dFR5cGUodGFibGUpKSxcbiAgICB9LFxuICB9LFxuXG4gIHJlc29sdmU6IHJlc29sdmVJbnNlcnQodGFibGUpLFxufSlcblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlSW5zZXJ0TXV0YXRpb25GaWVsZFxuXG5jb25zdCBjcmVhdGVJbnB1dFR5cGUgPSB0YWJsZSA9PlxuICBuZXcgR3JhcGhRTElucHV0T2JqZWN0VHlwZSh7XG4gICAgbmFtZTogYEluc2VydCR7dGFibGUuZ2V0VHlwZU5hbWUoKX1JbnB1dGAsXG4gICAgZGVzY3JpcHRpb246IGBUaGUgJHt0YWJsZS5nZXRNYXJrZG93blR5cGVOYW1lKCl9IHRvIGluc2VydC5gLFxuICAgIGZpZWxkczoge1xuICAgICAgLi4uZnJvbVBhaXJzKFxuICAgICAgICB0YWJsZS5jb2x1bW5zLm1hcChjb2x1bW4gPT4gW2NvbHVtbi5nZXRGaWVsZE5hbWUoKSwge1xuICAgICAgICAgIHR5cGU6IChjb2x1bW4uaGFzRGVmYXVsdCA/IGdldE51bGxhYmxlVHlwZSA6IGlkZW50aXR5KShnZXRDb2x1bW5UeXBlKGNvbHVtbikpLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBjb2x1bW4uZGVzY3JpcHRpb24sXG4gICAgICAgIH1dKSxcbiAgICAgICksXG4gICAgICBjbGllbnRNdXRhdGlvbklkOiBpbnB1dENsaWVudE11dGF0aW9uSWQsXG4gICAgfSxcbiAgfSlcblxuY29uc3QgY3JlYXRlUGF5bG9hZFR5cGUgPSB0YWJsZSA9PlxuICBuZXcgR3JhcGhRTE9iamVjdFR5cGUoe1xuICAgIG5hbWU6IGBJbnNlcnQke3RhYmxlLmdldFR5cGVOYW1lKCl9UGF5bG9hZGAsXG4gICAgZGVzY3JpcHRpb246IGBDb250YWlucyB0aGUgJHt0YWJsZS5nZXRNYXJrZG93blR5cGVOYW1lKCl9IG5vZGUgaW5zZXJ0ZWQgYnkgdGhlIG11dGF0aW9uLmAsXG5cbiAgICBmaWVsZHM6IHtcbiAgICAgIFt0YWJsZS5nZXRGaWVsZE5hbWUoKV06IHtcbiAgICAgICAgdHlwZTogY3JlYXRlVGFibGVUeXBlKHRhYmxlKSxcbiAgICAgICAgZGVzY3JpcHRpb246IGBUaGUgaW5zZXJ0ZWQgJHt0YWJsZS5nZXRNYXJrZG93blR5cGVOYW1lKCl9LmAsXG4gICAgICAgIHJlc29sdmU6IHNvdXJjZSA9PiBzb3VyY2VbdGFibGUubmFtZV0sXG4gICAgICB9LFxuICAgICAgY2xpZW50TXV0YXRpb25JZDogcGF5bG9hZENsaWVudE11dGF0aW9uSWQsXG4gICAgfSxcbiAgfSlcblxuY29uc3QgcmVzb2x2ZUluc2VydCA9IHRhYmxlID0+IHtcbiAgLy8gTm90ZSB0aGF0IHVzaW5nIGBEYXRhTG9hZGVyYCBoZXJlIHdvdWxkIG5vdCBtYWtlIHZlcnkgbWlub3IgcGVyZm9ybWFuY2VcbiAgLy8gaW1wcm92ZW1lbnRzIGJlY2F1c2UgbXV0YXRpb25zIGFyZSBleGVjdXRlZCBpbiBzZXF1ZW5jZSwgbm90IHBhcmFsbGVsLlxuICAvL1xuICAvLyBBIGJldHRlciBzb2x1dGlvbiBmb3IgYmF0Y2ggaW5zZXJ0cyBpcyBhIGN1c3RvbSBiYXRjaCBpbnNlcnQgZmllbGQuXG4gIGNvbnN0IHRhYmxlU3FsID0gdGFibGUuc3FsKClcblxuICByZXR1cm4gYXN5bmMgKHNvdXJjZSwgYXJncywgeyBjbGllbnQgfSkgPT4ge1xuICAgIC8vIEdldCB0aGUgaW5wdXQgb2JqZWN0IHZhbHVlIGZyb20gdGhlIGFyZ3MuXG4gICAgY29uc3QgeyBpbnB1dCB9ID0gYXJnc1xuICAgIGNvbnN0IHsgY2xpZW50TXV0YXRpb25JZCB9ID0gaW5wdXRcbiAgICAvLyBJbnNlcnQgdGhlIHRoaW5nIG1ha2luZyBzdXJlIHdlIHJldHVybiB0aGUgbmV3bHkgaW5zZXJ0ZWQgcm93LlxuICAgIGNvbnN0IHsgcm93czogW3Jvd10gfSA9IGF3YWl0IGNsaWVudC5xdWVyeUFzeW5jKFxuICAgICAgdGFibGVTcWxcbiAgICAgIC5pbnNlcnQoZnJvbVBhaXJzKFxuICAgICAgICB0YWJsZS5jb2x1bW5zXG4gICAgICAgIC5tYXAoY29sdW1uID0+IFtjb2x1bW4ubmFtZSwgaW5wdXRbY29sdW1uLmdldEZpZWxkTmFtZSgpXV0pXG4gICAgICAgIC5maWx0ZXIoKFssIHZhbHVlXSkgPT4gdmFsdWUpXG4gICAgICApKVxuICAgICAgLnJldHVybmluZyh0YWJsZVNxbC5zdGFyKCkpXG4gICAgICAudG9RdWVyeSgpXG4gICAgKVxuXG4gICAgLy8gUmV0dXJuIHRoZSBmaXJzdCAoYW5kIGxpa2VseSBvbmx5KSByb3cuXG4gICAgcmV0dXJuIHtcbiAgICAgIFt0YWJsZS5uYW1lXTogcm93ID8gYXNzaWduKHJvdywgeyB0YWJsZSB9KSA6IG51bGwsXG4gICAgICBjbGllbnRNdXRhdGlvbklkLFxuICAgIH1cbiAgfVxufVxuIl19