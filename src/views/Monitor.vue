<template>
	<div id="wrap">
		<div id="monitorApp"></div>
		<div class="button-group">
			<button class="top" @click="control(0)"></button>
			<button class="bottom" @click="control(1)"></button>
			<button class="left" @click="control(2)"></button>
			<button class="right" @click="control(3)"></button>
		</div>
		<div class="button-group-status">
			<button @click="deviceAlarmPlan()">获取动检计划</button>
			<!-- <button @click="getAlarmMessage()">查询动检信息</button> -->
		</div>
		<div class="button-group-status">
			动检开关：
			<el-switch
			  v-model="alarmStatus"
			  active-color="#13ce66"
			  inactive-color="#ff4949"
			  @change="modifyDeviceAlarmStatus($event)">
			</el-switch>
		</div>
		<div class="button-group-status" v-show="alarmStatus">
			<!-- <button @click="setDeviceCameraStatus('closeCamera', true)">隐私遮罩：开</button>
			<button @click="setDeviceCameraStatus('closeCamera', false)">隐私遮罩：关</button> -->
			隐私遮罩：
			<el-switch
			  v-model="closeCameraStatus"
			  active-color="#13ce66"
			  inactive-color="#ff4949"
			  @change="setDeviceCameraStatus('closeCamera', $event)">
			</el-switch>
		</div>
		<div class="button-group-status" v-show="alarmStatus">
			<!-- <button @click="setDeviceCameraStatus('smartTrack', true)">智能追踪：开</button>
			<button @click="setDeviceCameraStatus('smartTrack', false)">智能追踪：关</button> -->
			智能追踪：
			<el-switch
			  v-model="smartTrackStatus"
			  active-color="#13ce66"
			  inactive-color="#ff4949"
			  @change="setDeviceCameraStatus('smartTrack', $event)">
			</el-switch>
		</div>
		<!-- <div class="button-group-status" v-show="alarmStatus">
			<button @click="setDeviceCameraStatus('smartLocate', true)">听声变位：开</button>
			<button @click="setDeviceCameraStatus('smartLocate', false)">听声变位：关</button>
		</div> -->
	</div>
</template>

