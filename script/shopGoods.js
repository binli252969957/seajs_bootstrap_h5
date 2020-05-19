define(function (require, exports, module) {
    var $render = require('../module/render');
    var $Page = require('../module/page');
    var $Dialog = require('../module/dialog');

    var page = new $Page({
        // crumb: [{           // 配置面包屑
        //     text: '会员管理',
        //     url: '/bgm/member/manage.html'
        // }, '余额管理'],
        toolBar: ['add', {
            name: '动态表格添加输入框',
            click: function () {
                repeatDialog();
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
            name: ['startDate', 'endDate'],
            format: 'YYYY-MM-DD hh:mm:ss'
        }],
        table: {
            url: '../json/table.json',           //请求数据的链接默认list.json
            callback: function () {                 //表格渲染后回调
            },
            filterSendData: function (data) {        //表格提交数据进行过滤
                return data;
            },
            columns: [{
                sTitle: 'id',           //列标题
                mData: "id",            //对应字段,可以有点操作
                bSortable: true,        //是否排序。默认不排序
                sWidth: 80,              //列宽,支持数字和百分比
                visible: true          // 是否隐藏此列（true不隐藏false隐藏）
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
                mRender: $render.renderDateTime
            }, {
                sTitle: '简介',
                mData: "intro",
                sWidth: '160',
                ellipsis: 2             //缩略成几行显示。此属性必须和sWidth同用, 当值为1的时候,sWidth的值不能为百分数
            }, {
                sTitle: '操作',
                sWidth: '250',
                mData: "id",
                buttons: ['edit', {
                    text: '自定义',
                    cls: 'btn-warning',
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
                    type: 'dropdown',
                    mData: 'state',  // 对应返回值的按钮状态，支持点操作。 如果状态值等于items里面的data值，则按钮显示items对应的text值
                    cls: '',
                    itemClick: function (el, data, full) {
                        console.log(el, data, full);
                    },
                    items: [{
                        text: '开',
                        data: 'on',
                        btnCls: 'btn-primary',
                        onclick: function (el, data, full) {
                            console.log(el, data, full);
                            page.fnDraw(true);  // 刷新table表,参数true局部刷新,false整个页面刷新
                        }
                    }, {
                        text: '关',
                        data: 'off',
                        btnCls: 'btn-danger',
                        onclick: function (el, data, full) {
                            console.log(el, data, full);
                        }
                    }]
                }, 'delete']
            }]
        },
        dialog: {
            // dataType: 'form',           // 提交数据类型，form: 为FormData形式，json: 为json形式(默认)
            dataUrl: '../json/dialog.json',           //请求数据url默认data.json
            // saveUrl: 'save.do',     //保存链接默认save.do
            // updateUrl: 'update.do', //更新链接默认save.do
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
                    name: 'text.name',
                    value: '2c939c42642ba12c01642bb5fdd9001a',
                    tip: '静态提示',
                    messages: 'text输入框不能为空'     // 验证提示，如果messages没值提示为placeholder的值,都没值提示为label字段的值不能为空
                }, {
                    label: 'password密码',
                    placeholder: '请输入你的密码',
                    type: 'password',
                    name: 'password',
                    // 验证字段，支持配置['required', 'email', 'url', 'date', 'dateISO', 'number', 'digits', 'creditcard', 'maxlength', 'minlength', 'max', 'min'];
                    //          对应规则['必须', '电子邮件', '输入网址', '日期', '输入日期', '输入数字', '整数', '信用卡号', '字符串最大长度', '最小长度', '不能大于', '不能小于']
                    // 'maxlength', 'minlength', 'max', 'min'支持配置数字和数组 其余的支持配置字符串,boolean,数组。 数组第一个值为是否验证，第二个值为提示字段
                    // 具体可配置的规则字段查看https://www.runoob.com/jquery/jquery-plugin-validate.html
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
                        // console.log(value, el);
                        if (value == 2) {
                            this.groupShow('password');             // 输入组显示隐藏，用此方法隐藏的组的字段不会提交
                            // this.itemArea('password').show();    // 输入组显示隐藏，用此方法隐藏的组的字段会提交
                        } else {
                            this.groupHide('password');
                            // this.itemArea('password').hide();
                        }
                    },
                    value: 2,
                    items: [{
                        text: '密码区域隐藏',
                        value: 1
                    }, {
                        text: '密码区域显示',
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
                    // text: false,  // 联动选择提交的值是用value,还是text。默认是value
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
                    itemField: {        // 修改select中option中的value和text对应的返回字段
                        text: 'text',
                        value: 'value'
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
                    label: 'numArea数字区间',
                    placeholder: ['请输入最小值', '请输入最大值'],
                    // required: true,
                    type: 'numArea',
                    name: 'numArea',
                    value: [1, 2],
                }, {
                    label: 'textarea文本',
                    placeholder: '请输入你的文本',
                    required: true,
                    type: 'textarea',
                    name: 'textarea.0.content',
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
                    value: 1024               // 货币的单位是分，提交的数据也是分为单位
                }, {
                    label: 'price金钱区间',
                    placeholder: ['请输入最小金额', '请输入最大金额'],
                    type: 'priceArea',
                    name: 'priceArea',
                    required: true,
                    value: [1024, 4024]
                }, {
                    label: 'uploadImage传图片',
                    type: 'uploadImage',
                    name: 'uploadImage',
                    required: true,
                    // server: 'upload.do',    // 文件上传到的服务器地址，默认为/sfile/upload.do
                    multiple: true,         // 是否支持同时上传多个文件，默认false
                    value: [{
                        id: 1,
                        url: '../public/img/profile_small.jpg'
                    }],
                    options: { // 这里可以配置http://fex.baidu.com/webuploader/里面的api（除accept和pick这两个api不能再配置）
                        // fileSingleSizeLimit: 5 * 1024 * 1024    // 验证单个文件大小是否超出限制, 超出则不允许加入队列
                    }
                }, {
                    label: 'uploadFile传文件',
                    type: 'uploadFile',
                    name: 'uploadFile',
                    required: true,
                    // server: 'upload.do',     // 文件上传到的服务器地址，默认为/sfile/upload.do
                    multiple: true,            // 是否支持同时上传多个文件，默认false
                    value: [{
                        id: 1,
                        fileName: '文件名文件名'
                    }],
                    options: { // 这里可以配置http://fex.baidu.com/webuploader/里面的api（accept和pick这两个api不能再配置了）
                        // extensions: '*',  // （可选）过滤的文件后缀，多个逗号隔开，需要与mimeTypes配合 默认（xls,xlsx）
                        // mimeTypes: '*/*', // （可选）默认过滤的文件类型，多个逗号隔开，需要与mimeTypes配合 默认application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
                    }
                }, {
                    label: 'listSelect多选',
                    placeholder: '请选择数据',
                    type: 'listSelect',
                    name: 'listSelect',
                    required: true,
                    value: ['4028808a64df9f7b0164dfa4ba1b0002', '2c939c426458fcd301645dace70b0008', '4028808a64df9f7b0164dfa552c20005'],
                    // valueName: 'id',  // 如果value是数组对象，编辑渲染时取对象里的某个字段
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
                }, //  {
                //     label: 'uEditor编辑器',
                //     type: 'uEditor',
                //     name: 'content.html',
                //     required: true,
                //     value: '12312312',
                //     // server: 'upload.do',     // 图片上传到的服务器地址，默认为/sfile/upload.do
                //     options: {          // 这里可以配置http://fex.baidu.com/ueditor/#start-config里面的字段

                //     }
                // }, 
                {
                    label: 'htmlElement元素',
                    type: 'htmlElement',
                    name: 'htmlElement',
                    callback: function (el, value) {
                        el.html('htmlElement自定义html');
                        console.log(el, value);
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

    function repeatDialog() {
        var form = [{
            label: 'readonly显示框',
            placeholder: '请输入你的内容',
            type: 'readonly',
            name: 'readonly',
            value: '静态显示内容静态显示内容静态显示',
        }, {
            label: 'text输入框自定义验证规则',
            placeholder: '请输入你的内容',
            validate: {
                required: 'text输入框不能为空',
                custom: [function (value, element, params) {// 自定义的规则(字段名可以随机命名，但值必须是一个函数或者数组且数组的第一个值是函数)，value输入的值，element输入的元素，params是数组的第三个值,默认是true,可以自定义任意配置
                    // console.log(value, element, params);
                    if (isNaN(value)) return false;
                    return true;
                }, '必须是一个数字类型', true],
            },
            type: 'text',
            name: 'text',
            value: '',
            tip: '静态提示',
        }, {
            label: 'uploadImage传图片',
            type: 'uploadImage',
            name: 'uploadImage',
            required: true,
            // server: 'upload.do', // 文件上传到的服务器地址，默认为/sfile/upload.do
            multiple: true,         // 是否支持同时上传多个文件，默认false
            style: 'imageText',     // 图片排列样式 imageText图文详情
            value: [{
                id: 1,
                url: '../public/img/profile_small.jpg'
            }],
        }, {
            label: 'actTable输入框添加',
            type: 'actTable',
            name: 'actTable',
            valueName: 'id',        // 编辑渲染时取对象里的某个字段提交
            // jsonType: true,      // 上传的数据格式， 默认为false
            items: [{               // type暂时只能配置text,number,select,listSelect,uploadImage
                label: '输入',
                placeholder: '输入',
                required: true,     // 验证配置和form一样
                type: 'text',
                name: 'actText',
            }, {
                label: '选择',
                placeholder: '请选择',
                required: true,
                type: 'select',
                name: 'actSelect',
                width: 140,
                // items: '../json/select.json',
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
                }]
            }, {
                label: '数字',
                placeholder: '数字',
                required: true,
                type: 'number',
                name: 'actNumber'
            }, {
                label: '金钱',
                placeholder: '金钱',
                required: true,
                type: 'price',
                name: 'actPrice',
            }, {
                label: '图片',
                type: 'uploadImage',
                name: 'actImage',
                required: true,
                // server: 'upload.do',
            }, {
                label: 'listSelect多选',
                placeholder: '请选择数据',
                type: 'listSelect',
                name: 'listSelect',
                required: true,
                value: ['4028808a64df9f7b0164dfa4ba1b0002', '2c939c426458fcd301645dace70b0008', '4028808a64df9f7b0164dfa552c20005'],
                // valueName: 'id',  // 如果value是数组对象，编辑渲染时取对象里的某个字段
                // items: '../json/list-select.json',
                width: 320,
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
            }]
        }];
        new $Dialog({
            // dataType: 'form',           // 提交数据类型，form: 为FormData形式，json: 为json形式(默认)
            title: '新的dialog',
            table: page.table,//绑定的table
            target: '.content-modal',//弹窗class
            // dataUrl: '../json/dialog.json',//请求数据url
            saveUrl: 'save.do',//保存链接
            updateUrl: 'update.do',//更新链接
            data: {//请求dataUrl时要传的数据
                // id: id || ''
            },
            form: form,//表单配置
            width: 1000,
            buttons: [{
                text: '额外',
                cls: 'btn-primary',
                callback: function () {
                    console.log(111)
                }
            }, {
                text: '取消',
                type: 'cancel'
            }, {
                text: '保存',
                type: 'save'
            }],//按钮配置
            filterRenderData: function (data) {
                //编辑的时候对渲染数据进行处理
                return data;
            },
            filterSaveData: function (data) {
                console.log('对数据进行过滤');
                return data;
            },
            callback: function () {
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
        })
    }
})