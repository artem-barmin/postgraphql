'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

var _graphql = require('graphql');

var _types = require('./types.js');

var _getColumnType = require('./getColumnType.js');

var _getColumnType2 = _interopRequireDefault(_getColumnType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

const createConnectionArgs = function createConnectionArgs(table) {
  let ignoreColumnConditions = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
  return _extends({
    // The column specified by `orderBy` means more than just the order to
    // return items in. This column is also the column we will use for
    // cursors.
    orderBy: {
      type: createTableOrderingEnum(table),
      description: 'The order the resulting items should be returned in. This argument ' + 'is also important as it is used in creating pagination cursors. This ' + 'value’s default is the primary key for the object.',
      defaultValue: (() => {
        const column = table.getPrimaryKeyColumns()[0];
        if (column) return column.name;
        return null;
      })()
    },
    first: {
      type: _graphql.GraphQLInt,
      description: 'The top `n` items in the set to be returned. Can’t be used ' + 'with `last`.'
    },
    last: {
      type: _graphql.GraphQLInt,
      description: 'The bottom `n` items in the set to be returned. Can’t be used ' + 'with `first`.'
    },
    before: {
      type: _types.CursorType,
      description: 'Constrains the set to nodes *before* this cursor in the specified ordering.'
    },
    after: {
      type: _types.CursorType,
      description: 'Constrains the set to nodes *after* this cursor in the specified ordering.'
    },
    offset: {
      type: _graphql.GraphQLInt,
      description: 'An integer offset representing how many items to skip in the set.'
    },
    descending: {
      type: _graphql.GraphQLBoolean,
      description: 'If `true` the nodes will be in descending order, if `false` the ' + 'items will be in ascending order. `false` by default.',
      defaultValue: false
    }
  }, (0, _lodash.fromPairs)(table.columns.filter(column => !(0, _lodash.includes)(ignoreColumnConditions, column)).map(column => [column.getFieldName(), {
    type: (0, _graphql.getNullableType)((0, _getColumnType2['default'])(column)),
    description: 'Filters the resulting set with an equality test on the ' + `${ column.getMarkdownFieldName() } field.`
  }])));
};

exports['default'] = createConnectionArgs;

/**
 * Creates an ordering enum which simply contains all of a `Table`s columns.
 *
 * @param {Table} table
 * @returns {GraphQLEnumType}
 */
// TODO: Some way to eliminate some columns from ordering enum?

const createTableOrderingEnum = (0, _lodash.memoize)(table => new _graphql.GraphQLEnumType({
  name: `${ table.getTypeName() }Ordering`,
  description: `Properties with which ${ table.getMarkdownTypeName() } can be ordered.`,

  values: (0, _lodash.fromPairs)(table.columns.map(column => [(0, _lodash.toUpper)((0, _lodash.snakeCase)(column.getFieldName())), {
    value: column.name,
    description: column.description
  }]))
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ncmFwaHFsL2NyZWF0ZUNvbm5lY3Rpb25BcmdzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVBLE1BQU0sdUJBQXVCLFNBQXZCLG9CQUF1QixDQUFDLEtBQUQ7QUFBQSxNQUFRLHNCQUFSLHlEQUFpQyxFQUFqQztBQUFBOzs7O0FBSTNCLGFBQVM7QUFDUCxZQUFNLHdCQUF3QixLQUF4QixDQURDO0FBRVAsbUJBQ0Usd0VBQ0EsdUVBREEsR0FFQSxvREFMSztBQU1QLG9CQUFjLENBQUMsTUFBTTtBQUNuQixjQUFNLFNBQVMsTUFBTSxvQkFBTixHQUE2QixDQUE3QixDQUFmO0FBQ0EsWUFBSSxNQUFKLEVBQVksT0FBTyxPQUFPLElBQWQ7QUFDWixlQUFPLElBQVA7QUFDRCxPQUphO0FBTlAsS0FKa0I7QUFnQjNCLFdBQU87QUFDTCwrQkFESztBQUVMLG1CQUNFLGdFQUNBO0FBSkcsS0FoQm9CO0FBc0IzQixVQUFNO0FBQ0osK0JBREk7QUFFSixtQkFDRSxtRUFDQTtBQUpFLEtBdEJxQjtBQTRCM0IsWUFBUTtBQUNOLDZCQURNO0FBRU4sbUJBQWE7QUFGUCxLQTVCbUI7QUFnQzNCLFdBQU87QUFDTCw2QkFESztBQUVMLG1CQUFhO0FBRlIsS0FoQ29CO0FBb0MzQixZQUFRO0FBQ04sK0JBRE07QUFFTixtQkFBYTtBQUZQLEtBcENtQjtBQXdDM0IsZ0JBQVk7QUFDVixtQ0FEVTtBQUVWLG1CQUNFLHFFQUNBLHVEQUpRO0FBS1Ysb0JBQWM7QUFMSjtBQXhDZSxLQStDeEIsdUJBQ0QsTUFBTSxPQUFOLENBQ0MsTUFERCxDQUNRLFVBQVUsQ0FBQyxzQkFBUyxzQkFBVCxFQUFpQyxNQUFqQyxDQURuQixFQUVDLEdBRkQsQ0FFSyxVQUFVLENBQUMsT0FBTyxZQUFQLEVBQUQsRUFBd0I7QUFDckMsVUFBTSw4QkFBZ0IsZ0NBQWMsTUFBZCxDQUFoQixDQUQrQjtBQUVyQyxpQkFDRSw0REFDQSxDQUFDLEFBQUQsR0FBRyxPQUFPLG9CQUFQLEVBQUgsRUFBaUMsT0FBakM7QUFKbUMsR0FBeEIsQ0FGZixDQURDLENBL0N3QjtBQUFBLENBQTdCOztxQkEyRGUsb0I7Ozs7Ozs7Ozs7QUFTZixNQUFNLDBCQUEwQixxQkFBUSxTQUN0Qyw2QkFBb0I7QUFDbEIsUUFBTSxDQUFDLEFBQUQsR0FBRyxNQUFNLFdBQU4sRUFBSCxFQUF1QixRQUF2QixDQURZO0FBRWxCLGVBQWEsQ0FBQyxzQkFBRCxHQUF5QixNQUFNLG1CQUFOLEVBQXpCLEVBQXFELGdCQUFyRCxDQUZLOztBQUlsQixVQUFRLHVCQUNOLE1BQU0sT0FBTixDQUNDLEdBREQsQ0FDSyxVQUFVLENBQUMscUJBQVEsdUJBQVUsT0FBTyxZQUFQLEVBQVYsQ0FBUixDQUFELEVBQTRDO0FBQ3pELFdBQU8sT0FBTyxJQUQyQztBQUV6RCxpQkFBYSxPQUFPO0FBRnFDLEdBQTVDLENBRGYsQ0FETTtBQUpVLENBQXBCLENBRDhCLENBQWhDIiwiZmlsZSI6ImNyZWF0ZUNvbm5lY3Rpb25BcmdzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbWVtb2l6ZSwgZnJvbVBhaXJzLCBpbmNsdWRlcywgc25ha2VDYXNlLCB0b1VwcGVyIH0gZnJvbSAnbG9kYXNoJ1xuaW1wb3J0IHsgZ2V0TnVsbGFibGVUeXBlLCBHcmFwaFFMRW51bVR5cGUsIEdyYXBoUUxJbnQsIEdyYXBoUUxCb29sZWFuIH0gZnJvbSAnZ3JhcGhxbCdcbmltcG9ydCB7IEN1cnNvclR5cGUgfSBmcm9tICcuL3R5cGVzLmpzJ1xuaW1wb3J0IGdldENvbHVtblR5cGUgZnJvbSAnLi9nZXRDb2x1bW5UeXBlLmpzJ1xuXG5jb25zdCBjcmVhdGVDb25uZWN0aW9uQXJncyA9ICh0YWJsZSwgaWdub3JlQ29sdW1uQ29uZGl0aW9ucyA9IFtdKSA9PiAoe1xuICAvLyBUaGUgY29sdW1uIHNwZWNpZmllZCBieSBgb3JkZXJCeWAgbWVhbnMgbW9yZSB0aGFuIGp1c3QgdGhlIG9yZGVyIHRvXG4gIC8vIHJldHVybiBpdGVtcyBpbi4gVGhpcyBjb2x1bW4gaXMgYWxzbyB0aGUgY29sdW1uIHdlIHdpbGwgdXNlIGZvclxuICAvLyBjdXJzb3JzLlxuICBvcmRlckJ5OiB7XG4gICAgdHlwZTogY3JlYXRlVGFibGVPcmRlcmluZ0VudW0odGFibGUpLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ1RoZSBvcmRlciB0aGUgcmVzdWx0aW5nIGl0ZW1zIHNob3VsZCBiZSByZXR1cm5lZCBpbi4gVGhpcyBhcmd1bWVudCAnICtcbiAgICAgICdpcyBhbHNvIGltcG9ydGFudCBhcyBpdCBpcyB1c2VkIGluIGNyZWF0aW5nIHBhZ2luYXRpb24gY3Vyc29ycy4gVGhpcyAnICtcbiAgICAgICd2YWx1ZeKAmXMgZGVmYXVsdCBpcyB0aGUgcHJpbWFyeSBrZXkgZm9yIHRoZSBvYmplY3QuJyxcbiAgICBkZWZhdWx0VmFsdWU6ICgoKSA9PiB7XG4gICAgICBjb25zdCBjb2x1bW4gPSB0YWJsZS5nZXRQcmltYXJ5S2V5Q29sdW1ucygpWzBdXG4gICAgICBpZiAoY29sdW1uKSByZXR1cm4gY29sdW1uLm5hbWVcbiAgICAgIHJldHVybiBudWxsXG4gICAgfSkoKSxcbiAgfSxcbiAgZmlyc3Q6IHtcbiAgICB0eXBlOiBHcmFwaFFMSW50LFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ1RoZSB0b3AgYG5gIGl0ZW1zIGluIHRoZSBzZXQgdG8gYmUgcmV0dXJuZWQuIENhbuKAmXQgYmUgdXNlZCAnICtcbiAgICAgICd3aXRoIGBsYXN0YC4nLFxuICB9LFxuICBsYXN0OiB7XG4gICAgdHlwZTogR3JhcGhRTEludCxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdUaGUgYm90dG9tIGBuYCBpdGVtcyBpbiB0aGUgc2V0IHRvIGJlIHJldHVybmVkLiBDYW7igJl0IGJlIHVzZWQgJyArXG4gICAgICAnd2l0aCBgZmlyc3RgLicsXG4gIH0sXG4gIGJlZm9yZToge1xuICAgIHR5cGU6IEN1cnNvclR5cGUsXG4gICAgZGVzY3JpcHRpb246ICdDb25zdHJhaW5zIHRoZSBzZXQgdG8gbm9kZXMgKmJlZm9yZSogdGhpcyBjdXJzb3IgaW4gdGhlIHNwZWNpZmllZCBvcmRlcmluZy4nLFxuICB9LFxuICBhZnRlcjoge1xuICAgIHR5cGU6IEN1cnNvclR5cGUsXG4gICAgZGVzY3JpcHRpb246ICdDb25zdHJhaW5zIHRoZSBzZXQgdG8gbm9kZXMgKmFmdGVyKiB0aGlzIGN1cnNvciBpbiB0aGUgc3BlY2lmaWVkIG9yZGVyaW5nLicsXG4gIH0sXG4gIG9mZnNldDoge1xuICAgIHR5cGU6IEdyYXBoUUxJbnQsXG4gICAgZGVzY3JpcHRpb246ICdBbiBpbnRlZ2VyIG9mZnNldCByZXByZXNlbnRpbmcgaG93IG1hbnkgaXRlbXMgdG8gc2tpcCBpbiB0aGUgc2V0LicsXG4gIH0sXG4gIGRlc2NlbmRpbmc6IHtcbiAgICB0eXBlOiBHcmFwaFFMQm9vbGVhbixcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdJZiBgdHJ1ZWAgdGhlIG5vZGVzIHdpbGwgYmUgaW4gZGVzY2VuZGluZyBvcmRlciwgaWYgYGZhbHNlYCB0aGUgJyArXG4gICAgICAnaXRlbXMgd2lsbCBiZSBpbiBhc2NlbmRpbmcgb3JkZXIuIGBmYWxzZWAgYnkgZGVmYXVsdC4nLFxuICAgIGRlZmF1bHRWYWx1ZTogZmFsc2UsXG4gIH0sXG4gIC4uLmZyb21QYWlycyhcbiAgICB0YWJsZS5jb2x1bW5zXG4gICAgLmZpbHRlcihjb2x1bW4gPT4gIWluY2x1ZGVzKGlnbm9yZUNvbHVtbkNvbmRpdGlvbnMsIGNvbHVtbikpXG4gICAgLm1hcChjb2x1bW4gPT4gW2NvbHVtbi5nZXRGaWVsZE5hbWUoKSwge1xuICAgICAgdHlwZTogZ2V0TnVsbGFibGVUeXBlKGdldENvbHVtblR5cGUoY29sdW1uKSksXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgJ0ZpbHRlcnMgdGhlIHJlc3VsdGluZyBzZXQgd2l0aCBhbiBlcXVhbGl0eSB0ZXN0IG9uIHRoZSAnICtcbiAgICAgICAgYCR7Y29sdW1uLmdldE1hcmtkb3duRmllbGROYW1lKCl9IGZpZWxkLmAsXG4gICAgfV0pXG4gICksXG59KVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVDb25uZWN0aW9uQXJnc1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gb3JkZXJpbmcgZW51bSB3aGljaCBzaW1wbHkgY29udGFpbnMgYWxsIG9mIGEgYFRhYmxlYHMgY29sdW1ucy5cbiAqXG4gKiBAcGFyYW0ge1RhYmxlfSB0YWJsZVxuICogQHJldHVybnMge0dyYXBoUUxFbnVtVHlwZX1cbiAqL1xuLy8gVE9ETzogU29tZSB3YXkgdG8gZWxpbWluYXRlIHNvbWUgY29sdW1ucyBmcm9tIG9yZGVyaW5nIGVudW0/XG5jb25zdCBjcmVhdGVUYWJsZU9yZGVyaW5nRW51bSA9IG1lbW9pemUodGFibGUgPT5cbiAgbmV3IEdyYXBoUUxFbnVtVHlwZSh7XG4gICAgbmFtZTogYCR7dGFibGUuZ2V0VHlwZU5hbWUoKX1PcmRlcmluZ2AsXG4gICAgZGVzY3JpcHRpb246IGBQcm9wZXJ0aWVzIHdpdGggd2hpY2ggJHt0YWJsZS5nZXRNYXJrZG93blR5cGVOYW1lKCl9IGNhbiBiZSBvcmRlcmVkLmAsXG5cbiAgICB2YWx1ZXM6IGZyb21QYWlycyhcbiAgICAgIHRhYmxlLmNvbHVtbnNcbiAgICAgIC5tYXAoY29sdW1uID0+IFt0b1VwcGVyKHNuYWtlQ2FzZShjb2x1bW4uZ2V0RmllbGROYW1lKCkpKSwge1xuICAgICAgICB2YWx1ZTogY29sdW1uLm5hbWUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBjb2x1bW4uZGVzY3JpcHRpb24sXG4gICAgICB9XSlcbiAgICApLFxuICB9KSlcbiJdfQ==