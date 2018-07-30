<template>
    <div class="mint-content">
        <mt-header fixed title="问题分类">
            <i class="icon-bar-chart icon-2x" slot="right" @click="goChart"></i>
        </mt-header>

        <div class="header row" @click="goSearch()">
            <div class="col-center textGray">
                <div>日期:</div>
                <div v-show='zqShow'>周期:</div>
            </div>
            <div class="col-center col">
                <div>{{displayDate}}</div>
                <div v-show='zqShow'>{{region}}</div>
            </div>
            <i class="icon-angle-right ic-gray col-center"></i>
        </div>
        <table>
            <tr>
                <td v-for="value in headers">{{value}}</td>
            </tr>

            <tr v-for="item in dataList">
                <td v-for="(value, index) in item"
                    @click="goListDetail(item,value,index)">{{value}}
                </td>
            </tr>
        </table>
    </div>
</template>
<style scoped>
    .mint-content {
        background-color: white;
    }

    table {
        border: 1px solid #e0e0e0;
        border-collapse: collapse;
        overflow: auto;
        width: 100%;
        height: 100%;
        display: block;
    }

    table tr {
        line-height: 40px;
    }

    table tr:first-child {
        line-height: 50px;
        background-color: #eaeaea;
    }

    table td {
        white-space: nowrap;
        padding: 0 10px;
        border: 1px solid #e0e0e0;
        text-align: center;
    }

    .header {
        width: 100%;
        padding: 10px;
    }

    .header > div:first-child {
        width: 80px;
    }

