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
                <div @click="gotoNoticeDetail(index)" class="itemContainer bdr-b middleFont" v-for="(obj, index) in dataList">
                    <div class="item">
                        <div class="itemTitle">{{obj.title}}</div>
                        <div class="row">
                            <div class="col itemFrom">来源：{{obj.from}}</div>
                            <div class="itemCreateTime">{{obj.createTime}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .itemTitle {
        font-size: 18px;
    }

    .itemFrom, .itemCreateTime {
        font-size: 15px;
        color: #aaaaaa;
        margin-top: 5px;
    }

    .itemContainer {
        background-color: white;
        padding: 5px;
    }

    .attachment {
        width: 16px;
        height: 16px;
        background-image: url("../image/attachment.png");
        background-repeat: no-repeat;
        margin-left: 10px;
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
            dataList: [],
            selectedIndex: [0],
            humanID: gData.humanID,
            isMarkWork: true,
            addressDesc: ''
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
                this.getTabs();
            },
            onFilterChange() {
                this.loadData(true);
            },
            gotoNoticeDetail(i){
                let dataObj = this.dataList[i];
                this.$router.push({
                    name: 'detail',
                    params: {
                        object: dataObj
                    }
                })
            },
            getTabs(){
                Indicator.open();
                http.ajax({
                    functionName: "getDataList_ZX",
                    params: {
                        sType: "708",
                        humanID: "108"
                    },
                    success: (data) => {
                        if (data.errorCode == 0) {
                            var temp = [];
                            var dataList = JSON.parse(data.dataList);
                            if (dataList != null && dataList.length > 0) {
                                for (var i = 0; i < dataList.length; i++) {
                                    this.tabs.push({
                                        id: "" + dataList[i].nti,
                                        name: dataList[i].ntn,
                                        num: dataList[i].num,
                                        dataList: [],
                                        isLoad: false
                                    });
                                    temp.push(dataList[i].ntn);
                                }
                                this.filterData.push(temp);
                                this.loadData(true);
                            } else {
                                alert("标签数量为空");
                            }
                        } else {
                            alert("请求失败");
                        }
                    },
                    finally: () => {
                        Indicator.close()
                    }
                })
            },
            getOperationFlag() {
                return this.selectedIndex[0];
            },
            loadData(isRefresh){
                Indicator.open();

                if (isRefresh) {
                    this.dataList = []
                }

                let index = this.getOperationFlag();
                let tab = this.tabs[index];
                if (true) {
                    http.ajax({
                        functionName: "getDataList_ZX",
                        params: {
                            sType: "709",
                            iHumanID: "108",
                            sExtend: tab.id
                        },
                        success: (data) => {
                            if (data && data.errorCode == 0) {
                                this.tabs[index].isLoad = true;
                                var dataList = JSON.parse(data.dataList);
                                for (var i = 0; i < dataList.length; i++) {
                                    var item = dataList[i];
                                    this.dataList.push({
                                        id: item.nid,
                                        title: item.tt,
                                        content: item.ct,
                                        readFlag: item.rdf,
                                        createTime: dateUtil.formatDate(item.ctm, dateUtil.FORMAT_YMDHM),
                                        from: item.hn,
                                        mediaList: eval(item.medialist)
                                    });
                                }
                                this.tabs[index].num = dataList.length;
                                this.tabs[index].dataList = this.dataList;
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
                bindNavBar('公文通告')
            })
        }
    }
</script>