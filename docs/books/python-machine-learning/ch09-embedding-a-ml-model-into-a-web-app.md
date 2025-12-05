# 第9章：在Web应用中嵌入机器学习模型

GitHub Notebook 地址: http://nbviewer.ipython.org/github/rasbt/python-machine-learning-book/blob/master/code/ch09/ch09.ipynb

在前几章中，我们学习了多种机器学习的相关概念与算法，它们可以帮助我们更好、更高效地做出决策。然而，机器学习技术并不仅仅局限于离线应用和分析，它们也可以成为 Web 服务的预测引擎。例如，Web 应用领域常用的机器学习模型包括: 通过表单发送的垃圾邮件检测、搜索引擎，以及媒体、购物门户网站用到的推荐系统等。

在本章中，我们将学习如何将机器学习模型嵌入到 Web 应用中，不仅仅是分类，还包括从实时数据中学习。本章将涵盖如下主题:

-   保存训练后的机器学习模型的状态
-   使用 SQLite 数据库存储数据
-   使用 Flask 框架开发 Web 应用程序
-   在公共 Web 服务上部署机器学习应用

# 9.1 序列化通过 scikit-learn 拟合的模型

正如我们在第8章中所讨论的那样，训练机器学习模型会带来很高的计算成本。当然，我们不希望每次进行预测分析都打开 Python 交互窗口来训练模型，或者重新加载 Web 应用程序。模型持久化的一个方法就是使用 Python 内嵌的 pickle 模块$^1$，它使得我们可以在 Python 对象与字节码之间进行转换(序列化与反序列化)，这样就可以将分类器当前的状态保存下来。当需要对新的样本进行分类时，可以直接加载已保存的分类器，而不必再次通过训练数据对模型进行训练。执行下列代码前，请确保已经使用第 8章中介绍的方法完成了外存 Logistic 回归模型的训练，并且已经在 Python 会话中:

>   注1: https://docs.python.org/3.4/library/pickle.html

```python
import pickle
import os

dest = os.path.join('movieclassifier', 'pkl_objects')
if not os.path.exists(dest):
    os.makedirs(dest)
pickle.dump(stop, open(os.path.join(dest, 'stopwords.pkl'), 'wb'), protocol=4)
pickle.dump(clf, open(os.path.join(dest, 'classifier.pkl'), 'wb'), protocol=4)
```

通过上述代码，我们创建了一个 movieclassifier 目录，后续我们将在此存储 Web 应用中的文件和数据。在此目录下，我们创建了一个 pkl_objects 子目录，用于存储序列化后的 Python 对象。使用 pickle 的 dump 方法，对训练好的 Logistic 回归模型及 NLTK 库中的停用词进行序列化，这样就不必在 Web 应用服务器上安装 NLTK 库了。dump 方法的第一个参数是我们要持久化的对象，第二个参数用于指定序列化对象的保存路径，在此我们使用了 Python 的 open 方法。open 方法中的 wb 参数代表以二进制存储数据，而 protocol=4 则代表最新的、最高效的 protocol 协议，此此协议已在 Python 3.4 中使用$^2$。

>   🔖 我们的 Logistic 回归模型中包含多个 NumPy 的数组，例如权重向量等，使用 joblib 库是序列化 NumPy 数组更加高效的一个替代方法。不过为了保障服务器环境与后续小节中的配置一致，我们仍旧使用标准的 pickle 方法。如果读者对 joblib 感兴趣，可以访问链接 https://pypi.python.org/pypi/joblib 以获取更多信息。

由于无需拟合 HashingVectorizer，也就不必对其进行持久化操作。相反，我们可以创建一个新的 Python 脚本，通过此脚本可以将向量数据导入到当前 Python 会话中。请拷贝下列代码，并以 vectorizer.py 作为文件名，保存在 movieclassifier 目录下:

>   📃 movieclassifier/vectorizer.py

```python
from sklearn.feature_extraction.text import HashingVectorizer
import re
import os
import pickle

cur_dir = os.path.dirname(__file__)
stop = pickle.load(open(os.path.join(cur_dir, 'pkl_objects', 'stopwords.pkl')), 'rb')

def tokenizer(text):
    text = re.sub('<[^>]*>', '', text)
    emoticons = re.findall('(?::|;|=)(?:-)?(?:\)|\(|D|P)', text)
    text = re.sub('[\W]+', ' ', text.lower()) + ' '.join(emoticons).replace('-', '')
    tokenized = [w for w in text.split() if w not in stop]
    return tokenized


vect = HashingVectorizer(decode_error='ignore', n_features=2**21, 
                         preprocessor=None, tokenizer=tokenizer)
```

