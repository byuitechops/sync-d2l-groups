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
    try{
        var catagories = await xhr.get(`/d2l/api/lp/${version}/${signup.ou}/groupcategories/`)
    } catch(e){
        throw new Error(`Failed to get the groups from the course`)
    }
    // Make sure there is only one catagory
    if(catagories.length > 1){
        throw new Error(`${catagories[0].Name} was not the only one, there was also ${catagories.slice(1).reduce((str,c) => str+=c.Name+',','')}`)
    }
    // make sure there is only one group in that catagory
    if(catagories[0].groups.length > 1){
        throw new Error(`${catagories[0].groups[0]} was not the only group id there were also ${catagories[0].groups.slice(1).join(',')}`)
    }
    
    try{
        await xhr.post(`/d2l/api/lp/${version}/${signup.ou}/groupcategories/${catagories[0].GroupCategoryId}/groups/${catagories[0].groups[0]}/enrollments/`,{
            UserId: signup.LDS_ACCOUNT_ID
        })
    } catch(e){
        throw new Error(`Failed to add the student to the group`)
    }
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

function createMap(courses){
    return courses.reduce((obj,course) => {
        obj[course.code] = course.id; 
        return obj
    },{})
}

window.onload = async () => {
    var files = await Promise.all([parseFile('signups'),parseFile('courses')])
    var signups = files[0]
    var courses = files[1]
    
    startWaiting()
    var courseMap = createMap(courses)
    
    for(var i = 0; i < 5; i++){
        signups[i].error = undefined
        
        if(!signups[i].REFERENCE){
            signups[i].error = "Missing the 'REFERENCE' attribute that contains the coruse code"
        }
        if(!courseMap[signups[i].REFERENCE]){
            signups[i].error = `The 'REFERENCE' course code "${signups[i].REFERENCE}", was not found\n`
        }
        if(!signups[i].error){
            signup.ou = courseMap[signups[i].REFERENCE]
            await signStudentUp(signups[i]).catch(e => signups[i].error = e)
        }
        
        if(signups[i].error){
            document.getElementById('errors').innerHTML += `<p>${signups[i].FIRST_NAME} ${signups[i].LAST_NAME} in ${signups[i].D2L_COURSE_TITLE}: ${signups[i].error}</p>`
        }
    }
    console.log(signups)
    stopWaiting()
}