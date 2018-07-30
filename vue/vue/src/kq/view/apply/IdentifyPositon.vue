<template>
    <div>
        <group-filter style="position: fixed;"
                      :data="filterData" class="bdr-b"
                      :selectedIndex="selectedIndex"
                      v-on:onFilterChange="onFilterChange">
        </group-filter>
        <div class="mint-content" style='top: 57px'>
            <div class="sectionEmpty" v-show="isEmpty">
                没有数据
            </div>
            <div
                    v-infinite-scroll="loadData"
                    infinite-scroll-disabled="disableLoad"
                    infinite-scroll-distance="10"
                    infinite-scroll-immediate-check="false">
                <div class="itemContainer bdr-b middleFont" v-for="(obj, index) in dataList">
                    <div class="item">
                        <span class="textBrown"><span>{{obj.humanName}}</span></span>
                        <span>在</span>
                        <span class="textBlue" @click="goMap(obj)">{{obj.address}}</span>
                        <span>打了{{obj.checkPointNum}}次卡</span>
                    </div>
                    <div class="item" v-show="obj.remark">备注：{{obj.remark}}</div>
                    <div class="item" v-show="obj.createTime && obj.operationFlag > 0">认证时间：{{obj.createTime}}</div>
                    <div class="btn">
                        <span @click="onDel(index)" v-if="obj.operationFlag > 0">删除</span>
                        <span @click="gotoKqLocation(index)" v-else>去认证</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>

    .itemContainer {
        background-color: white;
        padding: 5px;
    }

    .content {
        border-bottom: solid 1px #d9d9d9;
        padding: 10px 15px;
        background-color: white;
    }

    .item {
        padding: 5px;
    }

    .btn {
        padding: 5px;
        position: relative;
        background-color: transparent;
        color: #37AEFF;
        border: 0;
        border-radius: 3px;
        outline: none;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        font-size: 13px;
        overflow: hidden;
    }

    .btn span {
        float: right;
    }
</style>
<script>
    import {Indicator, MessageBox, Toast} from 'mint-ui'
    import {bindNavBar} from 'egovanative';

    import {baseData, baseComputed, resolveHasMore, resolveResultData} from 'ListManager';
    import Util from 'Util'
    import http from 'Http'
    import sysConfig from 'sysConfig'

    import GroupFilter from '../widget/GroupFilter.vue';
    function defaultData() {
        return {
            ...baseData(),
            filterData: [['待认证', '工作地点', '非工作地点']],
            selectedIndex: [0],
            humanID: Util.getRequestParam('humanID'),
        }
    }

    export default{
        data() {
            return defaultData();
        },
        components: {
            'group-filter': GroupFilter
        },
        methods: {
            init() {
                this.loadData(true);
            },
            onFilterChange() {
                this.loadData(true);
            },
            gotoKqLocation(index) {
                let dataObj = this.dataList[index];
                this.$router.push({
                    name: 'kqMapIdentify',
                    params: {
                        humanID: dataObj.humanId,
                        clusterID: dataObj.clusterId
                    }
                })
            },

            getOperationFlag() {
                switch (this.selectedIndex[0]) {
                    case 0://待认证
                        return 0
                    case 1://已认证工作地点
                        return 1
                    case 2://已认证非工作地点
                        return 2
                    default:
                        return 0
                }
            },
            loadData(isRefresh) {
                let flag = this.getOperationFlag()
                if (isRefresh) {
                    this.dataList = []
                }
                http.ajax({
                    functionName: 'mi/cluster/getidentifyposlist',
                    params: {
                        operationFlag: flag,
                        humanID: this.humanID,
                        count: sysConfig.COUNT_PER_PAGE,
                        startNum: this.dataList.length
                    },
                    start: () => {
                        Indicator.open();
                    },
                    success: (resultInfo) => {
                        if (flag == this.getOperationFlag()) {
                            resolveResultData.call(this, resultInfo, isRefresh, null, sysConfig.COUNT_PER_PAGE);
                        }
                    },
                    error: () => {
                        Toast("请求数据错误");
                    },
                    finally: () => {
                        Indicator.close();
                    }
                })
            },
            onDel(index) {
                MessageBox.confirm('确定删除？').then(action => {
                    this.deleteImpl(index);
                }, cancel=> {
                });
            },
            deleteImpl(index) {
                let dataObj = this.dataList[index];
                http.ajax({
                    functionName: 'mi/cluster/delidentifypos',
                    params: {
                        humanID: this.humanID,
                        clusterId: dataObj.clusterId,
                        concernHumanId: dataObj.concernHumanId
                    },
                    success: (resultInfo)=> {
                        if (resultInfo && resultInfo.success) {
                            this.dataList.splice(index, 1);
                            Toast("删除认证位置成功");
                        } else {
                            Toast(resultInfo && resultInfo.message || "删除认证位置失败");
                        }
                    },
                    start: ()=> {
                        Indicator.open();
                    },
                    error: ()=> {
                        Toast("请求错误");
                    },
                    finally: ()=> {
                        Indicator.close();
                    }
                });
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
            }
        },
        computed: {
            ...baseComputed
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                bindNavBar('位置认证')
                vm.init();
            })
        },
    }
</script>
