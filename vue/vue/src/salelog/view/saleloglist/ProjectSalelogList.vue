<template>
    <div>
        <mt-header fixed v-on:backClick="goBack" :title="projectName">
            <mt-button slot="right" @click.native="doConcern">{{concernText()}}</mt-button>
        </mt-header>
        <div class="mint-content sl soft-scrollable">
            <div id="topSalelogListBg">
                <div id="topProjectName" class="center moreLargeFont">{{projectName}}</div>
                <div id="topRegionList" class="center middleFont">
                    {{topRegionText}}
                </div>
                <div id="topStageName" class="center middleFont">
                    {{projectStageName}}
                </div>
                <div style="position: relative;">
                    <div id="topProjectDirector" class="center middleFont">
                        {{directorNameText}}
                    </div>

                    <i id="topEditBtn" class="icon-pencil"
                       v-show="isEdit"
                       @click="goEdit"></i>
                </div>
            </div>
            <div class="sectionEmpty" v-show="isEmpty">
                销售日志列表为空
            </div>
            <div
                 v-infinite-scroll="loadSalelogList"
                 infinite-scroll-disabled="disableLoad"
                 infinite-scroll-distance="10"
                 infinite-scroll-immediate-check="false">

                <div class="item" v-for="item in dataList">
                    <div class="sectionDate">{{item.time}}</div>
                    <div class="salelogContainer" v-for="salelog in item.salelogs">
                        <div class="row">
                            <div class="col col-center middleFont salelogCreateHumanName"
                                 @click="goHumanSalelogPage(salelog)">
                                {{salelog.human.humanName}}
                            </div>
                            <div class="col-center stage smallFont" v-show="salelog.logTypeID == 1">
                                {{getStageName(salelog)}}
                            </div>
                        </div>
                        <div class="logContent wrapWord middleFont"
                             v-html="salelog.logContent">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
    #topRegionList {
        margin-top: 5px;
        color: #555;
    }

    #topStageName {
        margin-top: 5px;
        color: #555;
    }

    #topProjectDirector {
        padding-top: 5px;
        color: #333;
    }

    #topProjectName {
        color: #333;
    }

    #topEditBtn {
        color: #555;
        font-size: 27px;
        float: right;
        top: 0;
        right: 0;
        padding: 5px 20px;
        position: absolute;
    }

    .salelogCreateHumanName {
        color: #3333aa;
        padding: 0;
    }
</style>
<script>
    import {Indicator} from 'mint-ui';
    import {Toast} from 'mint-ui';
    require('./saleloglist.css');
    const gData = require('zhixin').data;
    const http = require('Http');
    const Util = require('Util');
    const concernMgr = require('./concern');
    const sysConfig = require('sysConfig');
    const {bindNavBar} = require('egovanative');
    import {baseData, baseComputed, resolveHasMore, resolveResultData} from 'ListManager';

    function defaultData() {
        return {
            projectID: null,
            projectInfo: null,
            ...baseData()
        }
    }
    module.exports = {
        data() {
            return defaultData();
        },
        methods: {
            goBack() {
                Util.goBack();
            },
            goEdit() {
                this.$router.push({
                    name: "addProject",
                    params: {projectID: this.projectID}
                });
            },
            loadProjectInfo() {
                http.ajax({
                    functionName: "/home/salelog/getprojectinfo",
                    method: 'GET',
                    params: {
                        projectID: this.projectID,
                        humanID: gData.humanID
                    },
                    success: data => {
                        if (data && data.success && data.data) {
                            this.projectInfo = data.data;
                            this.bindNavBarImpl();
                        }
                    }
                });
            },
            loadSalelogList() {
                http.ajax({
                    functionName: "/home/salelog/getpaginationsalelogbyobj",
                    params: {
                        salelog: JSON.stringify({
                            projectId: this.projectID,
                            createHumanId: gData.humanID
                        }),
                        count: sysConfig.COUNT_PER_PAGE,
                        begin: this.dataList.length
                    },
                    success: (resultInfo)=> {
                        resolveResultData.call(this, resultInfo, false);
                    },
                    error: function (data) {
                        Toast("获取销售日志列表错误");
                    }
                });
            },

            doConcern() {
                if (!this.projectInfo) {
                    return;
                }

                if (this.projectInfo.isConcern) {
                    concernMgr.deleteConcern(this.projectInfo.concernID, ()=> {
                        this.projectInfo.isConcern = false;
                        this.projectInfo.concernID = null;
                    }, null);
                } else {
                    concernMgr.addConcern(this.projectId, 2, (id)=> {
                        this.projectInfo.isConcern = true;
                        this.projectInfo.concernID = id;
                    }, null);
                }
            },
            getStageName(salelog) {
                return sysConfig.getProjectStage(salelog.projectStageId).projectStageName;
            },
            goHumanSalelogPage  (salelog) {
                this.$router.push({
                    name: "humanSalelogList",
                    params: {humanID: salelog.human.humanID}
                });
            },
            bindNavBarImpl() {
                bindNavBar(this.projectName, this.concernText(), () => {
                    this.doConcern();
                })
            },
            concernText() {
                if (this.projectInfo && this.projectInfo.isConcern) {
                    return "取消关注";
                } else {
                    return "关注";
                }
            }
        },
        computed: {
            ...baseComputed,
            projectName() {
                return this.projectInfo ? this.projectInfo.projectName : '';
            },
            topRegionText() {
                if (this.projectInfo) {
                    return [1, 2, 3].reduce((pre, cur) => pre + this.projectInfo['regionName_' + cur] + ' ', '');
                }
                return '';
            },
            projectStageName() {
                return this.projectInfo ? this.projectInfo.projectStageName : '';
            },
            directorName() {
                return this.projectInfo ? this.projectInfo.saleDirectorName : '';
            },
            isEdit() {
                return this.projectInfo ? this.projectInfo.isEdit : false;
            },
            directorNameText() {
                var name = this.projectInfo && this.projectInfo.saleDirectorName;
                return name ? "负责人:" + name : "";
            }

        },
        watch: {
            projectInfo : {
                handler: function (val, oldVal) {
                    this.bindNavBarImpl();
                },
                deep: true
            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                var tempId = vm.$route.params && vm.$route.params.projectID;
                if (!tempId || tempId == vm.projectID) {
                    vm.bindNavBarImpl();
                } else {
                    Util.resetObject(vm, defaultData());
                    vm.projectID = tempId;
                    vm.loadProjectInfo();
                    vm.loadSalelogList();
                }
            })
        }
    }
</script>
