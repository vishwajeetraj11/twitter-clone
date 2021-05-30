import express from 'express';
import { requireLogin } from './middlewares.js';

// Import Routes
import loginRoutes from './routes/loginRoutes.js';
import registerRoutes from './routes/registerRoutes.js'

import path from 'path'
const app = express();

const port = 3000;

const server = app.listen(port, () => {
	console.log(`Server listening on port: ${port}`);
});

// Setting pug as templating engine
app.set('view engine', 'pug');

// When the app needs a view go look at views folder
app.set('views', 'views');

// Routes
app.use('/login', loginRoutes);
app.use('/register', registerRoutes);

// __dirname is not available if not using esModules , only available if using common js.
const __dirname = path.resolve()

// Serve Static Files
app.use(express.static(path.join(__dirname, "public")))

app.get('/', requireLogin, (req, res, next) => {
	// Payload is just a term used to refer to a data that we are sending to a function or to a page or through request or something like that.
	const payload = {
		pageTitle: 'Home',
	};

	// Render function takes two parameters
	// 1. View
	// 2. Payload (any data that we want to send to that page)
	res.status(200).render('home', payload);
});