<script>
	import {generateMixed} from "../utils/common.js";
	import { getOpenapiData } from '../api/api';
	import './imouplayer.js'
	export default {
		data() {
			return {
				appSecret: '',
				appId: '',
				src: '',
				channelId: '0',
				deviceId: '',
				param: {},
				AuthToken: {},
				loading: null,
				alarmStatus: false,
				closeCameraStatus: false, //隐私遮罩
				smartTrackStatus: false, //智能追踪
				player: null
			}
		},
		watch:{
			alarmStatus: {
			　　handler(newVal, oldVal) {
			  　	if(newVal){
						this.getDeviceCameraStatus()
					}
			　　},
			　　immediate: true
			}
		},
		methods: {
			getToken(){
				console.log(this.AuthToken);
				if(!this.AuthToken){
					this.setSystem()
					let params = {}
					this.param.params = params
					getOpenapiData('accessToken', JSON.stringify(this.param)).then(res => {
						this.AuthToken = res.data.result.data
						localStorage.setItem('AuthToken', JSON.stringify(res.data.result.data))
					});
				}
				this.getKitToken()
			},
			getKitToken() {
				var kitTokenParam = JSON.parse(localStorage.getItem('kitToken'))
				console.log('kitTokenParam：' + kitTokenParam);
				let nowTime = parseInt(new Date().getTime() / 1000)
				if (!kitTokenParam || nowTime - kitTokenParam.startTime > 3600) {
					this.setSystem()
					let params = {}
					this.setParams(params)
					params.type = '1'
					this.param.params = params
					getOpenapiData('getKitToken', JSON.stringify(this.param)).then(
						res => {
							console.log('getKitToken: ' + JSON.stringify(res));
							if(res.data.result.code == '0'){
								kitTokenParam = res.data.result.data
								let time = parseInt(new Date().getTime() / 1000)
								kitTokenParam.startTime = time
								localStorage.setItem('kitToken', JSON.stringify(res.data.result.data))
								this.kitToken = kitTokenParam.kitToken
								console.log('kitToken：' + this.kitToken);
								this.initMonitor()
							}else{
								this.$message.error(res.data.result.msg);
							}
						}
					);
				} else {
					
					this.kitToken = kitTokenParam.kitToken
					console.log('kitToken：' + this.kitToken);
					this.initMonitor()
				}
			},
			initMonitor(){
				console.log('初始化');
				if (this.player) { this.player.destroy() }
				this.player = new ImouPlayer('#monitorApp');
				const url = 'imou://open.lechange.com/5M0658CPAJ377E3/0/1?streamId=1'
				const kitToken = this.kitToken
				const urlArr = [];
				url.split('%').forEach(function(item, index) {
				    const obj = {
				        url: item,
				        kitToken: kitToken.split('%')[index]
				    };
				    urlArr.push(obj)
				});
				const width = 500;
				const height = parseInt(width * 9 / 16);
				const params = {
				    src: urlArr,
				    width: '100%',
				    height: height,
				    autoplay: true,
				    controls: true
				};
				console.log('player');
				this.player.setup(params);
				this.bindDeviceChannelInfo()
			},
			//查询设备信息
			bindDeviceChannelInfo(){
				console.log('bindDeviceChannelInfo');
				this.setSystem()
				let params = {}
				this.setParams(params)
				this.param.params = params
				getOpenapiData('bindDeviceChannelInfo', JSON.stringify(this.param)).then(
					res => {
						this.alarmStatus = res.data.result.data.alarmStatus == 1
					}
				);
			},
			control(operation) {
				console.log('control');
				this.setSystem()
				let params = {}
				this.setParams(params)
				params.operation = operation
				params.duration = 500
				this.param.params = params
				getOpenapiData('controlMovePTZ', JSON.stringify(this.param)).then(
					res => {
						
					}
				);
			},
			//修改动检状态
			modifyDeviceAlarmStatus(flag){
				console.log('modifyDeviceAlarmStatus');
				console.log('flag:' + flag);
				this.setSystem()
				let params = {}
				this.setParams(params)
				params.enable = flag
				this.param.params = params
				this.showLoading()
				getOpenapiData('modifyDeviceAlarmStatus', JSON.stringify(this.param)).then(
					res => {
						this.loading.close();
						console.log('modifyDeviceAlarmStatus: ' + JSON.stringify(res));
						if(res.status == 200 && res.data.result.code == '0'){
							this.alarmStatus = flag
							this.$message(res.data.result.msg);
						} else{
							this.alarmStatus = !flag
							this.$message.error(res.data.result.msg);
						}
					}
				);
			},
			//获取动检计划
			deviceAlarmPlan(){
				this.setSystem()
				let params = {}
				this.setParams(params)
				this.param.params = params
				this.showLoading()
				getOpenapiData('deviceAlarmPlan', JSON.stringify(this.param)).then(
					res => {
						this.loading.close();
						console.log('deviceAlarmPlan: ' + JSON.stringify(res));
						if(res.status == 200 && res.data.result.code == '0'){
							this.$message(res.data.result.msg);
						} else{
							this.$message.error(res.data.result.msg);
						}
					}
				);
			},
			//查询报警信息
			getAlarmMessage(){
				this.setSystem()
				let params = {}
				this.setParams(params)
				params.beginTime = '2016-03-30 00:00:00'
				params.endTime = '2016-04-08 00:00:00'
				params.count = 5
				// params.nextAlarmId = '-1'
				this.param.params = params
				this.showLoading()
				getOpenapiData('getAlarmMessage', JSON.stringify(this.param)).then(
					res => {
						this.loading.close();
						console.log('getAlarmMessage: ' + JSON.stringify(res));
						if(res.status == 200 && res.data.result.code == '0'){
							this.$message(res.data.result.msg);
						} else{
							this.$message.error(res.data.result.msg);
						}
					}
				);
			},
			//获取设备使能开关状态
			getDeviceCameraStatus(){
				let enableTypeList = ['closeCamera', 'smartTrack']
				enableTypeList.map(item => {
					// params.nextAlarmId = '-1'
					this.setSystem()
					let params = {}
					this.setParams(params)
					params.enableType = item
					this.param.params = params
					getOpenapiData('getDeviceCameraStatus', JSON.stringify(this.param)).then(
						res => {
							console.log('getDeviceCameraStatus: ' + JSON.stringify(res));
							if(res.status == 200 && res.data.result.code == '0'){
								// $attrs
								let flag = item + 'Status'
								this[flag] = res.data.result.data.status == 'on'
							} else{
								this.$message.error(res.data.result.msg);
							}
						}
					);
				})
				
			},
			setDeviceCameraStatus(type, flag){
				this.setSystem()
				let params = {}
				this.setParams(params)
				params.enableType = type
				params.enable = flag
				// params.nextAlarmId = '-1'
				this.param.params = params
				this.showLoading()
				getOpenapiData('setDeviceCameraStatus', JSON.stringify(this.param)).then(
					res => {
						this.loading.close();
						console.log('setDeviceCameraStatus: ' + JSON.stringify(res));
						if(res.status == 200 && res.data.result.code == '0'){
							let status = type + 'Status'
							this[status] = flag
							if(type == 'closeCamera' && !flag){
								this.initMonitor()
							}
							this.$message(res.data.result.msg);
						} else{
							this.$message.error(res.data.result.msg);
						}
					}
				);
			},
			showLoading(){
				this.loading = this.$loading({
					lock: true,
					text: 'Loading',
					spinner: 'el-icon-loading',
					background: 'rgba(0, 0, 0, 0.3)'
				});
			},
			setParams(params){
				let token = this.AuthToken.accessToken
				params.token = token
				params.channelId = this.channelId
				params.deviceId = this.deviceId
			},
			setSystem(){
				let nonce = generateMixed(32)
				let time = parseInt(new Date().getTime()/1000);
				let sign = 'time:' + time + ',nonce:' + nonce + ',appSecret:' + this.appSecret
				let md5Sign = sign.MD5(32)
				let system = {
					"ver": "1.0", 
					"sign": md5Sign,
					"appId": this.appId,
					"time": time, 
					"nonce": nonce
				}
				let id = '38e35411-4a5d-4a55-b25d-d9018af9b222'
				this.param.system = system
				this.param.id = id
			}
		},
		mounted() {
			console.log(111);
			console.log('this.appId:'+ this.appId);
			this.setSystem()
			this.AuthToken = JSON.parse(localStorage.getItem('AuthToken'))
			this.getToken()
		}
	}

</script>

<style scoped lang="scss">
	@import '~scss_vars';
	.button-group{
		width: 100%;
		height: 40px;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
		button{
			height: 30px;
			width: 30px;
			background-color: #F0F0F0;
			background-repeat: no-repeat;
			background-size: 100% 100%;
			&:nth-child(1) {
				background-image: url('../assets/jiantou-up.png');
			}
			&:nth-child(2) {
				background-image: url('../assets/jiantou-down.png');
			}
			&:nth-child(3) {
				background-image: url('../assets/jiantou-left.png');
			}
			&:nth-child(4) {
				background-image: url('../assets/jiantou-right.png');
			}
		}
	}
	.button-group-status{
		width: 100%;
		margin: 10px 0;
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
		button{
			height: 30px;
			width: 100px;
			margin-right: 20px;
		}
	}
	
</style>