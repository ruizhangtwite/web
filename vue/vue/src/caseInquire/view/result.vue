<template>
    <div class="mint-content">
        <mt-header fixed title="查询结果" ></mt-header>
        <div    id="listContainer"
                v-infinite-scroll="loadMore"
                infinite-scroll-disabled="loading"
                infinite-scroll-distance="10">
            <div v-for="(item, index) in dataList" class="listContent" @click="taskDetail(item)">
                <div class="taskIdContainer">
                    <div class="indexBox">
                        <span class="index">{{index}}</span>
                    </div>
                    <span class="taskId">{{item.taskNum}}</span>
                </div>
                <div class="taskContainer">
                    <mt-cell class="taskContent" v-bind:title="item.descript" v-bind:label="item.subTypeID"></mt-cell>
                    <div class="position">{{item.distance}}</div>
                    <div class="startedDate">{{item.startedDate}}</div>
                </div>

            </div>
        </div>
    </div>
</template>
<style>
    #listContainer div{
        background-color: #fff;
    }
    .listContent{
        border-bottom: 1px solid #8F8F8F;
    }
    .indexBox{
        display: inline-block;
        width: 20px;
        text-align: left;
    }
    .index{
        color: #FF0000;
    }
    .taskId{
        color: #00afff;
    }
    .taskContainer{

    }
    .taskContent{

    }
    .position{
        padding:0 10px;
        color: #888;
        font-size: 14px;
    }
    .startedDate{
        color: #888;
        padding:0 10px;
        font-size: 14px;
    }

</style>
<script>
    import { Navbar, TabItem, Indicator, MessageBox, Toast, InfiniteScroll, Button, DatetimePicker} from 'mint-ui';
    import Util from 'Util'
    import dateUtil from 'DateUtil'
    import { data as gData } from 'zhixin'
    import http from 'Http'
    import sysConfig from 'sysConfig'
    import { bindNavBar } from 'egovanative'
    import { baseData, baseComputed, resolveHasMore, resolveResultData } from 'ListManager';
    import taskJson from "../result.json";


    function defaultData(){
        return {
            dataList:taskJson.data,
            loading:false,
            list:[1,2,3,4,3,5,5,6,7,1,23,3,5,13]
        }
    }

    export default{
        data(){
            return defaultData();
        },
        computed:{},
        methods:{
            init(){

            },
            loadMore() {
                this.loading = true;
                setTimeout(() => {
                    let last = this.list[this.list.length - 1];
                    for (let i = 1; i <= 10; i++) {
                        this.list.push(last + i);
                    }
                    this.loading = false;
                }, 2500);
            },
            taskDetail(taskInfo){
                alert(taskInfo);
            }
        },
        components:{},
        beforeRouteEnter(to,from,next){
            next(vm => {
                vm.init();
            })
        }
    }
</script>