对 Python 对象进行序列化操作以及保存好 vectorizer.py 文件后，最好重新启动一下 Python 交互窗口或者 IPython Notebook，以测试是否可以准确无误地对已保存模型进行逆持久化操作。不过，请注意，由于 pickle 模块未对恶意代码进行防范，因此对从不受信任渠道获得的数据进行持久化操作可能具有潜在的安全风险。在终端窗口中，定位到 movieclassifier 所在的路径，开启一个新的 Python 会话，并执行下列代码以确保可以正常导入 vectorizer 及对分类器进行持久化处理:

```python
import pickle
import re
import os
from movieclassifier.vectorizer import vect

clf = pickle.load(open(os.path.join('movieclassifier/pkl_objects', 'classifier.pkl'), 'rb'))
```

>   注2: 如果无法正常使用 protocol 4，请检查是否安装了 Python 3的最新版本。此外，你也可以选择一个较低版本的 protocol。

在成功加载 vectorizer 及反序列化分类器后，我们现在就可以使用这些对象对文档样本进行预处理，并对它们所代表的情感倾向进行预测:

```python
import numpy as np

label = {0: 'negative', 1: 'positive'}
example = ['I love this movie']
X = vect.transform(example)
print('Prediction: %s\nProbability: %.2f%%' % 
      (label[clf.predict(X)[0]], np.max(clf.predict_proba(X))*100))
```

输出结果:

```output
Prediction: positive
Probability: 86.00%
```

由于分类器返回的类标为整数，我们在此定义一个简单的 Python 字典将整数映射到对应的情感上。然后，我们使用 HashingVectorizer 将样本文档转换为单词向量 X。最后，我们使用 Logistic 回归分类器的 predict 方法预测类标，并通过 predict_proba 方法返回个预测结果相应的概率。请注意，对 predict_proba 方法调用会返回一个数组，以及每个类标所对应的概率。由于 predict 返回的是较高概率对应的类标，我们则使用 np.max 函数返回对应预测类标的概率$^3$。

>   注3: 情绪的概率，最终的类别是通过 np.max 得到的概率较高的那个。

# 9.2 使用 SQLite 数据库存储数据

在本节中，我们将创建一个简单的 SQLite 数据库以手机 Web 应用的用户对于预测结果的反馈。基于这些反馈，我们可以对分类模型进行更新。SQLite 是一款开源的 SQL 数据库引擎，由于它无需运行单独的服务器，因此成为小型项目和简单 Web 应用的理想选择。从本质上来说，SQLite 数据库可以看做是一个单一的、自包含(不依赖其他模块与组件)的数据库文件，它允许我们直接存储文件。此外，SQLite 无需任何针对特定系统的设置，常用操作系统也都支持。其出色的可靠性为其赢得了良好的声誉，被广泛应用于 Google、Mozilla、Adobe、Apple、Microsoft 等知名公司。如果读者想要详细了解 SQLite，请访问其官方网站: http://www.sqlite.org 。

