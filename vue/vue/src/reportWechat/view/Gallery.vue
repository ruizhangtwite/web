<template>
    <div>
        <mt-header fixed/>
        <div class="mint-content">
            <slider :images="images"
                    :params="{minMoveDistance: 50, autoPlay: false}">
            </slider>
        </div>
    </div>
</template>
<style>

</style>
<script>
    import slider from '../../libs/widget/Slider.vue'
    export default{
        data () {
            return {
                images: [
                    "http://img.ishequ360.com/images/test/banner1@1x.jpeg",
                    "http://img.ishequ360.com/images/test/banner2@1x.jpeg",
                    "http://img.ishequ360.com/images/test/banner3@1x.jpeg",
                    "http://img.ishequ360.com/images/test/banner4@1x.jpeg",
                    "http://img.ishequ360.com/images/test/banner5@1x.jpeg",
                ]
            }
        },
        components: {
            slider
        }
    }
</script>
