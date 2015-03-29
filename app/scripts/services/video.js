'use strict';

angular.module('webApp')
  .factory('Video', function ($resource, configuration) {
    return $resource(configuration.apiHost + 'api/videos/:id/:controller', {
      id: '@_id'
    },
    {
      update: {
        method: 'PUT'
      },
      getCategories: {
        method: 'GET',
        params: {
          id:'categories'
        },
        isArray: true
      }
    });
  });
