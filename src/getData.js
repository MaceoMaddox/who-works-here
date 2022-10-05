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

