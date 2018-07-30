<template>
    <div class="detailHeader">
        <div class="a_title">
            <a>暴露垃圾</a>
        </div>
    
        <div class="a_subtitle">
            <a>监督员上报 </a><a>0.5分</a>
            <a>截止日期2017-3-28</a>
        </div>
        <div class="a_content">
            针对文章中给的例子3，大家都提出了疑问，为何没有检测出循环引用？其实这个例子有点不好。因为这个ViewController的引用计数一出来就是6，因为它被其他很多对象引用着。当然它是强引用了student，因为student的retainCount值是2。ViewController释放的时候才会把student的值减一。针对这个例子3，我重新抽取出中间的模型，重新举一个例子。
        </div>
    
        <div class="containar_medias">
            <img class="media_css" :style="{'width':mediaGap.width,'height':mediaGap.width}" src="../image/process.png" />
            <img class="media_css" :style="{'width':mediaGap.width,'height':mediaGap.width}" src="../image/process1.png" />
            <img class="media_css" :style="{'width':mediaGap.width,'height':mediaGap.width}" src="../image/process2.png" />
        </div>

        <div class="clean_div"></div>
    
        <div class="containar_guize">
            <div class="guize_title"><a>暴露垃圾处理规则</a></div>
    
            <div class='guize_content'>
                <div><a>分值</a> <a>0.5</a></div>
                <div><a>责任单位</a> <a>环卫</a></div>
                <div><a>时限</a> <a>4小时30分</a></div>
            </div>

            <div class="guize_content2">立案条件：暴露垃圾超过20平方厘米</div>
            <div class="guize_content2">结案条件：处理完毕，有前后照片对比</div>
        </div>

        <div class='containar_map' id="detail_map">

        </div>
    </div>
</template>
<style scoped>
.detailHeader {
    padding: 5px;
    background-color: white;
    width: 100%;
}

.a_title {
    margin-left: 15px;
    font-size: 18px;
    color: #323334;
    font-weight: bold;
}

.a_subtitle {
    margin-top: 10px;
    margin-left: 15px;
    font-size: 12px;
    color: #bfbfbf;
}

.a_content {
    margin-top: 15px;
    margin-left: 15px;
    margin-right: 15px;
    font-size: 15px;
    color: #323334;
}

.containar_medias {
    margin-top: 18px;
    margin-left: 5px;
    margin-right: 5px;
}

.media_css {
    float: left;
    margin-left: 5px;
}

.clean_div {
    clear: both;
}

.containar_guize {
    margin-top: 15px;
    margin-left: 15px;
    margin-right: 15px;
}

.guize_title {
    font-size: 15px;
    color: #323334;
    font-weight: bold;
}

.guize_content {
    margin-top: 10px;
    display: flex;
    flex-flow: row;
    font-size: 15px;
    color: #323334;
}

.guize_content2 {
    margin-top: 10px;
    font-size: 15px;
    color: #323334;
}

.containar_map {
    height:130px;
    margin-left:15px;
    margin-right:15px;
    margin-top:15px;
    margin-bottom:10px;
}
</style>
<script>
    require('baiduMap');

export default {
    props: {
        data: Array,
        selectedIndex: Array,
        toggleMode: false,
    },
    data() {
        return {
            map: null,
            showAll: false
        }
    },
    components: {

    },
    computed: {
        mediaGap() {
                let width = (window.innerWidth - 43)/3;
                return {width}
            }
    },

    mounted() {
        this.map = new BMap.Map('detail_map');
        let vue = this;
        new BMap.Geolocation().getCurrentPosition(function (r) {
                if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                    if (!vue.hasLocated) {
                        vue.map.centerAndZoom(r.point, 11)
                    } else {
                        vue.hasLocated = true
                    }
                }
            }, {enableHighAccuracy: true});
    },

    methods: {

    },
}
</script>
