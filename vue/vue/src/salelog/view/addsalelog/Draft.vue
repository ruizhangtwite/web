<template>
    <div>
        <mt-header fixed v-on:backClick="goBack" :title="title">
        </mt-header>
        <div class="mint-content scrollable">
            <div class="sectionEmpty" v-if="salelogList.length == 0">
                没有草稿
            </div>
            <div class="slItem row" @click="onItemClick(item)" v-else v-for="item in salelogList">
                <div class="col col-center salelogWrapper">
                    <div class="saveTime">{{getSaveTime(item)}}</div>
                    <div class="slContent" v-html="item.logContent"></div>
                </div>
                <mt-button class="col-center btnDelete" @click.native.stop="deleteItem(item)">删除</mt-button>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .slItem.row {
        padding: 10px;
        border-bottom: solid 1px #dddddd;
        background-color: white;
        margin-top: 0;
    }

    .slItem .col {
        padding: 0;
    }

    .salelogWrapper {
        margin-right: 10px;
    }

    .saveTime {
        padding-bottom: 5px;
        padding-top: 10px;
        font-size: 14px;
        color: #5a5a5a;
    }

    .slProject, .slStage, .slContent {
        padding: 5px 0;
        font-size: 16px;
    }

    .slContent {
        white-space: pre-line;
        word-break: break-all;
    }

    .sectionEmpty {
        padding: 20px 0;
        text-align: center;
        color: #555555;
    }

    .btnDelete {
        height: 30px;
    }
</style>
<script>
    import {Toast} from 'mint-ui';
    import {MessageBox} from 'mint-ui';
    const Util = require('Util');

    const draft = require('./draft');
    const DateUtil = require('DateUtil');
    const {bindNavBar} = require('egovanative');

    module.exports = {
        data() {
            return {
                salelogList: [],
            }
        },
        methods: {
            goBack() {
                this.$router.go(-1);
            },
            loadList() {
                this.salelogList = draft.getTemplateList();
            },
            deleteItem(item) {
                MessageBox.confirm('确定删除该条草稿？').then(action => {
                    var result = draft.deleteTemplate(item.tempInfo.id);
                    if (result) {
                        Toast("删除成功");
                        this.loadList();
                    } else {
                        Toast("删除失败");
                    }
                }, cancel=> {
                });

            },
            getSaveTime(item) {
                var time = item.tempInfo.id;
                return DateUtil.formatDate(time, DateUtil.FORMAT_YMDHM);
            },
            onItemClick(item) {
                var params = this.$route.params;
                if (params && params.callback) {
                    params.callback(item);
                    this.goBack();
                }
            },
            bindNavBarImpl() {
                bindNavBar(this.title);
            }
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                vm.loadList();
                vm.bindNavBarImpl();
            })
        },

        computed: {
            title() {
                var size = this.salelogList.length;
                return Util.formatTitle("草稿箱", size);
            }
        },
        watch: {
            title() {
                this.bindNavBarImpl();
            }
        }
    }
</script>
