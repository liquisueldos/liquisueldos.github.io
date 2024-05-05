const apiUrl = 'https://liquisueldos-server.glitch.me'

// Get all from Table
async function getAll (table) {
    return fetch(apiUrl + `/${table}`)
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching users: ', error)
        })
}

// Keep Server on
async function turnServerOn() {
    try {
        const allUsersKSO = await getAll(users)
        console.log(allUsersKSO)
    } catch (error) {
        console.error('Error fetching users: ', error)
    }
}
turnServerOn()
setInterval(turnServerOn, 10 * 60 * 1000)

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

// Authentication
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

        const allUsers = await getAll('users')

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
            const allUsers = await getAll('users')
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
else if (
    document.getElementById("homepage") || 
    document.getElementById("add-employee") ||
    document.getElementById("employees")  
) {

    // Navigation
    function navigateTo (page) {
        const email = localStorage.getItem('email')
        window.location.href = `${page}.html?email=${encodeURIComponent(email)}`
    }

    // Get email from URL
    function getEmailFromURL() {
        const urlParams = new URLSearchParams(window.location.search)
        const email = urlParams.get('email')
        return email
    }

    // Delete email from URL
    function  deleteEmailFromURL() {
        const urlParams = new URLSearchParams(window.location.search)
        urlParams.delete('email')
        const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '')
        window.history.replaceState({}, '', newUrl)
    }

    // Get user through email           
    async function getUserByEmail(email) {
        const response = await fetch(apiUrl + `/users/${encodeURIComponent(email)}`)
        if (!response.ok) {
            throw new Error('Network response was not ok')
        }
        const user = await response.json()
        return user
    }
    
    // Check if user is logged in
    async function checkUserLoggedIn() {
        const email = getEmailFromURL()
        localStorage.setItem('email', email)
        deleteEmailFromURL()
        
        if (email != null) {
            user = await getUserByEmail(email)
            document.getElementById("welcome").textContent = "¡ Hola " + user.NOMBRE + " !"
        } else {
            window.location.href = 'index.html'
        }
    }
    checkUserLoggedIn()

}

document.addEventListener('DOMContentLoaded', async function () {

    // Homepage 
    if (document.getElementById("homepage")) {

        // Add Employee Btn
        const addEmployeeBtn = document.getElementById("add-employee-btn")
        addEmployeeBtn.addEventListener('click', navigateTo.bind(null, 'add-employee'))
        addEmployeeBtn.addEventListener('touchstart', function(event) {
            event.preventDefault() 
            navigateTo('add-employee')
        })

        // Employees Btn
        const employeesBtn = document.getElementById("employees-btn")
        employeesBtn.addEventListener('click', navigateTo.bind(null, 'employees'))
        employeesBtn.addEventListener('touchstart', function(event) {
            event.preventDefault() 
            navigateTo('employees')
        })

    }

    // Employees
    if (document.getElementById("employees")) {

        // Homepage Btn
        const homepageBtn = document.getElementById("homepage-btn")
        homepageBtn.addEventListener('click', navigateTo.bind(null, 'homepage'))
        homepageBtn.addEventListener('touchstart', function(event) {
            event.preventDefault() 
            navigateTo('homepage')
        })

        // Add Employee Btn
        const addEmployeeBtn = document.getElementById("add-employee-btn")
        addEmployeeBtn.addEventListener('click', navigateTo.bind(null, 'add-employee'))
        addEmployeeBtn.addEventListener('touchstart', function(event) {
            event.preventDefault() 
            navigateTo('add-employee')
        })

        // Find employee by USUARIO
        async function findEmployee(email) {
            const allEmployees = await getAll('employees')
            return allEmployees.find(employee => employee.USUARIO === email)
        }

        // Display employee
        async function displayEmployee() {
            const email = localStorage.getItem('email')
            
            const employee = await findEmployee(email)
            if (employee) {
                document.getElementById("employee-name").textContent = employee.NOMBRE + " " + employee.APELLIDO
                document.getElementById("employee-job").textContent = "Cargo: " + employee.CARGO
                document.getElementById("employee-id").textContent = "Cedula: " + employee.CEDULA
                document.getElementById("employee-date").textContent = "Fecha de nacimiento: " + employee.FECHA_DE_NACIMIENTO
                document.getElementById("employee-civil-status").textContent = "Estado Civil: " + employee.ESTADO_CIVIL
                document.getElementById("employee-children").textContent = "Hijos: " + employee.HIJOS
            } else {
                document.getElementById("employee-name").textContent = "Empleado no encontrado"
            }
        }
        
        const email = getEmailFromURL()
        await displayEmployee()
         
    }

    // Add Employee Page
    if (document.getElementById("add-employee")) {

        // Homepage Btn
        const homepageBtn = document.getElementById("homepage-btn")
        homepageBtn.addEventListener('click', navigateTo.bind(null, 'homepage'))
        homepageBtn.addEventListener('touchstart', function(event) {
            event.preventDefault() 
            navigateTo('homepage')
        })

        // Employees Btn
        const employeeBtn = document.getElementById("employees-btn")
        employeeBtn.addEventListener('click', navigateTo.bind(null, 'employees'))
        employeeBtn.addEventListener('touchstart', function(event) {
            event.preventDefault() 
            navigateTo('employees')
        })

        // Authenticate Employee
        async function authenticateEmployee(id, employees) {
            return !employees.some(employee => employee.CEDULA === id)
        }

        // Create Employee
        async function createEmployee(user, name, surname, id, date, job, children, civilStatus) {

            console.log('Creating employee:', user, name, surname, id, date, job, children, civilStatus)
    
            try {
                const response = await fetch(apiUrl + '/employees', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ user, name, surname, id, date, job, children, civilStatus })
                })
    
                if (!response.ok) {
                    throw new Error('There was a problem connecting to the network')
                }
    
                const data = await response.json()
                console.log('Employee created:', data)
    
            } catch (error) {
                console.error('Error:', error)
            }
        }

        // Add Employee 
        var addEmployeeBtn = document.getElementById("add-employee-form-btn")
        addEmployeeBtn.addEventListener('click', async function () {

            const user = getEmailFromURL()
            const name = document.getElementById("name").value
            const surname = document.getElementById("surname").value
            const id = document.getElementById("id").value
            const date = document.getElementById("date").value
            const job = document.getElementById("job").value
            let children = undefined
            const childrenCheckbox = document.getElementById("children").value
            const civilStatus = document.getElementById("civil-status").value

            if (childrenCheckbox == 'on') {
                children = 'No'
            } else if (childrenCheckbox == 'off') {
                children = 'Si'
            }

            try {
                const allEmployees = await getAll('employees')
                if (await authenticateEmployee(id, allEmployees)) {
                    await createEmployee(user, name, surname, id, date, job, children, civilStatus)
                    console.log('Employee created successfully')
                } else {
                    alert(`${id} was already created.`)
                }
                
            } catch (error) {
                console.error('Error creating user:', error)
            }

        })
    }
})




