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

async function signStudentUp(signup) {
    const version = 1.9
    const xhr = new XHR()
    
    // Get all catagories
    var catagories = await xhr.get(`/d2l/api/lp/${version}/${signup.ou}/groupcategories/`)
    
    if(catagories.length > 1){
        signup.error = `${catagories[0].Name} was not the only one, there was also ${catagories.slice(1).reduce((str,c) => str+=c.Name+',','')}`
    }
    // catagories[].Name
    // catagories[].GroupCategoryId
    // catagories[].groups[] => groupIds
    
    await xhr.post(`/d2l/api/lp/${version}/${signup.ou}/groupcategories/${groupCategoryId}/groups/${groupId}/enrollments/`,{
        UserId: userId
    })
    
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

function startWaiting(){
    document.getElementById('loading').removeAttribute('hidden')
    document.querySelectorAll('input').forEach(n => n.setAttribute('disabled',true))
}

function stopWaiting(){
    document.getElementById('loading').setAttribute('hidden',true)
    document.querySelectorAll('input').forEach(n => n.removeAttribute('disabled'))
}

async function requestAllCourses(){
    var xhr = new XHR()
    var bookmark = null
    var hasMoreItems = true
    var courses = []
    startWaiting()
    while(hasMoreItems){
        var data = await xhr.get(`/d2l/api/lp/1.15/enrollments/myenrollments/?orgUnitTypeId=3${bookmark?'&Bookmark='+bookmark:''}`)
        
        bookmark = data.PagingInfo.Bookmark
        hasMoreItems = data.PagingInfo.HasMoreItems
        
        data.Items.forEach(course => {
            courses.push({
                code: course.OrgUnit.Code,
                id: course.OrgUnit.Id,
                name: course.OrgUnit.Name,
            })
        })
        console.log(bookmark)
    }
    stopWaiting()
    return courses
}

async function getCourses(){
    var courses = localStorage.courses
    if(!courses){
        courses = await requestAllCourses()
        localStorage.courses = d3.csvFormat(courses)
    } else {
        courses = d3.csvParse(courses)
    }
    return courses
}

function createMap(courses){
    return courses.reduce((obj,course) => {
        obj[course.code] = course.id; 
        return obj
    },{})
}

window.onload = async () => {
    var courses = await getCourses()
    var signups = await parseFile('csv')
    
    startWaiting()
    var courseMap = createMap(courses)
    
    for(var i = 0; i < signups.length; i++){
        signups[0].error = undefined
        
        if(!signups[0].REFERENCE){
            signups[0].error = "Missing the 'REFERENCE' attribute that contains the coruse code"
            continue;
        }
        if(!courseMap[signups[i].REFERENCE]){
            signups[0].error = "The 'REFERENCE' course code, was not found in my list"
            continue;
        }
        signup.ou = courseMap[signups[i].REFERENCE]
        await 
    }
    console.log(students[0])
    stopWaiting()
}