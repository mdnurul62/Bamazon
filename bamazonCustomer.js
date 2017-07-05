const mysql = require('mysql');
const inquirer = require('inquirer');
require('console.table');

const connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'root',
	database: 'bamazon_db'
})

connection.connect(function(err) {
	if (err) throw err;
	console.log('Connected as id ' + connection.threadId);
	displayAllItems();
})

const displayAllItems = function() {
	connection.query("SELECT * FROM products", function(err, res) {
		//console.log(res);
		console.table("item_id\tproduct_name\tdepartment_name\tprice\tstock_quantity\tproduct_sales");
		//console.log("-------------------------------------------------------------");
		for (var i = 0; i < res.length; i++) {
			console.table("  " + res[i].item_id + "\t" + res[i].product_name + "\t" + res[i].department_name + "\t" + res[i].price + "\t" + res[i].stock_quantity + "\t\t" + res[i].product_sales);
			//console.log("------------------------------------------------------------")
		}
		promptCustomer(res);
	})
}

const promptCustomer = function(res) {
	inquirer.prompt([
		{
			type: "input",
			name: "choice",
			message: "What item would you like to purchase? [Quit with Q]"
		}]).then(function(answer) {
			var correct = false;
			if (answer.choice.toUpperCase() == "Q") {
				process.exit();
			}
			for (var i = 0; i < res.length; i++) {
				if (res[i].item_id == answer.choice) {
					correct = true;
					var item = answer.choice;
					var id = i;
					inquirer.prompt({
						type: "input",
						name: "quantity",
						message: "How many quantity would you like to buy?",
						validate: function(value) {
							if (isNaN(value) == false) {
								return true;
							} else {
								return false;
							}
						}
					}).then(function(answer) {
						if ((res[id].stock_quantity - answer.quantity) > 0) {
							connection.query("UPDATE products SET stock_quantity = '"+(res[id].stock_quantity - answer.quantity)+"', product_sales = '"+(res[id].product_sales + answer.quantity*res[id].price)+"' WHERE item_id = '"+item+"'", function(err, res2) {
									connection.query("UPDATE departments SET total_sales = total_sales + " +(answer.quantity*res[id].price)+" WHERE department_name= '"+res[id].department_name+"';", function(err, res3) {
											console.log("Sales added to departments.");
									})
								//console.log("Total cost: " + answer.quantity*res[id].price.toFixed(2) + "\nThank you for purchasing product.");

								displayAllItems();
							})
						} else {
							console.log("Insufficient quantity!");
							promptCustomer(res);
						}

					})
				}
			}
			if (i == res.length && correct == false) {
				console.log("Not a valid selection!");
				promptCustomer(res);
			}
		})
}