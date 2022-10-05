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
};

async function getDepartments() {
    const connection = await createConnection();

    const [result] = await connection.query(
      `SELECT id as Id, name as Name FROM department ORDER BY id ASC`
    );
    console.table(result);
    connection.end();
};
  
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
};

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
};

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
};

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
    ]);

    const [result] = await connection.query(
        `SELECT d.id FROM department AS d WHERE d.name='${dName}'`
    );
    if (!result || !result.length) {
        console.log(`Failure::The department ${dName} is not in database.`);
        return;
    };
    
    const [insertRes] = await connection.query(
        `INSERT INTO role(title,salary,department_id) 
        values ('${title}', ${salary}, ${result[0].id})`
    );
};

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
        },
    ]);
  
    let roleId;
    const [rolRes] = await connection.query(
        `SELECT r.id FROM role AS r WHERE r.title='${role}'`
    );
    if (!rolRes || !rolRes.length) {
        console.log(`Failure::The role ${role} is not in database.`);
        return;
    };
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
    };

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
};

async function updateRole() {
    const connection = await createConnection();

    const [allEmp] = await connection.query(
      `SELECT id,first_name,last_name FROM employee ORDER BY id ASC`
    );

    const [allRole] = await connection.query(
      `SELECT id,title FROM role ORDER BY id ASC`
    );

    const EmpChoices = [];

    allEmp.forEach((e) => EmpChoices.push(e.first_name + " " + e.last_name));

    const { empName } = await inquirer.prompt([
        {
            type: "list",
            message: "Which employee's role do you want to update?",
            name: "empName",
            loop: true,
            choices: EmpChoices
        }
    ]);
    const RoleChoices = [];

    allRole.forEach((e) => RoleChoices.push(e.title));

    const { roleName } = await inquirer.prompt([
        {
            type: "list",
            message: "What is the employee's new role?",
            name: "roleName",
            loop: true,
            choices: RoleChoices
        }
    ]);
  
    const roleId = allRole.find((e) => e.title === roleName).id;
  
    await connection.query(
        `UPDATE employee SET role_id=${roleId} WHERE first_name='${empName.split(" ")[0]}' and last_name='${empName.split(" ")[1]}'`
    );
    console.log(`${empName}'s role updated to ${roleName}.`);
  
    connection.end();
}

async function budget() {
    const connection = await createConnection();
  
    const [departments] = await connection.query(
      `SELECT id, name FROM department ORDER BY id ASC`
    );
  
    const choices = [];

    departments.forEach((e) => choices.push(e.name));
    const { departmentChoice } = await inquirer.prompt([
        {
            type: "list",
            message: "Which department's budget do you want to access?",
            name: "departmentChoice",
            loop: true,
            choices: choices
        }
    ]);

    console.log(departmentChoice);

    const depId = departments.find((e) => e.name === departmentChoice).id;
    const [result] = await connection.query(
      `SELECT SUM(role.salary) FROM employee
      JOIN role WHERE role_id=role.id and role_id IN (SELECT role.id FROM role where department_id=${depId})`
    );
  
    console.log(
      `The total utilized budget of the ${departmentChoice} department is ${result[0]["SUM(role.salary)"]}$`
    );
    connection.end();
};

module.exports = {
    getDepartments,
    getRoles,
    getEmployees,
    addDepartment,
    addRole,
    addEmployee,
    updateRole,
    budget
};
  