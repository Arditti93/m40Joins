require("dotenv").config()
const { Sequelize } = require("sequelize") 
const { DataTypes } = require("sequelize")

const sequelize = new Sequelize(process.env.MYSQL_URI)

async function testConnecton () {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnecton() 

const User = sequelize.define('User', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}) 

const Invoice = sequelize.define('invoice', {
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId:{
        type: DataTypes.INTEGER,
    },
}) 

const invoiceTable = async () => {
    await sequelize.sync()
    try {
        await Invoice.create({
            amount: 100,
            userId: 2
        })
    } catch (error) {
        console.log(error)
        await sequelize.close();
    }
}

const usersTable = async () => {
    await sequelize.sync()
    try {
        await User.create({
            firstName: 'Jonny'
        })
        console.log("User successfully created")

    await sequelize.close();

    } catch (error) {
        console.log(error)
        await sequelize.close();
    }
}

// usersTable()
// invoiceTable()

// The Invoices table stores the userId of the user who created the invoice row.
const displayTables = async () => {
    try {

        let list = await User.findAll({
            attributes: ['id', 'firstName']
        })
        console.table(list.map(value => value.dataValues)); 

        let invoiceList = await Invoice.findAll({
            attributes: ['id', 'amount', 'userId']
        })
        console.table(invoiceList.map(value => value.dataValues));

    } catch (error) {
        console.log(error)
        await sequelize.close();
    }
} 
//id in users in PK and FK in invoice table = userId
//id can appear once in users table and multiple times in invoice table


const rawJoin = async () => {
    const [results] = await sequelize.query(
        "SELECT * FROM invoices JOIN Users ON invoices.userId = Users.id"
      );
      console.table(results.map(value => value));
}

// rawJoin()
displayTables() 

// ---------------------------------

// Sequelize way of creating JOIN queries.

// Association is the Sequelize concept used to connect different models. When two Sequelize models are associated, you can ask Sequelize to fetch data from the associated models.

// Under the hood, Sequelize will generate and execute a JOIN query, as you’ll see later.



// There are four types of association methods that you can use in Sequelize:
// hasOne()
// hasMany()
// belongsTo()
// belongsToMany()
// These four methods can be used to create One-To-One, One-To-Many, and Many-To-Many relationships between your models. 

// In the example we have, one User row can have many Invoices rows. This means you need to create a One-To-Many relation between the Users and the Invoices table.

const sequelizeJoin = async () => {
    // First, define the models for both tables using Sequelize.define() as shown below:

    // Now that both models are created, you need to call the right a
    // ssociation methods to form the relationship between your two models

    User.hasMany(Invoice);
    Invoice.belongsTo(User);

    // With the relationship formed between the models, you can 
    // start querying the data of one model from the other by adding the include option in your query method.
    // For example, here’s how to query the Invoice model data from the User model

    // Notice how the findAll() method call above has the include: Invoice option.

    const users = await User.findAll({ include: Invoice });
    console.log(JSON.stringify(users, null, 2)); 

    // By default, the include option will cause Sequelize to generate an SQL query with the LEFT OUTER JOIN clause.

    // All rows from the main table Users will be retrieved even when the row has zero Invoices row.

    // const users = await User.findAll({
    //     include: { model: Invoice, required: true },
    //   });
      
    // console.log(JSON.stringify(users, null, 2));
}

sequelizeJoin()
