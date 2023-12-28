import json
import os
import zipfile
from datetime import datetime

import pandas as pd
from flask import Flask, send_from_directory, render_template, request, jsonify, send_file
from markupsafe import Markup

from batch_process_util import render_image_by_config, remove_folder

app = Flask(__name__)

# 设置静态资源目录
project_root = os.path.dirname(os.path.abspath(__file__))

app.static_folder = 'static'
app.template_folder = "./"
root_fonts_folder = os.path.join(app.static_folder, "fonts")
output_folder = "output"  # 项目目录下的output路径
app.debug = True  # 启用调试模式和自动重载

os.makedirs(output_folder, exist_ok=True)


# 定义路由，用于处理静态文件请求
@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)


@app.route("/")
def homepage():
    template = html_load_font()
    return render_template('deit_id_card.html', font_load=Markup(template))


@app.route('/upload_folder', methods=['POST'])
def upload():
    files = request.files.getlist('files[]')

    if files:
        save_folder = get_now_date()
        full_folder_path = os.path.join(app.static_folder, "avatar", save_folder)
        os.makedirs(full_folder_path, exist_ok=True)
        static_path = os.path.join("static", "avatar", save_folder)
        uploaded_files = []
        for file in files:
            filename = os.path.join(full_folder_path, file.filename)
            file.save(filename)
            dir_path = os.path.join("static", "avatar")
            uploaded_files.append(dir_path)
        return jsonify({'message': 'Files uploaded successfully',
                        'storeFolder': static_path,
                        "storeFiles": uploaded_files})
    else:
        return jsonify({'message': 'Files uploaded error, no files selected!',
                        'storeFolder': "",
                        "storeFiles": []})


@app.route('/batch_processing', methods=['POST'])
# 这个只是解析服务，然后批量生成还是交给js， 那就复杂起来； 一半python，一半js
def batch_processing():
    error1_response = jsonify({'message': 'error! static path is empty!'})
    error2_response = jsonify({'message': "haven't uploaded config .json or .excel file!"})
    data = request.json
    static_path = data.get("static_path")
    end_filename = static_path.split('/')[-1]
    if static_path == "":
        return error1_response
    else:
        all_files = os.listdir(static_path)
        excel_files = [i for i in all_files if i.split(".")[-1] in ("csv", "xlsx")]
        json_files = [i for i in all_files if i.split(".")[-1] in ("json")]
        if len(excel_files) < 1 or len(json_files) < 1:
            return error2_response

        with open(os.path.join(static_path, json_files[0]), 'r') as file:
            config_dict = json.load(file)

        # 读取 Excel 文件
        df = pd.read_excel(os.path.join(static_path, excel_files[0]))
        avatar_dir = static_path
        font_base_path = root_fonts_folder
        images_dict = render_image_by_config(df, config_dict, font_base_path, avatar_dir)

        output_full_folder = static_path.replace("static", output_folder)
        os.makedirs(output_full_folder, exist_ok=True)
        for filename, image in images_dict.items():
            image.save(os.path.join(output_full_folder, filename + ".png"))

        # 创建一个 ZIP 文件并将图片添加到其中
        zip_path = os.path.join(app.static_folder, "output", f"{end_filename}.zip")
        image_files = os.listdir(output_full_folder)
        with zipfile.ZipFile(zip_path, 'w') as zip_file:
            for image_file in image_files:
                image_path = os.path.join(output_full_folder, image_file)
                zip_file.write(image_path, image_file)

        relative_path = os.path.join("static", "output", f"{end_filename}.zip")
        # 返回 ZIP 文件给用户下载
        print("打包好了压缩包，给用户自己去下载")
        print("zip_path:", relative_path)
        remove_folder(output_full_folder)
        return jsonify({'message': 'success!',
                        'outputPath': "/" + relative_path})


# 加载本地的字体
type_mapping = {
    "otf": "opentype",
    "ttf": "truetype",
    "woff": "woff",
    "woff2": "woff2",
}


def html_load_font():
    font_files = os.listdir(os.path.join(app.static_folder, "fonts"))  # 读取文件夹下的子文件夹
    total_template = ""
    for filename in font_files:
        end_type = os.path.splitext(filename)[1].strip('.')
        load_ttf_template = f"""<style>
          /* 定义字体 */
          @font-face {{
            font-family: '{filename.replace(".", "_")}';
            src: url('/static/fonts/{filename}') format('{type_mapping[end_type]}');
            font-weight: normal;
            font-style: normal;
          }}</style>"""
        total_template += load_ttf_template
    return total_template


def get_now_date():
    now = datetime.now()
    formatted_date_time = now.strftime("%Y-%m-%d %H:%M:%S")
    return formatted_date_time




# 启动服务器
if __name__ == '__main__':
    app.run()
