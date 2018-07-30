<template>
    <div>
        <mt-header fixed v-on:backClick="goBack" :title="title">
            <mt-button slot="right" @click.native="commit">提交</mt-button>
        </mt-header>
        <div class="mint-content">
            <div>
                <mt-cell id="projectName" title="名称">
                    <input v-model="project.projectName" placeholder="请输入项目名称" type="text"/>
                </mt-cell>
                <mt-cell @click.native="selectStage" title="阶段">
                    <span class="mint-cell-arrow-text mint-cell-allow-right">{{selectedStageText}}</span>
                </mt-cell>
            </div>

            <div class="gap">
                <mt-cell @click.native="selectRegion1" title="大区">
                    <span class="mint-cell-arrow-text mint-cell-allow-right">{{selectedRegion1Text}}</span>
                </mt-cell>
                <mt-cell @click.native="selectRegion2" title="区域">
                    <span class="mint-cell-arrow-text mint-cell-allow-right">{{selectedRegion2Text}}</span>
                </mt-cell>
                <mt-cell @click.native="selectRegion3" title="片区">
                    <span class="mint-cell-arrow-text mint-cell-allow-right">{{selectedRegion3Text}}</span>
                </mt-cell>
            </div>

            <mt-cell @click.native="selectDirector" title="负责人" class="gap">
                <span>{{saleDirectorText}}</span>
            </mt-cell>
            <mt-actionsheet
                    :actions="actionSheetList"
                    cancelText=""
                    v-model="sheetVisible">
            </mt-actionsheet>
        </div>
    </div>
</template>
<style scoped>
    .mint-content {
        padding-top: 10px;
    }

    .gap {
        margin-top: 10px;
    }

    #projectName input {
        width: 100%;
        text-align: right;
        border: none;
        color: inherit;
        font-size: inherit;
    }

    #projectName input:focus {
        outline: none;
    }

    #projectName .mint-cell-value {
        flex: 2;
    }
</style>

