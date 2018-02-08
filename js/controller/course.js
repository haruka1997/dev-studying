/**
 * courseController as courseCtrl
 * コース一覧
 */

(function() {
    'use strict';

    angular
        .module('learnApp')
        .controller('courseController', courseController);

    courseController.$inject = ['$scope'];
    function courseController($scope) {
        var courseCtrl = this;

        courseCtrl.value = {
            src: {
                explain: "", //解説を見る画像
                problem: "", //問題を見る画像
                makeExplain: "", //解説を作成する画像
                makeProblem: "" //問題を作成する画像
            }
        }

        courseCtrl.method = {
            clickCourse: clickCourse //コースクリック
        };

        //imageインポート
        courseCtrl.value.src.explain = require('./../../img/explain.jpg');
        courseCtrl.value.src.problem =require('./../../img/problem.jpg');
        courseCtrl.value.src.makeExplain =require('./../../img/makeExplain.jpg');
        courseCtrl.value.src.makeProblem =require('./../../img/makeProblem.jpg');
        
        //初期化
        init();

        /**
         * 初期化メソッド
         */
        function init() {
            $scope.indexCtrl.method.check(); //ログインチェック
            $scope.indexCtrl.method.clickNav(1); //画面スタイルの変更
            //パンくずリストの設定
            if($scope.indexCtrl.value.titleString[1] != undefined){
                $scope.indexCtrl.value.titleString[1] = undefined;
                $scope.indexCtrl.value.titleString[2] = undefined;
            }
        }

        /**
         * コースクリックメソッド
         * @param  {[Number]} course [コース]
         */
        function clickCourse(course){
            $scope.indexCtrl.method.directory("",course,""); //コースの保存
            window.location.href = './#/fieldList/'; //分野一覧画面に遷移
        };

    }

}());
