const inquirer = require("inquirer");
const getData = require("./src/getData");

async function init() {
  try {
    let optionAnswer;

    do {
      optionAnswer = await inquirer.prompt([
        {
          type: "list",
          message: "Select an option",
          name: "option",
          loop: false,
          choices: [
            "View all departments",
            "View all roles",
            "View all employees",
            "Add a department",
            "Add a role",
            "Add an employee",
            "Update an employee role",
            "Exit"
          ]
        }
      ]);

      if (optionAnswer.option === "View all departments") {
        await getData.getDepartments();
      } else if (optionAnswer.option === "View all roles") {
        await getData.getRoles();
      } else if (optionAnswer.option === "View all employees") {
        await getData.getEmployees();
      } else if (optionAnswer.option === "Add department") {
        await getData.addDepartment();
      } else if (optionAnswer.option === "Add role") {
        await getData.addRole();
      } else if (optionAnswer.option === "Add employee") {
        await getData.addEmployee();
      } else if (optionAnswer.option === "Update employee role") {
        await getData.updateRole();
      } 
    } while (optionAnswer.option !== "Exit");
    console.log(optionAnswer.option);
  } catch (err) {
    console.log(err);
  }
}

init();