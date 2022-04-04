module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define('titles', {
		name: {
			type: DataTypes.STRING(2048),
			allowNull: false,
		},
		uuid: {
			type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
		},
        subject: {
			type: DataTypes.STRING(512),
			allowNull: false,
        }
	});

	return table;
};