幸运的是，由于 Python 的“自带电池”$^1$哲学，在 Python 标准库中已经包含了支持 SQLite 的 API： sqlite3，这使得我们可以直接操作使用 SQLite 数据库(关于 sqlite3 的更详细信息请参见 https://docs.python.org/3.4/library/sqlite3.html )。

>   Python 提供了完善的基础代码库，涵盖数据库、文本处理、文件处理、网络编程的内容，被称作内置电池。

通过执行下列代码，我们将在 movieclassifier 所在目录创建一个新的 SQLite 数据库，并向其中插入两条电影评论的示例数据:

```python
import sqlite3
import os

conn = sqlite3.connect('reviews.sqlite')
c = conn.cursor()
c.execute('CREATE TABLE review_db (review TEXT, sentiment INTEGER, date TEXT)')
example1 = 'I love this movie'
c.execute("INSERT INTO review_db (review, sentiment, date) VALUES (?,?, DATETIME('now'))", (example1, 1))
example2 = 'I disliked this movie'
c.execute("INSERT INTO review_db (review, sentiment, date) VALUES (?,?, DATETIME('now'))", (example2, 1))
conn.commit()
conn.close()
```

在上述示例代码中，通过调用 sqlite3 中的 connect 方法，创建了一个访问 SQLite 数据库文件的连接(conn)，当数据库文件 reviews.sqlite 不存在，该方法就会在 movieclassifier 目录下自动创建该文件。请注意，由于 SQLite 未实现对表的替换功能，如果要再次执行这些代码，需要读者自行在文件浏览器中删除相应的数据库文件。接下来，我们通过 cursor 方法创建了一个游标，就可以借助强大的 SQL 语句来遍历数据库中的记录。在第一次调用 executee 时，我们创建了一张新的数据表: review_db，并使用它存储和访问数据库中的记录。在 review_db 表中，我们创建了三个属性: review、sentiment，以及 date，借助于它们，我们存储了两个电影评论的示例数据及其对应的类标(情感倾向)。使用 SQL 命令 `DATETIME('now')`，我们为记录增加了日期及时间戳。除了时间戳之外，我们还使用了问号(`?`)作为占位符，将电影评论文本(example1 和 example2)及其对应的类标(1 和 0)以元组的形式传递给 execute 方法。最后，我们调用 commit 方法保存对数据库的修改，并通过 close 方法关闭数据库连接。

为了检查记录是否已经正确地存储到数据库中，我们现在重建数据库链接，并通过 SELECT 语句获取表中自 2015 年1月1日之后提交的所有数据:

```python
import sqlite3
import os

conn = sqlite3.connect('reviews.sqlite')
c = conn.cursor()
sql = r"""SELECT * FROM review_db 
    WHERE date BETWEEN '2019-01-07 00:00:00' 
        AND DATETIME('now')"""
c.execute(sql)
results = c.fetchall()
conn.close()
print(results)
```

输出结果:

```output
[('I love this movie', 1, '2019-01-07 14:00:23'), ('I disliked this movie', 1, '2019-01-07 14:00:23')]
```

此外，还可以使用免费的火狐浏览插件 SQLite Manager$^2$，如下图所示，此插件提供了一个访问 SQLite 数据库的图形用户界面:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190831000704168.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

>   注2: 可通过链接 https://addons.mozilla.org/en-US/firefox/addon/sqlite-manager/ 获取。

# 9.3 使用 Flask 开发 Web 应用

上一节完成了用于电影分类的代码，现在来讨论 Flask 狂阿基开发 Web 应用的基础知识。自2010年 Armin Ronacher 发布 Flask 以来，此框架获得了广泛的关注，并被流行的应用 LinkedIn 及 Pinterest 所使用。由于 Flask 使用 Python 开发，它为 Python 程序员嵌入已有 Python 代码提供了方便的接口，在此我们将嵌入电影分类器。

>   🔖 Flask 以微框架而著称，这意味着其内核精炼且简单，但易于通过其他库进行扩展。其学习曲线不像其他基于 Python 的 Web 框架(如 Django)那样陡峭，但建议读者阅读一些 Flask 的官方文档: http://flask.pocoo.org/docs/0.10/ ，以了解其更多的功能。

如果读者的 Python 环境中尚未安装 Flask 库，请在终端窗口中通过以下命令使用 pip 进行安装(在本书写作过程中，最新的稳定版本为 V0.10.1):

```bash
→ pip install flask
```

## 9.3.1 第一个 Flask Web 应用

在小节中，在实现电影分类之前，先开发一个简单的 Web 应用来熟悉以下 Flask API。首先，按照如下目录结构创建 Web 应用的框架:

```dir
1st_flask_app_1/
   app.py
   templates/
       first_app.html
```

app.py 文件包含了运行 Flask Web 应用程序而需要在 Python 解释器中指向的入口代码。templates 目录存档 Flask 用到的静态 HTML 文件，这些静态文件将交由浏览器进行解析。我们来看一下 app.py 的内容:

>   📃 1st_flask_app_1/app.py

```python
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('first_app.html')

if __name__ == '__main__':
    app.run()
```

在本示例下，我们以独立模块的方式运行应用程序，由此，通过参数 `__name__` 来初始化一个 Flask 实例，并告知 Flask 实例 HTML 模板存放路径为当前目录的 templates 子目录。接下来，使用路由注解(`@app.route('/')`)指定出发 index 函数的 URL 路径。在本例中，index 函数简单返回名为 first_app.html 的 HTML 文件，此文件存放于 templates 目录下。最后，使用 run 函数在服务器上运行程序；在确保 if 语句中判定条件为 `__name__ == '__main__'` 的情况下，此脚本可以在 Python 解析器中直接运行。

现在，我们来解释一些 first_app.html 文件中的内容。如果读者不熟悉 HTML 语法，建议通过在线教程 http://www.w3schools.com/html/default.asp 学习 HTML 的基础知识。

>   📃 1st_flask_app_1/templates/first_app.html

```html
<!doctype html>
<html>
    <head>
        <title>First app</title>
    </head>
    <body>
        <div>Hi, this is my first Flask web app!</div>
    </body>
</html>
```

在此，我们在 HTML 模板文件中插入一个 div 元素(块元素)，此元素包含句子: “Hi, this is my first Flask web app!”。将 Web 应用部署到公共 Web 服务器上之前，Flask 允许我们在本地运行应用，这对应用程序的开发和测试来说非常有用。现在，在 1st_flask_app_1 目录下，通过终端窗口执行下列命令启动 Web 应用:

```bash
→ python app.py
```

输出结果:

```output
* Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
```

此输出包含我们本地服务器的地址。我们可以在浏览器中输入该地址以查看 Web 程序运行效果。如果一切都运行正常，将看到一个显示如下内容的网页: “Hi, this is my first Flask Web app!”。

## 9.3.2 表单验证及渲染

在本小节中，将使用 HTML 的表单升级 Flask Web 应用，以学习如何使用 WTForms 库$^1$收集数据，WTForms 可通过 pip 安装:

```bash
→ pip install wtforms
```

>   https://wtforms.readthedocs.org/en/latest/

Web 应用会提示用户在文本框中输入自己的名字，如下所示:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190831000729353.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

在点击提交按钮(Say Hello)后，程序将验证表单，同时返回一个新的 HTML 页面显示用户输入的名字:

![](https://imgconvert.csdnimg.cn/aHR0cDovL2dpdGh1Yi5jb20vbWluZ21pbnl1L2ltYWdlcy9yYXcvbWFzdGVyL3B5dGhvbi1tYWNoaW5lLWxlYXJuaW5nL2NoMDkvOS0zLmpwZw)

新的应用所需的目录结构看起来如下所示:

```reStructuredText
1st_flask_app_2/
   app.py
   static/
       style.css
   templates/
       _formhelpers.html
       first_app.html
       hello.html
```

以下为修改后的 app.py 文件的内容:

>   📃 1st_flask_app_2/app.py

```python
from flask import Flask, render_template, request
from wtforms import Form, TextAreaField, validators

app = Flask(__name__)

class HelloForm(Form):
    sayhello = TextAreaField('', [validators.DataRequired()])

@app.route('/')
def index():
    form = HelloForm(request.form)
    return render_template('first_app.html', form=form)

@app.route('/hello', methods=['POST'])
def hello():
    form = HelloForm(request.form)
    if request.method == 'POST' and form.validate():
        name = request.form['sayhello']
        return render_template('hello.html', name=name)
    return render_template('first_app.html', form=form)

if __name__ == '__main__':
    app.run()

```

使用 wtforms，通过 TextAreaField 类在起始页中嵌入文本框对函数做了修了，TextAreaField 类可以验证用户是否输入了一个有效文本。此外，我们还新增了一个 hello 函数，如果表单通过验证，此函数将向客户端返回 HTML 页面的 hello.html。此处，我们使用 POST 方式将表单提交给服务器。最后，在 app.run() 方法中设置参数 debug=True，我们启动了 Flask 的调试模式，这个功能在 Web 应用开发中非常有用。

现在，通过 Jinja2 模板引擎，在 _formhelpers.html 文件中实现一个通用宏，后续它将被导入到 first_app.html 文件中用来渲染文本域:

>   📃 1st_flask_app_2/templates/_formhelpers.html

```html
{% macro render_field(field) %}
<dt>{{ field.label }}
  <dd>{{ field(**kwargs)|safe }}
  {% if field.errors %}
      <ul class=errors>
       {% for error in field.errors %}
          <li>{{ error }}</li>
       {% endfor %}
      </ul>
  {% endif %}
  </dd>
{% endmacro %}

```

对 Jinja2 模板语言更深入的讨论超出了本书的范围。不过读者可以通过 http://jinja.pocoo.org 找到关于 Jinja2 语法的详尽文档。

接下来，我们将建立一个简单层叠样式表(Cascading Style Sheet, CSS)文件: style.css，用来调整 HTML 文档页面的视觉效果。下述 CSS 文件能够使页面字体以 2倍大小显示，该文件存放于 static 子目录下，此目录是 Flask 存储 CSS 静态文件的默认目录。代码如下:

>   📃 1st_flask_app_2/static/style.css

```css
body {
 font-size: 2em;
}

```

下面是修改后的 first_app.html 文件内容，它将显示为一个用于输入用户名字的文本框:

>   📃 1st_flask_app_2/templates/first_app.html

```html
<!doctype html>
<html>
    <head>
        <title>First app</title>
        <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
    </head>
    <body>
        {% form "_formhelpers.html" import render_field %}
        <div>What's your name?</div>
        <form method=post action="/hello">
            <dl>
                {{ render_field(form.sayhello) }}
            </dl>
            <input type=submit value='Say Hello' name='submit_btn'>
        </form>
    </body>
</html>

```

我们在 first_app.html 标头加载了 CSS 文件。此时它应该更改 HTML 文件 body 中所有元素的大小。在 HTML 的 body 中，我们从 _formhelpers.html 导入了宏，并使用它来渲染 app.py 文件中定义的 say hello 表单。此外，我们还在表单中增加了一个按钮，可以让用户提交文本框中输入的内容。

在 app.py 中，我们定义了一个 hello 函数，它通过 `render_template('hello.html', name=name)` 返回并渲染一个 HTML 文件。最后，我们创建这个名为 hello.html 的文件，以显示用户在文本框中输入的文本。代码如下:

>   📃 1st_flask_app_2/templates/hello.html

```html
<!doctype html>
<html>
    <head>
        <title>First app</title>
        <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
    </head>
    <body>
        <div>Hello {{ name }}</div>
    </body>
</html>

```

完成对 Flask Web 应用的改进后，我们可以在 app 所在目录下，通过执行下述命令在本地运行此程序，并在浏览器中通过 http://127.0.0.1:5000/ 来查看运行结果:

```bash
→ python app.py

```

>   🔖 对初步 Web 开发的读者来说，某些概念乍看好像非常复杂。若遇到这种情况，建议读者现在某个目录中设置前面体积的文件并仔细检查。你会发现 Flask Web 框架其实非常易用，也不像最初看上去那样复杂。关于 Flask 更多的帮助信息，请访问其出色的在线文档和示例: http://flask.pocoo.org/docs/0.10/ 。

# 9.4 将电影分类器嵌入 Web 应用

目前，我们对使用 Flask 进行 Web 开发有了一定的认识，下面更进一步，将电影分类器嵌入到 Web 应用中。在本节，我们先开发一个 Web 应用，此应用会提示用户输入一个电影评论，如下图所示:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190831000753968.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

在评论提交后，会返回一个新的页面，页面中会显示预测类标及评论属于此类别的概率。此外，用户还可以使用“正确”(Correct)或者“不正确”(Incorrect)两个按钮对预测结果做出反馈，如下图所示:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190831000804931.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

如果用户点击了“正确”或者“不正确”按钮，分类模型将基于用户的反馈进行更新。此外，对于用户输入的评论文本，以及从按钮点击中推测出的类标等信息，我们将使用 SQLite 数据库进行保存，为将来的预测提供参考。用户点击反馈后看到第三个页面，显示了简单的感谢信息和一个“提交其他评论”(Submit anoter review)按钮，此按钮将页面重定向到其实页面。如下图所示:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190831000821176.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)在详细学习此 Web 应用的代码之前，建议读者通过 http://raschkas.pythonanywhere.com 了解一些此应用的示例，以对本小节待讲解内容有个更好的认识。

从全局角度出发，我们先看一下此电影评论应用的目录结构，如下图所示:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20190831000837379.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)

