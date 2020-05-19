define(function (require, exports, module) {
    var $render = require('../module/render');
    var $Page = require('../module/page');

    var page = new $Page({
        toolBar: ['add', {
            name: '自定义按钮',
            click: function () {
                console.log('自定义按钮：click');
            }
        }, {
            name: '下拉按钮组',
            buttons: [{
                name: '下拉按钮一',
                click: function () {
                    console.log('下拉按钮一');
                }
            }, {
                name: '下拉按钮二',
                click: function () {
                    console.log('下拉按钮二');
                }
            }]
        }],
        search: ['searchKey', {
            placeholder: '下拉选择自定义项',
            type: 'select',
            name: 'select1',
            items: [{
                text: '显示值一',
                value: 'id1'
            }, {
                text: '显示值二',
                value: 'id2'
            }]
        }, {
            placeholder: '下拉选择请求项',
            type: 'select',
            name: 'select',
            items: '../json/select.json'
        }, {
            placeholder: '时间查询',
            type: 'date',
            name: 'date',
            format: 'YYYY-MM-DD hh:mm:ss'
        }, {
            placeholder: ['开始时间', '结束时间'],
            type: 'dateArea',
            name: 'dateArea',
            format: 'YYYY-MM-DD hh:mm:ss'
        }],
        table: {
            url: '../json/table.json',              //请求数据的链接
            callback: function () {                 //表格渲染后回调
            },
            filterSendData: function (data) {        //表格提交数据进行过滤
                return data;
            },
            columns: [{
                sTitle: 'id',           //列标题
                mData: "id",            //对应字段,可以有点操作
                bSortable: true,        //是否排序。默认不排序
                sWidth: 80              //列宽,支持数字和百分比
                /*mRender: function (data, type, full) {  // 自定义列的渲染函数，返回列的html片段，data：此列对应字段的值，type：列类型，full：本条记录完整的数据
                    return data;            //数据渲染
                }*/
            }, {
                sTitle: '头像',
                mData: "img",
                mRender: $render.renderImage
            }, {
                sTitle: '名称',
                mData: "name",
                bSortable: true
            }, {
                sTitle: '编号',
                mData: "number.name"
            }, {
                sTitle: '金额',
                mData: "price",
                mRender: $render.renderPrice
            }, {
                sTitle: '时间',
                mData: "date",
                mRender: $render.renderDate
            }, {
                sTitle: '简介',
                mData: "intro",
                sWidth: '160',
                ellipsis: 2             //缩略成几行显示。此属性必须和sWidth同用, 当值为1的时候,sWidth的值不能为百分数
            }, {
                sTitle: '操作',
                sWidth: '200',
                mData: "id",
                buttons: [{
                    text: '编辑',
                    cls: 'btn-success',
                    hide: function (config, data, full) {//是否隐藏按钮 config为配置，data为对应mData配置的字段，full为本条记录完整的数据
                        return full.hide;
                    },
                    editable: function (config, data, full) {//是否禁用按钮 config为配置，data为对应mData配置的字段，full为本条记录完整的数据
                        return full.editable;
                    },
                    onclick: function (el, data) {//按钮点击事件 el为此元素，data为对应mData配置的字段，full为本条记录完整的数据
                        page.editDialog(data);
                    }
                }, {
                    text: '删除',
                    cls: 'btn-danger',
                    onclick: function (el, data) {
                        page.confirmDelete(el, data)
                    }
                }, {
                    type: 'dropdown',
                    mData: 'state',  // 对应返回值的按钮状态，支持点操作。 如果状态值等于items里面的data值，则按钮显示items对应的text值
                    cls: '',
                    items: [{
                        text: '开',
                        data: 'on',
                        btnCls: 'btn-danger',
                        onclick: function (el, data, full) {
                            console.log(el, data, full);
                        }
                    }, {
                        text: '关',
                        data: 'off',
                        btnCls: 'btn-info',
                        onclick: function (el, data, full) {
                            console.log(el, data, full);
                        }
                    }]
                }]
            }]
        },
        dialog: {
            dataUrl: '../json/dialog.json',           //请求数据url
            form: function (status, id) { // 可以直接配置form的数组或是配置一个返回数组的函数，函数接收参数：status:窗口状态(有效值：add,edit,view)，id:实体id，如果是新增，则为空
                console.log(status, id);
                return [{
                    label: 'readonly显示框',
                    placeholder: '请输入你的内容',
                    type: 'readonly',
                    name: 'readonly',
                    value: '静态显示内容静态显示内容静态显示',
                }, {
                    label: 'text输入框',
                    placeholder: '请输入你的内容',
                    required: true,         // 是否必填
                    type: 'text',
                    name: 'deviceModel.deviceName',
                    value: '2c939c42642ba12c01642bb5fdd9001a',
                    tip: '静态提示',
                    messages: 'text输入框不能为空'     // 验证提示，如果messages没值提示为placeholder的值,都没值提示为label字段的值不能为空
                }, {
                    label: 'password密码',
                    placeholder: '请输入你的密码',
                    type: 'password',
                    name: 'password',
                    // 验证字段，支持配置['required', 'email', 'url', 'date', 'dateISO', 'number', 'digits', 'creditcard', 'maxlength', 'minlength', 'max', 'min'];
                    //          对应规则['必须输入值', '必须输入正确格式的电子邮件', '必须输入正确格式的网址', '必须输入正确格式的日期', '必须输入正确格式的日期', '必须输入合法的数字', '必须输入整数', '必须输入合法的信用卡号', '输入字符串最大长度', '输入字符串最小长度', '输入值不能大于', '输入值不能小于']
                    // 'maxlength', 'minlength', 'max', 'min'支持配置数字和数组 其余的支持配置字符串,boolean,数组。 数组第一个值为是否验证，第二个值为提示字段
                    validate: {
                        required: [true, '这个必须'],
                        minlength: 5,
                        maxlength: [10, '长度不能大于10']
                    }
                }, {
                    label: 'radio单选',
                    placeholder: '请选择一个单选',
                    required: true,
                    type: 'radio',
                    name: 'radio',
                    switchBack: function (value, el) {
                        console.log(value, el);
                    },
                    value: 2,
                    items: [{
                        text: '单选一',
                        value: 1
                    }, {
                        text: '单选二',
                        value: 2
                    }]
                }, {
                    label: 'checkbox多选',
                    placeholder: '请选择一个多选',
                    required: true,
                    type: 'checkbox',
                    name: 'checkbox',
                    value: [1, 2],
                    switchBack: function (value, el, values) {
                        console.log(value, el, values);
                    },
                    items: [{
                        text: '多选一',
                        value: 1
                    }, {
                        text: '多选二',
                        value: 2
                    }, {
                        text: '多选三',
                        value: 3
                    }]
                }, {
                    label: 'linkage联动选择',
                    type: 'linkage',
                    name: 'linkage',
                    required: true,
                    placeholder: ['请选择省份', '请选择城市', '请选择区域'],
                    value: [1, 3, 5],
                    items: ['../json/province.json', '../json/city.json', '../json/area.json'],
                    messages: '请选择至少选择一个省',
                    switchBack: function (index, id, text) {
                        console.log(this, index, id, text)
                    }
                }, {
                    label: 'select选择',
                    placeholder: '请选择一项',
                    type: 'select',
                    name: 'select',
                    required: true,
                    value: '2',
                    switchBack: function (value, el) {
                        console.log(value, el);
                    },
                    items: [{
                        label: '分组一',
                        items: [{
                            text: '分组选项一',
                            value: 1
                        }, {
                            text: '分组选项二',
                            value: 2
                        }]
                    }, {
                        text: '选项一',
                        value: 4
                    }, {
                        text: '选项二',
                        value: 5
                    }, {
                        text: '选项三',
                        value: 6
                    }]
                }, {
                    label: 'number数字',
                    placeholder: '请输入你的数字',
                    required: true,
                    type: 'number',
                    name: 'number',
                    value: 1
                }, {
                    label: 'textarea文本',
                    placeholder: '请输入你的文本',
                    required: true,
                    type: 'textarea',
                    name: 'textarea',
                    value: '这是我的文本'
                }, {
                    label: 'date时间选择',
                    placeholder: '请选择你的时间',
                    required: true,
                    type: 'date',
                    name: 'date',
                    format: 'YYYY-MM-DD hh:mm:ss',
                    value: 1552355475000
                }, {
                    label: 'dateArea时间区域',
                    required: true,
                    placeholder: ['开始时间', '结束时间'],
                    type: 'dateArea',
                    name: 'dateArea',
                    format: 'YYYY-MM-DD hh:mm:ss',
                    value: [1552355475000, 1552356475000]
                }, {
                    label: 'price金钱输入',
                    placeholder: '请输入金钱',
                    type: 'price',
                    name: 'price',
                    required: true,
                    value: 1020               // 货币的单位是分，提交的数据也是分为单位
                }, {
                    label: 'upload上传',
                    type: 'upload',
                    name: 'uploadImage',
                    required: true,
                    value: [{
                        id: 1,
                        downloadPath: '../public/img/profile_small.jpg'
                    }],
                    options: {
                        type: 'image',          // 上传的文件类型,image图片 file其它文件
                        server: 'upload.do',    // 文件上传到的服务器地址，默认为/sfile/upload.do
                        multiple: true,         // 是否支持同时上传多个文件，默认false
                        extensions: 'gif,jpg,jpeg,bmp,png',         // 上传的文件类型
                        mimeTypes: 'images/*'                       // （可选）默认过滤的文件类型，多个逗号隔开，需要与mimeTypes配合
                    }
                }, {
                    label: 'listSelect多选',
                    placeholder: '请选择数据',
                    type: 'listSelect',
                    name: 'listSelect',
                    required: true,
                    value: ['4028808a64df9f7b0164dfa4ba1b0002', '2c939c426458fcd301645dace70b0008', '4028808a64df9f7b0164dfa552c20005'],
                    // items: '../json/list-select.json',
                    items: [
                        {
                            "value": "2c939c426458fcd301645dace70b0008",
                            "text": "高压电位治疗仪"
                        },
                        {
                            "value": "4028808a64df9f7b0164dfa4ba1b0002",
                            "text": "9000V高压电位治疗仪"
                        },
                        {
                            "value": "4028808a64df9f7b0164dfa552c20005",
                            "text": "动态干扰电治疗仪"
                        },
                        {
                            "value": "4028808a64df9f7b0164",
                            "text": "动态干扰电治疗仪544444"
                        },
                        {
                            "value": "4028808",
                            "text": "动态干扰电治疗仪555555"
                        }
                    ]
                }, {
                    label: 'htmlElement元素',
                    type: 'htmlElement',
                    name: 'htmlElement',
                    callback: function (el, value, data) {
                        el.html('htmlElement自定义html');
                        console.log(el, value, data);
                    }
                }];
            },
            buttons: [{
                text: '取消',
                type: 'cancel'
            }, {
                text: '保存',
                type: 'save'
            }],
            filterRenderData: function (data) {
                //编辑的时候对渲染数据进行处理
                return data;
            },
            filterSaveData: function (data) {
                console.log('对数据进行过滤', data);
                return data;
            },
            callback: function (form, data) {
                console.log('弹窗后回调');
            },
            beforeSave: function () {
                console.log('保存前调用');
            },
            saveCallback: function () {
                console.log('保存后回调');
            },
            validate: function () {
                console.log('附加验证');
                return true;
            }
        }
    });
})