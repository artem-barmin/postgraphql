#!/usr/bin/env node
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

require('./promisify');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _commander = require('commander');

var _pgConnectionString = require('pg-connection-string');

var _createGraphqlSchema = require('./createGraphqlSchema.js');

var _createGraphqlSchema2 = _interopRequireDefault(_createGraphqlSchema);

var _createServer = require('./createServer.js');

var _createServer2 = _interopRequireDefault(_createServer);

var _graphql = require('graphql');

var _pg = require('pg');

var _pg2 = _interopRequireDefault(_pg);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/* eslint-disable no-console */

const manifest = JSON.parse((0, _fs.readFileSync)(_path2['default'].resolve(__dirname, '../package.json')));

const main = (() => {
  var ref = _asyncToGenerator(function* () {
    const program = new _commander.Command('postgraphql');

    /* eslint-disable max-len */
    program.version(manifest.version).usage('[options] <url>').option('-s, --schema <identifier>', 'the PostgreSQL schema to serve a GraphQL server of. defaults to public').option('-n, --hostname <name>', 'a URL hostname the server will listen to. defaults to localhost').option('-p, --port <integer>', 'a URL port the server will listen to. defaults to 3000', parseInt).option('-d, --development', 'enables a development mode which enables GraphiQL, nicer errors, and JSON pretty printing').option('-r, --route <path>', 'the route to mount the GraphQL server on. defaults to /').option('-e, --secret <string>', 'the secret to be used to encrypt tokens. token authentication disabled if this is not set').option('-m, --max-pool-size <integer>', 'the maximum number of connections to keep in the connection pool. defaults to 10').parse(process.argv);
    /* eslint-enable max-len */

    var _program$args = _slicedToArray(program.args, 1);

    var connection = _program$args[0];
    var _program$schema = program.schema;
    var schemaName = _program$schema === undefined ? 'public' : _program$schema;
    var _program$hostname = program.hostname;
    var hostname = _program$hostname === undefined ? 'localhost' : _program$hostname;
    var _program$port = program.port;
    var port = _program$port === undefined ? 3000 : _program$port;
    var _program$development = program.development;
    var development = _program$development === undefined ? false : _program$development;
    var _program$route = program.route;
    var route = _program$route === undefined ? '/graphql/' : _program$route;
    var secret = program.secret;
    var _program$maxPoolSize = program.maxPoolSize;
    var maxPoolSize = _program$maxPoolSize === undefined ? 10 : _program$maxPoolSize;


    connection = process.env.DATABASE_URL || connection;
    port = process.env.PORT || port;

    if (!connection) throw new Error('Must define a PostgreSQL connection string to connect to.');

    // Parse out the connection string into an object and attach a
    // `poolSize` option.
    const pgConfig = _extends({}, (0, _pgConnectionString.parse)(connection), {
      poolSize: maxPoolSize
    });

    // Create the GraphQL schema.
    const graphqlSchema = yield (0, _createGraphqlSchema2['default'])(pgConfig, schemaName);

    // Create the GraphQL HTTP server.
    const server = (0, _createServer2['default'])({
      graphqlSchema,
      pgConfig,
      route,
      secret,
      development
    });

    server.listen(port, hostname, function () {
      console.log(`GraphQL server listening at http://${ hostname }:${ port }${ route } 🚀`);
    });
  });

  return function main() {
    return ref.apply(this, arguments);
  };
})();