在本章前面的小节中，我们已经创建了 vectorizer.py 文件、SQLite 数据库 reviews.sqlite，以及可以保存序列化的 Python 对象的 pkl_objects 子目录。

主目录下的 app.py 是包含 Flask 代码的 Python 脚本，在 Web 应用中，我们将使用 review.sqlite 数据库文件(本章前面小节中创建的文件)保存用户提交的电影评论数据。templates 子目录存储将 Flask 渲染的 HTML 模板文件；static 子目录仅包含一个简单的 CSS 文件，用于调整 HTML 页面渲染效果。

由于 app.py 文件较长，我们分两步来分析。首先导入所需的 Python 模块及对象，并通过返序列化恢复我们的分类模型:

>   📃 movieclassifier/app.py

```python
from flask import Flask, render_template, request
from wtforms import Form, TextAreaField, validators
import pickle
import sqlite3
import os
import numpy as np
from vectorizer import vect


app = Flask(__name__)

#### Preparing the Classifier
cur_dir = os.path.dirname(__file__)
clf = pickle.load(open(os.path.join(
		cur_dir, 'pkl_objects/classifier.pkl'), 'rb'))
db = os.path.join(cur_dir, 'reviews.sqlite')

def classify(document):
	label = {0: 'negative', 1: 'positive'}
	X = vect.transform([document])
	y = clf.predict(X)[0]
	proba = np.max(clf.predict_proba(X))
	return label[y], proba

def train(document, y):
	X = vect.transform([document])
	clf.partial_fit(X, [y])

def sqlite_entry(path, document, y):
	conn = sqlite3.connect(path)
	c = conn.cursor()
	sql = r"""INSERT INTO review_db (review, sentiment, date) 
				VALUES (?, ?, DATETIME('now'))"""
	c.execute(sql, (document, y))
	conn.commit()
	conn.close()

```

