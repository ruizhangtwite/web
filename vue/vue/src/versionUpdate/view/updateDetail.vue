<template>
    <!--外围容器-->
    <div class="container">
        <div class="title">智信{{versionName}}版本功能介绍
        </div>
        <div class="content">
            <ol>
                <li v-for="obj in data"><span class="sTitle">{{obj.detailTitle}}</span>
                    <div class="sContent">
                        <div class="desc" v-html="replaceHh(obj.detailContent)"></div>
                        <div class="imgCon">
                            <img v-for="url in obj.picUrl" :src="baseUrl + url" width="49%" class="imgStyle">
                        </div>
                    </div>
                </li>
            </ol>
        </div>
    </div>
</template>
<style scoped>
    .container {
        padding-left: 10px;
        padding-right: 10px;
        background-color: transparent;
    }

    .title {
        font-size: 16px;
        font-weight: bold;
        padding-top: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid #CECFE3;
    }

    .sTitle {
        font-size: 15px;
        font-weight: bold;
    }

    .desc {
        font-size: 15px;
        margin-top: 8px;
        margin-bottom: 8px;
        white-space: pre-line;
    }

    .content ol {
        -webkit-padding-start: 23px;
    }

    .content ol li {
        margin-top: 15px;
    }

    .imgCon {
        text-align: center;
    }

    .imgStyle {
        margin-right: 2px;
    }
</style>
<script>
    import {Indicator} from 'mint-ui';
    import http from 'Http';
    import util from 'Util';

    export default{
        beforeRouteEnter(to, from, next) {
            next(function (vm) {
                vm.init();
            });
        },

        data(){
            return {
                data: [],
                versionId: 0,
                versionName: '',
                baseUrl: util.getServerUrl() + '/'
            }
        },
        methods: {
            init() {
                this.data = [];

                if (this.$route.params.versionId == null) {
                    return;
                }
                if (this.$route.params.versionName != null) {
                    this.versionName = this.$route.params.versionName;
                }

                this.versionId = this.$route.params.versionId;

                Indicator.open();

                http.ajax({
                    functionName: "home/version/getdetailbyversionid",
                    params: {companyID: 46, versionID: this.versionId},
                    success: (resultInfo) => {
                        if (resultInfo && resultInfo.success && resultInfo.data && resultInfo.data.appVersionDetail) {
                            let list = resultInfo.data.appVersionDetail;
                            for (let i = 0; i < list.length; ++i) {
                                let picUrls = [];
                                if (list[i].picUrl && list[i].picUrl != '') {
                                    picUrls = list[i].picUrl.split(',');
                                }
                                list[i].picUrl = picUrls;
                                this.data.push(list[i]);
                            }
                        } else {
                            alert("获取更新详情失败:" + resultInfo.message);
                            history.go(-1);
                        }
                    },
                    error: () => {
                        alert("获取更新详情错误");
                        history.go(-1);
                    },
                    finally: () => {
                        Indicator.close();
                    }
                });
            },
            replaceHh(value) {
                return value.replace(/\\n/g,"<br/>");
            }
        },

        activated() {
            document.body.scrollTop = 0;
        }
    }
</script>
