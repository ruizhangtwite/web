<script>
    const http = require('Http');
    const sysConfig = require("sysConfig");
    const Util = require("Util");
    import {Indicator} from 'mint-ui';
    import {Toast} from 'mint-ui';
    const gData = require('zhixin').data;
    import {bindNavBar} from 'egovanative';
    const searchList = require('./searchJuniorList.vue');

    function defaultData() {
        return {
            //登陆人对象
            loginHuman: {humanID: gData.humanID, humanName: gData.humanName, isShowSelf: true},
            //人员路径列表
            humanPathList: [{humanID: gData.humanID, name: gData.humanName, humanName: gData.humanName}],
            //下级成员Map
            juniorHumanMap: {},
            //当前列表中的下级成员列表
            juniorHumanList: [],
            //选择的人员
            selectHumans: {},//{id:human, id:human}
            isConcernMode: true,
            selectCountLimit: -1,//-1 ： 选择多个无上限
            isInSearchMode: false,
            searchText: ''
        }
    }

    module.exports = {
        data: function () {
            return defaultData();
        },
        methods: {
            init() {
                var params = this.$route.params;
                if (params) {
                    if (params.selectHumans) {
                        params.selectHumans.map(human => {
                            this.selectHuman(human);
                        });
                    }
                    this.isConcernMode = params.isConcernMode;
                    this.selectCountLimit = params.count ? params.count : -1;
                    if (this.isConcernMode) {
                        this.selectCountLimit = -1;
                    }
                }

                //获取下级成员列表
                this.startGetJuniorHumanListTask();
            },
            getConcernHumanIDs() {
                return Object.keys(this.selectHumans).toString();
            },

            selectCount() {
                return Object.keys(this.selectHumans).length;
            },

            selectHuman(human) {
                var id = typeof human == 'object' ? human.humanID : human
                this.$set(this.selectHumans, id, human);
            },

            unSelectHuman(human) {
                var id = typeof human == 'object' ? human.humanID : human
                this.$delete(this.selectHumans, id);
            },

            parseResult(data) {
                var allList = [];
                data.unitList && data.unitList.map(unit => {
                    unit.isUnit = true;
                    unit.id = unit.unitID;
                    unit.name = unit.unitName;
                    allList.push(unit);
                })
                data.list && data.list.map(human => {
                    allList.push(this.fillHuman(human));
                })
                if (data.concernList && this.isConcernMode) {
                    this.selectHumans = {};
                    data.concernList.map(id => {
                        this.selectHuman(id);
                    })
                }
                return allList;
            },
            fillHuman(human) {
                human.shortName = sysConfig.getShortName(human.humanName);
                human.css = sysConfig.getPhotoColorCss(human.humanID);
                human.id = human.humanID;
                human.name = human.humanName;
                return human;
            },
            buildLastPathKey() {
                var len = this.humanPathList.length;
                return len <= 1 ? gData.humanID + '_root' : this.humanPathList[len - 1].unitID + "";
            },
            startGetJuniorHumanListTask: function () {
                var key = this.buildLastPathKey();
                if (this.juniorHumanList = this.juniorHumanMap[key]) {
                    return;
                }

                var requestParams = {
                    start: () => {
                        Indicator.open();
                    },
                    success: (data) => {
                        if (data && data.success && data.data) {
                            var resultList = this.parseResult(data.data);
                            if (key.indexOf("root") >= 0 && !this.isConcernMode) {
                                resultList.push(this.fillHuman(this.humanPathList[0]))
                            }
                            this.juniorHumanMap[key] = resultList;
                            if (key == this.buildLastPathKey()) {
                                this.juniorHumanList = resultList;
                            }
                        }
                    }, finally: () => {
                        Indicator.close();
                    }
                }

                var lastItem = this.humanPathList[this.humanPathList.length - 1];
                if (!lastItem || !lastItem.isUnit) {
                    requestParams.params = {
                        humanID: gData.humanID,
                    };
                    requestParams.functionName = "mi/kq/common/getHumanListByKqRight";
                } else {
                    requestParams.params = {
                        unitID: lastItem.unitID,
                    };
                    requestParams.functionName = "mi/common/getHumanUnitListUnitID";
                }

                http.ajax(requestParams);
            },

            saveFocus () {
                Indicator.open();
                http.ajax({
                    functionName: "home/genericservice/human/saveconcernlist",
                    params: {
                        humanID: gData.humanID,
                        concernTypeID: sysConfig.concernType.KQ_HUMAN,
                        concernObjs: this.getConcernHumanIDs()
                    },
                    success: (resultInfo) => {
                        if (resultInfo && resultInfo.success) {
                            Toast("保存关注成功");
                            if (this.$route.params.callback) {
                                this.$route.params.callback();
                            }
                            Util.goBack();
                        } else {
                            Toast("保存关注失败");
                        }
                    }, error: function (data) {
                        Toast("保存关注错误");
                    }, finally: function () {
                        Indicator.close();
                    }
                });
            },

            clickPathItem: function (human) {
                for (var i = 0; i < this.humanPathList.length - 1; i++) {
                    var pathHuman = this.humanPathList[i];
                    if (human.humanID == pathHuman.humanID) {
                        this.humanPathList.splice(i + 1, this.humanPathList.length - i - 1);
                        this.startGetJuniorHumanListTask();
                    }
                }
            },

            clickHumanItem: function (human) {
                if (human.isUnit) {
                    this.goJuniorHumanList(human);
                    return;
                }

                if (this.hasSelect(human.humanID)) {
                    this.unSelectHuman(human);
                    return;
                } else if (human.humanID == gData.humanID && this.isConcernMode) {
                    Toast("不能关注自己")
                    return;
                } else if (this.selectCountLimit == 1) {
                    this.selectHumans = {};
                    this.selectHuman(human);
                    return;
                }

                var count = this.selectCount() + (!this.hasSelect(human.humanID) ? 1 : 0);
                if (this.selectCountLimit >= 0 && this.selectCountLimit < count) {
                    Toast(`最多只能选择${this.selectCountLimit}个人`);
                    return;
                }

                this.selectHuman(human);
            },

            confirm() {
                if (this.isConcernMode) {
                    return this.saveFocus();
                }

                if (this.$route.params.callback) {
                    this.$route.params.callback(
                            Object.keys(this.selectHumans).map(key => {
                                return this.selectHumans[key]
                            }));
                }
                Util.goBack();
            },

            hasSelect(humanID) {
                return this.selectHumans[humanID] != null;
            },

            goJuniorHumanList: function (human) {
                this.humanPathList = this.humanPathList.concat(human);
                this.startGetJuniorHumanListTask();
            },

            clearSearch() {
                this.searchText = '';
            }
        },
        computed: {
            confirmText() {
                if (this.isConcernMode) {
                    return Util.formatTitle('关注', this.selectCount());
                } else {
                    return Util.formatTitle('确定', this.selectCount());
                }
            }
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                bindNavBar('选择人员');
                Util.resetObject(vm, defaultData());
                vm.init();
            });
        },
        components: {
            'search-list': searchList
        }
    };
