'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _lodash = require('lodash');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _onFinished = require('on-finished');

var _onFinished2 = _interopRequireDefault(_onFinished);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _serveFavicon = require('serve-favicon');

var _serveFavicon2 = _interopRequireDefault(_serveFavicon);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _pg = require('pg');

var _pg2 = _interopRequireDefault(_pg);

var _graphql = require('graphql');

var _expressGraphql = require('express-graphql');

var _expressGraphql2 = _interopRequireDefault(_expressGraphql);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * Creates an HTTP server with the provided configuration.
 *
 * @param {Object} config
 * @param {GraphQLSchema} config.graphqlSchema
 * @param {Object} config.pgConfig
 * @param {string} config.route
 * @param {boolean} config.development
 * @returns {Server}
 */
const createServer = _ref => {
  let graphqlSchema = _ref.graphqlSchema;
  let pgConfig = _ref.pgConfig;
  var _ref$route = _ref.route;
  let route = _ref$route === undefined ? '/' : _ref$route;
  let secret = _ref.secret;
  var _ref$development = _ref.development;
  let development = _ref$development === undefined ? true : _ref$development;
  var _ref$log = _ref.log;
  let log = _ref$log === undefined ? true : _ref$log;

  (0, _assert2['default'])(graphqlSchema instanceof _graphql.GraphQLSchema, 'Must be an instance of GraphQL schema must be defined');
  (0, _assert2['default'])(pgConfig, 'A PostgreSQL config must be defined');

  const server = new _express2['default']();

  if (log) server.use((0, _morgan2['default'])(development ? 'dev' : 'common'));
  server.use((0, _compression2['default'])());
  server.use((0, _serveFavicon2['default'])(_path2['default'].join(__dirname, '../assets/favicon.ico')));
  server.use(_express2['default']['static'](_path2['default'].join(__dirname, '../public')));
  server.use((0, _cors2['default'])({
    origin: ['http://localhost:3000', 'http://192.168.1.201:3000', 'http://pa6.com'],
    credentials: true
  }));

  server.all(route, (0, _expressGraphql2['default'])((() => {
    var ref = _asyncToGenerator(function* (req) {
      // Acquire a new client for every request.
      const client = yield _pg2['default'].connectAsync(pgConfig);

      // Start a transaction for our client and set it up.
      yield client.queryAsync('begin');

      // If we have a secret, let’s setup the request transaction.
      if (secret) yield setupRequestTransaction(req, client, secret);

      // Make sure we release our client back to the pool once the response has
      // finished.
      (0, _onFinished2['default'])(req.res, function () {
        // Try to end our session with a commit. If it succeeds, release the
        // client back into the pool. If it fails, release the client back into
        // the pool, but also report that it failed. We cannot report an error in
        // the request at this point because it has finished.
        client.queryAsync('commit').then(function () {
          return client.end();
        })['catch'](function (error) {
          console.error(error.stack); // eslint-disable-line no-console
          client.end();
        });
      });

      return {
        schema: graphqlSchema,
        context: {
          client
        },
        pretty: development,
        graphiql: development,
        formatError: development ? developmentFormatError : _graphql.formatError
      };
    });

    return function (_x) {
      return ref.apply(this, arguments);
    };
  })()));

  return _http2['default'].createServer(server);
};

exports['default'] = createServer;


const setupRequestTransaction = (() => {
  var ref = _asyncToGenerator(function* (req, client, secret) {
    // First, get the possible `Bearer` token from the request. If it does not
    // exist, exit.
    const token = getToken(req);
    if (!token) return;

    const decoded = yield _jsonwebtoken2['default'].verifyAsync(token, secret, {
      audience: 'postgraphql'
    });
    const role = decoded.role;

    const values = [];
    const querySelection = [];

    // Make sure to set the local role if it exists.
    if (role) {
      values.push(role);
      querySelection.push('set_config(\'role\', $1, true)');
    }

    // Iterate through all of the JWT decoded values and set a local parameter
    // with that key and value.
    (0, _lodash.forEach)(decoded, function (value, key) {
      values.push(key);
      values.push(value);
      querySelection.push(`set_config('jwt.claims.' || $${ values.length - 1 }, $${ values.length }, true)`);
    });

    yield client.queryAsync(`select ${ querySelection.join(', ') }`, values);
  });

  return function setupRequestTransaction(_x2, _x3, _x4) {
    return ref.apply(this, arguments);
  };
})();

