(function() {

    angular
        .module('learnApp')
        .controller('showProblemController', showProblemController);

    showProblemController.$inject = ['$scope','$sce','ApiService'];
    function showProblemController($scope,$sce,ApiService) {
        var showProblemCtrl = this;

        showProblemCtrl.method = {
            clickAnswer:clickAnswer, //選択肢の解答クリック
            clickSubmit:clickSubmit, //書き取りの解答クリック
            clickNextProblem:clickNextProblem, //次の問題クリック
            clickBackProblem:clickBackProblem, //前の問題クリック
            clickReturn:clickReturn,  //問題一覧に戻るクリック
            clickDetail:clickDetail, //編集クリック
            calcAnswerRate: calcAnswerRate //正解率の計算
        };

        showProblemCtrl.value = {
            problem: {}, //表示する問題
            problems: [], //全ての問題
            flag: {
                correct: false, //正解
                inCorrect: false, //不正解
                showExplain: false, //解説表示
                sameUser: false //自分が作成した解説
            },
            inputAnswer: "", //入力した解答
            evalute: { //評価
                dif_level: undefined,
                und_level: undefined
            },
            answerRate: 0, //正解率
            answeredProblemNum: 0, //解答した問題数
            answerNum: 0 //正解数

        }
        //スタイルロード
        require('./../../../css/problem/showProblem.css');

        //グローバル変数の読み込み
        showProblemCtrl.globalParam = require('./../module/problemParam');

        init(); //初期化メソッド

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            //問題編集のプレビュー時
            if(showProblemCtrl.globalParam.flag.previewProblem){
                showProblemCtrl.value.problem = showProblemCtrl.globalParam.value.previewProblem; //プレビューの問題を表示する問題にセット
                showProblemCtrl.value.problems = showProblemCtrl.value.problem;
            }else{
                showProblemCtrl.value.problems = showProblemCtrl.globalParam.value.problemList; //問題リストを全ての問題にセット
                showProblemCtrl.value.problem = showProblemCtrl.globalParam.value.showProblem; //表示する問題のセット
            }
            showProblemCtrl.value.flag.correct = false; //正解非表示
            showProblemCtrl.value.flag.inCorrect = false; //不正解非表示
            //表示する問題の作成者かどうか
            sameUserCheck(showProblemCtrl.value.problem); //作成者チェックメソッド呼び出し
        }

        /**
         * 解答ボタンクリックメソッド
         * @param  {[Number]} No [クリックした解答番号]
         * @return {[type]} [description]
         */
        function clickAnswer(No){
            //プレビューでないとき
            //解答の可否を表示
            if(No == showProblemCtrl.value.problem.answer){ //正解
                showProblemCtrl.value.flag.correct = true;
                showProblemCtrl.value.flag.inCorrect = false;
            }else{                                      //不正解
                showProblemCtrl.value.flag.inCorrect = true;
                showProblemCtrl.value.flag.correct = false;
            }
        }

        /**
         * 書き取り式の解答ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickSubmit(){
            //プレビューでないとき
            //解答の可否を表示
            if(showProblemCtrl.value.inputAnswer == showProblemCtrl.value.problem.answer){ //正解
                showProblemCtrl.value.flag.correct = true;
                showProblemCtrl.value.flag.inCorrect = false;
            }else{                                                                 //不正解
                showProblemCtrl.value.flag.inCorrect = true;
                showProblemCtrl.value.flag.correct = false;
            }
            showProblemCtrl.value.flag.showExplain = true;
        }

        /**
         * 次の問題ボタンクリックメソッド
         * @param  {[Number]} No    [問題番号]
         * @return {[type]} [description]
         */
        function clickNextProblem(No){
            calcAnswerRate(); //正解率の計算メソッド呼び出し
            newProblemSetting(); //新しい問題表示の設定メソッド呼び出し
            showProblemCtrl.value.problem = showProblemCtrl.value.problems[No]; //次の問題をセット
            sameUserCheck(showProblemCtrl.value.problem); //作成者チェックメソッド呼び出し
        }

        /**
         * 前の問題ボタンクリックメソッド
         * @param  {[Number]} No [クリックした問題番号]
         * @return {[type]} [description]
         */
        function clickBackProblem(No){
            calcAnswerRate(); //正解率の計算メソッド呼び出し
            newProblemSetting(); //新しい問題表示の設定メソッド呼び出し
            showProblemCtrl.value.problem = showProblemCtrl.value.problems[No-2];
            sameUserCheck(showProblemCtrl.value.problem);
        }

        /**
         * 新しい問題の設定メソッド
         * @return {[type]} [description]
         */
        function newProblemSetting(){
            //評価がされたとき評価計算へ
            if(showProblemCtrl.value.evalute.dif_level !== undefined || showProblemCtrl.value.evalute.und_level !== undefined){
                calcEvalute(showProblemCtrl.value.evalute.dif_level, showProblemCtrl.value.evalute.und_level);
            }
            showProblemCtrl.value.inputAnswer = undefined; //入力した解答を初期化
            showProblemCtrl.value.flag.showExplain = false; //解説非表示
            showProblemCtrl.value.flag.correct = false; //正解非表示
            showProblemCtrl.value.flag.inCorrect = false; //不正解非表示
        }

        /**
         * 表示する問題の作成者がどうかチェックするメソッド
         * @param  {[Array]} problem [表示する問題]
         * @return {[type]}         [description]
         */
        function sameUserCheck(problem){
            if(problem.userId == $scope.indexCtrl.value.userId){
                showProblemCtrl.value.flag.sameUser = true;
            }else{
                showProblemCtrl.value.flag.sameUser = false;
            }
        }

        /**
         * 問題一覧に戻るクリックメソッド
         * @return {[type]} [description]
         */
        function clickReturn(){
            //プレビュー表示のとき
            if(showProblemCtrl.globalParam.flag.previewProblem){
                showProblemCtrl.globalParam.flag.previewProblem = false;//プレビュー非表示
                showProblemCtrl.globalParam.flag.detailProblem = true; //編集表示
            }else{
                showProblemCtrl.globalParam.flag.showProblem = false; //問題非表示
            }
            newProblemSetting(); //新しい問題表示の設定メソッド呼び出し
        }

        /**
         * 評価計算
         * @param  {[Number]} dif_level [難易度の評価値]
         * @param  {[Number]} und_level [理解度の評価値]
         * @return {[type]} [description]
         */
        function calcEvalute(dif_level, und_level){
            //仮処理
            if(typeof showProblemCtrl.value.problem.evalute !== 'object'){
                showProblemCtrl.value.problem.evalute = {
                    difficult: 0,
                    understand: 0
                };
            }
            showProblemCtrl.value.problem.evalute.difficult += Number(dif_level); //評価値の計算
            showProblemCtrl.value.problem.evalute.understand += Number(und_level); //評価値の計算
            /**
             * 評価の登録
             * @type {Object} 評価された問題
             * @type {String} ユーザID
             * @type {Number} 評価値
             * @type {Boolean} 解説フラグ
             */
            var evalute = {};
            evalute.difficult = Number(dif_level);
            evalute.understand = Number(und_level);
            ApiService.postEvalute(showProblemCtrl.value.problem,$scope.indexCtrl.value.userId,evalute,false);
            /**
             * 問題の更新
             * @type {Object} 更新対象の問題
             */
            ApiService.updateProblem(showProblemCtrl.value.problem);
            showProblemCtrl.value.evalute.dif_level = undefined;
            showProblemCtrl.value.evalute.und_level = undefined;

            if(showProblemCtrl.value.comment !== undefined){
                //POSTデータの設定
                var sendData = {};
                sendData.items = {};
                sendData.items.commentId = showProblemCtrl.value.problem.id;
                sendData.items.comment = showProblemCtrl.value.comment;
                sendData.items.fromUserId = $scope.indexCtrl.value.userId;
                sendData.items.toUserId = showProblemCtrl.value.problem.userId;
                sendData.items.explainFlag = false;
                /**
                 * コメントの登録
                 * @type {Object} POSTデータ
                 */
                ApiService.postComment(sendData);
                showProblemCtrl.value.comment = ""; //コメントの初期化
            }
       }

       /**
        * 編集ボタンクリックメソッド
        * @return {[type]} [description]
        */
       function clickDetail(){
           showProblemCtrl.globalParam.value.detailProblem = showProblemCtrl.value.problem; //表示中の問題を編集する問題にセット
           showProblemCtrl.globalParam.flag.showProblem = false; //問題非表示
           showProblemCtrl.globalParam.flag.detailProblem = true; //問題編集表示
       }

       /**
        * 正解率の計算メソッド
        * @return {[type]} [description]
        */
       function calcAnswerRate(){
           showProblemCtrl.value.answeredProblemNum++;
           if(showProblemCtrl.value.flag.correct){
               showProblemCtrl.value.answerNum++;
           }
           showProblemCtrl.value.answerRate = Math.round((showProblemCtrl.value.answerNum / showProblemCtrl.value.answeredProblemNum) * Math.round(10, 2)) / Math.round(10, 2) * 100;
           //showProblemCtrl.value.answerRate = showProblemCtrl.value.answerNum / showProblemCtrl.value.answeredProblemNum * 100;
       }

    }
}());
