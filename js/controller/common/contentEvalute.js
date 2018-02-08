/**
 * コンテンツの評価画面
 * @return {[type]} [description]
 */

(function() {

    angular
        .module('learnApp')
        .controller('contentEvaluteController', contentEvaluteController);

    contentEvaluteController.$inject = ['$scope', 'ApiService'];

    function contentEvaluteController($scope, ApiService) {
        var contentEvaluteCtrl = this;

        contentEvaluteCtrl.value = {
            comment: "" //評価画面のコメント
        };

        contentEvaluteCtrl.method = {
            clickFinishButton: clickFinishButton, //終了ボタンクリックメソッド
            evaluationRegist: evaluationRegist //評価値の登録メソッド
        };

        //グローバル変数の読み込み
        contentEvaluteCtrl.globalParam = require('./../explain/explainParam');

        /**
         * 終了ボタンクリックメソッド
         * @param  {[type]} difficult  [難易度]
         * @param  {[type]} understand [理解度]
         * @return {[type]}            [description]
         */
        function clickFinishButton(difficult, understand){
            contentEvaluteCtrl.globalParam.flag.showExplain = false; //解説を非表示
            //評価オブジェクトの仮処理
            if(typeof contentEvaluteCtrl.globalParam.value.showExplain.evalute !== 'object'){
                contentEvaluteCtrl.globalParam.value.showExplain.evalute = {
                    difficult: 0,
                    understand: 0
                };
            }
            //評価がされた時
            if(difficult != null && understand != null){
                evaluationRegist(difficult, understand); //評価の登録メソッドの呼び出し
            //評価がされなかった時
            }else{
                //理解度と難易度に0を代入
                showExplain.evalute.difficult += 0;
                showExplain.evalute.understand += 0;
            }

            //コメントがされた時
            if(contentEvaluteCtrl.value.comment != ""){
                console.log(contentEvaluteCtrl.value.comment)
                //POST情報の生成
                var sendData = {};
               sendData.items = {};
               sendData.items.commentId = contentEvaluteCtrl.globalParam.value.showExplain.id;
               sendData.items.comment = contentEvaluteCtrl.value.comment;
               sendData.items.fromUserId = $scope.indexCtrl.value.userId;
               sendData.items.toUserId = contentEvaluteCtrl.globalParam.value.showExplain.userId;
               sendData.items.explainFlag = true;
               /**
                * コメントの登録
                * @type {[Object]} POST情報のオブジェクト
                */
               ApiService.postComment(sendData).success(
                   function(data){
                       console.log("registComment:" + data)
                   }
               )
            }
        }

        /**
         * 評価の登録メソッド
         * @param {Number} difficult 難易度
         * @param {Number} understand 理解度
         */
        function evaluationRegist(difficult, understand){
            var showExplain = contentEvaluteCtrl.globalParam.value.showExplain; //表示中の解説を変数に退避
            showExplain.evalute.difficult += Number(difficult); //難易度の計算
            showExplain.evalute.understand += Number(understand); //理解度の計算
            /**
             * 解説の更新
             * @type {Object} 更新対象の解説オブジェクト
             */
            ApiService.upDateExplain(showExplain).success(
                function(data){
                    console.log("upDateExplain:success")
                }
            )
            /**
             * 評価情報の登録
             * @type {Object} 評価対象の解説オブジェクト
             * @type {String} ユーザID
             * @type {Object} 評価値
             * @type {Boolean} 解説フラグ
             */
            var evalute = {};
            evalute.difficult = Number(difficult);
            evalute.understand = Number(understand);
            ApiService.postEvalute(showExplain,$scope.indexCtrl.value.userId,evalute,true).success(
                function(data){
                    console.log("registEvalute:success");
                }
            )
        }
    }
}());
