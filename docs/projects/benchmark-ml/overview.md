# Benchmark ML

=== ":material-video:{ style="color:rgb(59, 29, 232);" } Video"


    ![type:video](https://mingminyu.github.io/webassets/videos/benchmark-ml-v1.mp4)

=== ":fontawesome-brands-youtube:{ style="color: #EE0F0F;" } Youtube"

    ![type:video](https://www.youtube.com/embed/t6QJXN5OFbc)

=== ":fontawesome-brands-bilibili:{ style="color:hsla(0, 67.20%, 74.90%, 0.86);" } B站"

    ![type:video](https://player.bilibili.com/player.html?isOutside=true&aid=113980177649738&bvid=BV15ENaeUEMD&cid=28319485459&autoplay=0&danmaku=0&p=)

Benchmark ML 是基于 ReportML 自动化建模库开发的 Web 平台（前端技术栈使用 React + Ant Design + NextJS 展示可视化报告，后端技术栈使用 FastAPI + ReportML 实现自动化建模），未来计划完成以下功能：

- [ ] 增加模型训练全自动化 Web 流程，实现 LR/XGB/LGBM 的常用以及全超参数的调整；
- [ ] 新建模型可从之前版本的模型文档中引入重要变量，并可以对变量的 WOE 分组结果进行手动调整；
- [ ] 实时查看当前训练模型的进度以及阶段性的结果；
- [ ] 结合 Git 实现模型版本控制，在异常时可实现版本的快速回滚；
- [x] 可视化展示模型报告，并支持一键导出 Excel；
- [ ] 实现模型一键部署，建立审批、上线、监控以及自动迭代的自动化全流程；
- [ ] 模型文档的查看、编辑权限的控制；
- [ ] 监控到异常情况时自动推送企微、钉钉或者邮件预警；