</script>

<template>
    <div>
        <div class="searchWrapper flex center-child bdr-b">
            <input v-model="searchText" class="searchInput" placeholder="输入姓名进行搜索">
            <i class="icon-remove clearBtn" @click="clearSearch"></i>
            <i class="icon-search searchIcon"></i>
        </div>
        <div id="focusPath" class="textBlue bdr-b" direction="x"
             style="overflow-x: auto;overflow-y: hidden;"
             delegate-handle="pathScroll" v-show="!searchText">
            <div id="focusPathContent" class="row">
                <div class="col-center focusPathItem" v-for="(human, index) in humanPathList"
                     @click="clickPathItem(human)">
                    <div class="row">
                        <div class="col-center focusPathItemName">{{human.name}}</div>
                        <div id="focusArrow" class="col-center icon-angle-right"
                             v-show="index < humanPathList.length - 1"></div>
                    </div>
                </div>
            </div>
        </div>
        <div style="position: absolute; width: 100%; top: 102px; bottom:48px" class="mint-content soft-scrollable"
             v-show="!searchText">
            <div class="list">
                <div v-for="human in juniorHumanList" class="bdr-b">
                    <div class="row" @click="clickHumanItem(human)">
                        <div class="col col-center">
                            <div class="row">
                                <div class="col-center focusHumanHeadPic"
                                     v-if="!human.isUnit"
                                     :style="human.css">
                                    {{human.shortName}}
                                </div>
                                <div class="col-center focusHumanGroupPic"
                                     v-else>
                                </div>
                                <div class="col col-center">
                                    <div class="row">
                                        <div class="col col-center focusHumanName">
                                            {{human.name}}
                                        </div>
                                        <div class="col-center focusSelect iconUnCheck"
                                             v-show="!human.isUnit"
                                             :class="{iconCheck : selectHumans[human.humanID]}">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-center" v-show="human.isUnit">
                            <div class="col-center  icon-angle-right focusJuniorArrow"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <search-list style="position: absolute; width: 100%; top: 50px; bottom:48px"
                     class="mint-content soft-scrollable"
                     v-show="searchText"
                     :searchText="searchText"
                     :selectHumans="selectHumans"
                     :clickItem="clickHumanItem">
        </search-list>

        <div class="bottomSection bdr-t flex center-child center-content" @click="confirm">
            {{confirmText}}
        </div>
    </div>
