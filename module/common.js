define(function (require, exports, module) {
    require('layer');
    // layer.config({
    //     path: '/public/js/plugins/layer/'
    // });

    module.exports = {
        convertUrl: function (url) {        // url处理
            if (/^http:\/\/|^https:\/\/|^\/\//.test(url)) return url;
            if (url && url.charAt(0) === '/') return "//" + window.location.host + (window.path || '') + url;
            return url;
        },
        isNull: function (value) {         // 是否是空
            if (!value && value !== 0 && value !== false) return true;
            return false;
        },
        hasPerm: function (key) {       // 权限判断
            if (window.permissions["*"]) return true;
            if ($.isArray(key)) {
                for (var i in key) {
                    if (!window.permissions[key[i]]) return false;
                }
                return true;
            } else {
                return !!window.permissions[key];
            }
        },

        request: function (config) {    // 数据请求ajax
            var _This = this;
            var nConfig = {
                method: /\/json\/.+\.json$/.test(config.url) ? "GET" : "POST",
                dataType: 'json',
                mask: true
            };
            $.extend(nConfig, config);
            nConfig.url = _This.convertUrl(nConfig.url);
            if (nConfig.mask) _This.loading();

            nConfig.success = function (data) {
                if (typeof data !== 'object') data = JSON.parse(JSON.stringify(data));
                if (nConfig.mask) _This.loading(false);
                //错误信息
                if (data && data.code === "TIMEOUT") {
                    _This.processSvrResult(data, config);
                    return false;
                }
                if (data && !data.success) {
                    _This.showMsg(data.msg, 'error');
                    return false;
                }
                typeof config.success === 'function' && config.success.apply(this, arguments);
            };
            nConfig.error = function (Ajax) {
                if (nConfig.mask) _This.loading(false);
                if (Ajax && Ajax.responseJSON) {
                    _This.processSvrResult(Ajax.responseJSON, config);
                    return false;
                }
                _This.showMsg(nConfig.url + ' 请求失败！', 'error');
                typeof config.error === 'function' && config.error.apply(this, arguments);
            };

            $.ajax(nConfig);
        },
        processSvrResult: function (data, config) {     //请求失败回调
            var _This = this;
            if (data.code === "TIMEOUT") {  //登录超时时重新进行登录操作
                require.async('./timeout', function (timeout) {
                    timeout.login(function () {
                        if (config) _This.request(config);
                    });
                })
            }
            if (!data.success) {
                _This.showMsg((data.code === 'UNDEFINED' ? '' : '(' + data.code + ')') + '：' + data.msg, 'error');
            }
        },

        showMsg: function (msg, type) {     // 显示信息type为：success, info, error, warning
            if (!type) type = 'info';
            require.async('./toast', function (toast) {
                toast[type](msg || '');
            });
        },
        alert: function (msg, title, next) {
            layer.alert(msg, {
                title: title || '提示'
            }, function (index) {
                next && next();
                layer.close(index);
            })
        },
        confirm: function (content, next, icon, cancel) {
            layer.confirm(content, {
                title: '提示',
                icon: icon || '',
                yes: function (index) {
                    next && next();
                    layer.close(index);
                },
                cancel: function (index) {
                    cancel && cancel();
                    layer.close(index);
                }
            });
        },
        loading: function (state) {         // 加载动画
            if (state === false) {
                layer.close(this.$load);
            } else {
                this.$load = layer.load(2);
            }
        },
        getString: function (name) {        // 获取链接上的参数
            if (!name) return false;
            var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return decodeURIComponent(r[2]);
            return null;
        },

        createInput: function (type) {          // 创建input元素
            if (!type) type = 'text';
            var input = '';
            if (type === 'textarea') {
                input = $('<textarea class="form-control"></textarea>');
            } else if (type === 'select') {
                input = $('<select class="form-control"></select>');
            } else {
                input = $('<input class="form-control">');
                input.attr('type', type);
            }
            return input;
        }
    }
})