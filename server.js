import express from "express";
import bcrypt from "bcrypt";
//import cors from 'cors';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, doc, collection, setDoc, getDoc, updateDoc, addDoc, getDocs, query, where } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyActBBY_q8930B0bwsFIptlgnoNyDgjiqo",
  authDomain: "orbital-website.firebaseapp.com",
  projectId: "orbital-website",
  storageBucket: "orbital-website.appspot.com",
  messagingSenderId: "534908737287",
  appId: "1:534908737287:web:821f188d86ba626be5d7a2"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const db = getFirestore();


 // Initialize server
 const app = express();


 // Middlewares
app.use(express.static("public"));
app.use(express.json()); // Enables form sharing
//app.use(cors({ origin: 'http://localhost:5000'}));



// AWS
import aws from "aws-sdk";
import "dotenv/config";

// AWS Setup
const region = "ap-southeast-2";
const bucket = "the-book-nook";
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

aws.config.update({
  region,
  accessKeyId,
  secretAccessKey
})

// Init S3
const s3 = new aws.S3();

// Generate Image URL
async function generateURL(){
  let date = new Date();

  const imageName = `${date.getTime()}.jpeg`;

  const params = {
    Bucket: bucket,
    Key: imageName,
    Expires: 300 ,//3 s, 300ms
    ContentType: "image/jpeg"
  }

  const uploadURL = await s3.getSignedUrlPromise("putObject", params);
  return uploadURL;
}

app.get('/s3url', (req, res) => {
  generateURL().then(url =>  res.json(url));
})

 // Routes
 // Home route
 app.get('/', (req, res) => {
    res.sendFile("homepage.html", { root : "public" })
 })



 // Sign up route
 app.get('/signup', (req, res) => {
   res.sendFile("signup.html", { root : "public" })
 })
 
app.post('/signup', (req, res) => {
  
  const { name, email, number, password } = req.body;

  //form validation
  if (name.length < 3) {
    res.json({ 'alert' : 'Name must be at least 3 letters long'});
} else if (!email.length) {
    res.json({ 'alert' : 'Enter your email'});
} else if (!Number(number) || number.length <8) {
    res.json({ 'alert' : 'Invalid number, please enter a valid number'});
} else if (password.length < 8) {
    res.json({ 'alert' : 'Password must be at least 8 characters long'});
} else {
  //store the data in db
  const users = collection(db, "users");
  getDoc(doc(users, email)).then(user => {
    if(user.exists()) {
      return res.json({ 'alert' : 'email/number already exists' })
    } else {
      //encrypt the password 
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) =>{
          req.body.password = hash;
          req.body.seller = false;

          //
          setDoc(doc(users, email), req.body).then(data => {
            res.json({
              name: req.body.name,
              email: req.body.email,
              seller: req.body.seller,
            })
          }) 
        })
      })
    }
    })
  }
})

app.get('/login', (req, res) => {
  res.sendFile("login.html", { root : "public" })

})

app.post('/login', (req, res) => {
  let { email, password } = req.body;

  if(!email.length || !password.length){
    res.json({ 'alert' : 'fill all inputs'})
  }
  const users = collection(db, "users");

  getDoc(doc(users, email))
  .then(user => {
    if(!user.exists()){
      return res.json({'alert' : 'email does not exist'});
    } else {
      bcrypt.compare(password, user.data().password, (err, result) => {
        if(result) {
          let data = user.data();
          return res.json({
            name: data.name,
            email: data.email,
            seller: data.seller

          })
        } else {
          return res.json({ 'alert' : 'password is incorrect'})
        }
      })
    }
  })
})

// Seller Route
app.get('/seller', (req, res) => {
  res.sendFile('seller.html', { root : "public" })
})

app.post('/seller', (req, res) => {
  let { name, address, about, number, email } = req.body;

  if(!name.length || !address.length || !about.length || number.length < 8 || !Number(number)){
    return res.json({ 'alert' : 'some information is/are incorrect'});
  } else {
    //update the seller status 
    const sellers = collection(db, "sellers");
    setDoc(doc(sellers, email), req.body)
    .then(data => {
      const users = collection(db, "users");
      updateDoc(doc(users, email), {
        seller: true
      })
      .then(data => {
        res.json({ 'seller' : true })
      })
    })

  }
})

// Dashboard Route
app.get('/dashboard', (req, res) => {
  res.sendFile('dashboard.html', { root : "public" });
})

// Product Route
app.get('/product', (req, res) => {
  res.sendFile('product.html', { root : "public" });
})

// Add Product Route
app.get('/add-product', (req, res) => {
  res.sendFile('add-product.html', { root : "public" });
})

app.get('/add-product/:id', (req, res) => {
  res.sendFile('add-product.html', { root : "public" });
})


app.post('/add-product', (req, res) => {
  let { name, shortDes, detail, price, image, tags, email, draft, id } = req.body;

  if (!draft) {
    if(!name.length){
      res.json({'alert': 'Please enter a book title!'});
    } else if(!shortDes.length){
      res.json({'alert': 'Please enter short description of at least 80 characters about the book!'});
    } else if(!price.length || !Number(price)){
      res.json({'alert': 'Please enter a valid price of the book'});
    } else if(!detail.length){
      res.json({'alert': 'Please enter details about the book!'});
    } else if(!tags.length){
      res.json({'alert': 'Please enter at least 3 tags related to the book!'});
    } 
  }
 

  // Add Product

  let docName = id == undefined ? `${name.toLowerCase()}-${Math.floor(Math.random() * 50000)}` : id;

  let products = collection(db, "products");
  setDoc(doc(products, docName), req.body)
  .then(data => {
    res.json({'product': name})
  })
  .catch(err => {
    res.json({'alert': 'Some error occurred.'})
  })
})


app.post('/get-products', (req, res) => {
  let {email, id, tag} = req.body
  let products = collection(db, "products");
  let docRef;

  if(id){
    docRef = getDoc(doc(products, id));
  } else if(tag){
    docRef = getDocs(query(products, where("tags", "array-contains", tag)))
  } else {
    docRef = getDocs(query(products, where("email", "==", email)))
  }
  

  docRef.then(products => {
    if(products.empty){
      return res.json('no products');
    }
    let productArr = [];

    if(id) {
      return res.json(products.data());
    } else {
      products.forEach(item => {
        let data = item.data();
        data.id = item.id;
        productArr.push(data);
      })
    }
    
    res.json(productArr);
  })
})

app.post('/delete-product', (req, res) => {
  let {id} = req.body;

  deleteDoc(doc(collection(db, "products"), id))
  .then(data => {
    res.json('success');
  }).catch(err => {
    res.json('err');
  })
})

app.get('/products/:id', (req, res) => {
  res.sendFile("product.html", { root : "public"})
})


app.get('/cart', (req, res) => {
  res.sendFile("cart.html", { root : "public" })
})

//search route
app.get('/search/:key', (req, res) => {
  res.sendFile("search.html", { root : "public" })
})

 // 404 Route
 app.get('/404', (req, res) => {
   res.sendFile("404.html", { root : "public" })
 })


 app.use((req, res) => {
   res.redirect('/404')
 })




// const port = 5000;
// app.listen(port, () => {
//    console.log('Server is listening on port ${port}');
// })

app.listen(5000, () => {
  console.log('listening on port 5000')
})