</template>
<style>
    .focusHumanHeadPic {
        width: 45px;
        height: 45px;
        border-radius: 45px;
        text-align: center;
        color: #fff;
        padding-top: 13px;
        margin: 10px;
        background: #888888;
    }

    .focusSelect {
        height: 15px;
        width: 15px;
        margin-right: 10px;
    }

    .focusHumanName {
        font-size: 16px;
        color: #555555;
    }
</style>
<style scoped>
    .row, .col {
        padding: 0;
        margin: 0;
    }

    .list {
        background-color: white;
    }

    .list div {
        z-index: 0;
    }

    .searchInput {
        width: 100%;
        height: 32px;
        padding-left: 30px;
        outline: transparent;
        border: 1px #DFDFDF solid;
        border-radius: 4px;
        background-color: #F2F2F2;
        display: block;
        font-size: 13px;
    }

    .searchWrapper {
        position: relative;
        height: 50px;
        padding: 0 15px;
        background-color: white;
    }

    .searchIcon {
        color: rgb(217, 217, 217);
        position: absolute;
        left: 15px;
        top: 6px;
        padding: 10px;
    }

    .clearBtn {
        color: rgb(217, 217, 217);
        position: absolute;
        right: 15px;
        top: 6px;
        padding: 10px;
    }

    .item {
        border: 1px #cccccc solid;
        padding: 0;
    }

    .item + .item {
        margin-top: -1px;
    }

    #focusPath {
        width: 100%;
        font-size: 17px;
        background-color: white;
    }

    .focusPathItem {
        padding-top: 15px;
        padding-bottom: 15px;
    }

    .focusPathItemName {
        padding-left: 10px;
        padding-right: 10px;
    }

    #focusSave {
        font-size: 18px;
        padding: 10px;
    }

    .focusHumanGroupPic {
        background: url("../../image/icon_group.png");
        width: 45px;
        height: 45px;
        margin: 10px;
        -webkit-background-size: 100% 100%;
        background-size: 100% 100%;
    }

    .focusLeftLine {
        border-left: solid 1px #888888;
    }

    .focusJuniorNum {
        padding: 5px 5px 5px 5px;
        font-size: 16px;
        color: #555555;
        min-width: 55px;
        text-align: center;
    }

    .focusJuniorArrow {
        font-size: 22px;
        color: #888888;
        padding-right: 10px;
    }

    .focusBottomLine {
        border-bottom: solid 1px #dddddd;
    }

    #focusPathContent {
        height: 52px;
        width: max-content;
        width: -webkit-max-content;
    }

    .juniorUnitItem {
        padding-left: 10px;
        padding-top: 10px;
        padding-bottom: 10px;
        color: #555555;
    }

    .juniorUnitName {
        font-size: 16px;
    }
</style>