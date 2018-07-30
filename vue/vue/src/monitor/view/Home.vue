<template>
    <div>
        <group-filter style="position: fixed;"
                      :data="filterData" class="bdr-b"
                      :selectedIndex="selectedIndex"
                      v-on:onFilterChange="onFilterChange">
        </group-filter>
        <div class="mint-content soft-scrollable" style='top: 57px'>
            <div class="sectionPerson" v-show=showSectionPerson>
                <div class="col">
                    <div class="section one">当前人员统计</div>
                    <div style="margin-top:3px">
                        <u class="div-top" @click="clickAllPerson()">
                            总人数 {{personData.allPerson}}
                        </u>
                    </div>
                    <div style="margin-top:3px">
                        <u class="div-top" @click="clickOnlinePerson()">
                            在岗人数 {{personData.onlinePerson}}
                        </u>
                    </div>
                    <div style="margin-top:3px">
                        <u class="div-top" @click="clickOfflinePerson()">
                            不在岗人数 {{personData.offlinePerson}}
                        </u>
                    </div>
                    <div style="margin-top:3px">
                        <u class="div-top" @click="clickNoCoordPerson()">
                            无坐标人数 {{personData.notInDuty}}
                        </u>
                    </div>
                    <div style="margin-top:3px">
                        <u class="div-top" @click="clickHasCoordPerson()">
                            有坐标人数 {{personData.inDuty}}
                        </u>
                    </div>

                    <div
                            v-infinite-scroll="loadPersonData"
                            infinite-scroll-disabled="disableLoad"
                            infinite-scroll-distance="10"
                            infinite-scroll-immediate-check="false">
                        <div @click="gotoPersonDetail(index)" class="itemContainer bdr-b middleFont" v-for="(obj, index) in personDataList">
                            <div class="item" style="margin-top:5px">
                                <div class="row">
                                    <div class="humanIndex" style="margin-top:3px;color:#ff6100">{{index+1}}</div>
                                    <div class="col" style="margin-left: 5px">
                                        <div class="patrolName" style="color:#37AEFF;font-size: 16px;margin-top: 3px">{{obj.patrolName}}</div>
                                        <div class="address" style="color:#a3a3a3;font-size: 12px;margin-top: 3px">{{obj.address}}</div>
                                        <div class="time" style="color:#ff6100;font-size:12px;margin-top: 3px">{{obj.time}}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div class="sectionCase" v-show=showSectionCase>
                <div class="col">
                    <div class="section one">今日案件统计</div>
                    <div style="margin-top:3px">
                        <u class="div-top" @click="clickAllCase()">
                            上报数 {{caseData.uploadCase}}
                        </u>
                    </div>
                    <div style="margin-top:3px">
                        <u class="div-top" @click="clickDoingCase()">
                            立案数 {{caseData.onCase}}
                        </u>
                    </div>
                    <div style="margin-top:3px">
                        <u class="div-top" @click="clickDoneCase()">
                            结案数 {{caseData.finishCase}}
                        </u>
                    </div>
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
                </div>
            </div>

        </div>
    </div>
