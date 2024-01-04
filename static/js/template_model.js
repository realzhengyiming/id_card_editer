class TextData {
    constructor() {
        this.position = {left: 100, top: 120};
        this.content = "";
        this.fontSize = "20px";
        this.color = "#000000";
        this.fontFamily = "Arial";
        this.isTemplate = false;
        this.colName = "";
    }
}

class TemplateData {
    constructor() {
        this.background = {
            size: {width: 0, height: 0},
            imageUrl: "",
        };
        this.avatar = {
            imageUrl: "",
            size: {width: 0, height: 0},
            position: {left: 0, top: 0},
            rounded: false, // 是否圆角
            colName: "avatar", // 本地路径也是可以的吧
        };
        this.textList = []

    }
}

function getTemplate() {
    var templateData = new TemplateData()
    templateData.background.imageUrl = canvas.style.backgroundImage;
    templateData.background.size.width = canvas.offsetWidth;
    templateData.background.size.height = canvas.offsetHeight;
    templateData.avatar.position = {
        left: avatarContainer.offsetLeft,
        top: avatarContainer.offsetTop
    };

    const computedStyle = getComputedStyle(avatar);
    const height = computedStyle.height;
    const width = computedStyle.width;

    let avatarHeight = avatar.style.height
    let avatarWidth = avatar.style.width
    if (avatarHeight === '') {
        avatarHeight = height;
    }
    if (avatarWidth === '') {
        avatarWidth = width;
    }
    templateData.avatar.size.height = avatarHeight;  // 高
    templateData.avatar.size.width = avatarWidth;  // 宽

    let avatarCol = document.getElementById("avatarCol")
    templateData.avatar.colName = avatarCol.value;  // 宽
    templateData.avatar.rounded = avatar.getAttribute("rounded") === "true";
    // 遍历和记录textlist 列表的数据

    children = canvas.children;
    for (let i = 0; i < children.length; i++) {
        if (children[i].className === "text-container") {
            let textDiv = children[i].children[0];
            let oneTextData = new TextData();
            oneTextData.fontSize = textDiv.style.fontSize;
            oneTextData.color = textDiv.style.color;
            oneTextData.isTemplate = JSON.parse(textDiv.getAttribute("istemplate")); // 转化为布尔值
            oneTextData.position.left = children[i].offsetLeft;
            oneTextData.position.top = children[i].offsetTop;
            oneTextData.fontFamily = textDiv.style.fontFamily;
            oneTextData.content = textDiv.content;
            oneTextData.colName = textDiv.getAttribute("colname");  // 对应的Colname 需要指定映射的
            // ps 确实可以，但是我要自动化，要方便批量的。
            templateData.textList.push(oneTextData);
            console.log(oneTextData);
        }
    }
    return templateData;
}

function saveTemplate() {
    // Collect all the data before saving
    let templateData = getTemplate();
    const templateJson = JSON.stringify(templateData);
    console.log(templateJson); // You can save this JSON data to a file, local storage, or a server
    const blob = new Blob([templateJson], {type: 'application/json'});
    const fileName = 'template.json';

    if (window.navigator.msSaveOrOpenBlob) {
        // For IE:
        window.navigator.msSaveOrOpenBlob(blob, fileName);
    } else {
        // For other browsers:
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

}


function exportTableToCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    const headers = Array.from(table.getElementsByTagName('th')).map(header => header.textContent);
    const rows = Array.from(table.getElementsByTagName('tr'));
    const csvContent = [headers.join(',')];

    rows.forEach(row => {
        const cells = Array.from(row.getElementsByTagName('td'));
        const rowData = cells.map(cell => cell.textContent).join(',');
        csvContent.push(rowData);
    });

    const csvString = csvContent.join('\n');
    const blob = new Blob([csvString], {type: 'text/csv;charset=utf-8;'});

    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename);
    } else {
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

