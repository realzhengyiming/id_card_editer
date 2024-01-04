function checkFileExtension(filenames) {
    let imageFlag = false;
    let excelFlag = false;
    let jsonFlag = false;

    for (const filename of filenames) {
        const extension = filename.split('.').pop().toLowerCase();
        // 图片后缀名数组
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        // Excel 后缀名数组
        const excelExtensions = ['xlsx', 'xls'];
        // JSON 后缀名数组
        const jsonExtensions = ['json'];

        // 检查文件后缀名是否在对应的数组中
        if (imageExtensions.includes(extension)) {
            imageFlag = true;
        } else if (excelExtensions.includes(extension)) {
            excelFlag = true;
        } else if (jsonExtensions.includes(extension)) {
            jsonFlag = true;
        } else {
        }
    }
    const flags = [imageFlag, excelFlag, jsonFlag];
    return flags.every(Boolean);   // 这几种文件都有的情况下才上传
}

//开始按照模版批量处理
//默认使用当前编辑中的模版
function sendBatchRequest(jsonData) {
    fetch('/batch_processing', {
        method: 'POST',
        body: JSON.stringify(jsonData),
        responseType: 'json',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(response => {
        if (!response.ok) {
            throw new Error('HTTP status ' + response.status + response.text());
        }
        return response;
    })
        .then(response => response.json())
        .then(data => {
            // data.storePath
            console.log(data);
            console.log(data.outputPath);
            console.log("接收文件成功");
            const link = document.createElement('a');
            // link.innerText = "点击此处下载！"
            let url = data.outputPath;
            link.download = '';
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        })
        .catch(error => {
            console.error('Error:', error);
            alert(error);
        });

}

function batchProcess() {
    console.log(storeFolder)
    const jsonData = {static_path: storeFolder};
    let batch_btn = document.getElementById('batch_btn');
    batch_btn.setAttribute("loading", "true");
    let btn_text = batch_btn.innerText;
    batch_btn.innerText = "Processing"

    if (storeFolder === '' || storeFolder == null) {
        alert("请先把1生成的配置文件xx.json；2所有头像图片；3映射关系excel表一次性上传好");
    } else {
        sendBatchRequest(jsonData); // 启动项目，发送storeFoler路径
    }
    batch_btn.removeAttribute("loading");
    batch_btn.innerText = btn_text;
}


