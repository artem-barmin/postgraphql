'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _graphql = require('graphql');

var _types = require('../types.js');

var _createTableType = require('../createTableType.js');

var _createTableType2 = _interopRequireDefault(_createTableType);

var _resolveTableSingle = require('../resolveTableSingle.js');

var _resolveTableSingle2 = _interopRequireDefault(_resolveTableSingle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * Creates an object field for selecting a single row of a table.
 *
 * @param {Table} table
 * @returns {GraphQLFieldConfig}
 */
const createSingleQueryField = table => {
  const primaryKeyColumns = table.getPrimaryKeyColumns();

  // Can’t query a single node of a table if it does not have a primary key.
  if (primaryKeyColumns.length === 0) return null;

  return {
    type: (0, _createTableType2['default'])(table),
    description: `Queries a single ${ table.getMarkdownTypeName() } using its primary keys.`,

    args: {
      id: {
        type: new _graphql.GraphQLNonNull(_graphql.GraphQLID)
      }
    },

    resolve: (0, _resolveTableSingle2['default'])(table, primaryKeyColumns, (source, _ref) => {
      let id = _ref.id;

      return [id];
    })
  };
};

exports['default'] = createSingleQueryField;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ncmFwaHFsL3F1ZXJ5L2NyZWF0ZVNpbmdsZVF1ZXJ5RmllbGQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7Ozs7O0FBUUEsTUFBTSx5QkFBeUIsU0FBUztBQUN0QyxRQUFNLG9CQUFvQixNQUFNLG9CQUFOLEVBQTFCOzs7QUFHQSxNQUFJLGtCQUFrQixNQUFsQixLQUE2QixDQUFqQyxFQUNFLE9BQU8sSUFBUDs7QUFFRixTQUFPO0FBQ0wsVUFBTSxrQ0FBZ0IsS0FBaEIsQ0FERDtBQUVMLGlCQUFhLENBQUMsaUJBQUQsR0FBb0IsTUFBTSxtQkFBTixFQUFwQixFQUFnRCx3QkFBaEQsQ0FGUjs7QUFJTCxVQUFNO0FBQ0osVUFBSTtBQUNGLGNBQU07QUFESjtBQURBLEtBSkQ7O0FBVUwsYUFBUyxxQ0FDUCxLQURPLEVBRVAsaUJBRk8sRUFHUCxDQUFDLE1BQUQsV0FBa0I7QUFBQSxVQUFSLEVBQVEsUUFBUixFQUFROztBQUNoQixhQUFPLENBQUMsRUFBRCxDQUFQO0FBQ0QsS0FMTTtBQVZKLEdBQVA7QUFrQkQsQ0F6QkQ7O3FCQTJCZSxzQiIsImZpbGUiOiJjcmVhdGVTaW5nbGVRdWVyeUZpZWxkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgR3JhcGhRTE5vbk51bGwsIEdyYXBoUUxJRCB9IGZyb20gJ2dyYXBocWwnXG5pbXBvcnQgeyBmcm9tSUQgfSBmcm9tICcuLi90eXBlcy5qcydcbmltcG9ydCBjcmVhdGVUYWJsZVR5cGUgZnJvbSAnLi4vY3JlYXRlVGFibGVUeXBlLmpzJ1xuaW1wb3J0IHJlc29sdmVUYWJsZVNpbmdsZSBmcm9tICcuLi9yZXNvbHZlVGFibGVTaW5nbGUuanMnXG5cbi8qKlxuICogQ3JlYXRlcyBhbiBvYmplY3QgZmllbGQgZm9yIHNlbGVjdGluZyBhIHNpbmdsZSByb3cgb2YgYSB0YWJsZS5cbiAqXG4gKiBAcGFyYW0ge1RhYmxlfSB0YWJsZVxuICogQHJldHVybnMge0dyYXBoUUxGaWVsZENvbmZpZ31cbiAqL1xuY29uc3QgY3JlYXRlU2luZ2xlUXVlcnlGaWVsZCA9IHRhYmxlID0+IHtcbiAgY29uc3QgcHJpbWFyeUtleUNvbHVtbnMgPSB0YWJsZS5nZXRQcmltYXJ5S2V5Q29sdW1ucygpXG5cbiAgLy8gQ2Fu4oCZdCBxdWVyeSBhIHNpbmdsZSBub2RlIG9mIGEgdGFibGUgaWYgaXQgZG9lcyBub3QgaGF2ZSBhIHByaW1hcnkga2V5LlxuICBpZiAocHJpbWFyeUtleUNvbHVtbnMubGVuZ3RoID09PSAwKVxuICAgIHJldHVybiBudWxsXG5cbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBjcmVhdGVUYWJsZVR5cGUodGFibGUpLFxuICAgIGRlc2NyaXB0aW9uOiBgUXVlcmllcyBhIHNpbmdsZSAke3RhYmxlLmdldE1hcmtkb3duVHlwZU5hbWUoKX0gdXNpbmcgaXRzIHByaW1hcnkga2V5cy5gLFxuXG4gICAgYXJnczoge1xuICAgICAgaWQ6IHtcbiAgICAgICAgdHlwZTogbmV3IEdyYXBoUUxOb25OdWxsKEdyYXBoUUxJRCksXG4gICAgICB9LFxuICAgIH0sXG5cbiAgICByZXNvbHZlOiByZXNvbHZlVGFibGVTaW5nbGUoXG4gICAgICB0YWJsZSxcbiAgICAgIHByaW1hcnlLZXlDb2x1bW5zLFxuICAgICAgKHNvdXJjZSwge2lkfSkgPT4ge1xuICAgICAgICByZXR1cm4gW2lkXVxuICAgICAgfVxuICAgICksXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlU2luZ2xlUXVlcnlGaWVsZFxuIl19