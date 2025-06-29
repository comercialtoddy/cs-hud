export default {
	data() {
		const urlParams = new URL(window.location).searchParams
		return {
			isRequested: urlParams.has('corners') || urlParams.has('transparent'),
		}
	},
}
