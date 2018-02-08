/**
 * mainController as mainCtrl
 * コーストップ
 */

(function() {
    'use strict';

    angular
        .module('learnApp')
        .controller('mainController', mainController);

    mainController.$inject = ['$scope'];
    function mainController($scope) {
        var mainCtrl = this;

        mainCtrl.value = {
            src: {
                explain: "",
                problem: "",
                board: "",
                makeExplain: "",
                makeProblem: ""
            }
        };

        //imageインポート
        mainCtrl.value.src.explain = require('./../../img/explain.jpg');
        mainCtrl.value.src.problem =require('./../../img/problem.jpg');
        mainCtrl.value.src.board =require('./../../img/board.jpg');
        mainCtrl.value.src.makeExplain =require('./../../img/makeExplain.jpg');
        mainCtrl.value.src.makeProblem =require('./../../img/makeProblem.jpg');
        init();

        /**
         * 初期化メソッド
         */
        function init(){
            $scope.indexCtrl.value.title = "コースについて";
            $scope.indexCtrl.method.clickNav(1);
            $scope.indexCtrl.value.titleString = []; //タイトルの初期化
        };

    }

}());
