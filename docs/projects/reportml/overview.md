# ReportML

## 1. 简介

ReportML 作为一款跨平台的机器学习框架，它不仅是支持快速建模的 AutoML 框架，还是一个自动输出模型报告的框架。考虑到很多业务场景中建模依旧还是使用 Excel 作为模型输出报告，ReportML 会记录自动建模中的各种细节，并产出一份非常美观的 Excel 模型报告。

=== "1. SETUP"

    ![SETUP](../../images/20250211-01.png)

=== "2. 数据报告"

    ![数据报告](../../images/20250211-02.png)

=== "3. 变量WoE表"

    ![WoE表](../../images/20250211-03.png)

=== "4. 变量WoE图"

    ![WoE图](../../images/reportml-preview.png)

=== "5. 变量逐月稳定性"

    ![变量逐月稳定性](../../images/20250211-04.png)

=== "6. LR 模型结果"

    ![LR 模型结果1](../../images/20250211-05.png)
    ![LR 模型结果2](../../images/20250211-06.png)

=== "7. LGBM 模型结果"

    ![LGBM 模型结果1](../../images/20250211-07.png)
    ![LGBM 模型结果2](../../images/20250211-08.png)

## 2. 安装

ReportML 暂未开源，目前可提供加密后的安装包，用户下载后执行以下命令进行安装:

```bash
pip install ./report-1.0.0-py3-none-any.whl
```

## 3. 快速入门

目前 ReportML 暂未提供 CLI，后续会添加，使用需要自行构建 YAML 配置文件（目前配置项较多，后续会进行精简，更易于使用）：

