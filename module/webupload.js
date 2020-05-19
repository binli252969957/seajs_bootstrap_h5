define(function (require, exports, module) {
    require('webuploader');
    require('fancybox');
    require('fancyboxcss');
    require('jqUi');
    $('.fancybox').fancybox({
        openEffect: 'none',
        closeEffect: 'none'
    });
    var $common = require('./common');

    module.exports = (function () {
        var WebUpload = function (config) {
            this.config = config;
            this.init(config);
            return this;
        }
        $.extend(WebUpload.prototype, {
            init: function (config) {               // 上传文件图片
                if (config.item && config.item.type === 'uEditor') {
                    this.uEditorUpload(config);
                    return false;
                }
                if (config.itemType && config.itemType === 'actTableImage') {
                    this.actTableUpload(config);
                    return false;
                }
                var item = config.item || {};
                var options = item.options || {};
                var value = config.value;
                var row = config.row;
                var clearFix = $('<div class="clearfix"></div>');
                var hidden = config.hidden || $('<input type="hidden">');
                var hiddenValue = [];
                var btn = $('<div class="clearfix my-btn"><div class="btn btn-w-m btn-primary" style="margin-bottom: 10px"><i class="fa fa-file-image-o"></i>&nbsp;&nbsp;<span class="bold">添加图片</span></div></div>');
                var iphoneWrap = $('<div class="my-iphone-wrap"></div>');
                var fileNumLimit = options.fileNumLimit;
                if (item.type === 'uploadFile') btn = $('<div class="btn btn-w-m btn-primary my-btn" style="margin-bottom: 10px"><i class="fa fa-file-text"></i>&nbsp;&nbsp;<span class="bold">添加文件</span></div>');
                clearFix.prepend(btn);
                if (value && !$.isArray(value)) value = [value];
                if (value && value.length) {
                    $.each(value, function (key, val) {
                        renderItem(val);
                    })
                    if (item.multiple !== true) clearFix.find('.my-btn').hide();
                    if (item.type === 'uploadImage' && item.multiple === true) WinMove();
                }

                hidden.val(hiddenValue.join(','));
                row.find('.col-sm-8').prepend(clearFix).append(hidden);

                var _options = {
                    server: item.server || '/sfile/upload.do',
                    pick: {
                        id: btn,
                        multiple: item.multiple || false
                    },
                    formData: {
                        sessionId: window.sessionId,
                        temp: options.temp || true
                    },
                    uploadError: function (file, reason) {
                        if (reason.code === 'TIMEOUT') {
                            $common.showMsg(reason.msg, 'error');
                        } else if (reason === 'timeout') {
                            $common.showMsg('timeout:服务器未响应', 'error');
                        } else {
                            $common.showMsg(reason.code + reason.msg, 'error');
                        }
                    },
                    error: function (type) {
                        var msg = '';
                        if (type === "Q_EXCEED_NUM_LIMIT") {
                            msg = "文件数量超出限制！";
                        } else if (type === "Q_EXCEED_SIZE_LIMIT") {
                            msg = "文件大小超出限制！";
                        } else if (type === "Q_TYPE_DENIED") {
                            msg = "文件类型错误！";
                        } else if (type === "F_DUPLICATE") {
                            msg = "文件重复！";
                        } else if (type === "Q_FILE_CANNOT_BE_EMPTY") {
                            msg = "文件内容不能为空！";
                        }
                        $common.showMsg(msg, 'error');
                    },
                    uploadSuccess: function (file, response) {
                        if (typeof response === 'string') response = JSON.parse(response);
                        var data = response.result;
                        if (fileNumLimit && fileNumLimit <= hiddenValue.length ) {
                            $common.showMsg('文件数量超出限制！', 'error');
                            return false;
                        }
                        renderItem(data);
                        if (item.multiple !== true) clearFix.find('.my-btn').hide();
                        hidden.val(hiddenValue.join(','));
                        if (item.type === 'uploadImage' && item.multiple === true) WinMove();
                    }
                }

                if (item.type === 'uploadFile') {
                    _options.accept = {
                        title: 'Files',
                        extensions: options.extensions || 'xls,xlsx',
                        mimeTypes: options.mimeTypes || 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    }
                } else {
                    _options.accept = {
                        title: 'Images',
                        extensions: options.extensions || 'gif,jpg,jpeg,bmp,png',
                        mimeTypes: options.mimeTypes || 'image/*'
                    }
                    _options.fileSingleSizeLimit = 5 * 1024 * 1024;
                }

                options.fileNumLimit = undefined;
                $.extend(_options, options);
                this.webUploaderRun(_options);

                function renderItem(data) {
                    if (item.type === 'uploadFile') {
                        var webItem = $('<div class="alert alert-dismissable alert-file clearfix my-item-closest"><button class="close close-button" type="button">×</button><i class="fa fa-file-text-o"></i><span class="my-ellipsis"></span></div>')
                        webItem.attr('data-id', data.id);
                        webItem.find('span').html(data.fileName || '');
                    } else {
                        var webItem = $('<div class="my-webupload my-item-closest"><div class="my-img"><a class="fancybox" href="" title=""><img src="" alt=""></a></div><div class="my-img-close close-button"><i class="fa fa-times-circle"></i></div></div>')
                        webItem.attr('data-id', data.id);
                        webItem.find('a').attr('href', data.downloadPath || data.url);
                        webItem.find('img').attr('src', data.downloadPath || data.url);
                    }
                    if (item.style === 'imageText') {
                        iphoneWrap.append(webItem);
                        clearFix.append(iphoneWrap);
                    } else {
                        clearFix.append(webItem);
                    }
                    hiddenValue.push(data.id + '');

                    webItem.find('.close-button').bind('click', function () {
                        var tId = $(this).closest('.my-item-closest').attr('data-id');
                        $(this).closest('.my-item-closest').remove();
                        hiddenValue.splice(hiddenValue.indexOf(tId), 1);
                        hidden.val(hiddenValue.join(','));
                        if (!hiddenValue.length && item.multiple !== true) {
                            clearFix.find('.my-btn').show();
                            clearFix.find('.webuploader-container div:nth-child(2)').css({
                                width: '100%', height: '100% !important', opacity: 0
                            })
                        }
                    })
                }

                function WinMove() {
                    var wrap = clearFix;
                    if (item.style === 'imageText') wrap = iphoneWrap;
                    if (wrap.find('.my-webupload').length <= 1) return false;
                    wrap.sortable({
                        handle: '.my-img',
                        connectWith: '.my-webupload',
                        tolerance: 'pointer',
                        forcePlaceholderSize: true,
                        opacity: 0.8,
                        update: function () {
                            var myImg = wrap.find('.my-webupload');
                            if (!myImg.length) return false;
                            hiddenValue = [];
                            $.each(myImg, function () {
                                var tId = $(this).attr('data-id');
                                hiddenValue.push(tId);
                            });
                            hidden.val(hiddenValue.join(','));
                        }
                    }).disableSelection();
                };
            },
            uEditorUpload: function (config) {      // 文本编辑器图片上传
                var item = config.item || {};
                var options = config.options || {};
                var _options = {
                    server: item.server || '/sfile/upload.do',
                    pick: {
                        id: '#' + config.imageUploadId,
                        multiple: true
                    },
                    accept: {
                        title: 'Images',
                        extensions: options.extensions || 'gif,jpg,jpeg,bmp,png',
                        mimeTypes: options.mimeTypes || 'image/*'
                    },
                    formData: {
                        sessionId: window.sessionId,
                        temp: options.temp || true
                    },
                    fileSingleSizeLimit: 5 * 1024 * 1024,
                    uploadError: function (file, reason) {
                        if (reason.code === 'TIMEOUT') {
                            $common.showMsg(reason.msg, 'error');
                        } else if (reason === 'timeout') {
                            $common.showMsg('timeout:服务器未响应', 'error');
                        } else {
                            $common.showMsg(reason.code + reason.msg, 'error');
                        }
                    },
                    error: function (type) {
                        var msg = '';
                        if (type === "Q_EXCEED_NUM_LIMIT") {
                            msg = "文件数量超出限制！";
                        } else if (type === "Q_EXCEED_SIZE_LIMIT") {
                            msg = "文件大小超出限制！";
                        } else if (type === "Q_TYPE_DENIED") {
                            msg = "文件类型错误！";
                        } else if (type === "F_DUPLICATE") {
                            msg = "文件重复！";
                        } else if (type === "Q_FILE_CANNOT_BE_EMPTY") {
                            msg = "文件内容不能为空！";
                        }
                        $common.showMsg(msg, 'error');
                    },
                }
                $.extend(_options, options);
                this.webUploaderRun(_options);
            },
            actTableUpload: function (config) {               // actTable上传文件图片
                var item = config.item || {};
                var options = item.options || {};
                var value = config.value;
                var td = config.td;
                var hidden = config.hidden || $('<input type="hidden">');
                var hiddenValue = '';
                var btn = $('<div class="btn btn-primary btn-sm"><i class="fa fa-file-image-o"></i>&nbsp;&nbsp;<span class="bold">选择图片</span></div>');
                td.append(btn).append(hidden);

                if (value && !$.isArray(value)) value = [value];
                if (value && value.length) {
                    renderItem(value[0]);
                    btn.hide();
                }

                hidden.val(hiddenValue);

                var _options = {
                    server: item.server || '/sfile/upload.do',
                    pick: {
                        id: btn,
                        multiple: false
                    },
                    formData: {
                        sessionId: window.sessionId,
                        temp: options.temp || true
                    },
                    uploadError: function (file, reason) {
                        if (reason.code === 'TIMEOUT') {
                            $common.showMsg(reason.msg, 'error');
                        } else if (reason === 'timeout') {
                            $common.showMsg('timeout:服务器未响应', 'error');
                        } else {
                            $common.showMsg(reason.code + reason.msg, 'error');
                        }
                    },
                    error: function (type) {
                        var msg = '';
                        if (type === "Q_EXCEED_NUM_LIMIT") {
                            msg = "文件数量超出限制！";
                        } else if (type === "Q_EXCEED_SIZE_LIMIT") {
                            msg = "文件大小超出限制！";
                        } else if (type === "Q_TYPE_DENIED") {
                            msg = "文件类型错误！";
                        } else if (type === "F_DUPLICATE") {
                            msg = "文件重复！";
                        } else if (type === "Q_FILE_CANNOT_BE_EMPTY") {
                            msg = "文件内容不能为空！";
                        }
                        $common.showMsg(msg, 'error');
                    },
                    uploadSuccess: function (file, response) {
                        if (typeof response === 'string') response = JSON.parse(response);
                        var data = response.result;
                        renderItem(data);
                        btn.hide();
                        hidden.val(hiddenValue);
                    }
                }
                _options.accept = {
                    title: 'Images',
                    extensions: options.extensions || 'gif,jpg,jpeg,bmp,png',
                    mimeTypes: options.mimeTypes || 'image/*'
                }
                _options.fileSingleSizeLimit = 5 * 1024 * 1024;

                $.extend(_options, options);
                this.webUploaderRun(_options);

                function renderItem(data) {
                    var webItem = $('<div class="my-webupload my-item-closest my-actTable-webupload"><div class="my-img"><a class="fancybox" href="" title=""><img src="" alt="" style="margin: 0"></a></div><div class="my-img-close close-button"><i class="fa fa-times-circle"></i></div></div>')
                    webItem.find('a').attr('href', data.downloadPath || data.url);
                    webItem.find('img').attr('src', data.downloadPath || data.url);

                    td.append(webItem);
                    hiddenValue = data.id + '';

                    webItem.find('.close-button').bind('click', function () {
                        $(this).closest('.my-item-closest').remove();
                        hiddenValue = '';
                        hidden.val(hiddenValue);
                        btn.show();
                        td.find('.webuploader-container div:nth-child(2)').css({
                            width: '100%', height: '100% !important', opacity: 0
                        })
                    })
                }

            },
            webUploaderRun: function (options) {
                var option = {
                    auto: options.auto || true,// 选完文件后，是否自动上传。
                    duplicate: options.duplicate || true,//去重， 根据文件名字、文件大小和最后修改时间来生成hash Key.
                    compress: options.compress || false,//配置压缩的图片的选项。
                    pick: options.pick,// 选择文件的按钮。可选。// 内部根据当前运行是创建，可能是input元素，也可能是flash.
                    formData: options.formData, //文件上传请求的参数表，每次发送都会发送此对象中的参数。
                    accept: options.accept,    // 只允许选择图片文件。
                    swf: options.swf || "/hplus/public/js/plugins/webuploader/Uploader.swf",  // swf文件路径
                    server: options.server,// 文件接收服务端。
//    	            runtimeOrder: 'flash',//强制使用 flash 运行.默认会先尝试 html5 是否支持，如果支持则使用 html5, 否则则使用 flash.
//    	            prepareNextFile: true,//是否允许在文件传输时提前把下一个文件准备好。 对于一个文件的准备工作比较耗时，比如图片压缩，md5序列化。 如果能提前在当前文件传输期处理，可以节省总体耗时。
                    chunked: true,// 是否要分片处理大文件上传。
//    	            chunkSize: 5242880,// 如果要分片，分多大一片？ 默认大小为5M.
                    chunkRetry: 3,// 如果某个分片由于网络问题出错，允许自动重传多少次？
//    	            threads: 3,// 上传并发数。允许同时最大上传进程数。
//    	            fileVal: 'file',// 设置文件上传域的name。
//    	            method: 'POST',//文件上传方式，POST或者GET。
//    	            sendAsBinary: 'flash',//是否已二进制的流的方式发送文件，这样整个上传内容php://input都为文件内容， 其他参数在$_GET数组中。
//    	            fileNumLimit: undefined,// 验证文件总数量, 超出则不允许加入队列。
//    	            fileSizeLimit: undefined,//  验证文件总大小是否超出限制, 超出则不允许加入队列。
//                  fileSingleSizeLimit: options.fileSingleSizeLimit,//  验证单个文件大小是否超出限制, 超出则不允许加入队列。
//    	            disableWidgets: undefined,//  {String, Array} 默认所有 Uploader.register 了的 widget 都会被加载，如果禁用某一部分，请通过此 option 指定黑名单。
                };
                $.extend(option, options);

                var webUpl = WebUploader.create(option);

                webUpl.on('beforeFileQueued', function (file) {
                    if (option.debug) {
                        console.log('file:');
                        console.log(file);
                        console.log('-----beforeFileQueued-----');
                    }
                    typeof options.beforeFileQueued === 'function' && options.beforeFileQueued.call(this, file);
                }).on('fileQueued', function (file) {
                    if (option.debug) {
                        console.log('file:');
                        console.log(file);
                        console.log('-----fileQueued-----');
                    }
                    typeof options.fileQueued === 'function' && options.fileQueued.call(this, file);
                }).on('filesQueued', function (files) {
                    if (option.debug) {
                        console.log('files:');
                        console.log(files);
                        console.log('-----filesQueued-----');
                    }
                    typeof options.filesQueued === 'function' && options.filesQueued.call(this, files);
                }).on('fileDequeued', function (file) {
                    if (option.debug) {
                        console.log('file:');
                        console.log(file);
                        console.log('-----fileDequeued-----');
                    }
                    typeof options.fileDequeued === 'function' && options.fileDequeued.call(this, file);
                }).on('fileDequeued', function (file) {
                    if (option.debug) {
                        console.log('file:');
                        console.log(file);
                        console.log('-----fileDequeued-----');
                    }
                    typeof options.fileDequeued === 'function' && options.fileDequeued.call(this, file);
                }).on('reset', function () {
                    if (option.debug) {
                        console.log('-----reset-----');
                    }
                    typeof options.reset === 'function' && options.reset.call(this);
                }).on('stopUpload', function () {
                    console.log('-----stopUpload-----');
                    typeof options.stopUpload === 'function' && options.stopUpload.call(this);
                }).on('uploadFinished', function () {
                    if (option.debug) {
                        console.log('-----uploadFinished-----');
                    }
                    typeof options.uploadFinished === 'function' && options.uploadFinished.call(this);
                }).on('uploadStart', function (file) {
                    if (option.debug) {
                        console.log('file:');
                        console.log(file);
                        console.log('-----uploadStart-----');
                    }
                    typeof options.uploadStart === 'function' && options.uploadStart.call(this, file);
                }).on('uploadBeforeSend', function (object, data, headers) {
                    if (option.debug) {
                        console.log('object:');
                        console.log(object);
                        console.log('data:');
                        console.log(data);
                        console.log('headers:');
                        console.log(headers);
                        console.log('-----uploadBeforeSend-----');
                    }
                    typeof options.uploadBeforeSend === 'function' && options.uploadBeforeSend.call(this, object, data, headers);
                }).on('uploadAccept', function (object, ret) {
                    if (option.debug) {
                        console.log('object:');
                        console.log(object);
                        console.log('ret:');
                        console.log(ret);
                        console.log('-----uploadAccept-----');
                    }
                    typeof options.uploadAccept === 'function' && options.uploadAccept.call(this, object, ret);
                }).on('uploadProgress', function (file, percentage) {
                    if (option.debug) {
                        console.log('file:');
                        console.log(file);
                        console.log('percentage:');
                        console.log(percentage);
                        console.log('-----uploadProgress-----');
                    }
                    typeof options.uploadProgress === 'function' && options.uploadProgress.call(this, file, percentage);
                }).on('uploadError', function (file, reason) {
                    if (option.debug) {
                        console.log('file:');
                        console.log(file);
                        console.log('reason:');
                        console.log(reason);
                        console.log('-----uploadError-----');
                    }
                    typeof options.uploadError === 'function' && options.uploadError.call(this, file, reason);
                }).on('uploadSuccess', function (file, response) {
                    if (option.debug) {
                        console.log('file:');
                        console.log(file);
                        console.log('response:');
                        console.log(response);
                        console.log('-----uploadSuccess-----');
                    }
                    typeof options.uploadSuccess === 'function' && options.uploadSuccess.call(this, file, response);
                }).on('uploadComplete', function (file) {
                    if (option.debug) {
                        console.log('file:');
                        console.log(file);
                        console.log('-----uploadComplete-----');
                    }
                    typeof options.uploadComplete === 'function' && options.uploadComplete.call(this, file);
                }).on('error', function (type) {
                    if (option.debug) {
                        console.log('type:');
                        console.log(type);
                        console.log('-----error-----');
                    }
                    typeof options.error === 'function' && options.error.call(this, type);
                })
                return webUpl;
            }
        });
        return WebUpload;
    })()
})