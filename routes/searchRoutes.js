import express from 'express';
const router = express.Router();

router.get('/', (req, res, next) => {
	var payload = createPayload(req.session.user);
	res.status(200).render('searchPage', payload);
});

router.get('/:selectedTab', (req, res, next) => {
	var payload = createPayload(req.session.user);
	payload.selectedTab = req.params.selectedTab;
	res.status(200).render('searchPage', payload);
});

function createPayload(userLoggedIn) {
	return {
		pageTitle: 'Search',
		userLoggedIn: userLoggedIn,
		userLoggedInJs: JSON.stringify(userLoggedIn),
	};
}

export default router;
