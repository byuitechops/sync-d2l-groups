const errorLog = []

function addErrorLog(message){
    console.error(message)
    errorLog.push(message)
}

class XHR{
    async function call(method,url,data){
        return new Promise((resolve,reject) => {
            var xhttp = new XMLHttpRequest()
            xhttp.onreadystatechange = function() {
              if (this.readyState == 4){
                if(this.status == 200) {
                    var data = JSON.parse(this.responseText)
                    resolve(data)
                } else {
                    reject(this.status)
                }
              }
            }
            xhttp.open(method, url, true)
            data ? xhttp.send(data) : xhttp.send()
        })
    }
    async function get(url){
        return await this.call("GET",url)
    }
    async function post(url,data){
        return await this.call("POST",url,data)
    }
}

async function get(url){
    return new Promise((resolve,reject) => {
        var xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4){
            if(this.status == 200) {
                var data = JSON.parse(this.responseText)
                resolve(data)
            } else {
                reject(this.status)
            }
          }
        }
        xhttp.open("GET", url, true)
        xhttp.send()
    })
}

(async () => {
    const version = 1.9
    const orgUnitId = 10011
    const xhr = new XHR()
    // Get all catagories
    var catagories = await xhr.get(`/d2l/api/lp/${version}/${orgUnitId}/groupcategories/`)
    
    // catagories[].Name
    // catagories[].GroupCategoryId
    // catagories[].groups[] => groupIds
    
    await xhr.post(`/d2l/api/lp/${version}/${orgUnitId}/groupcategories/${groupCategoryId}/groups/${groupId}/enrollments/`) 
    
    console.log(catagories)
})()
