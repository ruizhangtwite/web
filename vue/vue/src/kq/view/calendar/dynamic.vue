<!--时间紧，任务重，-->
<template>
    <div class="">
        <calendar class="bdr-b"
                  fixed
                  v-on:contentTop="contentTop = $event"
                  v-on:shouldAddCalendarAnim="shouldAddCalendarAnim = $event"
                  v-on:selectedDate="onSelectedDateChange($event)"/>

        <div id="content"
             v-scrollforclick
             class="mint-content middleFont soft-scrollable bdr-t calendarContent"
             :class="{calendarAnim: shouldAddCalendarAnim}"
             :style="{top: contentTop + 'px'}">
            <div id="contentInner">
                <div class="row concernHeader bdr-b bdr-t gap">
                    <span class="col col-center">我关注的人</span>
                    <span class="textBlue smallFont" v-show="isManager"
                          @click="onConcernBtnClick">{{concernBtnDesc}}</span>
                </div>

                <div class="checkContainer bdr-b">
                    <div class="checkHeader bdr-b textGray">
                        已打卡({{checkObj.totalCount}})
                    </div>
                    <div class="check bdr-b" v-show="checkObj.checkInList.length > 0">
                        <div class="textGray title">签到({{checkObj.checkInList.length}})</div>
                        <div class="checkList flex row-wrap">
                            <div class="checkDetail"
                                 v-for="(item, index) in checkObj.checkInList"
                                 :style="item.style">
                                <div class="head"
                                     :class="{headDark: !item.photoColor}"
                                     v-longclick="headCallback(item)"
                                     :style="{'background-color': item.photoColor, 'color': item.fontColor}">{{item.name}}
                                </div>
                                <div class="smallFont smallGap">{{item.checkInfo}}</div>
                                <div class="smallFont">{{item.address}}</div>
                                <div class="smallFont textBrown">{{item.state}}</div>
                            </div>
                        </div>
                    </div>
                    <div class="check bdr-b" v-show="checkObj.checkOutList.length > 0">
                        <div class="textGray title">签退({{checkObj.checkOutList.length}})</div>
                        <div class="checkList flex row-wrap">
                            <div class="checkDetail"
                                 v-for="(item, index) in checkObj.checkOutList"
                                 :style="item.style">
                                <div class="head"
                                     :class="{headDark: !item.photoColor}"
                                     v-longclick="headCallback(item)"
                                     :style="{'background-color': item.photoColor}">{{item.name}}
                                </div>
                                <div class="smallFont smallGap">{{item.checkInfo}}</div>
                                <div class="smallFont">{{item.address}}</div>
                                <div class="smallFont textBrown">{{item.state}}</div>
                            </div>
                        </div>
                    </div>
                    <div class="check bdr-b" v-show="checkObj.leaveList.length > 0">
                        <div class="textGray title">请假({{checkObj.leaveList.length}})</div>
                        <div class="checkList flex row-wrap">
                            <div class="checkDetail"
                                 v-for="(item, index) in checkObj.leaveList"
                                 :style="item.style">
                                <div class="head"
                                     :class="{headDark: !item.photoColor}"
                                     v-longclick="headCallback(item)"
                                     :style="{'background-color': item.photoColor}">{{item.name}}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="checkHeader bdr-b textGray">
                        未打卡({{unCheckList.length}})
                    </div>
                    <div class="checkList bdr-b flex row-wrap" v-show="unCheckList.length > 0">
                        <div class="checkDetail"
                             v-for="(item, index) in unCheckList"
                             :style="item.style">
                            <div class="head headDark"
                                 v-longclick="headCallback(item)">{{item.name}}
                            </div>
                            <div class="smallFont smallGap"></div>
                        </div>
                    </div>
                </div>


                <div class="gap">
                    <group-filter :data="filterData"
                                  class="bdr-b"
                                  :selectedIndex="selectedIndex"
                                  v-on:onFilterChange="onFilterChange"/>
                    <div class="sectionEmpty" v-show="isEmpty">没有数据</div>
                    <div class="middleFont bdr-b list-item" v-for="dateLog in filterDataList">
                        <div class="row" style="padding-bottom:5px">
                                <span class="col-center largeFont">
                                    {{dateLog.human.name}}
                                </span>
                            <span :style="{visibility: dateLog.human.unitName ? 'visible' : 'hidden'}"
                                  class="col textGray col-center">
                                    ({{dateLog.human.unitName}})
                            </span>
                            <div class="col-center lineBtn startChat" @click="startChat(dateLog)"
                                 v-show="dateLog.normalFlag != 1 && dateLog.humanID != selfId">发起聊天
                            </div>
                            <div class="col-center lineBtn startChat" style="margin-left:5px"
                                 @click="goKqLocation(dateLog)">足迹
                            </div>
                        </div>
                        <div class="row tagContainer">
                                <span class="rtag" v-show="dateLog.state" :style="dateLog.stateCss">
                                        {{dateLog.state}}
                                </span>
                            <span class="rtag" v-show="dateLog.checkInLog.laterExceptionFlag == 1"
                                  :style="dateLog.checkInLog.laterCss">迟到</span>
                            <span class="rtag" v-show="dateLog.checkInLog.siteExceptionFlag == 1"
                                  :style="dateLog.checkInLog.siteCss">签到位置异常</span>
                            <span class="rtag" v-show="dateLog.checkInLog.checkExceptionFlag == 1"
                                  :style="dateLog.checkInLog.checkCss">签到代打卡</span>
                            <span class="rtag" v-show="dateLog.checkOutLog.earlyExceptionFlag == 1"
                                  :style="dateLog.checkOutLog.earlyCss">早退</span>
                            <span class="rtag" v-show="dateLog.checkOutLog.siteExceptionFlag == 1"
                                  :style="dateLog.checkOutLog.siteCss">签退位置异常</span>
                            <span class="rtag" v-show="dateLog.checkOutLog.checkExceptionFlag == 1"
                                  :style="dateLog.checkOutLog.checkCss">签退代打卡</span>
                        </div>

                        <div class="row checkIn">
                            <span class="title">签到</span>
                            <div class="col">
                                <span class="textGray" v-show="!dateLog.checkInLog.checkTime">无签到</span>
                                <span class="textGray" v-show="dateLog.checkInLog.checkTime">{{dateLog.checkInLog.checkTime}}</span>
                                <span class="textBlue" v-show="dateLog.checkInLog.address"
                                      @click="goMap(dateLog.checkInLog)">{{dateLog.checkInLog.address}}</span>
                                <span class="textGray"
                                      v-show="dateLog.checkInLog.remark">({{dateLog.checkInLog.remark}})</span>
                            </div>
                        </div>
                        <div class="row checkOut">
                            <span class="title">签退</span>
                            <div class="col">
                                <span class="textGray" v-show="!dateLog.checkOutLog.checkTime">无签退</span>
                                <span class="textGray" v-show="dateLog.checkOutLog.checkTime">{{dateLog.checkOutLog.checkTime}}</span>
                                <span class="textBlue" v-show="dateLog.checkOutLog.address"
                                      @click="goMap(dateLog.checkOutLog)">{{dateLog.checkOutLog.address}}</span>
                                <span class="textGray"
                                      v-show="dateLog.checkOutLog.remark">({{dateLog.checkOutLog.remark}})</span>
                            </div>
                        </div>
                        <div v-show="dateLog.explainList != null && dateLog.explainList.length > 0">
                            <div class="row wrapWord explainItem" v-for="item in dateLog.explainList">
                                <span class="space">{{item.caseTitle}}说明单号 </span><span class="space textGray">{{item.explainID}}  </span>
                                <span class="space">申请理由 </span><span
                                    class="space textGray">{{item.applyOpinion}}  </span>
                                <span class="space">审批 </span><span class="space textGray">{{item.applyStateName}}({{item.replyHumanName}})  </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
    #contentInner {
        /*防止在动画过程中scrollbar产生闪烁*/
        height: calc(100% + 1px);
    }

    .calendarContent {
        padding-bottom: 20px;

        /*显示分割线*/
        z-index: 0;
    }

    .list-item {
        padding: 10px 15px;
    }

    .list-item .row {
        padding: 0;
    }

    .dateBanner {
        padding: 0 15px;
        height: 24px;
        line-height: 24px;
    }

    .dateInfo {
        border-radius: 4px;
        border: solid 1px #dfdfdf;
        background-color: white;
        padding: 3px 15px;
        margin: 10px 0;
        font-size: 12px;
    }

    .explainItem.row {
        background-color: #EEEFF3;
        border-radius: 2px;
        padding: 7px;
        margin-top: 10px;
    }

    .row.list-item {
        padding: 7px 15px;
    }

    .rtag {
        margin-right: 5px;
        margin-bottom: 5px;
    }

    .row.tagContainer {
        flex-wrap: wrap;
    }

    .humanIcon {
        width: 35px;
        height: 35px;
        border-radius: 35px;
        color: white;
        font-size: 13px;
    }

    .row.checkOut {
        margin-top: 5px;
    }

    .checkIn .title, .checkOut .title {
        padding-right: 5px;
    }

    .concernHeader, .checkHeader, .checkList {
        padding: 10px;
        background-color: white;
    }

    .checkContainer {
        background-color: white;
        padding-left: 10px;
    }

    .checkContainer > div {
        padding-left: 0;
    }

    .gap {
        margin-top: 10px;
    }

    .checkDetail {
        text-align: center;
        width: 70px;
        margin-top: 5px;
    }

    .head {
        text-align: center;
        width: 50px;
        height: 50px;
        border-radius: 25px;
        line-height: 50px;
        color: white;
        display: inline-block;
    }

    .head.headDark {
        background-color: #F7F7F7;
        color: #878787;
    }

    .smallGap {
        margin-top: 5px;
    }

    .checkContainer {
        -webkit-user-select: none;
    }

    .check .checkList {
        padding-left: 0;
    }

    .check .title {
        padding: 5px 10px;
    }
