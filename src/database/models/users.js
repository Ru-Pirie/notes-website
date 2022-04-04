module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define('users', {
		username: {
			type: DataTypes.STRING(2048),
            primaryKey: true,
			allowNull: false,
		},
		password: {
			type: DataTypes.STRING(2048),
            allowNull: false,
		},
        access: { 
            type: DataTypes.INTEGER,
            allowNull: false,
        }
	});

	return table;
};