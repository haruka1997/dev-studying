(function() {

    angular
        .module('learnApp')
        .controller('explainListController', explainListController);

    explainListController.$inject = ['$scope','ApiService'];
    function explainListController($scope,ApiService) {
        var explainListCtrl = this;

        explainListCtrl.value = {
            listExplains: [], //リストに表示する解説
            orderMark: { //並び替え記号
                insertTime: "▼", //作成日
                difficult: "●", //難易度
                understand: "●" //理解度
            },
            allExplains:[], //すべての解説
            myExplains:[], //自分が作成した解説
            showExplainInPage: [], //1ページに表示する解説
            paginationNumber:[], //ページ数
            currentPage: 1, //現在のページ
            displayRange: { //表示範囲
                all: true, //全部
                my: false //自分
            },
            flag: {
                empty: false, //解説数0
                error: false //取得エラー
            }
        };

        explainListCtrl.method = {
            init: init, //初期化
            getExplainData: getExplainData, //解説の取得
            explainListSet: explainListSet, //解説リストの設定
            calcPagination: calcPagination, //ページネーションの計算
            clickMakeExplainButton:clickMakeExplainButton, //解説作成ボタンクリック
            clickExplain:clickExplain, //解説クリック
            clickOrder:clickOrder, //並び替えクリック
            clickRangeButton:clickRangeButton, //解説表示範囲のボタンクリック
            clickPagination:clickPagination //ページネーションのクリック
        };

        //モジュールの読み込み
        explainListCtrl.module = {
            calcPagination: require('./../module/calcPagination'), //ページネーションの計算モジュール
            calcEvalute: require('./../module/calcEvalute'), //評価の計算モジュール
            order: require('./../module/order') //並び替えモジュール
        };

        //スタイルロード
        require('./../../../css/list.css');

        //グローバル変数の読み込み
        explainListCtrl.globalParam = require('./explainParam');

        //初期化メソッド
        init();

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            explainListCtrl.value.orderMark = { //並び替え記号の初期化
                insertTime: "▼",
                difficult: "●",
                understand: "●"
            };
            //マイページの解説取得処理
            if($scope.indexCtrl.value.flag.isCourse){
                explainListSet(explainListCtrl.globalParam.value.explainList); //解説リストのセット
            //コースの解説取得処理
            }else{
                getExplainData(); //解説の取得
            }
        };

        /**
         * 解説取得メソッド
         * @return {[type]} [description]
         */
        function getExplainData(){
            /**
             * 解説の取得
             * @type {[String]} 分野
             * @type {[String]} メニュー
             * @type {[String]} ユーザID
             */
            ApiService.getExplain($scope.indexCtrl.value.field, $scope.indexCtrl.value.menu,$scope.indexCtrl.value.userId).success(
               function(data) {
                   //データが正常に取得されたとき
                   if(data.status == 0){
                       explainListSet(data.data); //解説リストのセット
                   }else{
                       explainListCtrl.value.flag.error = true; //「エラー」表示
                   }
                   explainListCtrl.globalParam.flag.explainListLoading = false; //解説読み込み中非表示
               }
           );
        }

        /**
         * 解説リストのセットメソッド
         * @return {[type]} [description]
         */
        function explainListSet(explains){
            //データがあったとき
            if(explains.length > 0){
                //評価値の算出
                explains = explainListCtrl.module.calcEvalute.calcEvalute(explains);
                explainListCtrl.value.allExplains = explains; //すべての解説をセット
                //自分の解説を抽出
                for(var i = 0; i < explains.length; i++){
                    // 自分の解説があればセット
                    if(explains[i].userId == $scope.indexCtrl.value.userId){
                        explainListCtrl.value.myExplains.push(explains[i]);
                    }
                }
                //表示する解説抽出(最初は全ての解説を表示)
                explainListCtrl.value.listExplains = explainListCtrl.value.allExplains;
                //表示する解説を作成日順に並び替え
                explainListCtrl.value.listExplains.sort(function(a,b){
                        if( a.insertTime < b.insertTime ) return 1;
                        if( a.insertTime > b.insertTime ) return -1;
                        return 0;
                });
                calcPagination(explains);
            }else{
                explainListCtrl.value.flag.empty = true; //「解説がない」表示
            }
        }

        /**
         * 1ページに表示する解説の計算
         * @param  {[type]} explains [計算対象の解説]
         * @return {[type]}          [description]
         */
        function calcPagination(explains){
            var returnObject = explainListCtrl.module.calcPagination.calcPagination(explains);
            explainListCtrl.value.showExplainInPage = returnObject.showContentInPage;
            explainListCtrl.value.paginationNumber = returnObject.paginationNumber;
        }

        /**
         * 解説作成ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickMakeExplainButton(){
            $scope.indexCtrl.method.directory("",3,""); //ディレクトリ設定
            window.location.href = './#/makeExplain/'; //解説作成画面に移動
            //ディレクトリの保存
            $scope.indexCtrl.value.titleUrl[2] = './#/makeExplain/';
            document.cookie = 'titleUrl[2]=' + $scope.indexCtrl.value.titleUrl[2];
        }

        /**
         * 解説クリックメソッド
         * @param  {[Array]} explain [クリックした解説]
         * @return {[type]} [description]
         */
        function clickExplain(explain) {
            explainListCtrl.globalParam.value.showExplain = explain; //クリックした解説を表示解説にセット
            explainListCtrl.globalParam.flag.showExplain = true; //解説モーダル表示
        }

        /**
         * 並び替えクリックメソッド
         * @param  {[String]} chooseOrder [選択した並び替え]
         * @return {[type]} [description]
         */
        function clickOrder(chooseOrder){
            var explains = JSON.stringify(explainListCtrl.value.listExplains); //並び替え対象の解説を文字列化
            var orderMark = explainListCtrl.value.orderMark;
            var returnObject = explainListCtrl.module.order.order(explains,chooseOrder,orderMark);
            explainListCtrl.value.listExplains = returnObject.order;
            explainListCtrl.value.orderMark = returnObject.mark;
            //1ページに表示する解説の計算
            calcPagination(explainListCtrl.value.listExplains);
        }

        /**
         * 解説表示範囲ボタンのクリック
         * @param  {[String]} range [選択範囲]
         * @return {[type]} [description]
         */
        function clickRangeButton(range){
            //範囲が「全部」のとき
            if(range == 'all'){
                explainListCtrl.value.listExplains = explainListCtrl.value.allExplains; //全ての解説を表示用の解説にセット
            }else{
                explainListCtrl.value.listExplains = explainListCtrl.value.myExplains; //自分が作成した解説を表示用の解説にセット
            }
            //並び替え記号と並び順の初期化
            explainListCtrl.value.orderMark = {
                insertTime: "▼",
                difficult: "●",
                understand: "●"
            };
            //作成日順に並び替え
            explainListCtrl.value.listExplains.sort(function(a,b){
                    if( a.insertTime < b.insertTime ) return 1;
                    if( a.insertTime > b.insertTime ) return -1;
                    return 0;
            });
            //1ページに表示する解説の計算
            calcPagination(explainListCtrl.value.listExplains);
        }


        /**
         * ページネーションのクリックメソッド
         * @param  {[type]} category [選択したページ]
         * @return {[type]}          [description]
         */
        function clickPagination(category){
            switch(category){
                case 'next':
                if(explainListCtrl.value.currentPage != explainListCtrl.value.paginationNumber.length){
                    explainListCtrl.value.currentPage += 1; //次のページへ
                }
                break;
                case 'back':
                if(explainListCtrl.value.currentPage != 1){
                    explainListCtrl.value.currentPage -= 1; //前のページへ
                }
                break;
                default:
                explainListCtrl.value.currentPage = category; //指定したページへ
                break;
            }
        }
    }
}());
