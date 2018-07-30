<template>
    <div>
        <mt-header fixed title="上报"/>
        <div class="mint-content soft-scrollable">
        <textarea class="default report-field bdr-t bdr-b"
                  v-model="reportText"
                  rows="6"
                  placeholder="请输入上报内容">
        </textarea>

            <div class="smallFont textGray media-tip gap bdr-t">长按可删除图片</div>
            <grid-view :columns="4"
                       :minGap="10">
                <img v-for="media in mediaList"
                     v-longclick="imageClickEvent(media)"
                     :src="media.src"/>
            </grid-view>
            <mt-cell class="gap" @click.native="selectAddress" :title="addressTitle" is-link></mt-cell>

            <mt-button class="report-btn" type="default" @click.native="report">上报</mt-button>
        </div>
    </div>
</template>
<style scoped>
    .gap {
        margin-top: 10px;
    }

    .grid {
        padding: 10px;
        background-color: white;
    }

    .grid img {
        margin-top: 10px;
    }

    .grid div {
        margin-top: 10px;
        background-position: center center;
        background-size: cover;
        background-repeat: no-repeat;
    }

    .report-btn {
        width: 90%;
        margin-top: 25px;
        margin-left: 5%;
        margin-bottom: 20px;
    }

    .media-tip {
        padding: 10px 10px 0 10px;
        background-color: white;
    }
</style>
<script>
    import {Indicator, MessageBox, Toast} from 'mint-ui';
    import Util from 'Util'
    import http from 'Http'

    const MEDIA_TYPE_ADD = 0;
    const MEDIA_TYPE_PIC = 1;

    import GridView from '../../libs/widget/GridView.vue'
    function defaultData() {
        return {
            reportText: '',
            mediaList: [{
                type: MEDIA_TYPE_ADD,
                src: require('../image/icon_add_media.png')
            }],
            selectedPosition: null,
            wxMediaId: null
        }
    }
    export default{
        data(){
            return defaultData()
        },
        components: {
            'grid-view': GridView
        },
        computed: {
            addressTitle() {
                return this.selectedPosition ? this.selectedPosition.address : '选择位置'
            },
            srcList() {
                let re = []
                this.mediaList.map(item => {
                    if (item.type != MEDIA_TYPE_ADD) {
                        re.push(item.src)
                    }
                })
                return re
            }
        },
        methods: {
            report() {
                if (!this.wxMediaId) {
                    return
                }
                var self = this
                wx.uploadImage({
                    localId: this.wxMediaId, // 需要上传的图片的本地ID，由chooseImage接口获得
                    isShowProgressTips: 1, // 默认为1，显示进度提示
                    success: function (res) {
                        var serverId = res.serverId; // 返回图片的服务器端ID
                        Toast('上传成功')
                    }
                });

            },
            onMediaClick(media) {
                if (media.type == MEDIA_TYPE_ADD) {
                    this.addMedia()
                } else {
//                    this.$router.push({
//                        name: 'gallery'
//                    })
                    this.previewImage(media)
                }
            },
            removeMedia(media) {
                MessageBox.confirm('确定删除？').then(action => {
                    Util.removeItemFromList(this.mediaList, item => {
                        return item == media
                    })
                }, Util.FunStub)
            },
            imageClickEvent(item, el) {
                let self = this
                return {
                    item: item.name,
                    longClick() {
                        self.removeMedia(item)
                    },
                    click() {
                        self.onMediaClick(item)
                    }
                }
            },
            previewImage(media) {
                wx.previewImage({
                    current: media.src, // 当前显示图片的http链接
                    urls: this.srcList // 需要预览的图片http链接列表
                });
            },
            addMedia() {
                let self = this
                wx.chooseImage({
                    count: 1, // 默认9
                    sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                    sourceType: ['album', 'camera'],
                    success: res=> {
                        if (res.localIds) {
                            res.localIds.map(id=> {
                                self.wxMediaId = id
                                self.mediaList.splice(self.mediaList.length - 1, 0, {
                                    type: MEDIA_TYPE_PIC,
                                    src: id
                                })
                            })
                        }
                    },
                    fail: function (res) {
                    },
                    complete: function (res) {
                    },
                    cancel: function (res) {
                    }
                })
            },
            selectAddress() {
                this.$router.push({
                    name: 'selectAddress',
                    params: {
                        callback: position => {
                            this.selectedPosition = position
                        }
                    }
                })
            }
        }
    }
</script>