???+ example "使用 ReportML 快速输出模型报告"

    === "YAML 配置文件"

        ```yaml linenums="1" title="uci001_adult.yml"
        project_config:
            name: "uci_adult"
            version: 0.1
            created_date: ""
            updated_date: ""
            finished_date: "2024-06-20"
            author: "郁明敏"

            dataset_config:
            train_file: "data/preprocessed/uci_001_adult_dataset.csv"
            test_file: ""
            target: "target_income_greater_than_50k"
            date_columns:
                - dt
                - month
            include_columns: []
            test_from_train: true
            random_seed: 42
            test_size_from_train: 0.2
            val_size_from_train: 0.2
            test_split_by_date: "2024-04-01"
            feature_desc_dict:
                - feat_name: age
                feat_cate: "用户基础属性"
                feat_desc: "年龄"
                - feat_name: workclass
                feat_cate: "工作信息"
                feat_desc: "工作类别"
                - feat_name: education-num
                feat_cate: "用户基础属性"
                feat_desc: "教育等级"
                - feat_name: marital-status
                feat_cate: "用户基础属性"
                feat_desc: "婚姻状况"
                - feat_name: race
                feat_cate: "用户基础属性"
                feat_desc: "种族"
                - feat_name: sex
                feat_cate: "用户基础属性"
                feat_desc: "性别"
                - feat_name: capital-gain
                feat_cate: "其他"
                feat_desc: "未知"
                - feat_name: capital-loss
                feat_cate: "其他"
                feat_desc: "未知"
                - feat_name: hours-per-week
                feat_cate: "工作信息"
                feat_desc: "每周工作时长"
                - feat_name: native-country
                feat_cate: "用户基础属性"
                feat_desc: "祖国"
                - feat_name: occupation
                feat_cate: "工作信息"
                feat_desc: "职业"
            # 特征的数据字典文件，优先 feature_desc_dict 信息
            feature_desc_dict_file: "./feature_dict/uci001_adult_feat_dict.xlsx"

            # 报告类别: excel / web
            report_type: excel
            # 选用模型类别: lr / lgbm / xgb，可多选
            apply_models:
            - lr

            excel_config:
            output_path: results/uci_001_audit.xlsx


            eda_config:
            # 将 EDA 结果输出到 Excel 中的配置
            sheet_name: "2. 数据报告"
            cols_num_format:
                Missing_Rate: "0.00%"
            cols_databar:
                - Missing_Rate
                - Unique
            cols_font_color: {}
            exclude_cols: ["dt",  "month"]


            woe_config:
            # 将 WoE-IV 结果输出到 Excel 中的配置
            sheet_name: "3. 变量WoE"
            cols_num_format:
                Bad_Rate: "0.00%"
                Pct_Bad: "0.00%"
                Pct_Good: "0.00%"
                Pct_Bin: "0.00%"
                Bin_Bad_Total_Rate: "0.00%"
                Bin_Good_Total_Rate: "0.00%"
                Pct_Bad_Cum: "0.00%"
                Pct_Bin_Bad: "0.00%"
                Pct_Bin_Good: "0.00%"
            cols_databar:
                - Bad_Rate
                - WoE
            cols_font_color:
                Pct_Bad: "d76343"
                Pct_Good: "2596be"
            exclude_cols: ["dt",  "month"]
            apt_bins:
                - name: "age"
                bins: [0, 25, 30, 35]
            #  woe_conf_file: "conf/woe.json"
            #  woe_save_path: "conf/woe.json"


            select_config:
            # 如果 P1 和 P95 分位数相同，等同于 95% 的缺失率
            drop_missing_rate_threshold: 0.95
            drop_category_unique_num_threshold: 20
            drop_woe_bin_prop_threshold: 0.05
            drop_iv_threshold: 0.02
            drop_woe_not_monotonous: true
            # 相关系数大于 0.9，保留 IV 高的特征
            drop_corr_threshold: 0.9
            drop_psi_threshold: 0.1
            drop_lr_z_negative: true


            # 算法配置参数
            lr_config:
            sheet_name: "4. LR模型结果"
            exclude_cols: ["dt",  "month"]
            cols_num_format:
                Z_Prop: "0.00%"
                Shap: "0.00"
                Selected_Prop: "0.00%"
                Cum_Bad_Prop: "0.00%"
                Cum_Good_Prop: "0.00%"
                Bad_Rate: "0.00%"
                Bad_Prop: "0.00%"
                Good_Prop: "0.00%"
                Bin_Prop: "0.00%"
            cols_databar:
                - "z"
                - "P>|z|"
                - "IV"
                - "Corr"
                - "Shap"
                - "Selected_Cate_Rate"
                - "Selected_Model_Rate"
                - "Bad_Rate"
                - "KS"
                - "Z_Prop"
                - "Selected_Prop"
            cols_font_color:
                Cum_Bad_Prop: "d76343"

            epochs: 100
            learning_rate: 0.01


            lgbm_config:
            sheet_name: "5. LGBM模型结果"
            exclude_cols: ["dt",  "month"]
            cols_num_format:
                Shap: "0.00"
                Split: "0.00"
                Split_Prop: "0.00"
                Gain: "0.00"
                Gain_Prop: "0.00"
                Selected_Prop: "0.00%"
                Cum_Bad_Prop: "0.00%"
                Cum_Good_Prop: "0.00%"
                Bad_Rate: "0.00%"
                Bad_Prop: "0.00%"
                Good_Prop: "0.00%"
                Bin_Prop: "0.00%"

            cols_databar:
                - "IV"
                - "Gain"
                - "Gain_Prop"
                - "Split"
                - "Split_Prop"
                - "Corr"
                - "Shap"
                - "Shap_Prop"
                - "Selected_Cate_Rate"
                - "Selected_Model_Rate"
                - "Bad_Rate"
                - "KS"
                - "Selected_Prop"

            params:
                boosting: gbdt
                num_leaves: 10
                objective: binary
                max_depth: 4
                learning_rate: 0.05
                max_bin: 10
                max_cat_threshold: 5
                bagging_fraction: 0.8
                bagging_freq: 10
                feature_fraction: 0.8
                min_data_in_leaf: 500
                seed: 30
                metric:
                - auc
                - binary_logloss
                early_stopping_rounds: 100
                verbose: -1
            epochs: 3000
            save_path: ""
            model_path: ""

            xgb_config:
            epochs: 100
            learning_rate: 0.01
        ```

    === "主程序"

        ```python linenums="1"
        from reportml import ModelReport


        model_report = ModelReport("uci001_adult.yml")
        model_report.generate()
        ```
