import os

from flask import Flask, send_from_directory, render_template, Markup

app = Flask(__name__)

# 设置静态资源目录
app.static_folder = 'static'
app.template_folder = "./"
root_fonts_folder = "fonts"
app.debug = True  # 启用调试模式和自动重载


# 定义路由，用于处理静态文件请求
@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)


@app.route("/")
def homepage():
    template = html_load_font()
    return render_template('deit_id_card.html', font_load=Markup(template))


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
            font-family: '{filename.split(".")[0]}';
            src: url('/static/fonts/{filename}') format('{type_mapping[end_type]}');
            font-weight: normal;
            font-style: normal;
          }}</style>"""
        total_template += load_ttf_template
    return total_template


# 启动服务器
if __name__ == '__main__':
    app.run()
