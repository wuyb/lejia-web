'use strict';

angular.module('webApp')
  .factory('User', function ($resource, configuration) {
    return $resource(configuration.apiHost + 'api/users/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      }
    });
  });