我们对 app.py 的第一部分内容应该很熟悉了。首先导入了 HashingVectorizer 并对 Logistic 回归分类器进行序列化操作。接下来，定义了一个 classify 函数返回针对给定文本文档的预测类标及其对应的概率。当文档及其对应类标可用时$^1$，可使用 train 函数更新分类器模型。使用 sqlite_entry 函数，我们可以将用户输入的评论信息及其对应的类标，以及时间戳等存入 SQLite 数据库。请注意，如果重启了 Web 应用，那么 clf 对象将被重置为原始的序列化状态。在本章最后，读者将学到如何使用 SQLite 数据库收集到的数据对分类器进行永久更新。

>   注1: 即用户输入文档，并对预测结果做了相关反馈时。

app.py 第二部分的内容看起来也非常熟悉:

>   📃 movieclassifier/app.py

```python
class ReviewForm(Form):
    moviereview = TextAreaField('', 
    		[validators.DataRequired(), validators.length(min=15)])

@app.route('/')
def index():
    form = ReviewForm(request.form)
    return render_template('reviewform.html', form=form)

@app.route('/results', methods=['POST'])
def results():
    form = ReviewForm(request.form)
    if request.method == 'POST' and form.validate():
        review = request.form['moviereview']
        y, proba = classify(review)
        return render_template('results.html', 
        	content=review, prediction=y, probability=(proba*100, 2))
    return render_template('reviewform.html', form=form)

@app.route('/thanks', methods=['POST'])
def feedback():
    feedback = request.form['feedback_button']
    review = request.form['review']
    prediction = request.form['prediction']
    inv_label = {'negative': 0, 'positive': 1}
    y = inv_label[prediction]
    if feedback == 'Incorrect':
      	y = int(not(y))
    train(review, y)
    sqlite_entry(db, review, y)
    return render_template('thanks.html')

if __name__ == '__main__':
    app.run()

```

