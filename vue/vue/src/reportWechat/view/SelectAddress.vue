<template>
    <div>
        <mt-header fixed title="选择位置"/>
        <div class="mint-content">
            <div id="map"></div>
            <div class="panel row">
                <div class="col col-center">{{address}}</div>
                <mt-button class="confirm-btn" type="default"
                           @click.native="confirm">确定
                </mt-button>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .panel {
        padding: 10px;
        background-color: white;
        position: absolute;
        top: 0;
        z-index: 2;
    }

    #map {
        height: 100%;
    }

    .panel .confirm-btn {
        margin-left: 10px;
    }
</style>
<script>
    import Util from 'Util'
    import {Toast} from 'mint-ui'

    require('baiduMap');
    function defaultData() {
        return {
            hasLocated: false,
            selectedPosition: null
        }
    }
    export default{
        data(){
            return defaultData()
        },
        methods: {
            init() {
                Util.resetObject(this, defaultData())
            },
            confirm() {
                if (!this.selectedPosition) {
                    Toast('请选择位置')
                    return
                }
                Util.doCallback(this, this.selectedPosition)
                Util.goBack()
            }
        },
        computed: {
            address() {
                return this.selectedPosition ? this.selectedPosition.address : '请选择位置'
            }
        },
        mounted() {
            this.map = new BMap.Map('map')
            let vue = this
            new BMap.Geolocation().getCurrentPosition(function (r) {
                if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                    if (!vue.hasLocated) {
                        vue.map.centerAndZoom(r.point, 18)
                    } else {
                        vue.hasLocated = true
                    }
                }
            }, {enableHighAccuracy: true})
            this.map.addControl(new BMap.NavigationControl({
                anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
                type: BMAP_NAVIGATION_CONTROL_SMALL
            }));

            let geoc = new BMap.Geocoder()
            let marker = null

            this.map.addEventListener("click", function (e) {
                var pt = e.point;

                if (marker) {
                    vue.map.removeOverlay(marker);
                }
                marker = new BMap.Marker(pt);
                vue.map.addOverlay(marker);

                geoc.getLocation(pt, function (rs) {
                    var addComp = rs.addressComponents;

                    vue.selectedPosition = {
                        lat: pt.lat,
                        lng: pt.lng,
                        address: `${addComp.province} ${addComp.city} ${addComp.district} ${addComp.street} ${addComp.streetNumber}`
                    }
                })
            })
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                if (vm.isNewPage(to)) {
                    vm.init()
                }
            })
        }
    }
</script>
