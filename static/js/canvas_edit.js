let backgroundImg;
const canvas = document.getElementById('canvas');

// 上传背景图片
document.getElementById('background-input').addEventListener('change', handleBackgroundChange);


// Function to handle adjusting canvas size based on aspect ratio
function adjustCanvasSizeForAspectRatio(img) {
    const aspectRatio = img.width / img.height;
    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvasWidth / aspectRatio;
    canvas.style.height = `${canvasHeight}px`;
    canvas.style.width = `${canvasWidth}px`;
}

// Function to handle background image change
function handleBackgroundChange(event) {
    const file = event.target.files[0];
    const img = new Image();
    const reader = new FileReader();

    reader.onload = function (e) {
        img.src = e.target.result;
        img.onload = function () {
            // Adjust canvas size based on aspect ratio
            adjustCanvasSizeForAspectRatio(img);
            // Set background image
            backgroundImg = e.target.result;
            canvas.style.backgroundImage = `url(${backgroundImg})`;
            canvas.style.border = "none"
        };
    };
    reader.readAsDataURL(file);
}