我们定义了一个 ReviewForm 类实例化 TextAreaField 对象，它将在模板文件 reviewform.html(Web 应用的起始页)中被渲染。此对象同样也会被 index 函数所渲染。以 `validators.length(min=15)` 为参数，可以限制用户的输入至少为 15个字符。在 result 函数内，我们能够获取到用户在 Web 表单中提交的内容，并将其传递给电影评论分类器以预测情感倾向，预测结果将显示在渲染后的 results.html 模板中。

乍一看，feedback 函数好像有点复杂。如果用户在 results.html 页面点击了“正确”或“不正确”反馈按钮，此函数将分析出正确的类标，并将正确的情感转换成整数类标，以便使用 train 函数跟新分类器，train 函数在 app.py 脚本中第一部分已经做了介绍。此外，如果用户提交了反馈，sqlite_entry 函数就会在 SQLite 数据库中插入一条新的数据，最后 thanks.html 模板就会被渲染出来以感谢用户的反馈。

接下来，看一下 reviewform.html 模板，它是 Web 应用的起始页面:

>   📃 movieclassifier/templates/reviewform.html

```html
<!DOCTYPE html>
<html>
<head>
	<title>Movie Classification</title>
</head>
<body>
	<h2>Please enter your movie review:</h2>
	{% from "_formhelpers.html" import render_field %}
	<form method=post action="/results">
		<dl>
			{{ render_field(form.moviereview, cols='30', rows='10') }}
		</dl>
		<div>
			<input type="submit" value="Submit review" name="submit_btn">
		</div>
	</form>
</body>
</html>

```