/**
 * Parses the `Bearer` auth scheme token out of the `Authorization` header as
 * defined by [RFC7235][1].
 *
 * ```
 * Authorization = credentials
 * credentials   = auth-scheme [ 1*SP ( token68 / #auth-param ) ]
 * token68       = 1*( ALPHA / DIGIT / "-" / "." / "_" / "~" / "+" / "/" )*"="
 * ```
 *
 * [1]: https://tools.ietf.org/html/rfc7235
 *
 * @private
 */
const bearerRex = /^\s*bearer\s+([a-z0-9\-._~+/]+=*)\s*$/i;

const getToken = req => {
  const authorization = req.headers.authorization;

  const match = bearerRex.exec(authorization);
  if (!match) return null;
  return match[1];
};

const developmentFormatError = error => {
  console.error(error.stack); // eslint-disable-line no-console
  return {
    message: error.message,
    locations: error.locations,
    stack: error.stack
  };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jcmVhdGVTZXJ2ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFZQSxNQUFNLGVBQWUsUUFBc0Y7QUFBQSxNQUFwRixhQUFvRixRQUFwRixhQUFvRjtBQUFBLE1BQXJFLFFBQXFFLFFBQXJFLFFBQXFFO0FBQUEsd0JBQTNELEtBQTJEO0FBQUEsTUFBM0QsS0FBMkQsOEJBQW5ELEdBQW1EO0FBQUEsTUFBOUMsTUFBOEMsUUFBOUMsTUFBOEM7QUFBQSw4QkFBdEMsV0FBc0M7QUFBQSxNQUF0QyxXQUFzQyxvQ0FBeEIsSUFBd0I7QUFBQSxzQkFBbEIsR0FBa0I7QUFBQSxNQUFsQixHQUFrQiw0QkFBWixJQUFZOztBQUN6RywyQkFBTywrQ0FBUCxFQUErQyx1REFBL0M7QUFDQSwyQkFBTyxRQUFQLEVBQWlCLHFDQUFqQjs7QUFFQSxRQUFNLFNBQVMsMEJBQWY7O0FBRUEsTUFBSSxHQUFKLEVBQVMsT0FBTyxHQUFQLENBQVcseUJBQU8sY0FBYyxLQUFkLEdBQXNCLFFBQTdCLENBQVg7QUFDVCxTQUFPLEdBQVAsQ0FBVywrQkFBWDtBQUNBLFNBQU8sR0FBUCxDQUFXLCtCQUFRLGtCQUFLLElBQUwsQ0FBVSxTQUFWLEVBQXFCLHVCQUFyQixDQUFSLENBQVg7QUFDQSxTQUFPLEdBQVAsQ0FBVywrQkFBZSxrQkFBSyxJQUFMLENBQVUsU0FBVixFQUFxQixXQUFyQixDQUFmLENBQVg7QUFDQSxTQUFPLEdBQVAsQ0FBVyx1QkFBSztBQUNkLFlBQVEsQ0FBQyx1QkFBRCxFQUEwQiwyQkFBMUIsRUFBdUQsZ0JBQXZELENBRE07QUFFZCxpQkFBYTtBQUZDLEdBQUwsQ0FBWDs7QUFLQSxTQUFPLEdBQVAsQ0FBVyxLQUFYLEVBQWtCO0FBQUEsZ0NBQVksV0FBTSxHQUFOLEVBQWE7O0FBRXpDLFlBQU0sU0FBUyxNQUFNLGdCQUFHLFlBQUgsQ0FBZ0IsUUFBaEIsQ0FBckI7OztBQUdBLFlBQU0sT0FBTyxVQUFQLENBQWtCLE9BQWxCLENBQU47OztBQUdBLFVBQUksTUFBSixFQUFZLE1BQU0sd0JBQXdCLEdBQXhCLEVBQTZCLE1BQTdCLEVBQXFDLE1BQXJDLENBQU47Ozs7QUFJWixtQ0FBVyxJQUFJLEdBQWYsRUFBb0IsWUFBTTs7Ozs7QUFLeEIsZUFBTyxVQUFQLENBQWtCLFFBQWxCLEVBQ0csSUFESCxDQUNRO0FBQUEsaUJBQU0sT0FBTyxHQUFQLEVBQU47QUFBQSxTQURSLFdBRVMsaUJBQVM7QUFDZCxrQkFBUSxLQUFSLENBQWMsTUFBTSxLQUFwQixFO0FBQ0EsaUJBQU8sR0FBUDtBQUNELFNBTEg7QUFNRCxPQVhEOztBQWFBLGFBQU87QUFDTCxnQkFBUSxhQURIO0FBRUwsaUJBQVM7QUFDUDtBQURPLFNBRko7QUFLTCxnQkFBUSxXQUxIO0FBTUwsa0JBQVUsV0FOTDtBQU9MLHFCQUFhLGNBQWMsc0JBQWQ7QUFQUixPQUFQO0FBU0QsS0FsQ2lCOztBQUFBO0FBQUE7QUFBQTtBQUFBLE9BQWxCOztBQW9DQSxTQUFPLGtCQUFLLFlBQUwsQ0FBa0IsTUFBbEIsQ0FBUDtBQUNELENBcEREOztxQkFzRGUsWTs7O0FBRWYsTUFBTTtBQUFBLDhCQUEwQixXQUFPLEdBQVAsRUFBWSxNQUFaLEVBQW9CLE1BQXBCLEVBQStCOzs7QUFHN0QsVUFBTSxRQUFRLFNBQVMsR0FBVCxDQUFkO0FBQ0EsUUFBSSxDQUFDLEtBQUwsRUFBWTs7QUFFWixVQUFNLFVBQVUsTUFBTSwwQkFBSSxXQUFKLENBQWdCLEtBQWhCLEVBQXVCLE1BQXZCLEVBQStCO0FBQ25ELGdCQUFVO0FBRHlDLEtBQS9CLENBQXRCO0FBTjZELFVBU3RELElBVHNELEdBUzlDLE9BVDhDLENBU3RELElBVHNEOztBQVU3RCxVQUFNLFNBQVMsRUFBZjtBQUNBLFVBQU0saUJBQWlCLEVBQXZCOzs7QUFHQSxRQUFJLElBQUosRUFBVTtBQUNSLGFBQU8sSUFBUCxDQUFZLElBQVo7QUFDQSxxQkFBZSxJQUFmLENBQW9CLGdDQUFwQjtBQUNEOzs7O0FBSUQseUJBQVEsT0FBUixFQUFpQixVQUFDLEtBQUQsRUFBUSxHQUFSLEVBQWdCO0FBQy9CLGFBQU8sSUFBUCxDQUFZLEdBQVo7QUFDQSxhQUFPLElBQVAsQ0FBWSxLQUFaO0FBQ0EscUJBQWUsSUFBZixDQUFvQixDQUFDLDZCQUFELEdBQWdDLE9BQU8sTUFBUCxHQUFnQixDQUFoRCxFQUFrRCxHQUFsRCxHQUF1RCxPQUFPLE1BQTlELEVBQXFFLE9BQXJFLENBQXBCO0FBQ0QsS0FKRDs7QUFNQSxVQUFNLE9BQU8sVUFBUCxDQUFrQixDQUFDLE9BQUQsR0FBVSxlQUFlLElBQWYsQ0FBb0IsSUFBcEIsQ0FBVixFQUFvQyxBQUFwQyxDQUFsQixFQUF5RCxNQUF6RCxDQUFOO0FBQ0QsR0E1Qks7O0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFBTjs7Ozs7Ozs7Ozs7Ozs7OztBQTRDQSxNQUFNLFlBQVksd0NBQWxCOztBQUVBLE1BQU0sV0FBVyxPQUFPO0FBQUEsUUFDZixhQURlLEdBQ0UsSUFBSSxPQUROLENBQ2YsYUFEZTs7QUFFdEIsUUFBTSxRQUFRLFVBQVUsSUFBVixDQUFlLGFBQWYsQ0FBZDtBQUNBLE1BQUksQ0FBQyxLQUFMLEVBQVksT0FBTyxJQUFQO0FBQ1osU0FBTyxNQUFNLENBQU4sQ0FBUDtBQUNELENBTEQ7O0FBT0EsTUFBTSx5QkFBeUIsU0FBUztBQUN0QyxVQUFRLEtBQVIsQ0FBYyxNQUFNLEtBQXBCLEU7QUFDQSxTQUFPO0FBQ0wsYUFBUyxNQUFNLE9BRFY7QUFFTCxlQUFXLE1BQU0sU0FGWjtBQUdMLFdBQU8sTUFBTTtBQUhSLEdBQVA7QUFLRCxDQVBEIiwiZmlsZSI6ImNyZWF0ZVNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0J1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBodHRwIGZyb20gJ2h0dHAnXG5pbXBvcnQgeyBmb3JFYWNoIH0gZnJvbSAnbG9kYXNoJ1xuaW1wb3J0IEV4cHJlc3MgZnJvbSAnZXhwcmVzcydcbmltcG9ydCBvbkZpbmlzaGVkIGZyb20gJ29uLWZpbmlzaGVkJ1xuaW1wb3J0IGxvZ2dlciBmcm9tICdtb3JnYW4nXG5pbXBvcnQgZmF2aWNvbiBmcm9tICdzZXJ2ZS1mYXZpY29uJ1xuaW1wb3J0IGp3dCBmcm9tICdqc29ud2VidG9rZW4nXG5pbXBvcnQgcGcgZnJvbSAncGcnXG5pbXBvcnQgeyBHcmFwaFFMU2NoZW1hLCBmb3JtYXRFcnJvciB9IGZyb20gJ2dyYXBocWwnXG5pbXBvcnQgZ3JhcGhxbEhUVFAgZnJvbSAnZXhwcmVzcy1ncmFwaHFsJ1xuaW1wb3J0IGNvcnMgZnJvbSAnY29ycydcbmltcG9ydCBjb21wcmVzcyBmcm9tICdjb21wcmVzc2lvbidcblxuLyoqXG4gKiBDcmVhdGVzIGFuIEhUVFAgc2VydmVyIHdpdGggdGhlIHByb3ZpZGVkIGNvbmZpZ3VyYXRpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZ1xuICogQHBhcmFtIHtHcmFwaFFMU2NoZW1hfSBjb25maWcuZ3JhcGhxbFNjaGVtYVxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZy5wZ0NvbmZpZ1xuICogQHBhcmFtIHtzdHJpbmd9IGNvbmZpZy5yb3V0ZVxuICogQHBhcmFtIHtib29sZWFufSBjb25maWcuZGV2ZWxvcG1lbnRcbiAqIEByZXR1cm5zIHtTZXJ2ZXJ9XG4gKi9cbmNvbnN0IGNyZWF0ZVNlcnZlciA9ICh7Z3JhcGhxbFNjaGVtYSwgcGdDb25maWcsIHJvdXRlID0gJy8nLCBzZWNyZXQsIGRldmVsb3BtZW50ID0gdHJ1ZSwgbG9nID0gdHJ1ZSwgfSkgPT4ge1xuICBhc3NlcnQoZ3JhcGhxbFNjaGVtYSBpbnN0YW5jZW9mIEdyYXBoUUxTY2hlbWEsICdNdXN0IGJlIGFuIGluc3RhbmNlIG9mIEdyYXBoUUwgc2NoZW1hIG11c3QgYmUgZGVmaW5lZCcpXG4gIGFzc2VydChwZ0NvbmZpZywgJ0EgUG9zdGdyZVNRTCBjb25maWcgbXVzdCBiZSBkZWZpbmVkJylcblxuICBjb25zdCBzZXJ2ZXIgPSBuZXcgRXhwcmVzcygpXG5cbiAgaWYgKGxvZykgc2VydmVyLnVzZShsb2dnZXIoZGV2ZWxvcG1lbnQgPyAnZGV2JyA6ICdjb21tb24nKSlcbiAgc2VydmVyLnVzZShjb21wcmVzcygpKVxuICBzZXJ2ZXIudXNlKGZhdmljb24ocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2Fzc2V0cy9mYXZpY29uLmljbycpKSlcbiAgc2VydmVyLnVzZShFeHByZXNzLnN0YXRpYyhwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vcHVibGljJykpKVxuICBzZXJ2ZXIudXNlKGNvcnMoe1xuICAgIG9yaWdpbjogWydodHRwOi8vbG9jYWxob3N0OjMwMDAnLCAnaHR0cDovLzE5Mi4xNjguMS4yMDE6MzAwMCcsICdodHRwOi8vcGE2LmNvbSddLFxuICAgIGNyZWRlbnRpYWxzOiB0cnVlXG4gIH0pKVxuXG4gIHNlcnZlci5hbGwocm91dGUsIGdyYXBocWxIVFRQKGFzeW5jIHJlcSA9PiB7XG4gICAgLy8gQWNxdWlyZSBhIG5ldyBjbGllbnQgZm9yIGV2ZXJ5IHJlcXVlc3QuXG4gICAgY29uc3QgY2xpZW50ID0gYXdhaXQgcGcuY29ubmVjdEFzeW5jKHBnQ29uZmlnKVxuXG4gICAgLy8gU3RhcnQgYSB0cmFuc2FjdGlvbiBmb3Igb3VyIGNsaWVudCBhbmQgc2V0IGl0IHVwLlxuICAgIGF3YWl0IGNsaWVudC5xdWVyeUFzeW5jKCdiZWdpbicpXG5cbiAgICAvLyBJZiB3ZSBoYXZlIGEgc2VjcmV0LCBsZXTigJlzIHNldHVwIHRoZSByZXF1ZXN0IHRyYW5zYWN0aW9uLlxuICAgIGlmIChzZWNyZXQpIGF3YWl0IHNldHVwUmVxdWVzdFRyYW5zYWN0aW9uKHJlcSwgY2xpZW50LCBzZWNyZXQpXG5cbiAgICAvLyBNYWtlIHN1cmUgd2UgcmVsZWFzZSBvdXIgY2xpZW50IGJhY2sgdG8gdGhlIHBvb2wgb25jZSB0aGUgcmVzcG9uc2UgaGFzXG4gICAgLy8gZmluaXNoZWQuXG4gICAgb25GaW5pc2hlZChyZXEucmVzLCAoKSA9PiB7XG4gICAgICAvLyBUcnkgdG8gZW5kIG91ciBzZXNzaW9uIHdpdGggYSBjb21taXQuIElmIGl0IHN1Y2NlZWRzLCByZWxlYXNlIHRoZVxuICAgICAgLy8gY2xpZW50IGJhY2sgaW50byB0aGUgcG9vbC4gSWYgaXQgZmFpbHMsIHJlbGVhc2UgdGhlIGNsaWVudCBiYWNrIGludG9cbiAgICAgIC8vIHRoZSBwb29sLCBidXQgYWxzbyByZXBvcnQgdGhhdCBpdCBmYWlsZWQuIFdlIGNhbm5vdCByZXBvcnQgYW4gZXJyb3IgaW5cbiAgICAgIC8vIHRoZSByZXF1ZXN0IGF0IHRoaXMgcG9pbnQgYmVjYXVzZSBpdCBoYXMgZmluaXNoZWQuXG4gICAgICBjbGllbnQucXVlcnlBc3luYygnY29tbWl0JylcbiAgICAgICAgLnRoZW4oKCkgPT4gY2xpZW50LmVuZCgpKVxuICAgICAgICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3Iuc3RhY2spIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgIGNsaWVudC5lbmQoKVxuICAgICAgICB9KVxuICAgIH0pXG5cbiAgICByZXR1cm4ge1xuICAgICAgc2NoZW1hOiBncmFwaHFsU2NoZW1hLFxuICAgICAgY29udGV4dDoge1xuICAgICAgICBjbGllbnRcbiAgICAgIH0sXG4gICAgICBwcmV0dHk6IGRldmVsb3BtZW50LFxuICAgICAgZ3JhcGhpcWw6IGRldmVsb3BtZW50LFxuICAgICAgZm9ybWF0RXJyb3I6IGRldmVsb3BtZW50ID8gZGV2ZWxvcG1lbnRGb3JtYXRFcnJvciA6IGZvcm1hdEVycm9yLFxuICAgIH1cbiAgfSkpXG5cbiAgcmV0dXJuIGh0dHAuY3JlYXRlU2VydmVyKHNlcnZlcilcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlU2VydmVyXG5cbmNvbnN0IHNldHVwUmVxdWVzdFRyYW5zYWN0aW9uID0gYXN5bmMgKHJlcSwgY2xpZW50LCBzZWNyZXQpID0+IHtcbiAgLy8gRmlyc3QsIGdldCB0aGUgcG9zc2libGUgYEJlYXJlcmAgdG9rZW4gZnJvbSB0aGUgcmVxdWVzdC4gSWYgaXQgZG9lcyBub3RcbiAgLy8gZXhpc3QsIGV4aXQuXG4gIGNvbnN0IHRva2VuID0gZ2V0VG9rZW4ocmVxKVxuICBpZiAoIXRva2VuKSByZXR1cm5cblxuICBjb25zdCBkZWNvZGVkID0gYXdhaXQgand0LnZlcmlmeUFzeW5jKHRva2VuLCBzZWNyZXQsIHtcbiAgICBhdWRpZW5jZTogJ3Bvc3RncmFwaHFsJ1xuICB9KVxuICBjb25zdCB7cm9sZX0gPSBkZWNvZGVkXG4gIGNvbnN0IHZhbHVlcyA9IFtdXG4gIGNvbnN0IHF1ZXJ5U2VsZWN0aW9uID0gW11cblxuICAvLyBNYWtlIHN1cmUgdG8gc2V0IHRoZSBsb2NhbCByb2xlIGlmIGl0IGV4aXN0cy5cbiAgaWYgKHJvbGUpIHtcbiAgICB2YWx1ZXMucHVzaChyb2xlKVxuICAgIHF1ZXJ5U2VsZWN0aW9uLnB1c2goJ3NldF9jb25maWcoXFwncm9sZVxcJywgJDEsIHRydWUpJylcbiAgfVxuXG4gIC8vIEl0ZXJhdGUgdGhyb3VnaCBhbGwgb2YgdGhlIEpXVCBkZWNvZGVkIHZhbHVlcyBhbmQgc2V0IGEgbG9jYWwgcGFyYW1ldGVyXG4gIC8vIHdpdGggdGhhdCBrZXkgYW5kIHZhbHVlLlxuICBmb3JFYWNoKGRlY29kZWQsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgdmFsdWVzLnB1c2goa2V5KVxuICAgIHZhbHVlcy5wdXNoKHZhbHVlKVxuICAgIHF1ZXJ5U2VsZWN0aW9uLnB1c2goYHNldF9jb25maWcoJ2p3dC5jbGFpbXMuJyB8fCAkJHt2YWx1ZXMubGVuZ3RoIC0gMX0sICQke3ZhbHVlcy5sZW5ndGh9LCB0cnVlKWApXG4gIH0pXG5cbiAgYXdhaXQgY2xpZW50LnF1ZXJ5QXN5bmMoYHNlbGVjdCAke3F1ZXJ5U2VsZWN0aW9uLmpvaW4oJywgJyl9YCwgdmFsdWVzKVxufVxuXG4vKipcbiAqIFBhcnNlcyB0aGUgYEJlYXJlcmAgYXV0aCBzY2hlbWUgdG9rZW4gb3V0IG9mIHRoZSBgQXV0aG9yaXphdGlvbmAgaGVhZGVyIGFzXG4gKiBkZWZpbmVkIGJ5IFtSRkM3MjM1XVsxXS5cbiAqXG4gKiBgYGBcbiAqIEF1dGhvcml6YXRpb24gPSBjcmVkZW50aWFsc1xuICogY3JlZGVudGlhbHMgICA9IGF1dGgtc2NoZW1lIFsgMSpTUCAoIHRva2VuNjggLyAjYXV0aC1wYXJhbSApIF1cbiAqIHRva2VuNjggICAgICAgPSAxKiggQUxQSEEgLyBESUdJVCAvIFwiLVwiIC8gXCIuXCIgLyBcIl9cIiAvIFwiflwiIC8gXCIrXCIgLyBcIi9cIiApKlwiPVwiXG4gKiBgYGBcbiAqXG4gKiBbMV06IGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM3MjM1XG4gKlxuICogQHByaXZhdGVcbiAqL1xuY29uc3QgYmVhcmVyUmV4ID0gL15cXHMqYmVhcmVyXFxzKyhbYS16MC05XFwtLl9+Ky9dKz0qKVxccyokL2lcblxuY29uc3QgZ2V0VG9rZW4gPSByZXEgPT4ge1xuICBjb25zdCB7YXV0aG9yaXphdGlvbn0gPSByZXEuaGVhZGVyc1xuICBjb25zdCBtYXRjaCA9IGJlYXJlclJleC5leGVjKGF1dGhvcml6YXRpb24pXG4gIGlmICghbWF0Y2gpIHJldHVybiBudWxsXG4gIHJldHVybiBtYXRjaFsxXVxufVxuXG5jb25zdCBkZXZlbG9wbWVudEZvcm1hdEVycm9yID0gZXJyb3IgPT4ge1xuICBjb25zb2xlLmVycm9yKGVycm9yLnN0YWNrKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgcmV0dXJuIHtcbiAgICBtZXNzYWdlOiBlcnJvci5tZXNzYWdlLFxuICAgIGxvY2F0aW9uczogZXJyb3IubG9jYXRpb25zLFxuICAgIHN0YWNrOiBlcnJvci5zdGFjayxcbiAgfVxufVxuIl19