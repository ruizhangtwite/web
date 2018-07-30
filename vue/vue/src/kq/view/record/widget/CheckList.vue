<template>
    <div>
        <div v-for="item in dataList" class="bdr-b">
            <div class="smallFont textGray dateBanner bdr-b" v-show="item.showDateInfo">{{item.checkDate}}</div>
            <div class="list-item">
                <div class="row">
                    {{item.checkTimeText}}
                    <div class="col col-center">
                        <span v-for="tag in item.tagList" :style="{'background-color': tag.color}" class="rtag">{{tag.name}}</span>
                    </div>
                    <span class="textGray col-center">{{item.clientType}}</span>
                </div>
                <div class="checkRemark">{{item.remark}}</div>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .dateBanner {
        padding: 0 15px;
        height: 24px;
        line-height: 24px;
    }

    .list-item {
        padding: 10px;
    }

    .list-item .row {
        padding: 0;
    }

    .rtag {
        margin-left: 5px;
    }

    .checkRemark {
        margin-top: 10px;
    }
</style>
<script>
    export default{
        props: {
            dataList: Array
        }
    }
</script>