</style>
<script>
    import {DATE_TYPE_DAY, DATE_TYPE_MONTH, DATE_TYPE_WEEK} from '../config'
    import DateUtil from 'DateUtil'
    import http from 'Http'
    import {data as gData} from 'zhixin'
    import Util from 'Util'
    import {bindNavBar} from 'egovanative'
    import {Indicator} from 'mint-ui'

    function defaultData() {
        return {
            child: null,
            group: null,
            type: null,
            headers: [],
            startDate: new Date(),
            endDate: new Date(),
            dataList: [],
            zqShow: false,
            region: ''

        }
    }
    export default{
        data(){
            return defaultData()
        },
        computed: {
            displayDate() {
                return `${DateUtil.formatDateByDate(this.startDate,
                        DateUtil.FORMAT_YMD)}至${DateUtil.formatDateByDate(this.endDate,
                        DateUtil.FORMAT_YMD)}`
            }
        },
        methods: {
            init() {
                Util.resetObject(this, defaultData())

                let params = this.$route.params
                this.child = params.child
                this.group = params.group
                this.type = params.type

                this.calDate()
                this.initDataSource()

                if (this.child.id == "trend"
                        || this.child.id == "tongbi"
                        || this.child.id == "huanbi") {
                    this.zqShow = true
                }

            },
            calDate() {
                if (this.type == DATE_TYPE_WEEK) {
                    let d = this.startDate
                    d.setDate(d.getDate() - d.getDay() + 1)
                } else if (this.type == DATE_TYPE_MONTH) {
                    this.startDate.setDate(1)
                }
            },
            initDataSource() {
                if (this.child.guid && this.child.guid.length > 0) {
                    this.uniStatAsyncTask()
                } else if (group.dao == "CommentDAO") {
                    this.commentDAO()
                } else if (group.dao == "RecDynamicDAO") {
                    this.recDynamicDAO()
                }
            },
            uniStatAsyncTask() {
                let sql = " where 1=1 and (createtime between to_date('" +
                        DateUtil.formatDateByDate(this.startDate, DateUtil.FORMAT_YMD) +
                        "','yyyy-mm-dd') and to_date('" +
                        DateUtil.formatDateByDate(this.endDate, DateUtil.FORMAT_YMD) +
                        "','yyyy-mm-dd')+1 )  and (1=1) "

                this.sqlStr = sql;
                sql = sql.replace(/\'/g, "*#egova_5#*")

                http.ajaxV2({
                    functionName: "getUniStatData_ZX",
                    params: {
                        humanID: gData.humanID,
                        projGUID: this.child.guid,
                        queryID: this.child.id,
                        whereSqlStr: sql,
                        startNum: 0,
                        endNum: 0
                    },
                    start: ()=> {
                        Indicator.open()
                    },
                    success: (data) => {
                        if (data && data.errorCode == 0) {
                            this.parseResult(JSON.parse(data.dataList), data.resultStr)
                        }
                    },
                    finally: ()=> {
                        Indicator.close()
                    }
                })
            },
            parseResult(list, xml) {
                let headerInfo = this.parseHeader(xml)

                let headers = headerInfo.index
                let headerNames = headerInfo.header

                let dataList = []

                for (let i = 0; i < list.length; i++) {
                    let item = list[i]

                    let row = []
                    for (let j = 0; j < headers.length; j++) {
                        let key = headers[j]

                        row.push(item[key])
                    }

                    dataList.push(row)
                }

                this.dataList = dataList
                this.headers = headerNames
            },

            //解析xml中的 header names
            parseHeader(xml) {
                try {
                    let parser = new DOMParser()
                    let xmlDoc = parser.parseFromString("<result>" + xml + "</result>", "text/xml")

                    let elements = xmlDoc.getElementsByTagName("HeadStr")
                    let indexEles = xmlDoc.getElementsByTagName("HeadStrEN")

                    let header, index

                    if (elements && elements.length > 0) {
                        header = elements[0].firstChild.nodeValue

                        if (header.indexOf("#") > -1) {
                            header = header.split('#')[0]
                        }

                        header = header.split(',')
                    }
                    if (indexEles && indexEles.length > 0) {
                        index = indexEles[0].firstChild.nodeValue
                        index = index.split(',')
                    }

                    return {header: header, index: index}
                } catch (e) {
                    alert(e.message)
                }
            },
            commentDAO() {
                http.ajax({
                    functionName: "getStatEval_ZX",
                    params: {
                        humanID: gData.humanID,
                        type: 1, // 1-日，2-月，3-季度
                        beginDate: DateUtil.formatDateByDate(this.startDate, DateUtil.FORMAT_YMD),
                        endDate: DateUtil.formatDateByDate(this.endDate, DateUtil.FORMAT_YMD),
                        isHome: this.child.datatype,
                        queryStr: null,
                        startNum: 0,
                        endNum: 0
                    },
                    success: data=> {
                        if (data && data.errorCode == 0) {
                            this.parseResult(JSON.parse(data.dataList), data.resultStr)
                        }
                    }
                });

            },
            recDynamicDAO() {
                let oType = 1
                if (this.child.id == "region") {
                    oType = 1
                } else if (this.child.id == "type") {
                    oType = 2
                } else {
                    oType = 3
                }

                http.ajax({
                    functionName: "getRecDynamicStatList_ZX",
                    params: {
                        humanID: gData.humanID,
                        OperateType: oType, // DATATYPE_REGION = 1;DATATYPE_TYPE = 2;DATATYPE_SOURCE = 3;
                        RegionType: gData.regionType,
                        RegionID: gData.regionID,
                        Type: 1,
                        RecTypeID: 0,
                        BeginDate: DateUtil.formatDateByDate(this.startDate, DateUtil.FORMAT_YMD),
                        EndDate: DateUtil.formatDateByDate(this.endDate, DateUtil.FORMAT_YMD),
                        QueryStr: null,
                        startNum: 0,
                        endNum: 0
                    },
                    success: data => {
                        if (data && data.errorCode == 0) {
                            this.parseResult(JSON.parse(data.dataList), data.resultStr)
                        }
                    },
                    error: function (error) {

                    }
                })
            },
            goSearch() {
                this.$router.push({
                    name: 'condition',
                    params: {
                        child: this.child,
                        startDate: this.startDate,
                        endDate: this.endDate,
                        callback: value => {
                            this.startDate = new Date(value.startDate)
                            this.endDate = new Date(value.endDate)
                            this.region = value.region
                            this.initDataSource()
                        }
                    }
                })
            },
            goListDetail(data, value, index){
            },
            goChart() {
                this.$router.push({
                    name: 'chart',
                    params: {
                        child: this.child,
                        startDate: this.startDate,
                        endDate: this.endDate,
                        data: {
                            headers: this.headers,
                            list: this.dataList
                        }
                    }
                })

            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm=> {
                if (vm.isNewPage(to)) {
                    vm.init()
                }
                bindNavBar('问题分类', '柱状图', ()=> {
                    vm.goChart()
                })
            })
        }

    }
</script>
