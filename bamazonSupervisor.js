var mysql = require('mysql');
var inquirer = require('inquirer');
require('console.table');

var connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'root',
	database: 'bamazon_db'
})

connection.connect(function(err) {
	if (err) throw err;
	console.log("Connected as id " + connection.threadId);
	promptSupervisor();
})


var promptSupervisor = function() {

	inquirer.prompt([
		{
			type: "list",
			name: "choice",
			message: "What would you like to do?",
			choices: ["View product sales by Department","Create New Department"]
		}
		]).then(function(answer) {
			if (answer.choice == "View product sales by Department") {
				viewProductSales();
			}
			if (answer.choice == "Create New Department") {
				createNewDept();
			}
		
	})
			
}

function viewProductSales() {
	connection.query("SELECT * FROM departments", function(err, res) {
		console.table("department_id\tdepartment_name\tover_head_cost\ttotal_sales\ttotal_profits");
			for (var i = 0; i < res.length; i++) {
			console.table("\t" + res[i].department_id + "\t" + res[i].department_name + "\t" + res[i].over_head_cost + "\t\t" + res[i].total_sales + "\t\t" + (res[i].total_sales - res[i].over_head_cost) );
		}
		//console.table(res);
		promptSupervisor();
	})
}

function createNewDept() {
	inquirer.prompt([{
		type: "input",
		name: "name",
		message: "What is the name of the department?"
	},{
		type: "input",
		name: "overhead",
		message: "How much would you set for overhead?"
	}
	]).then(function(val) {
	connection.query("INSERT INTO departments(department_name, over_head_cost, total_sales)	VALUES('"+val.name+"', "+val.overhead+", 0.00);", function(err, res) {
			if (err) throw err;
			console.log("Added department.");
			promptSupervisor();
		})
	})
}


