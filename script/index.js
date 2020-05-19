define(function (require, exports, module) {
    require('../public/js/plugins/webuploader/webuploader.min')

    var uploader = WebUploader.create({
        // swf文件路径
        swf: '../public/js/plugins/webuploader/Uploader.swf',
        // 文件接收服务端。
        server: 'http://webuploader.duapp.com/server/fileupload.php',
        // 选择文件的按钮。可选。
        // 内部根据当前运行是创建，可能是input元素，也可能是flash.
        pick: '#picker',
        accept: {               // 指定接受哪些类型的文件
            title: 'Images',
            extensions: 'gif,jpg,jpeg,bmp,png',
            mimeTypes: 'image/*'
        },
        thumb: {    // 配置生成缩略图的选项。
            width: 180,
            height: 180,
            allowMagnify: false,        // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
            crop: true                  // 是否允许裁剪。
        },
        compress: false,                // 配置压缩的图片的选项。如果此选项为false, 则图片在上传前不进行压缩。
        auto: true,                     // 设置为 true 后，不需要手动调用上传，有文件选择即开始上传
        chunked: true,                  // 是否要分片处理大文件上传。
        // chunkSize: 5242880,          // 如果要分片，分多大一片？ 默认大小为5M.
        // chunkRetry: 3,                  // 如果某个分片由于网络问题出错，允许自动重传多少次？
        formData: {},                   //文件上传请求的参数表，每次发送都会发送此对象中的参数。
//    	    threads: 3,// 上传并发数。允许同时最大上传进程数。
//    	    fileVal: 'file',// 设置文件上传域的name。
//    	    method: 'POST',//文件上传方式，POST或者GET。
//    	    sendAsBinary: 'flash',//是否已二进制的流的方式发送文件，这样整个上传内容php://input都为文件内容， 其他参数在$_GET数组中。
//    	    fileNumLimit: undefined,// 验证文件总数量, 超出则不允许加入队列。
//    	    fileSizeLimit: undefined,//  验证文件总大小是否超出限制, 超出则不允许加入队列。
//         fileSingleSizeLimit: config.fileSingleSizeLimit,//  验证单个文件大小是否超出限制, 超出则不允许加入队列。
//    	    disableWidgets: undefined,//  {String, Array} 默认所有 Uploader.register 了的 widget 都会被加载，如果禁用某一部分，请通
    });

    $(document).ready(function () {
        WinMove();

        function WinMove() {
            var element = "[class*=col]";
            var handle = ".ibox-title";
            var connect = "[class*=col]";
            $(element).sortable({
                handle: handle,
                connectWith: connect,
                tolerance: 'pointer',
                forcePlaceholderSize: true,
                opacity: 0.8,
            }).disableSelection();
        };
    });
})