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
                <div class="col-center focusHumanHeadPic"
                     :style="human.css">
                    {{human.shortName}}
                </div>
                <div class="col col-center focusHumanName">
                    {{human.humanName}}
                </div>
                <div class="col-center iconUnCheck focusSelect"
                     :class="{iconCheck : selectHumans[human.humanID]}">
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
</style>
<script>

    import {Indicator} from 'mint-ui';
    import {Toast} from 'mint-ui';
    import {MessageBox} from 'mint-ui';

    import {baseData, baseComputed, resolveResultData, startLoad, finishLoad} from '../TabManager';
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
                    functionName: "/mi/kq/common/getHumanListByHumanNameKq",
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
        components: {},
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
