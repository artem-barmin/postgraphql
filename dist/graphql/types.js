'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UUIDType = exports.JSONType = exports.IntervalType = exports.CircleType = exports.PointType = exports.DateType = exports.BigIntType = exports.PageInfoType = exports.CursorType = exports.NodeType = exports.fromID = exports.toID = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _graphql = require('graphql');

/* ============================================================================
 * Utilities
 * ========================================================================= */

const toBase64 = value => new Buffer(value.toString()).toString('base64');
const fromBase64 = value => new Buffer(value.toString(), 'base64').toString();

const createStringScalarType = _ref => {
  let name = _ref.name;
  let description = _ref.description;
  return new _graphql.GraphQLScalarType({
    name,
    description,
    serialize: String,
    parseValue: String,
    parseLiteral: ast => ast.kind === _graphql.Kind.STRING ? ast.value : null
  });
};

/* ============================================================================
 * Node Types
 * ========================================================================= */

const toID = exports.toID = (tableName, values) => toBase64(`${ tableName }:${ values.join(',') }`);

const fromID = exports.fromID = encodedString => {
  const string = fromBase64(encodedString);
  if (!string) throw new Error(`Invalid ID '${ encodedString }'.`);

  var _string$split = string.split(':', 2);

  var _string$split2 = _slicedToArray(_string$split, 2);

  const tableName = _string$split2[0];
  const valueString = _string$split2[1];

  if (!valueString) throw new Error(`Invalid ID '${ encodedString }'.`);
  const values = valueString.split(',');
  return {
    tableName,
    values
  };
};

const NodeType = exports.NodeType = new _graphql.GraphQLInterfaceType({
  name: 'Node',
  description: 'A single node object in the graph with a globally unique identifier.',
  fields: {
    id: {
      type: _graphql.GraphQLID,
      description: 'The `Node`’s globally unique identifier used to refetch the node.'
    }
  }
});

/* ============================================================================
 * Connection Types
 * ========================================================================= */

const CursorType = exports.CursorType = new _graphql.GraphQLScalarType({
  name: 'Cursor',
  description: 'An opaque base64 encoded string describing a location in a list of items.',
  serialize: toBase64,
  parseValue: fromBase64,
  parseLiteral: ast => ast.kind === _graphql.Kind.STRING ? fromBase64(ast.value) : null
});

const PageInfoType = exports.PageInfoType = new _graphql.GraphQLObjectType({
  name: 'PageInfo',
  description: 'Information about pagination in a connection.',
  fields: {
    hasNextPage: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLBoolean),
      description: 'Are there items after our result set to be queried?',
      resolve: _ref2 => {
        let hasNextPage = _ref2.hasNextPage;
        return hasNextPage;
      }
    },
    hasPreviousPage: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLBoolean),
      description: 'Are there items before our result set to be queried?',
      resolve: _ref3 => {
        let hasPreviousPage = _ref3.hasPreviousPage;
        return hasPreviousPage;
      }
    },
    startCursor: {
      type: CursorType,
      description: 'The cursor for the first item in the list.',
      resolve: _ref4 => {
        let startCursor = _ref4.startCursor;
        return startCursor;
      }
    },
    endCursor: {
      type: CursorType,
      description: 'The cursor for the last item in the list.',
      resolve: _ref5 => {
        let endCursor = _ref5.endCursor;
        return endCursor;
      }
    }
  }
});

/* ============================================================================
 * PostgreSQL Types
 * ========================================================================= */

const BigIntType = exports.BigIntType = createStringScalarType({
  name: 'BigInt',
  description: 'A signed eight-byte integer represented as a string'
});

const DateType = exports.DateType = createStringScalarType({
  name: 'Date',
  description: 'Some time value'
});

const PointType = exports.PointType = new _graphql.GraphQLObjectType({
  name: 'Point',
  description: 'A geometric point on a plane',
  fields: {
    x: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLFloat),
      description: 'The x coordinate of the point'
    },
    y: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLFloat),
      description: 'The y coordinate of the point'
    }
  }
});

const CircleType = exports.CircleType = new _graphql.GraphQLObjectType({
  name: 'Circle',
  description: 'Some circle on a plane made of a point and a radius',
  fields: {
    x: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLFloat),
      description: 'The x coordinate of the circle'
    },
    y: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLFloat),
      description: 'The y coordinate of the circle'
    },
    radius: {
      type: new _graphql.GraphQLNonNull(_graphql.GraphQLFloat),
      description: 'The radius of the circle'
    }
  }
});

