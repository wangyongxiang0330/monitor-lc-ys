<template>
	<div id="fulldiv">
		<div id="myPlayer"></div>
		<div class="front" ondblclick="fullSreen()">
		    <h2 id="chaoxian">
		        <p>9048,开放平台并发路数超限</p>
		        <p>请升级到VIP企业版</p>
		    </h2>
		</div> 
		<div class="button-group">
			<el-button type="primary" class="top" @mousedown.native='control(0)' @mouseout.native="stop(0)"></el-button>
			<el-button type="primary" class="bottom" @mousedown.native='control(1)' @mouseout.native="stop(1)"></el-button>
			<el-button type="primary" class="left" @mousedown.native='control(2)' @mouseout.native="stop(2)"></el-button>
			<el-button type="primary" class="right" @mousedown.native='control(3)' @mouseout.native="stop(3)"></el-button>
		</div>
		<div class="button-group-status">
			<div>是否在线：</div>
			<div>{{deviceInfo.status == 1 ? '在线' : '离线'}}</div>
		</div>
		<div class="button-group-status">
			<div>设备下线是否通知：</div>
			<div>{{deviceInfo.offlineNotify == 1 ? '通知' : '不通知'}}</div>
		</div>
		<div class="button-group-status">
			<div>告警声音模式：</div>
			<el-radio-group v-model="alarmSoundMode" @change="modifySound($event)">
			    <el-radio :label="0">短叫</el-radio>
			    <el-radio :label="1">长叫</el-radio>
			    <el-radio :label="2">静音</el-radio>
			  </el-radio-group>
			<!-- <div>{{deviceInfo.alarmSoundMode == 0 ? '短叫' : deviceInfo.alarmSoundMode == 1 ? '长叫' : '静音'}}</div> -->
		</div>
		<div class="button-group-status">
			<div>防控状态：</div>
			<el-switch
			  v-model="deviceInfo.defence == 1"
			  active-color="#13ce66"
			  inactive-color="#ff4949"
			  @change="modifyDefence($event)">
			</el-switch>
		</div>
		<div class="button-group-status">
			<div>是否加密：</div>
			<el-switch
			  v-model="deviceInfo.isEncrypt == 1"
			  active-color="#13ce66"
			  inactive-color="#ff4949"
			  @change="modifyEncrypt($event)">
			</el-switch>
		</div>
		<div class="button-group-status">
			<div>智能检测开关：</div>
			<div>
				人形过滤
				<el-switch
				  v-model="switchPeopleStatus"
				  active-color="#13ce66"
				  inactive-color="#ff4949"
				  @change="modifyPeopleStatus($event)">
				</el-switch>
			</div>
			<div>
				人脸抠图：不支持此功能
				<!-- <el-switch
				  v-model="switchFaceStatus"
				  active-color="#13ce66"
				  inactive-color="#ff4949"
				  @change="modifyFaceStatus($event)">
				</el-switch> -->
			</div>
		</div>
		<div class="button-group-status">
			<div>动检开关：</div>
			<!-- <el-switch
			  v-model="moveStatus"
			  active-color="#13ce66"
			  inactive-color="#ff4949"
			  @change="modifyMoveStatus($event)">
			</el-switch> -->
			暂不支持此功能
		</div>
		
	</div>
