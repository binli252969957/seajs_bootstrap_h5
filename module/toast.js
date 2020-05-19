define(function (require, exports, module) {
    require('toastrcss');
    require('toastr');

    toastr.options = {
        "closeButton": true,
        "debug": false,
        "progressBar": true,
        "preventDuplicates": true,
        "positionClass": "toast-top-center",
        "showDuration": "400",
        "hideDuration": "1000",
        "timeOut": "3000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    module.exports = {
        success: function (msg) {
            toastr.clear();
            toastr.remove();
            toastr.success(msg || '', '成功');
        },
        info: function (msg) {
            toastr.clear();
            toastr.remove();
            toastr.info(msg || '', '信息');
        },
        warning: function (msg) {
            toastr.clear();
            toastr.remove();
            toastr.warning(msg || '', '警告');
        },
        error: function (msg) {
            toastr.clear();
            toastr.remove();
            toastr.error(msg || '', '错误');
        }
    }
})