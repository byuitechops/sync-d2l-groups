async function get(url,cb){
    return new Promise((resolve,reject) => {
        var xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4){
            if(this.status == 200) {
                resolve(this.responseText)
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
    
    var body = await get(`/d2l/api/lp/${version}/${orgUnitId}/groupcategories/`)
    console.log(body)
})()
