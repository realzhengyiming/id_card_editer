function previewConfig() {
    let templateData = getTemplate();
    let avatarColName = templateData.avatar.colName;
    let colList = [avatarColName]
    for (let textData of templateData.textList) {
        if (textData.colName == null || textData.colName === '') {
        } else {
            console.log(textData.colName);
            let textColName = textData.colName;
            colList.push(textColName);
        }
    }
    // 创建表格对象
    let table = document.createElement("table");
    table.id = "exampleTable";
    table.className = "mdui-table";
    let note = document.createElement("p")
    note.contnet = "预览需要准备的列名"
    let previewDiv = document.getElementById("preview");
    previewDiv.innerHTML = ""; // 清空父节点的所有子节点
    previewDiv.appendChild(table)
    // 虚拟数据
    let data = [];

    // 创建虚拟数据
    for (let i = 1; i <= 2; i++) { // 填充两行数据
        let rowData = {};
        for (let col of colList) {
            rowData[col] = col + "-" + i;
        }
        data.push(rowData);
    }

    // 创建表头行
    let headerRow = document.createElement("tr");
    for (let col of colList) {
        let th = document.createElement("th");
        th.textContent = col;
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);

    // 填充数据行
    for (let row of data) {
        let dataRow = document.createElement("tr");
        for (let col of colList) {
            let td = document.createElement("td");
            td.textContent = row[col];
            dataRow.appendChild(td);
        }
        table.appendChild(dataRow);
    }

}
