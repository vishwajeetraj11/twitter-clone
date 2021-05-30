import express from 'express'
import {requireLogin} from "./middlewares.js"
const app = express();

const port = 3000;

const server = app.listen(port, () => {
    console.log(`Server listening on port: ${port}`)    
})

// Setting pug as templating engine
app.set("view engine", "pug");

// When the app needs a view go look at views folder
app.set("views", "views")

app.get("/", requireLogin, (req,res, next) => {

    // Payload is just a term used to refer to a data that we are sending to a function or to a page or through request or something like that.
    const payload = {
        pageTitle: 'Home'
    }

    // Render function takes two parameters 
    // 1. View
    // 2. Payload (any data that we want to send to that page)
    res.status(200).render("home", payload)
})