const IntervalType = exports.IntervalType = new _graphql.GraphQLObjectType({
  name: 'Interval',
  description: 'Some time span',
  fields: {
    milliseconds: {
      type: _graphql.GraphQLInt
    },
    seconds: {
      type: _graphql.GraphQLInt
    },
    minutes: {
      type: _graphql.GraphQLInt
    },
    hours: {
      type: _graphql.GraphQLInt
    },
    days: {
      type: _graphql.GraphQLInt
    },
    months: {
      type: _graphql.GraphQLInt
    },
    years: {
      type: _graphql.GraphQLInt
    }
  }
});

const JSONType = exports.JSONType = createStringScalarType({
  name: 'JSON',
  description: 'An object not queryable by GraphQL'
});

const UUIDType = exports.UUIDType = createStringScalarType({
  name: 'UUID',
  description: 'A universally unique identifier'
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ncmFwaHFsL3R5cGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBOzs7Ozs7QUFPQSxNQUFNLFdBQVcsU0FBUyxJQUFJLE1BQUosQ0FBVyxNQUFNLFFBQU4sRUFBWCxFQUE2QixRQUE3QixDQUFzQyxRQUF0QyxDQUExQjtBQUNBLE1BQU0sYUFBYSxTQUFTLElBQUksTUFBSixDQUFXLE1BQU0sUUFBTixFQUFYLEVBQTZCLFFBQTdCLEVBQXVDLFFBQXZDLEVBQTVCOztBQUVBLE1BQU0seUJBQXlCO0FBQUEsTUFBRSxJQUFGLFFBQUUsSUFBRjtBQUFBLE1BQVEsV0FBUixRQUFRLFdBQVI7QUFBQSxTQUF5QiwrQkFBc0I7QUFDNUUsUUFENEU7QUFFNUUsZUFGNEU7QUFHNUUsZUFBVyxNQUhpRTtBQUk1RSxnQkFBWSxNQUpnRTtBQUs1RSxrQkFBYyxPQUFRLElBQUksSUFBSixLQUFhLGNBQUssTUFBbEIsR0FBMkIsSUFBSSxLQUEvQixHQUF1QztBQUxlLEdBQXRCLENBQXpCO0FBQUEsQ0FBL0I7Ozs7OztBQVlPLE1BQU0sc0JBQU8sQ0FBQyxTQUFELEVBQVksTUFBWixLQUF1QixTQUFTLENBQUMsQUFBRCxHQUFHLFNBQUgsRUFBYSxDQUFiLEdBQWdCLE9BQU8sSUFBUCxDQUFZLEdBQVosQ0FBaEIsRUFBaUMsQUFBakMsQ0FBVCxDQUFwQzs7QUFFQSxNQUFNLDBCQUFTLGlCQUFpQjtBQUNyQyxRQUFNLFNBQVMsV0FBVyxhQUFYLENBQWY7QUFDQSxNQUFJLENBQUMsTUFBTCxFQUNFLE1BQU0sSUFBSSxLQUFKLENBQVUsQ0FBQyxZQUFELEdBQWUsYUFBZixFQUE2QixFQUE3QixDQUFWLENBQU47O0FBSG1DLHNCQUlKLE9BQU8sS0FBUCxDQUFhLEdBQWIsRUFBa0IsQ0FBbEIsQ0FKSTs7QUFBQTs7QUFBQSxRQUk5QixTQUo4QjtBQUFBLFFBSW5CLFdBSm1COztBQUtyQyxNQUFJLENBQUMsV0FBTCxFQUNFLE1BQU0sSUFB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O0FBSHdDLENBQXRCLENBQXJCOztBQTRCQSxNQUFNLDhCQUFXLHVCQUF1QjtBQUM3QyxRQUFNLE1BRHVDO0FBRTdDLGVBQWE7QUFGZ0MsQ0FBdkIsQ0FBakI7O0FBS0EsTUFBTSw4QkFBVyx1QkFBdUI7QUFDN0MsUUFBTSxNQUR1QztBQUU3QyxlQUFhO0FBRmdDLENBQXZCLENBQWpCIiwiZmlsZSI6InR5cGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgS2luZCwgR3JhcGhRTEJvb2xlYW4sIEdyYXBoUUxJbnQsIEdyYXBoUUxGbG9hdCwgR3JhcGhRTElELCBHcmFwaFFMTm9uTnVsbCwgR3JhcGhRTFNjYWxhclR5cGUsIEdyYXBoUUxPYmplY3RUeXBlLCBHcmFwaFFMSW50ZXJmYWNlVHlwZSxcbn0gZnJvbSAnZ3JhcGhxbCdcblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogVXRpbGl0aWVzXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbmNvbnN0IHRvQmFzZTY0ID0gdmFsdWUgPT4gbmV3IEJ1ZmZlcih2YWx1ZS50b1N0cmluZygpKS50b1N0cmluZygnYmFzZTY0JylcbmNvbnN0IGZyb21CYXNlNjQgPSB2YWx1ZSA9PiBuZXcgQnVmZmVyKHZhbHVlLnRvU3RyaW5nKCksICdiYXNlNjQnKS50b1N0cmluZygpXG5cbmNvbnN0IGNyZWF0ZVN0cmluZ1NjYWxhclR5cGUgPSAoe25hbWUsIGRlc2NyaXB0aW9ufSkgPT4gbmV3IEdyYXBoUUxTY2FsYXJUeXBlKHtcbiAgbmFtZSxcbiAgZGVzY3JpcHRpb24sXG4gIHNlcmlhbGl6ZTogU3RyaW5nLFxuICBwYXJzZVZhbHVlOiBTdHJpbmcsXG4gIHBhcnNlTGl0ZXJhbDogYXN0ID0+IChhc3Qua2luZCA9PT0gS2luZC5TVFJJTkcgPyBhc3QudmFsdWUgOiBudWxsKSxcbn0pXG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIE5vZGUgVHlwZXNcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuZXhwb3J0IGNvbnN0IHRvSUQgPSAodGFibGVOYW1lLCB2YWx1ZXMpID0+IHRvQmFzZTY0KGAke3RhYmxlTmFtZX06JHt2YWx1ZXMuam9pbignLCcpfWApXG5cbmV4cG9ydCBjb25zdCBmcm9tSUQgPSBlbmNvZGVkU3RyaW5nID0+IHtcbiAgY29uc3Qgc3RyaW5nID0gZnJvbUJhc2U2NChlbmNvZGVkU3RyaW5nKVxuICBpZiAoIXN0cmluZylcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgSUQgJyR7ZW5jb2RlZFN0cmluZ30nLmApXG4gIGNvbnN0IFt0YWJsZU5hbWUsIHZhbHVlU3RyaW5nXSA9IHN0cmluZy5zcGxpdCgnOicsIDIpXG4gIGlmICghdmFsdWVTdHJpbmcpXG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIElEICcke2VuY29kZWRTdHJpbmd9Jy5gKVxuICBjb25zdCB2YWx1ZXMgPSB2YWx1ZVN0cmluZy5zcGxpdCgnLCcpXG4gIHJldHVybiB7XG4gICAgdGFibGVOYW1lLFxuICAgIHZhbHVlc1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBOb2RlVHlwZSA9IG5ldyBHcmFwaFFMSW50ZXJmYWNlVHlwZSh7XG4gIG5hbWU6ICdOb2RlJyxcbiAgZGVzY3JpcHRpb246ICdBIHNpbmdsZSBub2RlIG9iamVjdCBpbiB0aGUgZ3JhcGggd2l0aCBhIGdsb2JhbGx5IHVuaXF1ZSBpZGVudGlmaWVyLicsXG4gIGZpZWxkczoge1xuICAgIGlkOiB7XG4gICAgICB0eXBlOiBHcmFwaFFMSUQsXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBgTm9kZWDigJlzIGdsb2JhbGx5IHVuaXF1ZSBpZGVudGlmaWVyIHVzZWQgdG8gcmVmZXRjaCB0aGUgbm9kZS4nLFxuICAgIH0sXG4gIH0sXG59KVxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb25uZWN0aW9uIFR5cGVzXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbmV4cG9ydCBjb25zdCBDdXJzb3JUeXBlID0gbmV3IEdyYXBoUUxTY2FsYXJUeXBlKHtcbiAgbmFtZTogJ0N1cnNvcicsXG4gIGRlc2NyaXB0aW9uOiAnQW4gb3BhcXVlIGJhc2U2NCBlbmNvZGVkIHN0cmluZyBkZXNjcmliaW5nIGEgbG9jYXRpb24gaW4gYSBsaXN0IG9mIGl0ZW1zLicsXG4gIHNlcmlhbGl6ZTogdG9CYXNlNjQsXG4gIHBhcnNlVmFsdWU6IGZyb21CYXNlNjQsXG4gIHBhcnNlTGl0ZXJhbDogYXN0ID0+IChhc3Qua2luZCA9PT0gS2luZC5TVFJJTkcgPyBmcm9tQmFzZTY0KGFzdC52YWx1ZSkgOiBudWxsKSxcbn0pXG5cbmV4cG9ydCBjb25zdCBQYWdlSW5mb1R5cGUgPSBuZXcgR3JhcGhRTE9iamVjdFR5cGUoe1xuICBuYW1lOiAnUGFnZUluZm8nLFxuICBkZXNjcmlwdGlvbjogJ0luZm9ybWF0aW9uIGFib3V0IHBhZ2luYXRpb24gaW4gYSBjb25uZWN0aW9uLicsXG4gIGZpZWxkczoge1xuICAgIGhhc05leHRQYWdlOiB7XG4gICAgICB0eXBlOiBuZXcgR3JhcGhRTE5vbk51bGwoR3JhcGhRTEJvb2xlYW4pLFxuICAgICAgZGVzY3JpcHRpb246ICdBcmUgdGhlcmUgaXRlbXMgYWZ0ZXIgb3VyIHJlc3VsdCBzZXQgdG8gYmUgcXVlcmllZD8nLFxuICAgICAgcmVzb2x2ZTogKHtoYXNOZXh0UGFnZX0pID0+IGhhc05leHRQYWdlLFxuICAgIH0sXG4gICAgaGFzUHJldmlvdXNQYWdlOiB7XG4gICAgICB0eXBlOiBuZXcgR3JhcGhRTE5vbk51bGwoR3JhcGhRTEJvb2xlYW4pLFxuICAgICAgZGVzY3JpcHRpb246ICdBcmUgdGhlcmUgaXRlbXMgYmVmb3JlIG91ciByZXN1bHQgc2V0IHRvIGJlIHF1ZXJpZWQ/JyxcbiAgICAgIHJlc29sdmU6ICh7aGFzUHJldmlvdXNQYWdlfSkgPT4gaGFzUHJldmlvdXNQYWdlLFxuICAgIH0sXG4gICAgc3RhcnRDdXJzb3I6IHtcbiAgICAgIHR5cGU6IEN1cnNvclR5cGUsXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBjdXJzb3IgZm9yIHRoZSBmaXJzdCBpdGVtIGluIHRoZSBsaXN0LicsXG4gICAgICByZXNvbHZlOiAoe3N0YXJ0Q3Vyc29yfSkgPT4gc3RhcnRDdXJzb3IsXG4gICAgfSxcbiAgICBlbmRDdXJzb3I6IHtcbiAgICAgIHR5cGU6IEN1cnNvclR5cGUsXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBjdXJzb3IgZm9yIHRoZSBsYXN0IGl0ZW0gaW4gdGhlIGxpc3QuJyxcbiAgICAgIHJlc29sdmU6ICh7ZW5kQ3Vyc29yfSkgPT4gZW5kQ3Vyc29yLFxuICAgIH0sXG4gIH0sXG59KVxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBQb3N0Z3JlU1FMIFR5cGVzXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbmV4cG9ydCBjb25zdCBCaWdJbnRUeXBlID0gY3JlYXRlU3RyaW5nU2NhbGFyVHlwZSh7XG4gIG5hbWU6ICdCaWdJbnQnLFxuICBkZXNjcmlwdGlvbjogJ0Egc2lnbmVkIGVpZ2h0LWJ5dGUgaW50ZWdlciByZXByZXNlbnRlZCBhcyBhIHN0cmluZycsXG59KVxuXG5leHBvcnQgY29uc3QgRGF0ZVR5cGUgPSBjcmVhdGVTdHJpbmdTY2FsYXJUeXBlKHtcbiAgbmFtZTogJ0RhdGUnLFxuICBkZXNjcmlwdGlvbjogJ1NvbWUgdGltZSB2YWx1ZScsXG59KVxuXG5leHBvcnQgY29uc3QgUG9pbnRUeXBlID0gbmV3IEdyYXBoUUxPYmplY3RUeXBlKHtcbiAgbmFtZTogJ1BvaW50JyxcbiAgZGVzY3JpcHRpb246ICdBIGdlb21ldHJpYyBwb2ludCBvbiBhIHBsYW5lJyxcbiAgZmllbGRzOiB7XG4gICAgeDoge1xuICAgICAgdHlwZTogbmV3IEdyYXBoUUxOb25OdWxsKEdyYXBoUUxGbG9hdCksXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSB4IGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50JyxcbiAgICB9LFxuICAgIHk6IHtcbiAgICAgIHR5cGU6IG5ldyBHcmFwaFFMTm9uTnVsbChHcmFwaFFMRmxvYXQpLFxuICAgICAgZGVzY3JpcHRpb246ICdUaGUgeSBjb29yZGluYXRlIG9mIHRoZSBwb2ludCcsXG4gICAgfSxcbiAgfSxcbn0pXG5cbmV4cG9ydCBjb25zdCBDaXJjbGVUeXBlID0gbmV3IEdyYXBoUUxPYmplY3RUeXBlKHtcbiAgbmFtZTogJ0NpcmNsZScsXG4gIGRlc2NyaXB0aW9uOiAnU29tZSBjaXJjbGUgb24gYSBwbGFuZSBtYWRlIG9mIGEgcG9pbnQgYW5kIGEgcmFkaXVzJyxcbiAgZmllbGRzOiB7XG4gICAgeDoge1xuICAgICAgdHlwZTogbmV3IEdyYXBoUUxOb25OdWxsKEdyYXBoUUxGbG9hdCksXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSB4IGNvb3JkaW5hdGUgb2YgdGhlIGNpcmNsZScsXG4gICAgfSxcbiAgICB5OiB7XG4gICAgICB0eXBlOiBuZXcgR3JhcGhRTE5vbk51bGwoR3JhcGhRTEZsb2F0KSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHkgY29vcmRpbmF0ZSBvZiB0aGUgY2lyY2xlJyxcbiAgICB9LFxuICAgIHJhZGl1czoge1xuICAgICAgdHlwZTogbmV3IEdyYXBoUUxOb25OdWxsKEdyYXBoUUxGbG9hdCksXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSByYWRpdXMgb2YgdGhlIGNpcmNsZScsXG4gICAgfSxcbiAgfSxcbn0pXG5cbmV4cG9ydCBjb25zdCBJbnRlcnZhbFR5cGUgPSBuZXcgR3JhcGhRTE9iamVjdFR5cGUoe1xuICBuYW1lOiAnSW50ZXJ2YWwnLFxuICBkZXNjcmlwdGlvbjogJ1NvbWUgdGltZSBzcGFuJyxcbiAgZmllbGRzOiB7XG4gICAgbWlsbGlzZWNvbmRzOiB7XG4gICAgICB0eXBlOiBHcmFwaFFMSW50XG4gICAgfSxcbiAgICBzZWNvbmRzOiB7XG4gICAgICB0eXBlOiBHcmFwaFFMSW50XG4gICAgfSxcbiAgICBtaW51dGVzOiB7XG4gICAgICB0eXBlOiBHcmFwaFFMSW50XG4gICAgfSxcbiAgICBob3Vyczoge1xuICAgICAgdHlwZTogR3JhcGhRTEludFxuICAgIH0sXG4gICAgZGF5czoge1xuICAgICAgdHlwZTogR3JhcGhRTEludFxuICAgIH0sXG4gICAgbW9udGhzOiB7XG4gICAgICB0eXBlOiBHcmFwaFFMSW50XG4gICAgfSxcbiAgICB5ZWFyczoge1xuICAgICAgdHlwZTogR3JhcGhRTEludFxuICAgIH0sXG4gIH0sXG59KVxuXG5leHBvcnQgY29uc3QgSlNPTlR5cGUgPSBjcmVhdGVTdHJpbmdTY2FsYXJUeXBlKHtcbiAgbmFtZTogJ0pTT04nLFxuICBkZXNjcmlwdGlvbjogJ0FuIG9iamVjdCBub3QgcXVlcnlhYmxlIGJ5IEdyYXBoUUwnLFxufSlcblxuZXhwb3J0IGNvbnN0IFVVSURUeXBlID0gY3JlYXRlU3RyaW5nU2NhbGFyVHlwZSh7XG4gIG5hbWU6ICdVVUlEJyxcbiAgZGVzY3JpcHRpb246ICdBIHVuaXZlcnNhbGx5IHVuaXF1ZSBpZGVudGlmaWVyJyxcbn0pXG4iXX0=