(function() {
    'use strict';

    angular
        .module('learnApp')
        .controller('codeExplainController', codeExplainController);

    codeExplainController.$inject = ['$scope','$sce'];
    function codeExplainController($scope, $sce) {
        var codeExplainCtrl = this;

        init();

        function init(){
            $scope.indexCtrl.value.flag.codeExplain = true;
        };
    };
}());
