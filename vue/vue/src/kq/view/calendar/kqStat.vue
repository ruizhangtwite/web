<script>
    const http = require('Http');
    const dateUtil = require("DateUtil");
    const sysConfig = require("sysConfig");
    const Util = require("Util");
    import {Indicator} from 'mint-ui';
    const gData = require('zhixin').data;
    const team = require("./team.vue");
    const calendar = require("./calendar.vue");
    var TAB_TEAM = "1";
    var TAB_ME = "2";

    module.exports = {
        created: function () {
            this.init();
        },
        data: function () {
            return {
                //默认选中的tab页
                selected: TAB_TEAM,
                isShowCalendar: false
            }
        },
        methods: {
            init: function() {
                this.$watch("selected", function(newVal, oldVal) {
                    if(newVal == TAB_ME && this.isShowCalendar == false) {
                        this.isShowCalendar = true;
                    }
                });
            }
        },
        components: {
            'tab-team': team,
            'tab-calendar': calendar
        }
    };
</script>

<template>
    <div>
        <mt-navbar v-model="selected">
            <mt-tab-item id="1" class="tabLeft">团队考勤</mt-tab-item>
            <mt-tab-item id="2" class="tabRight">我的考勤</mt-tab-item>
        </mt-navbar>

        <mt-tab-container v-model="selected">
            <!-- 团队考勤 -->
            <mt-tab-container-item id="1">
                <tab-team></tab-team>
            </mt-tab-container-item>

            <!-- 我的考勤 -->
            <mt-tab-container-item id="2" v-if="isShowCalendar">
                <tab-calendar></tab-calendar>
            </mt-tab-container-item>
        </mt-tab-container>
    </div>
</template>

<style scoped>
    .mint-navbar {
        top: 0;
        right: 0;
        left: 0;
        position: fixed;
        z-index: 1;
        border-bottom: 1px #cccccc solid;
    }

    .mint-tab-container {
        margin-top: 55px;
    }

    .tabLeft {
        margin-left: 10px;
        margin-top: 10px;
        margin-bottom: 10px;
        height: 35px;
        background: #ffffff;
        color: #1DAAFC;
        border: 1px #1DAAFC solid;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
    }

    .tabLeft.is-selected {
        margin-left: 10px;
        margin-top: 10px;
        margin-bottom: 10px;
        height: 35px;
        background: #1DAAFC;
        color: #FFFFFF;
        border: 1px #1DAAFC solid;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
    }

    .tabRight {
        margin-right: 10px;
        margin-top: 10px;
        margin-bottom: 10px;
        height: 35px;
        background: #ffffff;
        color: #1DAAFC;
        border: 1px #1DAAFC solid;
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
    }

    .tabRight.is-selected {
        margin-right: 10px;
        margin-top: 10px;
        margin-bottom: 10px;
        height: 35px;
        background: #1DAAFC;
        color: #FFFFFF;
        border: 1px #1DAAFC solid;
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
    }

    .mint-navbar .mint-tab-item:last-child {
        border-right: 1px #1DAAFC solid;
    }
</style>