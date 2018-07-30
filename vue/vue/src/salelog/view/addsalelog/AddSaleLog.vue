<script>
    import {Indicator} from 'mint-ui';
    import {Toast} from 'mint-ui';
    import {MessageBox} from 'mint-ui';
    import {mapState} from 'vuex'

    const sysConfig = require('sysConfig');
    const dateUtil = require('DateUtil');
    const Util = require('Util');
    const http = require('Http');
    const gData = require('zhixin').data;
    const draftMgr = require('./draft');
    const {bindNavBar, sendBroadcast} = require('egovanative');

    const INDEX_TODAY = 0;//今天
    const INDEX_YESTERDAY = 1;//昨天
    const INDEX_DAY_BEFORE = 2;//前天

    // 格式：2016-06-29
    function getDate(dateIndex) {
        var date = new Date();
        if (dateIndex == INDEX_YESTERDAY) {
            date = dateUtil.addDays(date, -1);
        } else if (dateIndex == INDEX_DAY_BEFORE) {
            date = dateUtil.addDays(date, -2);
        }
        return dateUtil.formatDate(date.getTime(), dateUtil.FORMAT_YMD);
    }

    function getDateIndexByTime(updateTime) {
        //如果不是昨天和前天，就认为是今天
        var index = INDEX_TODAY;
        if (updateTime) {
            var date = dateUtil.parseDate(updateTime);
            var dateStr = dateUtil.formatDate(date.getTime(), dateUtil.FORMAT_YMD);
            if (dateStr == getDate(INDEX_YESTERDAY)) {
                index = INDEX_YESTERDAY;
            } else if (dateStr == getDate(INDEX_DAY_BEFORE)) {
                index = INDEX_DAY_BEFORE;
            }
        }
        return index;
    }

    function defaultData() {
        return {
            sheetVisible: false,
            selectedStage: null,
            selectDateList: [
                {name: "今天", date: getDate(INDEX_TODAY), index: INDEX_TODAY},
                {name: "昨天", date: getDate(INDEX_YESTERDAY), index: INDEX_YESTERDAY}
            ],
            selectedDate: null,
            actionSheetList: [],
            selectedProject: null,
            salelogContent: '',

            isSyncWorkTime: false,
            salelogType: sysConfig.SALELOG_TYPE_LIST[0],
            saleLogId: null,//销售日志id，编辑状态下有用
            isEditMode: false,//是否是编辑状态
            needSaveDraft: true,//保存日志成功则置其为false
            callback: null,
            draftBtnText: ''
        }
    }

    module.exports = {
        methods: {
            goBack() {
                this.$router.go(-1);
            },
            goDraft() {
                this.$router.push({
                    name: "draft",
                    params: {
                        callback: (item)=> {
                            this.salelogContent = item.logContent;
                        }
                    }
                })
            },
            selectStage() {
                this.sheetVisible = true;
                this.actionSheetList = this.stageTextList;
            },
            onSelectedStageItem(item) {
                this.selectedStage = item;
            },
            selectType() {
                if (this.isEditMode) {
                    return;
                }
                this.sheetVisible = true;
                this.actionSheetList = this.salelogTypeTextList;
            },
            onSelectedTypeItem(item) {
                this.salelogType = item;
            },
            selectDate() {
                if (this.isEditMode) {
                    return;
                }
                this.sheetVisible = true;
                this.actionSheetList = this.selectDateList;
            },
            onSelectedDateItem(item) {
                this.selectedDate = item;
                if (!this.isEditMode) {
                    if (this.isTypeProject()) {
                        this.restoreTodayProjectWork();
                    } else {
                        this.restoreTodayOtherWork();
                    }
                }
            },
            selectProject() {
                if (this.isEditMode) {
                    return;
                }
                this.$router.push({name: "projectList", params: {callback: this.onSelectProjectItem}});
            },
            onSelectProjectItem(item) {
                this.selectedProject = item;
                if (!this.isEditMode) {
                    this.restoreTodayProjectWork();
                }

                if (item.projectStageId > 0) {
                    this.selectedStage = sysConfig.getProjectStage(item.projectStageId);
                }
            },
            getStageId() {
                if (this.selectedStage) {
                    return this.selectedStage.projectStageId + '';
                }
                return null;
            },
            getProjectId() {
                if (this.selectedProject) {
                    return this.selectedProject.projectId + '';
                }
                return null;
            },
            saveSalelog() {
                if (!this.checkInputValid()) {
                    return;
                }
                Indicator.open();
                var saleLogObj = this.buildSaleLogObj();
                http.ajax({
                    functionName: "/home/salelog/savesaleloginfo",
                    params: {
                        syncGs: this.isSyncWorkTime ? 1 : 0,
                        salelog: JSON.stringify(saleLogObj),
                        dateType: getDateIndexByTime(this.selectedDate.date)
                    },
                    success: (data) => {
                        if (data && data.resultInfo) {
                            var resultInfo = data.resultInfo;
                            if (resultInfo.success) {

                                this.needSaveDraft = false;
                                draftMgr.clearDraft(this.getSalelogTypeId());

                                if (resultInfo.data && resultInfo.data.salelog) {
                                    if (this.isTypeProject()) {
                                        draftMgr.saveLastProject(this.selectedProject);
                                    }
                                }

                                var statusCode = resultInfo.code;
                                var message = null;
                                if (statusCode === 0) {
                                    message = "同步工时成功";
                                    sendBroadcast(sysConfig.plugin.ACTION_REFRESH_PLUGIN_COUNT, {
                                        PluginCode: sysConfig.plugin.PLUGIN_GS
                                    })
                                } else if (statusCode === 1) {
                                    message = "同步工时失败:尚未验证账户"
                                } else if (statusCode === 2) {
                                    message = "同步工时失败";
                                }
                                if (message) {
                                    Toast(message);
                                } else if (resultInfo.message) {
                                    Toast(resultInfo.message);
                                } else {
                                    Toast("保存成功");
                                }
                                this.doCallback();
                                this.goBack(true);
                            } else {
                                alert(data.resultInfo.message);
                            }
                        }
                    },
                    error: (data) => {
                        alert("添加记录错误");
                    },
                    finally: () => {
                        Indicator.close();
                    }
                });
            },
            checkInputValid() {
                if (Util.isStrEmpty(this.salelogContent)) {
                    Toast("日志不能为空！");
                    return false;
                }

                if (this.isTypeProject()) {
                    if (!this.getProjectId()) {
                        Toast("请选择项目");
                        return false;
                    }

                    if (!this.getStageId()) {
                        Toast("请选择阶段");
                        return false;
                    }
                }
                return true;
            },
            buildSaleLogObj() {
                var obj = {
                    logContent: this.salelogContent,
                    saleLogTime: this.selectedDate.date,
                    createHumanId: gData.humanID,
                    deleteFlag: "0",
                    logTypeID: this.getSalelogTypeId() + ''
                };
                if (this.isTypeProject()) {
                    obj.projectStageId = this.getStageId();
                    obj.projectId = this.getProjectId();
                    if (this.saleLogId && this.isEditMode) {
                        obj.saleLogId = this.saleLogId + '';
                    }
                }

                return obj;
            },
            buildTemplate() {
                var salelog = {
                    logContent: this.salelogContent,
                    logTypeID: this.getSalelogTypeId()
                }
                if (this.isTypeProject()) {
                    salelog.projectItem = this.selectedProject;
                    salelog.stageItem = this.selectedStage;
                }

                return salelog;
            },
            getSalelogTypeId() {
                if (this.salelogType) {
                    return this.salelogType.id;
                }
                return -1;
            },

            goVerify(needCheck) {
                this.$router.push({
                    name: "verifyUser",
                    params: {
                        callback: ()=> {
                            if (needCheck) {
                                this.clickSyncWorkTime();
                            }
                        }
                    }
                });
            },

            clickSyncWorkTime() {
                if (this.isVerify) {
                    this.isSyncWorkTime = !this.isSyncWorkTime;
                } else {
                    this.goVerify(true);
                }
            },

            isTypeProject () {
                if (this.salelogType) {
                    return this.salelogType.id == 1;
                }
                return false;
            },
            buildProjectItem(id, name, stageId) {
                return {
                    projectId: id,
                    projectName: name,
                    projectStageId: stageId
                }
            },
            getDateItemByTime(updateTime) {
                var index = getDateIndexByTime(updateTime);
                return this.selectDateList[index];
            },
            saveTemplate() {
                var salelog = this.buildTemplate();
                if (!salelog.logContent) {
                    Toast("日志内容为空");
                    return;
                }
                var result = draftMgr.saveTemplate(salelog);
                this.resetDraftBtnText();
                Toast(result ? "保存草稿成功" : "保存草稿失败");
            },

            restoreTemplate(item) {
                //模板的时间就不恢复，意义不大，也没保存
                this.salelogContent = item.logContent;

                if (this.isTypeProject()) {
                    //由于编辑模式不能改变项目，因此即使我们恢复模板也没有理由覆盖项目
                    if (this.isEditMode) {
                        Toast("编辑模式不能改变项目");
                    } else {
                        this.selectedProject = item.projectItem;
                    }
                    this.selectedStage = item.stageItem;
                }

            },

            /**
             * 恢复存档，日志类型和日志内容，如果是项目，还恢复阶段和所选项目
             */
            restoreDraft(salelog) {
                this.salelogType = sysConfig.getSalelogType(salelog.logTypeID);
                this.salelogContent = salelog.logContent;

                if (this.isTypeProject()) {
                    this.selectedProject = salelog.projectItem;
                    this.selectedStage = salelog.stageItem;
                }
            },

            restoreEdit(salelog) {
                this.salelogContent = salelog.logContent;
                this.salelogType = sysConfig.getSalelogType(salelog.logTypeID);

                if (this.isTypeProject()) {
                    var project = salelog.project;
                    if (project) {
                        this.selectedProject = this.buildProjectItem(project.projectId, project.projectName);
                    }
                    this.selectedStage = sysConfig.getProjectStage(salelog.projectStageId);
                }

                this.selectedDate = this.getDateItemByTime(salelog.updateTime);
            },

            /**
             * 根据当前选择的项目和日期恢复今天所填写的日志，之所以考虑日期，因为：
             *
             * 1，今天可以填写昨天和前天的日志
             * 2，后台会根据项目和日期来判断是新增日志还是修改日志，这样当用户选择
             * 了已经填写的项目&日期时就会恢复内容，用户就可以清楚的知道如果提交就
             * 会修改该日志。用户清不清楚这一点，其实我也没把握。
             *
             * 没有考虑到的情况是，如果用户昨天填了当天的项目A，今天又选择填写昨天
             * 以及项目A，这时由于传入的列表只是今天填写的日志，其中中不包括该条记
             * 录，因此就无法恢复，但是后台依然会修改该条销售日志。
             *
             * 日期和项目已经确定了，只需要恢复内容和阶段即可
             */
            restoreTodayProjectWork() {
                var list = this.getTodaySalelogList();

                for (var i = 0, len = list ? list.length : 0; i < len; i++) {
                    var salelog = list[i];
                    var candidate = salelog.project;
                    var dateIndex = getDateIndexByTime(salelog.updateTime);
                    if (candidate
                            && candidate.projectId == this.selectedProject.projectId
                            && dateIndex == this.selectedDate.index) {
                        this.salelogContent = salelog.logContent;
                        this.selectedStage = sysConfig.getProjectStage(salelog.projectStageId);
                        break;
                    }
                }
            },
            restoreTodayOtherWork() {
                var list = this.getTodaySalelogList();

                // 根据当前所选择的日期恢复今天所填写的的日志，默认是今天
                // 这里的情况和项目推进一样，区别是没有项目这条约束
                for (var i = 0, len = list ? list.length : 0; i < len; i++) {
                    var salelog = list[i];
                    var dateIndex = getDateIndexByTime(salelog.updateTime);
                    if (dateIndex == this.selectedDate.index) {
                        this.salelogContent = salelog.logContent;
                        break;
                    }
                }
            },

            getTodaySalelogList() {
                return this.todaySalelogList;
            },

            /**
             * 获取最近填写的项目信息
             */
            getLatestProjectInfo(onGetProject) {
                Indicator.open('正在获取最新项目信息');
                http.ajax({
                    functionName: "/home/salelog/getprojectnameandstage",
                    params: {
                        humanID: gData.humanID
                    },
                    success: (data) => {
                        if (data && data.success && data.data) {
                            var list = data.data.list;
                            var project = list && list.length > 0 && list[0]
                            if (project) {
                                onGetProject(this.buildProjectItem(project.ProjectID, project.ProjectName, project.ProjectStageID))
                            }
                        }
                    },
                    finally: () => {
                        Indicator.close();
                    }
                });

            },
            /**流程：是否编辑->是否有草稿->今天是否填写
             *
             * 将手动保存的视为模板，自动保存的视为草稿。首先查找草稿，如果存在则恢复草稿
             * 否则恢复上一次编辑的项目，并根据项目和所选日期在今天所填写的销售日志中查
             * 询是否存在相匹配（即项目和日期一致）的销售日志，如果有则将销售日志内容以及
             * 阶段恢复。
             *
             * 对于其他工作，由于不存在项目，直接根据所选日期查询今天是否填写了销售日志，如果有
             * 则恢复日志内容。
             */
            restoreOnCreate() {
                var params = this.$route.params;
                if (params && params.salelog) {
                    this.isEditMode = true;
                    this.saleLogId = params.salelog.saleLogId;
                    this.restoreEdit(params.salelog);
                    return;
                }

                var salelog = draftMgr.getDraft();
                if (salelog) {
                    this.restoreDraft(salelog);
                    draftMgr.clearDraft();
                    return;
                }

                if (this.isTypeProject()) {
                    //项目推进。为了使阶段最新，不再使用draftMgr.getLastProject()
                    this.getLatestProjectInfo(project => {
                        this.selectedProject = project;
                        this.restoreTodayProjectWork();
                        //无论是否找到当天填写的销售日志，我们都需要将stage恢复到最新
                        if (project.projectStageId) {
                            this.selectedStage = sysConfig.getProjectStage(project.projectStageId);
                        }
                    });
                } else {
                    //其他工作
                    this.restoreTodayOtherWork();
                }

            },
            initOnCreate() {
                Util.resetObject(this, defaultData());

                Indicator.close();
                this.selectDateList.map(item => {
                    item.method = ()=> {
                        this.onSelectedDateItem(item);
                    }
                });
                this.selectedDate = this.selectDateList[INDEX_TODAY];

                this.$watch('isSyncWorkTime', function (newVal, oldVal) {
                    if (newVal && !this.isVerify) {
                        this.isSyncWorkTime = false;
                    }
                });

                if (this.isVerify) {
                    this.clickSyncWorkTime();
                }

                this.resetDraftBtnText();

                this.restoreOnCreate();
            },
            doCallback() {
                if (this.callback) {
                    this.callback();
                }
            },
            resetDraftBtnText(){
                var count = draftMgr.getTemplateList().length;
                this.draftBtnText = "草稿(" + count + ")";
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
            clearContent() {
                MessageBox.confirm('确定清空日志内容？').then(action => {
                    this.salelogContent = '';
                }, cancel=> {
                });
            },
            bindNavBarImpl() {
                bindNavBar(this.salelogType.name, this.draftBtnText, () => {
                    this.goDraft();
                })
            }
        },
        beforeRouteLeave (to, from, next)  {
            if (this.needSaveDraft) {
                var obj = this.buildTemplate();
                if (obj.logContent) {
                    draftMgr.saveDraft(obj);
                }
            }
            next();
        },
        beforeRouteEnter (to, from, next) {
            if (from.name == "home") {
                next(vm => {
                    vm.insertBackClickListener();
                    vm.initOnCreate();
                    vm.bindNavBarImpl();
                    vm.callback = vm.$route.params.callback;
                })
            } else if (from.name == "draft") {///
                next(vm => {
                    //用户可能删除草稿，重新刷新下按钮上的数字
                    vm.resetDraftBtnText();
                    vm.insertBackClickListener();
                    vm.bindNavBarImpl();
                })
            } else {
                next(vm => {
                    vm.insertBackClickListener();
                    vm.bindNavBarImpl();
                });
            }
        },
        watch: {
            salelogType() {
                this.bindNavBarImpl();
            },
            draftBtnText() {
                this.bindNavBarImpl();
            }
        },

        data() {
            return defaultData();
        },
        computed: {
            ...mapState([
                'todaySalelogList',
                'isVerify'
            ]),
            stageTextList() {
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
            salelogTypeTextList() {
                var list = sysConfig.SALELOG_TYPE_LIST;
                return list.map(item=> {
                    return {
                        name: item.name,
                        method: ()=> {
                            this.onSelectedTypeItem(item)
                        }
                    }
                })
            },
            selectedStageText() {
                return this.selectedStage
                        ? this.selectedStage.projectStageName
                        : '点击选择阶段';
            },

            selectedDateText() {
                return this.selectedDate
                        ? this.selectedDate.name
                        : '点击选择时间';
            },
            selectedProjectText() {
                return this.selectedProject
                        ? this.selectedProject.projectName
                        : '点击选择项目';
            }
        },
    }
</script>
<template>
    <div>
        <mt-header fixed v-on:backClick="goBack" :title="salelogType.name">
            <mt-button slot="right" @click.native="goDraft">{{draftBtnText}}</mt-button>
        </mt-header>
        <div class="mint-content">
            <div>
                <mt-cell @click.native="selectType" title="类型" v-if="!isEditMode">
                    <span class="mint-cell-allow-right mint-cell-arrow-text">{{salelogType.name}}</span>
                </mt-cell>
                <mt-cell @click.native="selectDate" title="日期">
                    <span class="mint-cell-arrow-text" :class="{'mint-cell-allow-right': !isEditMode}">
                        {{selectedDateText}}
                    </span>
                </mt-cell>
                <mt-cell @click.native="selectProject" title="项目" v-if="isTypeProject()">
                    <span class="mint-cell-arrow-text" :class="{'mint-cell-allow-right': !isEditMode}">
                        {{selectedProjectText}}
                    </span>
                </mt-cell>
                <mt-cell @click.native="selectStage" title="阶段" v-if="isTypeProject()">
                    <span class="mint-cell-arrow-text mint-cell-allow-right">{{selectedStageText}}</span>
                </mt-cell>
            </div>

            <div id="inputWrapper" class="bdr-b bdr-t">
                <textarea id="salelogContent" placeholder="请填写项目推进情况" rows="6" v-model="salelogContent"></textarea>
                <i class="icon-remove-sign icon-large textGray" id="btnClearContent" @click="clearContent"></i>
                <i class="icon-save icon-large textGray" id="btnSaveDraft" @click="saveTemplate"></i>
            </div>

            <div class="row" id="workTimeWrapper">
                <i :class="[isSyncWorkTime ? 'icon-check' : 'icon-check-empty']" class="col-center" @click="clickSyncWorkTime"></i>
                <div @click="clickSyncWorkTime" id="syncWorkTimeDesc" class="col-center col">同步工时</div>
                <div @click="goVerify(false)" id="btnVerify" class="col-center">验证</div>
            </div>

            <mt-actionsheet
                    :actions="actionSheetList"
                    cancelText=""
                    v-model="sheetVisible">
            </mt-actionsheet>
        </div>
        <div class="bottomSection bdr-t flex center-child center-content" @click="saveSalelog">
            <span class="col-center">提交</span>
        </div>
    </div>
</template>
<style scoped>

    #btnClearContent {
        position: absolute;
        top: 0;
        right: 0;
        padding: 10px;
    }

    #btnSaveDraft {
        position: absolute;
        bottom: 0;
        right: 0;
        padding: 10px;
    }

    .textBlue {
        color: #37AEFF;
    }

    .textGray {
        color : #929292;
    }

    .bottomSection {
        background-color: white;
        position: fixed;
        bottom: 0;
        width: 100%;
        height: 48px;
        color: #37AEFF;
        z-index: 11;
    }

    .bottomBtnImg {
        background-size: cover;
        font-size: 22px;
        color: inherit;
        margin-right: 10px;
        width: 22px;
        height: 22px;
    }

    .mint-content {
        padding-top: 10px;
    }

    .mint-cell {
        min-height: 40px;
    }

    #salelogContent {
        width: 100%;
        border: none;
        padding: 10px 40px 10px 10px;
        font-size: 15px;
        outline: none;
    }

    #salelogContent::before {
        left: 0;
    }

    #inputWrapper {
        margin-top: 10px;
        position: relative;
    }

    #syncWorkTime {
        padding: 0;
    }

    #workTimeWrapper {
        padding: 10px;
        margin-top: 5px
    }

    #syncWorkTimeDesc {
        margin-left: 5px;
        font-size: 16px
    }

    #btnVerify {
        color: #075095;
        font-size: 16px;
        border-bottom: 1px solid;
    }

    #btnCommit {
        width: 100%;
    }

    #btnCommitWrapper {
        padding: 10px;
    }
</style>