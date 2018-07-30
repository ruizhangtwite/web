<template>
    <div>
        <mt-header fixed title="登记"/>
        <div class="mint-content">
            <mt-field label="手机号"
                      placeholder="请输入手机号"
                      type="tel"
                      v-model="phoneNum"
                      class="input-tel"></mt-field>
            <mt-button class="btn-confirm" type="default" @click.native="confirm">登记</mt-button>
        </div>
    </div>

</template>
<style scoped>
    .input-tel {
        margin-top: 20px;
    }

    .btn-confirm {
        width: 90%;
        margin: 25px 0 0 5%;
    }
</style>
<script>
    export default{
        data(){
            return {
                phoneNum: ''
            }
        },
        methods: {
            confirm() {

            }
        }
    }
</script>
