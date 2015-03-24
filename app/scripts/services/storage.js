'use strict';

angular.module('webApp')
  .factory('Storage', function Storage($location, $rootScope, $http, User, $cookieStore, $q, configuration) {
    return {
      getUpToken: function(callback) {
        $http.get(configuration.apiHost + 'api/videos/token/upload').
        success(function(data) {
          return callback(null, data);
        }).
        error(function(err) {
          return callback(err, null);
        }.bind(this));
      },
      getDownloadUrl: function(key, callback) {
        $http.get(configuration.apiHost + 'api/videos/url/download?key=' + key).
        success(function(data) {
          return callback(null, data);
        }).
        error(function(err) {
          return callback(err, null);
        }.bind(this));
      },
      finishUpload: function(key, hash, name, size, callback) {
        $http.post(configuration.apiHost + 'api/videos/callback/upload?name=' + key + '&hash=' + hash + '&originalName=' + name + '&size=' + size).
        success(function(data) {
          return callback(null, data);
        }).
        error(function(err) {
          return callback(err, null);
        }.bind(this));
      }
    };
  });