为此，我们导入了本章的 9.3.2 中定义的 _formhelpers.html 模板。宏中的 render_field 函数用于渲染 TextAreaField 对象，此对象用于手机用户填写评论信息，并通过页面底部的“提交评论”(Submit review)按钮将信息提交到服务器。此 TextAreaField 对象的宽度为 30列宽，高度为 10行。

下一个模板，results.html 看上去很有趣:

```html
<!doctype html>
<html>
	<head>
		<title>Movie Classification</title>
		<link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
	</head>
	<body>
		<h3>Your movie review:</h3>
		<div>{{ content }}</div>
		<h3>Prediction:</h3>
		<div>This movie review is <strong>{{ prediction }}</strong>
			(probability: {{ probability }}%).</div>
		<div id="button">
			<form action="/thanks" method="post">
				<input type=submit value="Correct" name="feedback_button">
				<input type=submit value="Incorrect" name="feedback_button">
				<input type=hidden value="{{ prediction }}" name="prediction">
				<input type=hidden value="{{ content }}" name="review">
			</form>
		</div>
		<div id="button">
			<form action="/">
				<input type=submit value="Submit another review">
			</form>
		</div>
	</body>
</html>
```

首先，我们通过 `{{ content }}`、`{{ prediction }}`，以及 `{{ probability }}` 分别插入了用户提交的评论、预测类标，以及对应的概率。读者可能注意到了，我们在包含“正确”及“不正确”按钮的表单中第二次使用了 `{{ content }}`和`{{ prediction }}`占位符。这种旨在当用户点击了任一按钮后，以 POST 方式将数据返回给服务器，以便进行更新模型和存储评论数据。此外，我们在 results.html 文件的头部导入了 CSS 文件(style.css)。此文件的设置非常简单: 它将 Web 应用中内容的宽度设置为 600 像素，并使用 `<div id="button">` 将“正确”与“不正确”按钮下移了20像素:

```css
body {
    width: 600px;
}
#button {
    padding-top: 20px;
}
```

此 CSS 文件仅相当于一个占位符，读者可以根据自己的喜好任意调整页面的显示方式。

Web 应用要实现的最后一个模板页面是 thanks.html。顾名思义，此页面以友好的方式在用户点击“正确”或“不正确”按钮给出反馈后表示了感谢。此外，在页面的底部，我们给出了一个“提交其他评论”，它可以将用户重定向到起始页。thanks.html 的内容如下:

```html
<!doctype html>
<html>
	<head>
		<title>Movie Classification</title>
	</head>
	<body>
		<h3>Thank you for feedback!</h3>
		<div id="button">
			<form action="/">
				<input type=submit value="Submit another review">
			</form>
		</div>
	</body>
</html>
```

在进入下一小节并将永远部署到公共 Web 服务器上之前，我们不妨在终端窗口中输入如下命令，从而在本地环境中启动 Web 应用:

```bash
python app.py
```

完成 Web 应用的测试后，不要忘记将 app.py 脚本中 `app.run()` 命令的 `debug=True` 参数去掉。

# 9.5 在公共服务器上部署 Web 应用

当完成应用的本地测试后，我们现在可以将其部署到公共 Web 服务器上了。在本书中，我们将使用 PythonAnywhere 托管 Web 服务，它专门用于 Python Web 用于的托管。此外，PythonAnywhere 还提供了初学者账户，我们可以免费运行一个 Web 应用程序。

要创建一个新的 PythonAnywhere 账户，我们需要访问 https://www.pythonanywhere.com ，并点击右上角的 “Pricing&signup” 链接。接下来，点击“Create a Beginner account” 按钮，此时需要输入用户名、密码，及一个有效的电子邮件地址，阅读并同意条款之后，我们就拥有一个新的账户了。

不过，免费账户无法在命令行终端通过 SSH 协议访问远程服务器。因此，只能使用 PythonAnywhere Web 界面管理我们的 Web 应用。在上传 Web 应用之前，需要事先在 PythonAnywhere 账户中创建一个新的 Web 应用。点击右上角的 “Dashboard”按钮，就可以看到页面顶部显示的控制面板。接下来，点击页面顶部的“Web”标签，然后点击左侧的“Add a new Web app”按钮创建一个新的基于 Python3.4 的 Flask Web 应用，并将其命名为 movieclassifier。


