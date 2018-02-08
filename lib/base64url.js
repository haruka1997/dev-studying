

if (typeof(window.base64url) == 'undefined') {


    window.base64url = (function() {
        /**
         * 公開メソッド定義
         */
        var publicMethod = {
            encode: encode,
            decode: decode
        };

        function init() {
        };

        function encode(text) {
            // bace64エンコード
            var base64text = btoa(unescape(encodeURIComponent(text)));

            // base64url文字列に変換('+' -> '-', '/' -> '_', '=' -> '.')
            var base64url = base64text.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '.');

            return base64url;
        };


        function decode(base64url) {
            // base64文字列に変換('-' -> '+', '_' -> '/', '.' -> '=')
            var base64text = base64url.replace(/-/g, '+').replace(/_/g, '/').replace(/\./g, '=');

            // bace64エンコード
            var text = decodeURIComponent(escape(atob(base64text)));

            return text;
        };

        // 初期化処理
        init();

        return publicMethod;
    }());
}
