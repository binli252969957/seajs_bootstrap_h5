define(function (require, exports, module) {
    require('validate');
    var $common = require('./common');
    var $render = require('./render');
    $.validator.setDefaults({
        highlight: function (element) {
            if ($(element).attr('data-upload') === 'hidden') {
                $(element).closest('td').removeClass('has-success').addClass('has-error');
            } else {
                $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
            }
        },
        success: function (element) {
            if (element.prev().attr('data-upload') === 'hidden') {
                element.closest('td').removeClass('has-error').addClass('has-success');
            } else {
                element.closest('.form-group').removeClass('has-error').addClass('has-success');
            }
        },
        errorPlacement: function (error, element) {
            if (element.is(":radio") || element.is(":checkbox")) {
                error.appendTo(element.closest('.col-sm-8'));
            } else if (element.parent().attr('type') === 'dateArea') {
                error.appendTo(element.closest('.col-sm-8'));
            } else {
                error.appendTo(element.parent());
            }
        },
        errorElement: "span",
        errorClass: "help-block m-b-none",
        validClass: "help-block m-b-none",
        ignore: ""
    });

    module.exports = (function () {
        var Dialog = function (config) {
            this.init(config);
            return this;
        };
        $.extend(Dialog.prototype, {
            init: function (config) {       // 初始化
                var _This = this;
                this.target = $(config.target).length ? $(config.target) : this.getModal(config.target);
                this.title = config.title;
                this.buttons = config.buttons;
                this.table = config.table;
                this.dataUrl = config.dataUrl;
                this.saveUrl = config.saveUrl;
                this.updateUrl = config.updateUrl;
                this.keyboard = config.keyboard;
                this.setFooterButtons();
                this.filterRenderData = config.filterRenderData || function (data) {
                    return data;
                };
                this.beforeSave = config.beforeSave || function () {
                };

                this.filterSaveData = config.filterSaveData || function (data) {
                    return data;
                };
                this.saveCallback = config.saveCallback || function () {
                };
                this.form = config.form;
                this.callback = config.callback;
                this.validate = config.validate;
                this.dataType = config.dataType || 'form';

                this.title && this.setTitle(this.title);

                this.setWidth(config.width || '');

                if (this.target.find('.my-modal-close').length) {
                    this.target.find('.my-modal-close').unbind('click').bind('click', function () {
                        if ($(this).attr('data-validated') === 'false') return false;
                        _This.hide();
                    });
                }

                this.toSaveData();

                if (this.dataUrl) {
                    $common.request({
                        url: this.dataUrl,
                        data: config.data,
                        success: function (data) {
                            _This.ajaxData = data.result;
                            _This.show(data.result || {});
                        }

                    })
                } else {
                    _This.show();
                }
            },
            getModal: function (target) {       // 生成dialog模板
                var modal = $('<div class="modal inmodal" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static"><div class="modal-dialog animated fadeInDown"><div class="my-modal-close"><i class="fa fa-times-circle"></i></div><div class="modal-content"><div class="modal-header"></div><div class="modal-body clearfix"></div><div class="modal-footer"></div></div></div></div>');
                if (target.indexOf('.') !== -1) modal.addClass(target.split('.')[1]);
                if (target.indexOf('#') !== -1) modal.atrr('id', target.split('#')[1]);

                $('body').append(modal);

                modal.on('hidden.bs.modal', function () {
                    $(this).data("bs.modal", null);
                    $(this).find('.modal-body').html('');
                })

                return modal;
            },
            setTitle: function (title) {      // 设置标题
                this.target.find('.modal-header').html(title);
                this.title = title;
            },
            setWidth: function (w) {     // 设置宽度
                this.target.find('.modal-dialog').css('width', w);
            },
            setFooterButtons: function () {           // 设置底部按钮
                var _This = this;
                var footer = this.target.find('.modal-footer');
                var buttons = this.buttons;
                var cancelButton = $('<button type="button" class="btn btn-w-m btn-default" data-type="cancel">取消</button>');
                var saveButton = $('<button type="button" class="btn btn-w-m btn-primary" data-type="save">保存</button>');

                footer.html('');

                if (!buttons) {
                    cancelButton.attr('data-dismiss', 'modal').attr('aria-hidden', 'true');
                    footer.append(cancelButton).append(saveButton);
                } else {
                    $.each(buttons, function (index, button) {
                        if (button.type === 'save') {
                            saveButton.html(button.text || '保存');
                            if (button.cls) saveButton.addClass(button.cls);

                            bindValidate(button, saveButton);

                            footer.append(saveButton);
                        } else if (button.type === 'cancel') {
                            cancelButton.html(button.text || '取消');
                            if (button.cls) cancelButton.addClass(button.cls);

                            bindValidate(button, cancelButton);
                            bindValidate(button, _This.target.find('.my-modal-close'));

                            cancelButton.bind('click', function () {
                                if ($(this).attr('data-validated') === 'false') return false;
                                _This.hide();
                            });

                            footer.append(cancelButton);
                        } else {
                            var el = $('<button type="button" class="btn"></button>');
                            el.html(button.text);
                            if (button.cls) el.addClass(button.cls);

                            bindValidate(button, el);

                            el.bind('click', function () {
                                if ($(this).attr('data-validated') === 'false') return false;
                                typeof button.callback === 'function' && button.callback.call(_This, this);
                            });
                            footer.append(el);
                        }
                    })
                }

                function mouesedown() {
                    var config = $(this).data('config');
                    if (config && config.validate && config.validate.call(_This)) {
                        $(this).attr('data-validated', true)
                    } else {
                        $(this).attr('data-validated', false)
                    }
                }

                function bindValidate(config, button) {
                    if (config.validate && typeof config.validate === 'function') {
                        button.data('config', config).unbind('mousedown').bind('mousedown', mouesedown)
                    }
                }
            },
            toSaveData: function () {       // 点击保存
                var _This = this;
                this.target.find('.modal-footer .btn[data-type="save"]').unbind('click').bind('click', function () {
                    if ($(this).attr('data-validated') === 'false') return false;

                    var validation = {
                        rules: {},
                        messages: {}
                    };
                    $.each(_This.form, function (key, val) {
                        if (val.hide === true) return true;
                        var formValidateValue = _This.getValidate(val);
                        validation.rules = $.extend(validation.rules, formValidateValue.rules);
                        validation.messages = $.extend(validation.messages, formValidateValue.messages);
                    });

                    _This.target.find('form.form-horizontal').data('validator', '');
                    var myValidate = _This.target.find('form.form-horizontal').validate(validation);

                    if (!myValidate.form()) return false;

                    var data = _This.getData();
                    if (typeof data === 'string') {
                        $common.showMsg(data, 'error');
                        return false;
                    }
                    if (_This.beforeSave) typeof _This.beforeSave === 'function' && _This.beforeSave.call(_This);

                    // if (_This.ajaxData && data) { // 如果有返回数据的处理情况
                    //     $.each(data, function (key, val) {
                    //         if (key.indexOf('.') > 0) {
                    //             var keyArr = key.split('.');
                    //             _This.ajaxData = mergeAjaxData(_This.ajaxData, keyArr, val, 0);
                    //         } else {
                    //             _This.ajaxData[key] = val;
                    //         }
                    //     });
                    //     data = _This.ajaxData;
                    // }

                    data = _This.filterSaveData(data);
                    if (!data) return false;

                    if (_This.dataType === 'json') data = JSON.stringify(data);

                    $common.request({
                        el: this,
                        url: data.id ? (_This.updateUrl || _This.saveUrl) : (_This.saveUrl || _This.updateUrl),
                        data: data,
                        contentType: _This.dataType === 'json' ? 'application/json' : 'application/x-www-form-urlencoded; charset=UTF-8',
                        success: function (res) {
                            if (res.success) {
                                _This.hide();
                                if (_This.table && _This.table.fnDraw) _This.table.fnDraw(!!data.id);
                                $common.showMsg('保存成功', 'success');

                                _This.saveCallback.call(_This, res);
                            }
                        }
                    })

                });
            },
            getData: function () {
                var _This = this;
                var ret = true;
                if (this.validate && typeof this.validate === 'function') ret = this.validate.call(this);
                if (ret !== true) return ret;
                var data = {};
                $.each(this.form, function (key, val) {
                    if (val.hide === true) return true;
                    var valueData = _This.getValue(val.name, key);
                    if (val.type === 'actTable' && val.jsonType !== true) {
                        var tableData = JSON.parse(valueData);
                        $.each(tableData, function (index, value) {
                            $.each(value, function (index1, value1) {
                                data[val.name + '[' + index + '].' + index1] = value1;
                            })
                        });
                    } else {
                        data[val.name] = valueData;
                        if (val.type === 'uEditor') data[val.name + 'SfileIds'] = val.input.attr('value-fileids') || '';
                    }

                });
                return data;
            },
            getValidate: function (item) {
                var icon = "<i class='fa fa-times-circle'></i>";
                // var field = ['required', 'email', 'url', 'date', 'dateISO', 'number', 'digits', 'creditcard', 'maxlength', 'minlength', 'max', 'min', 'equalTo', 'remote'];
                // var fieldMessage = ['必须输入值', '必须输入正确格式的电子邮件', '必须输入正确格式的网址', '必须输入正确格式的日期', '必须输入正确格式的日期', '必须输入合法的数字', '必须输入整数', '必须输入合法的信用卡号', '输入字符串最大长度', '输入字符串最小长度', '输入值不能大于', '输入值不能小于', '输入值不一致', '远程验证不通过']
                var rules = {};
                var messages = {};
                var name = item.name;

                if (item.type === 'actTable') {
                    if (!item.el.find('table tbody tr').length) return false;
                    var items = item.el.find('input, select');
                    $.each(items, function () {
                        var item = $(this).data('oneSelf');
                        name = $(this).attr('name');
                        if (!name || !item) return true;
                        rulesMessages(item, name);
                    })
                } else {
                    if (item.type === 'checkbox') {
                        name = 'checkbox' + item.name;
                    } else if (item.type === 'radio') {
                        name = 'radio' + item.name;
                    }
                    rulesMessages(item, name);
                }

                function rulesMessages(item, name) {
                    if (item.validate) {
                        rules[name] = {};
                        messages[name] = {};
                        $.each(item.validate, function (key, value) {
                            if (!value) return true;
                            if (typeof value === 'string') {
                                if (key === 'equalTo') {
                                    rules[name][key] = '#custom-element-' + value;
                                    messages[name][key] = icon + '&nbsp;' + item.label + '输入值不一致';
                                } else if (key === 'remote') {
                                    rules[name][key] = {
                                        url: value,
                                        type: "post",
                                        dataType: "json",
                                        data: {},
                                        async: false,
                                        dataFilter: function (data) {
                                            if (typeof data === 'string') data = JSON.parse(data);
                                            return data.result;
                                        }
                                    };
                                    messages[name][key] = icon + '&nbsp;' + item.label + '远程验证不通过';
                                } else {
                                    rules[name][key] = true;
                                    messages[name][key] = icon + '&nbsp;' + value;
                                }
                            } else if (typeof value === 'number') {
                                rules[name][key] = value;
                                messages[name][key] = icon + '&nbsp;' + item.label + '输入字符数不符合';
                            } else if (typeof value === 'boolean') {
                                rules[name][key] = value;
                                messages[name][key] = icon + '&nbsp;' + item.label + '输入格式错误';
                            } else {
                                if (typeof value === 'function') value = [value];
                                if (typeof value[0] === 'function') {
                                    rules[name]['custom' + name + key] = value[2] ? value[2] : true;
                                    messages[name]['custom' + name + key] = icon + '&nbsp;' + value[1] || item.messages || item.placeholder;
                                    $.validator.addMethod('custom' + name + key, value[0], value[1] || '');
                                } else {
                                    if (key === 'equalTo') {
                                        rules[name][key] = '#custom-element-' + value[0];
                                    } else if (key === 'remote') {
                                        if (typeof value[0] === 'object') {
                                            rules[name][key] = {
                                                url: value[0].url,
                                                type: value[0].type || "post",
                                                dataType: value[0].dataType || "json",
                                                data: value[0].data || {},
                                                async: false,
                                                dataFilter: function (data, type) {
                                                    if (typeof data === 'string') data = JSON.parse(data);
                                                    if (typeof value[0].dataFilter === 'function') {
                                                        return value[0].dataFilter(data, type);
                                                    } else {
                                                        return data.result;
                                                    }
                                                }
                                            };
                                        } else {
                                            rules[name][key] = {
                                                url: value[0],
                                                type: "post",
                                                dataType: "json",
                                                data: {},
                                                async: false,
                                                dataFilter: function (data, type) {
                                                    if (typeof data === 'string') data = JSON.parse(data);
                                                    return data.result;
                                                }
                                            };
                                        }
                                    } else {
                                        rules[name][key] = value[0];
                                    }
                                    messages[name][key] = icon + '&nbsp;' + value[1];
                                }
                            }
                        })
                    } else {
                        if (typeof item.required === 'string') {
                            rules[name] = 'required';
                            messages[name] = icon + '&nbsp;' + item.required;
                        } else if (item.required === true) {
                            rules[name] = 'required';
                            messages[name] = icon + '&nbsp;' + (item.messages || item.placeholder || item.label + '必须输入值');
                        } else if ($.isArray(item.required) && item.required[0] === true) {
                            rules[name] = 'required';
                            messages[name] = icon + '&nbsp;' + (item.required[1] || item.messages || item.placeholder || item.label + '必须输入值');
                        } else {
                        }
                    }
                }

                return {
                    rules: rules,
                    messages: messages
                }
            },
            hide: function () {     // diloag隐藏
                $(this.target).modal('hide');
            },
            show: function (data) {         // dialog显示
                var _This = this;

                if (data) {         // 数据渲染前对数据进行处理
                    data = _This.filterRenderData(data);
                } else {
                    data = {};
                }

                if (this.dataUrl) {     // 默认添加ID项
                    this.form.unshift({
                        type: 'hidden',
                        name: 'id'
                    })
                }

                $(this.target).off('show.bs.modal').on('show.bs.modal', function () {
                    setTimeout(function () {
                        _This.showModalContent(data);
                    }, 0);
                });

                $(this.target).modal({
                    show: true,
                    keyboard: _This.keyboard || false
                })
            },
            showModalContent: function (data) {        // dialog显示渲染其内容
                var _This = this;
                var formTag = $('<form class="form-horizontal m-t"></form>');
                _This.target.find('.modal-body').append(formTag);

                $.each(_This.form, function (index, item) {
                    if (item.remove === true) return true;
                    if (!item.type) item.type = 'text';

                    var row = _This.createRow(item);
                    var value = _This.renderValue(item, data);

                    formTag.append(row);
                    item.type === 'hidden' && row.hide();

                    if (!_This.createElement[item.type]) return true;

                    var element = _This.createElement[item.type].call(_This, item, row, data, value) || {};
                    _This.form[index].el = item.el = element.el;
                    _This.form[index].input = item.input = element.input;

                    item.input && item.input.attr('name', item.name).attr('id', 'custom-element-' + item.name).attr('placeholder', item.placeholder);
                    item.css && item.el.css(item.css);
                    item.cls && item.el.addClass(item.cls);
                    typeof item.callback === 'function' && item.callback.call(_This, item.el, value, data);

                    if (item.bind) item.el.bind(item.bind);
                    if (item.hide === true) row.hide();
                });
                typeof _This.callback === 'function' && _This.callback.call(_This, formTag, data);
            },
            createRow: function (item) {          // 创建form里面的form-group
                var tip = item.tip ? '<span class="help-block m-b-none"><i class="fa fa-info-circle"></i>&nbsp;' + item.tip + '</span>' : '';
                var label = '<label class="col-sm-3 p-r-10 control-label">' + (item.required || item.validate && item.validate.required ? '<span class="text-danger">*&nbsp;</span>' : '') + (item.label ? item.label + ':' : '') + '</label><div class="col-sm-8 p-l-5 p-r-5">' + tip + '</div>';
                var row = '<div class="form-group">' + label + '</div>';
                return $(row);
            },
            createElement: {             // 创建form里的表单元素
                hidden: function (item, row, data, value) {        // 隐藏元素
                    var input = $common.createInput('hidden');
                    input.val(value);
                    row.find('.col-sm-8').prepend(input);
                    return {
                        el: input,
                        input: input,
                    }
                },
                readonly: function (item, row, data, value) {      // 只读元素
                    var hidden = $common.createInput('hidden');
                    var read = $('<div class="readonly"><div class="form-control read"></div></div>');
                    read.find('.read').html(value);
                    hidden.val(value);
                    row.find('.col-sm-8').prepend(read).append(hidden);
                    return {
                        el: read,
                        input: hidden,
                    }
                },
                text: function (item, row, data, value) {      // 输入表单
                    var input = $common.createInput('text');
                    input.val(value);
                    row.find('.col-sm-8').prepend(input);
                    return {
                        el: input,
                        input: input,
                    }
                },
                password: function (item, row, data, value) {      // 密码元素
                    var input = $common.createInput('password');
                    input.val(value);
                    row.find('.col-sm-8').prepend(input);
                    return {
                        el: input,
                        input: input,
                    }
                },
                radio: function (item, row, data, value) {     // 单选
                    var _This = this;
                    var hidden = $common.createInput('hidden');
                    var clearFix = $('<div class="clearfix"></div>');
                    if (typeof item.items === 'string') {
                        $common.request({
                            url: item.items,
                            success: function (data) {
                                renderRadios(data.result);
                            }
                        })
                    } else {
                        renderRadios(item.items);
                    }
                    hidden.val(value);
                    row.find('.col-sm-8').prepend(clearFix).append(hidden);

                    function renderRadios(items) {
                        clearFix.html('');
                        $.each(items, function () {
                            var radio = $('<div class="radio pull-left p-r-10"><label><input type="radio"><span></span></label></div>');
                            radio.find('input').attr('name', 'radio' + item.name).val(this.value);
                            radio.find('span').html(this.text);

                            clearFix.append(radio);
                            radio = radio.find('input');
                            if (!$common.isNull(value) && radio.val() === value.toString()) radio.prop('checked', true);
                        });

                        $(clearFix).find('input').bind('change', function () {
                            var radVal = $(this).val();
                            hidden.val(radVal);
                            typeof item.switchBack === 'function' && item.switchBack.call(_This, radVal, clearFix);
                        });
                    }

                    return {
                        el: clearFix,
                        input: hidden,
                    }
                },
                checkbox: function (item, row, data, value) {      // 多选
                    var _This = this;
                    var hidden = $common.createInput('hidden');
                    var clearFix = $('<div class="clearfix"></div>');

                    if (typeof item.items === 'string') {
                        $common.request({
                            url: item.items,
                            success: function (data) {
                                renderCheckbox(data.result);
                            }
                        })
                    } else {
                        renderCheckbox(item.items);
                    }

                    hidden.val(value);
                    row.find('.col-sm-8').prepend(clearFix).append(hidden);

                    function renderCheckbox(items) {
                        clearFix.html('');
                        $.each(items, function () {
                            var check = $('<div class="checkbox pull-left p-r-10"><label><input type="checkbox"><span></span></label></div>');
                            check.find('input').attr('name', 'checkbox' + item.name).val(this.value);
                            check.find('span').html(this.text);

                            clearFix.append(check);
                            check = check.find('input');

                            if (!$common.isNull(value)) {
                                if (typeof value === 'string') value = value.split(',');
                            } else {
                                value = [];
                            }

                            $.each(value, function (index) {
                                if (check.val() === value[index].toString()) {
                                    check.prop('checked', true);
                                }
                            })
                        });

                        $(clearFix).find('input').bind('change', function () {
                            var radVal = $(this).val();
                            var checkVal = [];
                            $.each($(clearFix).find("input"), function () {
                                if ($(this).prop("checked") === true) {
                                    checkVal.push($(this).val());
                                }
                            });
                            hidden.val(checkVal);
                            typeof item.switchBack === 'function' && item.switchBack.call(_This, radVal, clearFix, checkVal);
                        });
                    }

                    return {
                        el: clearFix,
                        input: hidden,
                    }
                },
                select: function (item, row, data, value) {        // 下拉选择
                    var _This = this;
                    var select = $common.createInput('select');
                    if (!item.itemField) {
                        item.itemField = {
                            text: 'text',
                            value: 'value'
                        }
                    }
                    if (typeof item.items === 'string') {
                        $common.request({
                            url: item.items,
                            data: {
                                type: item.name
                            },
                            success: function (data) {
                                // select.data('ajaxData', data);
                                renderSelect(data.result);
                            }
                        })
                    } else {
                        renderSelect(item.items);
                    }
                    row.find('.col-sm-8').prepend(select);

                    function renderSelect(items) {
                        select.append('<option value="">' + (item.placeholder || '请选择') + '</option>');
                        $.each(items, function () {
                            if (this.label) {
                                var group = $('<optgroup></optgroup>');
                                group.attr('label', this.label);
                                $.each(this.items, function () {
                                    group.append('<option value="' + this[item.itemField.value] + '">' + this[item.itemField.text] + '</option>');
                                });
                                select.append(group);
                            } else {
                                select.append('<option value="' + this[item.itemField.value] + '">' + this[item.itemField.text] + '</option>');
                            }
                        });

                        if (!$common.isNull(value)) {
                            if (select.find('option[value="' + value + '"]').length) {
                                select.val(value);
                            } else {
                                select.append('<option value="' + value + '">' + value + '</option>');
                                select.val(value);
                            }
                        }

                        $(select).bind('change', function () {
                            var radVal = $(this).val();
                            typeof item.switchBack === 'function' && item.switchBack.call(_This, radVal, select);
                        })
                    }

                    return {
                        el: select,
                        input: select,
                    }
                },
                number: function (item, row, data, value) {        // 数字
                    var input = $common.createInput('number');
                    input.val(value);
                    row.find('.col-sm-8').prepend(input);
                    return {
                        el: input,
                        input: input,
                    }
                },
                numArea: function (item, row, data, value) {         // 数字区间
                    var numArea = $('<div class="input-group"><input type="number" class="form-control"><span class="my-date-area">到</span><input type="number" class="form-control pull-right"></div>');
                    var hidden = $common.createInput('hidden');
                    var hiddenValue = [];
                    if (value) {
                        if (typeof value === 'string') value = value.split(',');
                    } else {
                        value = [];
                    }
                    $.each(numArea.find('input'), function (index) {
                        var val = $common.isNull(value[index]) ? '' : value[index];
                        $(this).val(val).attr('placeholder', item.placeholder && item.placeholder.length && item.placeholder[index] || '');
                        $(this).width(item.width || 175);
                        hiddenValue.push(val);
                    })
                    hidden.val(value);

                    numArea.find('input:eq(0)').bind('input propertychange keyup', function () {
                        var tVal = $(this).val();
                        var t1Val = numArea.find('input:eq(1)').val();
                        if (parseFloat(tVal) > parseFloat(t1Val)) {
                            $(this).val(t1Val);
                        }
                        hiddenValue[0] = $(this).val();
                        if ($common.isNull(hiddenValue[0]) && $common.isNull(hiddenValue[1])) hiddenValue = [];
                        hidden.val(hiddenValue);
                    })

                    numArea.find('input:eq(1)').bind('input propertychange keyup', function () {
                        var tVal = $(this).val();
                        var t0Val = numArea.find('input:eq(0)').val();
                        if (parseFloat(tVal) < parseFloat(t0Val)) {
                            $(this).val(t0Val);
                        }
                        hiddenValue[1] = $(this).val();
                        if ($common.isNull(hiddenValue[0]) && $common.isNull(hiddenValue[1])) hiddenValue = [];
                        hidden.val(hiddenValue);
                    })

                    row.find('.col-sm-8').prepend(numArea).append(hidden);
                    return {
                        el: numArea,
                        input: hidden,
                    }
                },
                textarea: function (item, row, data, value) {             // 文本输入
                    var textarea = $common.createInput('textarea');
                    textarea.val(value);
                    row.find('.col-sm-8').prepend(textarea);
                    return {
                        el: textarea,
                        input: textarea,
                    }
                },
                date: function (item, row, data, value) {          // 时间选择
                    var input = $common.createInput('text');
                    input.val($render.formatDate(value, item.format)).attr('readonly', true);
                    input.addClass('laydate-icon layer-date').attr('id', 'custom-element-' + item.name);
                    row.find('.col-sm-8').prepend(input);

                    require.async('laydate', function () {
                        laydate({
                            elem: '#custom-element-' + item.name,
                            event: 'click',
                            format: item.format || 'YYYY-MM-DD hh:mm:ss',
                            istime: item.format === 'YYYY-MM-DD' ? false : true,
                            choose: function (dates) {
                                typeof item.choose === 'function' && item.choose(dates);
                            }
                        });
                    })
                    return {
                        el: input,
                        input: input,
                    }
                },
                dateArea: function (item, row, data, value) {                  // 时间区域选择
                    var hiddenValue = [];
                    var dateArea = $('<div class="input-group"><input type="text" class="form-control" readonly=""><span class="my-date-area">到</span><input type="text" class="form-control pull-right" readonly=""></div>');
                    var hidden = $common.createInput('hidden');
                    if (value) {
                        if (typeof value === 'string') value = value.split(',');
                    } else {
                        value = [];
                    }
                    dateArea.find('input').width(175);
                    row.find('.col-sm-8').prepend(dateArea);
                    require.async('laydate', function () {
                        $.each(dateArea.find('input'), function (index) {
                            $(this).val($render.formatDate(value[index], item.format)).attr('id', item.name + (index === 0 ? 'from-date-start' : 'from-date-end')).attr('placeholder', item.placeholder && item.placeholder.length && item.placeholder[index] || '').addClass('laydate-icon layer-date');
                            hiddenValue.push($render.formatDate(value[index], item.format));
                        });
                        if (hiddenValue.join('')) hidden.val(hiddenValue);
                        dateArea.after(hidden);
                        var start = {
                            elem: '#' + item.name + 'from-date-start',
                            format: item.format || 'YYYY-MM-DD hh:mm:ss',
                            istime: item.format === 'YYYY-MM-DD' ? false : true,
                            max: $render.formatDate(value[1], item.format),
                            istoday: false,
                            choose: function (datas) {
                                end.min = datas;
                                end.start = datas;
                                hiddenValue[0] = datas;
                                if (!hiddenValue[0] && !hiddenValue[1]) hiddenValue = [];
                                hidden.val(hiddenValue);
                            },
                            dateClear: function () {
                                hiddenValue[0] = '';
                                if (!hiddenValue[0] && !hiddenValue[1]) hiddenValue = [];
                                hidden.val(hiddenValue);
                                end.min = '';
                                end.start = '';
                            }
                        };
                        var end = {
                            elem: '#' + item.name + 'from-date-end',
                            format: item.format || 'YYYY-MM-DD hh:mm:ss',
                            istime: item.format === 'YYYY-MM-DD' ? false : true,
                            min: $render.formatDate(value[0], item.format),
                            start: $render.formatDate(value[0], item.format),
                            istoday: false,
                            choose: function (datas) {
                                start.max = datas;
                                hiddenValue[1] = datas;
                                if (!hiddenValue[0] && !hiddenValue[1]) hiddenValue = [];
                                hidden.val(hiddenValue);
                            },
                            dateClear: function () {
                                hiddenValue[1] = '';
                                if (!hiddenValue[0] && !hiddenValue[1]) hiddenValue = [];
                                hidden.val(hiddenValue);
                                start.max = '';
                            }
                        };
                        laydate(start);
                        laydate(end);
                    });
                    return {
                        el: dateArea,
                        input: hidden,
                    }
                },
                linkage: function (item, row, data, value) {   // 联动选择
                    var clearFix = $('<div class="clearfix"></div>');
                    var hidden = $common.createInput('hidden');
                    var series = item.items.length;
                    var hiddenValue = typeof value === 'string' ? value.split(',') : value || [];
                    hidden.val(hiddenValue);

                    if (!value) {
                        requestSelect(0);
                    } else {
                        if (typeof value === 'string') value = value.split(',');
                        requestSelect(0, value)
                    }

                    row.find('.col-sm-8').prepend(clearFix);
                    clearFix.after(hidden);

                    function requestSelect(index, val, id, text) {
                        if (!val) val = [];
                        $common.request({
                            url: item.items[index],
                            data: {
                                value: index === 0 ? '' : id,
                                id: index === 0 ? '' : id,
                                text: index === 0 ? '' : text,
                                name: index === 0 ? '' : text
                            },
                            success: function (data) {
                                var renderValue = renderSelect(data.result, val[index], index);
                                if (val[index + 1]) {
                                    requestSelect(index + 1, val, renderValue.id, renderValue.text);
                                }
                            }
                        });
                    }

                    function renderSelect(items, val, index) {
                        var renderValue = {};
                        var select = $('<select class="form-control pull-left m-r-xxs" style="width: auto"></select>');
                        select.attr('index', index);
                        select.append('<option value="" text="">' + (item.placeholder[index] || '请选择') + '</option>');
                        $.each(items, function () {
                            this.value = !$common.isNull(this.value) ? this.value : this.id;
                            this.text = !$common.isNull(this.text) ? this.text : this.name;
                            select.append('<option value="' + this.value + '" text="' + this.text + '">' + this.text + '</option>');
                        });

                        clearFix.append(select);
                        index += 1;

                        if (!$common.isNull(val)) {
                            if (select.find('option[value="' + val + '"]').length) {
                                select.val(val);
                                renderValue.id = select.find('option[value="' + val + '"]').val();
                                renderValue.text = select.find('option[value="' + val + '"]').attr('text');
                            } else if (select.find('option[text="' + val + '"]').length) {
                                select.find('option[text="' + val + '"]').prop('selected', true);
                                renderValue.id = select.find('option[text="' + val + '"]').val();
                                renderValue.text = select.find('option[text="' + val + '"]').attr('text');
                            } else {
                                select.append('<option value="' + val + '" text="' + val + '">' + val + '</option>');
                                select.val(val);
                            }
                        }

                        select.bind('change', function () {
                            var id = $(this).val();
                            var text = $(this).find('option:selected').attr('text');
                            for (var i = index; i < series; i++) {
                                clearFix.find('select[index="' + i + '"]').remove();
                                hiddenValue.splice(i - 1, 1);
                            }
                            if (id || text) {
                                hiddenValue[index - 1] = item.text ? text : id;
                                if (index !== series) requestSelect(index, null, id, text);
                            } else {
                                hiddenValue.splice(index - 1, 1);
                            }
                            hidden.val(hiddenValue);
                            typeof item.switchBack === 'function' && item.switchBack.call(this, index, id, text);
                        });

                        return renderValue
                    }

                    return {
                        el: clearFix,
                        input: hidden
                    }
                },
                listSelect: function (item, row, data, value) {      // 自定义多选框
                    var hidden = $common.createInput('hidden');
                    var listShow = $('<div class="form-control form-list-select"></div>');
                    var wrap = $('<div class="wrap-list-select"><div class="content-list-select p-xs"></div><div class="text-right p-xs"><button type="button" class="btn btn-default btn-xs">取消</button><button type="button" class="btn btn-primary btn-xs m-l-sm">确认</button></div></div>')
                    // var hiddenValue = typeof value === 'string' ? value.split(',') : value || [];
                    var hiddenValue = [];
                    var itemsValue = [];
                    var oneDiv = $('<div class="one-div-select"><span class="one-span-select">' + (item.placeholder || '') + '</span></div>');
                    if (typeof value === 'string') {
                        hiddenValue = value.split(',');
                    } else {
                        if ($common.isNull(value)) {
                            hiddenValue = [];
                        } else {
                            $.each(value, function (key, val) {
                                if (typeof val === 'object') {
                                    hiddenValue.push(val[item.valueName] || val.id);
                                } else {
                                    hiddenValue.push(val);
                                }
                            })
                        }
                    }

                    listShow.prepend(oneDiv).append(wrap);
                    hidden.val(hiddenValue);

                    if (typeof item.items === 'string') {
                        $common.request({
                            url: item.items,
                            data: {
                                type: item.name
                            },
                            success: function (data) {
                                itemsValue = data.result;
                                renderSelect(itemsValue, hiddenValue);
                            }
                        })
                    } else {
                        itemsValue = item.items;
                        renderSelect(itemsValue, hiddenValue);
                    }

                    listShow.bind('click', function () {
                        $('.wrap-list-select').hide();
                        var tH = listShow.outerHeight();
                        listShow.addClass('panel-primary');
                        renderSelect(itemsValue, hiddenValue, 'click');
                        wrap.css('top', tH + 'px').show();
                    });

                    wrap.find('button.btn-default').bind('click', function (e) {
                        e.stopPropagation();
                        listShow.removeClass('panel-primary');
                        wrap.hide();
                    });

                    wrap.find('button.btn-primary').bind('click', function (e) {
                        e.stopPropagation();
                        var span = wrap.find('div.content-list-select span');
                        listShow.removeClass('panel-primary');
                        oneDiv.html('');
                        hiddenValue = [];
                        $.each(span, function () {
                            var sVal = $(this).attr('value');
                            var sText = $(this).text();
                            if ($(this).hasClass('label-primary')) {
                                hiddenValue.push(sVal || sText);
                                oneDiv.append('<span class="label">' + sText + '</span>');
                            }
                        });
                        if (!hiddenValue.length) oneDiv.html('<span class="one-span-select">' + (item.placeholder || '') + '</span>');
                        hidden.val(hiddenValue);
                        wrap.hide();
                    });

                    function renderSelect(items, value, type) {
                        if (type === 'click') wrap.find('div.content-list-select').html('');
                        $.each(items, function () {
                            var span = $('<span class="label"></span>');
                            var text = this.text;
                            var attrValue = this.value;
                            span.html(text).attr('value', attrValue);
                            $.each(value, function (key, val) {
                                if (attrValue === val || text === val) {
                                    span.addClass('label-primary').prepend('<i class="fa fa-check"></i> ');
                                    if (type !== 'click') {
                                        oneDiv.find('span.one-span-select').remove();
                                        oneDiv.append('<span class="label">' + text + '</span>');
                                    }
                                    return false;
                                }
                            });
                            wrap.find('div.content-list-select').append(span);

                            span.bind('click', function (e) {
                                e.stopPropagation();
                                if ($(this).hasClass('label-primary')) {
                                    $(this).removeClass('label-primary').find('i').remove();
                                } else {
                                    $(this).addClass('label-primary').prepend('<i class="fa fa-check"></i> ');
                                }
                            })
                        })
                    }

                    row.find('.col-sm-8').prepend(listShow).append(hidden);
                    return {
                        el: listShow,
                        input: hidden,
                    }
                },
                price: function (item, row, data, value) {         // 金额输入
                    var input = $common.createInput('number');
                    var priceShow = $('<div class="form-control"></div>');
                    input.val(value);
                    if (!$common.isNull(value)) {
                        priceShow.html($render.formatPrice(value));
                    } else {
                        priceShow.html(item.placeholder || '').addClass('color9');
                    }

                    row.find('.col-sm-8').prepend(input).prepend(priceShow);
                    input.hide();
                    input.bind({
                        'blur': function () {
                            var pVal = '';
                            var html = item.placeholder || '';
                            if (!$common.isNull($(this).val())) {
                                pVal = Math.round(parseFloat($(this).val()) * 100);
                                html = $render.formatPrice(pVal);
                                priceShow.removeClass('color9');
                            } else {
                                priceShow.addClass('color9');
                            }
                            $(this).hide().val(pVal);
                            priceShow.show().html(html);
                        },
                        'input propertychange keyup': function (e) {
                            e.stopPropagation();
                            var pVal = $(this).val().replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
                            $(this).val(pVal);
                        }
                    });

                    priceShow.bind('click', function () {
                        var iVal = $common.isNull(input.val()) ? '' : parseFloat(parseFloat(parseInt(input.val()) / 100).toFixed(2));
                        $(this).hide();
                        input.val(iVal).show().focus();
                    });
                    return {
                        el: input,
                        input: input,
                    }
                },
                priceArea: function (item, row, data, value) {         // 金额区间输入
                    var priceArea = $('<div class="input-group"><input type="number" class="form-control inputPrice0"><div class="form-control"></div><span class="my-date-area">到</span><input type="number" class="form-control pull-right inputPrice1"><div class="form-control pull-right"></div></div>');
                    var hidden = $common.createInput('hidden');
                    var hiddenValue = [];
                    if (value) {
                        if (typeof value === 'string') value = value.split(',');
                    } else {
                        value = [];
                    }

                    $.each(priceArea.find('input'), function (index) {
                        var val = $common.isNull(value[index]) ? '' : value[index];
                        $(this).val(val).attr('placeholder', item.placeholder && item.placeholder.length && item.placeholder[index] || '');
                        $(this).width(item.width || 175);
                        hiddenValue.push(val);
                        $(this).hide();
                    });
                    $.each(priceArea.find('div.form-control'), function (index) {
                        var html = item.placeholder && item.placeholder[index] || '';
                        if (!$common.isNull(value[index])) {
                            html = $render.formatPrice(value[index]);
                        } else {
                            $(this).addClass('color9');
                        }
                        $(this).html(html);
                        $(this).width(item.width || 175);
                    });
                    hidden.val(value);

                    row.find('.col-sm-8').prepend(priceArea).append(hidden);

                    priceArea.find('input.inputPrice0').bind({
                        'blur': function () {
                            var pVal = '';
                            var html = item.placeholder && item.placeholder[0] || '';
                            if (!$common.isNull($(this).val())) {
                                pVal = Math.round(parseFloat($(this).val()) * 100);
                                html = $render.formatPrice(pVal);
                                $(this).next('div.form-control').removeClass('color9');
                            } else {
                                $(this).next('div.form-control').addClass('color9');
                            }
                            $(this).hide().val(pVal).next('div.form-control').show().html(html);
                            hiddenValue[0] = pVal;
                            if ($common.isNull(hiddenValue[0]) && $common.isNull(hiddenValue[1])) hiddenValue = [];
                            hidden.val(hiddenValue);
                        },
                        'input propertychange keyup': function (e) {
                            e.stopPropagation();
                            var p1Val = parseFloat(parseInt(priceArea.find('input.inputPrice1').val() || 0) / 100);
                            var pVal = $(this).val().replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
                            if (pVal > p1Val) {
                                $(this).val(p1Val.toFixed(2));
                            } else {
                                $(this).val(pVal);
                            }
                        }
                    });

                    priceArea.find('input.inputPrice1').bind({
                        'blur': function () {
                            var pVal = '';
                            var html = item.placeholder && item.placeholder[1] || '';
                            if (!$common.isNull($(this).val())) {
                                pVal = Math.round(parseFloat($(this).val()) * 100);
                                html = $render.formatPrice(pVal);
                                $(this).next('div.form-control').removeClass('color9');
                            } else {
                                $(this).next('div.form-control').addClass('color9');
                            }
                            $(this).hide().val(pVal).next('div.form-control').show().html(html);
                            hiddenValue[1] = pVal;
                            if ($common.isNull(hiddenValue[0]) && $common.isNull(hiddenValue[1])) hiddenValue = [];
                            hidden.val(hiddenValue);
                        },
                        'input propertychange keyup': function (e) {
                            e.stopPropagation();
                            var p0Val = parseFloat(parseInt(priceArea.find('input.inputPrice0').val() || 0) / 100);
                            var pVal = $(this).val().replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
                            if (pVal < p0Val) {
                                $(this).val(p0Val.toFixed(2));
                            } else {
                                $(this).val(pVal);
                            }
                        }
                    });

                    priceArea.find('div.form-control').bind('click', function () {
                        var iVal = $common.isNull($(this).prev('input').val()) ? '' : parseFloat(parseFloat(parseInt($(this).prev('input').val()) / 100).toFixed(2));
                        $(this).hide();
                        $(this).prev('input').val(iVal).show().focus();
                    });

                    return {
                        el: priceArea,
                        input: hidden,
                    }
                },
                uploadImage: function (item, row, data, value) {            // 图片上传
                    var hidden = $common.createInput('hidden');
                    require.async('./webupload', function ($Webupload) {
                        new $Webupload({
                            row: row,
                            item: item,
                            value: value,
                            hidden: hidden
                        })
                    });
                    return {
                        el: hidden,
                        input: hidden,
                    }
                },
                uploadFile: function (item, row, data, value) {            // 文件上传
                    var hidden = $common.createInput('hidden');
                    require.async('./webupload', function ($Webupload) {
                        new $Webupload({
                            row: row,
                            item: item,
                            value: value,
                            hidden: hidden
                        })
                    });
                    return {
                        el: hidden,
                        input: hidden,
                    }
                },
                uEditor: function (item, row, data, value) {       // 文本编辑器
                    var hidden = $common.createInput('hidden');
                    require.async('./ueditor', function ($Ueditor) {
                        new $Ueditor({
                            row: row,
                            item: item,
                            value: value,
                            hidden: hidden
                        })
                    });
                    return {
                        el: hidden,
                        input: hidden,
                    }
                },
                htmlElement: function (item, row) {       // 自定义html
                    var clearFix = $('<div class="clearfix"></div>');
                    item.css && clearFix.css(item.css);
                    item.cls && clearFix.addClass(item.cls);
                    if (item.label || item.label === '') {
                        row.find('.col-sm-8').prepend(clearFix);
                    } else {
                        row.html(clearFix)
                    }
                    return {
                        el: clearFix,
                    }
                },
                actTable: function (item, row, data, value) {           // 动态表格添加
                    var _This = this;
                    var clearFix = $('<div class="clearfix"></div>');
                    var iBox = $('<div class="ibox actTable"><div class="ibox-title clearfix"><button type="button" class="btn btn-w-m btn-primary btn-sm"><i class="fa fa-plus m-r-xs"></i><span></span></button></div><div class="ibox-content" style="padding: 0 20px"><table class="table" style="margin-bottom: 0"><thead></thead><tbody></tbody></table></div></div>');
                    var tbody = iBox.find('table tbody');
                    var selectUrl = {};
                    var indexKey = 0;
                    iBox.attr('data-name', item.name);
                    iBox.find('button.btn span').html(item.label);
                    clearFix.append(iBox);
                    value && value.length && $.each(value, function (key, val) {
                        indexKey++;
                        renderTr(val);
                    })

                    iBox.find('button.btn').bind('click', function () {
                        indexKey++;
                        renderTr();
                    });

                    function renderTr(value) {
                        var trLength = tbody.find('tr').length;
                        if (!trLength) {
                            var thead = '<tr>';
                            item.items && item.items.length && $.each(item.items, function (key, val) {
                                thead += '<th width="' + (val.width || '') + '">' + (val.label || '') + '</th>';
                            });
                            thead += '<th width="50">操作</th></tr>';
                            iBox.find('table thead').html(thead);
                        }

                        var tr = $('<tr></tr>');
                        item.items && item.items.length && $.each(item.items, function (key, val) {
                            var td = $('<td></td>');
                            var inputValue = _This.renderValue(val, value) || '';
                            var input = _This.createActTableElement[val.type].call(_This, val, inputValue, td, selectUrl);

                            input.attr('name', item.name + val.name + indexKey + key).attr('placeholder', val.placeholder).attr('data-upload', 'hidden').attr('data-name', val.name).data('oneSelf', val);
                            tr.append(td);
                        });
                        tr.append('<td><a href="javascript: void(0)" class="text-close text-danger">删除</a></td>');
                        if (value && value[item.valueName]) {
                            var hidden = $('<input type="hidden" class="form-control" />');
                            hidden.val(value[item.valueName]).attr('data-name', item.valueName).attr('data-upload', 'hidden');
                            tr.find('a.text-close').after(hidden);
                        }
                        tbody.append(tr);

                        tr.find('a.text-close').bind('click', function () {
                            $(this).closest('tr').remove();
                            if (!tbody.find('tr').length) iBox.find('table thead').html('');
                        })
                    }

                    row.html(clearFix);

                    return {
                        el: clearFix,
                    }
                }
            },
            createActTableElement: {        // actTable创建元素
                text: function (item, value, td) {
                    var input = $common.createInput('text');
                    input.val(value);
                    td.html(input);
                    item.width && td.width(item.width);
                    return input;
                },
                number: function (item, value, td) {
                    var input = $common.createInput('number');
                    input.val(value);
                    td.html(input);
                    item.width && td.width(item.width);
                    return input;
                },
                select: function (item, value, td, selectUrl) {
                    var input = $common.createInput('select');
                    input.val(value);
                    if (typeof item.items === 'string') {
                        if (!selectUrl[item.items]) {
                            $common.request({
                                url: item.items,
                                data: {
                                    type: item.name
                                },
                                success: function (data) {
                                    input = renderSelect(data.result, input, value);
                                    selectUrl[item.items] = data.result;
                                }
                            })
                        } else {
                            input = renderSelect(selectUrl[item.items], input, value);
                        }
                    } else {
                        input = renderSelect(item.items, input, value);
                    }
                    td.html(input);
                    item.width && td.width(item.width);

                    function renderSelect(items, select, value) {
                        select.append('<option value="">' + (item.placeholder || '请选择') + '</option>');
                        $.each(items, function () {
                            if (this.label) {
                                var group = $('<optgroup></optgroup>');
                                group.attr('label', this.label);
                                $.each(this.items, function () {
                                    group.append('<option value="' + this.value + '">' + this.text + '</option>');
                                });
                                select.append(group);
                            } else {
                                this.value = !$common.isNull(this.value) ? this.value : this.id;
                                this.text = !$common.isNull(this.text) ? this.text : this.name;
                                select.append('<option value="' + this.value + '">' + this.text + '</option>');
                            }
                        });

                        if (!$common.isNull(value)) {
                            if (select.find('option[value="' + value + '"]').length) {
                                select.val(value);
                            } else {
                                select.append('<option value="' + value + '">' + value + '</option>');
                                select.val(value);
                            }
                        }
                        return select;
                    }

                    return input;
                },
                price: function (item, value, td) {
                    var input = $common.createInput('number');
                    var priceShow = $('<div class="form-control"></div>');
                    input.val(value);
                    if (!$common.isNull(value)) {
                        priceShow.html($render.formatPrice(value));
                    } else {
                        priceShow.html(item.placeholder || '').addClass('color9');
                    }

                    td.prepend(priceShow).append(input).width(item.width || 120);
                    input.hide();
                    input.bind({
                        'blur': function () {
                            var pVal = '';
                            var html = item.placeholder || '';
                            if (!$common.isNull($(this).val())) {
                                pVal = Math.round(parseFloat($(this).val()) * 100);
                                html = $render.formatPrice(pVal);
                                priceShow.removeClass('color9');
                            } else {
                                priceShow.addClass('color9');
                            }
                            $(this).hide().val(pVal);
                            priceShow.show().html(html);
                        },
                        'input propertychange keyup': function (e) {
                            e.stopPropagation();
                            var pVal = $(this).val().replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
                            $(this).val(pVal);
                        }
                    });

                    priceShow.bind('click', function () {
                        var iVal = $common.isNull(input.val()) ? '' : parseFloat(parseFloat(parseInt(input.val()) / 100).toFixed(2));
                        $(this).hide();
                        input.val(iVal).show().focus();
                    })
                    return input;
                },
                uploadImage: function (item, value, td) {            // 图片上传
                    var hidden = $common.createInput('hidden');
                    td.width(item.width || 105);
                    require.async('./webupload', function ($Webupload) {
                        new $Webupload({
                            td: td,
                            item: item,
                            value: value,
                            hidden: hidden,
                            itemType: 'actTableImage'
                        })
                    });
                    return hidden;
                },
                listSelect: function (item, value, td, selectUrl) {      // 自定义多选框
                    var hidden = $common.createInput('hidden');
                    var listShow = $('<div class="form-control form-list-select"></div>');
                    var wrap = $('<div class="wrap-list-select"><div class="content-list-select p-xs"></div><div class="text-right p-xs"><button type="button" class="btn btn-default btn-xs">取消</button><button type="button" class="btn btn-primary btn-xs m-l-sm">确认</button></div></div>');
                    var hiddenValue = [];
                    var itemsValue = [];
                    var oneDiv = $('<div class="one-div-select"><span class="one-span-select">' + (item.placeholder || '') + '</span></div>');
                    if (typeof value === 'string') {
                        hiddenValue = value.split(',');
                    } else {
                        if ($common.isNull(value)) {
                            hiddenValue = [];
                        } else {
                            $.each(value, function (key, val) {
                                if (typeof val === 'object') {
                                    hiddenValue.push(val[item.valueName] || val.id);
                                } else {
                                    hiddenValue.push(val);
                                }
                            })
                        }
                    }

                    listShow.prepend(oneDiv).append(wrap);
                    hidden.val(hiddenValue);

                    if (typeof item.items === 'string') {
                        if (!selectUrl[item.items]) {
                            $common.request({
                                url: item.items,
                                data: {
                                    type: item.name
                                },
                                success: function (data) {
                                    itemsValue = data.result;
                                    renderSelect(itemsValue, hiddenValue);
                                    selectUrl[item.items] = data.result;
                                }
                            })
                        } else {
                            itemsValue = selectUrl[item.items];
                            renderSelect(itemsValue, hiddenValue);
                        }
                    } else {
                        itemsValue = item.items;
                        renderSelect(itemsValue, hiddenValue);
                    }

                    listShow.bind('click', function () {
                        $('.wrap-list-select').hide();
                        var tH = listShow.outerHeight();
                        listShow.addClass('panel-primary');
                        renderSelect(itemsValue, hiddenValue, 'click');
                        wrap.css('top', tH + 'px').show();
                    });

                    wrap.find('button.btn-default').bind('click', function (e) {
                        e.stopPropagation();
                        listShow.removeClass('panel-primary');
                        wrap.hide();
                    });

                    wrap.find('button.btn-primary').bind('click', function (e) {
                        e.stopPropagation();
                        var span = wrap.find('div.content-list-select span');
                        listShow.removeClass('panel-primary');
                        oneDiv.html('');
                        hiddenValue = [];
                        $.each(span, function () {
                            var sVal = $(this).attr('value');
                            var sText = $(this).text();
                            if ($(this).hasClass('label-primary')) {
                                hiddenValue.push(sVal || sText);
                                oneDiv.append('<span class="label">' + sText + '</span>');
                            }
                        });
                        if (!hiddenValue.length) oneDiv.html('<span class="one-span-select">' + (item.placeholder || '') + '</span>');
                        hidden.val(hiddenValue);
                        wrap.hide();
                    });

                    function renderSelect(items, value, type) {
                        if (type === 'click') wrap.find('div.content-list-select').html('');
                        $.each(items, function () {
                            var span = $('<span class="label"></span>');
                            var text = this.text;
                            var attrValue = this.value;
                            span.html(text).attr('value', attrValue);
                            $.each(value, function (key, val) {
                                if (attrValue === val || text === val) {
                                    span.addClass('label-primary').prepend('<i class="fa fa-check"></i> ');
                                    if (type !== 'click') {
                                        oneDiv.find('span.one-span-select').remove();
                                        oneDiv.append('<span class="label">' + text + '</span>');
                                    }
                                    return false;
                                }
                            });
                            wrap.find('div.content-list-select').append(span);

                            span.bind('click', function (e) {
                                e.stopPropagation();
                                if ($(this).hasClass('label-primary')) {
                                    $(this).removeClass('label-primary').find('i').remove();
                                } else {
                                    $(this).addClass('label-primary').prepend('<i class="fa fa-check"></i> ');
                                }
                            })
                        })
                    }

                    item.width && td.width(item.width);
                    td.html(listShow).append(hidden);
                    return hidden
                },
            },
            renderValue: function (item, data) {            // 表单元素的渲染的值，带点操作
                var name = item.name;
                if (data && !$.isEmptyObject(data)) {
                    if (name.indexOf('.') > 0) {
                        var nameArr = name.split('.');
                        var nameData = data;
                        var nameNew = '';
                        $.each(nameArr, function (index, value) {
                            if (!$common.isNull(nameData[value])) {
                                nameNew = nameData[value];
                                nameData = nameNew;
                            } else {
                                nameNew = '';
                                return false;
                            }
                            if (index === nameArr.length - 1) return false;
                        });
                        return nameNew;
                    } else {
                        return $common.isNull(data[name]) ? item.value : data[name];
                    }
                } else {
                    return item.value;
                }
            },
            getTarget: function () {
                return this.target;
            },
            setSaveUrl: function (url) {
                this.saveUrl = url;
            },
            setUpdateUrl: function (url) {
                this.updateUrl = url;
            },
            getValue: function (name, index) {
                var _This = this;
                if ($common.isNull(index)) index = _This.getIndex(name);
                var item = _This.form[index];
                var value = item.input && item.input.val();
                if (item.type === 'price') {
                    value = Math.round(parseInt(value || 0));
                } else if (item.type === 'actTable') {
                    value = [];
                    var tr = item.el.find('table tbody tr');
                    tr && tr.length && $.each(tr, function () {
                        var trJson = {};
                        var input = $(this).find('input, select');
                        $.each(input, function () {
                            var dataName = $(this).attr('data-name');
                            if (!dataName) return true;
                            trJson[dataName] = $(this).val();
                        });
                        value.push(trJson);
                    });
                    value = JSON.stringify(value);
                }
                return value;
            },
            get: function (name) {
                return this.target.find('*[name="' + name + '"]');
            },
            getIndex: function (name) {
                var _This = this;
                var index = 0;
                $.each(_This.form, function (key, item) {
                    if (name === item.name) {
                        index = key;
                        return false;
                    }
                });
                return index;
            },
            itemArea: function (name) {
                var index = this.getIndex(name);
                this.form[index].hide = false;
                return this.form[index].el.closest(".form-group");
            },
            groupShow: function (name) {
                var index = this.getIndex(name);
                this.form[index].hide = false;
                this.form[index].el.closest(".form-group").show();
            },
            groupHide: function (name) {
                var index = this.getIndex(name);
                this.form[index].hide = true;
                this.form[index].el.closest(".form-group").hide();
            }
        });
        return Dialog;
    })();

    // function mergeAjaxData(newData, newArr, newVal, index) {      // 返回数据合并配置name带点字段
    //     if (!newData[newArr[index]]) {
    //         if (isNaN(newArr[index + 1])) {
    //             newData[newArr[index]] = {};
    //         } else {
    //             newData[newArr[index]] = [];
    //         }
    //     }
    //     if (newArr.length === index + 1) {
    //         newData[newArr[index]] = newVal;
    //     } else {
    //         newData[newArr[index]] = mergeAjaxData(newData[newArr[index]], newArr, newVal, index + 1);
    //     }
    //     return newData;
    // };
})
