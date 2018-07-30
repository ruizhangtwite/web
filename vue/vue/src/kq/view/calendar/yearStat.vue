<script>
    const http = require('Http');
    const dateUtil = require("DateUtil");
    const sysConfig = require("sysConfig");
    const util = require("Util");
    import {Indicator} from 'mint-ui';
    const gData = require('zhixin').data;
    const kqList = require("./kqList.vue");
    const {bindNavBar} = require('egovanative');
    const MAX_COL = 3;

    function getDefaultData() {
        return {
            //年开始日期
            yearBeginDate: dateUtil.getYearBeginEndDate(dateUtil.getYear()).beginDateCN,
            //考勤列表组件参数
            kqListParam: {},
            //人员标识
            humanID: -1,
            //是否显示图例的marker图标
            isShowLegendMarker: sysConfig.isShowLegendMarker,
            //工作日的数量
            workDayCount: 0,
            //选中的类型
            selectedType: -1,
            //图例列表
            legendList: sysConfig.getLegendList(),
            //请假详情统计列表
            leaveTypeStatList: [],
            //考勤城市统计列表
            KqCityStatList: [],
            //时间选择器当前选择的时间
            currentDate: new Date(),
            //选择的是开始时间还是结束时间，选择日期回调时使用
            isPickBeginDate: false,
            //type of Date, not string
            beginDate: null,
            endDate: null
        }
    }
    module.exports = {
        components: {
            'component-kq-list': kqList
        },
        created: function () {
        },
        beforeRouteEnter: function (to, from, next) {
            next(function (vm) {
                bindNavBar('年统计');
                util.resetObject(vm, getDefaultData());
                vm.init();
            });
        },
        data: function () {
            return getDefaultData();
        },
        methods: {
            selectBeginDate() {
                this.isPickBeginDate = true
                this.currentDate = this.beginDate
                this.openPicker()
            },
            selectEndDate() {
                this.isPickBeginDate = false
                this.currentDate = this.endDate
                this.openPicker()
            },
            openPicker() {
                this.$refs.picker.open()
            },
            onDateSelect(value) {
                if (this.isPickBeginDate) {
                    this.beginDate = value
                } else {
                    this.endDate = value
                }
            },
            onSearchClick() {
                this.workDayCount = 0;
                this.leaveTypeStatList = [];
                this.selectedType = -1;
                this.KqCityStatList = [];
                this.kqListParam = {};
                this.legendList = sysConfig.getLegendList();

                this.startGetCheckStatTask(this.humanID);
                this.startGetLeaveTypeStatListTask(this.humanID);
                this.startGetKqCityStatListTask(this.humanID);
            },
            //初始化
            init: function () {
                this.humanID = this.$route.params.humanID;
                this.endDate = new Date();
                this.beginDate = dateUtil.getFirstDayOfNormalMonth(this.endDate.getFullYear(), 1);

                this.startGetCheckStatTask(this.humanID);
                this.startGetLeaveTypeStatListTask(this.humanID);
                this.startGetKqCityStatListTask(this.humanID);
            },

            //获取考勤城市统计
            startGetKqCityStatListTask: function (humanID) {
                var _this = this;
                http.ajax({
                    functionName: "mi/checkstat/getcheckcitystat",
                    params: {humanID: humanID, beginDate: _this.beginDateStr, endDate: _this.endDateStr},
                    success: function (resultInfo) {
                        if (resultInfo.success) {
                            var dataList = resultInfo.data.list;
                            if (dataList != null) {
                                var rowIndex = 0;
                                _this.KqCityStatList[rowIndex] = [];
                                for (var i = 0; i < dataList.length; i++) {
                                    var item = dataList[i];
                                    if (_this.KqCityStatList[rowIndex].length >= MAX_COL) {
                                        rowIndex++;
                                        _this.KqCityStatList.push([]);
                                    }
                                    if (item.cityNum != null && item.cityNum > 0) {
                                        item.cityNum = item.cityNum * 0.5;
                                    }
                                    _this.KqCityStatList[rowIndex].push(item);
                                }
                            }
                        } else {
                            alert("获取考勤城市统计记录失败:" + resultInfo.message);
                        }
                    },
                    error: function (data) {
                        alert("获取考勤城市请假统计记录错误");
                    },
                    finally: function () {
                        _this.hideLoading();
                    }
                });
            },

            //获取请假的详细统计列表
            startGetLeaveTypeStatListTask: function (humanID) {
                var _this = this;
                http.ajax({
                    functionName: "mi/leave/getleavetypemount",
                    params: {humanID: humanID, beginDate: _this.beginDateStr, endDate: _this.endDateStr},
                    success: function (resultInfo) {
                        if (resultInfo.success) {
                            var dataList = resultInfo.data.list;
                            if (dataList != null) {
                                var rowIndex = 0;
                                _this.leaveTypeStatList[rowIndex] = [];
                                for (var i = 0; i < dataList.length; i++) {
                                    var item = dataList[i];
                                    if (_this.leaveTypeStatList[rowIndex].length >= MAX_COL) {
                                        rowIndex++;
                                        _this.leaveTypeStatList.push([]);
                                    }
                                    _this.leaveTypeStatList[rowIndex].push(item);
                                }
                            }
                        } else {
                            alert("获取请假统计记录失败:" + resultInfo.message);
                        }
                    },
                    error: function (data) {
                        alert("获取请假统计记录错误");
                    },
                    finally: function () {
                        _this.hideLoading();
                    }
                });
            },

            //根据key获取对应的图例对象
            getLegendItem: function (type) {
                if (type != null) {
                    for (var i = 0; i < this.legendList.length; i++) {
                        var legendItemRow = this.legendList[i];
                        if (legendItemRow != null) {
                            for (var j = 0; j < legendItemRow.length; j++) {
                                var legendItem = legendItemRow[j];
                                if (legendItem != null) {
                                    if (legendItem.type == type) {
                                        return legendItem;
                                    }
                                }
                            }
                        }
                    }
                }
                alert("获取图例项为空，请联系管理员:" + type);
                return null;
            },

            //初始化图例的统计值
            initLegendItemValue: function (checkStatCount) {
                if (checkStatCount != null) {//下级成员考勤统计

                    //全勤
                    this.getLegendItem(sysConfig.LEGEND_QUANQIN).count = util.getIntValue(checkStatCount.normalCount);

                    //旷工
                    this.getLegendItem(sysConfig.LEGEND_KUANGGONG).count = util.getIntValue(checkStatCount.kuanggongCount);

                    //缺勤
                    this.getLegendItem(sysConfig.LEGEND_QUEQIN).count = util.getIntValue(checkStatCount.queqinCount);

                    //位置异常或代打卡异常
                    this.getLegendItem(sysConfig.LEGEND_EXCEPTION).count = util.getIntValue(checkStatCount.addressExceptionCount) + util.getIntValue(checkStatCount.daidakaExceptionCount);

                    //迟到
                    this.getLegendItem(sysConfig.LEGEND_CHIDAO).count = util.getIntValue(checkStatCount.chidaoCount);

                    //早退
                    this.getLegendItem(sysConfig.LEGEND_ZAOTUI).count = util.getIntValue(checkStatCount.zaotuiCount);

                    //请假
                    this.getLegendItem(sysConfig.LEGEND_LEAVE).count = util.getIntValue(checkStatCount.leaveCount);

                    //工作日打卡
                    this.workDayCount = util.getIntValue(checkStatCount.workDayCount);

                    //休息日打卡
                    this.getLegendItem(sysConfig.LEGEND_XIUXIRI_DAKA).count = util.getIntValue(checkStatCount.notWorkDayInCount);

                    //出勤
                    this.getLegendItem(sysConfig.LEGEND_CHUQIN).count = util.getIntValue(checkStatCount.chuqinCount);
                }
            },

            //获取考勤统计任务
            startGetCheckStatTask: function (humanID) {
                this.showLoading();

                //工作日数量清空
                this.workDayCount = 0;

                var _this = this;
                var functionName = "mi/checkstat/gethumancheckstat";

                http.ajax({
                    functionName: functionName,
                    params: {humanID: humanID, beginDate: _this.beginDateStr, endDate: _this.endDateStr},
                    success: function (resultInfo) {
                        if (resultInfo.success) {
                            var statList = resultInfo.data.list;
                            if (statList != null && statList.length > 0) {
                                _this.initLegendItemValue(statList[0]);
                            }
                        } else {
                            alert("获取考勤统计记录失败:" + resultInfo.message);
                        }
                    },
                    error: function (data) {
                        alert("获取考勤统计记录错误");
                    },
                    finally: function () {
                        _this.hideLoading();
                    }
                });
            },

            //显示加载框
            showLoading: function () {
                Indicator.open();
            },

            //隐藏加载框
            hideLoading: function () {
                Indicator.close();
            },

            //考勤统计记录反查
            inversQueryKqList: function (legendItem) {
                if (legendItem != null
                        && legendItem.isInversQuery != null
                        && legendItem.isInversQuery == true
                        && legendItem.type != this.selectedType
                        && legendItem.count > 0) {
                    //设置选中状态
                    this.selectedType = legendItem.type;

                    //反查考勤记录

                    //重新设置考勤列表组件的参数，触发考勤列表组件重新根据最新的条件来刷新数据
                    this.kqListParam = {
                        humanID: this.humanID,
                        where: util.clone(legendItem.where),
                        beginDate: this.beginDateStr,
                        endDate: this.endDateStr,
                        isSelf: true,
                        startNum: 0,
                        count: sysConfig.COUNT_PER_PAGE,
                        isShowHeadPic: false
                    };
                }
            },

            //考勤请假统计记录反查
            inversQueryLeaveList: function (leaveItem) {
                if (leaveItem != null && leaveItem.totalCount > 0) {
                    //设置选中状态
                    this.selectedType = leaveItem.typeName;

                    //查询条件
                    var where = "leaveFlag = 1 and leaveID is not null and leaveType = " + leaveItem.leaveType;

                    //重新设置考勤列表组件的参数，触发考勤列表组件重新根据最新的条件来刷新数据
                    this.kqListParam = {
                        humanID: this.humanID,
                        where: where,
                        beginDate: this.beginDateStr,
                        endDate: this.endDateStr,
                        isSelf: true,
                        startNum: 0,
                        count: sysConfig.COUNT_PER_PAGE,
                        isShowHeadPic: false
                    };
                }
            },

            //反查考勤城市
            inversQueryKqCityList: function (city) {
                if (city != null && city.cityNum > 0) {
                    //设置选中状态
                    this.selectedType = city.cityName;

                    //查询条件
                    var where = "(checkInCity = '" + city.cityName + "' "
                            + "or checkOutCity = '" + city.cityName + "') ";

                    //重新设置考勤列表组件的参数，触发考勤列表组件重新根据最新的条件来刷新数据
                    this.kqListParam = {
                        humanID: this.humanID,
                        where: where,
                        beginDate: this.beginDateStr,
                        endDate: this.endDateStr,
                        isSelf: true,
                        startNum: 0,
                        count: sysConfig.COUNT_PER_PAGE,
                        isShowHeadPic: false
                    };
                }
            },
        },
        computed: {
            beginDateStr() {
                return this.beginDate
                        ? dateUtil.formatDateByDate(this.beginDate, dateUtil.FORMAT_YMD)
                        : '';
            },
            endDateStr() {
                return this.endDate
                        ? dateUtil.formatDateByDate(this.endDate, dateUtil.FORMAT_YMD)
                        : '';
            }
        }
    }
