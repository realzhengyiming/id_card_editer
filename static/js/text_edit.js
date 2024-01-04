// 动态增加字符串
const addTextButton = document.getElementById('add-text-button');
const textListContainer = document.getElementById('text-list-container');
const textList = [];


addTextButton.addEventListener('click', function () {
    const read_canvas = document.getElementById('canvas'); // 多个绑定也是可以的
    const newText = createTextElement(read_canvas);
    textList.push(newText);
    textListContainer.appendChild(newText);
});

function createTextElement(canvas) {
    //canvas is div element
    const textElement = document.createElement('mdui-card');
    textElement.classList.add('text-item');
    // textElement.className = "bordered"  // 增加边框线条
    textElement.style.maxWidth = "250px";
    textElement.style.padding = "5px";

    const textContentInput = document.createElement('mdui-text-field');
    textContentInput.setAttribute('variant', "filled");
    textContentInput.setAttribute('label', '输入文字');

    textContentInput.setAttribute('type', 'text');
    textElement.appendChild(textContentInput);

    const textSizeInput = document.createElement('mdui-slider');
    textSizeInput.setAttribute('type', 'range');
    textSizeInput.setAttribute('min', '20');
    textSizeInput.setAttribute('max', '100');
    textSizeInput.setAttribute('value', '20');
    textElement.appendChild(textSizeInput);


    const label = document.createElement("mdui-tooltip");
    label.setAttribute("content", "选择文字颜色")

    const textColorInput = document.createElement('input');
    textColorInput.setAttribute('type', 'color');
    textColorInput.setAttribute('value', '#000000');
    label.appendChild(textColorInput)
    // textElement.appendChild(textColorInput);
    textElement.appendChild(label);


    // 设置对应的列，如果需要映射替换的话
    const subInputColName = document.createElement('mdui-text-field');
    textContentInput.setAttribute('variant', "filled");
    subInputColName.setAttribute('label', '输入对应表格映射的列名');
    // subInputColName.style.display = 'none';
    subInputColName.setAttribute('disabled', '')

    const checkbox = document.createElement('mdui-checkbox');
    checkbox.type = 'checkbox';
    checkbox.innerHTML = '是否是映射列？'
    // 设置 checkbox 的属性和事件处理程序
    checkbox.id = 'isTemplate';
    checkbox.name = 'isTemplate';
    checkbox.value = false;
    checkbox.checked = false; // 设置为选中状态

    const brDiv = document.createElement('br');
    textElement.appendChild(brDiv);
    // const label = document.createElement('label');
    // label.appendChild(checkbox)
    // label.appendChild(subInputColName);  // 各自有各自的乐趣，不就好了， 这有什么不好的呢！
    // textElement.appendChild(label);
    textElement.appendChild(checkbox)
    textElement.appendChild(subInputColName)


    const subText = document.createElement('div');
    subText.className = 'text';
    subText.setAttribute("isTemplate", false);

    checkbox.addEventListener('change', function () {
        if (checkbox.checked) {
            console.log('Checkbox is checked');
            subText.setAttribute("isTemplate", "true");
            // subInputColName.style.display = 'block';
            subInputColName.removeAttribute('disabled')

            subText.setAttribute("colName", subInputColName.value); // 改动了就顺便设置修改一下
        } else {
            console.log('Checkbox is unchecked');
            subText.setAttribute("isTemplate", false);
            // subInputColName.style.display = 'none';
            subInputColName.setAttribute('disabled', '')
            subInputColName.innerText = ""  // 也滞空
            subInputColName.textContent = ""
            subText.setAttribute("colName", ""); // 改动了就顺便设置修改一下

        }
    });
    subInputColName.addEventListener("change", function () {
        subText.setAttribute("colName", subInputColName.value); // 改动了就顺便设置修改一下
    });

    const subTextContainer = document.createElement('div');
    subTextContainer.className = 'text-container';
    subTextContainer.appendChild(subText)
    subTextContainer.addEventListener('mousedown', function (event) {
        event.preventDefault();
        let prevX = event.clientX;
        let prevY = event.clientY;
        document.addEventListener('mousemove', moveText);

        document.addEventListener('mouseup', function () {
            document.removeEventListener('mousemove', moveText);
        });

        function moveText(event) {
            const newX = subTextContainer.offsetLeft + (event.clientX - prevX);
            const newY = subTextContainer.offsetTop + (event.clientY - prevY);
            subTextContainer.style.left = `${newX}px`;
            subTextContainer.style.top = `${newY}px`;
            prevX = event.clientX;
            prevY = event.clientY;
        }
    });
    canvas.appendChild(subTextContainer)

    //动态创建给每一个字体设置字体的selector； todo 还需要增加一个删除这个dom和对象的功能
    const subFontSelector = document.createElement('mdui-select');  // 给这个元素创造一个 列表选择字体
    let loadedFonts = Array.from(document.fonts);
    loadedFonts.forEach(function (font) {
        let option = document.createElement("mdui-menu-item");
        if (font.family == "Material Icons") {
        } else {
            option.text = font.family;
            option.value = font.family;
            option.innerText = font.family;
            subFontSelector.appendChild(option);
        }


    });
    subFontSelector.value = loadedFonts[0].family; // 默认第一个选项为默认选项
    subText.style.fontFamily = loadedFonts[0].family; //  后续修改后再自动改变就可以
    subFontSelector.addEventListener("change", function (event) {
        let fontFamily = subFontSelector.value;
        subText.style.fontFamily = fontFamily;
    });
    textElement.appendChild(subFontSelector)  // 增加select选择器

    // canvas.appendChild(subText)
    textContentInput.addEventListener('input', function () {
        const subTextContent = event.target.value;
        subText.innerHTML = subTextContent;
    });

    textContentInput.addEventListener('input', function () {
        const subTextContent = event.target.value;
        subText.innerHTML = subTextContent;
        subText.content = textContentInput.value;
        // 在这里更新对应的 Text 对象的 content 属性 ； 直接设置不同对象的监听器
    });
    textSizeInput.addEventListener('input', function (event) {
        const textSize = event.target.value;
        subText.style.fontSize = `${textSize}px`;
        // subText.fontSize = textSizeInput.value;
        // 在这里更新对应的 Text 对象的 size 属性
    });
    textColorInput.addEventListener('input', function (event) {
        const textColor = event.target.value;
        subText.style.color = textColor;
        // 在这里更新对应的 Text 对象的 color 属性
    });

    //增加删除文字元素的按钮操作，同时删除canvas上的文字元素
    const deleteButton = document.createElement('mdui-button');
    deleteButton.className = 'delete-btn mdui-btn';
    deleteButton.textContent = '删除此文字';
    deleteButton.addEventListener('click', function () {
        textElement.remove(textElement); // 把父元素都删除
        canvas.removeChild(subTextContainer);
    });
    textElement.appendChild(deleteButton);
    return textElement;
}