</template>
<style scoped>
    .div-top{
    }

    .itemTitle {
        font-size: 18px;
    }

    .itemFrom,.itemCreateTime {
        font-size: 15px;
        color: #aaaaaa;
    }

    .unRead {
        width: 8px;
        height: 8px;
        -webkit-border-radius: 8px;
        -moz-border-radius: 8px;
        border-radius: 8px;
        border-color: #ff0000;
        border-color: #ff0000;
        background-color: #ff0000;
        margin-top: 8px;
    }

    .listItem {
        cursor: pointer;
    }

    .listItem:active {
        background-color: #efefef;
    }

    .index {
        margin-top: 5px;
        color: #ff0000;
    }

    .patrolName{
        color: #37AEFF;
    }
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
    import GroupFilter from '../widget/GroupFilter.vue';

    function defaultData() {
        return {
            ...baseData(),
            tabs: [],
            filterData: [],
            personDataList: [],
            caseDataList: [],
            selectedIndex: [0],
            humanID: gData.humanID,
            isMarkWork: true,
            showSectionPerson: true,
            showSectionCase: false,
            addressDesc: '',
            personData: {
                allPerson: 0,
                onlinePerson: 0,
                offlinePerson: 0,
                noCoord: 0,
                notInDuty: 0,
                inDuty: 0
            },
            caseData: {
                uploadCase: 0,
                onCase: 0,
                finishCase: 0
            }
        }
    }

    export default{
        data(){
            return defaultData()
        },
        components: {
            'group-filter': GroupFilter
        },
        computed: {
            ...baseComputed
        },
        methods: {
            init() {
                var temp = ["人员监控","案件监控"];
                this.filterData.push(temp);
                this.loadPersonData(true);
            },
            clickAllPerson(){
                this.$router.push({
                    name: 'personlist',
                    params: {
                        type: "0"
                    }
                })
            },
            clickOnlinePerson(){
                this.$router.push({
                    name: 'personlist',
                    params: {
                        type: "1"
                    }
                })
            },
            clickOfflinePerson(){
                this.$router.push({
                    name: 'personlist',
                    params: {
                        type: "2"
                    }
                })
            },
            clickNoCoordPerson(){
                this.$router.push({
                    name: 'personlist',
                    params: {
                        type: "3"
                    }
                })
            },
            clickHasCoordPerson(){
                this.$router.push({
                    name: 'personlist',
                    params: {
                        type: "4"
                    }
                })
            },
            clickAllCase(){
                this.$router.push({
                    name: 'caselist',
                    params: {
                        type: "0"
                    }
                })
            },
            clickDoingCase(){
                this.$router.push({
                    name: 'caselist',
                    params: {
                        type: "1"
                    }
                })
            },
            clickDoneCase(){
                this.$router.push({
                    name: 'caselist',
                    params: {
                        type: "2"
                    }
                })
            },
            onFilterChange() {
                if (this.getOperationFlag() == 0){
                    this.showSectionPerson = true;
                    this.showSectionCase = false;
                    this.loadPersonData(true);
                }
                else {
                    this.showSectionPerson = false;
                    this.showSectionCase = true;
                    this.loadCaseData(true);
                }
            },
            gotoPersonDetail(i){
                let dataObj = this.personDataList[i];
                this.$router.push({
                    name: 'detail',
                    params: {
                        object: dataObj
                    }
                })
            },
            getOperationFlag() {
                return this.selectedIndex[0];
            },
            loadCaseData(isRefresh){
                Indicator.open();
                if (isRefresh){
                    this.caseDataList = []
                }
                if (true) {
                    http.ajax({
                        functionName: "getCaseStatic_ZX",
                        params: {
                            startDate: Util.getStartDate(),
                            endDate: Util.getNowDate(),
                            humanID: this.humanID,
                            startNum: "0",
                            endNum: "0"
                        },
                        success: (data) => {
                            if (data && data.errorCode == 0) {
                                var dataArray = data.errorDesc.split(",");
                                this.caseData.uploadCase = dataArray[0];
                                this.caseData.onCase = dataArray[1];
                                this.caseData.finishCase = dataArray[2];
                            } else {
                                alert(data.errorDesc);
                            }
                        },
                        finally: () => {
                            Indicator.close()
                        }
                    })
                }

                if (true){
                    http.ajax({
                        functionName: "getLastCase_ZX",
                        params: {
                            type: "0",
                            startDate: Util.getStartDate(),
                            humanID: this.humanID,
                            count: "20",
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
            loadPersonData(isRefresh){
                Indicator.open();

                if (isRefresh) {
                    this.personDataList = []
                }

                if (true) {
                    http.ajax({
                        functionName: "getRenData_ZX",
                        params: {
                            startDate: Util.getStartDate(),
                            patroType: "",
                            humanID: this.humanID,
                            startNum: "0",
                            endNum: "0"
                        },
                        success: (data) => {
                            if (data && data.errorCode == 0) {
                                var dataArray = data.errorDesc.split(",");
                                this.personData.allPerson = dataArray[0];
                                this.personData.onlinePerson = dataArray[1];
                                this.personData.offlinePerson = dataArray[2];
                                this.personData.noCoord = dataArray[3];
                                this.personData.notInDuty = dataArray[4];
                                this.personData.inDuty = dataArray[5];
                            } else {
                                alert(data.errorDesc);
                            }
                        },
                        finally: () => {
                            Indicator.close()
                        }
                    })
                }

                if (true){
                    http.ajax({
                        functionName: "getLastCase_ZX",
                        params: {
                            type: "1",
                            patroType: "",
                            startDate: Util.getStartDate(),
                            humanID: this.humanID,
                            count: "20",
                            startNum: "0",
                            endNum:"0"
                        },
                        success: (data) => {
                            if (data && data.errorCode == 0) {
                                var dataList = JSON.parse(data.dataList);
                                for (var i = 0; i < dataList.length; i++) {
                                    var item = dataList[i];
                                    this.personDataList.push({
                                        patrolid: item.patrolid,
                                        patrolName: item.patrolname,
                                        coodX: item.coodX,
                                        coodY: item.coodY,
                                        time: item.time,
                                        address: item.address,
                                    });
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
            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                vm.init()
                bindNavBar('人员监控')
            })
        }
    }

</script>