main()['catch'](error => console.error(error.stack));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUlBOztBQUVBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7Ozs7Ozs7O0FBRUEsTUFBTSxXQUFXLEtBQUssS0FBTCxDQUFXLHNCQUFhLGtCQUFLLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLGlCQUF4QixDQUFiLENBQVgsQ0FBakI7O0FBRUEsTUFBTTtBQUFBLDhCQUFPLGFBQVk7QUFDdkIsVUFBTSxVQUFVLHVCQUFZLGFBQVosQ0FBaEI7OztBQUdBLFlBQ0csT0FESCxDQUNXLFNBQVMsT0FEcEIsRUFFRyxLQUZILENBRVMsaUJBRlQsRUFHRyxNQUhILENBR1UsMkJBSFYsRUFHdUMsd0VBSHZDLEVBSUcsTUFKSCxDQUlVLHVCQUpWLEVBSW1DLGlFQUpuQyxFQUtHLE1BTEgsQ0FLVSxzQkFMVixFQUtrQyx3REFMbEMsRUFLNEYsUUFMNUYsRUFNRyxNQU5ILENBTVUsbUJBTlYsRUFNK0IsMkZBTi9CLEVBT0csTUFQSCxDQU9VLG9CQVBWLEVBT2dDLHlEQVBoQyxFQVFHLE1BUkgsQ0FRVSx1QkFSVixFQVFtQywyRkFSbkMsRUFTRyxNQVRILENBU1UsK0JBVFYsRUFTMkMsa0ZBVDNDLEVBVUcsS0FWSCxDQVVTLFFBQVEsSUFWakI7OztBQUp1Qix1Q0FpQjhJLE9BakI5SSxDQWlCbEIsSUFqQmtCOztBQUFBLFFBaUJYLFVBakJXO0FBQUEsMEJBaUI4SSxPQWpCOUksQ0FpQkUsTUFqQkY7QUFBQSxRQWlCVSxVQWpCVixtQ0FpQnVCLFFBakJ2QjtBQUFBLDRCQWlCOEksT0FqQjlJLENBaUJpQyxRQWpCakM7QUFBQSxRQWlCaUMsUUFqQmpDLHFDQWlCNEMsV0FqQjVDO0FBQUEsd0JBaUI4SSxPQWpCOUksQ0FpQnlELElBakJ6RDtBQUFBLFFBaUJ5RCxJQWpCekQsaUNBaUJnRSxJQWpCaEU7QUFBQSwrQkFpQjhJLE9BakI5SSxDQWlCc0UsV0FqQnRFO0FBQUEsUUFpQnNFLFdBakJ0RSx3Q0FpQm9GLEtBakJwRjtBQUFBLHlCQWlCOEksT0FqQjlJLENBaUIyRixLQWpCM0Y7QUFBQSxRQWlCMkYsS0FqQjNGLGtDQWlCbUcsV0FqQm5HO0FBQUEsUUFpQmdILE1BakJoSCxHQWlCOEksT0FqQjlJLENBaUJnSCxNQWpCaEg7QUFBQSwrQkFpQjhJLE9BakI5SSxDQWlCd0gsV0FqQnhIO0FBQUEsUUFpQndILFdBakJ4SCx3Q0FpQnNJLEVBakJ0STs7O0FBbUJ2QixpQkFBYSxRQUFRLEdBQVIsQ0FBWSxZQUFaLElBQTRCLFVBQXpDO0FBQ0EsV0FBTyxRQUFRLEdBQVIsQ0FBWSxJQUFaLElBQW9CLElBQTNCOztBQUVBLFFBQUksQ0FBQyxVQUFMLEVBQ0UsTUFBTSxJQUFJLEtBQUosQ0FBVSwyREFBVixDQUFOOzs7O0FBSUYsVUFBTSx3QkFDRCwrQkFBc0IsVUFBdEIsQ0FEQztBQUVKLGdCQUFVO0FBRk4sTUFBTjs7O0FBTUEsVUFBTSxnQkFBZ0IsTUFBTSxzQ0FBb0IsUUFBcEIsRUFBOEIsVUFBOUIsQ0FBNUI7OztBQUdBLFVBQU0sU0FBUywrQkFBYTtBQUMxQixtQkFEMEI7QUFFMUIsY0FGMEI7QUFHMUIsV0FIMEI7QUFJMUIsWUFKMEI7QUFLMUI7QUFMMEIsS0FBYixDQUFmOztBQVFBLFdBQU8sTUFBUCxDQUFjLElBQWQsRUFBb0IsUUFBcEIsRUFBOEIsWUFBTTtBQUNsQyxjQUFRLEdBQVIsQ0FBWSxDQUFDLG1DQUFELEdBQXNDLFFBQXRDLEVBQStDLENBQS9DLEdBQWtELElBQWxELEVBQXVELEFBQXZELEdBQXlELEtBQXpELEVBQStELEdBQS9ELENBQVo7QUFDRCxLQUZEO0FBR0QsR0EvQ0s7O0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFBTjs7QUFpREEsZ0JBQWEsU0FBUyxRQUFRLEtBQVIsQ0FBYyxNQUFNLEtBQXBCLENBQXRCIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuXG5pbXBvcnQgJy4vcHJvbWlzaWZ5J1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMnXG5pbXBvcnQgeyBDb21tYW5kIH0gZnJvbSAnY29tbWFuZGVyJ1xuaW1wb3J0IHsgcGFyc2UgYXMgcGFyc2VDb25uZWN0aW9uU3RyaW5nIH0gZnJvbSAncGctY29ubmVjdGlvbi1zdHJpbmcnXG5pbXBvcnQgY3JlYXRlR3JhcGhxbFNjaGVtYSBmcm9tICcuL2NyZWF0ZUdyYXBocWxTY2hlbWEuanMnXG5pbXBvcnQgY3JlYXRlU2VydmVyIGZyb20gJy4vY3JlYXRlU2VydmVyLmpzJ1xuaW1wb3J0IHsgZXh0ZW5kU2NoZW1hLCBwYXJzZSwgcHJpbnRTY2hlbWEsIGdyYXBocWwsIGV4ZWN1dGUsIEdyYXBoUUxTY2hlbWEsIEdyYXBoUUxTdHJpbmcsIEdyYXBoUUxPYmplY3RUeXBlIH0gZnJvbSAnZ3JhcGhxbCdcbmltcG9ydCBwZyBmcm9tICdwZydcblxuY29uc3QgbWFuaWZlc3QgPSBKU09OLnBhcnNlKHJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vcGFja2FnZS5qc29uJykpKVxuXG5jb25zdCBtYWluID0gYXN5bmMgKCkgPT4ge1xuICBjb25zdCBwcm9ncmFtID0gbmV3IENvbW1hbmQoJ3Bvc3RncmFwaHFsJylcblxuICAvKiBlc2xpbnQtZGlzYWJsZSBtYXgtbGVuICovXG4gIHByb2dyYW1cbiAgICAudmVyc2lvbihtYW5pZmVzdC52ZXJzaW9uKVxuICAgIC51c2FnZSgnW29wdGlvbnNdIDx1cmw+JylcbiAgICAub3B0aW9uKCctcywgLS1zY2hlbWEgPGlkZW50aWZpZXI+JywgJ3RoZSBQb3N0Z3JlU1FMIHNjaGVtYSB0byBzZXJ2ZSBhIEdyYXBoUUwgc2VydmVyIG9mLiBkZWZhdWx0cyB0byBwdWJsaWMnKVxuICAgIC5vcHRpb24oJy1uLCAtLWhvc3RuYW1lIDxuYW1lPicsICdhIFVSTCBob3N0bmFtZSB0aGUgc2VydmVyIHdpbGwgbGlzdGVuIHRvLiBkZWZhdWx0cyB0byBsb2NhbGhvc3QnKVxuICAgIC5vcHRpb24oJy1wLCAtLXBvcnQgPGludGVnZXI+JywgJ2EgVVJMIHBvcnQgdGhlIHNlcnZlciB3aWxsIGxpc3RlbiB0by4gZGVmYXVsdHMgdG8gMzAwMCcsIHBhcnNlSW50KVxuICAgIC5vcHRpb24oJy1kLCAtLWRldmVsb3BtZW50JywgJ2VuYWJsZXMgYSBkZXZlbG9wbWVudCBtb2RlIHdoaWNoIGVuYWJsZXMgR3JhcGhpUUwsIG5pY2VyIGVycm9ycywgYW5kIEpTT04gcHJldHR5IHByaW50aW5nJylcbiAgICAub3B0aW9uKCctciwgLS1yb3V0ZSA8cGF0aD4nLCAndGhlIHJvdXRlIHRvIG1vdW50IHRoZSBHcmFwaFFMIHNlcnZlciBvbi4gZGVmYXVsdHMgdG8gLycpXG4gICAgLm9wdGlvbignLWUsIC0tc2VjcmV0IDxzdHJpbmc+JywgJ3RoZSBzZWNyZXQgdG8gYmUgdXNlZCB0byBlbmNyeXB0IHRva2Vucy4gdG9rZW4gYXV0aGVudGljYXRpb24gZGlzYWJsZWQgaWYgdGhpcyBpcyBub3Qgc2V0JylcbiAgICAub3B0aW9uKCctbSwgLS1tYXgtcG9vbC1zaXplIDxpbnRlZ2VyPicsICd0aGUgbWF4aW11bSBudW1iZXIgb2YgY29ubmVjdGlvbnMgdG8ga2VlcCBpbiB0aGUgY29ubmVjdGlvbiBwb29sLiBkZWZhdWx0cyB0byAxMCcpXG4gICAgLnBhcnNlKHByb2Nlc3MuYXJndilcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG1heC1sZW4gKi9cblxuICB2YXIge2FyZ3M6IFtjb25uZWN0aW9uXSwgc2NoZW1hOiBzY2hlbWFOYW1lID0gJ3B1YmxpYycsIGhvc3RuYW1lID0gJ2xvY2FsaG9zdCcsIHBvcnQgPSAzMDAwLCBkZXZlbG9wbWVudCA9IGZhbHNlLCByb3V0ZSA9ICcvZ3JhcGhxbC8nLCBzZWNyZXQsIG1heFBvb2xTaXplID0gMTAsIH0gPSBwcm9ncmFtXG5cbiAgY29ubmVjdGlvbiA9IHByb2Nlc3MuZW52LkRBVEFCQVNFX1VSTCB8fCBjb25uZWN0aW9uO1xuICBwb3J0ID0gcHJvY2Vzcy5lbnYuUE9SVCB8fCBwb3J0O1xuXG4gIGlmICghY29ubmVjdGlvbilcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ011c3QgZGVmaW5lIGEgUG9zdGdyZVNRTCBjb25uZWN0aW9uIHN0cmluZyB0byBjb25uZWN0IHRvLicpXG5cbiAgLy8gUGFyc2Ugb3V0IHRoZSBjb25uZWN0aW9uIHN0cmluZyBpbnRvIGFuIG9iamVjdCBhbmQgYXR0YWNoIGFcbiAgLy8gYHBvb2xTaXplYCBvcHRpb24uXG4gIGNvbnN0IHBnQ29uZmlnID0ge1xuICAgIC4uLnBhcnNlQ29ubmVjdGlvblN0cmluZyhjb25uZWN0aW9uKSxcbiAgICBwb29sU2l6ZTogbWF4UG9vbFNpemUsXG4gIH1cblxuICAvLyBDcmVhdGUgdGhlIEdyYXBoUUwgc2NoZW1hLlxuICBjb25zdCBncmFwaHFsU2NoZW1hID0gYXdhaXQgY3JlYXRlR3JhcGhxbFNjaGVtYShwZ0NvbmZpZywgc2NoZW1hTmFtZSk7XG5cbiAgLy8gQ3JlYXRlIHRoZSBHcmFwaFFMIEhUVFAgc2VydmVyLlxuICBjb25zdCBzZXJ2ZXIgPSBjcmVhdGVTZXJ2ZXIoe1xuICAgIGdyYXBocWxTY2hlbWEsXG4gICAgcGdDb25maWcsXG4gICAgcm91dGUsXG4gICAgc2VjcmV0LFxuICAgIGRldmVsb3BtZW50LFxuICB9KVxuXG4gIHNlcnZlci5saXN0ZW4ocG9ydCwgaG9zdG5hbWUsICgpID0+IHtcbiAgICBjb25zb2xlLmxvZyhgR3JhcGhRTCBzZXJ2ZXIgbGlzdGVuaW5nIGF0IGh0dHA6Ly8ke2hvc3RuYW1lfToke3BvcnR9JHtyb3V0ZX0g8J+agGApXG4gIH0pXG59XG5cbm1haW4oKS5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yLnN0YWNrKSlcbiJdfQ==