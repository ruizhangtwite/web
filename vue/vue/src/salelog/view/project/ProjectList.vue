<template>
    <div>
        <mt-header fixed v-on:backClick="goBack" title="项目列表">
            <mt-button slot="right" @click.native="addProject">{{confirmBtnText}}</mt-button>
        </mt-header>
        <div class="searchWrapper flex center-child bdr-b" :style="searchStyle">
            <input v-model="searchText" class="searchInput" placeholder="输入项目名进行搜索">
            <i class="icon-remove clearBtn" @click="clearSearch"></i>
            <i class="icon-search searchIcon"></i>
        </div>
        <search-project
                class="mint-content soft-scrollable"
                v-show="searchText"
                :style="contentStyle"
                :searchText="searchText"
                :selectProjects="concernContainer"
                :clickItem="onProjectItemClick">
        </search-project>
        <div class="mint-content scrollable" :style="contentStyle" id="projectListContent" v-show="!searchText">
            <div v-for="region in regionList" class="regionItem">
                <div class="regionContent" @click="onRegionItemClick(region)">
                    <div>{{region.displayName}}</div>
                </div>
                <div v-show="region.expand" v-for="project in region.projectList"
                     class="projectItem" @click="onProjectItemClick(project)">
                    <div class="row itemContentRow">
                        <div class="col col-center">{{project.projectName}}</div>
                        <div class="col-center">{{project.projectStageName}}</div>
                    </div>
                    <div class="row itemContentRow childTitle">
                        <div class="col col-center">
                            {{project.regionName_1}} {{project.regionName_2}} {{project.regionName_3}}
                        </div>
                        <i class="col-center icon-ok" v-show="isConcernMode && concernContainer[project.projectId]"></i>
                    </div>
                    <div class="itemContentRow childTitle flex">负责人 {{project.saleDirectorName}}</div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .searchInput {
        width: 100%;
        height: 32px;
        padding-left: 30px;
        outline: transparent;
        border: 1px #DFDFDF solid;
        border-radius: 4px;
        background-color: #F2F2F2;
        display: block;
        font-size: 13px;
    }

    .searchWrapper {
        position: relative;
        height: 50px;
        padding: 0 15px;
        background-color: white;
    }

    .searchIcon {
        color: rgb(217, 217, 217);
        position: absolute;
        left: 15px;
        top: 6px;
        padding: 10px;
    }

    .clearBtn {
        color: rgb(217, 217, 217);
        position: absolute;
        right: 15px;
        top: 6px;
        padding: 10px;
    }

    .mint-content {
        background: #F7F7F7;
    }

    .regionItem {
        padding-top: 10px;
    }

    .regionContent {
        padding: 15px 10px;
        font-size: 16px;
        background-color: #EAEAEA;
        border-color: #ddd;
        border-width: 1px 0;
        border-style: solid;
    }

    .projectItem {
        background: white;
        padding: 5px;
        border-bottom: solid #dddddd 1px;
    }

    .projectItem .col {
        padding: 0;
    }

    .row + .row {
        margin: 0;
    }

    .itemContentRow, .itemContentRow.row {
        padding: 0 5px;
        height: 28px;
        align-items: center;
    }

    .childTitle {
        color: #999c9f;
    }
