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

const JSONType = exports.JSONType = new _graphql.GraphQLScalarType({
  name: 'JSON',
  description: 'An object not queryable by GraphQL(but supports serialization)',
  serialize: value => value,
  parseValue: value => value,
  parseLiteral: ast => ast.value
});

const UUIDType = exports.UUIDType = createStringScalarType({
  name: 'UUID',
  description: 'A universally unique identifier'
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ncmFwaHFsL3R5cGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBOzs7Ozs7QUFPQSxNQUFNLFdBQVcsU0FBUyxJQUFJLE1BQUosQ0FBVyxNQUFNLFFBQU4sRUFBWCxFQUE2QixRQUE3QixDQUFzQyxRQUF0QyxDQUExQjtBQUNBLE1BQU0sYUFBYSxTQUFTLElBQUksTUFBSixDQUFXLE1BQU0sUUFBTixFQUFYLEVBQTZCLFFBQTdCLEVBQXVDLFFBQXZDLEVBQTVCOztBQUVBLE1BQU0seUJBQXlCO0FBQUEsTUFBRSxJQUFGLFFBQUUsSUFBRjtBQUFBLE1BQVEsV0FBUixRQUFRLFdBQVI7QUFBQSxTQUF5QiwrQkFBc0I7QUFDNUUsUUFENEU7QUFFNUUsZUFGNEU7QUFHNUUsZUFBVyxNQUhpRTtBQUk1RSxnQkFBWSxNQUpnRTtBQUs1RSxrQkFBYyxPQUFRLElBQUksSUFBSixLQUFhLGNBQUssTUFBbEIsR0FBMkIsSUFBSSxLQUEvQixHQUF1QztBQUxlLEdBQXRCLENBQXpCO0FBQUEsQ0FBL0I7Ozs7OztBQVlPLE1BQU0sc0JBQU8sQ0FBQyxTQUFELEVBQVksTUFBWixLQUF1QixTQUFTLENBQUMsQUFBRCxHQUFHLFNBQUgsRUFBYSxDQUFiLEdBQWdCLE9BQU8sSUFBUCxDQUFZLEdBQVosQ0FBaEIsRUFBaUMsQUFBakMsQ0FBVCxDQUFwQzs7QUFFQSxNQUFNLDBCQUFTLGlCQUFpQjtBQUNyQyxRQUFNLFNBQVMsV0FBVyxhQUFYLENBQWY7QUFDQSxNQUFJLENBQUMsTUFBTCxFQUNFLE1BQU0sSUFBSSxLQUFKLENBQVUsQ0FBQyxZQUFELEdBQWUsYUFBZixFQUE2QixFQUE3QixDQUFWLENBQU47O0FBSG1DLHNCQUlKLE9BQU8sS0FBUCxDQUFhLEdBQWIsRUFBa0IsQ0FBbEIsQ0FKSTs7QUFBQTs7QUFBQSxRQUk5QixTQUo4QjtBQUFBLFFBSW5CLFdBSm1COztBQUtyQyxNQUFJLENBQUMsV0FBTCxFQUNFLE1BQU0sSUFB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O0FBSHdDLENBQXRCLENBQXJCOztBQTRCQSxNQUFNLDhCQUFXLCtCQUFzQjtBQUM1QyxRQUFNLE1BRHNDO0FBRTVDLGVBQWEsZ0VBRitCO0FBRzVDLGFBQVksS0FBRCxJQUFXLEtBSHNCO0FBSTVDLGNBQWEsS0FBRCxJQUFXLEtBSnFCO0FBSzVDLGdCQUFlLEdBQUQsSUFBUyxJQUFJO0FBTGlCLENBQXRCLENBQWpCOztBQVFBLE1BQU0sOEJBQVcsdUJBQXVCO0FBQzdDLFFBQU0sTUFEdUM7QUFFN0MsZUFBYTtBQUZnQyxDQUF2QixDQUFqQiIsImZpbGUiOiJ0eXBlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEtpbmQsIEdyYXBoUUxCb29sZWFuLCBHcmFwaFFMSW50LCBHcmFwaFFMRmxvYXQsIEdyYXBoUUxJRCwgR3JhcGhRTE5vbk51bGwsIEdyYXBoUUxTY2FsYXJUeXBlLCBHcmFwaFFMT2JqZWN0VHlwZSwgR3JhcGhRTEludGVyZmFjZVR5cGUsXG59IGZyb20gJ2dyYXBocWwnXG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIFV0aWxpdGllc1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5jb25zdCB0b0Jhc2U2NCA9IHZhbHVlID0+IG5ldyBCdWZmZXIodmFsdWUudG9TdHJpbmcoKSkudG9TdHJpbmcoJ2Jhc2U2NCcpXG5jb25zdCBmcm9tQmFzZTY0ID0gdmFsdWUgPT4gbmV3IEJ1ZmZlcih2YWx1ZS50b1N0cmluZygpLCAnYmFzZTY0JykudG9TdHJpbmcoKVxuXG5jb25zdCBjcmVhdGVTdHJpbmdTY2FsYXJUeXBlID0gKHtuYW1lLCBkZXNjcmlwdGlvbn0pID0+IG5ldyBHcmFwaFFMU2NhbGFyVHlwZSh7XG4gIG5hbWUsXG4gIGRlc2NyaXB0aW9uLFxuICBzZXJpYWxpemU6IFN0cmluZyxcbiAgcGFyc2VWYWx1ZTogU3RyaW5nLFxuICBwYXJzZUxpdGVyYWw6IGFzdCA9PiAoYXN0LmtpbmQgPT09IEtpbmQuU1RSSU5HID8gYXN0LnZhbHVlIDogbnVsbCksXG59KVxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBOb2RlIFR5cGVzXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbmV4cG9ydCBjb25zdCB0b0lEID0gKHRhYmxlTmFtZSwgdmFsdWVzKSA9PiB0b0Jhc2U2NChgJHt0YWJsZU5hbWV9OiR7dmFsdWVzLmpvaW4oJywnKX1gKVxuXG5leHBvcnQgY29uc3QgZnJvbUlEID0gZW5jb2RlZFN0cmluZyA9PiB7XG4gIGNvbnN0IHN0cmluZyA9IGZyb21CYXNlNjQoZW5jb2RlZFN0cmluZylcbiAgaWYgKCFzdHJpbmcpXG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIElEICcke2VuY29kZWRTdHJpbmd9Jy5gKVxuICBjb25zdCBbdGFibGVOYW1lLCB2YWx1ZVN0cmluZ10gPSBzdHJpbmcuc3BsaXQoJzonLCAyKVxuICBpZiAoIXZhbHVlU3RyaW5nKVxuICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBJRCAnJHtlbmNvZGVkU3RyaW5nfScuYClcbiAgY29uc3QgdmFsdWVzID0gdmFsdWVTdHJpbmcuc3BsaXQoJywnKVxuICByZXR1cm4ge1xuICAgIHRhYmxlTmFtZSxcbiAgICB2YWx1ZXNcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgTm9kZVR5cGUgPSBuZXcgR3JhcGhRTEludGVyZmFjZVR5cGUoe1xuICBuYW1lOiAnTm9kZScsXG4gIGRlc2NyaXB0aW9uOiAnQSBzaW5nbGUgbm9kZSBvYmplY3QgaW4gdGhlIGdyYXBoIHdpdGggYSBnbG9iYWxseSB1bmlxdWUgaWRlbnRpZmllci4nLFxuICBmaWVsZHM6IHtcbiAgICBpZDoge1xuICAgICAgdHlwZTogR3JhcGhRTElELFxuICAgICAgZGVzY3JpcHRpb246ICdUaGUgYE5vZGVg4oCZcyBnbG9iYWxseSB1bmlxdWUgaWRlbnRpZmllciB1c2VkIHRvIHJlZmV0Y2ggdGhlIG5vZGUuJyxcbiAgICB9LFxuICB9LFxufSlcblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29ubmVjdGlvbiBUeXBlc1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5leHBvcnQgY29uc3QgQ3Vyc29yVHlwZSA9IG5ldyBHcmFwaFFMU2NhbGFyVHlwZSh7XG4gIG5hbWU6ICdDdXJzb3InLFxuICBkZXNjcmlwdGlvbjogJ0FuIG9wYXF1ZSBiYXNlNjQgZW5jb2RlZCBzdHJpbmcgZGVzY3JpYmluZyBhIGxvY2F0aW9uIGluIGEgbGlzdCBvZiBpdGVtcy4nLFxuICBzZXJpYWxpemU6IHRvQmFzZTY0LFxuICBwYXJzZVZhbHVlOiBmcm9tQmFzZTY0LFxuICBwYXJzZUxpdGVyYWw6IGFzdCA9PiAoYXN0LmtpbmQgPT09IEtpbmQuU1RSSU5HID8gZnJvbUJhc2U2NChhc3QudmFsdWUpIDogbnVsbCksXG59KVxuXG5leHBvcnQgY29uc3QgUGFnZUluZm9UeXBlID0gbmV3IEdyYXBoUUxPYmplY3RUeXBlKHtcbiAgbmFtZTogJ1BhZ2VJbmZvJyxcbiAgZGVzY3JpcHRpb246ICdJbmZvcm1hdGlvbiBhYm91dCBwYWdpbmF0aW9uIGluIGEgY29ubmVjdGlvbi4nLFxuICBmaWVsZHM6IHtcbiAgICBoYXNOZXh0UGFnZToge1xuICAgICAgdHlwZTogbmV3IEdyYXBoUUxOb25OdWxsKEdyYXBoUUxCb29sZWFuKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQXJlIHRoZXJlIGl0ZW1zIGFmdGVyIG91ciByZXN1bHQgc2V0IHRvIGJlIHF1ZXJpZWQ/JyxcbiAgICAgIHJlc29sdmU6ICh7aGFzTmV4dFBhZ2V9KSA9PiBoYXNOZXh0UGFnZSxcbiAgICB9LFxuICAgIGhhc1ByZXZpb3VzUGFnZToge1xuICAgICAgdHlwZTogbmV3IEdyYXBoUUxOb25OdWxsKEdyYXBoUUxCb29sZWFuKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQXJlIHRoZXJlIGl0ZW1zIGJlZm9yZSBvdXIgcmVzdWx0IHNldCB0byBiZSBxdWVyaWVkPycsXG4gICAgICByZXNvbHZlOiAoe2hhc1ByZXZpb3VzUGFnZX0pID0+IGhhc1ByZXZpb3VzUGFnZSxcbiAgICB9LFxuICAgIHN0YXJ0Q3Vyc29yOiB7XG4gICAgICB0eXBlOiBDdXJzb3JUeXBlLFxuICAgICAgZGVzY3JpcHRpb246ICdUaGUgY3Vyc29yIGZvciB0aGUgZmlyc3QgaXRlbSBpbiB0aGUgbGlzdC4nLFxuICAgICAgcmVzb2x2ZTogKHtzdGFydEN1cnNvcn0pID0+IHN0YXJ0Q3Vyc29yLFxuICAgIH0sXG4gICAgZW5kQ3Vyc29yOiB7XG4gICAgICB0eXBlOiBDdXJzb3JUeXBlLFxuICAgICAgZGVzY3JpcHRpb246ICdUaGUgY3Vyc29yIGZvciB0aGUgbGFzdCBpdGVtIGluIHRoZSBsaXN0LicsXG4gICAgICByZXNvbHZlOiAoe2VuZEN1cnNvcn0pID0+IGVuZEN1cnNvcixcbiAgICB9LFxuICB9LFxufSlcblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogUG9zdGdyZVNRTCBUeXBlc1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5leHBvcnQgY29uc3QgQmlnSW50VHlwZSA9IGNyZWF0ZVN0cmluZ1NjYWxhclR5cGUoe1xuICBuYW1lOiAnQmlnSW50JyxcbiAgZGVzY3JpcHRpb246ICdBIHNpZ25lZCBlaWdodC1ieXRlIGludGVnZXIgcmVwcmVzZW50ZWQgYXMgYSBzdHJpbmcnLFxufSlcblxuZXhwb3J0IGNvbnN0IERhdGVUeXBlID0gY3JlYXRlU3RyaW5nU2NhbGFyVHlwZSh7XG4gIG5hbWU6ICdEYXRlJyxcbiAgZGVzY3JpcHRpb246ICdTb21lIHRpbWUgdmFsdWUnLFxufSlcblxuZXhwb3J0IGNvbnN0IFBvaW50VHlwZSA9IG5ldyBHcmFwaFFMT2JqZWN0VHlwZSh7XG4gIG5hbWU6ICdQb2ludCcsXG4gIGRlc2NyaXB0aW9uOiAnQSBnZW9tZXRyaWMgcG9pbnQgb24gYSBwbGFuZScsXG4gIGZpZWxkczoge1xuICAgIHg6IHtcbiAgICAgIHR5cGU6IG5ldyBHcmFwaFFMTm9uTnVsbChHcmFwaFFMRmxvYXQpLFxuICAgICAgZGVzY3JpcHRpb246ICdUaGUgeCBjb29yZGluYXRlIG9mIHRoZSBwb2ludCcsXG4gICAgfSxcbiAgICB5OiB7XG4gICAgICB0eXBlOiBuZXcgR3JhcGhRTE5vbk51bGwoR3JhcGhRTEZsb2F0KSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHkgY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnQnLFxuICAgIH0sXG4gIH0sXG59KVxuXG5leHBvcnQgY29uc3QgQ2lyY2xlVHlwZSA9IG5ldyBHcmFwaFFMT2JqZWN0VHlwZSh7XG4gIG5hbWU6ICdDaXJjbGUnLFxuICBkZXNjcmlwdGlvbjogJ1NvbWUgY2lyY2xlIG9uIGEgcGxhbmUgbWFkZSBvZiBhIHBvaW50IGFuZCBhIHJhZGl1cycsXG4gIGZpZWxkczoge1xuICAgIHg6IHtcbiAgICAgIHR5cGU6IG5ldyBHcmFwaFFMTm9uTnVsbChHcmFwaFFMRmxvYXQpLFxuICAgICAgZGVzY3JpcHRpb246ICdUaGUgeCBjb29yZGluYXRlIG9mIHRoZSBjaXJjbGUnLFxuICAgIH0sXG4gICAgeToge1xuICAgICAgdHlwZTogbmV3IEdyYXBoUUxOb25OdWxsKEdyYXBoUUxGbG9hdCksXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSB5IGNvb3JkaW5hdGUgb2YgdGhlIGNpcmNsZScsXG4gICAgfSxcbiAgICByYWRpdXM6IHtcbiAgICAgIHR5cGU6IG5ldyBHcmFwaFFMTm9uTnVsbChHcmFwaFFMRmxvYXQpLFxuICAgICAgZGVzY3JpcHRpb246ICdUaGUgcmFkaXVzIG9mIHRoZSBjaXJjbGUnLFxuICAgIH0sXG4gIH0sXG59KVxuXG5leHBvcnQgY29uc3QgSW50ZXJ2YWxUeXBlID0gbmV3IEdyYXBoUUxPYmplY3RUeXBlKHtcbiAgbmFtZTogJ0ludGVydmFsJyxcbiAgZGVzY3JpcHRpb246ICdTb21lIHRpbWUgc3BhbicsXG4gIGZpZWxkczoge1xuICAgIG1pbGxpc2Vjb25kczoge1xuICAgICAgdHlwZTogR3JhcGhRTEludFxuICAgIH0sXG4gICAgc2Vjb25kczoge1xuICAgICAgdHlwZTogR3JhcGhRTEludFxuICAgIH0sXG4gICAgbWludXRlczoge1xuICAgICAgdHlwZTogR3JhcGhRTEludFxuICAgIH0sXG4gICAgaG91cnM6IHtcbiAgICAgIHR5cGU6IEdyYXBoUUxJbnRcbiAgICB9LFxuICAgIGRheXM6IHtcbiAgICAgIHR5cGU6IEdyYXBoUUxJbnRcbiAgICB9LFxuICAgIG1vbnRoczoge1xuICAgICAgdHlwZTogR3JhcGhRTEludFxuICAgIH0sXG4gICAgeWVhcnM6IHtcbiAgICAgIHR5cGU6IEdyYXBoUUxJbnRcbiAgICB9LFxuICB9LFxufSlcblxuZXhwb3J0IGNvbnN0IEpTT05UeXBlID0gbmV3IEdyYXBoUUxTY2FsYXJUeXBlKHtcbiAgbmFtZTogJ0pTT04nLFxuICBkZXNjcmlwdGlvbjogJ0FuIG9iamVjdCBub3QgcXVlcnlhYmxlIGJ5IEdyYXBoUUwoYnV0IHN1cHBvcnRzIHNlcmlhbGl6YXRpb24pJyxcbiAgc2VyaWFsaXplOiAodmFsdWUpID0+IHZhbHVlLFxuICBwYXJzZVZhbHVlOiAodmFsdWUpID0+IHZhbHVlLFxuICBwYXJzZUxpdGVyYWw6IChhc3QpID0+IGFzdC52YWx1ZVxufSlcblxuZXhwb3J0IGNvbnN0IFVVSURUeXBlID0gY3JlYXRlU3RyaW5nU2NhbGFyVHlwZSh7XG4gIG5hbWU6ICdVVUlEJyxcbiAgZGVzY3JpcHRpb246ICdBIHVuaXZlcnNhbGx5IHVuaXF1ZSBpZGVudGlmaWVyJyxcbn0pXG4iXX0=