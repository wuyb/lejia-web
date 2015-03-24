'use strict';

angular.module('webApp')
  .factory('Video', function ($resource, configuration) {
    return $resource(configuration.apiHost + 'api/videos/:id/:controller', {
      id: '@_id'
    },
    {
    });
  });