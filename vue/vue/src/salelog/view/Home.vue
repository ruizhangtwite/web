<script>
    import Vue from 'vue'
    import {Toast} from 'mint-ui'
    const dateUtil = require('DateUtil');
    const Util = require('Util');
    const sysConfig = require('sysConfig');
    const http = require('Http');
    const gData = require('zhixin').data;
    const {bindNavBar} = require('egovanative');


    const MAX_DISPLAY_HUMAN_COUNT = 5;
    module.exports = {
        data () {
            return {
                name: "Home",
                weekList: ["一", "二", "三", "四", "五", "六", "日"],
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1,
                isCalendarOpen: false,
                cellList: [],
                selectedCell: null,
                mySalelogData: {
                    isLoading: false,
                    hasMoreDataLoad: true,
                    salelogList: []
                },

                focusData: {
                    isLoading: false,
                    focusHuman: {},
                    focusProject: {}
                },
                juniorSalelog: {
                    isLoading: false,
                    hasMoreDataLoad: false,
                    salelogList: []
                },
                isLeader: false,//是否是领导

                selectRow: 0,
                topRow: 0,
                contentTop: 0,
                shouldAddCalendarAnim: false,//等第一次手动切换时再加上动画
            }
        },
        methods: {
            addSalelog() {
                this.$router.push({
                    name: "addSalelog", params: {
                        callback: ()=> {
                            //如果不是今天，切换到今天
                            if (!this.isSelectToday()) {
                                var date = new Date();
                                this.year = date.getFullYear();
                                this.month = date.getMonth() + 1;
                                this.initCalendar (this.year, this.month);
                            }
                            this.startGetMySalelogTask();
                        }
                    }
                });
            },
            backClick () {
                Util.goBack();
            },

            clickCell(cell, selectIndex) {
                if (!this.canSelect(cell)) {
                    return;
                }
                if (cell) {
                 var date = cell.date;
                    if (date.getFullYear() != this.year ||
                               date.getMonth() + 1 != this.month) {
                        this.year = date.getFullYear();
                        this.month = date.getMonth() + 1;
                        this.initCalendar(this.year, this.month, cell);
                        return;
                    }
                }

                this.selectedCell = cell;
                if (this.isCalendarOpen) {
                    this.selectRow = selectIndex;
                }
            },

            onLastClick(){
                if (this.isCalendarOpen) {
                    this.lastMonth();
                } else {
                    this.lastWeek();
                }
            },
            onNextClick(){
                if (this.isCalendarOpen) {
                    this.nextMonth();
                } else {
                    this.nextWeek();
                }
            },
            nextMonth() {
                if (this.month == 12) {
                    this.year++;
                    this.month = 1;
                } else {
                    this.month++;
                }
                this.initCalendar(this.year, this.month);
            },
            lastMonth() {
                if (this.month == 1) {
                    this.year--;
                    this.month = 12;
                } else {
                    this.month--;
                }
                this.initCalendar(this.year, this.month);
            },
            //默认为星期一
            nextWeek() {
                var cellList = this.cellList;
                if (this.selectRow < cellList.length - 1) {
                    this.switchRow();
                    this.selectRow++;
                    this.switchRow();
                    this.selectedCell = this.cellList[0][0];
                } else {
                    this.nextMonth();
                    this.switchRow();

                    var firstDayOfMonth = dateUtil.getFirstDayOfMonth(this.year, this.month);
                    var weekIndex = dateUtil.getWeekNum(firstDayOfMonth) - 1;
                    if (weekIndex == 0) {
                        this.selectRow = 0;
                    } else {
                        this.selectRow = 1;
                    }
                    this.selectedCell = this.cellList[this.selectRow][0];
                    this.switchRow();
                }
            },
            lastWeek() {
                if (this.selectRow > 0) {
                    this.switchRow();
                    this.selectRow--;
                    this.switchRow();
                    this.selectedCell = this.cellList[0][0];
                } else {
                    this.lastMonth();

                    //当前处于收起状态，所以lastMonth会调用switchRow，这里再次调用一遍，
                    //将日历复原，然后重新计算需要展示哪一行
                    this.switchRow();

                    //切换到上个月后
                    var lastDayOfMonth = dateUtil.getLastDayOfMonth(this.year, this.month);
                    var weekIndex = dateUtil.getWeekNum(lastDayOfMonth);
                    if (weekIndex == sysConfig.MAX_COL) {
                        this.selectRow = this.cellList.length - 1;
                    } else {
                        this.selectRow = this.cellList.length - 2;
                    }
                    this.selectedCell = this.cellList[this.selectRow][0];
                    this.switchRow();
                }
            },

            resetContentTop() {
                const {on, off} = this.calContentTop();
                if (on < 0 || off < 0) {
                    return;
                }
                this.contentTop = this.isCalendarOpen ? on : off;
            },

            calContentTop() {
                var headerView = Util.selectById("homeHeader");
                if (!headerView) {
                    return {on: -1, off: -1};
                }
                var headerHeight = Util.getHeaderHeight();

                var calendarHeight = headerView.offsetHeight;
                var distance = Util.selectById('calendarView').offsetHeight - Util.select(".calendarRow")[0].offsetHeight;
                return {
                    on: headerHeight + calendarHeight,
                    off: headerHeight + calendarHeight - distance
                }
            },

            //日历月视图和周视图切换
            toggleCalendar () {
                if (!this.shouldAddCalendarAnim) {
                    this.shouldAddCalendarAnim = true;
                }
                const {on, off} = this.calContentTop();
                var content = Util.selectById("content");
                this.contentTop = this.isCalendarOpen ? off : on;
                setTimeout(()=> {
                    this.isCalendarOpen = !this.isCalendarOpen;
                    this.switchRow();
                }, 250);
            },
            switchRow() {
                var fromIndex = this.selectRow;
                var toIndex = 0;
                var fromRow = this.cellList[fromIndex];
                var toRow = this.cellList[toIndex]

                this.$set(this.cellList, fromIndex, toRow);
                this.$set(this.cellList, toIndex, fromRow);
            },
            isSelectToday(dateStr) {
                var todayStr = dateUtil.formatDate(new Date().getTime(), dateUtil.FORMAT_YMD);
                return todayStr.localeCompare(dateStr) == 0
            },
            getBeginEndDate(year, month) {
                var monthBeginDate = dateUtil.getFirstDayOfMonth(year, month);
                var monthEndDate = dateUtil.getLastDayOfMonth(year, month);

                var monthBeginDateStr = dateUtil.formatDate(monthBeginDate.getTime(), dateUtil.FORMAT_YMD);
                var monthEndDateStr = dateUtil.formatDate(monthEndDate.getTime(), dateUtil.FORMAT_YMD);

                var beginWeek = dateUtil.getWeekNum(monthBeginDate);
                var endWeek = dateUtil.getWeekNum(monthEndDate);

                var calendarBeginDate = dateUtil.addDays(monthBeginDate, 1 - beginWeek);
                var calendarEndDate = dateUtil.addDays(monthEndDate, sysConfig.MAX_COL - endWeek);
                var calendarBeginDateStr = dateUtil.formatDate(calendarBeginDate.getTime(), dateUtil.FORMAT_YMD);
                var calendarEndDateStr = dateUtil.formatDate(calendarEndDate.getTime(), dateUtil.FORMAT_YMD);

                return {
                    monthBeginDate: monthBeginDate,
                    monthEndDate: monthEndDate,
                    monthBeginDateStr: monthBeginDateStr,
                    monthEndDateStr: monthEndDateStr,
                    calendarBeginDate: calendarBeginDate,
                    calendarEndDate: calendarEndDate,
                    calendarBeginDateStr: calendarBeginDateStr,
                    calendarEndDateStr: calendarEndDateStr
                };
            },
            initCalendar(year, month, targetCell) {

                var beginEndDate = this.getBeginEndDate(year, month);

                var beginDate = beginEndDate.calendarBeginDate;
                var beginDateStr = beginEndDate.calendarBeginDateStr;
                var endDateStr = beginEndDate.calendarEndDateStr;

                var loopDateStr = beginDateStr;
                var loopDate = beginDate;
                var row = 0;
                var col = 0;
                this.selectRow = 0;

                this.cellList = [];
                this.$set(this.cellList, 0, []);

                this.selectedCell = null;


                var todayStr = dateUtil.formatDate(new Date().getTime(), dateUtil.FORMAT_YMD);
                var firstCellOfMonth = null;

                while (loopDateStr.localeCompare(endDateStr) <= 0) {
                    if (col >= sysConfig.MAX_COL) {
                        row++;
                        this.cellList[row] = [];
                        col = 0;
                    }

                    this.$set(this.cellList[row], col, {
                        isShow: true,
                        dateStr: loopDateStr,
                        day: loopDate.getDate(),
                        date: loopDate,
                        isToday: false
                    });

                    var cell = this.cellList[row][col];

                    if (this.selectedCell == null &&
                            todayStr.localeCompare(loopDateStr) == 0) {
                        cell.isToday = true;
                    }

                    if (!targetCell) {
                        //是否是今天
                        if (cell.isToday && cell.date.getMonth() + 1 == month) {
                            this.selectedCell = cell
                            this.selectRow = row;
                        }

                        //找出这个月的第一天
                        if (this.selectedCell == null && firstCellOfMonth == null
                                && loopDateStr.localeCompare(beginEndDate.monthBeginDateStr) == 0) {
                            firstCellOfMonth = cell;
                        }
                    } else {
                        if (loopDateStr.localeCompare(targetCell.dateStr) == 0) {
                            this.selectedCell = cell;
                            this.selectRow = row;
                        }
                    }

                    //天数循环加一
                    loopDate = dateUtil.addDays(loopDate, 1);
                    loopDateStr = dateUtil.formatDate(loopDate.getTime(), dateUtil.FORMAT_YMD);
                    col++;
                }

                if (this.selectedCell == null) {
                    this.selectedCell = firstCellOfMonth;
                }

                if (!this.isCalendarOpen) {
                    this.switchRow();
                }

                this.$nextTick(function () {
                    this.resetContentTop();
                })
            },
            //获取我的销售日志
            startGetMySalelogTask() {
                if (!this.selectedCell) return;
                this.mySalelogData.isLoading = true;
                var dateStr = this.selectedCell.dateStr;
                var self = this;
                http.ajax({
                    functionName: "home/salelog/getsalelogbyday",
                    method: 'POST',
                    params: {
                        humanID: gData.humanID,
                        beginDate: dateStr,
                        endDate: dateStr
                    },
                    success: function (resultInfo) {
                        if (resultInfo && resultInfo.success) {
                            if (resultInfo.data.isVerify === 1) {
                                self.$store.commit('SET_IS_VERIFY', true);
                            }
                            //加载领导的数据
                            self.isLeader = resultInfo.data.isLeader;
                            if (self.isLeader == true) {
                                self.loadLeaderData();
                            }

                            //我的销售日志
                            self.mySalelogData.salelogList = resultInfo.data.salelog;
                            var today = dateUtil.formatDate(new Date().getTime(), dateUtil.FORMAT_YMD);

                            var isToday = dateStr == today;
                            var todayLogList = [];
                            for (var i = 0; i < self.mySalelogData.salelogList.length; i++) {
                                var salelog = self.mySalelogData.salelogList[i];

                                //日志类型
                                salelog.logTypeName = sysConfig.getSalelogType(salelog.logTypeID).name;

                                //项目名称
                                salelog.projectName = salelog.project && salelog.project.projectName;
                                if (!salelog.projectName) salelog.projectName = "未知项目";

                                //项目阶段名称
                                salelog.projectStageName = sysConfig.getProjectStage(salelog.projectStageId).projectStageName;

                                //只有当天的数据才可以编辑，如果今天创建了昨天的，那么仍然可以编辑
                                var canEdit = isToday && salelog.createHumanId == gData.humanID;
                                self.$set(salelog, 'isCanEdit', canEdit);
                                if (canEdit) {
                                    todayLogList.push(salelog);
                                }
                            }
                            if (isToday) {
                                self.$store.commit('SET_TODAY_SALELOG_LIST', todayLogList);
                            }
                        } else {
                            if (resultInfo) {
                                alert("获取我的销售日志失败:" + resultInfo.message);
                            }
                        }
                    }, error: function (data) {
                        alert("获取我的销售日志错误");
                    }, finally: function () {
                        self.mySalelogData.isLoading = false;
                    }
                });
            },
            //加载领导的数据
            loadLeaderData() {
                if (this.isLeader) {
                    //获取关注的数据
                    this.startGetFocusDataTask();

                    //获取下级成员的销售日志列表
                    this.juniorSalelog.hasMoreDataLoad = true;
                    this.juniorSalelog.salelogList = [];
                    this.startGetJuniorSalelogTask();
                } else {
                    //获取下级成员的销售日志列表
                    this.juniorSalelog.hasMoreDataLoad = false;
                    this.juniorSalelog.salelogList = [];
                }
            },

            //获取关注的数据
            startGetFocusDataTask() {
                this.focusData.isLoading = true;
                var self = this;
                http.ajax({
                    functionName: "home/salelog/getconcerninfo",
                    params: {
                        humanID: gData.humanID,
                        queryDate: self.selectedCell.dateStr + " 00:00:00"
                    },
                    success: function (resultInfo) {
                        if (resultInfo && resultInfo.success) {
                            //关注的项目
                            self.focusData.focusProject = resultInfo.data.projectConcernInfo;
                            //已填写
                            self.focusData.focusProject.writedProjectList = self.focusData.focusProject.writedprojects;
                            //未填写
                            self.focusData.focusProject.unWritedProjectList = self.focusData.focusProject.unwritedprojects;

                            //关注的人员
                            self.focusData.focusHuman = resultInfo.data.humanConcernInfo;
                            if (self.focusData.focusHuman != null) {
                                //已填写的人员
                                var writedHumanList = self.focusData.focusHuman.writedhumans;
                                self.focusData.focusHuman.showWritedHumanList = self.getShowHumanList(writedHumanList);
                                //未填写的人员
                                var unWritedHumanList = self.focusData.focusHuman.unwritedhumans;
                                self.focusData.focusHuman.showUnWritedHumanList = self.getShowHumanList(unWritedHumanList);
                            }
                        } else {
                            alert("获取关注的数据失败:" + resultInfo.message);
                        }
                    }, error: function (data) {
                        alert("获取关注的数据错误");
                    }, finally: function () {
                        self.focusData.isLoading = false;
                    }
                });
            },

            //获取下级成员的销售日志列表
            startGetJuniorSalelogTask() {
                this.juniorSalelog.isLoading = true;
                var self = this;

                var selectDateStr = self.selectedCell.dateStr;
                http.ajax({
                    functionName: "home/salelog/getalljuniorsaleloglist",
                    params: {
                        humanID: gData.humanID,
                        beginDate: selectDateStr + " 00:00:00",
                        endDate: selectDateStr + " 00:00:00",
                        begin: self.juniorSalelog.salelogList.length,
                        count: sysConfig.COUNT_PER_PAGE
                    },
                    success: function (resultInfo) {
                        if (resultInfo && resultInfo.success) {
                            var dataList = resultInfo.data.list;
                            if (dataList != null && dataList.length > 0) {
                                dataList = self.parseSalelogList(dataList);
                                self.juniorSalelog.salelogList = self.juniorSalelog.salelogList.concat(dataList);
                            }

                            //已经加载了所有数据
                            if (dataList == null || dataList.length < sysConfig.COUNT_PER_PAGE) {
                                self.juniorSalelog.hasMoreDataLoad = false;
                            } else { //服务器端可能还有更多数据
                                self.juniorSalelog.hasMoreDataLoad = true;
                            }
                        } else {
                            alert("获取下级成员的销售日志列表失败:" + resultInfo.message);
                            self.juniorSalelog.hasMoreDataLoad = false;
                        }
                    }, error: function (data) {
                        alert("获取下级成员的销售日志列表错误");
                        self.juniorSalelog.hasMoreDataLoad = false;
                    }, finally: function () {
                        self.juniorSalelog.isLoading = false;
                    }
                });
            },

            //获取显示的人员列表
            getShowHumanList(humanList) {
                if (!humanList) {
                    return [];
                }

                var showHumanList = [];

                var maxCount = Math.min(humanList.length, MAX_DISPLAY_HUMAN_COUNT);
                for (var j = 0; j < maxCount; j++) {
                    showHumanList.push(this.parseHuman(humanList[j]));
                }

                //更多
                if (humanList.length > MAX_DISPLAY_HUMAN_COUNT) {
                    var human = {
                        humanID: -1,
                        shortName: "...",
                        css: {"background": "#33aa33"}
                    };
                    showHumanList.push(human);
                }

                return showHumanList;
            },

            parseHuman(human) {
                if (human != null) {
                    human.shortName = Util.getShortName(human.humanName);
                    human.css = {"background": human.photoColor ? human.photoColor : '#888888'};
                }
                return human;
            },

            //解析销售日志列表，添加更多的属性
            parseSalelogList(salelogList) {
                if (salelogList != null) {
                    for (var j = 0; j < salelogList.length; j++) {
                        var salelogMap = salelogList[j];

                        //头像背景颜色
                        if (salelogMap.human != null && salelogMap.human.photoColor != null) {
                            salelogMap.human.css = {"background-color": salelogMap.human.photoColor};
                        } else {
                            salelogMap.human.css = {"background-color": "#555555"};
                        }

                        //人员名字简称
                        if (salelogMap.human != null) {
                            salelogMap.human.shortName = Util.getShortName(salelogMap.human.humanName);
                        }

                        //销售日志列表
                        if (salelogMap.salelogs != null) {
                            for (var i = 0; i < salelogMap.salelogs.length; i++) {
                                var salelog = salelogMap.salelogs[i];

                                //日志类型名称
                                salelog.logTypeName = sysConfig.getSalelogType(salelog.logTypeID).name;

                                //项目阶段
                                if (salelog.project != null) {
                                    salelog.project.projectStageName = sysConfig.getProjectStage(salelog.project.projectStageId).projectStageName;
                                }

                                //日期
                                var date = dateUtil.parseDate(salelog.updateTime);
                                salelog.updateTime = dateUtil.formatDate(date.getTime(), dateUtil.FORMAT_YMDHM);
                            }
                        }

                    }
                }

                return salelogList;
            },


            //进入项目主页
            goProjectSalelogPage (project) {
                if (project != null && project.projectId >= 0) {
                    this.$router.push({
                        name: "projectSalelogList",
                        params: {projectID: project.projectId}
                    });
                } else {
                    alert("无效的项目");
                }
            },
            goHumanSalelogPage (human, humanList) {
                if (human != null && human.humanID >= 0) {
                    this.$router.push({
                        name: "humanSalelogList",
                        params: {humanID: human.humanID}
                    });
                } else if (humanList) {
                    this.$router.push({
                        name: "humanList",
                        params: {humanList: humanList}
                    });
                }
            },
            goMyHomePage() {
                this.goHumanSalelogPage({humanID: gData.humanID}, null);
            },
            addFocusProject() {
                this.$router.push({
                    name: "projectList",
                    params: {
                        isAddFocus: true,
                        callback: ()=> {
                            this.startGetMySalelogTask();
                        }
                    }
                })
            },
            addFocusHuman() {
                this.$router.push({
                    name: "focusHuman",
                    params: {
                        callback: ()=> {
                            this.startGetMySalelogTask();
                        }
                    }
                })
            },
            goEditSalelogPage(salelog) {
                this.$router.push({
                    name: "addSalelog",
                    params: {
                        salelog: salelog,
                        callback: ()=> {
                            this.startGetMySalelogTask();
                        }
                    }
                })
            },
            canSelect(cell) {
                return !this.isCalendarOpen || cell.date.getMonth() + 1 == this.month;
            }
        },

        components: {},
        watch: {
            selectedCell: 'startGetMySalelogTask'
        },

        computed: {
            monthYearText () {
                return this.year + "年" + this.month + "月";
            },
            hasMySaleLog() {
                var list = this.mySalelogData.salelogList;
                if (list) {
                    return list.length > 0
                }
                return false;
            },
            hasFollowers() {
                if (!this.focusData || !this.focusData.focusHuman) {
                    return false;
                }
                return this.wroteHumanCount > 0 || this.unWroteHumanCount > 0;
            },
            hasFollowProjects() {
                if (!this.focusData || !this.focusData.focusProject) {
                    return false;
                }
                return this.wroteProjectCount > 0 || this.unWroteProjectCount > 0;
            },
            hasJuniorSalelog() {
                if (!this.juniorSalelog || !this.juniorSalelog.salelogList) {
                    return false;
                }
                return this.juniorSalelog.salelogList.length > 0;
            },
            wroteHumanCount() {
                var wlist = this.focusData.focusHuman.writedhumans;
                return wlist ? wlist.length : 0;
            },
            unWroteHumanCount() {
                var ulist = this.focusData.focusHuman.unwritedhumans;
                return ulist ? ulist.length : 0;
            },
            wroteProjectCount() {
                var wlist = this.focusData.focusProject.writedprojects;
                return wlist ? wlist.length : 0;
            },
            unWroteProjectCount() {
                var ulist = this.focusData.focusProject.unwritedprojects;
                return ulist ? ulist.length : 0;
            },
            homeHeaderStyle() {
                return "margin-top: " + Util.getHeaderHeight() + "px";
            },
            lastBtnText() {
                return this.isCalendarOpen ? "上月" : "上周";
            },
            nextBtnText() {
                return this.isCalendarOpen ? "下月" : "下周";
            }
        },
        created () {
            this.initCalendar(this.year, this.month);
            this.$nextTick(()=> {
                this.resetContentTop();
            });
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                bindNavBar('销售日志', '新增', () => {
                    vm.addSalelog()
                })
            })
        }
    }
