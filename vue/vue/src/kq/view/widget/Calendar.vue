<template>
    <div class="homeHeader" :class="{'is-fixed': fixed}":style="homeHeaderStyle">
        <div class="calendarMonth row bdr-b">
            <div class="monthNavBtn col-center" @click="onLastClick">
                {{lastBtnText}}
            </div>
            <div class="col col-center flex center-content curMonth"
                 @click="toggleCalendar">
                <div style="margin-right:5px" class="col-center">{{monthYearText}}</div>
                <i class="col-center"
                   :class="{'icon-angle-down': !isCalendarOpen, 'icon-angle-up': isCalendarOpen}"></i>
            </div>
            <div class="monthNavBtn col-center" @click="onNextClick">
                {{nextBtnText}}
            </div>
        </div>
        <!-- 周 -->
        <div class="weekView row ">
            <div class="col col-center weekItem textBlue middleFont" v-for="week in weekList">{{week}}</div>
        </div>
        <!-- 日历 -->
        <div class="calendarView">
            <div id="monthDays" class="row calendarRow" v-for="(colList, index) in cellList">
                <div class="col flex cellContainer" @click="clickCell(cell, index)" v-for="cell in colList">
                    <div class="dayCell"
                         v-show="canSelect(cell)"
                         :class="[selectedCell == cell ? 'selectCell' : canSelect(cell) && cell.isToday ? 'todayCell' : '']">{{cell.day}}</div>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
    .calendarContent {
        bottom: 0;
        width: 100%;
        position: absolute;
    }

    .calendarAnim {
        -webkit-transition: top 0.25s;
        transition: top 0.25s;
    }
</style>
<style scoped>
    .is-fixed {
        position: fixed;
    }
    .homeHeader {
        width: 100%;
        background-color: white;
    }

    .calendarMonth {
        padding: 10px;
    }

    .curMonth {
        text-align: center;
    }

    .weekItem {
        text-align: center;
        padding: 5px;
    }

    .weekView {
        margin-top: 0;
    }

    .monthNavBtn {
        height: 20px;
        margin-left: 10px;
        margin-right: 10px;
    }

    .dayCell {
        width: 35px;
        height: 35px;
        background-color: transparent;
        text-align: center;
        font-size: 15px;
        line-height: 35px;
        border-radius: 17.5px;
    }

    .selectCell {
        background-color: #FFBB37;
        color: white;
    }

    .todayCell {
        background-color: #EEEFF3;
    }


    .cellContainer {
        padding: 0;

        -webkit-box-orient: vertical;
        flex-direction: column;

        -webkit-box-pack: center;
        justify-content: center;

        -webkit-box-align: center;
        align-items: center;
    }

    .row.calendarRow {
        padding: 5px;
    }

    .calendarView {
        padding-bottom: 10px;
    }

</style>
<script>
    import Util from 'Util'
    import dateUtil from 'DateUtil'
    import sysConfig from 'sysConfig'
    import {data as gData} from 'zhixin'

    export default{
        data(){
            return {
                weekList: ["一", "二", "三", "四", "五", "六", "日"],
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1,
                isCalendarOpen: false,
                cellList: [],
                selectedCell: null,
                selectRow: 0,
                topRow: 0,
                contentTop: 0,
                shouldAddCalendarAnim: false,//等第一次手动切换时再加上动画
            }
        },
        props: {
            fixed: Boolean
        },
        methods: {
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

                    this.clickCell(this.selectedCell)
                } else {
                    this.nextMonth();
                    this.switchRow();

                    var firstDayOfMonth = dateUtil.getFirstDayOfNormalMonth(this.year, this.month);
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

                    this.clickCell(this.selectedCell)

                } else {
                    this.lastMonth();

                    //当前处于收起状态，所以lastMonth会调用switchRow，这里再次调用一遍，
                    //将日历复原，然后重新计算需要展示哪一行
                    this.switchRow();

                    //切换到上个月后
                    var lastDayOfMonth = dateUtil.getLastDayOfNormalMonth(this.year, this.month);
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
                var headerView = Util.select(".homeHeader");
                headerView = headerView && headerView[0]
                if (!headerView) {
                    return {on: -1, off: -1};
                }
                var headerHeight = Util.getHeaderHeight();

                var calendarHeight = headerView.offsetHeight;
                var distance = Util.select('.calendarView')[0].offsetHeight - Util.select(".calendarRow")[0].offsetHeight;
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
                var monthBeginDate = dateUtil.getFirstDayOfNormalMonth(year, month);
                var monthEndDate = dateUtil.getLastDayOfNormalMonth(year, month);

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

                    if (todayStr.localeCompare(loopDateStr) == 0) {
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
            canSelect(cell) {
                return !this.isCalendarOpen || cell.date.getMonth() + 1 == this.month;
            }
        },
        computed: {
            homeHeaderStyle() {
                return `margin-top: ${Util.getHeaderHeight()}px`;
            },
            monthYearText () {
                return this.year + "年" + this.month + "月";
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
        watch: {
            contentTop(val) {
                this.$emit('contentTop', val)
            },
            selectedCell(val) {
                this.$emit('selectedDate', val && val.date)
            },
            shouldAddCalendarAnim(val) {
                this.$emit('shouldAddCalendarAnim', val)
            }
        }
    }
</script>