![在这里插入图片描述](https://img-blog.csdnimg.cn/20190831001001129.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0x1Q2gxTW9uc3Rlcg==,size_16,color_FFFFFF,t_70)


最后，我们再次选择 “Web” 标签，并点击 “Reload<读者自己注册的用户名>.pythonanywhere.com” 按钮发送更新，刷新 Web 应用。这时，Web 应用应该已经启动和运行起来了，可访问 `<读者自己注册的用户名>.pythonanywhere.com`。

>   不幸的是，Web 服务器可能对 Web 程序中的细微问题也相当敏感。如果读者通过浏览器访问在 PythonAnywhere 中的应用程序时出错，可以在个人账号主页的“Web”标签下检查服务器日志信息，以更好地帮助查找问题所在。

## 9.5.1 更新电影评分分类器

当收到用户关于分类的反馈后，模型会自定即时更新，但是如果服务器崩溃或重启，clf 对象就会被重置。如果我们重新加载 Web 应用，clf 对象将通过 classifier.pkl 文件重新初始化。使得更新能够持久保存的一个方法就是: 模型一旦被更新就立刻序列化新的 clf 对象。但是，随着用户的增多，此方案效率会逐渐低下，而且如果用户同时提交反馈信息，有可能会损坏序列化文件。另一种解决方案就是使用 SQLite 数据库保存的反馈信息更新模型。我们可以从 PythonAnywhere 的服务器上下载 SQLite 数据库，在本地计算机上更新 clf 对象，并上传新的序列化文件到 PythonAnywhere。为了在本地计算机更新分类器，我们在 movieclassifier 目录下创建一个 update.py 脚本文件，并键入以下代码:

```python
import pickle
import sqlite3
import numpy as np
import os
from vectorizer import vect

def update_model(db_path, model, batch_size=1000):
	conn =- sqlite3.connect(db_path)
	c = conn.cursor()
	c.execute('SELECT * from review_db')
	results = c.fetchmany(batch_size)

	while results:
		data = np.array(results)
		X = data[:, 0]
		y = data[:, 1].astype(int)

		classes = np.array([0, 1])
		X_train = vect.transform(X)
		clf.partial_fit(X_train, y, classes=classes)
		results = c.fetchmany(batch_size)

	conn.close()
	return None

cur_dir = os.path.dirname(__file__)
clf = pickle.load(open(os.path.join(
		cur_dir, 'pkl_objects/classifier.pkl'), 'rb'))
db = os.path.join(cur_dir, 'reviews.sqlite')

pickle.dump(clf, open(os.path.join(
		cur_dir, 'pkl_objects/classifier.pkl'), 'wb'), 
		protocol=4)

```

update_model 函数以每次 1000条记录的方式从数据库中读取数据，如果记录数量小于 10000条，则根据实际数量读取。或者我们可以将代码中的 fetchmany 改为 fetchone，从而每次只读取一条记录，但是这样计算效率会非常差。但是使用 fetchall 方法，则可能在面对海量数据时导致计算机或服务器的内存溢出。

创建好 update.py 脚本后，我们将其上传到 PythonAnywhere 服务器上的 movieclassifier 目录下，并在应用的入口脚本 app.py 中导入 update_model 函数，确保每次重启 Web 服务器后，能够根据 SQLite 数据库内容对分类器进行更新。为了实现此功能，我们需要在 app.py 开头增加一行导入 update.py 脚本中 update_model 函数的代码:

```python
from update import update_model

```

然后，我们就可以在主脚本中调用 update_model 函数了:

```python
if __name__ == '__main__':
    update_model(db_path=db, model=clf, batch_size=10000)
    app.run(debug=True)

```

# 9.6 本章小结

在本章，读者学到了许多对扩充我们机器学习理论知识的实用主题。我们学习了如何在模型训练完后对其进行持久化，以及如何在日后重新实用经过持久化的模型。此外，我们使用 SQLite 数据库高效地存储数据，并创建了一个 Web 应用，使得我们电影分类器可以供外界使用。

在本书中，我们已经讨论了许多机器学习的概念、最佳实践方式，以及用于分类的监督模型。在下一章，我们将学习监督学习的另一个分支: 回归分析，与我们已经学习过的分类模型不同，它的输出不是基于类标数据的类标，而是在某个区间上的连续值。