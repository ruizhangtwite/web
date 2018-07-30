<template>
    <div id='versionUpdate'>
        <mt-loadmore  ref="loadmore" :top-method="getVersionInfo" :topPullText="topPullText" :topDropText="topDropText" :topLoadingText="topLoadingText">
            <div v-for="obj in dataList">
                <div @click="gotoDetail(obj.versionId, obj.versionName)" class="horizontalPadding">
                    <!--接收到信息时间-->
                    <div class="recTimeCon">
                        <div class="smallFont recTime">{{obj.createTime}}</div>
                    </div>
                    <!--信息显示-->
                    <div class="horizontalPadding bgWhite">
                        <!--标题栏-->
                        <div class="titleCon">
                            <span class="maxFont boldFont">{{obj.versionTitle}}</span>
                        </div>
                        <!--正文-->
                        <div>
                            <!--<img src="">-->
                            <img v-if="obj.picUrl" @load="onImgLoaded(this)" :src="baseUrl + obj.picUrl" width='100%'>
                            <div class="midFont description" v-html="replaceHh(obj.versionContent)"></div>
                        </div>
                    </div>
                </div>
            </div>
        </mt-loadmore>
    </div>
</template>
<style scoped>
    .bgWhite {
        background: #FFFFFF
    }

    .smallFont {
        font-size: 13px
    }

    .midFont {
        font-size: 16px
    }

    .maxFont {
        font-size: 18px
    }

    .boldFont {
        font-weight: bold
    }

    .horizontalPadding {
        padding-left: 12px;
        padding-right: 12px
    }

    .recTimeCon {
        height: 52px;
        width: 100%;
        text-align: center;
    }

    .recTime {
        display: inline-block;
        color: white;
        background: #C9C9C9;
        border-radius: 3px;
        margin-top: 14px;
        margin-bottom: 14px;
        height: 25px;
        line-height: 25px;
        padding: 0 11px;
    }

    .titleCon {
        padding-top: 22px;
        padding-bottom: 12px;
    }

    .description {
        color: #A0A09E;
        padding-top: 10px;
        padding-bottom: 10px;
    }

</style>
<script>
    import {Indicator} from 'mint-ui';
    import {Loadmore} from 'mint-ui';

    import http from 'Http';
    import util from 'Util';

    const pageSize = 2;

    export default{
        beforeRouteEnter(to, from, next) {
            next(function(vm) {
                if (vm.dataList.length == 0) {
                    vm.getVersionInfo();
                }
            });
        },
        data(){
            return {
                dataList: [],
                baseUrl: util.getServerUrl() + '/',
                topPullText: '下拉加载历史更新',
                topDropText: '释放显示',
                topLoadingText: '加载中...',
                isFirst: true,                           //true表示刚进入页面，获取数据后自动滚动到底部
                imgCount: 0,                             //记录当前加载完成的图片数量，因为有时候图片加载慢，会导致updated之后并没有滚动到最下面。
                hasMore: true                            //表示是否全部加载完
            }
        },

        methods: {
            gotoDetail(versionId, versionName) {
                this.$router.push({
                    name: 'updateDetail',
                    params: {
                        versionId: versionId,
                        versionName: versionName
                    }
                })
            },
            getVersionInfo() {
                this.$refs.loadmore.onTopLoaded();

                if(!this.hasMore) {
                    return;
                }

                http.ajax({
                    functionName: "home/version/getappversionlist",
                    params: {startNum: this.dataList.length, count: pageSize},
                    success: (resultInfo) => {
                        if (resultInfo.success && resultInfo.data && resultInfo.data.list) {
                            if (resultInfo.data.list.length < 1) {
                                this.topPullText = '已全部加载完';
                                this.topDropText = '已全部加载完';
                                this.topLoadingText = '';
                                this.hasMore = false;
                            } else {
                                let list = resultInfo.data.list;
                                list.reverse();
                                this.dataList = list.concat(this.dataList);
                            }
                        } else {
                            alert("获取更新列表失败:" + resultInfo.message);
                        }
                    },
                    error: () => {
                        alert("获取更新信息错误");
                    }
                });
            },
            onImgLoaded() {
                this.imgCount++;
                if (this.imgCount<=pageSize) {
                    document.body.scrollTop = document.body.scrollHeight;
                }
            },
            replaceHh(value) {
                return value.replace(/\\n/g,"<br/>");
            }
        },

        updated() {
            if (this.isFirst) {
                let count = 0;
                let interval = setInterval(() => {
                    if (count > 3000) {
                        clearInterval(interval);
                        this.isFirst = false;
                    }
                    count++;
                    if (document.body.scrollHeight != document.body.clientHeight) {
                        document.body.scrollTop = document.body.scrollHeight;
                        if (document.body.scrollTop == document.body.scrollHeight-document.body.clientHeight) {
                            clearInterval(interval);
                            this.isFirst = false;
                        }
                    }
                }, 0);
            }
        }
    }
</script>
