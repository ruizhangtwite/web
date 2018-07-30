<template>
    <div class="mint-content">
        <mt-header fixed title="柱状图"></mt-header>
        <div class="header bdr-b row" @click="goSearch()">
            <div class="col-center textGray">
                <div>日期:</div>
            </div>
            <div class="col-center col">
                <div>{{displayDate}}</div>
            </div>
        </div>
        <div id="chart" :style="{top: headerHeight + 'px'}"></div>
    </div>
</template>
<style scoped>
    .mint-content {
        background-color: white;
    }

    .header {
        width: 100%;
        padding: 10px;
    }

    #chart {
        width: 100%;
        position: absolute;
        bottom: 0;
    }
</style>
<script>
    var echarts = require('echarts/lib/echarts')
    require('echarts/lib/chart/bar')
    require('echarts/lib/component/legend')
    require('echarts/lib/component/dataZoom')

    import DateUtil from 'DateUtil'
    import Util from 'Util'
    import {bindNavBar} from 'egovanative'

    export default{
        data(){
            return {
                headerHeight: 40
            }
        },
        computed: {
            displayDate() {
                let params = this.$route.params
                let startDate = params && params.startDate
                let endDate = params && params.endDate
                if (!startDate || !endDate) {
                    return ''
                }
                return `${DateUtil.formatDateByDate(startDate,
                        DateUtil.FORMAT_YMD)}至${DateUtil.formatDateByDate(endDate,
                        DateUtil.FORMAT_YMD)}`
            }
        },
        mounted() {
            this.headerHeight = this.getHeaderHeight()
        },
        methods: {
            getHeaderHeight() {
                let header = Util.select(".header")
                if (header && header.length > 0) {
                    return header[0].offsetHeight
                }
                return 40
            },
            init() {
                let re = this.prepareData()
                if (!re) {
                    return
                }
                const {displayData, xData, legends} = re
                let option = {
                    legend: {
                        data: legends
                    },
                    xAxis: {
                        type: 'category',
                        data: xData
                    },
                    yAxis: [{
                        type: 'value'
                    }],
                    dataZoom: [
                        {
                            type: 'inside',
                            xAxisIndex: [0],
                            start: 1,
                            end: 35
                        }
                    ],
                    series: displayData
                };

                let myChart = echarts.init(document.getElementById('chart'));
                myChart.setOption(option);
            },
            getKeyIndex(headers, axis) {
                for (let i = 0; i < headers.length; i++) {
                    if (headers[i] == axis) {
                        return i
                    }
                }
                return 0
            },
            getValueIndexList(headers, valList) {
                let map = headers.reduce((result, item, index) => {
                            result[item] = index
                            return result
                        }, {}) || {}

                return valList.map(item => {
                    return map[item]
                })
            },
            prepareData() {
                let params = this.$route.params
                if (!params) {
                    return null
                }
                let child = params.child
                let data = params.data
                let headers = data.headers || []

                let legends = child.yAxis.split(",")

                let keyIndex = this.getKeyIndex(headers, child.xAxis)
                let valIndexList = this.getValueIndexList(headers, legends)

                let xData = []
                let displayData = []

                for (let j = 0; j < data.list.length; j++) {
                    xData.push(data.list[j][keyIndex])
                }

                for (let i = 0; i < legends.length; i++) {
                    let dataInSeries = []
                    let col = valIndexList[i]

                    for (let j = 0; j < data.list.length; j++) {
                        dataInSeries.push(data.list[j][col])
                    }
                    displayData.push({
                        data: dataInSeries,
                        name: legends[i],
                        type: 'bar',
                        label: {
                            normal: {
                                show: true,
                                position: 'top'
                            }
                        }
                    });
                }

                return {displayData, legends, xData}
            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                if (vm.isNewPage(to)) {
                    try {
                        vm.init()
                    } catch (e) {
                        console.log(e)
                    }
                }
                bindNavBar('柱状图')
            })
        }

    }
</script>
