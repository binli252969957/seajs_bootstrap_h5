define(function (require, exports, module) {
    var $common = require('./common');
    var $Table = require('./table');

    module.exports = (function () {
        var Page = function (config) {
            $.extend(this, config);
            this.config = config;
            this.init(config);
            return this;
        };
        $.extend(Page.prototype, {
            init: function (config) {         // 初始化数据
                this.target = config.target ? $(config.target) : $('#wrap-content');
                this.target.html('');
                this.target.append('<div class="ibox"><div class="ibox-title"><div class="clearfix" id="myTableHeader"></div></div><div class="ibox-content"><table id="dataTableList_table" class="table table-striped table-bordered table-hover"></table></div></div>');
                if (config.crumb && config.crumb.length) this.initCrumb(config.crumb);
                if (config.toolBar && config.toolBar.length) this.initToolBar(config.toolBar);
                if (config.search && config.search.length) this.initSearch(config.search);
                if (config.table && typeof config.table === 'object') this.initTable(config.table);
                if (config.callback && typeof config.callback === 'function') config.callback.call(this, this.target.find('.ibox-title'))
            },
            initCrumb: function (options) {     // 面包屑
                var li = $('#side-menu li');
                var myCrumb = $('.my-crumb');
                myCrumb.html('<a href="#">首页</a>');
                $.each(options, function (key, item) {
                    var span = $('<span> > </span>');
                    var a = $('<a href="javascript: void(0);"></a>');
                    var aText = '';
                    if (typeof item === 'string') {
                        aText = item;
                        a.text(item);
                    }
                    if (typeof item === 'object') {
                        aText = item.text;
                        item.text && a.text(item.text);
                        item.url && a.attr('href', item.url);
                    }
                    if (key === 0) {
                        $.each(li, function () {
                            var text = $(this).find('a').text();
                            if (text === aText) {
                                $(this).addClass('active');
                                if ($(this).parents('li').length) {
                                    $(this).parents('li').addClass('active');
                                    $(this).closest('ul').addClass('in');
                                }
                                return false;
                            }
                        })
                    }
                    myCrumb.append(span).append(a);
                });
            },
            initToolBar: function (options) {        // 左上角按钮样式
                var _This = this;
                var btnArea = $('<div id="my-btns" class="pull-left"></div>');
                $.each(options, function (key, value) {
                    var item = typeof value === 'string' ? {btnType: value} : value;
                    if (item.permission && !$common.hasPerm(item.permission)) return true;
                    if (item.btnType === 'select' || item.buttons && item.buttons.length) {     // 下拉按钮特殊处理
                        var btnGroup = $('<div class="btn-group m-r-sm"><button data-toggle="dropdown" class="btn btn-primary dropdown-toggle"><span></span><span class="caret"></span></button><ul class="dropdown-menu dropdown-menu-right"></ul></div>');
                        item.css && btnGroup.find('button').css(item.css);
                        item.cls && btnGroup.find('button').addClass(item.cls);
                        btnGroup.find('button').attr('title', item.name);
                        btnGroup.find('button span:eq(0)').html(item.name);
                        $.each(item.buttons, function (index, val) {
                            var btnLi = $('<li><a href="javascript: void(0)">' + val.name + '</a></li>');
                            btnLi.bind('click', function () {
                                typeof val.click === 'function' && val.click.call(_This, this);
                            });
                            btnGroup.find('ul').append(btnLi);
                        });
                        btnArea.append(btnGroup);
                    } else { // 一般按钮的处理
                        if (item.btnType === 'add') { // 新增按钮定义默认行为
                            item.name = item.name || '新增';
                            item.click = item.click || _This.addDialog;
                        }
                        var btn = $('<button type="button" class="btn btn-primary m-r-sm"></button>');
                        item.css && btn.css(item.css);
                        item.cls && btn.addClass(item.cls);
                        btn.attr('title', item.name);
                        btn.html(item.name);
                        btn.bind('click', function () {
                            typeof item.click === 'function' && item.click.call(_This, this);
                        });
                        btnArea.append(btn);
                    }
                });
                _This.target.find('#myTableHeader').append(btnArea);
            },
            initSearch: function (options) {         // 右边搜索按钮样式
                var _This = this;
                var searchArea = $('<div id="my-search" class="pull-right"></div>');
                $.each(options, function (key, item) {
                    item = typeof item === 'string' || item === 'searchKey' ? {type: 'text', name: item} : item;
                    if (item.hide === true) return true;
                    if (item.type === 'text') {
                        var textItem = $('<div class="input-group pull-right m-l-sm" style="width: 200px;"><input type="text" class="form-control" placeholder="搜索"><span class="input-group-btn"><button type="button" class="btn btn-primary">搜索</button></span></div>');
                        item.name && textItem.find('input').attr('name', item.name);
                        textItem.find('button').bind('click', function () {
                            _This.fnDraw(false);
                        });
                        searchArea.prepend(textItem);
                    } else if (item.type === 'select') {
                        var selectItem = $('<div class="input-group pull-right m-l-sm"><select class="form-control"></select></div>');
                        item.name && selectItem.find('select').attr('name', item.name);
                        item.placeholder && selectItem.find('select').attr('placeholder', item.placeholder);
                        if (typeof item.items === 'string') {
                            $common.request({
                                url: item.items,
                                mask: false,
                                success: function (data) {
                                    selectItem = renderSelect(data.result, selectItem, item);
                                }
                            })
                        } else {
                            selectItem = renderSelect(item.items, selectItem, item);
                        }
                        selectItem.find('select').bind('change', function () {
                            _This.fnDraw(false);
                        });
                        searchArea.append(selectItem);
                    } else {
                        require.async('laydate', function () {
                            if (item.type === 'date') {
                                var dateItem = $('<div class="input-group pull-right m-l-sm"><input type="text" class="laydate-icon form-control layer-date" readonly="true"></div>');
                                item.format === 'YYYY-MM-DD' ? dateItem.find('input').width(120) : dateItem.find('input').width(180);
                                item.width && dateItem.width(item.width);
                                item.name && dateItem.find('input').attr('name', item.name);
                                item.name && dateItem.find('input').attr('id', item.name + '-search-date');
                                item.placeholder && dateItem.find('input').attr('placeholder', item.placeholder);
                                searchArea.append(dateItem);
                                laydate({
                                    elem: '#' + item.name + '-search-date',
                                    event: 'click',
                                    format: item.format || 'YYYY-MM-DD hh:mm:ss',
                                    istime: item.format === 'YYYY-MM-DD' ? false : true,
                                    choose: function () {  //选择好日期的回调
                                        _This.fnDraw(false);
                                    }
                                });

                            } else {
                                var dateArea = $('<div class="input-group pull-right m-l-sm"><input type="text" class="laydate-icon form-control layer-date" readonly="true"><span class="my-date-area">到</span><input type="text" class="laydate-icon form-control layer-date pull-right" readonly="true"></div>');
                                item.format === 'YYYY-MM-DD' ? dateArea.find('input').width(120) : dateArea.find('input').width(180);
                                item.width && dateArea.find('input').width(item.width);
                                if (item.name) {
                                    dateArea.find('input').eq(0).attr('name', item.name[0]).attr('id', item.name[0] + 'date-start');
                                    dateArea.find('input').eq(1).attr('name', item.name[1]).attr('id', item.name[1] + 'date-end');
                                }
                                if (item.placeholder && item.placeholder.length) {
                                    dateArea.find('input').eq(0).attr('placeholder', item.placeholder[0]);
                                    dateArea.find('input').eq(1).attr('placeholder', item.placeholder[1]);
                                }
                                searchArea.append(dateArea);
                                var dataAreaArr = [false, false];
                                var start = {
                                    elem: '#' + item.name[0] + 'date-start',
                                    format: item.format || 'YYYY-MM-DD hh:mm:ss',
                                    istime: item.format === 'YYYY-MM-DD' ? false : true,
                                    istoday: false,
                                    choose: function (datas) {
                                        end.min = datas;
                                        end.start = datas;
                                        dataAreaArr[0] = true;
                                        if (dataAreaArr[0] === true && dataAreaArr[1] === true) {
                                            _This.fnDraw(false);
                                        }
                                    },
                                    dateClear: function () {
                                        dataAreaArr[0] = false;
                                        end.min = '';
                                        end.start = '';
                                    }
                                };
                                var end = {
                                    elem: '#' + item.name[1] + 'date-end',
                                    format: item.format || 'YYYY-MM-DD hh:mm:ss',
                                    istime: item.format === 'YYYY-MM-DD' ? false : true,
                                    istoday: false,
                                    choose: function (datas) {
                                        start.max = datas;
                                        dataAreaArr[1] = true;
                                        if (dataAreaArr[0] === true && dataAreaArr[1] === true) {
                                            _This.fnDraw(false);
                                        }
                                    },
                                    dateClear: function () {
                                        dataAreaArr[1] = false;
                                        start.max = '';
                                    }
                                };
                                laydate(start);
                                laydate(end);
                            }
                        })
                    }
                });
                this.target.find('#myTableHeader').append(searchArea);
            },
            initTable: function (table) {               // 表格渲染
                var _This = this;
                var cL = table.columns.length;
                var buttons = [];
                table.option = $.extend({
                    aaSorting: [[0, 'asc']],
                    paging: true
                }, table.option);
                table = $.extend({
                    target: '#dataTableList_table',
                    url: 'list.json',
                }, table);
                if (table.columns[cL - 1].buttons && table.columns[cL - 1].buttons.length) {
                    $.each(table.columns[cL - 1].buttons, function (key, val) {
                        if (val === 'edit') {
                            val = {
                                text: '编辑',
                                cls: 'btn-success',
                                onclick: function (el, data) {
                                    _This.editDialog(data);
                                }
                            }
                        } else if (val === 'delete') {
                            val = {
                                text: '删除',
                                cls: 'btn-danger',
                                onclick: function (el, data) {
                                    _This.confirmDelete(el, data)
                                }
                            }
                        } else if (val === 'view') {
                            val = {
                                text: '查看',
                                cls: 'btn-info',
                                onclick: function (el, data) {
                                    _This.viewDialog(data);
                                }
                            }
                        }
                        buttons.push(val);
                    });
                    table.columns[cL - 1].buttons = buttons;
                }

                _This.table = new $Table(table);
                _This.target.parent().addClass('animated fadeInRight');
            },
            addDialog: function () {           // 新增dialog
                var dialog = deepCopy(this.config.dialog);
                dialog.title = '新增';
                delete dialog.dataUrl;          // 调用新增时，不需要请求dataUrl的数据
                this.dialogShow(dialog, 'add');
            },
            editDialog: function (id) {           // 编辑dialog
                var dialog = deepCopy(this.config.dialog);
                dialog.title = '编辑';
                dialog.data = dialog.data || {id: id};
                dialog.dataUrl = dialog.dataUrl || 'data.json';
                this.dialogShow(dialog, 'edit', id);
            },
            viewDialog: function (id) {           // 查看dialog
                var dialog = deepCopy(this.config.dialog);
                dialog.title = '查看';
                dialog.data = dialog.data || {id: id};
                dialog.dataUrl = dialog.dataUrl || 'data.json';
                dialog.buttons = [{
                    text: '取消',
                    type: 'cancel'
                }];
                this.dialogShow(dialog, 'view', id);
            },
            dialogShow: function (dialog, status, id) {           // 显示dialog
                dialog.table = this.table;
                dialog.target = dialog.target || '.content-modal';
                dialog.saveUrl = dialog.saveUrl || 'save.do';
                dialog.updateUrl = dialog.updateUrl || 'save.do';
                if ($.isFunction(dialog.form)) dialog.form = dialog.form(status, id);
                require.async('./dialog', function ($Dialog) {
                    new $Dialog(dialog);
                });
            },
            confirmDelete: function (el, id, msg) {
                msg = msg || '是否确认删除？';
                var _This = this;
                $common.confirm(msg, function () {
                    $common.request({
                        el: el,
                        url: 'del.do',
                        data: {
                            id: id
                        },
                        success: function () {
                            _This.fnDraw(true);          // 刷新表格
                        }
                    });
                }, 2);
            },
            fnDraw: function (bool) {           // 刷新table
                this.table.fnDraw(bool);
            }
        });
        return Page;
    })()

    function deepCopy(obj) {           // 深拷贝
        if (typeof obj !== 'object') return obj;
        var newobj = {};
        if (obj instanceof Array) newobj = [];
        for (var attr in obj) {
            newobj[attr] = deepCopy(obj[attr]);
        }
        return newobj;
    }

    function renderSelect(items, selectItem, item) {          // 渲染select搜索
        selectItem.find('select').append('<option value="">' + (item.placeholder || '请选择') + '</option>');
        $.each(items, function () {
            if (this.label) {
                var group = $('<optgroup></optgroup>');
                group.attr('label', this.label);
                $.each(this.items, function () {
                    group.append('<option value="' + this.value + '">' + this.text + '</option>');
                });
                selectItem.find('select').append(group);
            } else {
                this.value = !$common.isNull(this.value) ? this.value : this.id;
                this.text = !$common.isNull(this.text) ? this.text : this.name;
                selectItem.find('select').append('<option value="' + this.value + '">' + this.text + '</option>');
            }
        });
        return selectItem;
    }
});