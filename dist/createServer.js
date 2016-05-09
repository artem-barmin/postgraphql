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
  server.use((0, _serveFavicon2['default'])(_path2['default'].join(__dirname, '../assets/favicon.ico')));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jcmVhdGVTZXJ2ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBWUEsTUFBTSxlQUFlLFFBQXNGO0FBQUEsTUFBcEYsYUFBb0YsUUFBcEYsYUFBb0Y7QUFBQSxNQUFyRSxRQUFxRSxRQUFyRSxRQUFxRTtBQUFBLHdCQUEzRCxLQUEyRDtBQUFBLE1BQTNELEtBQTJELDhCQUFuRCxHQUFtRDtBQUFBLE1BQTlDLE1BQThDLFFBQTlDLE1BQThDO0FBQUEsOEJBQXRDLFdBQXNDO0FBQUEsTUFBdEMsV0FBc0Msb0NBQXhCLElBQXdCO0FBQUEsc0JBQWxCLEdBQWtCO0FBQUEsTUFBbEIsR0FBa0IsNEJBQVosSUFBWTs7QUFDekcsMkJBQU8sK0NBQVAsRUFBK0MsdURBQS9DO0FBQ0EsMkJBQU8sUUFBUCxFQUFpQixxQ0FBakI7O0FBRUEsUUFBTSxTQUFTLDBCQUFmOztBQUVBLE1BQUksR0FBSixFQUFTLE9BQU8sR0FBUCxDQUFXLHlCQUFPLGNBQWMsS0FBZCxHQUFzQixRQUE3QixDQUFYO0FBQ1QsU0FBTyxHQUFQLENBQVcsK0JBQVEsa0JBQUssSUFBTCxDQUFVLFNBQVYsRUFBcUIsdUJBQXJCLENBQVIsQ0FBWDtBQUNBLFNBQU8sR0FBUCxDQUFXLHVCQUFLO0FBQ2QsWUFBUSxDQUFDLHVCQUFELEVBQTBCLDJCQUExQixFQUF1RCxnQkFBdkQsQ0FETTtBQUVkLGlCQUFhO0FBRkMsR0FBTCxDQUFYOztBQUtBLFNBQU8sR0FBUCxDQUFXLEtBQVgsRUFBa0I7QUFBQSxnQ0FBWSxXQUFNLEdBQU4sRUFBYTs7QUFFekMsWUFBTSxTQUFTLE1BQU0sZ0JBQUcsWUFBSCxDQUFnQixRQUFoQixDQUFyQjs7O0FBR0EsWUFBTSxPQUFPLFVBQVAsQ0FBa0IsT0FBbEIsQ0FBTjs7O0FBR0EsVUFBSSxNQUFKLEVBQVksTUFBTSx3QkFBd0IsR0FBeEIsRUFBNkIsTUFBN0IsRUFBcUMsTUFBckMsQ0FBTjs7OztBQUlaLG1DQUFXLElBQUksR0FBZixFQUFvQixZQUFNOzs7OztBQUt4QixlQUFPLFVBQVAsQ0FBa0IsUUFBbEIsRUFDRyxJQURILENBQ1E7QUFBQSxpQkFBTSxPQUFPLEdBQVAsRUFBTjtBQUFBLFNBRFIsV0FFUyxpQkFBUztBQUNkLGtCQUFRLEtBQVIsQ0FBYyxNQUFNLEtBQXBCLEU7QUFDQSxpQkFBTyxHQUFQO0FBQ0QsU0FMSDtBQU1ELE9BWEQ7O0FBYUEsYUFBTztBQUNMLGdCQUFRLGFBREg7QUFFTCxpQkFBUztBQUNQO0FBRE8sU0FGSjtBQUtMLGdCQUFRLFdBTEg7QUFNTCxrQkFBVSxXQU5MO0FBT0wscUJBQWEsY0FBYyxzQkFBZDtBQVBSLE9BQVA7QUFTRCxLQWxDaUI7O0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FBbEI7O0FBb0NBLFNBQU8sa0JBQUssWUFBTCxDQUFrQixNQUFsQixDQUFQO0FBQ0QsQ0FsREQ7O3FCQW9EZSxZOzs7QUFFZixNQUFNO0FBQUEsOEJBQTBCLFdBQU8sR0FBUCxFQUFZLE1BQVosRUFBb0IsTUFBcEIsRUFBK0I7OztBQUc3RCxVQUFNLFFBQVEsU0FBUyxHQUFULENBQWQ7QUFDQSxRQUFJLENBQUMsS0FBTCxFQUFZOztBQUVaLFVBQU0sVUFBVSxNQUFNLDBCQUFJLFdBQUosQ0FBZ0IsS0FBaEIsRUFBdUIsTUFBdkIsRUFBK0I7QUFDbkQsZ0JBQVU7QUFEeUMsS0FBL0IsQ0FBdEI7QUFONkQsVUFTdEQsSUFUc0QsR0FTOUMsT0FUOEMsQ0FTdEQsSUFUc0Q7O0FBVTdELFVBQU0sU0FBUyxFQUFmO0FBQ0EsVUFBTSxpQkFBaUIsRUFBdkI7OztBQUdBLFFBQUksSUFBSixFQUFVO0FBQ1IsYUFBTyxJQUFQLENBQVksSUFBWjtBQUNBLHFCQUFlLElBQWYsQ0FBb0IsZ0NBQXBCO0FBQ0Q7Ozs7QUFJRCx5QkFBUSxPQUFSLEVBQWlCLFVBQUMsS0FBRCxFQUFRLEdBQVIsRUFBZ0I7QUFDL0IsYUFBTyxJQUFQLENBQVksR0FBWjtBQUNBLGFBQU8sSUFBUCxDQUFZLEtBQVo7QUFDQSxxQkFBZSxJQUFmLENBQW9CLENBQUMsNkJBQUQsR0FBZ0MsT0FBTyxNQUFQLEdBQWdCLENBQWhELEVBQWtELEdBQWxELEdBQXVELE9BQU8sTUFBOUQsRUFBcUUsT0FBckUsQ0FBcEI7QUFDRCxLQUpEOztBQU1BLFVBQU0sT0FBTyxVQUFQLENBQWtCLENBQUMsT0FBRCxHQUFVLGVBQWUsSUFBZixDQUFvQixJQUFwQixDQUFWLEVBQW9DLEFBQXBDLENBQWxCLEVBQXlELE1BQXpELENBQU47QUFDRCxHQTVCSzs7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUFOOzs7Ozs7Ozs7Ozs7Ozs7O0FBNENBLE1BQU0sWUFBWSx3Q0FBbEI7O0FBRUEsTUFBTSxXQUFXLE9BQU87QUFBQSxRQUNmLGFBRGUsR0FDRSxJQUFJLE9BRE4sQ0FDZixhQURlOztBQUV0QixRQUFNLFFBQVEsVUFBVSxJQUFWLENBQWUsYUFBZixDQUFkO0FBQ0EsTUFBSSxDQUFDLEtBQUwsRUFBWSxPQUFPLElBQVA7QUFDWixTQUFPLE1BQU0sQ0FBTixDQUFQO0FBQ0QsQ0FMRDs7QUFPQSxNQUFNLHlCQUF5QixTQUFTO0FBQ3RDLFVBQVEsS0FBUixDQUFjLE1BQU0sS0FBcEIsRTtBQUNBLFNBQU87QUFDTCxhQUFTLE1BQU0sT0FEVjtBQUVMLGVBQVcsTUFBTSxTQUZaO0FBR0wsV0FBTyxNQUFNO0FBSFIsR0FBUDtBQUtELENBUEQiLCJmaWxlIjoiY3JlYXRlU2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGh0dHAgZnJvbSAnaHR0cCdcbmltcG9ydCB7IGZvckVhY2ggfSBmcm9tICdsb2Rhc2gnXG5pbXBvcnQgRXhwcmVzcyBmcm9tICdleHByZXNzJ1xuaW1wb3J0IG9uRmluaXNoZWQgZnJvbSAnb24tZmluaXNoZWQnXG5pbXBvcnQgbG9nZ2VyIGZyb20gJ21vcmdhbidcbmltcG9ydCBmYXZpY29uIGZyb20gJ3NlcnZlLWZhdmljb24nXG5pbXBvcnQgand0IGZyb20gJ2pzb253ZWJ0b2tlbidcbmltcG9ydCBwZyBmcm9tICdwZydcbmltcG9ydCB7IEdyYXBoUUxTY2hlbWEsIGZvcm1hdEVycm9yIH0gZnJvbSAnZ3JhcGhxbCdcbmltcG9ydCBncmFwaHFsSFRUUCBmcm9tICdleHByZXNzLWdyYXBocWwnXG5pbXBvcnQgY29ycyBmcm9tICdjb3JzJ1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gSFRUUCBzZXJ2ZXIgd2l0aCB0aGUgcHJvdmlkZWQgY29uZmlndXJhdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnXG4gKiBAcGFyYW0ge0dyYXBoUUxTY2hlbWF9IGNvbmZpZy5ncmFwaHFsU2NoZW1hXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnLnBnQ29uZmlnXG4gKiBAcGFyYW0ge3N0cmluZ30gY29uZmlnLnJvdXRlXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGNvbmZpZy5kZXZlbG9wbWVudFxuICogQHJldHVybnMge1NlcnZlcn1cbiAqL1xuY29uc3QgY3JlYXRlU2VydmVyID0gKHtncmFwaHFsU2NoZW1hLCBwZ0NvbmZpZywgcm91dGUgPSAnLycsIHNlY3JldCwgZGV2ZWxvcG1lbnQgPSB0cnVlLCBsb2cgPSB0cnVlLCB9KSA9PiB7XG4gIGFzc2VydChncmFwaHFsU2NoZW1hIGluc3RhbmNlb2YgR3JhcGhRTFNjaGVtYSwgJ011c3QgYmUgYW4gaW5zdGFuY2Ugb2YgR3JhcGhRTCBzY2hlbWEgbXVzdCBiZSBkZWZpbmVkJylcbiAgYXNzZXJ0KHBnQ29uZmlnLCAnQSBQb3N0Z3JlU1FMIGNvbmZpZyBtdXN0IGJlIGRlZmluZWQnKVxuXG4gIGNvbnN0IHNlcnZlciA9IG5ldyBFeHByZXNzKClcblxuICBpZiAobG9nKSBzZXJ2ZXIudXNlKGxvZ2dlcihkZXZlbG9wbWVudCA/ICdkZXYnIDogJ2NvbW1vbicpKVxuICBzZXJ2ZXIudXNlKGZhdmljb24ocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2Fzc2V0cy9mYXZpY29uLmljbycpKSlcbiAgc2VydmVyLnVzZShjb3JzKHtcbiAgICBvcmlnaW46IFsnaHR0cDovL2xvY2FsaG9zdDozMDAwJywgJ2h0dHA6Ly8xOTIuMTY4LjEuMjAxOjMwMDAnLCAnaHR0cDovL3BhNi5jb20nXSxcbiAgICBjcmVkZW50aWFsczogdHJ1ZVxuICB9KSlcblxuICBzZXJ2ZXIuYWxsKHJvdXRlLCBncmFwaHFsSFRUUChhc3luYyByZXEgPT4ge1xuICAgIC8vIEFjcXVpcmUgYSBuZXcgY2xpZW50IGZvciBldmVyeSByZXF1ZXN0LlxuICAgIGNvbnN0IGNsaWVudCA9IGF3YWl0IHBnLmNvbm5lY3RBc3luYyhwZ0NvbmZpZylcblxuICAgIC8vIFN0YXJ0IGEgdHJhbnNhY3Rpb24gZm9yIG91ciBjbGllbnQgYW5kIHNldCBpdCB1cC5cbiAgICBhd2FpdCBjbGllbnQucXVlcnlBc3luYygnYmVnaW4nKVxuXG4gICAgLy8gSWYgd2UgaGF2ZSBhIHNlY3JldCwgbGV04oCZcyBzZXR1cCB0aGUgcmVxdWVzdCB0cmFuc2FjdGlvbi5cbiAgICBpZiAoc2VjcmV0KSBhd2FpdCBzZXR1cFJlcXVlc3RUcmFuc2FjdGlvbihyZXEsIGNsaWVudCwgc2VjcmV0KVxuXG4gICAgLy8gTWFrZSBzdXJlIHdlIHJlbGVhc2Ugb3VyIGNsaWVudCBiYWNrIHRvIHRoZSBwb29sIG9uY2UgdGhlIHJlc3BvbnNlIGhhc1xuICAgIC8vIGZpbmlzaGVkLlxuICAgIG9uRmluaXNoZWQocmVxLnJlcywgKCkgPT4ge1xuICAgICAgLy8gVHJ5IHRvIGVuZCBvdXIgc2Vzc2lvbiB3aXRoIGEgY29tbWl0LiBJZiBpdCBzdWNjZWVkcywgcmVsZWFzZSB0aGVcbiAgICAgIC8vIGNsaWVudCBiYWNrIGludG8gdGhlIHBvb2wuIElmIGl0IGZhaWxzLCByZWxlYXNlIHRoZSBjbGllbnQgYmFjayBpbnRvXG4gICAgICAvLyB0aGUgcG9vbCwgYnV0IGFsc28gcmVwb3J0IHRoYXQgaXQgZmFpbGVkLiBXZSBjYW5ub3QgcmVwb3J0IGFuIGVycm9yIGluXG4gICAgICAvLyB0aGUgcmVxdWVzdCBhdCB0aGlzIHBvaW50IGJlY2F1c2UgaXQgaGFzIGZpbmlzaGVkLlxuICAgICAgY2xpZW50LnF1ZXJ5QXN5bmMoJ2NvbW1pdCcpXG4gICAgICAgIC50aGVuKCgpID0+IGNsaWVudC5lbmQoKSlcbiAgICAgICAgLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yLnN0YWNrKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICBjbGllbnQuZW5kKClcbiAgICAgICAgfSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHNjaGVtYTogZ3JhcGhxbFNjaGVtYSxcbiAgICAgIGNvbnRleHQ6IHtcbiAgICAgICAgY2xpZW50XG4gICAgICB9LFxuICAgICAgcHJldHR5OiBkZXZlbG9wbWVudCxcbiAgICAgIGdyYXBoaXFsOiBkZXZlbG9wbWVudCxcbiAgICAgIGZvcm1hdEVycm9yOiBkZXZlbG9wbWVudCA/IGRldmVsb3BtZW50Rm9ybWF0RXJyb3IgOiBmb3JtYXRFcnJvcixcbiAgICB9XG4gIH0pKVxuXG4gIHJldHVybiBodHRwLmNyZWF0ZVNlcnZlcihzZXJ2ZXIpXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZVNlcnZlclxuXG5jb25zdCBzZXR1cFJlcXVlc3RUcmFuc2FjdGlvbiA9IGFzeW5jIChyZXEsIGNsaWVudCwgc2VjcmV0KSA9PiB7XG4gIC8vIEZpcnN0LCBnZXQgdGhlIHBvc3NpYmxlIGBCZWFyZXJgIHRva2VuIGZyb20gdGhlIHJlcXVlc3QuIElmIGl0IGRvZXMgbm90XG4gIC8vIGV4aXN0LCBleGl0LlxuICBjb25zdCB0b2tlbiA9IGdldFRva2VuKHJlcSlcbiAgaWYgKCF0b2tlbikgcmV0dXJuXG5cbiAgY29uc3QgZGVjb2RlZCA9IGF3YWl0IGp3dC52ZXJpZnlBc3luYyh0b2tlbiwgc2VjcmV0LCB7XG4gICAgYXVkaWVuY2U6ICdwb3N0Z3JhcGhxbCdcbiAgfSlcbiAgY29uc3Qge3JvbGV9ID0gZGVjb2RlZFxuICBjb25zdCB2YWx1ZXMgPSBbXVxuICBjb25zdCBxdWVyeVNlbGVjdGlvbiA9IFtdXG5cbiAgLy8gTWFrZSBzdXJlIHRvIHNldCB0aGUgbG9jYWwgcm9sZSBpZiBpdCBleGlzdHMuXG4gIGlmIChyb2xlKSB7XG4gICAgdmFsdWVzLnB1c2gocm9sZSlcbiAgICBxdWVyeVNlbGVjdGlvbi5wdXNoKCdzZXRfY29uZmlnKFxcJ3JvbGVcXCcsICQxLCB0cnVlKScpXG4gIH1cblxuICAvLyBJdGVyYXRlIHRocm91Z2ggYWxsIG9mIHRoZSBKV1QgZGVjb2RlZCB2YWx1ZXMgYW5kIHNldCBhIGxvY2FsIHBhcmFtZXRlclxuICAvLyB3aXRoIHRoYXQga2V5IGFuZCB2YWx1ZS5cbiAgZm9yRWFjaChkZWNvZGVkLCAodmFsdWUsIGtleSkgPT4ge1xuICAgIHZhbHVlcy5wdXNoKGtleSlcbiAgICB2YWx1ZXMucHVzaCh2YWx1ZSlcbiAgICBxdWVyeVNlbGVjdGlvbi5wdXNoKGBzZXRfY29uZmlnKCdqd3QuY2xhaW1zLicgfHwgJCR7dmFsdWVzLmxlbmd0aCAtIDF9LCAkJHt2YWx1ZXMubGVuZ3RofSwgdHJ1ZSlgKVxuICB9KVxuXG4gIGF3YWl0IGNsaWVudC5xdWVyeUFzeW5jKGBzZWxlY3QgJHtxdWVyeVNlbGVjdGlvbi5qb2luKCcsICcpfWAsIHZhbHVlcylcbn1cblxuLyoqXG4gKiBQYXJzZXMgdGhlIGBCZWFyZXJgIGF1dGggc2NoZW1lIHRva2VuIG91dCBvZiB0aGUgYEF1dGhvcml6YXRpb25gIGhlYWRlciBhc1xuICogZGVmaW5lZCBieSBbUkZDNzIzNV1bMV0uXG4gKlxuICogYGBgXG4gKiBBdXRob3JpemF0aW9uID0gY3JlZGVudGlhbHNcbiAqIGNyZWRlbnRpYWxzICAgPSBhdXRoLXNjaGVtZSBbIDEqU1AgKCB0b2tlbjY4IC8gI2F1dGgtcGFyYW0gKSBdXG4gKiB0b2tlbjY4ICAgICAgID0gMSooIEFMUEhBIC8gRElHSVQgLyBcIi1cIiAvIFwiLlwiIC8gXCJfXCIgLyBcIn5cIiAvIFwiK1wiIC8gXCIvXCIgKSpcIj1cIlxuICogYGBgXG4gKlxuICogWzFdOiBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNzIzNVxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IGJlYXJlclJleCA9IC9eXFxzKmJlYXJlclxccysoW2EtejAtOVxcLS5ffisvXSs9KilcXHMqJC9pXG5cbmNvbnN0IGdldFRva2VuID0gcmVxID0+IHtcbiAgY29uc3Qge2F1dGhvcml6YXRpb259ID0gcmVxLmhlYWRlcnNcbiAgY29uc3QgbWF0Y2ggPSBiZWFyZXJSZXguZXhlYyhhdXRob3JpemF0aW9uKVxuICBpZiAoIW1hdGNoKSByZXR1cm4gbnVsbFxuICByZXR1cm4gbWF0Y2hbMV1cbn1cblxuY29uc3QgZGV2ZWxvcG1lbnRGb3JtYXRFcnJvciA9IGVycm9yID0+IHtcbiAgY29uc29sZS5lcnJvcihlcnJvci5zdGFjaykgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gIHJldHVybiB7XG4gICAgbWVzc2FnZTogZXJyb3IubWVzc2FnZSxcbiAgICBsb2NhdGlvbnM6IGVycm9yLmxvY2F0aW9ucyxcbiAgICBzdGFjazogZXJyb3Iuc3RhY2ssXG4gIH1cbn1cbiJdfQ==