<template>
    <div>
        <mt-header fixed title="情况说明全部记录"></mt-header>
        <group-filter style="position: fixed; z-index:100;"
                      :style="filterStyle"
                      :data="filterData"
                      class="bdr-b"
                      :selectedIndex="selectedIndex"
                      v-on:onFilterChange="onFilterChange">
        </group-filter>
        <div class="mint-content" :style="contentStyle">
            <div class="sectionEmpty" v-show="isEmpty">
                没有数据
            </div>
            <div
                    v-infinite-scroll="loadData"
                    infinite-scroll-disabled="disableLoad"
                    infinite-scroll-distance="10"
                    infinite-scroll-immediate-check="false">
                <explain-list :dataList="dataList"></explain-list>
            </div>
        </div>
    </div>
</template>
<style>
</style>
<script>
    import {bindNavBar} from 'egovanative'

    import {Indicator} from 'mint-ui'
    import {Toast} from 'mint-ui'

    import {baseData, baseComputed, resolveResultData, mockDataList} from '../TabManager'
    import Util from 'Util'
    import {data as gData} from 'zhixin'
    import http from 'Http'
    import sysConfig from 'sysConfig'
    import {caseParser} from './parser'
    import {filterData, getSelfFlag, getApplyStat} from '../filterHelper'

    import GroupFilter from '../widget/GroupFilter.vue'
    import ExplainList from './ExplainList.vue'

    function defaultData() {
        return {
            ...baseData(),
            filterData: filterData,
            selectedIndex: [0, 0],
            contentStyle: {top: (Util.getHeaderHeight() + 88) + 'px'},
            filterStyle: {top: Util.getHeaderHeight() + 'px'},
        }
    }

    export default{
        data(){
            return defaultData()
        },
        components: {
            'group-filter': GroupFilter,
            'explain-list': ExplainList
        },
        methods: {
            onFilterChange() {
                this.loadData(true)
            },
            loadData(isRefresh) {
                if (isRefresh) {
                    Indicator.open()
                    Util.clearList(this.dataList)
                }
                http.ajax({
                    functionName: "/mi/explain/getallexplinlist",
                    params: {
                        selfFlag: getSelfFlag(this.selectedIndex[0]),
                        applyState: getApplyStat(this.selectedIndex[1]),
                        startNum: isRefresh ? 0 : this.dataList.length,
                        count: sysConfig.COUNT_PER_PAGE,
                        humanID: gData.humanID
                    },
                    success: (data) => {
                        resolveResultData.call(this, data, isRefresh, caseParser)
                    },
                    error(data) {
                        Toast("加载列表错误：" + data)
                    },
                    finally() {
                        Indicator.close()
                    }
                })
            }
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                bindNavBar('情况说明全部记录')
                Util.resetObject(vm, defaultData())
                vm.loadData(true)
            })
        },
        computed: {
            ...baseComputed
        }
    }
</script>
