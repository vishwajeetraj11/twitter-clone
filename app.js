import express from 'express';
import { requireLogin } from './middlewares.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';

// Import Routes
import loginRoutes from './routes/loginRoutes.js';
import logout from './routes/logout.js';
import registerRoutes from './routes/registerRoutes.js';
import tweetRoutesAPI from './routes/api/tweets.js';
import tweetRoutes from './routes/tweetRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import userRoutesAPI from './routes/api/users.js';
import chatsRoutesAPI from './routes/api/chats.js';
import messageRoutesAPI from './routes/api/messages.js';
import searchRoutes from './routes/searchRoutes.js';
import messagesRoutes from './routes/messagesRoutes.js';

import DB from './db.js';
dotenv.config();

const app = express();

// This allows to read from body (req.body)
// app.use(express.json())
// this works in case of pug ->
app.use(express.urlencoded({ extended: false }));

const port = 3000;

const server = app.listen(port, () => {
	console.log(`Server listening on port: ${port}`);
});

// Sessions
app.use(
	session({
		secret: 'I_D_K_I_WAS_PRETTY_BORED_TO_TYPE_OUT_A_SECRET',
		// resave forces the session to be saved even when the session wasn't modified the service request.
		// It saves the session back to the storage even when the session didn't get modified at any point during that request.
		resave: true,
		// saveUninitialized just prevents it from saving sessions as uninitialized. So, if it wasn't set it would still save it as initialized which takes up space. But if it's not set, we just don't want to save to anything.
		saveUninitialized: false,
	})
);

// Setting pug as templating engine
app.set('view engine', 'pug');

// When the app needs a view go look at views folder
app.set('views', 'views');

// Routes
app.use('/login', loginRoutes);
app.use('/logout', logout);
app.use('/register', registerRoutes);
app.use('/tweets', requireLogin, tweetRoutes);
app.use('/profile', requireLogin, profileRoutes);
app.use('/search', requireLogin, searchRoutes);
app.use('/messages', requireLogin, messagesRoutes);

// API Routes
app.use('/api/tweets', tweetRoutesAPI);
app.use('/api/users', userRoutesAPI);
app.use('/api/chats', chatsRoutesAPI);
app.use('/api/messages', messageRoutesAPI);

// __dirname is not available if not using esModules , only available if using common js.
const __dirname = path.resolve();

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', requireLogin, (req, res, next) => {
	// Payload is just a term used to refer to a data that we are sending to a function or to a page or through request or something like that.
	const payload = {
		pageTitle: 'Home',
		// session.user is set either in login or signup
		userLoggedIn: req.session.user,
		userLoggedInJs: JSON.stringify(req.session.user),
	};

	// Render function takes two parameters
	// 1. View
	// 2. Payload (any data that we want to send to that page)
	res.status(200).render('home', payload);
});
