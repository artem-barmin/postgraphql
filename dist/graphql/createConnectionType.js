'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _createTableType = require('./createTableType.js');

var _createTableType2 = _interopRequireDefault(_createTableType);

var _types = require('./types.js');

var _graphql = require('graphql');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

const createTableConnectionType = (0, _lodash.memoize)(table => new _graphql.GraphQLObjectType({
  name: `${ table.getTypeName() }Connection`,
  description: `A connection to a list of ${ table.getMarkdownTypeName() } items`,

  // TODO: Implement a `ConnectionType` interface

  fields: {
    pageInfo: {
      type: new _graphql.GraphQLNonNull(_types.PageInfoType),
      description: `Information to aid in pagination of type ${ table.getMarkdownTypeName() }.`,
      resolve: pageInfo => pageInfo
    },
    totalCount: {
      type: _graphql.GraphQLInt,
      description: 'All of the items available to be queried in this connection.',
      resolve: _ref => {
        let totalCount = _ref.totalCount;
        return totalCount;
      }
    },
    nodes: {
      type: new _graphql.GraphQLList((0, _createTableType2['default'])(table)),
      description: `The queried list of ${ table.getMarkdownTypeName() }.`,
      resolve: _ref2 => {
        let nodes = _ref2.nodes;
        return nodes;
      }
    },
    edges: {
      type: new _graphql.GraphQLList(createTableEdgeType(table)),
      description: 'A single item and a cursor to aid in pagination.',
      resolve: _ref3 => {
        let edges = _ref3.edges;
        return edges;
      }
    }
  }
}));

exports['default'] = createTableConnectionType;