</style>
<script>
    import {bindNavBar, sendMsg, goContactDetail} from 'egovanative';

    import {Indicator} from 'mint-ui';
    import {Toast} from 'mint-ui';
    import {MessageBox} from 'mint-ui';
    import GroupFilter from '../widget/GroupFilter.vue'

    import {baseData, baseComputed, resolveResultData, startLoad, finishLoad} from '../TabManager';
    import {data as gData} from 'zhixin'
    import http from 'Http';
    import sysConfig from 'sysConfig';
    import Util from 'Util';
    import dateUtil from 'DateUtil';

    import Calendar from '../widget/Calendar.vue'

    function createCheckObj() {
        return {
            checkInList: [],
            checkOutList: [],
            leaveList: []
        }
    }

    function defaultData() {
        return {
            ...baseData(),
            concernCount: 0,
            contentStyle: {top: `${Util.getHeaderHeight() + 44}px`},
            humanName: '',
            isManager: false,
            selfId: gData.humanID,
            contentTop: 0,
            selectedDate: new Date(),
            checkObj: createCheckObj(),
            unCheckList: [],
            shouldAddCalendarAnim: false,
            filterData: [['全部', '异常']],
            selectedIndex: [0],
            filterDataList: []
        }
    }
    export default{
        data(){
            return defaultData();
        },
        methods: {
            calGridGap() {
                let width = window.innerWidth
                let num = Math.floor((width - 20) / 75)
                let gap = (width - num * 75) / (num - 1)
                return {num, gap}
            },
            resetGridItemStyle(list) {
                const {num, gap} = this.calGridGap()
                for (let i = 0; i < list.length; i++) {
                    let item = list[i]
                    let left = i % num != 0 ? gap : 0
                    item.style = {
                        'margin-left': left
                    }
                }
            },
            headCallback(item, el) {
                let self = this
                return {
                    item: item.name,
                    longClick() {
                        MessageBox.confirm(`确定取消关注${item.name}？`).then(action => {
                            self.cancelFollow(item.humanID)
                        }, cancel=> {
                        });
                    },
                    click() {
                        goContactDetail(item.humanID)
                    }
                }
            },
            cancelFollow(humanId) {
                http.ajax({
                    functionName: "/mi/dynamic/delconcern",
                    params: {
                        humanID: gData.humanID,
                        concernHumanID: humanId
                    },
                    success: (data) => {
                        if (data && data.success) {
                            Toast('取消关注成功')
                        } else if (data) {
                            Toast(data.message)
                        }
                        this.loadData(true)
                    },
                    start() {
                        Indicator.open();
                    },
                    finally() {
                        Indicator.close();
                    }
                });
            },
            onSelectedDateChange(val) {
                this.selectedDate = val
                this.loadData(true)
            },
            onFilterChange() {
                this.filterList()
            },
            startChat(dateLog) {
                sendMsg(dateLog.humanID, this.buildDateLogInfo(dateLog))
            },
            onConcernBtnClick() {
                if (this.shouldAddAllJuniorMember) {
                    this.concernAllJunior()
                } else {
                    this.addConcern()
                }
            },
            concernAllJunior() {
                http.ajax({
                    functionName: "/mi/dynamic/concernjunior",
                    params: {
                        humanID: gData.humanID,
                    },
                    success: (data) => {
                        if (data && data.success) {
                            Toast('关注直属下级人员成功')
                        } else if (data) {
                            Toast(data.message)
                        }
                        this.loadData(true)
                    },
                    start() {
                        Indicator.open();
                    },
                    finally() {
                        Indicator.close();
                    }
                });
            },
            goKqLocation(dateLog) {
                this.$router.push({
                    name: 'kqLocation',
                    params: {
                        humanID: dateLog.humanID
                    }
                })
            },
            goMap(item) {
                this.$router.push({
                    name: 'kqMap',
                    params: {
                        lng: item.lng,
                        lat: item.lat,
                        address: item.address,
                        humanID: item.humanId
                    }
                })
            },
            buildDateLogInfo(dateLog) {
                if (dateLog.checkDate && dateLog.state) {
                    return `你在${dateLog.checkDate}这天出现${dateLog.state}`
                }
                return ''
            },
            caseParser(dateLog) {
                var humanName = dateLog.humanName ? dateLog.humanName : "未知";
                dateLog.human = {
                    ID: dateLog.humanID,
                    name: humanName,
                    shortName: sysConfig.getShortName(humanName),
                    iconCss: sysConfig.getPhotoColorCss(dateLog.humanID),
                    unitName: dateLog.unitName
                }
                dateLog.humanName = humanName;
                //异常样式
                this.initDateLogExceptionCss(dateLog);

                dateLog.checkInfo = dateLog.checkInfo || {};
                dateLog.checkInLog = this.initCheckLogExceptionCss(dateLog.checkInfo.checkInLog) || {}
                dateLog.checkOutLog = this.initCheckLogExceptionCss(dateLog.checkInfo.checkOutLog) || {}

                this.parseExplain(dateLog);
                this.parseLeave(dateLog);
            },

            initCheckLogExceptionCss (checkLog) {
                if (!checkLog) return checkLog;

                if (checkLog.checkTime) {
                    checkLog.checkTime = dateUtil.formatDateByDate(dateUtil.parseDate(checkLog.checkTime), dateUtil.FORMAT_HM);
                }
                if (checkLog.earlyExceptionFlag == 1) {
                    checkLog.earlyCss = this.getTagCss(sysConfig.LEGEND_LATER_OR_EARLY);
                }
                if (checkLog.laterExceptionFlag == 1) {
                    checkLog.laterCss = this.getTagCss(sysConfig.LEGEND_LATER_OR_EARLY);
                }
                if (checkLog.siteExceptionFlag == 1) {
                    checkLog.siteCss = this.getTagCss(sysConfig.LEGEND_EXCEPTION);
                }
                if (checkLog.checkExceptionFlag == 1) {
                    checkLog.checkCss = this.getTagCss(sysConfig.LEGEND_EXCEPTION);
                }

                return checkLog;
            },

            //初始化一天的考勤记录的异常信息样式
            initDateLogExceptionCss (dateLog) {
                dateLog.date = dateLog.checkDate &&
                        dateUtil.formatDateByDate(dateUtil.parseDate(dateLog.checkDate), dateUtil.FORMAT_YMD_CN);
                if (dateLog.kuanggongAmFlag == 1) {
                    dateLog.state = "旷工";
                    dateLog.stateCss = this.getTagCss(sysConfig.LEGEND_KUANGGONG);
                } else if (dateLog.queqinAmFlag == 1) {
                    dateLog.state = "缺勤";
                    dateLog.stateCss = this.getTagCss(sysConfig.LEGEND_QUEQIN);
                } else if (dateLog.normalFlag == 1 && dateLog.workDayFlag == 1) {
                    dateLog.state = "全勤";
                    dateLog.stateCss = this.getTagCss(sysConfig.LEGEND_QUANQIN);
                } else if (dateLog.leaveFlag == 1) {
                    dateLog.state = "请假";
                    dateLog.stateCss = this.getTagCss(sysConfig.LEGEND_LEAVE);
                } else if (dateLog.notWorkDayInFlag == 1 && dateLog.workDayFlag == 0) {
                    dateLog.state = "休息日打卡";
                    dateLog.stateCss = this.getTagCss(sysConfig.LEGEND_QUANQIN);
                }
            },

            getTagCss (type) {
                return {'background-color': sysConfig.getLegendColor(type)};
            },

            parseExplain (dateLog) {
                if (!dateLog || !dateLog.arg) return
                try {
                    dateLog.explainList = Object.values(JSON.parse(dateLog.args)).map(item => {
                        var explain = JSON.parse(item.data)
                        explain.applyStateName = this.parseApplyState(explain.applyState)
                        explain.replyHumanName = explain.replyHumanName || "未知"
                        explain.caseTitle = "情况"
                        return explain
                    })
                } catch (e) {
                    console.log(e)
                }
            },
            parseLeave (dateLog) {
                var list = dateLog.explainList || []
                if (dateLog.checkInfo.leaveLog) {
                    var leaveLog = dateLog.checkInfo.leaveLog
                    leaveLog.applyStateName = this.parseApplyState(leaveLog.passFlag)
                    leaveLog.replyHumanName = leaveLog.agreeHumanName || "未知"
                    leaveLog.explainID = leaveLog.leaveId;
                    leaveLog.caseTitle = "请假"
                    leaveLog.applyOpinion = leaveLog.remark
                    list.push(leaveLog);
                }
                dateLog.explainList = list;
            },
            parseApplyState(state) {
                switch (state) {
                    case sysConfig.CHECK_YES:
                        return "审批通过";
                    case sysConfig.CHECK_NO:
                        return "审批不通过";
                    default:
                        return "待审批";
                }
            },
            loadData(isRefresh) {
                if (this.isLoading) {
                    return
                }

                Indicator.open()
                if (isRefresh) {
                    Util.clearList(this.dataList)
                    this.hasMore = true
                }
                http.ajax({
                    functionName: "/mi/dynamic/gethumandynamic",
                    params: {
                        humanID: gData.humanID,
                        date: dateUtil.formatDateByDate(this.selectedDate, dateUtil.FORMAT_YMD),
                        isShowAll: 1
                    },
                    success: (data) => {
                        resolveResultData.call(this, data, isRefresh, this.caseParser);
                        this.parseCheckList(this.dataList);

                        //只展示打卡的或请假的
                        let tempList = [];
                        this.dataList.map(item => {
                            let log = item.checkInfo;
                            if (log && (log.checkOutLog || log.checkInLog || item.leaveFlag == 1)) {
                                tempList.push(item);
                            }
                        });
                        this.dataList = tempList;
                        this.humanName = data.data.humanName;
                        this.concernCount = data.data.concernCount;
                        this.isManager = (data.data.isHasKqRight == 1);

                        //展示全部或异常
                        this.filterList();
                    },
                    error(data) {
                        alert("加载列表错误：" + data);
                    },
                    finally() {
                        Indicator.close();
                    }
                });
            },

            filterList() {
                if (this.selectedIndex[0] == 0) {
                    this.filterDataList = this.dataList
                } else {
                    let exceptionList = []
                    this.dataList.map(item => {
                        if (item.normalFlag == 0) {
                            exceptionList.push(item)
                        }
                    })
                    this.filterDataList = exceptionList
                }
            },

            isDateEqual (left, right) {
                if (!left || !right) {
                    return false;
                }
                return left.localeCompare(right) == 0;
            },
            addConcern() {
                this.$router.push({
                    name: 'juniorHumanList',
                    params: {
                        isConcernMode: true,
                        callback: () => {
                            this.loadData(true);
                        }
                    }
                })
            },
            getExceptionState(dateLog) {
                try {
                    if (dateLog.checkInLog.laterExceptionFlag == 1) {
                        return '迟到'
                    } else if (dateLog.checkInLog.siteExceptionFlag == 1 || dateLog.checkOutLog.siteExceptionFlag == 1) {
                        return '位置异常'
                    } else if (dateLog.checkOutLog.earlyExceptionFlag == 1) {
                        return '早退'
                    } else if (dateLog.checkOutLog.checkExceptionFlag == 1 || dateLog.checkInLog.checkExceptionFlag == 1) {
                        return '代打卡'
                    }
                } catch (e) {
                    Util.log(e)
                }
                return ''
            },

            parseCheckList(dataList) {
                this.checkObj = createCheckObj()
                this.unCheckList = []
                dataList.map(item => {
                    let baseInfo = {
                        checkLog: item,
                        photoColor: sysConfig.getPhotoColor(item.humanID),
                        name: Util.getShortName(item.humanName),
                        humanID: item.humanID,
                    }
                    let checkInfo = item.checkInfo

                    let hasCheck = false
                    if (checkInfo) {
                        let handleCheckLog
                        if (handleCheckLog = checkInfo.checkOutLog) {
                            this.checkObj.checkOutList.push(baseInfo)
                        } else if (handleCheckLog = checkInfo.checkInLog) {
                            this.checkObj.checkInList.push(baseInfo)
                        } else if (item.leaveFlag == 1) {
                            this.checkObj.leaveList.push(baseInfo)
                            hasCheck = true
                        }

                        if (handleCheckLog) {
                            hasCheck = true
                            baseInfo.address = handleCheckLog.city
                            baseInfo.checkInfo = `[${handleCheckLog.checkTime}]`
                            baseInfo.checkTime = handleCheckLog.checkTime
                            let state = this.getExceptionState(item)
                            baseInfo.state = item.normalFlag == 0 ? state : ''
                        }
                    }

                    if (!hasCheck) {
                        baseInfo.checkInfo = '[未打卡]'
                        this.unCheckList.push(baseInfo)
                    }
                })

                let checkObj = this.checkObj
                checkObj.totalCount = checkObj.checkInList.length
                        + checkObj.checkOutList.length
                        + checkObj.leaveList.length

                this.sort(checkObj.checkInList)
                this.sort(checkObj.checkOutList)

                this.resetGridItemStyle(checkObj.checkInList)
                this.resetGridItemStyle(checkObj.checkOutList)
                this.resetGridItemStyle(checkObj.leaveList)
                this.resetGridItemStyle(this.unCheckList)
            },
            sort(list) {
                if (list) {
                    list.sort((left, right) => {
                        let ldate = left.checkTime
                        let rdate = right.checkTime
                        if (!ldate) {
                            return -1;
                        }
                        if (!rdate) {
                            return 1;
                        }
                        return rdate.localeCompare(ldate)
                    })
                }
            }
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                bindNavBar('动态')//等是否是领导算出来后再重新绑定，see watch
                if (vm.isNewPage(to)) {
                    Util.resetObject(vm, defaultData());
                }
            });
        },
        computed: {
            ...baseComputed,
            concernNumText() {
                return Util.formatTitle('添加关注', this.concernCount);
            },
            concernBtnDesc() {
                if (this.shouldAddAllJuniorMember) {
                    return '你还没有关注任何人，点击一键关注下级';
                } else {
                    return Util.formatTitle('添加关注', this.concernCount);
                }
            },
            shouldAddAllJuniorMember() {
                return this.hasInit && this.concernCount == 0 && this.isManager
            }
        },
        components: {
            'group-filter': GroupFilter,
            'calendar': Calendar
        }
    }
</script>
