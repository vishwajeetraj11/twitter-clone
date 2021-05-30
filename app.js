import express from 'express'

const app = express();

const port = 3000;

const server = app.listen(port, () => {
    console.log(`Server listening on port: ${port}`)    
})

// Setting pug as templating engine
app.set("view engine", "pug");

// When the app needs a view go look at views folder
app.set("views", "views")

app.get("/", (req,res, next) => {
    res.status(200).render("home")
})
