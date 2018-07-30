<template>
    <div>
        <mt-header fixed v-on:backClick="goBack" title="关注人员">
            <mt-button slot="right" @click.native="saveFocus">{{saveBtnText}}</mt-button>
        </mt-header>
        <div class="searchWrapper flex center-child bdr-b">
            <input v-model="searchText" class="searchInput" placeholder="输入姓名进行搜索">
            <i class="icon-remove clearBtn" @click="clearSearch"></i>
            <i class="icon-search searchIcon"></i>
        </div>
        <div id="focusPath" class="bdr-b row center-child" v-show="!searchText">
            <div class="col-center focusPathItem"
                 v-for="(human, index) in pathList"
                 @click="clickPathItem(human)">
                {{getPathName(index)}}
            </div>
        </div>
        <div style="position: absolute; width: 100%; top: 102px; bottom:48px"
             class="mint-content soft-scrollable"
             v-show="!searchText">
            <div v-for="human in dataList" class="bottomLine row center-child">
                <div class="col col-center flex center-child" @click="clickHumanItem(human)">
                    <div class="col-center focusHumanHeadPic" :style="human.css">
                        {{human.shortName}}
                    </div>
                    <div class="col col-center focusHumanName">{{human.humanName}}</div>
                    <i class="col-center icon-ok iconSelect" v-show="concernObj[human.humanID]"></i>
                </div>
                <div class="col-center juniorNum flex center-child center-content"
                     v-show="human.juniorAllNum > 0"
                     @click="goJuniorHumanList(human)">
                    {{human.juniorAllNum}}
                </div>
            </div>
        </div>
        <search-list style="position: absolute; width: 100%; top: 50px; bottom:48px"
                     class="mint-content soft-scrollable"
                     v-show="searchText"
                     :searchText="searchText"
                     :selectHumans="concernObj"
                     :clickItem="clickHumanItem">
        </search-list>
    </div>
</template>

<script>
    import {Indicator} from 'mint-ui';
    import {Toast} from 'mint-ui';
    const gData = require('zhixin').data;
    const http = require('Http');
    const Util = require('Util');
    const {bindNavBar} = require('egovanative');
    const sysConfig = require('sysConfig');

    function defaultData() {
        return {
            pathList: [{humanID: gData.humanID, humanName: '全部'}],
            idToList: {},
            dataList: [],
            concernObj: {},
            contentStyle: `top:${(50 + Util.getHeaderHeight())}px`,
            searchText: '',
        };
    }

    module.exports = {
        data () {
            return defaultData();
        },
        methods: {
            goBack () {
                this.$router.go(-1);
            },
            saveFocus () {
                Indicator.open();
                http.ajax({
                    functionName: "home/genericservice/human/saveconcernlist",
                    params: {
                        humanID: gData.humanID,
                        concernTypeID: 1,
                        concernObjs: this.getFocusHumanIDs()
                    },
                    success: (resultInfo) => {
                        if (resultInfo && resultInfo.success) {
                            Toast("保存关注成功");
                            Util.doCallback(this);
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
            fetchJuniorData() {
                var lastPathHuman = this.pathList[this.pathList.length - 1];

                if (this.idToList[lastPathHuman.humanID]) {
                    this.dataList = this.idToList[lastPathHuman.humanID];
                } else {
                    Indicator.open();
                    http.ajax({
                        functionName: "home/genericservice/human/getconernhumanlist",
                        params: {
                            loginHumanID: gData.humanID,
                            humanID: lastPathHuman.humanID
                        },
                        success: resultInfo => {
                            if (resultInfo && resultInfo.success) {
                                if (lastPathHuman.humanID == gData.humanID) {
                                    resultInfo.data.allConcernHumans.map(human => {
                                        this.$set(this.concernObj, human.humanID, true);
                                    });
                                }
                                var curSelectHuman = this.pathList[this.pathList.length - 1];
                                var parsedList = this.parseHumanList(resultInfo.data.subHumanList);
                                this.idToList[lastPathHuman.humanID] = parsedList;

                                if (curSelectHuman.humanID == lastPathHuman.humanID) {
                                    this.dataList = parsedList;
                                }

                            } else {
                                Toast("获取下级成员列表失败");
                            }
                        }, error: function (data) {
                            Toast("获取下级成员列表错误");
                        }, finally: function () {
                            Indicator.close();
                        }
                    });
                }
            },
            parseHumanList(humanList) {
                humanList && humanList.map(human => {
                    human.shortName = Util.getShortName(human.humanName);
                    human.css = sysConfig.getPhotoColorCss(human.humanID);
                })
                return humanList;
            },
            getFocusHumanIDs() {
                return Object.keys(this.concernObj).toString();
            },
            goJuniorHumanList(human) {
                this.pathList.push(human);
                this.fetchJuniorData();
            },
            clickHumanItem(human) {
                var id = human.humanID;
                if (this.isFocus(id)) {
                    this.$delete(this.concernObj, id);
                } else {
                    this.$set(this.concernObj, id, true);
                }
            },
            isFocus(humanID) {
                return this.concernObj[humanID];
            },
            clickPathItem (human) {
                for (var i = 0, len = this.pathList.length; i < len - 1; i++) {
                    var pathHuman = this.pathList[i];
                    if (human.humanID == pathHuman.humanID) {
                        this.pathList.splice(i + 1, len - i - 1);
                        this.fetchJuniorData();
                        break;
                    }
                }
            },
            getPathName(index) {
                var len = this.pathList.length;
                var human = this.pathList[index];
                if (index == len - 1) {
                    return human.humanName;
                } else {
                    return `${human.humanName} > `;
                }
            },
            bindNavBarImpl() {
                bindNavBar('关注人员', this.saveBtnText, () => {
                    this.saveFocus();
                })
            },
            initOnCreate() {
                Util.resetObject(this, defaultData());
                this.fetchJuniorData();
            },
            clearSearch() {
                this.searchText = '';
            }
        },
        computed: {
            saveBtnText() {
                var len = Object.keys(this.concernObj).length;
                return Util.formatTitle('保存', len);
            }
        },
        components: {
            'search-list': require('./SearchList.vue')
        },
        watched: {
            saveBtnText(val) {
                this.bindNavBarImpl();
            }
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                vm.initOnCreate();
                vm.bindNavBarImpl();
            })
        }
    }
</script>
<style>
    .focusHumanHeadPic {
        width: 44px;
        height: 44px;
        border-radius: 22px;
        color: #fff;
        margin: 10px;
        background: #888888;
        line-height: 44px;/*center vertical*/
        text-align: center;/*center horizontal*/
    }
</style>

<style scoped>
    .mint-content {
        background-color: white;
    }

    .row, .row + .row, .col {
        padding: 0;
        margin: 0;
    }


    #focusPath {
        width: 100%;
        font-size: 17px;
        background-color: white;
    }

    .focusPathItem {
        padding: 15px 0 15px 10px;
    }

    .iconSelect {
        margin-right: 10px;
        color: #999c9f;
    }

    .juniorNum {
        font-size: 16px;
        color: #555555;
        min-width: 50px;
        text-align: center;
        border-left: solid 1px #888888;
    }

    .focusHumanName {
        font-size: 16px;
        color: #555555;
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
</style>