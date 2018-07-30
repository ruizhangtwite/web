<template>
    <div
            v-infinite-scroll="loadCaseData"
            infinite-scroll-disabled="disableLoad"
            infinite-scroll-distance="10"
            infinite-scroll-immediate-check="false">
        <div @click="gotoCaseDetail(index)" class="itemContainer bdr-b middleFont" v-for="(obj, index) in caseDataList">
            <div class="item" style="margin-top:5px">
                <div class="row">
                    <div class="humanIndex" style="margin-top:3px;color:#ff6100">{{index+1}}</div>
                    <div class="col" style="margin-left: 5px">
                        <div class="ID" style="color:#37AEFF;font-size:14px;margin-top: 3px">{{obj.id}}</div>
                        <div class="subType" style="font-size:15px;margin-top: 3px">{{obj.n}}</div>
                        <div class="address" style="color:#a3a3a3;font-size:13px;margin-top: 3px">{{obj.d}}</div>
                        <div class="time" style="color:#ff6100;font-size:12px;margin-top: 3px">{{obj.t}} 来自{{obj.sn}}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>

</style>
<script>
    import {Navbar, TabItem, Indicator, MessageBox, Toast} from 'mint-ui';
    import Util from 'Util'
    import dateUtil from 'DateUtil'
    import {data as gData} from 'zhixin'
    import http from 'Http'
    import sysConfig from 'sysConfig'
    import {bindNavBar} from 'egovanative'
    import {baseData, baseComputed, resolveHasMore, resolveResultData} from 'ListManager';

    function defaultData() {
        return {
            ...baseData(),
            caseDataList: [],
            humanID: gData.humanID,
            type: "",
        }
    }
    export default{
        data(){
            return defaultData()
        },
        methods: {
            loadCaseData(isRefresh){
                Indicator.open();
                if (isRefresh){
                    this.caseDataList = []
                }

                if (true){
                    http.ajax({
                        functionName: "getCaseMonitor_ZX",
                        params: {
                            type: this.type,
                            startDate: Util.getStartDate(),
                            endDate: Util.getNowDate(),
                            humanID: this.humanID,
                            curPage: "-1",
                            perPageCount: "20",
                            startNum: "0",
                            endNum:"0"
                        },
                        success: (data) => {
                            if (data && data.errorCode == 0) {
                                var dataList = JSON.parse(data.dataList);
                                for (var i = 0; i < dataList.length; i++) {
                                    var item = dataList[i];
                                    this.caseDataList.push(item);
                                }
                            } else {
                                alert(data.errorDesc);
                            }
                        },
                        finally: () => {
                            Indicator.close()
                        }
                    })
                }
            },
            initOnCreate() {
                Util.resetObject(this, defaultData())
                let params = this.$route.params
                this.type = params && params.type
                this.loadCaseData(true)
            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                vm.initOnCreate()
                bindNavBar('案卷列表')
            })
        }
    }

</script>