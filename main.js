class XHR{
    call(method,url,data){
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
    async get(url){
        return await this.call("GET",url)
    }
    async post(url,data){
        return await this.call("POST",url,data)
    }
}

async function main() {
    const version = 1.9
    const orgUnitId = 10011
    const xhr = new XHR()
    // Get all catagories
    var catagories = await xhr.get(`/d2l/api/lp/${version}/${orgUnitId}/groupcategories/`)
    
    // catagories[].Name
    // catagories[].GroupCategoryId
    // catagories[].groups[] => groupIds
    
//    await xhr.post(`/d2l/api/lp/${version}/${orgUnitId}/groupcategories/${groupCategoryId}/groups/${groupId}/enrollments/`,{
//        "UserId": 89239875487
//    })
    
    console.log(catagories)
}

function parseFile(id){
    return new Promise((resolve,reject) => {
        var input = document.getElementById(id)
        input.addEventListener('change',() => {
            if(input.files.length > 1){
                console.error('you tried to upload more than one')
            }
            var file = input.files[0]
            var fr = new FileReader()
            fr.readAsText(file)
            fr.onload = () => {
                var data = d3.csvParse(fr.result)
                resolve(data)
            }
        })
        
    })
}

async function getAllCourses(){
    var xhr = new XHR()
    var bookmark = null
    var hasMoreItems = true
    var courses = []
    while(hasMoreItems){
        var data = await xhr.get(`/d2l/api/lp/1.15/enrollments/myenrollments/?orgUnitTypeId=3&Bookmark=${bookmark}`)
        
        bookmark = data.PagingInfo.Bookmark
        hasMoreItems = data.PagingInfo.HasMoreItems
        
        data.Items.forEach(course => {
            courses.push({
                code: course.OrgUnit.Code,
                id: course.OrgUnit.Id,
                name: course.OrgUnit.Name,
            })
        })
    }
    console.log(courses)
}

window.onload = async () => {
    getAllCourses()
//    var files = await Promise.all([parseFile('studentsCsv')/*,parseFile('mapCsv')*/])
}