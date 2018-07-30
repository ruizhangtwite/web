<template>
    <div>
        <mt-header fixed v-on:backClick="goBack">详情</mt-header>
        <div class="mint-content" style='top: 57px'>
            <div id="detailTitle">{{detailData.title}}</div>
            <div class="row">
                <div id="detailFrom" class="col">来源：{{detailData.from}}</div>
                <div id="detailCreateTime">{{detailData.createTime}}</div>
            </div>
            <div id="detailContent">{{detailData.content}}</div>
            <div id="detailMediaList">
                <div class="list">
                    <div class="item mediaListItem" v-for="media in detailData.mediaList"
                         @click="clickMediaListItem(media)">
                        {{media.mediaName}}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scope>

</style>
<script>
    import {Navbar, TabItem, Indicator, MessageBox, Toast} from 'mint-ui';
    import Util from 'Util'
    import {bindNavBar} from 'egovanative'
    import {data as gData} from 'zhixin'

    function defaultData() {
        return {
            detailData : null,
        }
    }

    export default{
        data(){
            return{
                ...defaultData(),
            }
        },

        methods:{
            goBack() {
                Util.goBack()
            },
            init() {
                Util.resetObject(this, defaultData());
                let params = this.$route.params;
                this.detailData = params && params.object;
            },
        },

        beforeRouteEnter(to, from, next) {
            next(vm => {
                vm.init()
                bindNavBar('详情')
            })
        }
    }
</script>