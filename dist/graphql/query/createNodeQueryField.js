'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _graphql = require('graphql');

var _types = require('../types.js');

var _resolveTableSingle = require('../resolveTableSingle.js');

var _resolveTableSingle2 = _interopRequireDefault(_resolveTableSingle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

const createNodeQueryField = schema => ({
  type: _types.NodeType,
  description: 'Fetches an object given its globally unique `ID`.',

  args: {
    id: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLID),
      description: 'The `ID` of the node.'
    }
  },

  resolve: (source, args, context) => {
    const id = args.id;

    var _fromID = (0, _types.fromID)(id);

    const tableName = _fromID.tableName;
    const values = _fromID.values;

    const table = schema.getTable(tableName);

    if (!table) throw new Error(`No table '${ tableName }' in schema '${ schema.name }'.`);

    return getResolver(table)({ values }, {}, context);
  }
});

exports['default'] = createNodeQueryField;

// This function will be called for every resolution, therefore it is (and
// must be) memoized.

const getResolver = (0, _lodash.memoize)(table => (0, _resolveTableSingle2['default'])(table, table.getPrimaryKeyColumns(), _ref => {
  let values = _ref.values;
  return values;
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ncmFwaHFsL3F1ZXJ5L2NyZWF0ZU5vZGVRdWVyeUZpZWxkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFFQSxNQUFNLHVCQUF1QixXQUFXO0FBQ3RDLHVCQURzQztBQUV0QyxlQUFhLG1EQUZ5Qjs7QUFJdEMsUUFBTTtBQUNKLFFBQUk7QUFDRixZQUFNLCtDQURKO0FBRUYsbUJBQWE7QUFGWDtBQURBLEdBSmdDOztBQVd0QyxXQUFTLENBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxPQUFmLEtBQTJCO0FBQUEsVUFDMUIsRUFEMEIsR0FDbkIsSUFEbUIsQ0FDMUIsRUFEMEI7O0FBQUEsa0JBRUosbUJBQU8sRUFBUCxDQUZJOztBQUFBLFVBRTFCLFNBRjBCLFdBRTFCLFNBRjBCO0FBQUEsVUFFZixNQUZlLFdBRWYsTUFGZTs7QUFHbEMsVUFBTSxRQUFRLE9BQU8sUUFBUCxDQUFnQixTQUFoQixDQUFkOztBQUVBLFFBQUksQ0FBQyxLQUFMLEVBQ0UsTUFBTSxJQUFJLEtBQUosQ0FBVSxDQUFDLFVBQUQsR0FBYSxTQUFiLEVBQXVCLGFBQXZCLEdBQXNDLE9BQU8sSUFBN0MsRUFBa0QsRUFBbEQsQ0FBVixDQUFOOztBQUVGLFdBQU8sWUFBWSxLQUFaLEVBQW1CLEVBQUUsTUFBRixFQUFuQixFQUErQixFQUEvQixFQUFtQyxPQUFuQyxDQUFQO0FBQ0Q7QUFwQnFDLENBQVgsQ0FBN0I7O3FCQXVCZSxvQjs7Ozs7QUFJZixNQUFNLGNBQWMscUJBQVEsU0FBUyxxQ0FDbkMsS0FEbUMsRUFFbkMsTUFBTSxvQkFBTixFQUZtQyxFQUduQztBQUFBLE1BQUcsTUFBSCxRQUFHLE1BQUg7QUFBQSxTQUFnQixNQUFoQjtBQUFBLENBSG1DLENBQWpCLENBQXBCIiwiZmlsZSI6ImNyZWF0ZU5vZGVRdWVyeUZpZWxkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbWVtb2l6ZSB9IGZyb20gJ2xvZGFzaCdcbmltcG9ydCB7IEdyYXBoUUxOb25OdWxsLCBHcmFwaFFMSUQgfSBmcm9tICdncmFwaHFsJ1xuaW1wb3J0IHsgTm9kZVR5cGUsIGZyb21JRCB9IGZyb20gJy4uL3R5cGVzLmpzJ1xuaW1wb3J0IHJlc29sdmVUYWJsZVNpbmdsZSBmcm9tICcuLi9yZXNvbHZlVGFibGVTaW5nbGUuanMnXG5cbmNvbnN0IGNyZWF0ZU5vZGVRdWVyeUZpZWxkID0gc2NoZW1hID0+ICh7XG4gIHR5cGU6IE5vZGVUeXBlLFxuICBkZXNjcmlwdGlvbjogJ0ZldGNoZXMgYW4gb2JqZWN0IGdpdmVuIGl0cyBnbG9iYWxseSB1bmlxdWUgYElEYC4nLFxuXG4gIGFyZ3M6IHtcbiAgICBpZDoge1xuICAgICAgdHlwZTogbmV3IEdyYXBoUUxOb25OdWxsKEdyYXBoUUxJRCksXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBgSURgIG9mIHRoZSBub2RlLicsXG4gICAgfSxcbiAgfSxcblxuICByZXNvbHZlOiAoc291cmNlLCBhcmdzLCBjb250ZXh0KSA9PiB7XG4gICAgY29uc3QgeyBpZCB9ID0gYXJnc1xuICAgIGNvbnN0IHsgdGFibGVOYW1lLCB2YWx1ZXMgfSA9IGZyb21JRChpZClcbiAgICBjb25zdCB0YWJsZSA9IHNjaGVtYS5nZXRUYWJsZSh0YWJsZU5hbWUpXG5cbiAgICBpZiAoIXRhYmxlKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBObyB0YWJsZSAnJHt0YWJsZU5hbWV9JyBpbiBzY2hlbWEgJyR7c2NoZW1hLm5hbWV9Jy5gKVxuXG4gICAgcmV0dXJuIGdldFJlc29sdmVyKHRhYmxlKSh7IHZhbHVlcyB9LCB7fSwgY29udGV4dClcbiAgfSxcbn0pXG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZU5vZGVRdWVyeUZpZWxkXG5cbi8vIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgZm9yIGV2ZXJ5IHJlc29sdXRpb24sIHRoZXJlZm9yZSBpdCBpcyAoYW5kXG4vLyBtdXN0IGJlKSBtZW1vaXplZC5cbmNvbnN0IGdldFJlc29sdmVyID0gbWVtb2l6ZSh0YWJsZSA9PiByZXNvbHZlVGFibGVTaW5nbGUoXG4gIHRhYmxlLFxuICB0YWJsZS5nZXRQcmltYXJ5S2V5Q29sdW1ucygpLFxuICAoeyB2YWx1ZXMgfSkgPT4gdmFsdWVzLFxuKSlcbiJdfQ==