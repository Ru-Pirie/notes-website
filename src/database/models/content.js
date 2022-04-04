module.exports = (sequelize, DataTypes) => {
	const table = sequelize.define('content', {
		uuid: {
			type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
		},
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
	});

	return table;
};