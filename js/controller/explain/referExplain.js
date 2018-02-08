/**
 * referExplainController as referExplainCtrl
 * 解説を見る
 */

(function() {

    angular
        .module('learnApp')
        .controller('referExplainController', referExplainController);

    referExplainController.$inject = ['$scope', '$sce','ApiService'];

    function referExplainController($scope,$sce,ApiService) {
        var referExplainCtrl = this;

        referExplainCtrl.method = {
            init:init, //初期化
            clickEditCompleteButton: clickEditCompleteButton, //編集完了ボタンクリック
            clickDeleteButton: clickDeleteButton, //削除ボタンクリック
            clickEditFinishButton:clickEditFinishButton, //編集終了クリック
        };
        //スタイル読み込み
        require('./../../../css/explain/explain.css');
        require('./../../../css/explain/makeExplain.css');

        //グローバル変数の読み込み
        referExplainCtrl.globalParam = require('./explainParam');

        init(); //初期化メソッド

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            $scope.indexCtrl.method.clickNav(1); //画面スタイル適用
            referExplainCtrl.globalParam.value.explainList = undefined; //リスト内容リセット
            referExplainCtrl.globalParam.flag.explainList = true; //リスト表示
            referExplainCtrl.globalParam.flag.explainListLoading = true; //リスト読み込み中
       }


        /**
         * 編集完了ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickEditCompleteButton(){
            var detailExplain = referExplainCtrl.globalParam.value.detailExplain; //編集した解説の退避
            /**
             * 解説の更新
             * @type {[Object]} 編集した解説
             */
            ApiService.upDateExplain(detailExplain).success(
                function(){
                    referExplainCtrl.globalParam.value.detailExplain = undefined; //編集した解説の初期化
                    init(); //初期化メソッド
                }
            );
        }

        /**
         * 削除ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickDeleteButton(){
            var showExplain = referExplainCtrl.globalParam.value.showExplain; //表示している解説
            /**
             * 解説の削除
             * @type {[Number]} 削除する解説のID
             */
            ApiService.deleteExplain(showExplain.id).success(
                function(){
                    referExplainCtrl.globalParam.value.showExplain = undefined;
                    init(); //初期化メソッド
                }
            )
        }

        /**
         * 解説編集の終了メソッド
         * @return {[type]} [description]
         */
        function clickEditFinishButton(){
            referExplainCtrl.globalParam.value.flag.detailExplain = false; //解説編集画面閉じる
            init(); //初期化メソッド
        }
    }
}());
