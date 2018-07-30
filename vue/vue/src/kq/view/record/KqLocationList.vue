<template>
    <div>
        <div class="headerWrapper">
            <mt-header title="考勤位置"></mt-header>
            <group-filter
                    :data="filterData"
                    :toggleMode="true"
                    class="bdr-b"
                    :selectedIndex="selectedIndex"
                    v-on:onFilterChange="onFilterChange"
                    v-on:toggleShowAll="resetContentStyle">
            </group-filter>
            <div class="sortTab textBlue bdr-b row">
                <div class="bdr-r sortTabItem col"
                     @click="onTabClick(0)"
                     :class="{textGray: selectedTab != 0}">
                    时间<i :class="tabIconClass" v-show="selectedTab == 0"></i>
                </div>
                <div class="bdr-r sortTabItem col"
                     @click="onTabClick(1)"
                     :class="{textGray: selectedTab != 1}">
                    打卡次数<i :class="tabIconClass" v-show="selectedTab == 1"></i>
                </div>
            </div>
        </div>

        <div class="mint-content" :style="contentStyle">
            <div class="sectionEmpty" v-if="filterList.length == 0">
                没有数据
            </div>
            <div class="row list-item bdr-t bdr-b" v-for="item in filterList" @click="onItemClick(item)">
                <div class="item-left flex vertical center-child center-content"
                     :class="{brown: item.identifyFlag != 1}">
                    <div class="largeFont">{{item.checkCount}}</div>
                    <div class="smallFont">条记录</div>
                </div>
                <div class="col item-right">
                    <div v-show="item.firstDate.dateText">{{item.firstDate.dateText}}
                        <span class="textGray">{{item.firstDate.remark}}</span>
                    </div>
                    <div v-show="item.secondDate.dateText">{{item.secondDate.dateText}}
                        <span class="textGray">{{item.secondDate.remark}}</span>
                    </div>
                    <div>地址：{{item.Address}}</div>
                    <div :class="[item.identifyFlag == 1 ? 'textBlue' : 'textBrown']">
                        {{item.identifyFlag == 1 ? '地址已认证' : '地址未认证'}}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .headerWrapper {
        position: fixed;
        z-index: 100;
        width: 100%;
    }

    .list-item {
        padding: 0;
        margin-top: 10px;
    }

    .item-left {
        background-color: #37AEFF;
        width: 60px;
        color: white;
    }

    .item-left.brown {
        background-color: #EE9A15;
    }

    .item-right {
        padding: 5px;
    }

    .item-right div {
        padding: 5px;
    }

    .sectionEmpty {
        margin-top: 10px;
    }

    .sortTab {
        background-color: white;
    }

    .sortTabItem {
        height: 40px;
        line-height: 40px;
        text-align: center;
    }

    .sortTab [class^="icon-"] {
        margin-left: 5px;
    }

</style>
<script>
    import {bindNavBar} from 'egovanative'

    import {Indicator} from 'mint-ui'
    import {Toast} from 'mint-ui'
    import {MessageBox} from 'mint-ui'

    import {baseData, baseComputed, resolveResultData} from '../TabManager'
    import Util from 'Util'
    import {data as gData} from 'zhixin'
    import http from 'Http'
    import sysConfig from 'sysConfig'
    import dateUtil from 'DateUtil'

    import {locationData, getContentStyle} from '../filterHelper'

    import GroupFilter from '../widget/GroupFilter.vue'
    import {locationMethods, extraData} from './locationManager'

    function defaultData() {
        return {
            ...baseData(),
            ...extraData(),
            contentStyle: {top: (Util.getHeaderHeight() + 112 + 40) + 'px'},
            filterData: locationData,
            selectedIndex: [0, 0, 0],
            selectedTab: 0,//0: 时间， 1: 打卡次数
            sortOrderDesc: false,//true: 降序，false：升序
            filterList: [],//过滤之后的列表，用来展示
            humanID: gData.humanID
        }
    }

    export default{
        data(){
            return defaultData()
        },
        methods: {
            ...locationMethods,
            onFilterEnd(list) {
                list.map(item => {
                    let dateList = item.dateList
                    item.firstDate = dateList[0] || {}
                    item.secondDate = dateList[1] || {}

                    item.firstDate.remark = item.remarkList[0]
                    item.secondDate.remark = item.remarkList[0]
                })
                this.filterList = list
                this.sortData()
            },
            resetContentStyle() {
                let classes = Util.select('.headerWrapper')
                let headerHeight = 0

                if (classes && classes.length > 0) {
                    headerHeight = classes[0].offsetHeight
                }

                this.contentStyle = {top: `${headerHeight}px`}
            },
            getDateText(isMorning, date) {
                let append = isMorning ? '签到' : '签退'
                return `${dateUtil.formatDateByDate(date, dateUtil.FORMAT_MD_CN)} ${append}`
            },

            onTabClick(index) {
                if (index != this.selectedTab) {
                    this.selectedTab = index;
                } else {
                    this.sortOrderDesc = !this.sortOrderDesc;
                }
                this.sortData()
            },
            sortData() {
                if (this.selectedTab == 0) {
                    this.sortDataByTime()
                } else if (this.selectedTab == 1) {
                    this.sortDataByCount()
                }
            },
            sortDataByTime() {
                this.filterList.sort((left, right) => {
                    let ldate = left.dateList[0] && left.dateList[0].date || new Date()
                    let rdate = right.dateList[0] && right.dateList[0].date || new Date()
                    if (ldate.getTime() > rdate.getTime()) {
                        return this.sortOrderDesc ? -1 : 1
                    } else if (ldate.getTime() < rdate.getTime()) {
                        return this.sortOrderDesc ? 1 : -1
                    } else {
                        return 0
                    }
                })
            },
            sortDataByCount() {
                this.filterList.sort((left, right) => {
                    if (left.checkCount > right.checkCount) {
                        return this.sortOrderDesc ? -1 : 1
                    } else if (left.checkCount < right.checkCount) {
                        return this.sortOrderDesc ? 1 : -1
                    } else {
                        return 0
                    }
                })
            },
            onItemClick(item) {
                this.$router.push({
                    name: 'kqLocationDetail',
                    params: {
                        checkItem: item,
                        isMonth: this.selectedIndex[0] == 0,
                        humanID: this.humanID
                    }
                })
            },
            initOnCreate() {
                Util.resetObject(this, defaultData())
                let params = this.$route.params
                this.humanID = params && params.humanID || gData.humanID
                this.fetchData()
                this.resetContentStyle()
            }
        },
        components: {
            'group-filter': GroupFilter
        },
        computed: {
            tabIconClass() {
                return {
                    'icon-arrow-down': this.sortOrderDesc,
                    'icon-arrow-up': !this.sortOrderDesc
                }
            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                if (vm.isNewPage(to)) {
                    vm.initOnCreate()
                }
                bindNavBar('考勤位置列表')
            })
        }
    }
</script>
