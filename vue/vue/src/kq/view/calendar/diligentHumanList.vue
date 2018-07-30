<script>
    const http = require('Http');
    const dateUtil = require("DateUtil");
    const {bindNavBar} = require('egovanative');
    const sysConfig = require("sysConfig");
    const util = require("Util");
    import {Indicator} from 'mint-ui';
    const gData = require('zhixin').data;

    function getDefaultData() {
        return {
            diligentHumanList: [],
            noMoreDataLoad: true
        }
    }
    module.exports = {
        created: function () {},
        beforeRouteEnter: function (to, from, next) {
            next(function(vm) {
                bindNavBar('勤奋榜');
                util.resetObject(vm, getDefaultData());
                vm.init();
            });
        },
        beforeRouteLeave: function(to, from, next) {
            //在离开该界面时，设置没有更多的数据可加载，防止跳转到其他页面还会出现加载数据的情况
            this.noMoreDataLoad = true;
            next();
        },
        data: function () {
            return getDefaultData();
        },
        methods: {
            //初始化
            init: function() {
                var humanID = this.$route.params.humanID;
                var beginDate = this.$route.params.beginDate;
                var endDate = this.$route.params.endDate;
                if(humanID == null) {
                    alert("团队领导标识参数为空");
                    return;
                }
                this.noMoreDataLoad = true;
                //获取勤奋榜数据
                this.startGetDiligentHumanListTask(humanID, beginDate, endDate);
            },

            //加载更多的数据
            loadMore: function() {
                var humanID = this.$route.params.humanID;
                var beginDate = this.$route.params.beginDate;
                var endDate = this.$route.params.endDate;
                if(humanID == null) {
                    alert("团队领导标识参数为空");
                    return;
                }

                //获取勤奋榜数据
                this.startGetDiligentHumanListTask(humanID, beginDate, endDate);
            },

            //显示加载框
            showLoading: function() {
                Indicator.open();
            },

            //隐藏加载框
            hideLoading: function() {
                Indicator.close();
            },

            //进入个人考勤日历界面
            goHumanCalendarPage: function(human) {
                this.$router.push({
                    name: "calendar",
                    params: {
                        humanID: human.humanID,
                        humanName: human.humanName
                    }
                });
            },

            //获取勤奋榜数据
            startGetDiligentHumanListTask: function(humanID, beginDate, endDate) {
                this.showLoading();
                var _this = this;
                http.ajax({
                    functionName: "mi/checkstat/gethardworkranking",
                    params: {
                        humanID: humanID,
                        beginDate: beginDate,
                        endDate: endDate,
                        startNum: _this.diligentHumanList.length,
                        count: sysConfig.COUNT_PER_PAGE
                    },
                    success: function(resultInfo) {
                        if(resultInfo.success) {
                            var dataList = resultInfo.data.list;
                            if(dataList != null) {
                                for(var i=0; i<dataList.length; i++) {
                                    var human = dataList[i];
                                    human.shortName = sysConfig.getShortName(human.humanName);
                                    human.css = sysConfig.getPhotoColorCss(human.humanID);
                                    if(human.averageWorkhour != null && human.averageWorkhour > 0) {
                                        human.averageWorkhour = (human.averageWorkhour / 60).toFixed(1);
                                    } else {
                                        human.averageWorkhour = 0;
                                    }
                                }
                                _this.diligentHumanList = _this.diligentHumanList.concat(dataList);

                                //已经加载了所有数据
                                if(dataList == null || dataList.length < sysConfig.COUNT_PER_PAGE) {
                                    _this.noMoreDataLoad = true;
                                } else {//服务器端可能还有更多数据
                                    _this.noMoreDataLoad = false;
                                }
                            }
                        } else {
                            _this.noMoreDataLoad = true;
                            alert("获取勤奋榜数据失败:" + resultInfo.message);
                        }
                    },
                    error: function(data) {
                        _this.noMoreDataLoad = true;
                        alert("获取勤奋榜数据错误");
                    },
                    finally: function() {
                        _this.hideLoading();
                    }
                });
            }
        }
    }
</script>

<template>
    <div style="position: absolute; width: 100%; background: #ffffff;">
        <div id="diligentHumanList"
             v-infinite-scroll="loadMore"
             infinite-scroll-disabled="noMoreDataLoad"
             infinite-scroll-distance="10"
             class="list">
            <div class="item humanItem" v-for="(human, index) in diligentHumanList">
                <div class="row">
                    <div class="col-center juniorHumanIndex">{{index + 1}}</div>
                    <div class="col-center">
                        <div class="juniorHumanIcon" :style="human.css"
                             @click="goHumanCalendarPage(human)">
                            <div class="row">
                                <div class="col"></div>
                                <div class="col-center juniorHumanShortName">{{human.shortName}}</div>
                                <div class="col"></div>
                            </div>
                        </div>
                    </div>
                    <div class="col col-center juniorHumanName">{{human.humanName}}</div>
                    <div class="col-center juniorHumanWorkHour">平均工时{{human.averageWorkhour}}小时</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .row {
        padding: 0px;
        margin: 0px;
    }

    .col {
        padding: 0px;
        margin: 0px;
    }

    .item {
        border: 1px #cccccc solid;
        padding: 0px;
    }

    .item + .item {
        margin-top: -1px;
    }

    .humanItem {
        padding: 10px;
    }

    .juniorHumanName {
        margin-left: 10px;
        font-size: 15px;
    }

    .juniorHumanIndex {
        font-size: 16px;
        font-weight: bolder;
        font-style: italic;
        margin-right: 10px;
        color: #1DAAFC;
    }
    
    .juniorHumanIcon {
        width: 40px;
        height: 40px;
        -webkit-border-radius: 40px;
        -moz-border-radius: 40px;
        border-radius: 40px;
        color: #ffffff;
    }

    .juniorHumanShortName {
        padding-top: 11px;
        font-size: 14px;
    }

    .juniorHumanWorkHour {
        font-size: 12px;
        color: #bbbbbb;
    }
</style>