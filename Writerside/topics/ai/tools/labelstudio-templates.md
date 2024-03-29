# 项目模板

<show-structure for="chapter,procedure" depth="2"/>

## 1. 录音信息挖掘

在做 NLP 相关模型时，常常需要通过人工去听一些录音来发现一些业务 Insights，当然这个过程中也会需要记录一些相关信息，通过此模板可以极大地提高操作效率，具体包含以下功能:
- **基本信息**: 表格形式展示用户的基本信息，更好地理解对话内容
- **音频播放**: 在 Label Studio 上直接播放相关音频，并且可以自由选择播放片段
- **内容展示**: 如果音频有 ASR 转写，则以对话形式展示内容
- **实体标注**: 在某一句上标注实体信息，比如标注一段文字为用户诉求

### 1.1 XML模板

下面这段 XML 代码可以根据自己的实际业务需求进行缸盖，创建项目时在 **Labeling Setup** 中填入。

```xml
<View style="box-shadow: 2px 2px 5px #999;
            padding: 20px; margin-top: 2em;
            border-radius: 5px;">
    <View style="box-shadow: 2px 2px 5px #999;
              padding: 20px; margin-top: 2em;
              border-radius: 5px;">
        <Header value="用户基本信息"/>
        <Table name="table" value="$item"/>
    </View>
    <View style="box-shadow: 2px 2px 5px #999;
              padding: 20px; margin-top: 2em;
              border-radius: 5px;">
        <Header value="用户基本信息"/>
        <Table name="table" value="$userInfo"/>
    </View>
    <View style="box-shadow: 2px 2px 5px #999;
              padding: 20px; margin-top: 2em;
              border-radius: 5px;">
        <ParagraphLabels name="entity" toName="paragraphs">
            <Label value="咨询的问题"></Label>
            <Label value="询问天气"></Label>
        </ParagraphLabels>
        <Paragraphs audioUrl="$audio" value="$dialog" name="paragraphs"
                    layout="dialogue" textKey="text" nameKey="author"
                    showPlayer="true"/>
    </View>
    <View style="box-shadow: 2px 2px 5px #999;
              padding: 20px; margin-top: 2em;
              border-radius: 5px;">
        <Header value="咨询的问题"/>
        <TextArea name="ask_q" toName="paragraphs" skipDuplicates="true" editable="true"/>
        <Header value="询问天气"/>
        <TextArea name="ask_w" toName="paragraphs" skipDuplicates="true" editable="true"/>
    </View>
</View>

<!--示例JSON-->
<!-- {
  "data":{
      "audio": "http://label-studio.ai.com/static/recordings/1.wav",
      "userInfo": {
            "姓名": "张三",
            "性别": "男",
            "年龄": 20
      },
      "dialog": [
            {"author": "Mia Wallace:", "text": "Don't you hate that?", "start": 0.0, "end": 2.0},
            {"author": "Vincent Vega:", "text": "Hate what?", "start": 2.0, "end": 3.0}
        ]
      }
}-->
```
{collapsible="true" default-state="collapsed" collapsed-title="信息挖掘模板XML"}

### 1.2 导入数据 {collapsible="true" default-state="collapsed"}

如果是通过上传 JSON 文件或者通过 Label Studio SDK 进行导入，数据格式如下:

```json
[
  {
    "data": {
        "audio": "http://label-studio.ai.com/static/recordings/1.wav",
        "userInfo": {
          "姓名": "张三",
          "性别": "男",
          "年龄": 20
        },
        "dialog": [
          {
            "author": "Mia Wallace:",
            "text": "Dont you hate that?",
            "start": 0.0,
            "end": 2.0
          },
          {
            "author": "Vincent Vega:",
            "text": "Hate what?",
            "start": 2.0,
            "end": 3.0
          }
        ]
    }
  }
]
```
{collapsible="true" default-state="collapsed" collapsed-title="导入示例JSON数据"}

### 1.3 界面展示 {collapsible="true" default-state="collapsed"}

![录音信息挖掘界面展示](labelstudio_data_mining_for_recording.png)

### 1.4 音频获取失败问题

该模板涉及到获取远程音频文件，可能会出现跨域的问题，具体问题以及解决方案，请参考[常见问题](%mysite%/labelstudio-faq)


<seealso>
    <category ref="ref_docs">
        <a href="https://labelstud.io/tags/audio">LabelStudio Audio</a>
        <a href="https://labelstud.io/tags/paragraphs">LabelStudio Paragraphs</a>
        <a href="https://labelstud.io/tags/paragraphs#Example-1">LabelStudio Paragraphs示例</a>
    </category>
</seealso>
