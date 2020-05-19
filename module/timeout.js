define(function (require, exports, module) {
    require('md5');
    var $Dialog = require('./dialog');
    module.exports = {
        login: function (next) {
            return new $Dialog({
                title: '登录超时，请重新登录',
                target: '.content-modal-timeout',
                saveUrl: '/bgm/login.do',
                form: [{
                    label: '用户名',
                    placeholder: '请输入用户名',
                    required: true,
                    type: 'text',
                    name: 'loginName',
                    messages: '用户名不能为空'
                }, {
                    label: '密码',
                    placeholder: '请输入密码',
                    required: true,
                    type: 'password',
                    name: 'password',
                    messages: '密码不能为空'
                }],
                buttons: [{
                    text: '登录',
                    type: 'save'
                }],
                callback: function () {
                    sessionStorage.clear();
                    this.target.find('.my-modal-close').remove();
                },
                saveCallback: function () {
                    if (next) next();
                },
                filterSaveData: function (data) {
                    // 保存数据前对数据的处理
                    if (data.password) data.password = $.md5(data.password).toUpperCase();
                    return data;
                }
            })
        },
        updatePassword: function () {
            return new $Dialog({
                title: '修改密码',
                target: '.content-modal-updatePassword',
                saveUrl: '/bgm/bguser/update-password.do',
                form: [{
                    label: '旧密码',
                    placeholder: '请输入旧密码',
                    required: true,
                    type: 'text',
                    name: 'oldPassword'
                }, {
                    label: '新密码',
                    placeholder: '请输入新密码',
                    required: true,
                    type: 'password',
                    name: 'password'
                }, {
                    label: '确认密码',
                    placeholder: '请输入确认密码',
                    type: 'password',
                    name: 'newPassword',
                    validate: {
                        required: '请输入确认密码',
                        equalTo: ['password', '两次输入的密码不匹配']
                    }
                }],
                filterSaveData: function (data) {
                    data.oldPassword = $.md5(data.oldPassword).toUpperCase();
                    data.newPassword = $.md5(data.newPassword).toUpperCase();
                    return data;
                }
            })
        }
    }
})