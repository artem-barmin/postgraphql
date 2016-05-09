'use strict';

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _pg = require('pg');

var _pg2 = _interopRequireDefault(_pg);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// Side effect…
_bluebird2['default'].promisifyAll(_pg2['default']);
_bluebird2['default'].promisifyAll(_pg.Client);
_bluebird2['default'].promisifyAll(_jsonwebtoken2['default']);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wcm9taXNpZnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7QUFHQSxzQkFBUSxZQUFSO0FBQ0Esc0JBQVEsWUFBUjtBQUNBLHNCQUFRLFlBQVIiLCJmaWxlIjoicHJvbWlzaWZ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFByb21pc2UgZnJvbSAnYmx1ZWJpcmQnXG5pbXBvcnQgcGcsIHsgQ2xpZW50IH0gZnJvbSAncGcnXG5pbXBvcnQgand0IGZyb20gJ2pzb253ZWJ0b2tlbidcblxuLy8gU2lkZSBlZmZlY3TigKZcblByb21pc2UucHJvbWlzaWZ5QWxsKHBnKVxuUHJvbWlzZS5wcm9taXNpZnlBbGwoQ2xpZW50KVxuUHJvbWlzZS5wcm9taXNpZnlBbGwoand0KVxuIl19