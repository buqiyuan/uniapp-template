const config = Symbol('config')
const isCompleteURL = Symbol('isCompleteURL')
const requestBefore = Symbol('requestBefore')
const requestAfter = Symbol('requestAfter')

class MinRequest {
	// 默认配置
	[config] = {
		baseURL: '',
		header: {
			'content-type': 'application/json'
		},
		method: 'GET',
		dataType: 'json',
		responseType: 'text'
	}
	
	// 拦截器
	interceptor = {
		request: (func) => {  
			if(func) {
				MinRequest[requestBefore] = func
			} else {
				MinRequest[requestBefore] = (request) => request
			}
		},
		response: (func) => {
			if(func) {
				MinRequest[requestAfter] = func
			} else {
				MinRequest[requestAfter] = (response) => response
			}
		}
	}
	
	static [requestBefore](config) {
		return config
	}
	
	static [requestAfter] (response) {
		return response
	}
	
	// 判断url是否完整
	static [isCompleteURL] (url) {
		return /(http|https):\/\/([\w.]+\/?)\S/.test(url)
	}
	
	// 设置配置
	setConfig (func) {
		this[config] = func(this[config])
	}
	
	// 网络请求
	request (options = {}) {
		options.baseURL = options.baseURL || this[config].baseURL
		options.dataType = options.dataType || this[config].dataType
		options.url = MinRequst[isCompleteURL](options.url) ? options.url : (options.baseURL + options.url) 
		options.data = options.data
		options.header = {...options.header, ...this[config.header]}
		options.method = options.method || this[config].method
		
		options = {...options, ...MinRequest[requestBefore](options)}
		
		return new Promise((resolve, reject) => {
			options.success = function (res) {
				resolve(MinRequst[requestAfter](res))
			}
			options.fail = function (err) {
				reject(MinRequst[requestAfter](err))
			}
			uni.request(options)
		})
	}
	
	get(url, data, options = {}) {
		options.url = url
		options.data = data
		options.method = 'GET'
		return this.request(options)
	}
	
	post (url, data, options = {}) {
		options.url = url
		options.data = data
		options.method = 'POST'
		return this.request(options)
	}
}

// 封装成Vue插件来使用
MinRequest.install = function (Vue) {
	Vue.mixin({
		beforeCreate: function () {
			if (this.$options.MinRequest) {
				console.log(this.$options.MinRequest)
				Vue._minRequest = this.$options.MinRequest
			}
		}
	})
	Object.defineProperty(Vue.prototype, '$minApi', {
		get: function () {
			return Vue._minRequest.apis
		}
	})
}

export default MinRequest
		