const apiUrl = 'https://liquisueldos-server.glitch.me'

// Get all users
async function getUsers() {
    return fetch(apiUrl + '/users')
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching users: ', error)
        })
}

// Hash Password
async function hashPassword(password, salt) {
    const encoder = new TextEncoder()
    const data = encoder.encode(password + salt)

    const hashBuffer = await crypto.subtle.digest('SHA-256', data)

    const hashedPassword = Array.from(new Uint8Array(hashBuffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')

    return hashedPassword
}
async function Hash(password) {
    const salt = 'randomSalt123'
    const hashedPassword = await hashPassword(password, salt)
    return hashedPassword
}

// Email and Password Authentication
function authenticateEmail(email, users) {
    return !users.some(user => user.EMAIL === email)
}
function authenticatePassword(email, password, users) {
    const user = users.find(user => user.EMAIL === email)
    return user && user.CONTRASEÑA === password
}

// Log In
if (document.getElementById("login")) {
    var loginBtn = document.getElementById("loginBtn")

    // Check User existance
    async function userAuthentication() {
        const email = document.getElementById("email").value
        const password = document.getElementById("password").value

        const allUsers = await getUsers()

        if (authenticateEmail(email, allUsers)) {
            alert(`${email} is not a registered user.`)
            window.location.href = 'signup.html'
        } else {
            console.log(`${email} is registered.`)
            const hashedPassword = await Hash(password)
            console.log(hashedPassword)
            if (authenticatePassword(email, hashedPassword, allUsers)) {
                window.location.href = `homepage.html?email=${encodeURIComponent(email)}`
            } else {
                alert('email and password do not match')
            }
        }
    }

    loginBtn.addEventListener('click', userAuthentication)
}

// Sign Up
else if (document.getElementById("signup")) {

    // Create User
    async function createUser(name, surname, id, email, phoneNumber, address, password) {

        console.log('Creating user:', name, surname, id, email, phoneNumber, address, password)

        try {
            const hashedPassword = await Hash(password)
            
            const response = await fetch(apiUrl + '/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, surname, id, email, phoneNumber, address, hashedPassword })
            })

            if (!response.ok) {
                throw new Error('There was a problem connecting to the network')
            }

            const data = await response.json()
            console.log('User created:', data)

        } catch (error) {
            console.error('Error:', error)
        }
    }

    var signupBtn = document.getElementById("signupBtn")
    signupBtn.addEventListener('click', async function () {
        
        const name = document.getElementById("name").value
        const surname = document.getElementById("surname").value
        const id = document.getElementById("id").value
        const email = document.getElementById("email").value
        const phoneNumber = document.getElementById("phone-number").value
        const address = document.getElementById("address").value
        const password = document.getElementById("password").value

        try {
            const allUsers = await getUsers()
            if (authenticateEmail(email, allUsers)) {
                await createUser(name, surname, id, email, phoneNumber, address, password)
                console.log('User created successfully')
                window.location.href = `homepage.html?email=${encodeURIComponent(email)}`
            } else {
                alert(`${email} is already registered.`)
                window.location.href = 'index.html'
            }
            
        } catch (error) {
            console.error('Error creating user:', error)
        }
    })

}


// All pages 
else if (document.getElementById("homepage") || document.getElementById("employee")) {

    // Navigation
    function navigateTo (page) {
        window.location.href = `${page}.html?email=${encodeURIComponent(email)}`
    }

    // Get Email from url
    function getEmailFromURL() {
        const urlParams = new URLSearchParams(window.location.search)
        return urlParams.get('email') 
    }

    // Get user through email           
    async function getUserByEmail(email) {
        const response = await fetch(apiUrl + `/users/${encodeURIComponent(email)}`)
        if (!response.ok) {
            throw new Error('Network response was not ok')
        }
        const user = await response.json()
        document.getElementById("welcome").textContent = "¡ Hola " + user.NOMBRE + " !"
        
    }

    // Check if user is logged in
    const email = getEmailFromURL()
    if (email != null) {
        getUserByEmail(email)
    } else {
        window.location.href = 'index.html'
    }

    // Delete email from URL
    const urlParams = new URLSearchParams(window.location.search)
    urlParams.delete('email')
    const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '')
    window.history.replaceState({}, '', newUrl)

}

// Pages
document.addEventListener('DOMContentLoaded', function () {

    // Homepage 
    if (document.getElementById("homepage")) {

        // Employee Btn
        const employeeBtn = document.getElementById("employee-btn")
        employeeBtn.onclick = () => navigateTo('employee')

    }

    // Employee 
    if (document.getElementById("employee")) {

        // Homepage Btn
        const homepageBtn = document.getElementById("homepage-btn")
        homepageBtn.onclick = () => navigateTo('homepage')

    }
});