</script>

<template>
    <div style="position: absolute; width: 100%;">
        <div class="dateSelect row middleFont">
            <div class="col beginDate">
                <span @click="selectBeginDate">{{beginDateStr}}</span>
                <i class="col-center icon-angle-down"></i>
            </div>

            <span class="textGray col-center" style="padding:0 10px">一</span>
            <div class="col endDate">
                <span @click="selectEndDate">{{endDateStr}}</span>
                <i class="col-center icon-angle-down"></i>
            </div>

            <div class="col-center btnSearch textBlue" @click="onSearchClick">查询</div>
        </div>
        <div id="calendarLegendRemark" class="textGray">共{{workDayCount}}个工作日</div>
        <!-- 图例头 -->
        <div>
            <div class="row calendarHead">
                <div class="col-center calendarHeadName">年统计</div>
            </div>
        </div>
        <!-- 图例 -->
        <div class="calenderLegend">
            <div v-for="legendRow in legendList">
                <div class="row">
                    <div class="col col-center" v-for="legend in legendRow">
                        <div class="row calenderLegendCell"
                             :class="{calendarLegendSelect: selectedType == legend.type}"
                             v-if="legend.isShow != null && legend.isShow == true"
                             @click="inversQueryKqList(legend)">
                            <div class="row">
                                <!-- 带marker的图标-->
                                <div class="col-center calenderLegendIconMarker"
                                     v-if="isShowLegendMarker == true"
                                     :style="legend.markerCss">
                                    <div class="row">
                                        <div class="col"></div>
                                        <div class="col-center calenderLegendIcon" :style="legend.css"></div>
                                        <div class="col"></div>
                                    </div>
                                </div>
                                <!-- 不带marker的图标-->
                                <div class="col-center" v-if="isShowLegendMarker == false">
                                    <div class="row">
                                        <div class="col"></div>
                                        <div class="col-center calenderLegendIcon" :style="legend.css"></div>
                                        <div class="col"></div>
                                    </div>
                                </div>
                                <div class="col col-center calenderLegendName"
                                     :class="{calendarLegendSelect: selectedType == legend.type}">{{legend.name}}
                                </div>
                                <div class="col-center calenderLegendValue"
                                     :class="{calendarLegendSelect: selectedType == legend.type, calenderLegendNoValue: legend.count <= 0 && selectedType != legend.type}">
                                    {{legend.count}}
                                </div>
                                <div class="col-center calenderLegendRightIcon icon-angle-right"
                                     :class="{calendarLegendSelect: selectedType == legend.type}"
                                     v-show="legend.isInversQuery != null && legend.isInversQuery == true"></div>
                                <div class="col-center calenderLegendRightIcon"
                                     style="width: 6px;"
                                     v-show="legend.isInversQuery != null && legend.isInversQuery == false">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 请假类型统计明细 -->
        <div style="background: #ffffff; margin-top: 20px;">
            <div class="leaveStatHead">请假</div>
            <div v-for="statRow in leaveTypeStatList">
                <div class="row">
                    <div class="col col-center leaveStatItem"
                         v-for="stat in statRow"
                         :class="{calendarLegendSelect: selectedType == stat.typeName}">
                        <div class="row"
                             @click="inversQueryLeaveList(stat)">
                            <div class="col col-center calenderLeaveName"
                                 :class="{calendarLegendSelect: selectedType == stat.typeName}">
                                {{stat.typeName}}
                            </div>
                            <div class="col-center calenderLegendValue"
                                 :class="{calendarLegendSelect: selectedType == stat.typeName, calenderLegendNoValue: stat.totalCount <= 0 && selectedType != stat.typeName}">
                                {{stat.totalCount}}
                            </div>
                            <div class="col-center calenderLegendRightIcon icon-angle-right"
                                 :class="{calendarLegendSelect: selectedType == stat.typeName}"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 出勤城市 -->
        <div style="background: #ffffff; margin-top: 20px;">
            <div class="leaveStatHead">出勤城市</div>
            <div v-for="cityRow in KqCityStatList">
                <div class="row">
                    <div class="col col-center leaveStatItem"
                         v-for="city in cityRow"
                         :class="{calendarLegendSelect: selectedType == city.cityName}">
                        <div class="row"
                             @click="inversQueryKqCityList(city)">
                            <div class="col col-center calenderLeaveName"
                                 :class="{calendarLegendSelect: selectedType == city.cityName}">
                                {{city.cityName}}
                            </div>
                            <div class="col-center calenderLegendValue"
                                 :class="{calendarLegendSelect: selectedType == city.cityName, calenderLegendNoValue: city.cityNum <= 0 && selectedType != city.cityName}">
                                {{city.cityNum}}
                            </div>
                            <div class="col-center calenderLegendRightIcon icon-angle-right"
                                 :class="{calendarLegendSelect: selectedType == city.cityName}"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 反查的考勤记录 -->
        <component-kq-list :requestParam="kqListParam"></component-kq-list>

        <mt-datetime-picker
                ref="picker"
                @confirm="onDateSelect"
                v-model="currentDate"
                type="date"
                year-format="{value} 年"
                month-format="{value} 月"
                date-format="{value} 日">
        </mt-datetime-picker>
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

    .calendarHead {
        background: #ffffff;
        padding: 10px;
        border-top: 1px #cccccc solid;
    }

    .calendarHeadName {
        font-size: 16px;
    }

    .calenderLegend {
        background: #ffffff;
        border-top: 1px #cccccc solid;
        border-left: 1px #cccccc solid;
    }

    .calenderLegendCell {
        border-right: 1px #cccccc solid;
        border-bottom: 1px #cccccc solid;
        padding: 10px;
    }

    .calenderLegendRightIcon {
        font-size: 16px;
        color: #bbbbbb;
        margin-left: 5px;
    }

    .calenderLegendIcon {
        -webkit-border-radius: 10px;
        -moz-border-radius: 10px;
        border-radius: 10px;
        width: 10px;
        height: 10px;
        text-align: center;
        margin-top: 3px;
    }

    .calenderLegendIconMarker {
        -webkit-border-radius: 16px;
        -moz-border-radius: 16px;
        border-radius: 16px;
        width: 16px;
        height: 16px;
        text-align: center;
    }

    .calenderLegendName {
        font-size: 15px;
        color: #555555;
        margin-left: 5px;
    }

    .calenderLeaveName {
        font-size: 15px;
        color: #555555;
    }

    .calenderLegendValue {
        font-size: 15px;
        color: #1D1D26;
    }

    .calenderLegendNoValue {
        font-size: 15px;
        color: #bcbcbc;
    }

    #calendarLegendRemark {
        font-size: 13px;
        margin-top: 3px;
        margin-left: 10px;
        margin-bottom: 3px;
    }

    .calendarLegendSelect {
        background: #37aeff;
        color: #ffffff;
    }

    .calendarLegendNotSelect {
        background: #ffffff;
    }

    .leaveStatHead {
        padding: 10px;
        font-size: 16px;
        border: 1px #cccccc solid;
    }

    .leaveStatItem {
        border-right: 1px #cccccc solid;
        border-bottom: 1px #cccccc solid;
        padding: 10px;
    }

    .dateSelect {
        border-bottom: 1px #cccccc solid;
        background-color: white;
        padding: 7px 0;
    }

    .beginDate, .endDate {
        text-align: center;
    }

    .beginDate span, .endDate span{
        display: inline-block;
        padding: 8px 0;
    }

    .btnSearch {
        padding: 8px 30px;
        border-left: solid 1px #DFDFDF;
    }

</style>