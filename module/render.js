define(function (require, exports, module) {
    Date.prototype.Format = function (fmt) {          // 日期格式化
        var o = {
            "M+": this.getMonth() + 1,                 //月份
            "d+": this.getDate(),                    //日
            "h+": this.getHours(),                   //小时
            "m+": this.getMinutes(),                 //分
            "s+": this.getSeconds(),                 //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };

    Number.prototype.formatMoney = function (places, symbol, thousand, decimal) {
        places = !isNaN(places = Math.abs(places)) ? places : 2;
        symbol = symbol !== undefined ? symbol : "￥";
        thousand = thousand || ",";
        decimal = decimal || ".";
        var number = this,
            negative = number < 0 ? "-" : "",
            i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
            j = (j = i.length) > 3 ? j % 3 : 0;
        return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "00");
    };

    module.exports = {
        formatDate: function (time, type) {     // 时间格式化
            if (!time) return '';
            if (!type) {
                type = 'yyyy-MM-dd hh:mm:ss'
            } else {
                if (type.indexOf('YYYY') >= 0) type = type.replace('YYYY', 'yyyy');
                if (type.indexOf('DD') >= 0) type = type.replace('DD', 'dd');
            }
            if (!isNaN(time) && String(time).length === 10) {
                time = time * 1000;
            } else if (String(time).indexOf('-') >= 0) {
                time = time.replace(/-/g, '/');
            } else {
            }
            return new Date(parseInt(time)).Format(type);
        },
        renderDateTime: function (data) {          // 表格渲染时间用到
            return module.exports.formatDate(data);
        },
        renderDate: function (data) {          // 表格渲染时间用到
            return module.exports.formatDate(data, 'yyyy-MM-dd');
        },

        formatPrice: function (price, places, symbol, thousand, decimal) {    // 金额格式化   price金额（单位为分） places保留小数点几位 symbol货币符号 thousand金额整数每3位的分隔符 decimal小数点的分隔符
            price = parseFloat(parseInt(price || 0) / 100);
            return price.formatMoney(places, symbol, thousand, decimal);
        },
        renderPrice: function (data) {              // 表格渲染金额用到
            return module.exports.formatPrice(data);
        },

        formatImage: function (config) {            // 图片格式化
            require.async('fancybox', function () {
                require('fancyboxcss');
                $('.fancybox').fancybox({
                    openEffect: 'none',
                    closeEffect: 'none'
                });
            });
            config = $.extend({
                url: '/hplus/public/img/default-logo.png',
                title: '',
                width: 60,
                height: 60,
                borderRadius: 5,
                cut: ''
            }, config);
            var image = $('<a class="fancybox" href="" title=""><img src="" style="margin: 0" /></a>');
            image.attr('href', config.url).css({width: config.width, height: config.height, borderRadius: config.borderRadius});
            image.find('img').attr('src', config.url);
            image.find('img').css({width: config.width, height: config.height, borderRadius: config.borderRadius});
            config.title && image.attr('title', config.title);
            config.cut && image.find('img').attr('src', config.url + config.cut);
            return image.get(0).outerHTML;
        },
        renderImage: function (data) {          // 表格渲染图片用到
            if (!data) data = {};
            var url = typeof data === 'string' ? data : data.url;
            return module.exports.formatImage({url: url, cut: '?x-oss-process=image/resize,s_100/crop,x_0,y_0,w_100,h_100,g_center'});
        },

        renderSelect: function (data, items) {     // 渲染select类型的数据或从url拉取select类型的数据
            var text = data;
            var itemArr = [];
            require.async('./common', function ($common) {
                if (typeof items === 'string') {
                    var selectUrl = items;
                    itemArr = module.exports._selectData[selectUrl];
                    if (!itemArr) {
                        $common.request({
                            url: selectUrl,
                            async: false,
                            success: function (res) {
                                itemArr = res.result;
                                module.exports._selectData[selectUrl] = itemArr;
                            },
                        })
                    }
                } else if (typeof items === 'function') {
                    itemArr = items(data);
                } else {
                    itemArr = items;
                }
                $.each(itemArr, function () {
                    if (this.value == data) {
                        text = this.text;
                        return false;
                    }
                })
            })
            return text || '';
        },
        _selectData: {},
    }
})