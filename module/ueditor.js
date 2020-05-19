define(function (require, exports, module) {
    var $Ue = require('ueditor');
    module.exports = (function () {
        var Ueditor = function (config) {
            this.config = config;
            this.init(config);
            return this;
        }
        $.extend(Ueditor.prototype, {
            init: function (config) {
                var _This = this;
                var item = config.item || {};
                var value = config.value || '';
                var row = config.row;
                var editor = $('<script type="text/plain"></script>');
                var hidden = config.hidden || $('<input type="hidden">');
                _This.uEditorId = 'container' + item.name.replace(/\./g, '_');
                _This.imageUploadId = 'uploadEditor' + item.name.replace(/\./g, '_');
                // if (item.name.indexOf('.') >= 0) item.name = item.name.replace(/\./g, '_');

                editor.attr('name', item.name + 'ueditor').attr('id', _This.uEditorId);
                row.find('.col-sm-8').prepend(editor).append(hidden);

                this.editorImage(item, function () {
                    require.async('./webupload', function ($Webupload) {
                        new $Webupload({
                            item: item,
                            imageUploadId: _This.imageUploadId,
                            options: {
                                uploadSuccess: function (files, response) {
                                    if (typeof response === 'string') response = JSON.parse(response);
                                    if (response.success) {
                                        var data = response.result;
                                        _This.flashImageUploadSuccess(files, data, item);
                                    } else {
                                        require.async('./common', function ($common) {
                                            $common.showMsg('上传失败，请稍后再试试', 'error')
                                        })
                                    }
                                }
                            }
                        })
                    });
                })

                $Ue.delEditor(_This.uEditorId);
                var UE = $Ue.getEditor(_This.uEditorId, item.options);

                UE.addListener('contentChange', function () {     // 编辑器监听内容改变执行
                    var content = UE.getContent();
                    _This.getUeditContent(content, hidden);
                });

                UE.addListener('ready', function () {         // 编辑器监准备就绪后执行
                    this.setContent(value);
                });
            },
            flashImageUploadSuccess: function (files, data, item) {        // 富文本框编辑器的上传方法
                var ueditorId = this.uEditorId;
                if (files) {
                    var img = '<img file-id="' + data.id + '" src="' + (data.url || data.downloadPath || window.path + '/sfile/download/' + data.id) + '">'
                    $Ue.getEditor(ueditorId).focus();
                    $Ue.getEditor(ueditorId).execCommand('insertHtml', img);
                }

                $Ue.getEditor(ueditorId).focus();
            },
            getUeditContent: function (content, hidden) {       // 获取ueditor的内容及文件id
                var fileIds = [];
                hidden.val(content);
                $(content).find("img[file-id]").each(function (i) {
                    fileIds.push($(this).attr("file-id"));
                });
                fileIds = fileIds.join(",");
                hidden.attr('value-fileIds', fileIds);
            },
            editorImage: function (item, callback) {
                $Ue.registerUI(this.imageUploadId, function (editor, uiName) {
                    editor.registerCommand(uiName, {   //注册按钮执行时的command命令，使用命令默认就会带有回退操作
                        execCommand: function () {
                            // alert('execCommand:' + uiName)
                        }
                    });

                    var btn = new UE.ui.Button({        //创建一个button
                        //按钮的名字
                        name: uiName,
                        //提示
                        title: '上传图片',
                        //添加额外样式，指定icon图标，这里默认使用一个重复的icon
                        cssRules: 'background-position: -380px 0; margin-top: 0',
                        //点击时执行的命令
                        onclick: function () {
                            //这里可以不用执行命令,做你自己的操作也可
                            editor.execCommand(uiName);
                        },
                        initButton: function () {
                            var utils = baidu.editor.utils;
                            this.initUIBase();
                            this.Stateful_init();
                            if (this.cssRules) {
                                utils.cssRule('edui-customize-' + this.name + '-style', this.cssRules);
                            }

                        },
                        getHtmlTpl: function () {
                            return '<div id="##" class="edui-box %%" style="margin-top: 0px">' +
                                '<div id="##_state" stateful>' +
                                '<div class="%%-wrap"><div id="##_body" unselectable="on" ' +
                                (this.title ? 'title="' + this.title + '"' : '') +
                                ' class="%%-body" onmousedown="return $$._onMouseDown(event, this);" onclick="return $$._onClick(event, this);">' +
                                (this.showIcon ? '<div class="edui-box edui-icon" id="' + this.name + '"></div>' : '') +
                                (this.showText ? '<div class="edui-box edui-label">' + this.label + '</div>' : '') +
                                '</div>' +
                                '</div>' +
                                '</div></div>';
                        }
                    });

                    //当点到编辑内容上时，按钮要做的状态反射
                    editor.addListener('selectionchange', function () {
                        var state = editor.queryCommandState(uiName);
                        if (state == -1) {
                            btn.setDisabled(true);
                            btn.setChecked(false);
                        }
                        else {
                            btn.setDisabled(false);
                            btn.setChecked(state);
                        }
                    });
                    editor.addListener('ready', function () {
                        typeof callback === 'function' && callback(editor);
                    });
                    //因为你是添加button,所以需要返回这个button
                    return btn;
                })
            }
        })
        return Ueditor;
    })()
})