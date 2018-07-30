<script>
    import {Indicator} from 'mint-ui';
    import {Toast} from 'mint-ui';
    const {bindNavBar} = require('egovanative');
    const sysConfig = require('sysConfig');
    const dateUtil = require('DateUtil');
    const gData = require('zhixin').data;
    const http = require('Http');
    const util = require("Util");
    const kqList = require("./kqList.vue");

    function getDefaultData() {
        return {
            //考勤列表组件参数
            kqListParam: {},
            //是否显示图例的marker图标
            isShowLegendMarker: sysConfig.isShowLegendMarker,
            //日历单元列表
            cellList: [],
            //日历单元坐标和日期的关系映射表
            cellMap: {},
            //统计图表的单元列表
            gridItemList: new Array(),
            //周列表
            weekList: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
            //当前浏览的年份
            year: new Date().getFullYear(),
            //当前浏览的月份
            month: new Date().getMonth() + 1,
            //选中的统计项
            selectGridItem: null,
            //按照日期显示的考勤记录列表
            dateLogList: new Array(),
            //考勤记录查询开始索引
            dateLogStartIndex: 0,
            //是否有更多的待加载数据
            hasMoreDataLoad: false,
            //下级成员路径
            humanPathList: new Array(),
            //下级成员列表
            juniorHumanList: new Array(),
            //是否是管理者
            isManager: util.getRequestParam("isManager") == "1",
            //选中的人员,默认是自己,登录人员默认是自己
            selectedHuman: {
                humanName: gData.humanName,
                humanID: gData.humanID,
                isShowSelf: true,
                loginHumanID:gData.humanID,
                type: sysConfig.TYPE_HUMAN
            },
            //工作日的数量
            workDayCount: 0,
            //选中的图例
            selectedLegendType: -1,
            //图例列表
            legendList: sysConfig.getLegendList(),
            //考勤城市列表
            kqCityList: [[]],
            //考勤城市最大列数
            CITY_MAX_COL: 3,
            //每个城市对应的统计数量
            COUNT_PER_CITY: 0.5,
            //默认的考勤日历样式
            DEFAULT_CELL_CSS: {"background": "#EEEFF3", "color": "#bbbbbb"},
            curMonth: ''
        }
    }

    module.exports = {
        components: {
            'component-kq-list': kqList
        },
        beforeRouteEnter: function (to, from, next) {
            next(function(vm) {
                //从成员列表返回时，不执行init函数，而是调用回调函数
                if(vm.isNewPage(to)) {
                    util.resetObject(vm, getDefaultData());
                    vm.init();
                }
                vm.bindNavBarImpl();
            });
        },
        data: function() {
            return getDefaultData();
        },
        watch: {
            selectedLegendType: {
                handler: function (newVal, oldVal) {
                    if(oldVal.isCalendarCell == true) {
                        //取消选择日历单元的样式
                        this.setCalendarCellMarkerCss(oldVal, "#ffffff");
                    }

                    if(newVal.isCalendarCell == true && this.isCalendarCellInversQuery(newVal)) {
                        //设置日历单元选中的样式
                        this.setCalendarCellMarkerCss(newVal);
                    }
                }
            }
        },
        methods: {
            //初始化
            init: function() {
                //根据传入参数来设置考勤日历的人员
                if(this.$route.params.humanID != null && this.$route.params.humanName) {
                    this.selectedHuman = {
                        humanID: this.$route.params.humanID,
                        humanName: this.$route.params.humanName,
                        loginHumanID: this.$route.params.loginHumanID,
                        isShowSelf: true
                    }
                }
                //初始化日历
                this.initCalender(this.year, this.month);
                //获取考勤统计数据
                this.startGetCheckStatTask(this.selectedHuman, this.year, this.month);
            },

            //导航
            bindNavBarImpl: function() {
                bindNavBar("考勤日历");
            },

            //根据年和月初始化日历
            initCalender: function(year, month) {
                this.curMonth = year + "年" + month + "月";

                this.cellMap = {};


                //初始化日历二维数组
                for(var j=0; j<sysConfig.MAX_ROW; j++) {
                    this.$set(this.cellList, j, []);
                    for(var k=0; k<sysConfig.MAX_COL; k++) {
                        var cell = {isShow: false,
                                    css: null,
                                    isWeekend: false,
                                    isCalendarCell: true,
                                    //选中的四角样式
                                    markerCss: {
                                        topLeft: {"border-top": "#ffffff 1px solid", "border-left": "#ffffff 1px solid"},
                                        topRight: {"border-top": "#ffffff 1px solid", "border-right": "#ffffff 1px solid"},
                                        bottomLeft: {"border-bottom": "#ffffff 1px solid", "border-left": "#ffffff 1px solid"},
                                        bottomRight: {"border-bottom": "#ffffff 1px solid", "border-right": "#ffffff 1px solid"}
                                    }};
                        this.$set(this.cellList[j], k, cell);
                    }
                }

                //日历月视图中，开始日期和结束日期
                var beginEndDate = dateUtil.getBeginEndDate(year, month);
                var beginDate = beginEndDate.calenderBeginDate;
                var beginDateStr = beginEndDate.calenderBeginDateStr;
                var endDateStr = beginEndDate.calenderEndDateStr;

                var loopDateStr = beginDateStr;
                var loopDate = beginDate;
                var row = 0;
                var col = 0;
                while(loopDateStr.localeCompare(endDateStr) <= 0) {
                    this.cellMap[loopDateStr] = {row: row, col: col};

                    var cell = this.cellList[row][col];
                    //如果不在考勤月期间，不显示
                    cell.isShow = dateUtil.isInKqMonth(loopDateStr, year, month);
                    cell.date = loopDateStr;
                    cell.day = loopDate.getDate();
                    cell.isWeekend = this.isWeekend(loopDateStr);

                    //是否是今天
                    cell.isToday = false;
                    var todayStr = dateUtil.formatDate(new Date().getTime(), dateUtil.FORMAT_YMD);
                    if(todayStr.localeCompare(loopDateStr) == 0) {
                        cell.isToday = true;
                    }

                    //天数循环加一
                    loopDate = dateUtil.addDays(loopDate, 1);
                    loopDateStr = dateUtil.formatDate(loopDate.getTime(), dateUtil.FORMAT_YMD);
                    col ++;
                    if(col >= sysConfig.MAX_COL) {
                        row ++;
                        col = 0;
                    }
                }
            },

            //日历单元是否可以反查
            isCalendarCellInversQuery: function(cell) {
                return cell != null && cell.isShow == true && cell.statRecord != null;
            },

            //设置日历单元选中或取消选中的样式
            setCalendarCellMarkerCss: function(cell, color) {
                if(this.isCalendarCellInversQuery(cell)) {
                    if(color == null) {
                        color = cell.css["background"];
                        if(color == this.DEFAULT_CELL_CSS["background"]) {
                            color = this.DEFAULT_CELL_CSS["color"];
                        }
                    }
                    cell.markerCss.topLeft["border-top"] = color + " 1px solid";
                    cell.markerCss.topLeft["border-left"] = color + " 1px solid";

                    cell.markerCss.topRight["border-top"] = color + " 1px solid";
                    cell.markerCss.topRight["border-right"] = color + " 1px solid";

                    cell.markerCss.bottomLeft["border-bottom"] = color + " 1px solid";
                    cell.markerCss.bottomLeft["border-left"] = color + " 1px solid";

                    cell.markerCss.bottomRight["border-bottom"] = color + " 1px solid";
                    cell.markerCss.bottomRight["border-right"] = color + " 1px solid";
                }
            },

            //点击日历单元
            clickCalendarCell: function(cell) {
                if(this.selectedLegendType != cell && this.isCalendarCellInversQuery(cell)) {
                    this.selectedLegendType = cell;
                    this.inversQueryCalendarCellKqList(cell);
                }
            },

            //是否是周末
            isWeekend: function(strDate) {
                var date = dateUtil.parseDate(strDate);
                var weekNum = dateUtil.getWeekNum(date);
                return weekNum == 6 || weekNum == 7;
            },

            //清除图例的统计数据
            clearLegendStatValue: function() {
                if(this.legendList != null) {
                    for(var i=0; i<this.legendList.length; i++) {
                        var legendRow = this.legendList[i];
                        for(var j=0; j<legendRow.length; j++) {
                            var legend = legendRow[j];
                            legend.count = 0;
                            if(legend.statRecordList != null) {
                                legend.statRecordList.splice(0, legend.statRecordList.length);
                            } else {
                                legend.statRecordList = new Array();
                            }
                        }
                    }
                }
            },

            //上一个月
            backwardMonth: function() {
                if(this.month == 1) {
                    this.year --;
                    this.month = 12;
                } else {
                    this.month --;
                }
                this.resetCalendar();
            },

            //下一个月
            forwardMonth: function() {
                if(this.month == 12) {
                    this.year ++;
                    this.month = 1;
                } else {
                    this.month ++;
                }
                this.resetCalendar();
            },

            //重置
            resetCalendar: function() {
                this.selectedLegendType = -1;
                this.kqListParam = {};
                this.kqCityList = [[]];
                this.initCalender(this.year, this.month);
                this.clearLegendStatValue();
                this.startGetCheckStatTask(this.selectedHuman, this.year, this.month);
            },

            //根据key获取对应的图例对象
            getLegendItem: function(type) {
                if(type != null) {
                    for(var i=0; i<this.legendList.length; i++) {
                        var legendItemRow = this.legendList[i];
                        if(legendItemRow != null) {
                            for(var j=0; j<legendItemRow.length; j++) {
                                var legendItem = legendItemRow[j];
                                if(legendItem != null) {
                                    if(legendItem.type == type) {
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

            //设置图例中的个人考勤统计数量
            setLegendItemValue: function(type, checkStatRecord) {
                var legendItem = this.getLegendItem(type);
                if(legendItem != null) {
                    legendItem.statRecordList.push(util.clone(checkStatRecord));
                    legendItem.count = legendItem.statRecordList.length;
                }
            },

            //初始化图例的统计值
            initLegendItemValue: function(checkStatRecord) {
                if(checkStatRecord != null) {//个人考勤统计
                    //全勤
                    if(checkStatRecord.normalFlag == 1 &&
                            checkStatRecord.workDayFlag == 1) {
                        this.setLegendItemValue(sysConfig.LEGEND_QUANQIN, checkStatRecord);
                    }
                    //旷工
                    if(checkStatRecord.kuanggongAmFlag == 1) {
                        this.setLegendItemValue(sysConfig.LEGEND_KUANGGONG, checkStatRecord);
                    }
                    //缺勤
                    if(checkStatRecord.queqinAmFlag == 1) {
                        this.setLegendItemValue(sysConfig.LEGEND_QUEQIN, checkStatRecord);
                    }
                    //位置异常或代打卡异常
                    if(checkStatRecord.inAmSiteExceptionFlag == 1
                        || checkStatRecord.outAmSiteExceptionFlag == 1
                        || checkStatRecord.inAmCheckExceptionFlag == 1
                        || checkStatRecord.outAmCheckExceptionFlag == 1) {
                        this.setLegendItemValue(sysConfig.LEGEND_EXCEPTION, checkStatRecord);
                    }
                    //迟到
                    if(checkStatRecord.chidaoAmFlag == 1) {
                        this.setLegendItemValue(sysConfig.LEGEND_CHIDAO, checkStatRecord);
                    }
                    //早退
                    if(checkStatRecord.zaotuiAmFlag == 1) {
                        this.setLegendItemValue(sysConfig.LEGEND_ZAOTUI, checkStatRecord);
                    }
                    //请假
                    if(checkStatRecord.leaveFlag == 1) {
                        this.setLegendItemValue(sysConfig.LEGEND_LEAVE, checkStatRecord);
                    }
                    //工作日
                    if(checkStatRecord.workDayFlag == 1) {
                        this.workDayCount ++;
                        //this.setLegendItemValue(sysConfig.LEGEND_GONGZUORI, checkStatRecord);
                    }
                    //休息日打卡
                    if(checkStatRecord.notWorkDayInFlag == 1) {
                        this.setLegendItemValue(sysConfig.LEGEND_XIUXIRI_DAKA, checkStatRecord);
                    }
                    //出勤
                    if(checkStatRecord.workDayFlag == 1
                            && checkStatRecord.kuanggongAmFlag == 0
                            && checkStatRecord.kuanggongPmFlag == 0
                            && checkStatRecord.leaveFlag == 0) {
                        this.setLegendItemValue(sysConfig.LEGEND_CHUQIN, checkStatRecord);
                    }
                }
            },

            //添加考勤城市
            addKqCity: function(cityName) {
                if(cityName != null) {
                    var city = this.getCity(cityName);
                    if(city != null) {//城市存在，数量新增COUNT_PER_CITY
                        if(city.count == null) {
                            city.count = 0;
                        }
                        city.count += this.COUNT_PER_CITY;
                    } else {//城市不存在，在最底下添加该城市
                        var bottomCityRow = this.kqCityList[this.kqCityList.length - 1];
                        if(bottomCityRow.length < this.CITY_MAX_COL) {
                            bottomCityRow.push({
                                name: cityName,
                                count: this.COUNT_PER_CITY
                            });
                        } else {
                            this.kqCityList.push([{
                                name: cityName,
                                count: this.COUNT_PER_CITY
                            }]);
                        }
                    }
                }
            },

            //初始化考勤城市
            initKqCity: function(checkStatRecord) {
                if(checkStatRecord != null) {
                    //签到城市
                    this.addKqCity(checkStatRecord.checkInCity);
                    //签退城市
                    this.addKqCity(checkStatRecord.checkOutCity);
                }
            },

            getCity: function(cityName) {
                if(this.kqCityList != null) {
                    for(var i=0; i<this.kqCityList.length; i++) {
                        var cityRow = this.kqCityList[i];
                        for(var j=0; j<cityRow.length; j++) {
                            var city = cityRow[j];
                            if(city.name == cityName) {
                                return city;
                            }
                        }
                    }
                }
            },

            //获取考勤统计任务
            startGetCheckStatTask: function(human, year, month) {
                this.showLoading();
                var _this = this;

                //工作日数量清空
                this.workDayCount = 0;

                var beginEndDate = dateUtil.getBeginEndDate(year, month);
                var beginDate = beginEndDate.monthBeginDateStr;
                var endDate = beginEndDate.monthEndDateStr;

                http.ajax({
                    functionName: "mi/checkstat/getcheckstatrecordlist",
                    params: {humanID: human.humanID, beginDate: beginDate, endDate: endDate,loginHumanID:human.humanID},
                    success: function(resultInfo) {
                        if(resultInfo.success) {
                            //个人统计
                            if(human.isShowSelf == true) {
                                var checkStatRecordList = resultInfo.data.list;
                                //是否有查看考勤的权限
                                _this.isManager=(resultInfo.data.isKqSee==1);
                                for(var i=0; i<checkStatRecordList.length; i++) {
                                    var checkStatRecord = checkStatRecordList[i];
                                    if(_this.cellMap[checkStatRecord.checkDate] != null) {
                                        //显示个人考勤时，初始化日历单元的css样式
                                        _this.initCalenderCellCss(checkStatRecord);
                                        //初始化图表统计项的值
                                        _this.initLegendItemValue(checkStatRecord);
                                        //初始化考勤城市
                                        _this.initKqCity(checkStatRecord);
                                    } else {
                                        alert("没有指定日期对应的日历单元:" + checkStatRecord.checkDate);
                                        return;
                                    }
                                }
                            }
                        } else {
                            alert("获取考勤统计记录失败:" + resultInfo.message);
                        }
                    },
                    error: function(data) {
                        alert("获取考勤统计记录错误");
                    },
                    finally: function() {
                        _this.hideLoading();
                    }
                });
            },

            //初始化日历单元的css样式
            initCalenderCellCss: function(checkStatRecord) {
                var row = this.cellMap[checkStatRecord.checkDate].row;
                var col = this.cellMap[checkStatRecord.checkDate].col;
                var cell = this.cellList[row][col];
                cell.statRecord = checkStatRecord;
                cell.city = this.getKqCity(checkStatRecord);
                if(checkStatRecord.kuanggongAmFlag == 1) {//旷工
                    cell.css = sysConfig.getLegendCss(sysConfig.LEGEND_KUANGGONG);
                } else if(checkStatRecord.queqinAmFlag == 1) {//缺勤
                    cell.css = sysConfig.getLegendCss(sysConfig.LEGEND_QUEQIN);
                } else if(checkStatRecord.inAmSiteExceptionFlag == 1
                        || checkStatRecord.outAmSiteExceptionFlag == 1
                        || checkStatRecord.inAmCheckExceptionFlag == 1
                        || checkStatRecord.outAmCheckExceptionFlag == 1) {//异常
                    cell.css = sysConfig.getLegendCss(sysConfig.LEGEND_EXCEPTION);
                } else if(checkStatRecord.chidaoAmFlag == 1) {//迟到
                    cell.css = sysConfig.getLegendCss(sysConfig.LEGEND_CHIDAO);
                } else if(checkStatRecord.zaotuiAmFlag == 1) {//早退
                    cell.css = sysConfig.getLegendCss(sysConfig.LEGEND_ZAOTUI);
                } else if(checkStatRecord.leaveFlag == 1) {//请假
                    cell.css = sysConfig.getLegendCss(sysConfig.LEGEND_LEAVE);
                } else if(checkStatRecord.mustCheckFlag != 1) {//休息日
                    if (checkStatRecord.notWorkDayInFlag == 1) {//休息日打卡
                        cell.css = sysConfig.getLegendCss(sysConfig.LEGEND_XIUXIRI_DAKA);
                    } else {
                        cell.css = this.DEFAULT_CELL_CSS;
                    }
                } else if(checkStatRecord.normalFlag == 1) {//全勤
                    cell.css = sysConfig.getLegendCss(sysConfig.LEGEND_QUANQIN);
                } else {
                    cell.css = this.DEFAULT_CELL_CSS;
                }
            },

            //进入年统计界面
            goYearStatPage: function() {
                var _this = this;
                this.$router.push({
                    name: "yearStat",
                    params: {
                        humanID: _this.selectedHuman.humanID
                    }
                });
            },

            goKqLocation: function () {
                this.$router.push({
                    name: 'kqLocation',
                    params: {
                        humanID: this.selectedHuman.humanID
                    }
                })
            },

            //获取考勤城市
            getKqCity: function(statRecord) {
                if(statRecord != null) {
                    var city = "";
                    if(statRecord.checkInCity == null && statRecord.checkOutCity != null) {
                        city = statRecord.checkOutCity;
                    } else if(statRecord.checkInCity != null && statRecord.checkOutCity == null) {
                        city = statRecord.checkInCity;
                    } else if(statRecord.checkInCity != null && statRecord.checkOutCity != null) {
                        if(statRecord.checkInCity == statRecord.checkOutCity) {
                            city = statRecord.checkInCity;
                        } else {
                            city = statRecord.checkInCity + "/" + statRecord.checkOutCity;
                        }
                    } else if(statRecord.workDayFlag == 0) {
                        //非工作日
                        city = "";
                    } else {
                        //city = "未知";
                        city = "";
                    }

                    city = city.replace(/\市/g, "");
                    city = city.replace(/\县/g, "");

                    return city;
                }
                return "";
            },

            //反查某天的考勤记录列表
            inversQueryCalendarCellKqList: function(cell) {
                var beginDate = cell.date;
                var endDate = cell.date;

                //重新设置考勤列表组件的参数，触发考勤列表组件重新根据最新的条件来刷新数据
                this.kqListParam = {
                    humanID: util.clone(this.selectedHuman.humanID),
                    where: "1=1",
                    beginDate: beginDate,
                    endDate: endDate,
                    isSelf: true,
                    startNum: 0,
                    count: sysConfig.COUNT_PER_PAGE,
                    isShowHeadPic: false
                };
            },

            //反查考勤城市列表
            inversQueryCityList: function(city) {
                if(city != null
                        && city.name != null
                        && city.count != null
                        && city.count > 0
                        && this.selectedLegendType != city.name) {
                    //设置选中状态
                    this.selectedLegendType = city.name;

                    //反查考勤区间
                    var beginEndDate = dateUtil.getBeginEndDate(this.year, this.month);
                    var beginDate = beginEndDate.monthBeginDateStr;
                    var endDate = beginEndDate.monthEndDateStr;

                    var where = "(checkInCity = '" + city.name + "' "
                              + "or checkOutCity = '" + city.name + "') ";
                    //重新设置考勤列表组件的参数，触发考勤列表组件重新根据最新的条件来刷新数据
                    this.kqListParam = {
                        humanID: util.clone(this.selectedHuman.humanID),
                        where: where,
                        beginDate: beginDate,
                        endDate: endDate,
                        isSelf: true,
                        startNum: 0,
                        count: sysConfig.COUNT_PER_PAGE,
                        isShowHeadPic: false
                    };
                }
            },

            //反查考勤记录列表
            inversQueryKqList: function(legendItem) {
                if(legendItem != null
                        && legendItem.isInversQuery != null
                        && legendItem.isInversQuery == true
                        && legendItem.type != this.selectedLegendType
                        && legendItem.count > 0) {
                    //设置选中状态
                    this.selectedLegendType = legendItem.type;

                    //反查考勤区间
                    var beginEndDate = dateUtil.getBeginEndDate(this.year, this.month);
                    var beginDate = beginEndDate.monthBeginDateStr;
                    var endDate = beginEndDate.monthEndDateStr;

                    //重新设置考勤列表组件的参数，触发考勤列表组件重新根据最新的条件来刷新数据
                    this.kqListParam = {
                        humanID: util.clone(this.selectedHuman.humanID),
                        where: util.clone(legendItem.where),
                        beginDate: beginDate,
                        endDate: endDate,
                        isSelf: true,
                        startNum: 0,
                        count: sysConfig.COUNT_PER_PAGE,
                        isShowHeadPic: false
                    };
                }
            },

            //显示加载框
            showLoading: function() {
                Indicator.open();
            },

            //隐藏加载框
            hideLoading: function() {
                Indicator.close();
            },

            //进入选择界面（人员）
            goSelectHumanPage: function() {
                if(this.isManager) {
                    var _this = this;
                    var selectHumans = [{
                        humanID: _this.selectedHuman.humanID,
                        humanName: _this.selectedHuman.humanName
                    }];
                    this.$router.push({
                        name: "juniorHumanList",
                        params: {
                            selectHumans: selectHumans,
                            count: 1,
                            callback: function(humanList) {
                                if(humanList != null && humanList.length > 0) {
                                    var human = humanList[0];
                                    if(human != null) {
//                                        _this.$router.push({
//                                            name: "calendar",
//                                            params: {
//                                                humanID: human.humanID,
//                                                humanName: human.humanName
//                                            }
//                                        });

                                        _this.selectedHuman.humanID = human.humanID;
                                        _this.selectedHuman.humanName = human.humanName;
                                        _this.selectedHuman.isShowSelf = true;

                                        //重置日历
                                        _this.resetCalendar();
                                    }
                                }
                            }
                        }
                    });
                }
            },
        }
    }

</script>

<template>
    <div style="width: 100%;">
        <!-- 置顶部分-->
        <div style="position: fixed; width: 100%; z-index: 9999999;">
            <!-- 人员或人员下级切换-->
            <div id="selectHuman"
                 class="row juniorBackGround"
                 @click="goSelectHumanPage()">
                <div class="col"></div>
                <div>
                    <div class="row">
                        <div class="col-center" v-show="isManager">
                            <div class="icon-search calendarSearch"></div>
                        </div>
                        <div class="col-center">
                            <span>{{selectedHuman.humanName}}</span>
                        </div>
                    </div>
                </div>
                <div class="col"></div>
            </div>

            <!-- 日历月份切换 -->
            <div class="row calendarDateSwitch">
                <div class="col col-center icon-angle-left calenderBackward" @click="backwardMonth()"></div>
                <div class="col-center calenderCurMonth">{{curMonth}}</div>
                <div class="col" @click="forwardMonth()">
                    <div class="row">
                        <div class="col"></div>
                        <div class="col-center icon-angle-right calenderForward"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 滚动部分 -->
        <div style="padding-top: 87px; overflow-y: hidden;">
            <div v-show="selectedHuman.isShowSelf == true"
                 style="background: #ffffff; border-bottom: 1px #cccccc solid; padding-bottom: 5px;">
                <!-- 周 -->
                <div class="row" style="padding-top: 5px;">
                    <div class="col col-center calenderWeek" v-for="week in weekList">{{week}}</div>
                </div>
                <!-- 日历 -->
                <div class="row" v-for="rowCellList in cellList">
                    <div class="col" v-for="cell in rowCellList">
                        <div class="row calendarCellItem"
                             @click="clickCalendarCell(cell)"
                             v-show="cell.isShow">
                            <div class="col"></div>
                            <div>
                                <!-- 日历单元 -->
                                <div class="row">
                                    <div class="col"></div>
                                    <!-- 日期选中框 带四个角 -->
                                    <div class="calendarCellSelect">
                                        <div class="row">
                                            <div class="col calendarCellSelectMarker"
                                                 :style="cell.markerCss.topLeft"></div>
                                            <div class="col calendarCellSelectMarker"></div>
                                            <div class="col calendarCellSelectMarker"></div>
                                            <div class="col calendarCellSelectMarker"
                                                 :style="cell.markerCss.topRight"></div>
                                        </div>
                                        <div class="row">
                                            <div class="col calendarCellSelectMarker"></div>
                                            <div class="col calendarCellSelectMarker"></div>
                                            <div class="col calendarCellSelectMarker"></div>
                                            <div class="col calendarCellSelectMarker"></div>
                                        </div>
                                        <div class="row">
                                            <div class="col calendarCellSelectMarker"></div>
                                            <div class="col calendarCellSelectMarker"></div>
                                            <div class="col calendarCellSelectMarker"></div>
                                            <div class="col calendarCellSelectMarker"></div>
                                        </div>
                                        <div class="row">
                                            <div class="col calendarCellSelectMarker"
                                                 :style="cell.markerCss.bottomLeft"></div>
                                            <div class="col calendarCellSelectMarker"></div>
                                            <div class="col calendarCellSelectMarker"></div>
                                            <div class="col calendarCellSelectMarker"
                                                 :style="cell.markerCss.bottomRight"></div>
                                        </div>
                                        <!-- 日期 -->
                                        <div class="row calenderCell"
                                             :style="cell.css"
                                             :class="{calendarWeekend: cell.isWeekend == true}">
                                            <div class="col"></div>
                                            <div class="col-center">{{cell.day}}</div>
                                            <div class="col"></div>
                                        </div>
                                    </div>
                                    <div class="col"></div>
                                </div>

                                <!-- 考勤城市 -->
                                <div class="row calendarCity">
                                    <div class="col"></div>
                                    <div class="col-center">{{cell.city}}</div>
                                    <div class="col"></div>
                                </div>
                            </div>
                            <div class="col"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 图例 -->
            <div>
                <!-- 图例头 -->
                <div>
                    <div class="row calendarHead">
                        <div class="col-center calendarHeadName">
                            <div class="row">
                                <div class="col-center">月统计</div>
                                <div class="col-center">
                                    <div id="calendarLegendRemark">共{{workDayCount}}个工作日</div>
                                </div>
                            </div>
                        </div>
                        <div class="col"></div>
                        <div class="col-center calendarHeadLink">
                            <div class="row" @click="goYearStatPage()">
                                <div class="col-center">年统计</div>
                                <div class="col-center icon-angle-right" style="margin-left: 10px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 图例 -->
                <div class="calenderLegend">
                    <div v-for="legendRow in legendList">
                        <div class="row">
                            <div class="col col-center" v-for="legend in legendRow">
                                <div class="row calenderLegendCell"
                                     :class="{calendarLegendSelect: selectedLegendType == legend.type}"
                                     v-if="legend.isShow != null && legend.isShow == true"
                                     @click="inversQueryKqList(legend)">
                                    <div class="row">
                                        <!-- 带marker的图标-->
                                        <div class="col-center calenderLegendIconMarker"
                                             style="margin-right: 5px;"
                                             v-if="isShowLegendMarker == true"
                                             :style="legend.markerCss">
                                            <div class="row">
                                                <div class="col"></div>
                                                <div class="col-center calenderLegendIcon" :style="legend.css"></div>
                                                <div class="col"></div>
                                            </div>
                                        </div>
                                        <!-- 不带marker的图标-->
                                        <div class="col-center"
                                             style="margin-right: 5px;"
                                             v-if="isShowLegendMarker == false">
                                            <div class="row">
                                                <div class="col"></div>
                                                <div class="col-center calenderLegendIcon" :style="legend.css"></div>
                                                <div class="col"></div>
                                            </div>
                                        </div>
                                        <div class="col col-center calenderLegendName"
                                             :class="{calendarLegendTopMenu: legend.isTopMenu == true, calendarLegendSelect: selectedLegendType == legend.type}"
                                             >
                                            {{legend.name}}
                                        </div>
                                        <div class="col-center calenderLegendValue"
                                             :class="{calendarLegendSelect: selectedLegendType == legend.type, calenderLegendNoValue: legend.count <= 0 && selectedLegendType != legend.type}">
                                            {{legend.count}}
                                        </div>
                                        <div class="col-center calenderLegendRightIcon icon-angle-right"
                                             :class="{calendarLegendSelect: selectedLegendType == legend.type}"
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
            </div>

            <!-- 考勤城市 -->
            <div style="margin-top: 20px;">
                <!-- 考勤城市头 -->
                <div class="row calendarHead">
                    <div class="col-center calendarHeadName">考勤城市</div>
                </div>
                <!-- 考勤城市内容 -->
                <div class="calenderLegend">
                    <div class="calendarCityBlank"
                         v-if="kqCityList == null || kqCityList.length == 0 || kqCityList[0].length == 0">
                        没有考勤城市相关的统计数据
                    </div>
                    <div v-for="cityRow in kqCityList"
                         v-if="kqCityList != null && kqCityList.length > 0 && kqCityList[0].length > 0">
                        <div class="row">
                            <div class="col col-center" v-for="city in cityRow">
                                <div class="row calenderLegendCell"
                                     :class="{calendarLegendSelect: selectedLegendType == city.name}"
                                     @click="inversQueryCityList(city)">
                                    <div class="row">
                                        <div class="col col-center calenderLegendName"
                                             :class="{calendarLegendSelect: selectedLegendType == city.name}">{{city.name}}</div>
                                        <div class="col-center calenderLegendValue"
                                             :class="{calendarLegendSelect: selectedLegendType == city.name}">{{city.count}}</div>
                                        <div class="col-center calenderLegendRightIcon icon-angle-right"
                                             :class="{calendarLegendSelect: selectedLegendType == city.name}"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 反查的考勤记录 -->
            <component-kq-list :requestParam="kqListParam"></component-kq-list>
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

    .calenderCell {
        -webkit-border-radius: 32px;
        -moz-border-radius: 32px;
        border-radius: 32px;
        border-width: 1px;
        border-color: transparent;
        border-style: solid;
        width: 32px;
        height: 32px;
        background-color: transparent;
        text-align: center;
        font-size: 12px;
        color: #1d1d26;
        margin-top: -32px;
    }

    .calendarCellSelect {
        width: 32px;
        height: 32px;
    }

    .calendarCellItem {
        margin-top: 2px;
        margin-bottom: 2px;
    }

    .calendarCellSelectMarker {
        height: 8px;
    }

    #selectHuman {
        padding: 12px;
        font-size: 15px;
        font-weight: bolder;
        color: #555555;
        background: #ffffff;
    }

    .calendarSearch {
        font-size: 15px;
        margin-right: 10px;
    }

    .calenderWeek {
        text-align: center;
        font-size: 13px;
        color: #37AEFF;
        padding: 5px;
        font-weight: bold;
    }

    .calenderBackward {
        font-size: 22px;
        color: #1DAAFC;
    }

    .calenderForward {
        font-size: 22px;
        color: #1DAAFC;
    }

    .calenderToday,.calenderNotToday {
        -webkit-border-radius: 4px;
        -moz-border-radius: 4px;
        border-radius: 4px;
        width: 4px;
        height: 4px;
        background: #ff0000;
        margin-bottom: 5px;
        margin-top: 2px;
    }

    .calenderNotToday {
        background: transparent;
    }

    .calenderCurMonth {
        font-size: 15px;
        color: #1D1D26;
    }

    .calendarCity {
        font-size: 10px;
        color: #555555;
        margin-top: 2px;
    }

    .calendarCityBlank {
        padding: 10px;
        font-size: 15px;
        color: #bbbbbb;
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
    }

    .calenderLegendValue {
        font-size: 15px;
        color: #1D1D26;
    }

    .calenderLegendNoValue {
        font-size: 15px;
        color: #bcbcbc;
    }

    .calendarLegendTopMenu {
        color: #555555;
        font-weight: bold;
    }

    #calendarLegendRemark {
        color: #bbbbbb;
        font-size: 13px;
        margin-left: 10px;
    }

    .calendarLegendSelect {
        background: #37aeff;
        color: #ffffff;
    }

    .calendarLegendNotSelect {
        background: #ffffff;
    }

    .calendarHead {
        margin-top: 20px;
        background: #ffffff;
        padding: 10px;
        border-top: 1px #cccccc solid;
    }

    .calendarHeadName {
        font-size: 16px;
    }

    .calendarHeadLink {
        font-size: 16px;
        color: #1EABFD;
    }

    .calendarDateSwitch {
        padding: 10px;
        border-top: 1px #cccccc solid;
        border-bottom: 1px #cccccc solid;
        background: #ffffff;
    }

    .calendarWeekend {
        background: #EEEFF3;
        color: #bbbbbb;
    }

    .juniorBackGround {
        background: #ffffff;
    }

    .juniorBackGround:active {
        background: #dddddd;
    }

    .juniorPathName {
        color: #3333aa;
        font-size: 18px;
    }

    .juniorHumanIcon {
        width: 40px;
        height: 40px;
        -webkit-border-radius: 40px;
        -moz-border-radius: 40px;
        border-radius: 40px;
        color: #ffffff;
    }

    .juniorHumanName {
        padding: 10px;
    }

    .juniorHumanShortName {
        padding-top: 11px;
        font-size: 14px;
    }
</style>