</style>
<script>
    import {Indicator} from 'mint-ui';
    import {Toast} from 'mint-ui';
    import SearchProject from './SearchProject.vue'

    const http = require('Http');
    const Util = require('Util');
    const gData = require('zhixin').data;
    const {bindNavBar} = require('egovanative');
    const sysConfig = require("sysConfig");

    function defaultData() {
        return {
            regionList: [],
            concernContainer: {},
            callback: null,//记录上个界面传入的回调，防止进入添加项目界面后被覆盖
            searchText: '',
            contentStyle: {top: (Util.getHeaderHeight() + 50) + 'px'},
            searchStyle: {top: Util.getHeaderHeight() + 'px'}
        }
    }

    module.exports = {
        data() {
            return defaultData()
        },
        methods: {
            clearSearch() {
                this.searchText = '';
            },
            goBack() {
                this.$router.go(-1);
            },
            addProject() {
                if (this.isConcernMode) {
                    this.batchConcern();
                    return;
                }
                this.$router.push({
                    name: "addProject",
                    params: {
                        callback: ()=> {
                            this.initOnCreate();
                        }
                    }
                })
            },
            onRegionItemClick(region) {
                region.expand = !region.expand;
                if (region.expand && region.buRegionId != -1) {
                    this.loadProjectList(region);
                }
            },
            onProjectItemClick(project) {
                if (this.isConcernMode) {
                    this.toggleSelectProject(project);
                    return;
                }
                this.doCallback(project);
                this.goBack();
            },
            doCallback(obj) {
                if (this.callback) {
                    this.callback(obj);
                }
            },
            requestCustomProjects() {
                var self = this;
                http.ajax({
                    method: 'GET',
                    functionName: "/home/salelog/addsalelogextend",
                    params: {humanID: gData.humanID},
                    success: function (data) {
                        if (data.success) {
                            var resultInfo = data.data;
                            var customRegion = self.regionList[0];
                            customRegion.projectList = resultInfo.currentList;
                            customRegion.expand = true;
                        }
                    },
                    error: function (data) {
                        alert("获取项目列表错误");
                    },
                    finally: function () {
                    }
                });
            },
            requestRegionList() {
                var paramObj = {level: "3"};

                if (this.isConcernMode) {
                    paramObj.humanID = gData.humanID;
                    paramObj.isBatchConcern = true;
                }

                http.ajax({
                    method: 'GET',
                    functionName: "/home/genericservice/region/getregionbylevel",
                    params: paramObj,
                    success: (data) => {
                        if (!data.success) {
                            return;
                        }
                        var resultInfo = data.data;
                        if (!resultInfo || !resultInfo.regions) {
                            return;
                        }
                        resultInfo.regions.map(region => {
                            region.expand = false;
                            region.displayName = region.buRegionName + "(" + region.projectNum + ")";
                            region.projectList = null;
                            this.regionList.push(region);
                        });

                        if (this.isConcernMode && resultInfo.concernProjectIds) {
                            var concernList = resultInfo.concernProjectIds;
                            for (var i = 0; i < concernList.length; i++) {
                                var key = concernList[i];
                                this.$set(this.concernContainer, key, true);
                            }
                        }
                    },
                    error: function (data) {
                        alert("获取大区列表错误");
                    },
                    finally: function () {
                    }
                });
            },
            loadProjectList(region) {
                if (region.projectList && region.projectList.length > 0)
                    return;
                http.ajax({
                    method: 'GET',
                    functionName: "/home/salelog/getprojectbyregionid",
                    params: {regionID: region.buRegionId},
                    success: function (data) {
                        if (data.success) {
                            var resultInfo = data.data;
                            region.projectList = resultInfo.projectList;
                        }
                    },
                    error: function (data) {
                        alert("获取项目列表错误");
                    },
                    finally: function () {

                    }
                });
            },
            batchConcern() {
                var idList = Object.keys(this.concernContainer).toString();
                Indicator.open();
                http.ajax({
                    functionName: "/home/genericservice/human/saveconcernlist",
                    params: {
                        humanID: gData.humanID,
                        concernObjs: idList,
                        concernTypeID: sysConfig.concernType.SALELOG_PROJECT,
                    },
                    success: (data) => {
                        if (data && data.success) {
                            Toast('关注成功');
                            this.doCallback(null);
                            this.goBack();
                        } else {
                            alert(data.message);
                        }
                    },
                    error: function (data) {
                        alert("关注出错：" + data);
                    },
                    finally: function () {
                        Indicator.close();
                    }
                });
            },
            toggleSelectProject(project) {
                var id = project.projectId;
                if (this.isConcern(id)) {
                    this.$delete(this.concernContainer, id);
                } else {
                    this.$set(this.concernContainer, id, true);
                }
            },
            isConcern(projectId) {
                return this.concernContainer[projectId];
            },
            resetState() {
                this.regionList = [];
                this.concernContainer = {};
                this.searchText = '';

                this.regionList.push({
                    buRegionName: "常用项目", displayName: "常用项目",
                    buRegionId: -1, projectList: null, expand: false
                });
            },
            bindNavBarImpl() {
                bindNavBar('项目列表', this.confirmBtnText, () => {
                    this.addProject()
                })
            },
            initOnCreate() {
                this.resetState();
                this.requestCustomProjects();
                this.requestRegionList();
            }
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                if (from.name != "addProject") {
                    vm.callback = vm.$route.params.callback;
                    vm.initOnCreate();
                }
                vm.bindNavBarImpl();
            })
        },
        computed: {
            isConcernMode() {
                var params = this.$route.params;
                return params && params.isAddFocus;
            },
            confirmBtnText() {
                if (this.isConcernMode) {
                    return `保存(${Object.keys(this.concernContainer).length})`;
                } else {
                    return '新增';
                }
            }
        },
        watch: {
            confirmBtnText() {
                this.bindNavBarImpl();
            }
        },
        components: {
            'search-project': SearchProject
        }
    }
</script>
