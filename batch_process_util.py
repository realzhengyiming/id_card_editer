import base64
import io
import json
from typing import Dict


def read_config_json(json_path) -> Dict:
    with open(json_path) as file:
        config_dict = json.loads(file.read())
    return config_dict


def read_mapping_excel(excel_path):
    import pandas as pd
    df = pd.read_excel(excel_path)
    return df


from PIL import ImageDraw, ImageFont
from PIL import Image, ImageOps
import matplotlib.pyplot as plt
import os

font_base_path = "/Users/zhengyiming/PycharmProjects/id_card_editer/static/fonts/"


def draw_text(image, fontname, fontsize, fontpose, fontcolor, content, font_base_path):  # fontpose(x,y)
    print(fontname, fontsize, fontpose, fontcolor, content)
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype(os.path.join(font_base_path, fontname), fontsize)
    # 在指定位置添加文字
    draw.text(fontpose, content, fill=fontcolor, font=font, antialias=True)  # 在坐标 (50, 50) 处添加文字


def cut_avatar(image, size, is_radias=False):
    image = image.convert("RGBA")
    # 使用ImageOps模块的fit方法将图片缩放并居中裁剪，以适应元素大小
    result = ImageOps.fit(image, size, centering=(0.5, 0.5), method=Image.Resampling.BICUBIC)
    if is_radias:
        mask = Image.new("L", result.size, 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0) + result.size, fill=255)
        # 将遮罩应用到结果图片上，并保存
        result.putalpha(mask)
    return result


def paste_with_transparency(background, overlay, position):
    # 打开底图和叠加图
    # 确保图像都是 RGBA 模式，以支持透明度
    background = background.convert("RGBA")
    overlay = overlay.convert("RGBA")
    # 将叠加图粘贴到底图上
    background.paste(overlay, position, overlay)
    return background


def pil_read_base64(string):
    # 假设这是你的 base64 编码的图片数据
    # 移除 base64 编码字符串中的前缀部分（data:image/jpeg;base64, 等）
    img_data = base64.b64decode(string.split(',')[1])
    # 将解码后的数据转换为字节流
    image_stream = io.BytesIO(img_data)
    image = Image.open(image_stream)
    return image


def render_image_by_config(df, config_dict, font_base_path, avatar_dir) -> Dict:
    base64_data = config_dict['background']['imageUrl']
    backgroup_img = pil_read_base64(base64_data)
    x, y = config_dict['background']['size']['width'], config_dict['background']['size']['height']

    background_resized_raw = backgroup_img.resize((x, y))

    # 创建一个可绘制对象
    templated = [i for i in config_dict['textList'] if i.get("isTemplate")]
    untemplated = [i for i in config_dict['textList'] if i.get("isTemplate") is False]

    # 读取头像数据模版配
    image_filenames = [i for i in os.listdir(avatar_dir) if i.split(".")[-1] in ("png", "jpeg", "jpg", "gif")]
    image_dict = {i.split(".")[0]: i for i in image_filenames}  # 减少便利次数

    # 按行绘制模版填充的内容
    all_images = {}
    for index, row in df.iterrows():
        row_dict = dict(row)
        background_resized = background_resized_raw.copy()
        # 读取图片
        avatar_dict = config_dict['avatar']
        avatar_filename = str(row_dict[avatar_dict['colName']])
        avatar_filename = image_dict[avatar_filename]

        avatar_image = Image.open(os.path.join(avatar_dir, avatar_filename))
        is_radias = avatar_dict['rounded']
        x, y = avatar_dict['position']['left'], avatar_dict['position']['top']
        avatar_position = (x, y)
        width = int(avatar_dict['size']['width'].strip("px"))
        height = int(avatar_dict['size']['height'].strip("px"))
        avatar_cut = cut_avatar(avatar_image, (width, height), is_radias=is_radias)

        background_resized = paste_with_transparency(background_resized, avatar_cut, avatar_position)

        for text_data in config_dict['textList']:
            is_template = text_data['isTemplate']
            col_name = text_data['colName']
            content = str(row_dict[col_name]) if is_template else text_data['content']  # 替换内容
            fontcolor = text_data['color']
            print("fontcolor", fontcolor)
            fontcolor = eval(fontcolor.replace("rgb", "")) if fontcolor else (0, 0, 0)  # 默认颜色

            fontsize = int(text_data['fontSize'].replace("px", ""))
            fontpose = (text_data['position']['left'], text_data['position']['top'])
            fontname = text_data['fontFamily']

            fontname = fontname[0:-4] + "." + fontname[-3:-1] + fontname[-1]
            draw_text(background_resized, fontname, fontsize, fontpose, fontcolor, content, font_base_path)
        all_images[avatar_filename] = background_resized
        # 保存修改后的图片
    # image.save("output.jpg")
    return all_images


def remove_folder(path):
    # 确定路径是否存在
    if os.path.exists(path):
        # 遍历文件夹中的所有文件和子文件夹
        for root, dirs, files in os.walk(path, topdown=False):
            # 删除文件
            for file_name in files:
                file_path = os.path.join(root, file_name)
                os.remove(file_path)
            # 删除子文件夹
            for dir_name in dirs:
                dir_path = os.path.join(root, dir_name)
                os.rmdir(dir_path)

        # 删除根文件夹
        os.rmdir(path)
        print(f"文件夹 '{path}' 及其所有内容已成功删除。")
    else:
        print(f"文件夹 '{path}' 不存在。")

