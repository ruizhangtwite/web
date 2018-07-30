<template>
    <div class="mint-content">
        <mt-header fixed title="综合评价"></mt-header>
        <div v-for="group in groups">
            <div class="groupTitle">{{group.name}}</div>
            <div v-for="item in group.child" class="childDiv">
                <div class="childTitle row" @click="goChild(group, item)">
                    <span class="col col-center">{{item.name}}</span>
                    <i class="icon-angle-right icon-1x ic-gray col-center"></i>
                </div>
                <div class="row">
                    <div @click="goChildItem(group, item, index)"
                         v-for="(type, index) in dateTypeList"
                         class="col childItemDiv">{{type}}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .mint-content {
        background-color: white;
        padding: 10px;
    }

    .groupTitle {
        font-size: 20px;
        color: #666666;
        padding: 10px 0;
        border-bottom: 1px solid #FF83FA;
    }

    .childDiv {
        margin-top: 5px;
    }

    .childTitle {
        font-size: 16px;
        padding: 0 5px;
        height: 35px;
        color: #686868;
        border: 1px solid #eaeaea;
        border-bottom: none;
    }

    .childItemDiv {
        color: #777777;
        text-align: center;
        line-height: 50px;
        font-size: 13px;
        border: 1px solid #eaeaea;
        border-left: none;
    }

    .childItemDiv:first-child {
        border-left: 1px solid #eaeaea;
    }
</style>
<script>
    import http from 'Http'
    import {data as gData} from 'zhixin'
    import eJson from '../evaluation.json'
    import {bindNavBar} from 'egovanative'
    import {Indicator} from 'mint-ui'

    export default{
        data(){
            return {
                groups: [],
                dateTypeList: ['当日', '本周', '本月']
            }
        },
        methods: {
            initDataSource() {
                http.ajax({
                    functionName: "getQueryID_ZX",
                    params: {
                        humanID: gData.humanID,
                        startNum: 0,
                        endNum: 0
                    },
                    start: ()=> {
                        Indicator.open()
                    },
                    success: data => {
                        if (data && data.errorCode == 0) {
                            this.parseData(data)
                        }
                    },
                    error: function (error) {
                        alert(error)
                    },
                    finally: ()=> {
                        Indicator.close()
                    }
                });
            },
            parseData(resData) {
                let groups = eJson.category.group
                let strGroups = resData.errorDesc
                        && resData.errorDesc.split("_").reduce((result, item) => {
                            result[item] = item
                            return result
                        }, {}) || {};
                let queryIds = resData.dataList && JSON.parse(resData.dataList).reduce((result, item) => {
                            result[item.queryid] = item
                            return result
                        }, {}) || {};

                let i = groups.length
                while (i--) {
                    let g = groups[i];
                    //如果id是-1，该组一定显示
                    if (g.id == "-1") continue

                    if (!strGroups[g.id]) {
                        groups.splice(i, 1)
                        continue;
                    }

                    let j = g.child.length
                    while (j--) {
                        if (!queryIds[g.child[j].id]) {
                            g.child.splice(j, 1)
                        }
                    }
                    if (g.child.length == 0) {
                        groups.splice(i, 1)
                    }
                }

                this.groups = groups;
            },
            goChild (group, child) {
                this.$router.push({
                    name: "result",
                    params: {group: group, child: child}
                })
            },

            goChildItem(group, child, type) {
                this.$router.push({
                    name: "result",
                    params: {group: group, child: child, type: type}
                })
            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                if (vm.isNewPage(to)) {
                    vm.groups = []
                    vm.initDataSource()
                }
                bindNavBar('综合评价')
            })
        }
    }
</script>
