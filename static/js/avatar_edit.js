const avatarContainer = document.createElement('div');
let avatarImg;

avatarContainer.id = 'avatar-container';

// 上传用户头像
const avatar = document.createElement('div'); //上传完再创建
document.getElementById('avatar-input').addEventListener('change', function (event) {
    avatar.id = 'avatar';

    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        avatarImg = e.target.result;
        avatar.style.backgroundImage = `url(${avatarImg})`;
    };
    reader.readAsDataURL(file);

    avatarContainer.appendChild(avatar);
    canvas.appendChild(avatarContainer);
    canvas.style.border = 'none';  // 上传后去掉边框
});
// 头像拖动功能
avatarContainer.addEventListener('mousedown', function (event) {
    event.preventDefault();
    let prevX = event.clientX;
    let prevY = event.clientY;
    document.addEventListener('mousemove', moveAvatar);

    document.addEventListener('mouseup', function () {
        document.removeEventListener('mousemove', moveAvatar);
    });

    function moveAvatar(event) {
        const newX = avatarContainer.offsetLeft + (event.clientX - prevX);
        const newY = avatarContainer.offsetTop + (event.clientY - prevY);
        avatarContainer.style.left = `${newX}px`;
        avatarContainer.style.top = `${newY}px`;
        prevX = event.clientX;
        prevY = event.clientY;
    }

});

// 头像大小编辑
document.getElementById('avatar-size-input').addEventListener('input', function (event) {
    const avatarSize = event.target.value;
    avatar.style.width = `${avatarSize}px`;
    avatar.style.height = `${avatarSize}px`;
});
// 头像圆角编辑
document.getElementById('avatar-round-input').addEventListener('change', function (event) {
    const isRound = event.target.checked;
    if (isRound) {
        avatar.style.borderRadius = '50%';
        avatar.setAttribute("rounded", "true");
    } else {
        avatar.style.borderRadius = '0';
        avatar.setAttribute("rounded", "false");

    }
});
