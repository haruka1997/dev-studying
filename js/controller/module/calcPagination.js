module.exports.calcPagination = function(contents){
    var showContentInPage = []; //1ページに表示する解説のリセット
    var paginationNumber = []; //ページ数のリセット
    //表示するコンテンツの計算
    for(var i = 0; i < Math.ceil(contents.length / 10); i++) {
      var j = i * 10;
      var p = contents.slice(j, j + 10);
      showContentInPage.push(p);
      paginationNumber.push(i+1);
    }
    var returnObject = {
        'showContentInPage': showContentInPage,
        'paginationNumber': paginationNumber
    };

    return returnObject
}
