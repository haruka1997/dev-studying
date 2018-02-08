/**
 * problemFormController as problemFormCtrl
 * 問題を作成する
 */
(function() {

    angular
        .module('learnApp')
        .controller('problemFormController', problemFormController);

    problemFormController.$inject = ['$scope','$sce'];

    function problemFormController($scope,$sce) {
        var problemFormCtrl = this;

        problemFormCtrl.value = {
            problem: {}, //作成or編集する問題
            previewContent: "", //プレビュー時の問題文
            flag:{
                choiceFlag: true, //選択式フラグ
                writeFlag: false, //書き取り式フラグ
                statementFlag: false, //論述式フラグ
                alert: false, //アラートフラグ
            },
            style:{
                choiceStyle: "", //選択式のスタイル
                writeStyle: "", //書き取り式のスタイル
                statementStyle: "", //論述式のスタイル
            },
            alert: [] //アラート文
        };

        problemFormCtrl.method = {
            clickPreview: clickPreview, //プレビュー表示
            styleChange: styleChange, //スタイル変更(タブが押された時)
            dataCheck: dataCheck, //入力データチェック
            clickChoiceAnswer:clickChoiceAnswer //選択肢式の正解番号クリック
        };

        //スタイルロード
        require('./../../../css/problem/makeProblem.css');
        require('./../../../css/commonProblem.css');

        //グローバル変数の読み込み
        problemFormCtrl.globalParam = require('./../module/problemParam');

        init();//初期化メソッド

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            //タブスタイルセット
            problemFormCtrl.value.style.choiceStyle = {background: '#4790BB',color: '#fff'};
            problemFormCtrl.value.style.writeStyle = {background:'#fff',color: '#4790BB'};
            problemFormCtrl.value.style.statementStyle = {background:'#fff',color: '#4790BB'};

            //問題編集のとき
            if(problemFormCtrl.globalParam.flag.detailProblem){
                problemFormCtrl.value.problem = problemFormCtrl.globalParam.value.detailProblem; //問題編集内容のセット
                //問題の形式が選択肢式のとき
                if(problemFormCtrl.value.problem.format == '選択肢'){
                    //選択肢をセット
                    problemFormCtrl.value.problem.No1 = problemFormCtrl.globalParam.value.detailProblem.choiceNo[0];
                    problemFormCtrl.value.problem.No2 = problemFormCtrl.globalParam.value.detailProblem.choiceNo[1];
                    problemFormCtrl.value.problem.No3 = problemFormCtrl.globalParam.value.detailProblem.choiceNo[2];
                    problemFormCtrl.value.problem.No4 = problemFormCtrl.globalParam.value.detailProblem.choiceNo[3];
                }
            }
        }

        /**
         * タブのスタイル変更メソッド
         * @param  {[Number]} style [0:選択式,1:書き取り式,2:論述式]
         * @return {[type]} [description]
         */
        function styleChange(style){
            problemFormCtrl.value.answer = "";
            if(style == 0){ //選択式
                problemFormCtrl.value.flag.choiceFlag = true;
                problemFormCtrl.value.flag.writeFlag = false;
                problemFormCtrl.value.flag.statementFlag = false;
                problemFormCtrl.value.style.choiceStyle = {background: '#4790BB',color: '#fff'};
                problemFormCtrl.value.style.writeStyle = {background:'#fff',color: '#4790BB'};
                problemFormCtrl.value.style.statementStyle = {background:'#fff',color: '#4790BB'};
            }else if(style == 1){ //書き取り式
                problemFormCtrl.value.flag.writeFlag = true;
                problemFormCtrl.value.flag.choiceFlag = false;
                problemFormCtrl.value.flag.statementFlag = false;
                problemFormCtrl.value.style.choiceStyle = {background: '#fff',color: '#4790BB'};
                problemFormCtrl.value.style.writeStyle = {background:'#4790BB',color: '#fff'};
                problemFormCtrl.value.style.statementStyle = {background:'#fff',color: '#4790BB'};
            }else{ //論述式
                problemFormCtrl.value.flag.writeFlag = false;
                problemFormCtrl.value.flag.choiceFlag = false;
                problemFormCtrl.value.flag.statementFlag = true;
                problemFormCtrl.value.style.choiceStyle = {background: '#fff',color: '#4790BB'};
                problemFormCtrl.value.style.writeStyle = {background:'#fff',color: '#4790BB'};
                problemFormCtrl.value.style.statementStyle = {background:'#4790BB',color: '#fff'};
            }
        }

        /**
         * プレビューボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickPreview(){
            dataCheck(); //入力データのチェックメソッド呼び出し
            //入力データにエラーがなかった時
            if(!problemFormCtrl.value.flag.alert){
                //問題のhtml化
                var problem = require('./../module/markChange.js'); //マークチェンジモジュールの呼び出し
                problemFormCtrl.value.previewProblem = problem.markupChange(problemFormCtrl.value.problem.problem);
                problemFormCtrl.value.previewProblem = $sce.trustAsHtml(problemFormCtrl.value.previewProblem); //ng-bind-view
                problemFormCtrl.value.previewExplain = problem.markupChange(problemFormCtrl.value.problem.explain);
                problemFormCtrl.value.previewExplain = $sce.trustAsHtml(problemFormCtrl.value.previewExplain); //ng-bind-view

                problemFormCtrl.globalParam.value.previewProblem = problemFormCtrl.value.problem; //プレビュー対象の問題をセット
                problemFormCtrl.globalParam.value.previewProblem.sceProblem = problemFormCtrl.value.previewProblem; //プレビュー対象の問題の問題文をセット
                problemFormCtrl.globalParam.value.previewProblem.sceExplain = problemFormCtrl.value.previewExplain; //プレビュー対象の問題の解説文をセット
                problemFormCtrl.globalParam.flag.detailProblem = false; //問題編集画面を非表示
                problemFormCtrl.globalParam.flag.previewProblem = true; //プレビュー画面の表示
            }
        }

        /**
         * 入力データチェックメソッド
         * @param  {[String]} value [クリックした公開範囲]
         * @return {[type]} [description]
         */
        function dataCheck(value){
            problemFormCtrl.value.alert = []; //アラート文のリセット
            //問題文がなかった時
            if(problemFormCtrl.value.problem.problem == undefined){
                problemFormCtrl.value.alert.push('問題文を入力してください');
            }
            //解答がなかった時
            if(problemFormCtrl.value.problem.answer == undefined){
                problemFormCtrl.value.alert.push('解答を入力してください');
            }
            //解説がなかった時
            if(problemFormCtrl.value.problem.explain == undefined){
                problemFormCtrl.value.alert.push('解説を入力してください');
            }
            //選択肢式の解答がなかった時
            if(problemFormCtrl.value.flag.choiceFlag){
                if(problemFormCtrl.value.problem.No1 == undefined || problemFormCtrl.value.problem.No2 == undefined || problemFormCtrl.value.problem.No3 ==  undefined || problemFormCtrl.value.problem.No4 == undefined){
                    problemFormCtrl.value.alert.push('選択肢を入力してください')
                }
            }
            //アラートがあった時はアラート表示オン
            if(problemFormCtrl.value.alert.length !== 0){
                problemFormCtrl.value.flag.alert = true;
            }else{
                problemFormCtrl.value.flag.alert = false;
                //解説編集の時
                if(problemFormCtrl.globalParam.flag.detailProblem){
                    problemFormCtrl.globalParam.flag.detailProblem = false; //問題編集画面の非表示
                    problemFormCtrl.globalParam.value.detailProblem = problemFormCtrl.value.problem; //編集した問題を問題編集にセット
                }else{
                    //フォーマット情報の追加
                    if(problemFormCtrl.value.flag.choiceFlag){
                        problemFormCtrl.value.problem.format = "選択肢";
                        problemFormCtrl.value.problem.choiceNo = [];
                        //選択肢の配列化
                        problemFormCtrl.value.problem.choiceNo[0] = problemFormCtrl.value.problem.No1;
                        problemFormCtrl.value.problem.choiceNo[1] = problemFormCtrl.value.problem.No2;
                        problemFormCtrl.value.problem.choiceNo[2] = problemFormCtrl.value.problem.No3;
                        problemFormCtrl.value.problem.choiceNo[3] = problemFormCtrl.value.problem.No4;
                    }else if(problemFormCtrl.value.flag.writeFlag){
                        problemFormCtrl.value.problem.format = "書き取り";
                    }else{
                        problemFormCtrl.value.problem.format = "論述";
                    }
                    problemFormCtrl.globalParam.value.makeProblem = problemFormCtrl.value.problem; //作成した問題を作成問題にセット
                }
            }
            problemFormCtrl.value.problem.openRange = value; //問題の公開範囲
        }

        /**
         * 選択肢クリック
         * @param  {Number} number 選択した選択肢番号
         * @return {[type]}        [description]
         */
        function clickChoiceAnswer(number){
            problemFormCtrl.value.problem.answer = number; //選択した選択肢番号を解答にセット
        }
    }
}());
