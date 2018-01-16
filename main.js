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
                    reject(this.status+": "+this.responseText)
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
    
    // Get all catagories: 
    // https://pathway.brightspace.com/d2l/api/lp/1.9/31297/groupcategories/
    try{
        var catagories = await xhr.get(`/d2l/api/lp/${version}/${signup.ou}/groupcategories/`)
    } catch(e){
        throw new Error(`Failed to get the Groups from the course`)
    }
    // Make sure there is one and only one catagory named Virtual Gathering
    var found = catagories.filter(c => c.Name === "Virtual Gathering")
    if(found.length != 1){
        throw new Error(`Could not find the "Virtual Gathering" catagory among ["${catagories.map(c => c.Name).join('","')}"]`)
    }
    
    var vgCatagory = found[0]
    console.log(vgCatagory)
    // make sure there is only one group in that catagory
    if(vgCatagory.Groups.length > 1){
        throw new Error(`"${vgCatagory.Groups[0]}" was not the only group id there were also "${vgCatagory.Groups.slice(1).join('","')}"`)
    }
    
    try{
        await xhr.post(`/d2l/api/lp/${version}/${signup.ou}/groupcategories/${vgCatagory.GroupCategoryId}/Groups/${vgCatagory.Groups[0]}/enrollments/`,{
            UserId: signup.LDS_ACCOUNT_ID
        })
    } catch(e){
        throw new Error(`Failed to add the student to the group ${e}`)
    }
}

// Takes the input id and returns the parsed csv (array of objects)
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
    // Show loading bar
    document.getElementById('loading').removeAttribute('hidden')
    // Disable all inputs just to be safe 
    document.querySelectorAll('input').forEach(n => n.setAttribute('disabled',true))
}

function stopWaiting(){
    // Hide loading bar
    document.getElementById('loading').setAttribute('hidden',true)
    // reable inputs
    document.querySelectorAll('input').forEach(n => n.removeAttribute('disabled'))
}

// turns the array of objects into a huge object with the course ids as the key
function createMap(courses){
    return courses.reduce((obj,course) => {
        obj[course.code] = course.id; 
        return obj
    },{})
}

function createDownloadLink(data,fileName){ 
    var a = document.createElement("a")
    document.body.appendChild(a)
    a.innerHTML = fileName
    
    var csv = d3.csvFormat(data)
    var blob = new Blob([csv],{type:"octet/stream"})
    var url = window.URL.createObjectURL(blob)
    
    a.href = url
    a.download = fileName
}

window.onload = async () => {
    // waiting to start unto both of the files are uploaded
    // this should probably be changed to being fired when a button is clicked instead
    var files = await Promise.all([parseFile('signups'),parseFile('courses')])
    var signups = files[0]
    var courses = files[1]
    
    startWaiting()
    var courseMap = createMap(courses)
    
    for(var i = 0; i < signups.length; i++){
        var signup = signups[i]
        signup.error = undefined
        
        if(!signup.REFERENCE){
            signup.error = "Missing the 'REFERENCE' attribute that contains the coruse code"
        }
        if(!courseMap[signup.REFERENCE]){
            signup.error = `The 'REFERENCE' course code "${signup.REFERENCE}", was not found\n`
        }
        if(!signup.error){
            signup.ou = courseMap[signup.REFERENCE]
            await signStudentUp(signup).catch(e => signup.error = e)
        }
        
        if(signup.error){
            document.getElementById('errors').innerHTML += `<p>${signup.FIRST_NAME} ${signup.LAST_NAME} in ${signup.D2L_COURSE_TITLE}: ${signup.error}</p>`
        }
    }
    createDownloadLink(signups,'Signups w/ Errors.csv')
    stopWaiting()
}