</template>
<script>
	import layUi from '../utils/layuiadmin/layui/layui.js';
	import EZUIKit from '../../static/ezuikit.js';
	import { postApiData } from '../api/api';
	import $ from 'jquery'
	var vm;
	export default {
		data() {
			return {
				isFirst: true, //第一次初始化
				switchPeopleStatus: false, // 智能检测开关302-人形过滤,304人脸抠图
				switchFaceStatus: false, // 智能检测开关302-人形过滤,304人脸抠图
				moveStatus: false, // 动检开关
				validateCode: '', //设备验证码
				param: {
					AppKey: '',
					AppSecret: '',
					deviceSerial: '',
					channelNo: '1',
					src: '',
					accessToken: '',
					no: null,
					timer: 0
				},
				alarmSoundMode: 0,//告警声音模式：0-短叫，1-长叫，2-静音
				// 设备信息
				deviceInfo: {
					deviceSerial: '', //设备序列号
					deviceName: '', //设备名称
					model: '', //设备型号，如CS-C2S-21WPFR-WX
					status: 0, //设备是否在线0不在线，1在线
					defence: 0, //布撤防状态：0-睡眠，8-在家，16-外出，普通IPC布撤防状态：0-撤防，1-布防
					isEncrypt: 0, //是否加密：0-不加密，1-加密
					alarmSoundMode: 0, //告警声音模式：0-短叫，1-长叫，2-静音
					offlineNotify: 0, //设备下线是否通知：0-不通知 1-通知
					category: '' //设备大类
				}
			}
		},
		mounted() {
			vm = this
			this.param.src = 'ezopen://open.ys7.com/' + this.param.deviceSerial + '/' + this.param.channelNo + '.live'
			this.getToken()
		},
		watch:{
		},
		methods: {
			getToken(){
				let token = JSON.parse(localStorage.getItem("ysToken"))
				console.log('token:');
				console.log(token);
				// console.log('expireTime:' + token.expireTime);
				let expireTime = token && token.expireTime || 0
				console.log('nowTime:' + new Date().getTime());
				console.log('expireTime:' + expireTime);
				if(!token || expireTime < new Date().getTime()){
					// token = await YS7.getToken(this.AppKey, this.AppSecret)
					let data = {
						appKey: vm.param.AppKey,
						appSecret: vm.param.AppSecret
					}
					postApiData('lapp/token/get', data).then(res => {
						localStorage.setItem('ysToken', JSON.stringify(res.data.data))
						vm.param.accessToken = res.data.data.accessToken
						vm.getDeviceInfo()
					});
				}else {
					vm.param.accessToken = token.accessToken
					vm.getDeviceInfo()
				}
			},
			getDeviceInfo(){
				postApiData('lapp/device/info', this.param).then(res => {
					if (res.data.code == 200) {
						console.log('开始')
						vm.deviceInfo = res.data.data
						console.log(vm.deviceInfo);
						if (vm.deviceInfo.status && vm.isFirst) {
							vm.isFirst = false
							vm.initVideo()
						} else if(!vm.deviceInfo.status){
							vm.$message.error('设备不在线，请检查网络');
						}
					} else {
						vm.$message.error(res.data.msg);
					}
				});
				// this.getMoveStatus() //此设备暂不支持此功能
				this.getSwitchStatus()
			},
			//智能检测开关
			getSwitchStatus(){
				let statusList = ['302', '304']
				statusList.map((item) => {
					vm.param.type = item
					postApiData('lapp/device/intelligence/detection/switch/status', vm.param).then(res => {
						if (res.data.code == 200) {
							// this.moveStatus
							let flag = res.data.data.enable == 1 ? true : false
							item == '302' ? vm.switchPeopleStatus = flag : vm.switchFaceStatus = flag
						} else {
							vm.$message.error(res.data.msg);
						}
					});
				})
			},
			//获取动检开关
			getMoveStatus(){
				postApiData('lapp/device/mobile/status/get', this.param).then(res => {
					if (res.data.code == 200) {
						// this.moveStatus
					} else {
						vm.$message.error(res.data.msg);
					}
				});
			},
			initVideo(){
				let token = JSON.parse(localStorage.getItem("ysToken"))
				this.param.accessToken = token.accessToken
				console.log('this.accessToken: ' + this.param.accessToken);
				let myPlayer = document.getElementById('myPlayer')
				// 异步 等ajax前面获取token成功后再加载下面代码
				setTimeout(() => {
					var decoder = new EZUIKit.EZUIPlayer({
						id: 'myPlayer',
						autoplay: true,
						url: vm.param.src,
						accessToken: vm.param.accessToken,
						// decoderPath: '/static/html/ysyDemo/js', //decoderPath：${window.YOUR_PATH};请在生产模式输入ezuikit.js的绝对路径
						decoderPath: '/static', // 这里是ezuikit的文件路径，千万不能定位到完整文件夹
						width: myPlayer.clientWidth,
						height: 400
					});
					decoder.on('log', vm.log);
				}, 500)
			},
			log(str) {
				console.log('str:' + str);
			    if (str.indexOf('9048') >= 0) {
			        document.getElementById("chaoxian").style.display = "block"
			        document.getElementsByClassName("front")[0].style.backgroundColor = "#fff"
			    }
			},
			control(direction) {
				this.no = setInterval(function() {
				    this.timer++
				}, 100)
				console.log('control:'+direction);
				this.param.direction = direction;
				this.param.speed = '1';
				postApiData('lapp/device/ptz/start', this.param).then(res => {
					if (res.data.code == 200) {
						
					} else {
						this.$message.error(res.data.msg);
					}
				});
			},
			stop(direction){
				console.log('stop:'+direction);
				clearInterval(this.no)
				if (this.timer <= 3) {
				    this.timer = 0
				    setTimeout(() => {
						postApiData('lapp/device/ptz/stop', this.param).then(res => {
							if (res.data.code == 200) {
								
							} else {
								vm.$message.error(res.data.msg);
							}
						});
						return false;
				    }, 500)
				} else {
				    this.timer = 0
					this.param.direction = direction;
					postApiData('lapp/device/ptz/stop', this.param).then(res => {
						if (res.data.code == 200) {
							
						} else {
							vm.$message.error(res.data.msg);
						}
					});
					return false;
				}
			},
			fullSreen() {
				var fullDiv = document.getElementById("fulldiv")
				// var myPlayerflashId = document.getElementsByName("myPlayerflashId")
				if (isFullscreen()) {
					this.exitFullscreen()
				} else {
					this.launchIntoFullscreen(fullDiv)
					setTimeout(() => {
						var canvas = document.getElementById("canvas0")
						var canvas_draw0 = document.getElementById("canvas_draw0")
						canvas.width = 1920
						canvas.height = 1080
						canvas_draw0.width = 1920
						canvas_draw0.height = 1080
					}, 100)
				}
			},
			//修改告警声音模式
			modifySound(type){
				console.log(type);
				this.param.type = type
				this.showLoading()
				postApiData('lapp/device/alarm/sound/set', this.param).then(res => {
					this.loading.close();
					if (res.data.code == 200) {
						vm.alarmSoundMode = type
						this.$message(res.data.msg);
						setTimeout(() => {
							this.getDeviceInfo()
						}, 500)
					} else {
						vm.alarmSoundMode = vm.deviceInfo.alarmSoundMode
						this.$message.error(res.data.msg);
					}
				});
			},
			modifyPeopleStatus(flag){
				this.setSwitchStatus('302', flag)
			},
			modifyFaceStatus(flag){
				this.setSwitchStatus('304', flag)
			},
			//设置设备智能检测开关状态
			setSwitchStatus(type, flag){
				vm.param.type = type
				vm.param.enable = flag ? 1 : 0
				this.showLoading()
				postApiData('lapp/device/intelligence/detection/switch/set', vm.param).then(res => {
					this.loading.close();
					if (res.data.code == 200) {
						if (type == '302') {
							this.switchPeopleStatus = flag
						} else{
							this.switchFaceStatus = flag
						}
						this.$message(res.data.msg);
					} else {
						if (type == '302') {
							this.switchPeopleStatus = !flag
						} else{
							this.switchFaceStatus = !flag
						}
						vm.$message.error(res.data.msg);
					}
				});
			},
			//防控状态：布防撤防
			modifyDefence(flag){
				this.param.isDefence = flag ? 1 : 0;
				this.showLoading()
				postApiData('lapp/device/defence/set', this.param).then(res => {
					this.loading.close();
					if (res.data.code == 200) {
						this.$message(res.data.msg);
						setTimeout(() => {
							this.getDeviceInfo()
						}, 500)
					} else {
						this.$message.error(res.data.msg);
					}
				});
			},
			//修改加密状态
			modifyEncrypt(flag){
				this.param.validateCode = this.validateCode
				this.showLoading()
				let url = flag ? 'lapp/device/encrypt/on' : 'lapp/device/encrypt/off'
				postApiData(url, this.param).then(res => {
					this.loading.close();
					if (res.data.code == 200) {
						this.deviceInfo.isEncrypt = flag ? 1 : 0
						console.log(this.param);
						this.$message(res.data.msg);
						setTimeout(() => {
							this.isFirst = true
							this.getDeviceInfo()
						}, 500)
					} else {
						this.$message.error(res.data.msg);
					}
				});
			},
			showLoading(){
				this.loading = this.$loading({
					lock: true,
					text: 'Loading',
					spinner: 'el-icon-loading',
					background: 'rgba(0, 0, 0, 0.3)'
				});
			},
			// 封装全屏的方法
			launchIntoFullscreen(element) {
			    if (element.requestFullscreen) {
			        element.requestFullscreen();
			    } else if (element.mozRequestFullScreen) {
			        element.mozRequestFullScreen();
			    } else if (element.webkitRequestFullscreen) {
			        element.webkitRequestFullscreen();
			    } else if (element.msRequestFullscreen) {
			        element.msRequestFullscreen();
			    }
			},
			// 封装退出全屏的方法
			exitFullscreen() {
			    if (document.exitFullscreen) {
			        document.exitFullscreen();
			    } else if (document.mozCancelFullScreen) {
			        document.mozCancelFullScreen();
			    } else if (document.webkitExitFullscreen) {
			        document.webkitExitFullscreen();
			    }
			},
			// 判断是否全屏状态
			isFullscreen() {
			    if (navigator.userAgent.indexOf("Firefox") != -1) {
			        return document.mozFullScreen;
			    } else if (navigator.userAgent.indexOf("Chrome") != -1) {
			        return document.webkitIsFullScreen;
			    }
			    return document.fullscreen;
			}
		}
	}

</script>

<style scoped lang="scss">
	@import '~scss_vars';
	#myPlayer{
		width: 100%;
	}
	#chaoxian{
		display: none;
	}
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
		div{
			margin: 0 10px;
		}
	}
	
</style>