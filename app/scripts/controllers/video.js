'use strict';

/**
 * @ngdoc function
 * @name webApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the webApp
 */
angular.module('webApp')
  .controller('VideoCtrl', function ($scope, FileUploader, configuration, Storage) {

    $scope.getUpToken = function(callback) {
      Storage.getUpToken(function(err, token) {
        callback(token.uptoken);
      });
    }

    // configure the uploader
    var uploader = $scope.uploader = new FileUploader({
      url: 'http://up.qiniu.com',
      queueLimit: 1,
      removeAfterUpload: true
    });
    uploader.filters.push({
        name: 'videoFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            console.log(type);
            return '|x-msvideo|x-ms-wmv|quicktime|mp4|avi|mpeg|'.indexOf(type) !== -1;
        }
    });

    $scope.upload = function(item) {
      $scope.getUpToken(function(token) {
        item.formData = [{'token': token}];
        item.upload();
      });
    }

    $scope.resetFileSelector = function() {
      // dirty trick to reset the file input
      var fileSelector = $('#file-selector');
      fileSelector.wrap('<form>').closest('form').get(0).reset();
      fileSelector.unwrap();
    }

    uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
    };
    uploader.onAfterAddingFile = function(fileItem) {
        console.info('onAfterAddingFile', fileItem);
        $scope.upload(fileItem);
        $scope.item = fileItem;
        $scope.uploading = true;
        $scope.loading = true;
    };
    uploader.onBeforeUploadItem = function(item) {
        console.info('onBeforeUploadItem', item);
        console.log(JSON.stringify(item.formData));
    };
    uploader.onProgressItem = function(fileItem, progress) {
    };
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
        console.info('onSuccessItem', fileItem, response, status, headers);
        // notify the server that the upload is done
        Storage.finishUpload(response.key, response.hash, function(data) {
          $scope.item = null;
          $scope.uploading = false;
          $scope.loading = false;
        });
    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
    };
    uploader.onCancelItem = function(fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
        $scope.item = null;
        $scope.uploading = false;
        $scope.loading = false;
    };
    uploader.onCompleteItem = function(fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
        $scope.resetFileSelector();
    };

  });
