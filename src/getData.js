const mysql = require("mysql2/promise");
const inquirer = require("inquirer");
require("console.table");

async function createConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "workers",
    password: "Work3rs!"
  });
}

async function getDepartments() {
    const connection = await createConnection();
    
    const [result] = await connection.query(
      `SELECT id as Id, name as Name FROM department ORDER BY id ASC`
    );
    console.table(result);
    connection.end();
}
  
async function getRoles() {
    const connection = await createConnection();
  
    const [result] = await connection.query(
      `SELECT role.id as Id,
      role.title as Title,
      role.salary as Salary,
      department.name as DepartmentName 
      FROM role INNER JOIN department on department.id=role.department_id 
      ORDER BY role.id ASC`
    );
    console.table(result);
    connection.end();
}

async function getEmployees() {
    const connection = await createConnection();
  
    const [result] = await connection.query(
      `SELECT e.id as Id,
       e.first_name as FirstName,
       e.last_name as LastName, 
       r.title as JobTitle, 
       d.name as Department,
       r.salary as Salary,
       concat(manager.first_name,' ',manager.last_name) as ManagerName
        FROM employee as e
      JOIN role as r on e.role_id=r.id 
      JOIN department as d on r.department_id=d.id
      LEFT OUTER JOIN employee as manager on e.manager_id=manager.id 
      ORDER BY e.id ASC`
    );
    console.table(result);
    connection.end();
}

async function addDepartment() {
    const connection = await createConnection();
    const { dName } = await inquirer.prompt([
      {
        type: "input",
        message: "Department name?",
        name: "dName"
      }
    ]);
  
    const [result] = await connection.query(
      `INSERT INTO department(name) values('${dName}')`
    );
  
    console.log(
      `Added ${dName} to the database. Department id: ${result.insertId}`
    );
    connection.end();
}

async function addRole() {
    const connection = await createConnection();

    const { title, salary, dName } = await inquirer.prompt([
        {
            type: "input",
            message: "What is the role?",
            name: "title"
        },
        {
            type: "input",
            message: "What is the salary of the role?",
            name: "salary"
        },
        {
            type: "input",
            message: "Which department does the role belong to?",
            name: "dName"
        },
    ])

    const [result] = await connection.query(
        `SELECT d.id FROM department AS d WHERE d.name='${dName}'`
    );
    if (!result || !result.length) {
        console.log(`Failure::The department ${dName} is not in database.`);
        return;
    }
    
    const [insertRes] = await connection.query(
        `INSERT INTO role(title,salary,department_id) 
        values ('${title}', ${salary}, ${result[0].id})`
    );
    
}

async function addEmployee() {
    const connection = await createConnection();

    const { first_name, last_name, role, manager } = await inquirer.prompt([
        {
            type: "input",
            message: "What is the employee's first name?",
            name: "first_name"
        },
        {
            type: "input",
            message: "What is the employee's last name?",
            name: "last_name"
        },
        {
            type: "input",
            message: "What is the employee's role?",
            name: "role"
        },
        {
            type: "input",
            message: "Who is the employee's manager?",
            name: "manager"
        }
    ]);
  
    let roleId;
    const [rolRes] = await connection.query(
        `SELECT r.id FROM role AS r WHERE r.title='${role}'`
    );
    if (!rolRes || !rolRes.length) {
        console.log(`Failure::The role ${role} is not in database.`);
        return;
    }
    roleId = rolRes[0].id;
  
    let managerId;
    if (manager) {
        const man_firstName = manager.split(" ")[0];

        const man_lastName = manager.split(" ")[1];
  
        const [result] = await connection.query(
            `SELECT e.id FROM employee AS e WHERE e.first_name='${man_firstName}' and e.last_name='${man_lastName}'`
        );
        if (result && !result.length) {
            console.log(`Failure::The manager ${manager} is not in database.`);
            return;
        }
        managerId = result[0].id;
    }

    const [insertRes] = await connection.query(
        `INSERT INTO employee(first_name,last_name,role_id,manager_id)
          values ('${first_name}', '${last_name}',${roleId}, ${
          managerId ? managerId : null
        })`
    );
    
    console.log(
        `Added ${first_name} ${last_name} to the database. Employee id: ${insertRes.insertId}`
    );
    connection.end();
}

