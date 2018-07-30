<script>
    const http = require('Http');
    const dateUtil = require("DateUtil");
    const sysConfig = require("sysConfig");
    const util = require("Util");
    import {Indicator} from 'mint-ui';
    const gData = require('zhixin').data;
    const {bindNavBar} = require('egovanative');
    var TAB_DAY = "1";
    var TAB_MONTH = "0";

    module.exports = {
        created: function () {
            //初始化
            this.init();
        },
        mounted: function () {
        },
        beforeRouteEnter: function (to, from, next) {
            next(function (vm) {
                bindNavBar('团队考勤');
            });
        },
        data: function () {
            return {
                //是否显示图例的marker图标
                isShowLegendMarker: sysConfig.isShowLegendMarker,
                //选中的考勤统计标签页，1表示日统计，2表示月统计
                selected: TAB_DAY,
                //勤奋榜最大的人数
                diligentHumanMaxCount: 3,
                //勤奋榜显示的人数
                diligentHumanCount: 0,
                //月统计是否加载过
                isMonthStatLoaded: false,
                //登陆人对象
                loginHuman: {humanID: gData.humanID, humanName: gData.humanName},
                //人员路径列表
                humanPathList: [{humanID: gData.humanID, humanName: gData.humanName}],
                //下级成员Map
                juniorHumanMap: {},
                //当前列表中的下级成员列表
                juniorHumanList: [],
                //选择的人员
                selectHuman: {},
                //当前月
                curMonth: dateUtil.getMonth(),
                //勤奋榜人员列表
                diligentHumanList: [],
                //图例列表
                legendList: util.clone(sysConfig.getLegendList()),

                //统计tab标签页
                tab: {
                    //入职人数
                    entryTotalCount: 0,
                    //离职人数
                    dimissionTotalCount: 0,
                    //应到人数
                    mustCheckTotalCount: 0,
                    //实到人数
                    realCheckTotalCount: 0,

                    //日统计
                    tabDay: {
                        day: dateUtil.getToday(),
                        dayDesc: dateUtil.getTodayCN(),
                        legendList: []
                    },

                    //月统计
                    tabMonth: {
                        year: dateUtil.getYear(),
                        month: dateUtil.getMonth(),
                        legendList: []
                    }
                },
                statics: {
                    averWorkHour: 0,
                    workRate: 0,
                    totalCount: 0,
                    chuqinCount: 0
                }
            }
        },
        methods: {
            //初始化
            init: function () {
                //勤奋榜人员列表
                this.diligentHumanList = [];
                //默认不加载月统计数据
                this.isMonthStatLoaded = false;
                //选中日统计
                this.selected = TAB_DAY;
                //初始化图例
                this.initLegend();
                //初始化考勤tab页的点击回调
                this.initTabClickWatch();
                //获取勤奋榜数据
                this.startGetDiligentHumanListTask();
                //日统计
                this.startGetDayCheckStatTask();
                //获取下级成员列表
                this.startGetJuniorHumanListTask();
            },
            //初始化图例数据
            initLegend: function () {
                //日统计
                this.tab.tabDay.legendList = [];
                //月统计
                this.tab.tabMonth.legendList = [];
            },
            //初始化考勤统计的tab页的点击回调
            initTabClickWatch: function () {
                this.$watch("selected", function (newVal, oldVal) {
                    //在第一次点击月统计标签时，加载月统计记录
                    if (newVal == TAB_MONTH && this.isMonthStatLoaded == false) {
                        this.isMonthStatLoaded = true;
                        //月统计
                        this.startGetMonthCheckStatTask();
                    }

                    //切换标签页时，清空人员数据缓存
                    this.juniorHumanMap = {};
                    //获取下级成员列表
                    this.startGetJuniorHumanListTask();
                });
            },

            //点击团队路径的项
            clickPathItem: function (human) {
                for (var i = 0; i < this.humanPathList.length - 1; i++) {
                    var pathHuman = this.humanPathList[i];
                    if (human.humanID == pathHuman.humanID) {
                        this.humanPathList.splice(i + 1, this.humanPathList.length - i - 1);
                    }
                }

                //重新初始化
                this.init();
            },

            //点击人员项
            clickHumanItem: function (human) {
                if (human != null) {
                    if (human.juniorAllNum != null && human.juniorAllNum > 0) {
                        var hasFind = false;
                        for (var i = 0; i < this.humanPathList.length; i++) {
                            if (this.humanPathList[i].humanID == human.humanID) {
                                hasFind = true;
                                break;
                            }
                        }

                        if (!hasFind) {
                            //团队，进入下级成员列表
                            this.humanPathList = this.humanPathList.concat(human);
                            //初始化
                            this.init();
                        }
                    } else {
                        //进入人员考勤日历界面
                        this.goHumanCalendarPage(human);
                    }
                }
            },

            //获取当前团队领导
            getTeamLeader: function () {
                //路径中的最后一个人
                var lastPathHuman = this.loginHuman;
                if (this.humanPathList.length > 0) {
                    lastPathHuman = this.humanPathList[this.humanPathList.length - 1];
                }
                return lastPathHuman;
            },

            //上一天
            backwardDay: function () {
                this.tab.tabDay.day = dateUtil.getLastDay(this.tab.tabDay.day);
                this.tab.tabDay.dayDesc = dateUtil.getDateCN(this.tab.tabDay.day);

                //日统计
                this.startGetDayCheckStatTask();
                //清空人员数据缓存
                this.juniorHumanMap = {};
                //获取下级成员列表
                this.startGetJuniorHumanListTask();
            },

            //下一天
            forwardDay: function () {
                this.tab.tabDay.day = dateUtil.getNextDay(this.tab.tabDay.day);
                this.tab.tabDay.dayDesc = dateUtil.getDateCN(this.tab.tabDay.day);

                //日统计
                this.startGetDayCheckStatTask();
                //清空人员数据缓存
                this.juniorHumanMap = {};
                //获取下级成员列表
                this.startGetJuniorHumanListTask();
            },

            //上一月
            backwardMonth: function () {
                if (this.tab.tabMonth.month == 1) {
                    this.tab.tabMonth.year--;
                    this.tab.tabMonth.month = 12;
                } else {
                    this.tab.tabMonth.month--;
                }

                //月统计
                this.startGetMonthCheckStatTask();
                //清空人员数据缓存
                this.juniorHumanMap = {};
                //获取下级成员列表
                this.startGetJuniorHumanListTask();
            },

            //下一月
            forwardMonth: function () {
                if (this.tab.tabMonth.month == 12) {
                    this.tab.tabMonth.year++;
                    this.tab.tabMonth.month = 1;
                } else {
                    this.tab.tabMonth.month++;
                }

                //月统计
                this.startGetMonthCheckStatTask();
                //清空人员数据缓存
                this.juniorHumanMap = {};
                //获取下级成员列表
                this.startGetJuniorHumanListTask();
            },

            //日统计
            startGetDayCheckStatTask: function () {
                var beginEndDate = this.getStatBeginEndDate(TAB_DAY);
                this.startGetCheckStatTask(this.getTeamLeader(), beginEndDate.beginDate, beginEndDate.endDate);
            },

            //月统计
            startGetMonthCheckStatTask: function () {
                var beginEndDate = this.getStatBeginEndDate(TAB_MONTH);
                this.startGetCheckStatTask(this.getTeamLeader(), beginEndDate.beginDate, beginEndDate.endDate);
            },

            //获取统计时间段
            getStatBeginEndDate: function (tabIndex) {
                var beginDate = this.tab.tabDay.day;
                var endDate = this.tab.tabDay.day;
                if (tabIndex != null && tabIndex == TAB_MONTH) {
                    var beginEndDate = dateUtil.getBeginEndDate(this.tab.tabMonth.year, this.tab.tabMonth.month);
                    beginDate = beginEndDate.monthBeginDateStr;
                    endDate = beginEndDate.monthEndDateStr;
                }
                return {
                    beginDate: beginDate,
                    endDate: endDate
                }
            },


            //初始化图例的统计值
            initLegendItemValue: function (checkStatCount, beginDate, endDate) {
                var allLegend = sysConfig.getLegendListFlatten();

                var showList = [];

                allLegend.map(legend => {
                    var count = 0
                    switch (legend.type) {
                        case sysConfig.LEGEND_QUANQIN://全勤
                            count = checkStatCount.normalCount;
                            break;
                        case sysConfig.LEGEND_KUANGGONG://旷工
                            count = checkStatCount.kuanggongCount;
                            break;
                        case sysConfig.LEGEND_QUEQIN://缺勤
                            count = checkStatCount.queqinCount;
                            break;
                        case sysConfig.LEGEND_EXCEPTION://位置异常或代打卡异常
                            count = checkStatCount.addressExceptionCount;
                            break;
                        case sysConfig.LEGEND_CHIDAO://迟到
                            count = checkStatCount.chidaoCount;
                            break;
                        case sysConfig.LEGEND_ZAOTUI://早退
                            count = checkStatCount.zaotuiCount;
                            break;
                        case sysConfig.LEGEND_LEAVE://请假
                            count = checkStatCount.leaveCount;
                            break;
                        case sysConfig.LEGEND_XIUXIRI_DAKA://休息日打卡
                            count = checkStatCount.notWorkDayInCount;
                            break;
                        case sysConfig.LEGEND_CHUQIN://出勤
                            count = checkStatCount.chuqinCount;
                            break;
                        case sysConfig.LEGEND_NOT_CHECK://未打卡
                            count = checkStatCount.weidakaCount;
                            break;
                    }
                    count = parseInt(count);
                    if(isNaN(count)) {
                        count = 0;
                    }

                    legend.count = count;

                    if (this.selected == TAB_MONTH) {
                        if (count > 0 && legend.type != sysConfig.LEGEND_NOT_CHECK) {
                            showList.push(legend)
                        }
                    } else {
                        var isToday = beginDate == endDate
                            && beginDate == dateUtil.formatDateByDate(new Date(), dateUtil.FORMAT_YMD);
                        var isWeekDay = checkStatCount.workdayFlag != 1;

                        //如果是今天，去掉旷工，换上未打卡
                        //如果是休息日，只显示打卡
                        var cancelAdd = (isToday && legend.type == sysConfig.LEGEND_KUANGGONG)
                            || (!isToday && legend.type == sysConfig.LEGEND_NOT_CHECK)
                            || (isWeekDay && legend.type != sysConfig.LEGEND_XIUXIRI_DAKA)

                        if (!cancelAdd && count > 0) {
                            showList.push(legend)
                        }
                    }
                })

                var partition = [];
                var size = 3;

                var diff = showList.length % size;
                while (diff > 0 && diff++ <= size) {
                    showList.push({isShow: false});
                }

                //[1, 2, 3, 4, 5, 6, 7] => [[1, 2, 3], [4, 5, 6], [7, stub, stub]]
                for (var i = Math.floor(showList.length / size) - 1; i >= 0; i--) {
                    partition[i] = showList.slice(i * size, (i + 1) * size);
                }

                if (this.selected == TAB_MONTH) {
                    this.tab.tabMonth.legendList = partition;
                } else {
                    this.tab.tabDay.legendList = partition;
                }
            },

            //获取空的勤奋榜人员
            getBlankDiligentHuman: function () {
                return {
                    humanID: -1,
                    humanName: "虚席以待",
                    shortName: "",
                    css: sysConfig.getPhotoColorCss(-1)
                }
            },

            //获取勤奋榜数据
            startGetDiligentHumanListTask: function () {
                var teamLeader = this.getTeamLeader();
                var beginEndDate = dateUtil.getBeginEndDate(dateUtil.getYear(), dateUtil.getMonth());
                var beginDate = beginEndDate.monthBeginDateStr;
                var endDate = beginEndDate.monthEndDateStr;
                var _this = this;
                http.ajax({
                    functionName: "mi/checkstat/gethardworkranking",
                    params: {
                        humanID: teamLeader.humanID,
                        beginDate: beginDate,
                        endDate: endDate,
                        count: _this.diligentHumanMaxCount
                    },
                    success: function (resultInfo) {
                        if (resultInfo.success) {
                            _this.diligentHumanList = [];
                            if (resultInfo.data.list != null) {
                                _this.diligentHumanList = resultInfo.data.list;
                                var count = _this.diligentHumanList.length;
                                for (var i = 0; i < count; i++) {
                                    var human = _this.diligentHumanList[i];
                                    human.shortName = sysConfig.getShortName(human.humanName);
                                    human.css = sysConfig.getPhotoColorCss(human.humanID);
                                }
                            }
                            //如果查询的勤奋榜人数小于3，则添加空的人员
                            _this.diligentHumanCount = _this.diligentHumanList.length;
                            if (_this.diligentHumanCount < _this.diligentHumanMaxCount) {
                                for (var j = 0; j < _this.diligentHumanMaxCount - _this.diligentHumanCount; j++) {
                                    _this.diligentHumanList.push(_this.getBlankDiligentHuman());
                                }
                            }
                        } else {
                            alert("获取勤奋榜数据失败:" + resultInfo.message);
                        }
                    },
                    error: function (data) {
                        alert("获取勤奋榜数据错误");
                    }
                });
            },

            //获取考勤统计任务
            startGetCheckStatTask: function (human, beginDate, endDate) {
                var _this = this;
                http.ajax({
                    functionName: "mi/checkstat/getjuniorhumancheckstat",
                    params: {humanID: human.humanID, beginDate: beginDate, endDate: endDate},
                    success: function (resultInfo) {
                        if (resultInfo.success) {
                            //图例数据统计
                            var dataList = resultInfo.data.list;
                            if (dataList != null && dataList.length > 0) {
                                var checkStatCount = dataList[0];
                                _this.initLegendItemValue(checkStatCount, beginDate, endDate);
                            }

                            if (_this.selected == TAB_MONTH) {
                                dataList = resultInfo.data.monthGroupCheckStat;
                                if (dataList && dataList.length > 0) {
                                    var source = dataList[0];
                                    if (source) {
                                        _this.statics.averWorkHour = source.averWorkHour && parseFloat(source.averWorkHour).toFixed(1) || 0;
                                        _this.statics.workRate = source.workRate && Math.floor(source.workRate) || 0;
                                    } else {
                                        _this.statics.averWorkHour = 0;
                                        _this.statics.workRate = 0;
                                    }
                                }
                            } else {
                                var source = dataList[0];
                                if (source) {
                                    _this.statics.totalCount = source.count || 0;
                                    _this.statics.chuqinCount = source.chuqinCount || 0;
                                } else {
                                    _this.statics.totalCount = 0;
                                    _this.statics.chuqinCount = 0;
                                }
                            }
                        } else {
                            alert("获取考勤统计记录失败:" + resultInfo.message);
                        }
                    },
                    error: function (data) {
                        alert("获取考勤统计记录错误");
                    }
                });
            },

            //获取下级人员列表
            startGetJuniorHumanListTask: function () {
                var teamLeader = util.clone(this.getTeamLeader());
                //获取下级成员列表，优先从缓存中读取
                if (this.juniorHumanMap[teamLeader.humanID] != null) {
                    this.juniorHumanList = this.juniorHumanMap[teamLeader.humanID];
                } else {
                    var _this = this;
                    var beginEndDate = this.getStatBeginEndDate(this.selected);
                    http.ajax({
                        functionName: "mi/checkstat/getteamdynamic",
                        params: {
                            humanID: teamLeader.humanID,
                            type: parseInt(this.selected),
                            beginDate: beginEndDate.beginDate,
                            endDate: beginEndDate.endDate
                        },
                        success: function (resultInfo) {
                            if (resultInfo && resultInfo.success) {
                                //入职人数
                                _this.tab.entryTotalCount = resultInfo.data.entryTotalCount;
                                //离职人数
                                _this.tab.dimissionTotalCount = resultInfo.data.dimissionTotalCount;
                                //应到人数
                                _this.tab.mustCheckTotalCount = resultInfo.data.mustCheckTotalCount;
                                //实到人数
                                _this.tab.realCheckTotalCount = resultInfo.data.realCheckTotalCount;

                                var dataList = resultInfo.data.list;
                                teamLeader.juniorAllNum = 0;
                                //将团队领导移动到第一个位置
                                dataList = _this.moveLeaderToFirstPostion(dataList, teamLeader.humanID);
                                //解析人员列表
                                _this.juniorHumanList = _this.parseHumanList(dataList);
                                //缓存人员列表数据
                                _this.juniorHumanMap[teamLeader.humanID] = _this.juniorHumanList;
                            } else {
                                alert("获取下级成员列表失败");
                            }
                        }, error: function (data) {
                            alert("获取下级成员列表错误");
                        }
                    });
                }
            },

            //将团队领导移动到第一个位置
            moveLeaderToFirstPostion: function (humanList, leaderHumanID) {
                if (humanList != null && humanList.length > 1) {
                    var pos = -1;
                    for (var i = 0; i < humanList.length; i++) {
                        if (humanList[i].humanID == leaderHumanID) {
                            pos = i;
                            break;
                        }
                    }
                    if (pos > 0) {
                        //将团队领导和首位置的人交换位置
                        var leader = humanList[pos];
                        humanList[pos] = humanList[0];
                        humanList[0] = leader;
                    }
                }

                return humanList;
            },

            //解析人员列表
            parseHumanList: function (humanList) {
                this.tab.isShowEnterAndDimission = false;
                for (var i = 0; humanList != null && i < humanList.length; i++) {
                    var human = humanList[i];
                    human.shortName = sysConfig.getShortName(human.humanName);
                    human.css = sysConfig.getPhotoColorCss(human.humanID);
                    human.isShowSelf = true;
                    if (human.entryCount == null) {
                        human.entryCount = 0;
                    }
                    if (human.dimissionCount == null) {
                        human.dimissionCount = 0;
                    }
                    if (human.workHourAverage == null) {
                        human.workHourAverage = 0;
                    }
                    if (human.realCheckCount == null) {
                        human.realCheckCount = 0;
                    }
                    if (human.mustCheckCount == null) {
                        human.mustCheckCount = 0;
                    }

                    //只有有一个人员变动的数据，才显示入职/离职
                    if (human.entryCount > 0 || human.dimissionCount > 0) {
                        _this.tab.isShowEnterAndDimission = true;
                    }
                }

                humanList && humanList.sort((left, right) => {
                    return left.juniorAllNum < right.juniorAllNum ? 1 : -1
                })

                return humanList;
            },

            //进入考勤列表界面
            goKqListPage: function (tabIndex, legendItem) {
                if (legendItem != null
                        && legendItem.isInversQuery != null
                        && legendItem.isInversQuery == true
                        && legendItem.count > 0) {
                    var beginEndDate = this.getStatBeginEndDate(tabIndex);
                    var _this = this;
                    this.$router.push({
                        name: "kqList",
                        params: {
                            humanID: _this.getTeamLeader().humanID,
                            where: legendItem.where,
                            beginDate: beginEndDate.beginDate,
                            endDate: beginEndDate.endDate,
                            isSelf: false
                        }
                    });
                }
            },

            //进入个人考勤日历界面
            goHumanCalendarPage: function (human) {
                if (human != null && human.humanID >= 0) {
                    this.$router.push({
                        name: "calendar",
                        params: {
                            humanID: human.humanID,
                            humanName: human.humanName
                        }
                    });
                }
            },

            //进入完整勤奋榜页面
            goDiligentHumanListPage: function () {
                var beginEndDate = dateUtil.getBeginEndDate(dateUtil.getYear(), dateUtil.getMonth());
                var beginDate = beginEndDate.monthBeginDateStr;
                var endDate = beginEndDate.monthEndDateStr;
                var _this = this;
                this.$router.push({
                    name: "diligentHumanList",
                    params: {
                        humanID: _this.getTeamLeader().humanID,
                        beginDate: beginDate,
                        endDate: endDate
                    }
                });
            }
        }
    }
