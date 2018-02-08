(function() {


    angular
        .module('learnApp')
        .controller('explainPrintController', explainPrintController);

    explainPrintController.$inject = ['$scope', '$sce','$routeParams','$http','ApiService'];
    function explainPrintController($scope,$sce, $routeParams, $http,ApiService) {
        var explainPrintCtrl = this;

        explainPrintCtrl.value = {
            flag:{
                nomal: true,
                note: false,
                remember: false
            },
            content: {}
        };

        explainPrintCtrl.method = {
            clickMenu: clickMenu,
            clickPrint: clickPrint
        };

        require('./../../../css/print.css');
        init();

        function init(){
            $scope.indexCtrl.value.flag.print = true;
            $scope.indexCtrl.method.clickNav(3);
            explainPrintCtrl.value.content = JSON.parse(base64url.decode($routeParams.item));
            var explain = require('./../module/markChange.js');
            explainPrintCtrl.value.content.sceContent = explain.markupChange(explainPrintCtrl.value.content.content);
            explainPrintCtrl.value.content.sceContent = $sce.trustAsHtml(explainPrintCtrl.value.content.sceContent); //ng-bind-view
        }

        /*メニュークリック*/
        function clickMenu(menu){
            if(menu == 'nomal'){
                explainPrintCtrl.value.flag.nomal = true;
                explainPrintCtrl.value.flag.note = false;
                explainPrintCtrl.value.flag.remember = false;
            }else if(menu == 'note'){
                explainPrintCtrl.value.flag.nomal = false;
                explainPrintCtrl.value.flag.note = true;
                explainPrintCtrl.value.flag.remember = false;
            }else{
                redDelite();
                explainPrintCtrl.value.flag.nomal = false;
                explainPrintCtrl.value.flag.note = false;
                explainPrintCtrl.value.flag.remember = true;
            }
        }

        /*印刷*/
        function clickPrint(){
            window.print();
        }

        /*赤文字の消去*/
        function redDelite(){
            var beforeTextArr = explainPrintCtrl.value.content.content.split('');
            var afterText = '';
            var j;
            for(var i=0; i<beforeTextArr.length; i++){
                if(beforeTextArr[i] == '%' && beforeTextArr[i+1] == 'r' && beforeTextArr[i+2] == 'e' && beforeTextArr[i+3] == 'd'){
                    beforeTextArr[i] = '';
                    beforeTextArr[i+1] = '';
                    beforeTextArr[i+2] = '';
                    beforeTextArr[i+3] = '';
                    for(j=i+4; beforeTextArr[j] != '%'; j++){
                            beforeTextArr[j] = '.....';
                    }
                    beforeTextArr[j] = '';
                }
            }
            for (var i = 0; i < beforeTextArr.length; i++) {
                afterText += beforeTextArr[i];
            }
            var explain = require('./../module/markChange.js');
            afterText = explain.markupChange(afterText);
            explainPrintCtrl.value.content.sceRememberContent = $sce.trustAsHtml(afterText); //ng-bind-view

        }
    }


}());