<script>
    import {Indicator} from 'mint-ui';
    import {Toast} from 'mint-ui';
    const gData = require('zhixin').data;
    const http = require('Http');
    const sysConfig = require('sysConfig');
    const {bindNavBar, startContactChooseActivity} = require('egovanative');

    module.exports = {
        data(){
            return {
                projectID: null,
                isEdit: false,
                project: {
                    projectName: '',
                    saleDirector: null,
                    saleDirectorName: null,
                },
                selectedStage: null,
                selectedRegion1: null,
                selectedRegion2: null,
                selectedRegion3: null,
                region1List: [],
                region2List: [],
                region3List: [],
                sheetVisible: false,
                actionSheetList: []
            };
        },
        methods: {
            goBack() {
                this.$router.go(-1);
            },
            loadProjectInfo() {
                http.ajax({
                    method: "GET",
                    functionName: "/home/salelog/getprojectinfo",
                    params: {
                        projectID: this.projectID,
                        seniorId: 11,
                        humanID: gData.humanID,
                        select: {},
                    },
                    success: (data) => {
                        if (data && data.success && data.data) {
                            this.project = data.data;
                            this.selectedStage = sysConfig.getProjectStage(this.project.projectStageID);
                            this.selectedRegion1 =
                                    this.buildRegion(this.project.regionName_1, this.project.regionID_1);
                            this.selectedRegion2 =
                                    this.buildRegion(this.project.regionName_2, this.project.regionID_2);
                            this.selectedRegion3 =
                                    this.buildRegion(this.project.regionName_3, this.project.regionID_3);

                            this.getRegion1();
                        }
                    },
                    error: (ignore) => {
                        Toast("该项目不存在");
                        this.goBack();
                    },
                });
            },
            buildRegion(name, id) {
                return {
                    buRegionName: name,
                    buRegionId: id
                }
            },
            /**
             * 获取大区
             */
            getRegion1() {
                http.ajax({
                    functionName: "/home/genericservice/region/getregionbyseniorid",
                    method: "GET",
                    params: {seniorId: 11}, //此处获取大区seniorId写死
                    success: (data)=> {
                        if (data && data.data) {
                            this.region1List = data.data.regions;
                            this.decorateRegionList(this.region1List, 1);
                        }
                    },
                    error: function (data) {
                        console.log("获取大区列表失败");
                    },
                });
            },
            /**
             * 获取区域
             */
            getRegion2 () {
                http.ajax({
                    functionName: "/home/genericservice/region/getregionbyseniorid",
                    method: "GET",
                    params: {seniorId: this.selectedRegion1.buRegionId},
                    success: (data)=> {
                        if (data && data.data) {
                            this.region2List = data.data.regions;
                            this.decorateRegionList(this.region2List, 2);
                        }
                    },
                    error: function (data) {
                        console.log("获取区域列表失败");
                    },
                });
            },

            /**
             * 获取片区
             */
            getRegion3 () {
                http.ajax({
                    functionName: "/home/genericservice/region/getregionbyseniorid",
                    method: "GET",
                    params: {seniorId: this.selectedRegion2.buRegionId},
                    success: (data) => {
                        if (data && data.data) {
                            this.region3List = data.data.regions;
                            this.decorateRegionList(this.region3List, 3);
                        }
                    },
                    error: function (data) {
                        console.log("获取片区列表失败");
                    },
                });
            },
            /**
             * 增加name字段和method回调，用来在ActionSheet中展示
             */
            decorateRegionList(list, regionType) {
                if (!list) {
                    return;
                }
                list.map(region=> {
                    region.name = region.buRegionName;
                    region.method = () => {
                        this.onRegionSelected(region, regionType);
                    };
                })
            },
            selectRegion1() {
                this.sheetVisible = true;
                this.actionSheetList = this.region1List;
            },
            selectRegion2() {
                if (this.region2List && this.region2List.length > 0) {
                    this.sheetVisible = true;
                    this.actionSheetList = this.region2List;
                } else if (this.selectedRegion1 == null) {
                    Toast("请先选择大区");
                }

            },
            selectRegion3() {
                if (this.region3List && this.region3List.length > 0) {
                    this.sheetVisible = true;
                    this.actionSheetList = this.region3List;
                } else if (this.selectedRegion2 == null) {
                    Toast("请先选择区域");
                }
            },

            onRegionSelected(item, regionType) {
                if (regionType == 1) {
                    if (this.selectedRegion1 &&
                            item.buRegionId == this.selectedRegion1.buRegionId) {
                        return;
                    }
                    this.selectedRegion1 = item;
                    this.clearRegion(1);
                    this.getRegion2();
                } else if (regionType == 2) {
                    if (this.selectedRegion2 &&
                            item.buRegionId == this.selectedRegion2.buRegionId) {
                        return;
                    }
                    this.selectedRegion2 = item;
                    this.clearRegion(2);
                    this.getRegion3();
                } else if (regionType == 3) {
                    this.selectedRegion3 = item;
                }
            },

            clearRegion(fromRegionType) {
                if (fromRegionType == 1) {
                    this.clearRegion(2);
                    this.selectedRegion2 = null;
                    this.region2List = [];
                } else if (fromRegionType == 2) {
                    this.selectedRegion3 = null;
                    this.region3List = [];
                }
            },
            selectStage() {
                this.sheetVisible = true;
                this.actionSheetList = this.stageTextList;
            },
            onSelectedStageItem(item) {
                this.selectedStage = item;
            },
            selectDirector() {
                var callback = (humanList) => {
                    delete window.saleDirectorClickCallBack;

                    if (!humanList) return;

                    humanList = JSON.parse(humanList);
                    if (humanList.length > 0) {
                        var saleDirector = humanList[0];
                        this.project.saleDirector = saleDirector.ID;
                        this.project.saleDirectorName = saleDirector.name;
                    }
                };
                window.saleDirectorClickCallBack = callback;
                startContactChooseActivity({
                    androidCallbackMethod: "saleDirectorClickCallBack",
                    iosCallback: (humanList) => {
                        if (humanList && humanList.length > 0) {
                            var saleDirector = humanList[0];
                            this.project.saleDirector = saleDirector.ID;
                            this.project.saleDirectorName = saleDirector.name;
                        }
                    },
                    fail: function (errorMsg) {
                        alert(errorMsg);
                    }
                });
            },
            //保存
            commit () {
                if (!this.checkInputValid()) {
                    return;
                }
                Indicator.open();
                http.ajax({
                    functionName: "/home/genericservice/project/saveproject",
                    params: this.buildParams(),
                    success: (data) => {
                        if (data && data.success) {
                            Toast("保存项目成功");
                            var callback = this.$route.params.callback;
                            if (callback) {
                                callback();
                            }
                            this.goBack();
                        } else {
                            Toast("保存项目失败:" + resultInfo.message);
                        }

                    },
                    error: function (data) {
                        alert("保存项目错误");
                    },
                    finally: function () {
                        Indicator.close();
                    }
                });
            },
            checkInputValid() {
                if (!this.project.projectName) {
                    Toast("项目名称不能为空");
                    return false;
                }
                return true;
            },
            buildParams() {
                var params = {
                    projectName: this.project.projectName,
                    createHumanId: gData.humanID
                };
                if (this.project.projectID) {
                    params.projectId = this.project.projectID;
                }
                if (this.selectedStage) {
                    params.projectStageId = this.selectedStage.projectStageId;
                }
                if (this.selectedRegion1) {
                    params.regionID_1 = this.selectedRegion1.buRegionId;
                }
                if (this.selectedRegion2) {
                    params.regionID_2 = this.selectedRegion2.buRegionId;
                }
                if (this.selectedRegion3) {
                    params.regionID_3 = this.selectedRegion3.buRegionId;
                }
                if (this.project.saleDirector) {
                    params.saleDirector = this.project.saleDirector;
                }
                return params;
            },
            initOnCreate() {
                this.projectID = null;
                this.isEdit = false;
                this.project = {
                    projectName: '',
                    saleDirector: null,
                    saleDirectorName: null,
                };
                this.selectedStage = null;
                this.selectedRegion1 = null;
                this.selectedRegion2 = null;
                this.selectedRegion3 = null;

                this.sheetVisible = false;
                this.actionSheetList = [];

                this.projectID = this.$route.params && this.$route.params.projectID;

                if (this.isEdit) {
                    this.loadProjectInfo();
                } else {
                    this.project.saleDirectorName = gData.humanName;
                    this.project.saleDirector = gData.humanID;
                    this.getRegion1();
                }
            },
            insertBackClickListener() {
                this.$route.params.onBackClick = ()=> {
                    if (this.sheetVisible) {
                        this.sheetVisible = false;
                        return true;
                    }
                    return false;
                }
            },
            bindNavBarImpl() {
                bindNavBar(this.title, '提交', () => {
                    this.commit();
                })
            }
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                vm.initOnCreate();
                vm.insertBackClickListener();
                vm.bindNavBarImpl();
            })
        },
        watch: {
            title() {
                this.bindNavBarImpl();
            }
        },
        computed: {
            isEdit() {
                return this.projectID != null;
            },
            title() {
                return this.isEdit ? "编辑项目" : "新建项目";
            },
            stageTextList() {
                //不要直接更改list中的对象，这是全局共享的
                var list = sysConfig.PROJECT_STAGE_LIST;
                return list.map(item=> {
                    return {
                        name: item.projectStageName,
                        method: ()=> {
                            this.onSelectedStageItem(item)
                        }
                    }
                })
            },
            selectedRegion1Text() {
                return this.selectedRegion1 ? this.selectedRegion1.buRegionName : '请选择大区';
            },
            selectedRegion2Text() {
                return this.selectedRegion2 ? this.selectedRegion2.buRegionName : '请选择区域';
            },
            selectedRegion3Text() {
                return this.selectedRegion3 ? this.selectedRegion3.buRegionName : '请选择片区';
            },
            selectedStageText() {
                return this.selectedStage ? this.selectedStage.projectStageName : '请选择阶段';
            },
            saleDirectorText() {
                return this.project.saleDirectorName ? this.project.saleDirectorName : '请选择项目负责人';
            }
        }
    }
</script>
