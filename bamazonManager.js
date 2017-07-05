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
	//console.log("Connected as Id " + connection.threadId);
	promptManager();
})

var promptManager = function(res) {
	console.log("Connection successful!");
	inquirer.prompt([{
			type: "rawlist",
			name: "choice",
			message: "What would you like to do?",
			choices: [
				"View Products for Sale", 
				"View Low Inventory", 
				"Add to Inventory", 
				"Add New product"]
		}]).then(function(val) {
			
				if (val.choice == "View Products for Sale") {
					displayItems();
				} else if (val.choice == "View Low Inventory") {
					displayLowInventory();
				} else if (val.choice == "Add to Inventory") {
					displayAddedInventory();
				} else if (val.choice == "Add New product") {
					displayAddedProduct();
				}

		});
}


function displayItems() {
	
		connection.query("SELECT * FROM products", function(err, res) {
			console.table("item_id\tproduct_name\tdepartment_name\tprice\tstock_quantity\tproduct_sales");
			//console.log("-------------------------------------------------------------");
			for (var i = 0; i < res.length; i++) {
				console.table("  " +res[i].item_id + "\t" + res[i].product_name + "\t" + res[i].department_name + "\t" + res[i].price + "\t" + res[i].stock_quantity + "\t\t" + res[i].product_sales);
				//console.log("------------------------------------------------------------")
			}
			promptManager();
		})
}
	

function displayLowInventory() {
	connection.query("SELECT * FROM products", function(err, res) {
		
			console.log("item_id\tproduct_name\tdepartment_name\tprice\tstock_quantity");
			console.log("-------------------------------------------------------------");
			for (var i = 0; i < res.length; i++) {
				if (res[i].stock_quantity < 5) {
				console.log("  " +res[i].item_id + "\t" + res[i].product_name + "\t" + res[i].department_name + "\t" + res[i].price + "\t" + res[i].stock_quantity);
				console.log("------------------------------------------------------------")
			}
		}
		promptManager(res);
	})
}

var displayAddedInventory = function(res) {
	inquirer.prompt([
		{
			type: "input",
			name: "item_id",
			message: "What product id would you like to update?"
		},
		{
			type: "input",
			name: "added",
			message: "How much stock would you like to add?"
		}]).then(function(val) {
				connection.query('UPDATE products SET stock_quantity = stock_quantity + '+val.added+'	WHERE item_id = '+val.item_id+';', 
					function(err, res) {
							if (err) throw err;

							if (res.affectedRows == 0) {
								console.log("Item does not exist");
								displayItems();
							} else {
								console.log("Inventory updated!");
								promptManager();
							}
					})
				
			 
		})
	
}


function displayAddedProduct(res) {
	inquirer.prompt([
	{
		type: "input",
		name: "product_name",
		message: "What is the name of product?"
	},{
		type: "input",
		name: "department_name",
		message: "What department does this product fit into?"
	},{
		type: "input",
		name: "price",
		message: "What is the price of this product?"
	},{
		type: "input",
		name: "stock_quantity",
		message: "How many quantities would you like to add?"
	}
	]).then(function(val) {
		connection.query("INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES('"+ val.product_name+"',' " + val.department_name + "', " + val.price + ", " + val.stock_quantity+");", function(err, res) {
				if (err) throw err;
				console.log(val.product_name + " Added item!");
				promptManager();
			})
	})
	
}
