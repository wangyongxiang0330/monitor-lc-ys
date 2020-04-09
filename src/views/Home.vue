<template>
	<div class="button-group">
		<div class="monitor" @click="goPath('/monitor')">大华乐橙</div>
		<div class="ysMonitor" @click="goPath('/ysMonitor')">海康萤石</div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			handleclose(path) {
				this.$router.push(path);
			}
		},
		mounted() {
		}
	}

</script>

<style scoped lang="scss">
	@import '~scss_vars';
	
	.button-group {
		display: flex;
		flex-direction: row;
		height: 40px;
		width: 100%;
		.monitor{
			width: 50%;
			height: 40px;
			background-color: #FFFFFF;
		}
		.ysMonitor{
			width: 50%;
			height: 40px;
			background-color: #FFFF00;
		}
	}
</style>