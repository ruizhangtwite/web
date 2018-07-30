<template>
    <div>
        <group-filter style="position: fixed"
                      :data="filterData"
                      class="bdr-b"
                      v-on:onFilterChange="onFilterChange"
                      :selectedIndex="selectedIndex"></group-filter>
        <div class="mint-content" :style="contentStyle">
            <div class="sectionEmpty" v-show="isEmpty">没有数据</div>
            <div class="item row"
                 @click="onItemClick(item)"
                 v-for="(item, index) in dataList">
                <div class="index">{{index + 1}}</div>
                <div class="col content middleFont">
                    <div class="row">
                        <div class="col largeFont textBlue">{{item.taskNum}}</div>
                        <div v-show="item.description">{{item.actDefName}}</div>
                    </div>
                    <div v-show="item.description">{{item.description}}</div>
                    <div v-show="item.subtypeName">{{item.subtypeName}}</div>
                    <div class="textGray smallFont" v-show="item.address">{{item.address}}</div>
                    <div class="textGray smallFont" v-show="item.createTime">{{item.createTime}} 上报</div>
                    <div class="textGray smallFont" v-show="item.actDeadLine">{{item.actDeadLine}} 截止</div>
                    <div class="textGray smallFont" v-show="item.taskTime">{{item.taskTime}} 下发</div>
                </div>
                <div class="itemTitle">{{item.taskName}}</div>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .index {
        background-color: #37AEFF;
        height: 30px;
        width: 30px;
        text-align: center;
        line-height: 30px;
        border-radius: 50%;
        color: white;
        font-size: 12px;
    }

    .item {
        background-color: white;
        padding: 10px;
    }

    .item .content {
        margin-left: 10px;
    }

    .content > div {
        padding: 3px 0;
    }
</style>
<script>
    import {getContentStyle} from '../../libs/widget/filterHelper'
    import Util from 'Util'
    import {data as gData} from 'zhixin'
    import http from 'Http'
    import sysConfig from 'sysConfig'
    import {bindNavBar} from 'egovanative'

    import GroupFilter from '../../libs/widget/GroupFilter.vue'
    import {Indicator, Toast} from 'mint-ui'

    const TASK_TYPE_VERIFY = 2;//核实
    const TASK_TYPE_CHECK = 3;//核查

    function defaultData() {
        return {
            selectedIndex: [0, 0],
            filterData: [['所有', '核实任务', '核查任务'], ['未完成', '已完成']],
            tabDataList: [[], []],
            contentStyle: getContentStyle(false),
            isLoading: true,
            dataList: []
        }
    }
    export default{
        data(){
            return defaultData()
        },
        components: {
            'group-filter': GroupFilter,
        },
        computed: {
            isEmpty() {
                return !this.isLoading && this.dataList.length == 0
            }
        },
        methods: {
            onFilterChange() {
                this.dataList = []
                let tempList = this.tabDataList[this.selectedIndex[1]]
                let type = this.selectedIndex[0]
                if (type != 0) {
                    tempList && tempList.map(item => {
                        if (item.taskType == TASK_TYPE_CHECK && type == 2
                                || item.taskType == TASK_TYPE_VERIFY && type == 1) {
                            this.dataList.push(item)
                        }
                    })
                } else {
                    this.dataList = tempList
                }
            },
            loadData(){
                http.ajax({
                    functionName: "getTask_ZX",
                    params: {
                        cardID: gData.cardID + "#",
                        HumanID: gData.humanID,
                        startNum: "0",
                        endNum: "0"
                    },
                    success: data => {
//                        if (sysConfig.zy == 1) {
//                        } else {
                            this.tabDataList = [[], []]

                            var dataList = JSON.parse(data.dataList)
                            dataList.map(val => {
                                if (val.tasktype == TASK_TYPE_CHECK) {
                                    val.taskName = "核查任务"
                                } else if (val.tasktype == TASK_TYPE_VERIFY) {
                                    val.taskName = "核实任务"
                                }

                                this.tabDataList[val.rectypeid == 1 ? 0 : 1].push(val)
                            })
                            this.tabDataList[0].push({
                                taskNum: '20170306077',
                                actDefName: '核查任务',
                                description: '测试处置通',
                                subtypeName: '我是小类',
                                address: '北京朝阳区',
                                createTime: '2017-09-09 12:23',
                                actDeadLine: '2017-09-09 12:33',
                                taskTime: '2017-09-09 12:32'
                            })
                            this.onFilterChange()
//                        }
                    },
                    start: ()=> {
                        this.isLoading = true
                        Indicator.open()
                    },
                    finally: ()=> {
                        this.isLoading = false
                        Indicator.close()
                    },
                    error(data) {
                        Toast("加载列表错误：" + data)
                    }
                })
            },
            onItemClick(item) {
                this.$router.push({
                    name: 'detail',
                    params: {
                        obj: item
                    }
                })
            }
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                bindNavBar('我的任务')
                Util.resetObject(vm, defaultData())
                vm.loadData()
            })
        },
    }
</script>
