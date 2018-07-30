<template>
    <div>
        <mt-header fixed v-on:backClick="goBack" :title="human.humanName">
            <mt-button slot="right" v-show="!isSelf" @click.native="doConcern">{{concernText()}}</mt-button>
        </mt-header>

        <div class="mint-content sl soft-scrollable">
            <div id="topSalelogListBg">
                <div id="bannerHumanName" class="center moreLargeFont">{{human.humanName}}</div>
                <div id="bannerUnitName" class="center middleFont">{{humanUnitDesc}}</div>
                <div id="bannerSeniorName" class="center middleFont">
                    {{seniorNameText}}
                </div>
                <i id="btnChat"
                   class="icon-comment"
                   v-show="!isSelf"
                   @click="startChat"></i>
                <div style="clear:both;"></div>
            </div>
            <div class="sectionEmpty" v-show="isEmpty">
                销售日志列表为空
            </div>
            <div v-infinite-scroll="loadSalelogList"
                 infinite-scroll-disabled="disableLoad"
                 infinite-scroll-distance="10"
                 infinite-scroll-immediate-check="false">

                <div class="item" v-for="item in dataList">
                    <div class="sectionDate">{{item.time}}</div>
                    <div class="salelogContainer" v-for="salelog in item.salelogs">
                        <div class="row">
                            <div class="col col-center middleFont"
                                 @click="goProjectSalelogPage(salelog)"
                                 :style="getSaleLogTitleStyle(salelog)">
                                {{getSaleLogTitle(salelog)}}
                            </div>
                            <div class="col-center stage smallFont"
                                 v-show="salelog.logTypeID == 1">
                                {{getStageName(salelog)}}
                            </div>
                        </div>

                        <div class="logContent wrapWord middleFont"
                             v-html="salelog.logContent"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .row .col {
        padding: 0;
    }

    #btnChat {
        font-size: 27px;
        position: absolute;
        color: #555;
        right: 10px;
        top: 105px;
        padding: 10px;
    }

    #bannerHumanName {
        margin-top: 5px;
        color: #333;
    }

    #bannerUnitName {
        margin-top: 8px;
        color: #555;
    }

    #bannerSeniorName {
        margin-top: 5px;
        color: #333;
    }

    .salelogProjectGroupName {
        color: #3333aa;
        font-size: 15px;
        padding-right: 5px;
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
    const {bindNavBar, startSingleChat} = require('egovanative');
    import {baseData, baseComputed, resolveHasMore, resolveResultData} from 'ListManager';

    function defaultData() {
        return {
            ...baseData(),
            humanID: null,
            human: {}
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
            loadUserInfo() {
                http.ajax({
                    functionName: "/home/genericservice/human/gethumaninfo",
                    method: 'GET',
                    params: {
                        humanID: this.humanID,
                        loginHumanID: gData.humanID
                    },
                    success: (data) => {
                        if (data && data.success && data.data) {
                            var userInfo = data.data;
                            if (userInfo != null) {
                                this.human = userInfo;
                            }
                        }
                    },
                    error: function (data) {
                        alert("获取人员信息错误");
                    }
                });
            },
            loadSalelogList() {
                this.loading = true;
                http.ajax({
                    functionName: "/home/salelog/getHumanSalelogList",
                    params: {
                        humanID: this.humanID,
                        count: sysConfig.COUNT_PER_PAGE,
                        begin: this.dataList.length
                    },
                    success: (resultInfo) => {
                        resolveResultData.call(this, resultInfo, false);
                    },
                    error: function (data) {
                        Toast("获取销售日志列表错误");
                    }
                });
            },

            doConcern() {
                if (!this.human) {
                    return;
                }

                if (this.human.isConcern) {
                    concernMgr.deleteConcern(this.human.concernID, ()=> {
                        this.human.isConcern = false;
                        this.human.concernID = null;
                    }, null);
                } else {
                    concernMgr.addConcern(this.humanID, 2, (id)=> {
                        this.human.isConcern = true;
                        this.human.concernID = id;
                    }, null);
                }
            },
            getStageName(salelog) {
                return sysConfig.getProjectStage(salelog.projectStageId).projectStageName;
            },

            startChat () {
                startSingleChat(this.humanID);
            },
            getSaleLogTitleStyle(salelog) {
                if (salelog.logTypeID != 1) {
                    return {color: "#888"};
                } else {
                    return {color: '#3333aa'}
                }
            },
            getSaleLogTitle (salelog) {
                if (salelog.logTypeID == 1) {
                    if (salelog.project) {
                        return salelog.project.projectName;
                    }
                    return '';
                } else {
                    return "其他工作";
                }

            },
            //进入项目销售日志列表界面
            goProjectSalelogPage (salelog) {
                if (salelog.logTypeID != 1 || !salelog.project) {
                    return;
                }
                this.$router.push({
                    name: "projectSalelogList",
                    params: {
                        projectID: salelog.project.projectId
                    }
                });
            },
            bindNavBarImpl() {
                var humanName = this.human.humanName
                bindNavBar(humanName ? humanName : '', this.isSelf ? '' : this.concernText(), () => {
                    this.doConcern();
                })
            },
            concernText() {
                if (this.human && this.human.isConcern) {
                    return "取消关注";
                } else {
                    return "关注";
                }
            }
        },
        watch: {
            isSelf() {
                this.bindNavBarImpl();
            },
            human: {
                handler: function (val, oldVal) {
                    this.bindNavBarImpl();
                },
                deep: true
            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                var tempId = vm.$route.params && vm.$route.params.humanID;
                if (!tempId || tempId == vm.humanID) {
                    vm.bindNavBarImpl();
                } else {
                    Util.resetObject(vm, defaultData());
                    vm.humanID = tempId;
                    vm.loadUserInfo();
                    vm.loadSalelogList();
                }
            })
        },
        computed: {
            ...baseComputed,
            humanUnitDesc() {
                var list = this.human.seniorUnitList;
                return list ? list.slice(1, list.length).map(item=>item.unitName).join(' ') : '';
            },
            isSelf () {
                return gData.humanID == this.humanID;
            },
            seniorNameText() {
                return this.human.seniorName ? "上级领导：" + this.human.seniorName : '';
            }
        }
    }
</script>
