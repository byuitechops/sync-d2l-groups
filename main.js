const errorLog = []

async function get(url,cb){
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

function addErrorLog(message){
    console.error(message)
    errorLog.push(message)
}

(async () => {
    const version = 1.9
    const orgUnitId = 10011
    var catagories = await get(`/d2l/api/lp/${version}/${orgUnitId}/groupcategories/`)
    
    // catagories[].Name
    // catagories[].GroupCategoryId
    // catagories[].groups[] => groupIds
    
    console.log(catagories)
})()