</script>

<template>
    <div>
        <mt-header fixed v-on:backClick="backClick" title="销售日志">
            <i class="header-menu-icon icon-plus" slot="right" @click="addSalelog"></i>
        </mt-header>
        <div id="homeHeader" :style="homeHeaderStyle">
            <div id="calendarMonth" class="row" style="padding-top:10px">
                <div class="monthNavBtn col-center" @click="onLastClick">
                    {{lastBtnText}}
                </div>
                <div class="col col-center flex center-content"
                     id="curMonth" @click="toggleCalendar">
                    <div style="margin-right:5px" class="col-center">{{monthYearText}}</div>
                    <i class="col-center" :class="{'icon-angle-down': !isCalendarOpen, 'icon-angle-up': isCalendarOpen}"></i>
                </div>
                <div class="monthNavBtn col-center" @click="onNextClick">
                    {{nextBtnText}}
                </div>
            </div>
            <!-- 周 -->
            <div id="weekView" class="row">
                <div class="col col-center weekItem" v-for="week in weekList">{{week}}</div>
            </div>
            <!-- 日历 -->
            <div id="calendarView">
                <div id="monthDays" class="row calendarRow" v-for="(colList, index) in cellList">
                    <div class="col flex cellContainer" @click="clickCell(cell, index)" v-for="cell in colList">
                        <div class="dayCell flex"
                             :class="{ selectCell: selectedCell==cell }"
                             v-show="canSelect(cell)">
                            {{cell.day}}
                        </div>
                        <div class="calendarDot" v-show="canSelect(cell)" :class="{ calendarDotToday: cell.isToday }"></div>
                    </div>
                </div>
            </div>
        </div>
        <div id="content" :class="{calendarAnim: shouldAddCalendarAnim}" class="scrollable"
             :style="{top: contentTop + 'px'}">
            <div id="contentInner">
                <div class="row bottomLine sectionHeader" @click="goMyHomePage">
                    <div class="col noPadding col-center sectionTitle">我的日志</div>
                    <mt-spinner :type="3" :size="16"
                                color="#37aeff"
                                style="margin-right:10px"
                                v-show="mySalelogData.isLoading"
                                class="col-center"></mt-spinner>
                    <i class="icon-angle-right icon-1x ic-gray"></i>
                </div>
                <div class="bottomLine sectionEmpty" v-if="!hasMySaleLog">当天还没有填写销售日志</div>
                <div class="bottomLine sectionContent" v-else v-for="salelog in mySalelogData.salelogList">
                    <!-- 项目...阶段 -->
                    <div class="row listItemTop" v-if="salelog.logTypeID == 1">
                        <div class="col col-center homeMySalelogProjectName"
                             @click="goProjectSalelogPage(salelog.project)">
                            {{salelog.projectName}}
                        </div>
                        <div class="col-center homeMySalelogTypeName">{{salelog.projectStageName}}</div>
                    </div>
                    <!-- 其他工作 -->
                    <div v-else class="col col-center homeMySalelogOther listItemTop">
                        {{salelog.logTypeName}}
                    </div>
                    <div class="row listItemMiddle">
                        <div class="col col-center homeSalelogTime noPadding">{{salelog.updateTime}}</div>
                        <i class="col-center icon-pencil homeSalelogEdit icon-1x"
                           v-show="salelog.isCanEdit"
                           @click="goEditSalelogPage(salelog)"></i>
                    </div>
                    <div class="wrapWord salelogContent listItemBottom" v-html="salelog.logContent"></div>
                </div>

                <!--是领导才显示下面的-->
                <div v-show="isLeader">
                <div class="row bottomLine sectionHeader gap">
                    <div class="col col-center sectionTitle">关注人员</div>
                    <div class="col-center sectionHeaderBtn"
                         @click="addFocusHuman()" v-show="isLeader">添加关注
                    </div>
                </div>
                <div class="sectionEmpty bottomLine" v-if="!hasFollowers">
                    您还没关注过任何人
                </div>
                <div class="bottomLine sectionContent" v-else>
                    <div class="allPadding"
                         :class="{bottomLine:wroteHumanCount == 0}">
                        已填写:{{wroteHumanCount}}人
                    </div>
                    <div class="row noPadding pLeft pRight pBottom"
                         v-show="wroteHumanCount > 0">
                        <div class="salelogHumanHeadPic flex cellContainer"
                             v-for="human in focusData.focusHuman.showWritedHumanList"
                             @click="goHumanSalelogPage(human, focusData.focusHuman.writedhumans)"
                             :style="human.css">
                            {{human.shortName}}
                        </div>
                    </div>
                    <div class="allPadding"
                         :class="{bottomLine:unWroteHumanCount == 0}">
                        未填写:{{unWroteHumanCount}}人
                    </div>
                    <div class="row noPadding pLeft pRight pBottom"
                         v-show="unWroteHumanCount > 0">
                        <div class="salelogHumanHeadPic flex cellContainer"
                             @click="goHumanSalelogPage(human, focusData.focusHuman.unwritedhumans)"
                             v-for="human in focusData.focusHuman.showUnWritedHumanList"
                             style="background: #888888;">
                            {{human.shortName}}
                        </div>
                    </div>
                </div>

                <!-- 项目 -->
                <div class="row bottomLine sectionHeader gap">
                    <div class="col col-center sectionTitle">关注项目</div>
                    <div class="col-center sectionHeaderBtn"
                         @click="addFocusProject()" v-show="isLeader">添加关注
                    </div>
                </div>
                <div class="sectionEmpty bottomLine" v-if="!hasFollowProjects">
                    您还没关注过任何项目
                </div>
                <div class="bottomLine sectionContent" v-else>
                    <div class="allPadding"
                         :class="{bottomLine:wroteProjectCount == 0}">
                        已填写:{{wroteProjectCount}}个
                    </div>
                    <div v-show="wroteProjectCount > 0" class="projectGrid">
                        <div class="pBottom homeWritedProjectName"
                             v-for="project in focusData.focusProject.writedProjectList"
                             @click="goProjectSalelogPage(project)">
                            {{project.projectName}}
                        </div>
                    </div>
                    <div class="allPadding"
                         :class="{bottomLine:unWroteProjectCount == 0}">
                        未填写:{{unWroteProjectCount}}个
                    </div>
                    <div v-show="unWroteProjectCount > 0" class="projectGrid">
                        <div class="pBottom homeUnWritedProjectName"
                             v-for="project in focusData.focusProject.unWritedProjectList"
                             @click="goProjectSalelogPage(project)">
                            {{project.projectName}}
                        </div>
                    </div>
                </div>

                <!-- 下级成员日志列表 -->
                <div class="row bottomLine sectionHeader gap">
                    <div class="col col-center sectionTitle">销售日志</div>
                </div>
                <div class="sectionEmpty bottomLine" v-if="!hasJuniorSalelog">
                    我管理的成员在当天没有填写销售日志
                </div>
                <div class="bottomLine sectionContent" v-else>
                    <!-- 显示下属的销售日志列表 -->
                    <div class="row noPadding pLeft pTop pRight"
                         v-for="(salelogMap, $index) in juniorSalelog.salelogList"
                         :class="{bottomLine: $index < juniorSalelog.salelogList.length-1}">
                        <div class="salelogHumanHeadPic flex cellContainer"
                             :style="salelogMap.human.css"
                             @click="goHumanSalelogPage(salelogMap.human)">
                            {{salelogMap.human.shortName}}
                        </div>
                        <div class="col col-center noPadding">
                            <div class="homeSalelogCreateHumanName pLeft"
                                 @click="goHumanSalelogPage(salelogMap.human)">
                                {{salelogMap.human.humanName}}
                            </div>

                            <div v-for="(salelog, $index) in salelogMap.salelogs"
                                 :class="{bottomDotLine: $index < salelogMap.salelogs.length - 1}">
                                <!-- 项目-->
                                <div class="row listItemTop" v-if="salelog.logTypeID == 1">
                                    <div class="col col-center homeMySalelogProjectName"
                                         @click="goProjectSalelogPage(salelog.project)">
                                        {{salelog.project.projectName}}
                                    </div>
                                    <div class="col-center homeMySalelogTypeName">
                                        {{salelog.project.projectStageName}}
                                    </div>
                                </div>

                                <!-- 其他工作-->
                                <div v-else class="col col-center homeMySalelogOther listItemTop">
                                    {{salelog.logTypeName}}
                                </div>

                                <div class="row listItemMiddle homeSalelogTime">
                                    {{salelog.updateTime}}
                                </div>
                                <div class="wrapWord salelogContent listItemBottom" v-html="salelog.logContent"></div>
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

    #homeHeader, #content {
        font-size: 14px;
    }

    #app {
        overflow: hidden;
    }

    .row, .col {
        padding: 5px;
    }

    .sectionTitle {
        font-weight: bold;
        font-size: 16px;
    }

    .sectionHeaderBtn {
        color: #888;
        font-size: 13px;
    }

    #homeHeader {
        width: 100%;
        background-color: #645e60;
        position: absolute;
        z-index: 1;
        color: #ffffff;
        margin-top: 50px;
    }

    #content {
        z-index: 2;
        bottom: 0;
        width: 100%;
        position: absolute;
        -webkit-overflow-scrolling: touch;
        overflow-y: scroll;
    }

    #contentInner {
        height: calc(100% + 1px);
    }

    #curMonth {
        text-align: center;
    }

    .weekItem {
        text-align: center;
        font-size: 13px;
        color: #999999;
        padding: 5px;
    }

    #weekView {
        margin-top: 0px;
    }

    .monthNavBtn {
        color: #ddd;
        height: 20px;
        margin-left: 10px;
        margin-right: 10px;
    }

    .dayCell {
        width: 30px;
        height: 30px;
        background-color: transparent;
        text-align: center;
        font-size: 15px;
        color: #ffffff;

        -webkit-box-pack: center;
        justify-content: center;

        -webkit-box-align: center;
        align-items: center;
    }

    .selectCell {
        -webkit-border-radius: 30px;
        -moz-border-radius: 30px;
        border-radius: 30px;
        background-color: #33aa33
    }

    .cellContainer {
        padding: 0px;

        -webkit-box-orient: vertical;
        flex-direction: column;

        -webkit-box-pack: center;
        justify-content: center;

        -webkit-box-align: center;
        align-items: center;
    }

    .row.calendarRow {
        margin-top: 0px;
        padding: 0px;
    }

    .calendarDot {
        -webkit-border-radius: 4px;
        -moz-border-radius: 4px;
        border-radius: 4px;
        width: 4px;
        height: 4px;
        background: transparent;
        margin-bottom: 5px;
        margin-top: 3px;
    }

    .calendarDotToday {
        background: #ff0000;
    }

    .bottomLine {
        border-bottom: solid 1px #dddddd;
    }

    .bottomDotLine {
        border-bottom: dashed 1px #dddddd;
    }

    .sectionHeader {
        padding: 10px;
        background-color: white;
    }

    .sectionContent {
        background-color: white;
    }

    .noPadding {
        padding: 0;
    }

    .allPadding {
        padding: 10px;
    }

    .gap {
        margin-top: 10px;
    }

    .listItemTop {
        padding: 10px 10px 5px 10px;
    }

    .listItemMiddle {
        padding: 5px 10px;
    }

    .listItemBottom {
        padding: 5px 10px 10px 10px;
    }

    .homeMySalelogProjectName {
        font-size: 15px;
        color: #3333aa;
        padding: 0;
    }

    .homeMySalelogTypeName, .homeSalelogTime {
        font-size: 13px;
        color: #888888;
    }

    .homeMySalelogOther {
        font-size: 15px;
        color: #555555;
    }

    .row.listItemMiddle {
        padding-top: 5px;
    }

    .homeSalelogEdit {
        padding: 0 10px;
        font-size: 16px;
    }

    .wrapWord {
        word-wrap: break-word;
        word-break: break-all;
        width: auto;
        display: block;
        overflow: hidden;
        white-space: pre-line;
    }

    .salelogContent {
        color: #555555;
        font-size: 15px;
    }

    .pLeft {
        padding-left: 10px;
    }

    .pRight {
        padding-right: 10px;
    }

    .pTop {
        padding-top: 10px;
    }

    .pBottom {
        padding-bottom: 10px;
    }

    #content {
        background-color: #eeeef1;
    }

    .salelogHumanHeadPic {
        width: 45px;
        height: 45px;
        border-radius: 45px;
        text-align: center;
        color: #fff;
        margin-right: 5px;
    }

    .homeWritedProjectName, .homeUnWritedProjectName {
        border: solid 1px #33aa33;
        -webkit-border-radius: 3px;
        -moz-border-radius: 3px;
        border-radius: 5px;
        padding: 5px 10px 5px 10px;
        color: #33aa33;
        font-size: 14px;
        margin: 5px;
        float: left;
    }

    .homeUnWritedProjectName {
        border: solid 1px #888888;
        color: #888888;
    }

    .projectGrid {
        padding: 0px 5px 5px 5px;
        display: inline-block;
    }

    .homeSalelogCreateHumanName {
        color: #555555;
        font-size: 16px;
        font-weight: bolder;
        margin-top: 12px;
    }

    .homeSalelogProjectGroupName {
        color: #3333aa;
        font-size: 15px;
    }

    .sectionHeader > .col {
        padding: 0;
    }

    .calendarAnim {
        -webkit-transition: top 0.25s;
        transition: top 0.25s;
    }
</style>