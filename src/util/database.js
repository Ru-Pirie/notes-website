const Sequelize = require('sequelize');
const path = require('path');
const fs = require('fs');

class Database {
    constructor(client) {
        client.log.db('New database connection created')
        this.client = client;
        this.dir = path.join(__dirname, '../database')
        this.db = {
            models: {},
        };
    }

    async initialize() {
        this.client.log.db('Initializing database connection and creating sequelize interface')

        const models = fs.readdirSync(`${this.dir}/models`)

        const sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: `${this.dir}/env/db.sqlite`,
            logging: this.client.log.db,
            define: {
                timestamps: false
            },
        });
          
        models.forEach(file => {
            const model = require(`${this.dir}/models/${file}`)(sequelize, Sequelize.DataTypes)
            this.db.models[model.name] = model;
        })

        Object.keys(this.db.models).forEach(modelName => {
			if (this.db.models[modelName].associate) {
				this.db.models[modelName].associate(this.db.models);
			}
		});

        this.client.log.db('Syncing database models with current database')
        sequelize.sync();
        this.db.sequelize = sequelize;  

        return this;
    }

    async query(statement, values = []) {
        try{
            if (values.length !== 0) {
                const res = await this.db.sequelize.query(statement, {
                    replacements: values,
                });

                return res[0]
            }
            else {
                const res = await this.db.sequelize.query(statement);
                
                return res[0]
            }
        }
        catch(e) {
            this.client.log.error(`DATABASE ${e.message}`);
        }
    }
}

module.exports = Database;