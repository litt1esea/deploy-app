const API_HOST = 'http://localhost:1599/api'

function __create_request(func, responseMethod = 'json') {
  return async function (...args) {
    let response = await func.call(this, ...args)
    if (response.ok) {
      const result = await response[responseMethod]()
      return result
    } else {
      alert('HTTP-Error: ' + response.status)
    }
  }
}

const get_json = __create_request(function (url, params) {
  const searchParams = params ? ('?' + new URLSearchParams(params).toString()) : ''
  const absUrl = API_HOST + url + searchParams
  return fetch(absUrl, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    },
  })
})



const post_json = __create_request(function (url, data) {
  const absUrl = API_HOST + url
  return fetch(absUrl, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
})


const put_json = __create_request(function (url, data) {
  const absUrl = API_HOST + url
  return fetch(absUrl, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
})

const delete_json = __create_request(function (url, data) {
  const absUrl = API_HOST + url
  return fetch(absUrl, {
    method: 'delete',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
})


export { get_json, post_json, put_json, delete_json }