</script>
<template>
    <div style="background-color: #eeeeee;">
        <!-- 团队路径 -->
        <div id="focusPath" class="focusBottomLine" direction="x" style="overflow-x: auto;"
             delegate-handle="pathScroll">
            <div id="focusPathContent">
                <div id="focusPathRow" class="row">
                    <div class="col-center focusPathItem" v-for="(human, index) in humanPathList"
                         @click="clickPathItem(human)">
                        <div class="row">
                            <div class="col-center focusPathItemName"
                                 v-if="human.unitName == null || human.unitName == ''">{{human.humanName}}团队
                            </div>
                            <div class="col-center focusPathItemName"
                                 v-if="human.unitName != null && human.unitName != ''">{{human.unitName}}
                            </div>
                            <div id="focusArrow" class="col-center icon-angle-right"
                                 v-show="index < humanPathList.length - 1"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 勤奋榜 -->
        <div class="teamItem" style="padding-top: 69px;">
            <div style="background: #ffffff;">
                <div style="border: 1px #cccccc solid; padding: 10px;">
                    <div class="row">
                        <div class="teamItemName col-center" style="padding-left: 0px;">{{curMonth}}月勤奋榜</div>
                        <div class="col"></div>
                        <div id="rankAll" class="col-center"
                             v-if="diligentHumanCount > 0"
                             @click="goDiligentHumanListPage()">
                            查看完整排行榜
                        </div>
                        <div class="col-center rankArrow icon-angle-right" v-if="diligentHumanCount > 0"></div>
                    </div>
                </div>
                <div style="padding-bottom: 10px;">
                    <div class="row">
                        <div class="col col-center"
                             v-for="(human, index) in diligentHumanList"
                             @click="goHumanCalendarPage(human)">
                            <!-- 头像 -->
                            <div>
                                <div class="row">
                                    <div class="col"></div>
                                    <div class="col-center humanHeadPic"
                                         v-if="human.humanID >= 0"
                                         :style="human.css">
                                        {{human.shortName}}
                                    </div>
                                    <img class="col-center humanHeadBlankPic"
                                         v-if="human.humanID < 0"
                                         src="../../image/blank_human.png"/>
                                    <div class="col"></div>
                                </div>
                            </div>
                            <!-- 名字 -->
                            <div>
                                <div class="row">
                                    <div class="col"></div>
                                    <div class="col-center">
                                        <div class="row">
                                            <img class="col-center rankPic" src="../../image/rank_1.png"
                                                 v-if="index == 0"/>
                                            <img class="col-center rankPic" src="../../image/rank_2.png"
                                                 v-if="index == 1"/>
                                            <img class="col-center rankPic" src="../../image/rank_3.png"
                                                 v-if="index == 2"/>
                                            <div class="col-center rankHumanName">{{human.humanName}}</div>
                                        </div>
                                    </div>
                                    <div class="col"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- 日/月数据统计 -->
        <div style="margin-top: 20px;border-top: 1px #cccccc solid; background: #ffffff;">
            <mt-navbar v-model="selected">
                <mt-tab-item id="1">日统计</mt-tab-item>
                <mt-tab-item id="0">月统计</mt-tab-item>
            </mt-navbar>
            <mt-tab-container v-model="selected">
                <!-- 日统计 -->
                <mt-tab-container-item id="1">
                    <!-- 日期切换 -->
                    <div>
                        <div class="row teamDateNav">
                            <div class="col icon-angle-left teamDateNavArrow" @click="backwardDay()"></div>
                            <div class="col-center teamSwitchDate">{{tab.tabDay.dayDesc}}</div>
                            <div class="col teamDateNavArrow" @click="forwardDay()">
                                <div class="row">
                                    <div class="col"></div>
                                    <div class="col-center icon-angle-right"></div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div class="dayStatistics">
                        <div class="value">{{statics.chuqinCount}}/{{statics.totalCount}}</div>
                        <div class="middleFont textGray">实到/应到</div>
                    </div>

                    <!-- 图例 -->
                    <div class="calenderLegend">
                        <div v-for="legendRow in tab.tabDay.legendList">
                            <div class="row">
                                <div class="col col-center" v-for="legend in legendRow">
                                    <div class="row calenderLegendCell"
                                         v-if="legend.isShow != null && legend.isShow == true"
                                         @click="goKqListPage('1', legend)">
                                        <div class="row">
                                            <!-- 带marker的图标-->
                                            <div class="col-center calenderLegendIconMarker"
                                                 style="margin-right: 5px;"
                                                 v-if="isShowLegendMarker == true"
                                                 :style="legend.markerCss">
                                                <div class="row">
                                                    <div class="col"></div>
                                                    <div class="col-center calenderLegendIcon"
                                                         :style="legend.css"></div>
                                                    <div class="col"></div>
                                                </div>
                                            </div>
                                            <!-- 不带marker的图标-->
                                            <div class="col-center"
                                                 style="margin-right: 5px;"
                                                 v-if="isShowLegendMarker == false">
                                                <div class="row">
                                                    <div class="col"></div>
                                                    <div class="col-center calenderLegendIcon"
                                                         :style="legend.css"></div>
                                                    <div class="col"></div>
                                                </div>
                                            </div>
                                            <div class="col col-center calenderLegendName">{{legend.name}}</div>
                                            <div class="col-center calenderLegendValue"
                                                 :class="{calenderLegendNoValue: legend.count <= 0}">{{legend.count}}
                                            </div>
                                            <div class="col-center calenderLegendRightIcon icon-angle-right"
                                                 v-if="legend.isInversQuery != null && legend.isInversQuery == true"></div>
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
                </mt-tab-container-item>
                <!-- 月统计 -->
                <mt-tab-container-item id="0">

                    <!-- 日期切换 -->
                    <div class="row teamDateNav">
                        <div class="col icon-angle-left teamDateNavArrow" @click="backwardMonth()"></div>
                        <div class="col-center teamSwitchDate">{{tab.tabMonth.year}}年{{tab.tabMonth.month}}月</div>
                        <div class="col teamDateNavArrow" @click="forwardMonth()">
                            <div class="row">
                                <div class="col"></div>
                                <div class="col-center icon-angle-right"></div>
                            </div>
                        </div>
                    </div>

                    <div class="monthStatistics row borderBottom">
                        <div class="col-50 borderRight">
                            <div class="value">{{statics.workRate}}<span class="percent">%</span></div>
                            <div class="desc textGray middleFont">出勤率</div>
                        </div>
                        <div class="col-50">
                            <div class="value">{{statics.averWorkHour}}</div>
                            <div class="desc textGray middleFont">平均工时</div>
                        </div>
                    </div>

                    <!-- 图例 -->
                    <div class="calenderLegend">
                        <div v-for="legendRow in tab.tabMonth.legendList">
                            <div class="row">
                                <div class="col col-center" v-for="legend in legendRow">
                                    <div class="row calenderLegendCell"
                                         v-if="legend.isShow != null && legend.isShow == true"
                                         @click="goKqListPage('0', legend)">
                                        <div class="row">
                                            <!-- 带marker的图标-->
                                            <div class="col-center calenderLegendIconMarker"
                                                 style="margin-right: 5px;"
                                                 v-if="isShowLegendMarker == true"
                                                 :style="legend.markerCss">
                                                <div class="row">
                                                    <div class="col"></div>
                                                    <div class="col-center calenderLegendIcon"
                                                         :style="legend.css"></div>
                                                    <div class="col"></div>
                                                </div>
                                            </div>
                                            <!-- 不带marker的图标-->
                                            <div class="col-center"
                                                 style="margin-right: 5px;"
                                                 v-if="isShowLegendMarker == false">
                                                <div class="row">
                                                    <div class="col"></div>
                                                    <div class="col-center calenderLegendIcon"
                                                         :style="legend.css"></div>
                                                    <div class="col"></div>
                                                </div>
                                            </div>
                                            <div class="col col-center calenderLegendName">{{legend.name}}</div>
                                            <div class="col-center calenderLegendValue"
                                                 :class="{calenderLegendNoValue: legend.count <= 0}">{{legend.count}}
                                            </div>
                                            <div class="col-center calenderLegendRightIcon icon-angle-right"
                                                 v-if="legend.isInversQuery != null && legend.isInversQuery == true"></div>
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
                </mt-tab-container-item>
            </mt-tab-container>
        </div>

        <!-- 人员变动(有数据才显示) -->
        <div class="teamItem"
             style="margin-top: 20px;"
             v-if="tab.entryTotalCount > 0 || tab.dimissionTotalCount > 0">
            <div style="background: #ffffff; padding-top: 10px;">
                <div style="padding-bottom: 10px; border-bottom: 1px #cccccc solid;">
                    <div class="row">
                        <div class="teamItemName col-center">人员变动</div>
                    </div>
                </div>
            </div>

            <div class="row" style="background: #ffffff;">
                <div class="col">
                    <div class="row">
                        <div class="col col-center humanDynamicName">入职</div>
                        <div class="col-center humanDynamicValue"
                             :class="{calenderLegendNoValue: tab.entryTotalCount <= 0}">{{tab.entryTotalCount}}
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="row">
                        <div class="col col-center humanDynamicName">离职</div>
                        <div class="col-center humanDynamicValue"
                             :class="{calenderLegendNoValue: tab.dimissionTotalCount <= 0}">{{tab.dimissionTotalCount}}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 下属团队 -->
        <div class="teamItem" style="margin-top: 20px;">
            <div style="background: #ffffff; padding-top: 10px;">
                <div style="padding-bottom: 10px; border-bottom: 1px #cccccc solid;">
                    <div class="row">
                        <div class="teamItemName col-center">下属团队</div>
                    </div>
                </div>
                <div style="width: 100%;">
                    <!-- 列头 -->
                    <div class="row juniorHumanHead">
                        <div class="col col-center"><span style="padding-left: 65px;">名称</span></div>
                        <div class="col col-center centerText" v-if="selected == 1">实到/应到</div>
                        <div class="col col-center centerText" v-if="tab.isShowEnterAndDimission">
                            入职/离职
                        </div>
                        <div class="col col-center centerText" v-if="selected == '0'">人均工时</div>
                    </div>
                    <div class="list">
                        <div v-for="human in juniorHumanList" class="focusBottomLine">
                            <div class="row" @click="clickHumanItem(human)">
                                <!-- 头像和名称 -->
                                <div class="col-center col">
                                    <div class="row">
                                        <!-- 头像 -->
                                        <div class="col-center focusHumanHeadPic"
                                             v-if="human.juniorAllNum <= 0"
                                             :style="human.css">
                                            {{human.shortName}}
                                        </div>
                                        <div class="col-center focusHumanGroupPic"
                                             v-if="human.juniorAllNum > 0">
                                        </div>
                                        <!-- 名称 -->
                                        <div class="col col-center">
                                            <div class="row">
                                                <div class="col col-center focusHumanName"
                                                     v-if="human.juniorAllNum <= 0">
                                                    {{human.humanName}}
                                                </div>
                                                <div class="col col-center focusHumanName"
                                                     v-if="human.juniorAllNum > 0">
                                                    {{human.unitName}}({{human.humanName}})
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <!-- 实到/应到 -->
                                <div class="col col-center centerText"
                                     v-if="selected == 1">
                                    {{human.realCheckCount}}/{{human.mustCheckCount}}
                                </div>
                                <!-- 入职/离职 -->
                                <div class="col col-center centerText" v-if="tab.isShowEnterAndDimission">
                                    {{human.entryCount}}/{{human.dimissionCount}}
                                </div>
                                <!-- 人均工时 -->
                                <div class="col col-center centerText" v-if="selected == '0'">
                                    {{human.workHourAverage}}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .centerText {
        text-align: center;
    }

    .row {
        padding: 0px;
        margin: 0px;
    }

    .col {
        padding: 0px;
        margin: 0px;
    }

    .teamItem {
        border: 1px #cccccc solid;
        background: transparent;
    }

    .teamDateNav {
        border: 1px #cccccc solid;
        background: #ffffff;
        padding: 10px;
    }

    .teamDateNavArrow {
        font-size: 24px;
        color: #1DAAFC;
    }

    .humanHeadBlankPic {
        width: 45px;
        height: 45px;
        -webkit-background-size: 100% 100%;
        background-size: 100% 100%;
        margin: 10px;
        background-repeat: no-repeat;
    }

    .humanHeadPic {
        width: 45px;
        height: 45px;
        border-radius: 45px;
        text-align: center;
        color: #fff;
        padding-top: 13px;
        margin: 10px;
        background: #888888;
    }

    .rankHumanName {
        color: #555555;
        font-size: 12px;
    }

    .rankPic {
        width: 20px;
        height: 20px;
        -webkit-background-size: 100% 100%;
        background-size: 100% 100%;
        margin-right: 5px;
    }

    .teamItemName {
        color: #000000;
        font-size: 16px;
        padding-left: 10px;
    }

    #rankAll {
        color: #37AEFF;
        font-size: 13px;
    }

    .rankArrow {
        color: #37AEFF;
        font-size: 15px;
        margin-left: 10px;
    }

    .teamSwitchDate {
        font-size: 15px;
        color: #1D1D26;
    }

    .calenderLegend {
        margin-top: -1px;
        border-top: 1px #cccccc solid;
        border-left: 1px #cccccc solid;
    }

    .calenderLegendCell {
        border-right: 1px #cccccc solid;
        border-bottom: 1px #cccccc solid;
        padding: 10px;
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

    .calenderLegendRightIcon {
        font-size: 16px;
        color: #bbbbbb;
        margin-left: 5px;
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

    .humanDynamicValue {
        padding: 10px;
        font-size: 15px;
        color: #1D1D26;
        border-right: 1px #cccccc solid;
    }

    .calenderLegendValue {
        font-size: 15px;
        color: #1D1D26;
    }

    .calenderLegendNoValue {
        font-size: 15px;
        color: #bcbcbc;
    }

    .wrapWord {
        word-wrap: break-word;
        word-break: break-all;
        width: auto;
        display: block;
        white-space: normal;
        overflow: hidden;
    }

    #focusPath {
        width: 100%;
        font-size: 15px;
        color: #37AEFF;
        background: #ffffff;
        position: fixed;
        z-index: 999999;
        border-top: 1px #cccccc solid;
    }

    .focusPathItem {
        padding-top: 15px;
        padding-bottom: 15px;
    }

    .focusPathItemName {
        padding-left: 10px;
        padding-right: 10px;
    }

    #focusArrow {
        font-size: 18px;
        color: #555555;
    }

    #focusSave {
        font-size: 18px;
        padding: 10px;
    }

    .focusHumanHeadPic {
        width: 45px;
        height: 45px;
        border-radius: 45px;
        text-align: center;
        color: #fff;
        padding-top: 13px;
        margin: 10px;
        background: #888888;
    }

    .focusHumanGroupPic {
        background: url("../../image/icon_group.png");
        width: 45px;
        height: 45px;
        margin: 10px;
        -webkit-background-size: 100% 100%;
        background-size: 100% 100%;
    }

    .focusSelect {
        font-size: 22px;
        color: #ff0000;
        padding-right: 10px;
    }

    .focusLeftLine {
        border-left: solid 1px #cccccc;
    }

    .focusJuniorNum {
        padding: 5px 5px 5px 5px;
        font-size: 16px;
        color: #555555;
        min-width: 55px;
        text-align: center;
    }

    .focusJuniorArrow {
        font-size: 22px;
        color: #888888;
        padding-right: 10px;
    }

    .focusBottomLine {
        border-bottom: solid 1px #dddddd;
    }

    .focusHumanName {
        font-size: 15px;
        color: #555555;
        margin-right: 10px;
    }

    #focusPathContent {
        width: max-content;
        width: -webkit-max-content;
    }

    .juniorLookSelf {
        padding: 5px 10px 5px 10px;
        color: #ffffff;
        background: #8B1A1A;
        -webkit-border-radius: 3px;
        -moz-border-radius: 3px;
        border-radius: 3px;
        border: 1px solid #8B1A1A;
        margin-right: 10px;
    }

    .lookJuniorHumanStat {
        padding-left: 10px;
        padding-top: 10px;
        padding-bottom: 10px;
        color: #555555;
        font-size: 14px;
    }

    .juniorUnitItem {
        padding-left: 10px;
        padding-top: 10px;
        padding-bottom: 10px;
        color: #555555;
    }

    .juniorUnitName {
        font-size: 16px;
    }

    .juniorHumanHead {
        border-bottom: 1px #cccccc solid;
        font-size: 12px;
        padding-top: 10px;
        padding-bottom: 10px;
        color: #555555;
    }

    .humanDynamicName {
        padding: 10px;
        font-size: 15px;
        color: #555555;
    }

    .teamCanvas {
        width: 300px;
        height: 200px;
    }

    .monthStatistics div {
        text-align: center;
        padding: 10px 0;
    }

    .monthStatistics .value {
        font-size: 35px;
    }

    .monthStatistics .percent {
        font-size: 20px;
    }

    .monthStatistics .desc {
        padding: 0;
    }

    .borderRight {
        border-right: 1px #cccccc solid;
    }

    .borderBottom {
        border-bottom: 1px #cccccc solid;
    }

    .dayStatistics {
        padding: 10px;
    }

    .dayStatistics div {
        width: 100%;
        text-align: center;
    }

    .dayStatistics .value {
        font-size: 50px;
    }
</style>
