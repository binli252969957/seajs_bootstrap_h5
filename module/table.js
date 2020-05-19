define(function (require, exports, module) {
    var $common = require('./common');
    require('dataTables');

    module.exports = (function () {
        var Table = function () {
            return this.init.apply(this, arguments);
        }
        $.extend(Table.prototype, {
            init: function (option) {               // 初始化table
                var _This = this;
                var defaultOption = {
                    myscope: this,
                    sAjaxSource: $common.convertUrl(option.url),
                    aoColumns: option.columns,
                    bFilter: false,
                    bServerSide: true,
                    bSort: false,//取消排序
                    defaultSort: [],
                    sDom: "rt<'table-footer clearfix'<'DT-label'l><'DT-label'i><'DT-pagination'p>>",
                    oLanguage: {
                        "sLengthMenu": "每页显示 _MENU_ 条记录",
                        "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                        "sInfoEmpty": "没有数据",
                        "sInfoFiltered": "(从 _MAX_ 条数据中检索)",
                        "sZeroRecords": "没有检索到数据"
                    },
                    fnServerData: function () {
                        var a = Array.prototype.slice.call(arguments, 0);
                        a.unshift(this);
                        _This.retrieveData.apply(_This, a);
                    },
                    fnDrawCallback: function () {
                        $('html, body').scrollTop(0);
                        var settings = this.fnSettings();
                        $(this[0]).parent().find('input[name="jump"]').val(parseInt(settings._iDisplayStart / settings._iDisplayLength + 1));
                    },
                    fnInitComplete: function (oSettings, json) {
                        var _This = this;
                        var sTable = $('#' + oSettings.sTableId);
                        var les = oSettings.oClasses.sLength;
                        var sIn = oSettings.oClasses.sInfo;
                        var leEl = sTable.parent().find("." + les);
                        var inEl = sTable.parent().find("." + sIn);
                        if (leEl.length > 0) {
                            leEl.css('float', 'left');
                            var el = leEl.parent();
                            el.append("<label class='dataTableReFreshWrap' onclick='$(\"" + option.target + "\").dataTable().fnDraw(true);'><i class='icon-refresh'></i></label>");
                        }
                        else if (inEl.length > 0) {
                            inEl.css('float', 'left');
                            var el = inEl.parent();
                            el.append("<label class='dataTableReFreshWrap' onclick='$(\"" + option.target + "\").dataTable().fnDraw(true);'><i class='icon-refresh'></i></label>");
                        }
                        //指定页面跳转
                        var sPage = oSettings.oClasses.sPaging;
                        if (sPage.indexOf(' ') !== -1) sPage = sPage.split(' ')[0];

                        var jump = $('<input class="form-control jump" name="jump" value="' + parseInt(oSettings._iDisplayStart / oSettings._iDisplayLength + 1) + '" />');
                        jump.insertAfter(sTable.parent().find('.' + sPage));

                        jump.bind('keyup', function (e) {
                            var page = parseInt(this.value) - 1;
                            if (!page) page = 0;
                            if (e.keyCode === 13) _This.fnPageChange(page);
                        })
                    }
                };
                if (option.option) $.extend(defaultOption, option.option);
                if (option.conditions) this.conditions = option.conditions;
                if (option.callback) this.loadCallback = option.callback;
                if (option.beforeDataLoad) this.beforeDataLoad = option.beforeDataLoad;
                if (option.filterSendData) {
                    this.filterSendData = option.filterSendData || function (data) {
                        return data;
                    };
                }

                this.target = $(option.target);
                defaultOption = this.renderButton(defaultOption);

                var table = this.target.dataTable(defaultOption);

                $(option.conditions).each(function () {
                    var events = this.events;
                    for (var e in events) {
                        $(events[e]).bind(e, function () {
                            table.fnDraw();
                        })
                    }
                });

                return table;
            },
            retrieveData: function (table, sSource, aoData, fnCallback) {           // 提交table数据
                var _This = this;
                var target = this.target;

                var mySearch = $('#my-search').find('.input-group');
                if (mySearch.length) {
                    $.each(mySearch, function () {
                        var input = $(this).find('input');
                        var select = $(this).find('select');
                        if (select.length) {
                            if (select.val()) aoData[select.attr('name')] = select.val();
                        } else if (input.length === 1) {
                            if (input.val()) aoData[input.attr('name')] = input.val();
                        } else if (input.length === 2) {
                            aoData[input.eq(0).attr('name')] = input.eq(0).val();
                            aoData[input.eq(1).attr('name')] = input.eq(1).val();
                        }
                    })
                }

                if (this.conditions) {
                    $(this.conditions).each(function () {
                        aoData[this.key] = typeof this.value === 'function' ? this.value() : this.value;
                    })
                }

                //添加排序
                var oInit = table.fnSettings().oInit;
                var setting = table.fnSettings();

                if (oInit.bSort === true) {
                    if (!$common.isNull(aoData.iSortCol_0)) {
                        var filed = oInit.aoColumns[aoData.iSortCol_0];
                        if (!$common.isNull(filed)) {
                            if (!$common.isNull(filed.sort)) {
                                aoData.sort = filed.sort
                            } else {
                                aoData.sort = filed.mData
                            }
                            aoData.dir = aoData.sSortDir_0
                        }
                    } else {
                        if (oInit.defaultSort.length === 2) {
                            aoData.sort = oInit.defaultSort[0];
                            aoData.dir = oInit.defaultSort[1];
                        }
                    }
                }
                //升序和降序相反
                if (aoData.dir) aoData.dir = aoData.dir === 'asc' ? 'desc' : 'asc';

                aoData = _This.filterSendData ? _This.filterSendData(aoData) : aoData;

                $common.request({
                    el: target,
                    url: sSource,
                    data: aoData,
                    success: function (data) {
                        typeof _This.beforeDataLoad === 'function' && _This.beforeDataLoad.call(this, data);
                        if (data.success) {
                            var aoData = {
                                sEcho: "eatery",
                                aaData: data.result.content || data.result,//分页查询返回数据后端更改-2017-02-23
                                iTotalDisplayRecords: data.result.content ? data.result.totalElements : data.result.length,
                                iTotalRecords: data.result.content ? data.result.totalElements : data.result.length
                            };
                            fnCallback(aoData);
                            typeof _This.loadCallback === 'function' && _This.loadCallback.call(this, data);
                        }
                    }
                });
            },
            renderButton: function (defaultOption) {            // 渲染buttons
                var _This = this;
                $(defaultOption.aoColumns).each(function () {
                    var btnEvents = [];
                    var column = this;
                    if (column.bSortable === true) {
                        defaultOption.bSort = true;
                    } else {
                        column.bSortable = false;
                    }
                    var mRender = this.mRender;
                    if (column.buttons) {
                        var buttons = column.buttons;
                        if ($.type(buttons) !== 'array') buttons = [buttons];

                        $.each(buttons, function (i, button) {
                            if (!button.type) button.type = 'button';

                            var btnCls = 'table-btn_' + btnEvents.length;
                            if (button.type === 'dropdown') {
                                if (typeof button.items !== 'string') {
                                    $.each(button.items, function (i, item) {
                                        if ($.isFunction(button.itemClick)) addCls(item, btnCls);

                                        if ($.isFunction(item.onclick)) {
                                            addCls(item, btnCls);
                                            btnEvents.push({cls: btnCls, onclick: item.onclick});
                                        }
                                    });
                                } else {
                                    $common.request({
                                        url: button.items,
                                        async: false,
                                        success: function (res) {
                                            if (!res || !res.result || !res.result.length) return false;
                                            $.each(res.result, function (i, item) {
                                                if ($.isFunction(button.itemClick)) addCls(item, btnCls);
                                                item.btnCls = button.btnCls[i];
                                            });
                                            button.items = res.result;
                                        }
                                    });
                                }
                                if ($.isFunction(button.itemClick)) {
                                    btnEvents.push({cls: btnCls, onclick: button.itemClick, type: button.type})
                                }
                            } else {
                                if ($.isFunction(button.onclick)) {
                                    addCls(button, btnCls);
                                    btnEvents.push({cls: btnCls, onclick: button.onclick, type: button.type})
                                }
                            }
                        });
                        column.mRender = function (data, type, full) {
                            return _This.defineButtons({buttons: buttons}, data, full);
                        };
                        var fnCreatedCell = column.fnCreatedCell;
                        column.fnCreatedCell = function (el, cellHtml, rowData) {
                            if (fnCreatedCell) fnCreatedCell.apply(this, arguments);
                            // 在table创建完cell后将配置的onclick事件绑定到按钮上
                            $.each(btnEvents, function (i, o) {
                                $(el).on('click', '.' + o.cls, function () {
                                    o.onclick.call(this, this, $(this).attr('data'), rowData);
                                });
                            });
                        };
                    } else {
                        column.mRender = function (data, type, full) {
                            data = continuousPoint(full, column.mData);
                            if ($.isFunction(mRender)) {
                                data = mRender(data, type, full);
                            } else {
                                if (data === null || data === undefined) data = '';
                            }
                            if (typeof column.ellipsis === 'number' && column.ellipsis > 0) {
                                if (column.ellipsis === 1) {
                                    data = "<div class='my-ellipsis' style='width: " + column.sWidth + "px' title='" + data + "'>" + data + "</div>";
                                } else {
                                    data = "<div class='my-ellipsis2' style='-webkit-line-clamp: " + column.ellipsis + "' title='" + data + "'>" + data + "</div>";
                                }
                            }
                            return $common.isNull(data) ? '' : data;
                        }
                    }
                });
                return defaultOption;
            },
            defineButtons: function (config, data, full) {          //自定义buttons
                var _This = this;
                var btns = '';
                var _list = [];
                if (config.buttons) {
                    if (!config.buttons.length) config.buttons = [config.buttons];
                    $.each(config.buttons, function (index) {
                        if (this.permission && !$common.hasPerm(this.permission)) return true;
                        if (this.type === 'dropdown') {
                            _list[index] = _This.defineTypeDropdown(this, data, full);
                        } else {
                            _list[index] = _This.defineTypeButton(this, data, full);
                        }
                    });
                    if (_list.length > 0) {
                        for (var i = 0; i < _list.length; i++) {
                            if (_list[i]) btns += _list[i];
                        }
                    }
                }
                return btns;
            },
            defineTypeButton: function (config, data, full) {           //自定义button类型按钮
                var hide = config.hide;
                var editable = config.editable;
                var text;
                if ($.isFunction(hide)) hide = hide(config, data, full);
                if (hide === true) return "";

                var btn = $('<button class="btn btn-xs m-r-sm"></button>');

                if ($.isFunction(config.text)) {
                    text = config.text(data, full);
                } else {
                    text = config.text;
                }
                btn.html(text || '');

                config.css && btn.css(config.css);
                config.cls && btn.addClass(config.cls);
                config.event && btn.attr('onclick', config.event || '');
                data && btn.attr("data", data);

                if ($.isFunction(editable)) editable = editable(config, data, full);
                if (editable === false) btn.removeClass(config.cls).addClass('btn-default');
                return btn.get(0).outerHTML;
            },
            defineTypeDropdown: function (config, data, full) {             //自定义dropdown类型按钮
                var hide = config.hide;
                if ($.isFunction(hide)) hide = hide(config, data, full);
                if (hide === true) return "";

                var dropdown = $('<button data-toggle="dropdown" class="btn btn-xs dropdown-toggle"></button>');
                var ul = $('<ul class="dropdown-menu"></ul>');

                var text = config.text;
                if ($.isFunction(text)) text = text(data, full, config.items);
                var fnText = text;

                var mData = config.mData;
                if (mData) var mDataText = continuousPoint(full, mData);

                var btnCls, lic = 0;
                $(config.items).each(function (i) {
                    var li = $('<li><a href="javascript:void(0)"></a></li>');
                    var a = li.find('a');
                    a.html(this.text || '');
                    a.attr('onclick', this.event || '');
                    this.css && a.css(this.css);
                    this.cls && a.addClass(this.cls);
                    this.data && a.attr('data', this.data);
                    if (this.data === mDataText || this.text === mDataText) {
                        mDataText = this.text;
                        if (!btnCls && this.btnCls) btnCls = this.btnCls;
                    }

                    if (this.data === text) text = this.text;
                    if (this.data === fnText || this.text === fnText) {
                        if (!btnCls && this.btnCls) btnCls = this.btnCls;
                    }
                    if (typeof config.itemFilter === 'function' && config.itemFilter(this, i, data, full)) {
                        li.hide();
                    } else {
                        lic++;
                    }
                    ul.append(li);
                });
                if (lic === 0) ul.hide();

                dropdown.html((mDataText || text) + '&nbsp;<span class="caret"></span>');
                config.css && dropdown.css(config.css);
                if (!btnCls) btnCls = config.cls;
                btnCls && dropdown.addClass(btnCls);

                ul.css({
                    minWidth: 0
                });

                var editable = config.editable;
                if ($.isFunction(editable)) editable = editable(config, data, full);
                if (editable === false) {
                    dropdown.removeClass(btnCls);
                    return '<div class="btn-group m-r-sm">' + dropdown.get(0).outerHTML + '</div>';
                }
                return '<div class="btn-group m-r-sm">' + dropdown.get(0).outerHTML + ul.get(0).outerHTML + '</div>';
            }
        });
        return Table;
    })();

    function addCls(config, cls) {
        if (config.cls) {
            if (config.cls.indexOf(cls) < 0) config.cls += ' ' + cls;
        } else {
            config.cls = cls;
        }
    }

    function continuousPoint(full, data) {
        if (data) {
            if (data.indexOf('.') > 0) {
                var nameArr = data.split('.');
                var nameData = full;
                var nameNew = '';
                $.each(nameArr, function (index, value) {
                    if (nameData[value] === '' || nameData[value] === undefined) {
                        nameNew = '';
                        return false;
                    } else {
                        nameNew = nameData[value];
                        nameData = nameNew;
                    }
                    if (index === nameArr.length - 1) return false;
                });
                return nameNew;
            } else {
                return full[data];
            }
        } else {
            return '';
        }
    }
})