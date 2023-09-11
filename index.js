const inquirer=require("inquirer")
const mysql=require("mysql2")
const {printTable}=require("console-table-printer")
require("dotenv").config()

const db= mysql.createConnection({
    host:"localhost",
    user:process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    port:3306
})
db.connect(()=>{
    mainMenu()
})

/*
view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee role
*/

function mainMenu(){
    inquirer.prompt({
        type:"list",
        message:"What would you like to do?",
        name:"selection",
        choices:["view all departments", "view all roles","view all employees","add a department","add a role","add an employee","update an employee role"]
    })
    .then(answer=>{
        
        if(answer.selection==="view all employees"){
            viewEmployees()
        }else if(answer.selection==="add an employee"){
            addEmployee()
        }
        else if(answer.selection==="update an employee role"){
           updateEmployeeRole()        
        }

    })
}

function viewEmployees(){
  db.query(`SELECT employee.id, employee.first_name, employee.last_name, title, name as department, salary, 
  CONCAT( bosses.first_name, ' ',bosses.last_name) as manager 
  from employee
  left join role on employee.role_id = role.id
  left join department on department.id = role.department_id
  left join employee as bosses on employee.manager_id=bosses.id;`, (err,data)=>{
    printTable(data)
    mainMenu()
  })
}
function addEmployee(){
  db.query("SELECT id as value,title as name from role ", (err,roleData)=>{
     db.query("SELECT id as value, CONCAT(first_name,' ', last_name) as name FROM employee WHERE manager_id is null", (err, managerData)=>{
         inquirer.prompt([
            {
                type:"input",
                message:"What is the first name?",
                name:"first_name"
                 
            },
            {
                type:"input",
                message:"What is the last name?",
                name:"last_name"
                 
            },
            {
                type:"list",
                message:"Choose the following title:",
                name:"role_id",
                choices:roleData
                 
            },
            {
                type:"list",
                message:"Choose the following manager:",
                name:"manager_id",
                choices: managerData
                 
            },
 
         ]).then(answer=>{
            db.query("INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES(?,?,?,?)",[answer.first_name, answer.last_name,answer.role_id,answer.manager_id],err=>{
                viewEmployees()
            })
         })
     })
  })

}
function updateEmployeeRole(){
    db.query("SELECT id as value,title as name from role ", (err,roleData)=>{
        db.query("SELECT id as value, CONCAT(first_name,' ', last_name) as name FROM employee  ", (err, employeeData)=>{
            inquirer.prompt([
               
               {
                   type:"list",
                   message:"Choose the following title:",
                   name:"role_id",
                   choices:roleData
                    
               },
               {
                   type:"list",
                   message:"Choose the following employee:",
                   name:"employee_id",
                   choices: employeeData
                    
               },
    
            ]).then(answer=>{
               db.query("UPDATE employee SET role_id = ? WHERE id= ? ",[answer.role_id,answer.employee_id],err=>{
                   viewEmployees()
               })
            })
        })
     })
}