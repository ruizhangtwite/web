<template>
    <div class="commentCell">
        <div class="containar_info">
            <img class="headerImg" src="http://img0.utuku.china.com/640x0/news/20170419/9e07b1a2-d6a7-476f-990e-8daa4448cde2.jpg" />
            <div class='div_info'>
                <div class="a_name"><a style="font-size:15px;color:#323334;">郑华伟</a><a style="font-size:12px;color:#bfbfbf;">&nbsp;&nbsp;东城一区</a></div>
                <div class="a_otherInfo"><a style="font-size:12px;color:#bfbfbf;">2017-03-23 8:56 处理任务</a></div>
            </div>

            <div style="clear:both;"></div>
        </div>
        <div class="containar_content">
            <a class="a_content">[201707322303]关于 Masonry ，它内部根本没有捕获变量 self，进入block的是testButton，所以执行完毕后，block会被销毁，没有形成环。所以，没有引起循环依赖。</a>
        </div>
    </div>
</template>
<style scoped>
    .commentCell {
        padding: 15px;
        background-color: white;        
        width: 100%;
    }

    .containar_info {
        height: 40px;
        margin-left: 0px;
        margin-right: 0px;
    }

    .headerImg {
        border-radius:20px; 
        width: 40px;
        height: 40px;
        float: left;
    }

    .div_info {
        float: left;
        height: 40px;
        margin-left: 15px;
    }

    .a_name {
        height: 20px;
    }
    .a_otherInfo {
        height: 20px;
    }

    .containar_content {
        margin-top: 15px;
        margin-bottom: 15px;
    }

    .a_content {
        color:#323334;
        font-size: 15px;
        margin: 0px;
    }

</style>
<script>
export default {
    props: {
        data: {}
    },
    data() {
        return {
            showAll: false
        }
    },
    components: {

    },
    computed: {

    },

    methods: {

    },
}
</script>
