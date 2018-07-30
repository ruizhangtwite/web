<template>
    <div>
        <div class="list-item middleFont bdr-b" v-for="item in dataList">
            <div class="row">
                <div class="checkTime">{{item.humanName}} {{item.checkTime}}</div>
            </div>
            <div class="row">
                <div class="textGray">城市：</div>
                <div>{{item.address}}</div>
            </div>
            <div class="row">
                <div class="textContent col" v-html="item.applyReason"></div>
            </div>

            <div class="row">
                <div class="col-center tag smallfont" :class="item.stateStyle">
                    {{item.applyStateText}}
                </div>
                <div class="col col-center smallfont replyInfo">({{item.replyInfo}})</div>
                <div class="verifyButton col-center" @click="deleteItem(item)"
                     v-show="item.showDeleteBtn">
                    删除
                </div>
                <div class="verifyButton col-center" @click="saveApply(item, true)"
                     v-show="item.showActionBtn">
                    通过
                </div>
                <div class="verifyButton col-center" @click="saveApply(item, false)"
                     v-show="item.showActionBtn">
                    不通过
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .replyInfo {
        margin-left: 10px;
    }
</style>
<script>
    import {Indicator, MessageBox, Toast} from 'mint-ui';
    import {baseData, baseComputed, resolveResultData} from '../TabManager';

    import Util from 'Util'
    import {data as gData} from 'zhixin'
    import http from 'Http'
    import sysConfig from 'sysConfig'

    export default{
        props: {
            dataList: Array
        },
        data() {
            return {}
        },
        components: {},
        methods: {
            saveApply(item, isAgree) {
                MessageBox.confirm(`确定${isAgree ? '通过' : '不通过'}？`).then(action => {
                    this.saveApplyImpl(item, isAgree)
                }, cancel => {
                })

            },
            saveApplyImpl(item, isAgree) {
                Indicator.open()
                http.ajax({
                    functionName: "mi/checkapply/savecheckreply",

                    params: {
                        replyOpinion: "",
                        agreeFlag: isAgree ? 1 : 0,
                        applyID: item.checkApplyID,
                        humanID: gData.humanID,
                    },
                    success: (data) => {
                        if (data.success) {
                            Util.removeItemFromList(this.dataList, (itemParam) => {
                                return itemParam == item
                            })
                            Util.refreshPluginCount()
                            Toast("操作成功")
                        } else {
                            Toast("操作失败:" + data.message)
                        }
                    },
                    error: function (data) {
                        Toast("操作错误：" + data)
                    },
                    finally: function () {
                        Indicator.close()
                    }
                })
            },
            deleteItem (item) {
                MessageBox.confirm('确定删除？').then(action => {
                    this.deleteImpl(item)
                }, cancel=> {
                })
            },
            deleteImpl (itemApply) {
                Indicator.open()
                http.ajax({
                    functionName: "mi/checkapply/deletecheckapply",
                    params: {
                        humanID: gData.humanID,
                        checkApplyID: itemApply.checkApplyID
                    },
                    success: (data) => {
                        if (data.success) {
                            Toast("删除成功")
                            Util.removeItemFromList(this.dataList, (itemParam) => {
                                return itemParam == itemApply
                            })
                            this.totalCount = this.dataList.length
                        } else {
                            Toast("删除失败:" + data.message)
                        }
                    },
                    error: function (data) {
                        Toast("删除错误：" + data)
                    },
                    finally: function () {
                        Indicator.close()
                    }
                })
            }
        }
    }
</script>
