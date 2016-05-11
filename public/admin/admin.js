var myApp = angular.module('myApp', ['ng-admin']);

const requestFields = {
  "topic": `name`,
  "argument": `
  content
  topic
  topicByTopic
  {
    id
    name
  }
  `,
  "user": `login password`,
  "config": `key valueText valueNumber valueJson`
}

myApp.config(['NgAdminConfigurationProvider', function(nga) {
  var admin = nga.application('Political Admin')
    .baseApiUrl(''); // main API endpoint

  var topic = nga.entity('topic'); // the API endpoint for users will be 'http://jsonplaceholder.typicode.com/users/:id
  var argument = nga.entity('argument');
  var user = nga.entity('user');
  var config = nga.entity('config');

  topic.listView()
    .fields([
      nga.field('name').isDetailLink(true)
    ]);
  topic.creationView().fields([
    nga.field('name')
      .validation({
        required: true,
        minlength: 3,
        maxlength: 100
      }),
    nga.field('arguments', 'referenced_list')
      .targetEntity(argument)
      .targetReferenceField('topic')
      .targetFields([
        nga.field('content')
      ])
      .listActions(['edit'])
  ]);
  topic.editionView().fields(topic.creationView().fields());

  argument.listView().fields([
    nga.field('content').isDetailLink(true),
    nga.field('topicByTopic.name').label('Topic')
  ])
  argument.creationView()
    .fields([
      nga.field('content'),
      nga.field('topic', 'reference')
        .label('Topic')
        .targetEntity(topic)
        .targetField(nga.field('name'))
        .validation({
          required: true
        })
    ]);

  argument.editionView().fields(argument.creationView().fields());

  user.listView().fields([
    nga.field('login').isDetailLink(true),
  ])
  user.creationView().fields([
    nga.field('login'),
    nga.field('password', 'password')
  ])
  user.editionView().fields(user.creationView().fields());

  config.listView().fields([
    nga.field('key').isDetailLink(true),
    nga.field('value').template("{{entry.values.valueText || entry.values.valueNumber || entry.values.valueJson}}")
  ]);

  config.editionView().fields([
    nga.field('key'),
    nga.field('valueText'),
    nga.field('valueNumber'),
    nga.field('valueJson', 'embedded_list')
      .targetFields([
        nga.field('value')
      ])
  ])
    .title('Edit config parameter "{{entry.values.key}}"');

  admin.addEntity(argument)
  admin.addEntity(topic)
  admin.addEntity(user)
  admin.addEntity(config)

  admin.menu(nga.menu()
    .addChild(nga.menu(topic).icon('<span class="glyphicon glyphicon-list"></span>'))
    .addChild(nga.menu(argument).icon('<span class="glyphicon glyphicon-edit"></span>'))
    .addChild(nga.menu(user).icon('<span class="glyphicon glyphicon-user"></span>'))
    .addChild(nga.menu(config).icon('<span class="glyphicon glyphicon-edit"></span>'))
  );

  nga.configure(admin);
}]);

function typeOfRequest(config) {
  console.log(config)
  let {method, url} = config;
  if (method === "GET" && url.match(/^[a-z]*$/)) {
    return {
      type: "LIST",
      entity: url
    };
  } else if (method === "GET" && url.match(/.*\/.*/)) {
    let [_, entity, id] = url.match(/(.*)\/(.*)/);
    return {
      type: "GET",
      id: id,
      entity: entity
    };
  } else if (method === "PUT" || method === "DELETE") {
    let [_, entity, id] = url.match(/(.*)\/(.*)/);
    return {
      type: method,
      id: id,
      entity: entity
    };
  } else if (method === "POST") {
    return {
      type: "POST",
      entity: url
    };
  }
}

function toMutationString(fields) {
  return _.compact(_.map(fields, function(value, key) {
    if (value) {
      var serialized = JSON.stringify(value)
      if (_.isObject(value)) {
        serialized = '"' + serialized.replace(/"/g, "\\\"") + '"'
      }
      return key + ":" + serialized
    }
  })).join(",");
}

var graphQlHost = "https://political-clojure.herokuapp.com/graphql/";

function RESTtoGraphQL(config) {
  let {method, params, url, data} = config;
  let {type, id, entity} = typeOfRequest(config);
  console.log('config', type, entity, config);
  let fields = requestFields[entity];
  if (type === "LIST") {
    let {_filters} = params || {};
    let filterFields = toMutationString(_filters);
    return {
      method: "POST",
      headers: {},
      url: graphQlHost,
      data: {
        query: `query{
          ${entity}Nodes(offset:0,${filterFields}){
            nodes {
              id
              ${fields}
            }
            totalCount
          }
        }`,
        variables: null
      }
    };
  } else if (type === "GET") {
    return {
      method: "POST",
      headers: {},
      url: graphQlHost,
      data: {
        query: `query{
          ${entity}(id:"${id}"){
            id
            ${fields}
          }
        }`,
        variables: null
      }
    }
  } else if (type === "PUT") {
    const modifiedFields = _l.mapKeys(_.omit(data, ['id']), (v, key) => {
      return 'new' + _l.upperFirst(key);
    });
    const mutationInput = toMutationString(modifiedFields);
    return {
      method: "POST",
      headers: {},
      url: graphQlHost,
      data: {
        query: `mutation{
          update${_l.upperFirst(entity)}(input:{id:"${id}",${mutationInput}}){
            ${entity}{
              id
            }
          }
        }`,
        variables: null
      }
    }
  } else if (type === "POST") {
    const mutationInput = toMutationString(data);
    return {
      method: "POST",
      headers: {},
      url: graphQlHost,
      data: {
        query: `mutation{
          insert${_l.upperFirst(entity)}(input:{${mutationInput}}){
            ${entity}{
              id
            }
          }
        }`,
        variables: null
      }
    };
  } else if (type === "DELETE") {
    return {
      method: "POST",
      headers: {},
      url: graphQlHost,
      data: {
        query: `mutation{
          delete${_l.upperFirst(entity)}(input:{id:"${id}"}){
            ${entity}{
              id
            }
          }
        }`,
        variables: null
      }
    }
  }
  return config;
}

myApp.config(function($provide) {
  $provide.decorator('$http', ["$delegate", function($delegate) {
    function $doggedHttp(config) {
      return $delegate(RESTtoGraphQL(config)).then((res) => {
        let {type, entity} = typeOfRequest(config);
        console.log('result', res);
        if (res.data.errors)
          throw new Error(res.data.errors[0].message);
        switch (type) {
          case "LIST":
            return Object.assign(res, {
              data: res.data.data[entity + "Nodes"].nodes
            });
          case "GET":
            return Object.assign(res, {
              data: res.data.data[entity]
            });
          case "POST":
            return Object.assign(res, {
              data: res.data.data["insert" + _l.upperFirst(entity)][entity]
            })
          default:
            return res;
        }
      });
    }
    $doggedHttp.get = $delegate.get;
    return $doggedHttp;
  }])
});
