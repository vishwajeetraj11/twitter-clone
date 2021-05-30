import express from 'express'
const app = express();

const router = express.Router();

router.get("/", (req,res, next) => {

    res.status(200).render("register")
})
router.post("/", (req,res, next) => {
    const firstName = req.body.firstName.trim();
    const lastName = req.body.lastName.trim();
    const username = req.body.username.trim();
    const email = req.body.email.trim();
    const password = req.body.password;

    const payload = req.body;

    if(firstName && lastName && username && email && password) {

    }
    else {
        payload.errorMessage = "Make sure each field has a valid value.";
        res.status(200).render("register", payload);
    }
})

export default router;
