define(function (require, exports, module) {
    var $common = require('./common');
    var $Page = require('./page');

    module.exports = (function () {
        var PageNav = function (config) {
            $.extend(this, config);
            this.config = config;
            this.init(config);
            return this;
        };
        $.extend(PageNav.prototype, {
            init: function (config) {         // 初始化数据
                this.target = config.target ? $(config.target) : $('#wrap-content');
                this.target.html('');
                this.target.append('<div class="row"><div class="col-sm-4 col-lg-2 col-md-3" id="myNav"></div><div class="col-sm-8 col-lg-10 col-md-9" id="myTable"></div></div>')
                if (config.navigate) this.initNavigate(config.navigate);
                this.initPage(config);
            },
            initNavigate: function (options) {
                var _This = this;
                var iBox = $('<div class="ibox"><div class="ibox-title clearfix"></div><div class="ibox-content" style="padding-left: 0; padding-right: 0"></div></div>')
                if (options.toolBar && options.toolBar.length) {
                    $.each(options.toolBar, function (key, item) {
                        _This.initToolBar(item, iBox);
                    })
                } else {
                    iBox.find('.ibox-title').html('<h5>导航栏</h5>')
                }
                if (options.items) {
                    if (typeof options.items === 'string') {
                        $common.request({
                            url: options.items,
                            success: function (res) {
                                _This.initNavBar(res.result, iBox, options)
                            }
                        })
                    } else {
                        _This.initNavBar(options.items, iBox, options)
                    }
                }
                this.target.find('#myNav').html(iBox);
            },
            initToolBar: function (item, iBox) {
                var _This = this;
                var btn = $('<button type="button" class="btn btn-primary m-r-sm"></button>');
                item.css && btn.css(item.css);
                item.cls && btn.addClass(item.cls);
                btn.attr('title', item.name);
                btn.html(item.name);
                btn.bind('click', function () {
                    typeof item.click === 'function' && item.click.call(_This, this);
                });
                iBox.find('.ibox-title').append(btn);
            },
            initNavBar: function (items, iBox, options) {
                if (!items || !items.length) return false;
                var _This = this;
                var ul = $('<ul class="list-group my-list-group"></ul>');
                var flagIndex = _This.flagIndex && _This.flagIndex < items.length ? _This.flagIndex : 0;

                $.each(items, function (key, val) {
                    val.value = val.value || val.type;
                    val.text = val.text || val.name;
                    var li = $('<li class="list-group-item"></li>');
                    li.prepend(val.text).data('value', val.value).data('text', val.text);

                    if (!_This.flagIndex && val.active === true) flagIndex = key;
                    if (options.operate) {
                        $.each(options.operate, function (index, value) {
                            var span = $('<span class="fa pull-right"></span>');
                            span.attr('title', value.title);
                            span.addClass(value.icon || 'fa-gear');
                            li.append(span);

                            span.bind('click', function (e) {
                                e.stopPropagation();
                                if (value.click && typeof value.click === 'function') {
                                    value.click.call(_This, this, val);
                                }
                            })
                        })
                    }
                    ul.append(li);

                    li.bind('click', function () {
                        $(this).addClass('active').siblings().removeClass('active');
                        _This.navSelected = val;
                        _This.flagIndex = key;
                        if (options.clickBack && typeof options.clickBack === 'function') {
                            options.clickBack.call(_This, this, val);
                        }
                    });
                });

                ul.find('li').eq(flagIndex).addClass('active');
                _This.navSelected = items[flagIndex];
                _This.flagIndex = flagIndex;

                iBox.find('.ibox-content').html(ul);

                if (options.callback && typeof options.callback === 'function') {
                    options.callback.call(_This, items[flagIndex])
                }
            },
            initPage: function (config) {
                if (!config.table && !config.dialog) return false;
                var _This = this;
                var confitions = {
                    key: 'navSelectedValue',
                    events: {
                        click: '.my-list-group li'
                    },
                    value: function () {
                        return _This.navSelected.value;
                    }
                };
                if (config.table) {
                    if (config.table.conditions) {
                        config.table.conditions.push(confitions)
                    } else {
                        config.table.conditions = [confitions];
                    }
                }

                if (config.dialog) {
                    var newFilter = config.dialog.filterSaveData;
                    var filterFun = function (data) {
                        if (newFilter) data = typeof newFilter === 'function' && newFilter(data);
                        data.navSelectedValue = _This.navSelected.value;
                        return data;
                    };
                    config.dialog.filterSaveData = filterFun;
                    config = $.extend(config, {
                        target: _This.target.find('#myTable')
                    });
                }

                _This.page = new $Page(config);
            },
            getNavSelected: function () {
                return this.navSelected;
            },
            getTarget: function () {
                return this.target;
            },
            refresh: function () {
                return this.initNavigate(this.navigate);
            },
            fnDraw: function (bool) {           // 刷新table
                this.page.fnDraw(bool);
            }
        });
        return PageNav;
    })()
});