import json
import os
import zipfile
from datetime import datetime, timedelta

import pandas as pd
from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask, send_from_directory, render_template, request, jsonify, abort
from markupsafe import Markup

from batch_process_util import render_image_by_config, remove_folder

app = Flask(__name__)
# 用于存储每个文件的上传时间和倒计时的字典
history_files = {}

# 设置静态资源目录
project_root = os.path.dirname(os.path.abspath(__file__))

app.static_folder = 'static'
app.template_folder = "./"
root_fonts_folder = os.path.join(app.static_folder, "fonts")
output_folder = "output"  # 项目目录下的output路径
app.debug = True  # 启用调试模式和自动重载
expiration_second = 60 * 60
os.makedirs(output_folder, exist_ok=True)


@app.errorhandler(500)
def handle_internal_server_error(error):
    print("error log", error)
    response = jsonify({'message': 'Internal Server Error', "error": str(error)})
    response.status_code = 500
    return response


# 定义路由，用于处理静态文件请求
@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)


@app.route("/")
def homepage():
    template = html_load_font()
    return render_template('deit_id_card.html', font_load=Markup(template))


def delete_folder_contents():
    need_delete_keys = []
    for folder_path, (upload_time, expiration_date) in history_files.items():
        if datetime.now() >= expiration_date:
            # 删除过期文件
            if os.path.isdir(folder_path):
                for filename in os.listdir(folder_path):
                    file_path = os.path.join(folder_path, filename)
                    if os.path.isfile(file_path):
                        os.remove(file_path)
                os.rmdir(folder_path)
            else:
                os.remove(folder_path)  # 如果是单文件的话
            # 从字典中删除文件信息
            need_delete_keys.append(folder_path)
    for key in need_delete_keys:
        print(f"{key} 超时， 正在清理！")
        del history_files[key]


def set_delete_datetime(history_dict, key, second=expiration_second):
    # 存储文件的上传时间和倒计时
    expiration_date = datetime.now() + timedelta(seconds=second)
    history_dict[key] = (datetime.now(), expiration_date)


@app.route('/upload_folder', methods=['POST'])
def upload():
    files = request.files.getlist('files[]')

    if files:
        save_folder = get_now_date()
        full_folder_path = os.path.join(app.static_folder, "user_config", save_folder)
        os.makedirs(full_folder_path, exist_ok=True)
        static_path = os.path.join("static", "user_config", save_folder)
        uploaded_files = []
        for file in files:
            filename = os.path.join(full_folder_path, file.filename)
            file.save(filename)
            dir_path = os.path.join("static", "user_config")
            uploaded_files.append(dir_path)

        set_delete_datetime(history_files, static_path)
        return jsonify({'message': 'Files uploaded successfully',
                        'storeFolder': static_path,
                        "storeFiles": uploaded_files})
    else:
        return jsonify({'message': 'Files uploaded error, no files selected!',
                        'storeFolder': "",
                        "storeFiles": []})


@app.route('/batch_processing', methods=['POST'])
def batch_processing():
    error1 = 'error! static path is empty! please reupload config folder'
    error2 = "haven't uploaded config .json or .excel file!"
    data = request.json
    static_path = data.get("static_path")
    end_filename = static_path.split('/')[-1]
    if static_path == "" or not os.path.exists(static_path):
        abort(500, description=error1)
    else:
        all_files = os.listdir(static_path)
        excel_files = [i for i in all_files if i.split(".")[-1] in ("csv", "xlsx")]
        json_files = [i for i in all_files if i.split(".")[-1] in ("json")]
        if len(excel_files) < 1 or len(json_files) < 1:
            abort(500, description=error2)

        with open(os.path.join(static_path, json_files[0]), 'r') as file:
            config_dict = json.load(file)

        # 读取 Excel 文件
        if excel_files[0].split(".")[-1] == "csv":
            df = pd.read_csv(os.path.join(static_path, excel_files[0]))
        else:
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
        print("zip_path:", relative_path)
        remove_folder(output_full_folder)
        set_delete_datetime(history_files, zip_path)
        result = {'message': 'success!',
                  'outputPath': "/" + relative_path}
        print("result:", result)
        return jsonify(result)


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


# 定时任务
scheduler = BackgroundScheduler()
scheduler.add_job(func=delete_folder_contents, trigger='interval', minutes=1)  # 每分钟执行一次删除检查
scheduler.start()

# 启动服务器
if __name__ == '__main__':
    app.run()
