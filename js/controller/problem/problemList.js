(function() {

    angular
        .module('learnApp')
        .controller('problemListController', problemListController);

    problemListController.$inject = ['$scope','$sce','ApiService'];
    function problemListController($scope,$sce,ApiService) {
        var problemListCtrl = this;

        problemListCtrl.value = {
            problems: [], //表示する問題
            allProblems: [], //全ての問題
            myProblems: [], //自分が作成した問題
            flag: {
                empty: false //問題空フラグ
            },
            orderMark: { //並び替え記号
                insertTime: "▼",
                difficult: "●",
                understand: "●"
            },
            showProblem: [], //1ページに表示する問題
            showProblemPage:[], //ページ数
            currentPage: 1, //現在のページ
            averageEvalute: {
                difficult: 0,
                understand: 0
            },
            img: {
                difficult: "",
                understand: ""
            },
            displayRange: { //表示範囲
                all: true, //全部
                my: false //自分
            },
        };

        problemListCtrl.method = {
            print:print, //印刷
            clickRange:clickRange, //表示範囲指定
            clickOrder:clickOrder, //並び替え
            clickProblem:clickProblem, //問題表示
            goMakeProblem:goMakeProblem, //問題作成ページ表示
            clickNextPage:clickNextPage, //次のページ表示
            clickBackPage:clickBackPage, //前のページ表示
            clickPage:clickPage //指定ページ表示
        };

        //スタイルロード
        require('./../../../css/list.css');

        //グローバル変数の読み込み
        problemListCtrl.globalParam = require('./../module/problemParam');

        init(); //初期化メソッド

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            problemListCtrl.value.orderMark = { //並び替え記号
                insertTime: "▼",
                difficult: "●",
                understand: "●"
            };
            /**
             * 問題の取得
             * @type {String} 分野名
             * @type {String} メニュー名
             * @type {String} ユーザID
             */
            ApiService.getProblem($scope.indexCtrl.value.field,$scope.indexCtrl.value.menu,$scope.indexCtrl.value.userId).success(
               function(data) {
                   // 通信成功時の処理
                  problemListCtrl.globalParam.value.problemList = data.data; //取得したデータを問題リストにセット
                  problemListCtrl.globalParam.flag.problemListLoading = false; //問題リスト読み込み中オフ
                  //もし問題リストが0件だったら
                  if(problemListCtrl.globalParam.value.problemList.length == 0){
                      problemListCtrl.value.flag.empty = true; //問題が空であることを表示
                  }else{
                      var problems = problemListCtrl.globalParam.value.problemList; //問題リストの退避
                      problemSet(problems); //問題のセット
                  }
               }
            );
        }

        /**
         * 問題のセットメソッド
         * @param  {[Array]} problems [取得した問題]
         * @return {[type]} [description]
         */
        function problemSet(problems){
            //評価値の算出
            var evalute = require('./../module/calcEvalute'); //評価計算モジュールの読み込み
            problems = evalute.calcEvalute(problems);
            //選択肢の配列化
            for(var i=0; i<problems.length; i++){
                if(problems[i].format === '選択肢' && !Array.isArray(problems[i].choiceNo)){
                    problems[i].choiceNo = problems[i].choiceNo.split(",");
                }
            }
            problemListCtrl.value.allProblems = problems; //全ての問題をセット
            problemListCtrl.value.problems = problemListCtrl.value.allProblems; //表示する問題のセット(最初は全ての問題を表示)
            problemListCtrl.value.problems = problemHtml(problemListCtrl.value.problems); //問題文のhtml化
            //自分が作成した問題の抽出
            for(var i = 0; i < problems.length; i++){
                if(problems[i].userId == $scope.indexCtrl.value.userId){
                    problemListCtrl.value.myProblems.push(problems[i]); //自分が作成した問題のセット
                }
            }
            problemListCtrl.value.problems.sort(function(a,b){
                    if( a.insertTime < b.insertTime ) return 1;
                    if( a.insertTime > b.insertTime ) return -1;
                    return 0;
            });
            showProblemCalc(); //問題の表示数計算メソッド呼び出し
            inputNo(); //問題番号の付与メソッド呼び出し
        }

        /**
         * 問題の表示数計算メソッド
         * @return {[type]} [description]
         */
        function showProblemCalc(){
            problemListCtrl.value.showProblem = []; //1ページに表示する問題のリセット
            problemListCtrl.value.showProblemPage = []; //問題リストのページ数リセット
            //ページ数の計算
            for(var i = 0; i < Math.ceil(problemListCtrl.value.problems.length / 10); i++) {
              var j = i * 10;
              var p = problemListCtrl.value.problems.slice(j, j + 10);
              problemListCtrl.value.showProblem.push(p);
              problemListCtrl.value.showProblemPage.push(i+1);
            }
        }

        /**
         * 問題のhtml化メソッド
         * @param  {[Array]} item [html化対象の問題]
         * @return {[Array]} item [html化後の問題]
         */
        function problemHtml(item){
            var problem = require('./../module/markChange'); //マークチェンジモジュールの呼び出し
            //問題がオブジェクト形式じゃないとき(問題プレビューじゃないとき)
            if(item.length !== undefined){
                //問題と解説のhtml化
                for(var i=0; i<item.length; i++){
                    item[i].sceProblem = problem.markupChange(item[i].problem);
                    item[i].sceProblem = $sce.trustAsHtml(item[i].sceProblem);
                    item[i].sceExplain = problem.markupChange(item[i].explain);
                    item[i].sceExplain = $sce.trustAsHtml(item[i].sceExplain);
                }
            }else{
                item.sceProblem = problem.markupChange(item.problem);
                item.sceProblem = $sce.trustAsHtml(item.sceProblem);
                item.sceExplain = problem.markupChange(item.explain);
                item.sceExplain = $sce.trustAsHtml(item.sceExplain);
            }
            return item;
        }

        /**
         * 問題クリックメソッド
         * @param  {[Array]} problem [クリックした問題]
         * @return {[type]} [description]
         */
         function clickProblem(problem){
             problemListCtrl.globalParam.value.showProblem = problem; //クリックした問題を表示問題にセット
             problemListCtrl.globalParam.value.problemList = problemListCtrl.value.problems; //表示中の問題リストを問題リストにセット
             problemListCtrl.globalParam.flag.showProblem = true; //問題モーダル表示
         }

        /**
         * 並び替えクリックメソッド
         * @param  {[String]} value [選択した並び替え]
         * @return {[type]} [description]
         */
        function clickOrder(chooseOrder){
            var order = require('./../module/order'); //並び替えモジュールの呼び出し
            var problems = JSON.stringify(problemListCtrl.value.problems); //並び替え対象の解説を文字列化
            var orderMark = problemListCtrl.value.orderMark;
            var returnObject = order.order(problems,chooseOrder,orderMark);
            problemListCtrl.value.problems = returnObject.order;
            problemListCtrl.value.orderMark = returnObject.mark;
            problemHtml(problemListCtrl.value.problems);
            inputNo(); //問題の連番付与メソッド呼び出し
            showProblemCalc(); //問題の表示数計算メソッドの呼び出し
        }

        /**
         * 問題番号の付与メソッド
         * @return {[type]} [description]
         */
        function inputNo(){
            //問題番号のセット
            for(var i=0; i<problemListCtrl.value.problems.length; i++){
                problemListCtrl.value.problems[i].No = i+1;
            }
        }


        /**
         * 問題作成ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function goMakeProblem(){
            $scope.indexCtrl.method.directory("",4,""); //ディレクトリセット
            window.location.href = './#/makeProblem/'; //遷移先のパスセット
            //画面タイトルのセット
            $scope.indexCtrl.value.titleUrl[2] = './#/makeProblem/';
            document.cookie = 'titleUrl[2]=' + $scope.indexCtrl.value.titleUrl[2];
        }

        /**
         * 問題表示範囲変更メソッド
         * @param  {[String]} range [クリックした表示範囲]
         * @return {[type]} [description]
         */
        function clickRange(range){
            //表示範囲が「全部」のとき
            if(range == 'all'){
                problemListCtrl.value.problems = problemListCtrl.value.allProblems; //全ての問題を表示する問題にセット
            }else{
                problemListCtrl.value.problems = problemListCtrl.value.myProblems; //自分が作成した問題を表示する問題にセット
            }
            //問題があるかどうか
            if(problemListCtrl.value.problems.length == 0){
                problemListCtrl.value.flag.empty = true;
            }else{
                problemListCtrl.value.flag.empty = false;
                //並び替え記号と並び順の初期化
                problemListCtrl.value.orderMark = {
                    insertTime: "▼",
                    difficult: "●",
                    understand: "●"
                };
                problemListCtrl.value.problems.sort(function(a,b){
                        if( a.insertTime < b.insertTime ) return 1;
                        if( a.insertTime > b.insertTime ) return -1;
                        return 0;
                });
                showProblemCalc(); //問題の表示数計算メソッド呼び出し
                inputNo(); //問題番号の付与
            }
        }

        /**
         * 印刷メソッド
         * @return {[type]} [description]
         */
        function print(){
            //URLパラメタの生成
            var itemsString = JSON.stringify(problemListCtrl.value.problems); //印刷対象の問題を文字列化
            var itemsStringBase64 = base64url.encode(itemsString); //印刷対象の問題をbase64エンコード
             //印刷タイトルの生成
             var printTitle = '';
             //シャッフル問題のとき
             if($scope.indexCtrl.method.GetCookie('titleString[2]') == '> シャッフル問題'){
                 printTitle = base64url.encode('シャッフル問題');
             }else{
                 printTitle = base64url.encode(problemListCtrl.value.problems[0].field);
             }
             var url = './#/problemPrint/' + itemsStringBase64 + '/' + printTitle; //URLの生成
             window.open(url); //印刷画面表示
        }

        /**
         * 次のページ表示メソッド
         * @return {[type]} [description]
         */
        function clickNextPage(){
            if(problemListCtrl.value.currentPage != problemListCtrl.value.showProblemPage.length){
                problemListCtrl.value.currentPage += 1;
            }
        }

        /**
         * 前のページ表示メソッド
         * @return {[type]} [description]
         */
        function clickBackPage(){
            if(problemListCtrl.value.currentPage != 1){
                problemListCtrl.value.currentPage -= 1;
            }
        }


        /**
         * 指定ページ表示メソッド
         * @param  {Number} page ページ番号
         * @return {[type]}      [description]
         */
        function clickPage(page){
            problemListCtrl.value.currentPage = page;
        }

    }
}());
