import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

class Database {
	constructor() {
		this.connect();
	}
	connect() {
		const db = process.env.DB_URI.replace(
			'<password>',
			process.env.DB_PASSWORD
		);
		mongoose
			.connect(db, {
				useFindAndModify: true,
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useCreateIndex: true,
			})
			.then(() => {
				console.log('DB connected');
			})
			.catch((e) => {
				console.log(e);
			});
	}
}

export default new Database();
