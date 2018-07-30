<template>
    <div>
        <div class="sectionEmpty" v-show="isEmpty && !isLoading">
            没有数据
        </div>

        <div @click="clickItem(project)" class="projectItem" v-for="project in dataList">
            <div class="row itemContentRow">
                <div class="col col-center">{{project.projectName}}</div>
                <div class="col-center">{{project.projectStageName}}</div>
            </div>
            <div class="row itemContentRow childTitle">
                <div class="col col-center">
                    {{project.regionName_1}} {{project.regionName_2}} {{project.regionName_3}}
                </div>
                <i class="col-center icon-ok" v-show="selectProjects[project.projectId]"></i>
            </div>
            <div class="itemContentRow childTitle flex">负责人 {{project.saleDirectorName}}</div>
        </div>
        <div class="flex center-child center-content" v-show="isLoading" style="padding:10px 0;">
            <i class="icon-spinner icon-spin textGray"></i>
        </div>
    </div>
</template>
<style scoped>

    .projectItem {
        background: white;
        padding: 5px;
        border-bottom: solid #dddddd 1px;
    }

    .projectItem .col {
        padding: 0;
    }

    .row + .row {
        margin: 0;
    }

    .itemContentRow, .itemContentRow.row {
        padding: 0 5px;
        height: 28px;
        align-items: center;
    }

    .childTitle {
        color: #999c9f;
    }
</style>
<script>

    import {Indicator} from 'mint-ui';
    import {Toast} from 'mint-ui';
    import {MessageBox} from 'mint-ui';

    const gData = require('zhixin').data;
    const http = require('Http');
    const sysConfig = require('sysConfig');
    const Util = require('Util');
    export default{
        data(){
            return {
                dataList: [],
                isLoading: false
            }
        },
        props: {
            selectProjects: {},
            clickItem: Function,
            searchText: String,
        },
        methods: {
            loadData(isRefresh) {
                if (isRefresh) {
                    Util.clearList(this.dataList);
                }
                this.isLoading = true

                http.ajax({
                    functionName: "/home/salelog/getprojectbyname",
                    params: {
                        projectName: this.searchText
                    },
                    success: (data) => {
                        if (data.success) {
                            this.dataList = data.data && data.data.projectList || []
                        }
                    },
                    error(data) {
                        console.log("加载列表错误：" + data);
                    },
                    finally: () => {
                        this.isLoading = false
                    }
                });
            },
        },
        components: {},
        computed: {
            isEmpty() {
                return !this.isLoading && this.dataList.length == 0
            }
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