const createTableEdgeType = table => new _graphql.GraphQLObjectType({
  name: `${ table.getTypeName() }Edge`,
  description: `An edge in the \`${ table.getTypeName() }Connection\`.`,

  fields: {
    cursor: {
      type: new _graphql.GraphQLNonNull(_types.CursorType),
      description: 'The cursor describing the position of the edge’s associated node.',
      resolve: _ref4 => {
        let cursor = _ref4.cursor;
        return cursor || 'null';
      }
    },
    node: {
      type: (0, _createTableType2['default'])(table),
      description: 'The item at the end of the edge.',
      resolve: _ref5 => {
        let node = _ref5.node;
        return node;
      }
    }
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ncmFwaHFsL2NyZWF0ZUNvbm5lY3Rpb25UeXBlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOztBQUNBOzs7O0FBQ0E7O0FBRUE7Ozs7QUFPQSxNQUFNLDRCQUE0QixxQkFBUSxTQUN4QywrQkFBc0I7QUFDcEIsUUFBTSxDQUFDLEFBQUQsR0FBRyxNQUFNLFdBQU4sRUFBSCxFQUF1QixVQUF2QixDQURjO0FBRXBCLGVBQWEsQ0FBQywwQkFBRCxHQUE2QixNQUFNLG1CQUFOLEVBQTdCLEVBQXlELE1BQXpELENBRk87Ozs7QUFNcEIsVUFBUTtBQUNOLGNBQVU7QUFDUixZQUFNLGdEQURFO0FBRVIsbUJBQWEsQ0FBQyx5Q0FBRCxHQUE0QyxNQUFNLG1CQUFOLEVBQTVDLEVBQXdFLENBQXhFLENBRkw7QUFHUixlQUFTLFlBQVk7QUFIYixLQURKO0FBTU4sZ0JBQVk7QUFDViwrQkFEVTtBQUVWLG1CQUFhLDhEQUZIO0FBR1YsZUFBUztBQUFBLFlBQUcsVUFBSCxRQUFHLFVBQUg7QUFBQSxlQUFvQixVQUFwQjtBQUFBO0FBSEMsS0FOTjtBQVdOLFdBQU87QUFDTCxZQUFNLHlCQUFnQixrQ0FBZ0IsS0FBaEIsQ0FBaEIsQ0FERDtBQUVMLG1CQUFhLENBQUMsb0JBQUQsR0FBdUIsTUFBTSxtQkFBTixFQUF2QixFQUFtRCxDQUFuRCxDQUZSO0FBR0wsZUFBUztBQUFBLFlBQUcsS0FBSCxTQUFHLEtBQUg7QUFBQSxlQUFlLEtBQWY7QUFBQTtBQUhKLEtBWEQ7QUFnQk4sV0FBTztBQUNMLFlBQU0seUJBQWdCLG9CQUFvQixLQUFwQixDQUFoQixDQUREO0FBRUwsbUJBQWEsa0RBRlI7QUFHTCxlQUFTO0FBQUEsWUFBRyxLQUFILFNBQUcsS0FBSDtBQUFBLGVBQWUsS0FBZjtBQUFBO0FBSEo7QUFoQkQ7QUFOWSxDQUF0QixDQURnQyxDQUFsQzs7cUJBZ0NlLHlCOzs7QUFFZixNQUFNLHNCQUFzQixTQUMxQiwrQkFBc0I7QUFDcEIsUUFBTSxDQUFDLEFBQUQsR0FBRyxNQUFNLFdBQU4sRUFBSCxFQUF1QixJQUF2QixDQURjO0FBRXBCLGVBQWEsQ0FBQyxpQkFBRCxHQUFvQixNQUFNLFdBQU4sRUFBcEIsRUFBd0MsYUFBeEMsQ0FGTzs7QUFJcEIsVUFBUTtBQUNOLFlBQVE7QUFDTixZQUFNLDhDQURBO0FBRU4sbUJBQWEsbUVBRlA7QUFHTixlQUFTO0FBQUEsWUFBRyxNQUFILFNBQUcsTUFBSDtBQUFBLGVBQWdCLFVBQVUsTUFBMUI7QUFBQTtBQUhILEtBREY7QUFNTixVQUFNO0FBQ0osWUFBTSxrQ0FBZ0IsS0FBaEIsQ0FERjtBQUVKLG1CQUFhLGtDQUZUO0FBR0osZUFBUztBQUFBLFlBQUcsSUFBSCxTQUFHLElBQUg7QUFBQSxlQUFjLElBQWQ7QUFBQTtBQUhMO0FBTkE7QUFKWSxDQUF0QixDQURGIiwiZmlsZSI6ImNyZWF0ZUNvbm5lY3Rpb25UeXBlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbWVtb2l6ZSB9IGZyb20gJ2xvZGFzaCdcbmltcG9ydCBjcmVhdGVUYWJsZVR5cGUgZnJvbSAnLi9jcmVhdGVUYWJsZVR5cGUuanMnXG5pbXBvcnQgeyBQYWdlSW5mb1R5cGUsIEN1cnNvclR5cGUgfSBmcm9tICcuL3R5cGVzLmpzJ1xuXG5pbXBvcnQge1xuICBHcmFwaFFMT2JqZWN0VHlwZSxcbiAgR3JhcGhRTExpc3QsXG4gIEdyYXBoUUxOb25OdWxsLFxuICBHcmFwaFFMSW50LFxufSBmcm9tICdncmFwaHFsJ1xuXG5jb25zdCBjcmVhdGVUYWJsZUNvbm5lY3Rpb25UeXBlID0gbWVtb2l6ZSh0YWJsZSA9PlxuICBuZXcgR3JhcGhRTE9iamVjdFR5cGUoe1xuICAgIG5hbWU6IGAke3RhYmxlLmdldFR5cGVOYW1lKCl9Q29ubmVjdGlvbmAsXG4gICAgZGVzY3JpcHRpb246IGBBIGNvbm5lY3Rpb24gdG8gYSBsaXN0IG9mICR7dGFibGUuZ2V0TWFya2Rvd25UeXBlTmFtZSgpfSBpdGVtc2AsXG5cbiAgICAvLyBUT0RPOiBJbXBsZW1lbnQgYSBgQ29ubmVjdGlvblR5cGVgIGludGVyZmFjZVxuXG4gICAgZmllbGRzOiB7XG4gICAgICBwYWdlSW5mbzoge1xuICAgICAgICB0eXBlOiBuZXcgR3JhcGhRTE5vbk51bGwoUGFnZUluZm9UeXBlKSxcbiAgICAgICAgZGVzY3JpcHRpb246IGBJbmZvcm1hdGlvbiB0byBhaWQgaW4gcGFnaW5hdGlvbiBvZiB0eXBlICR7dGFibGUuZ2V0TWFya2Rvd25UeXBlTmFtZSgpfS5gLFxuICAgICAgICByZXNvbHZlOiBwYWdlSW5mbyA9PiBwYWdlSW5mbyxcbiAgICAgIH0sXG4gICAgICB0b3RhbENvdW50OiB7XG4gICAgICAgIHR5cGU6IEdyYXBoUUxJbnQsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQWxsIG9mIHRoZSBpdGVtcyBhdmFpbGFibGUgdG8gYmUgcXVlcmllZCBpbiB0aGlzIGNvbm5lY3Rpb24uJyxcbiAgICAgICAgcmVzb2x2ZTogKHsgdG90YWxDb3VudCB9KSA9PiB0b3RhbENvdW50LFxuICAgICAgfSxcbiAgICAgIG5vZGVzOiB7XG4gICAgICAgIHR5cGU6IG5ldyBHcmFwaFFMTGlzdChjcmVhdGVUYWJsZVR5cGUodGFibGUpKSxcbiAgICAgICAgZGVzY3JpcHRpb246IGBUaGUgcXVlcmllZCBsaXN0IG9mICR7dGFibGUuZ2V0TWFya2Rvd25UeXBlTmFtZSgpfS5gLFxuICAgICAgICByZXNvbHZlOiAoeyBub2RlcyB9KSA9PiBub2RlcyxcbiAgICAgIH0sXG4gICAgICBlZGdlczoge1xuICAgICAgICB0eXBlOiBuZXcgR3JhcGhRTExpc3QoY3JlYXRlVGFibGVFZGdlVHlwZSh0YWJsZSkpLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Egc2luZ2xlIGl0ZW0gYW5kIGEgY3Vyc29yIHRvIGFpZCBpbiBwYWdpbmF0aW9uLicsXG4gICAgICAgIHJlc29sdmU6ICh7IGVkZ2VzIH0pID0+IGVkZ2VzLFxuICAgICAgfSxcbiAgICB9LFxuICB9KVxuKVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVUYWJsZUNvbm5lY3Rpb25UeXBlXG5cbmNvbnN0IGNyZWF0ZVRhYmxlRWRnZVR5cGUgPSB0YWJsZSA9PlxuICBuZXcgR3JhcGhRTE9iamVjdFR5cGUoe1xuICAgIG5hbWU6IGAke3RhYmxlLmdldFR5cGVOYW1lKCl9RWRnZWAsXG4gICAgZGVzY3JpcHRpb246IGBBbiBlZGdlIGluIHRoZSBcXGAke3RhYmxlLmdldFR5cGVOYW1lKCl9Q29ubmVjdGlvblxcYC5gLFxuXG4gICAgZmllbGRzOiB7XG4gICAgICBjdXJzb3I6IHtcbiAgICAgICAgdHlwZTogbmV3IEdyYXBoUUxOb25OdWxsKEN1cnNvclR5cGUpLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBjdXJzb3IgZGVzY3JpYmluZyB0aGUgcG9zaXRpb24gb2YgdGhlIGVkZ2XigJlzIGFzc29jaWF0ZWQgbm9kZS4nLFxuICAgICAgICByZXNvbHZlOiAoeyBjdXJzb3IgfSkgPT4gY3Vyc29yIHx8ICdudWxsJyxcbiAgICAgIH0sXG4gICAgICBub2RlOiB7XG4gICAgICAgIHR5cGU6IGNyZWF0ZVRhYmxlVHlwZSh0YWJsZSksXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGl0ZW0gYXQgdGhlIGVuZCBvZiB0aGUgZWRnZS4nLFxuICAgICAgICByZXNvbHZlOiAoeyBub2RlIH0pID0+IG5vZGUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0pXG4iXX0=