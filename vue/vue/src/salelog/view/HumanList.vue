<template>
    <div>
        <mt-header fixed v-on:backClick="goBack" :title="title">
        </mt-header>
        <div class="mint-content soft-scrollable">
            <div v-for="human in humanList" class="bottomLine row" @click="goHumanSalelogPage(human)">
                <div class="col-center humanHeadPic" :style="human.css">
                    {{human.shortName}}
                </div>
                <div class="col col-center middleFont textGray">{{human.humanName}}</div>
            </div>
        </div>
    </div>
</template>

<script>
    import Util from 'Util'
    import {bindNavBar} from 'egovanative'

    module.exports = {
        data () {
            return {
                humanList: []
            }
        },
        methods: {
            goBack () {
                Util.goBack()
            },
            parseHumanList(humanList) {
                if (!humanList) {
                    return []
                }
                humanList.map(human => {
                    human.shortName = Util.getShortName(human.humanName)
                    human.css = {"background": human.photoColor}
                })
                return humanList
            },
            goHumanSalelogPage (human) {
                this.$router.push({
                    name: "humanSalelogList",
                    params: {humanID: human.humanID}
                })
            }
        },
        computed: {
            title() {
                return Util.formatTitle('人员列表', this.humanList.length)
            }
        },
        watch: {
            title(val) {
                bindNavBar(val)
            }
        },
        beforeRouteEnter (to, from, next) {
            next(vm => {
                if (from.name == 'home') {
                    try {
                        vm.humanList = vm.parseHumanList(vm.$route.params.humanList)
                        bindNavBar(vm.title)
                    } catch (e) {
                        Util.log(e)
                    }
                }
            })
        }
    }
</script>

<style scoped>
    .mint-content {
        background-color: white;
    }

    .humanHeadPic {
        width: 45px;
        height: 45px;
        border-radius: 45px;
        text-align: center;
        line-height: 45px;
        color: #fff;
        margin: 10px;
        background: #888888;
    }
</style>