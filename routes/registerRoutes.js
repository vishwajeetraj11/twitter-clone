import express from 'express'
const app = express();

const router = express.Router();

router.get("/", (req,res, next) => {

    res.status(200).render("register")
})
router.post("/", (req,res, next) => {
    console.log(req.body)
    res.status(200).render("register")
})

export default router;
