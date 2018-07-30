<template>
    <div>
        <div class="sectionEmpty" v-show="isEmpty && !isLoading">
            没有数据
        </div>
        <div
                v-infinite-scroll="loadData"
                infinite-scroll-disabled="disableLoad"
                infinite-scroll-distance="10"
                infinite-scroll-immediate-check="false">
            <div @click="clickItem(human)" v-for="human in dataList" class="row bdr-b humanItem">
                <div class="col col-center flex center-child">
                    <div class="col-center focusHumanHeadPic" :style="human.css">
                        {{human.shortName}}
                    </div>
                    <div class="col col-center focusHumanName">{{human.humanName}}</div>
                    <i class="col-center icon-ok iconSelect" v-show="selectHumans[human.humanID]"></i>
                </div>
            </div>
            <div class="flex center-child center-content" v-show="isLoading" style="padding:10px 0;">
                <i class="icon-spinner icon-spin textGray"></i>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .humanItem {
        background-color: white;
    }

    .row.humanItem {
        padding: 0;
    }

    .iconSelect {
        margin-right: 10px;
        color: #999c9f;
    }

</style>
<script>

    import {Indicator} from 'mint-ui';
    import {Toast} from 'mint-ui';
    import {MessageBox} from 'mint-ui';

    import {baseData, baseComputed, resolveResultData, startLoad, finishLoad} from 'ListManager';
    const gData = require('zhixin').data;
    const http = require('Http');
    const sysConfig = require('sysConfig');
    const Util = require('Util');
    export default{
        data(){
            return {
                ...baseData(),
            }
        },
        props: {
            selectHumans: {},
            clickItem: Function,
            searchText: String,
        },
        methods: {
            loadData(isRefresh) {
                if (isRefresh) {
                    Util.clearList(this.dataList);
                }
                startLoad.call(this);
                http.ajax({
                    functionName: "/mi/salelog/common/getHumanListByHumanNameSalelog",
                    params: {
                        humanID: gData.humanID,
                        humanName: this.searchText
                    },
                    success: (data) => {
                        resolveResultData.call(this, data, isRefresh, (human) => {
                            human.shortName = sysConfig.getShortName(human.humanName);
                            human.css = sysConfig.getPhotoColorCss(human.humanID);
                        });
                    },
                    error(data) {
                        console.log("加载列表错误：" + data);
                    },
                    finally: () => {
                        finishLoad.call(this);
                    }
                });
            },
        },
        computed: {
            ...baseComputed
        },
        watch: {
            searchText() {
                if (this.searchText) {
                    this.loadData(true);
                }
            }
        }
    }
</script>
