/*文字列変換メソッド*/
module.exports.markupChange = function(explain,imgUrl){
    var changeExplain =  explain;
        /*空白処理*/
        changeExplain = changeExplain.replace(/\r?\n/g, "<br>");
        changeExplain = changeExplain.replace(/\s+$/g,"");

        //マークアップ処理
        changeExplain = changeExplain.split('#title').join("<div style='font-size:20px;font-weight:bold;margin-bottom:-10px;'>");
        changeExplain = changeExplain.split('#').join("</div>");
        changeExplain = changeExplain.split('%red').join("<span style='color:red;'>");
        changeExplain = changeExplain.split('%').join("</span>");
        changeExplain = changeExplain.split('*bold').join("<b>");
        changeExplain = changeExplain.split('*').join("</b>");
        changeExplain = changeExplain.split('_under').join("<u>");
        changeExplain = changeExplain.split('_').join("</u>");
        changeExplain = changeExplain.split('&mark').join("<span style='background: linear-gradient(transparent 10%, #b0d7f4 0%);'>");
        changeExplain = changeExplain.split('&').join("</span>");
        if(imgUrl !== undefined){
            changeExplain = changeExplain.split('[アップロード画像]').join("<img src=" + imgUrl + " style='max-width:80%'><br>");
        }

    　　 return changeExplain;
}
