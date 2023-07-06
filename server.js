import express from "express";
 import bycrpt from "bcrypt";

 // Initialize server
 const app = express();


 // Middlewares
app.use(express.static("public"));
app.use(express.json()) // Enables form sharing


 // Routes
 // Home route
 app.get('/', (req, res) => {
    res.sendFile("homepage.html", { root: "public"})
 })


 // Sign up route
 app.get('/signup', (req, res) => {
   res.sendFile("signup.html", { root: "public"})
 })
 
app.post('/signup', (req, res) => {
  
})


 // 404 route
 app.get('/404', (req, res) => {
   res.sendFile("404.html", { root: "public"})
 })


 app.use((req, res) => {
   res.redirect('/404')
 })



 const port = 5000;
 app.listen(port, () => {
    console.log('Server is listening on port ${port}');
 })