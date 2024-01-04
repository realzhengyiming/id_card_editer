//cookie 相关，用来减少重复上传
// 将变量保存到 Cookie 中
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}

// 从 Cookie 中读取变量
function getCookie(name) {
    const cookieName = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(cookieName) === 0) {
            return decodeURIComponent(cookie.substring(cookieName.length, cookie.length));
        }
    }
    return null;
}

let storeFolder = getCookie("storeFolder");
let storeFiles = []

function upload() {
    const input = document.getElementById('folderInput');
    const files = input.files;

    if (files.length > 0) {
        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append('files[]', files[i], files[i].name);
        }

        fetch('/upload_folder', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                storeFolder = data.storeFolder;
                storeFiles = data.storeFiles;
                setCookie("storeFolder", storeFolder, 1);
                alert('上传成功！请点击批量处理！');
            })
            .catch(error => console.error('Error:', error));
    } else {
        alert('No files selected!');
        console.info('No files selected.');
    }
}

function uploadFiles() {
    console.log("check storeFolder:", storeFolder)
    if (storeFolder === '') {
        upload();
    } else {
        // 确认一下需不需要重新上传
        let result = confirm("你确定要重新上传所有文件吗？");
        if (result) {
            upload();
            // 用户点击了“确定”按钮
            // 执行相应的操作
        } else {
            // 用户点击了“取消”按钮或关闭了对话框
            // 执行其他操作或不执行任何操作
        }
    }

}

