import express from "express"
import bodyParser from "body-parser"//can use express as well but since i know body-parser middelware just used it //
import multer from "multer";
import fs, { read } from "fs";
import path from "path"
import { fileURLToPath } from "url";



const app=express();
const port= process.env.PORT || 4000
let posts=[];
const profilePath=path.join("Data","profile.json");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));//can use app.use(express.urlencoded({extended:true}));


// handling dummy post
const dummyFilePath = path.join("Data", "dummyPosts.json");

let dummyPosts = []; // will hold dummy posts in memory

fs.readFile(dummyFilePath, "utf-8", (err, data) => {
  if (!err && data) {
    try {
      dummyPosts = JSON.parse(data);
      console.log(`Loaded ${dummyPosts.length} dummy posts.`);
    } catch (e) {
      console.error("Error parsing dummyPosts.json:", e.message);
    }
  } else {
    console.error("Failed to read dummyPosts.json:", err?.message || "No data");
  }
});

// image saving 
const storage = multer.diskStorage({

    destination:(req,file,cb)=>{
        cb(null,"public/uploads");
    },

    filename:(req,file,cb)=>{
        cb(null,Date.now()+"-"+file.originalname);
      
    }



});


const multerThings=multer({storage:storage});
const dataFilePath=path.join("Data","userPost.json");


function loadPost(callback){
    
    fs.readFile(dataFilePath,"utf-8",(readErr,data)=>{
          if(!readErr && data){
            try{
                posts=JSON.parse(data);
                // console.log("file read sucessfully!");
            }
            catch(err){
                console.log("err while reading a file:"+err);
                posts=[];
            }
          }else{
            posts=[];
          }
          callback(posts);
    });
}




app.get("/",(req,res)=>{
    loadPost((postData)=>{
   res.render("index.ejs",{
    posts:postData||[],
    activePage: "home" ,
   });
    });
    
   
});

app.get("/addPost",(req,res)=>{
    res.render("addPost.ejs",{
        title:"addPost",
        activePage: "addPost" ,
    });
});

app.get("/signUp",(req,res)=>{
    res.render("signUp.ejs",{
        title:"SignUp",
        activePage: "signUp" ,
    });
});
app.get("/home",(req,res)=>{
    res.redirect("/");
});

app.get("/yourPost",(req,res)=>{

    fs.readFile(profilePath,"utf-8",(readErr,data)=>{
        if(readErr){
            console.log("err in reading profile.json file"+readErr);
            return res.render("error.ejs",{
                message:readErr,
            });
           
        }
        try{
            const userCredentials=JSON.parse(data);
            if(!userCredentials.Email || !userCredentials.Password){
                return res.render("signUp.ejs",{
                    title:"SignUp",
                    activePage: "signUp" ,
                    userLoggedDetails:"logged-off",
                });
            }
            loadPost((postData)=>{
                res.render("yourPost.ejs",{
                 posts:postData||[],
                 title:"yourPosts",
                 activePage: "yourPost" ,
                })
            });
           
        
        }catch(parseError){
            console.log("error while parsing data:"+parseError);
            return res.render("error.ejs", { message: "Sorry, there was an issue parsing your data. Please try again later." });
 
        }
    });
});

app.get("/detailedPost/:id",(req,res)=>{
    const postId=req.params.id;
    loadPost((postData)=>{
         let foundPost =postData.find(post=>post.Id===postId);
           let isDummy = false;


          if (!foundPost) {
      // check dummyPosts if not found in real posts
           foundPost = dummyPosts.find(post => post.Id === postId);
            if (foundPost) isDummy = true;
           }

         if(foundPost){
            res.render("detailedPost.ejs",{
                post:foundPost,
                 isDummy: isDummy
            });
         }else{
            console.log("post not found!");
         }

    });
});
app.get("/delete/:id",(req,res)=>{
    const deleteId=req.params.id;
    loadPost((postData)=>{
      
const updatedPost=postData.filter(post=>post.Id!==deleteId);
    
fs.writeFile(dataFilePath, JSON.stringify(updatedPost,null,2),(err)=>{
    if(err){
        console.log("failed to delete the post!");
        res.status(500).send("Something went wrong.");
    }
    else{
        console.log(`Post with ID ${deleteId} deleted.`);
        res.redirect("/");
        
    }

});

    });
});

app.post("/upload",multerThings.single("image"),(req,res)=>{



    //read profile file to know user is logged-in
    fs.readFile(profilePath,"utf-8",(readErr,data)=>{
        if(readErr){
            console.log("err in reading profile.json file"+readErr);
            return res.render("error.ejs",{
                message:readErr,
            });
        }
        try{
            const userCredentials=JSON.parse(data);
            if(!userCredentials.Email || !userCredentials.Password){
               return  res.render("signUp.ejs",{
                title:"SignUp",
                activePage: "signUp" ,
                userLoggedDetails:"logged-off",
               });
            }
           
        
        }catch(parseError){
            console.log("error while parsing data:"+parseError);
            return res.render("error.ejs", { message: "Sorry, there was an issue parsing your data. Please try again later." });
 
        }
        const {userName,pDate,Destination,yourStory}=req.body;
        const Id=Date.now().toString();
        const imagePath=req.file.path.replace("public","");
        const newPost={Id,userName,pDate,Destination,yourStory,imagePath,uploadSucess:"uploaded sucessfully 👍"};
        loadPost((postData)=>{
         postData.push(newPost);
    
         fs.writeFile(dataFilePath,JSON.stringify(postData,null,2),(err)=>{
            if(err){
                console.log("failed to save the post:"+err);
                return res.render("error.ejs", { message: err });
 
            }
            else{
                console.log("file saved succesfully!");
                console.log("id:"+Id);
                console.log("user-name:"+userName);
                console.log("Date:"+pDate);
                console.log("Destination-place:"+Destination);
                console.log("YourStory:"+yourStory);
                console.log("imagePath:"+imagePath);
                res.redirect("/");
            }
         });
        });
       

    });
   });



app.post("/sign-in",(req,res)=>{
   
    const{accountUserName,Email,Password}=req.body;
    const newProfile={accountUserName,Email,Password};
    
    
    fs.writeFile(profilePath,JSON.stringify(newProfile,null,2),(err)=>{
        if(err){
            console.log("failed save the data!");
            
        }
        else{
            console.log("file saved sucessfully!");
            console.log("email:"+Email);
            console.log("password:"+Password);
            console.log("Account-userNames:"+accountUserName);
            console.log("profile path:"+profilePath);
            res.redirect("/");
        }
    });
   
   
});

app.get("/profile", (req, res) => {
   let profileData={};
    fs.readFile(profilePath,"utf-8",(err,data)=>{
        if(!err && data){
            try{
                profileData=JSON.parse(data);
                console.log("file read successfully!");
            }catch(parseError){
                console.log("Error parsing profile data:", parseError.message);
            }
        }else {
            console.log("Failed to read the profile file:", err ? err.message : "No data");
        }
        res.render("profile.ejs", { activePage: "profile", profileData });
        
    });
  });


  app.get("/logout",(req,res)=>{
  res.render("logout.ejs",{
    title:"logOut",
    activePage:"logout",
  })
  });

  app.post("/logout",(req,res)=>{
    const{LEmail,LPassword}=req.body;
    let checkProfile={LEmail,LPassword};
    let logoutFile={};
       fs.readFile(profilePath,"utf-8",(readErr,data)=>{

        if (readErr) {
            console.log("Error reading file:", readErr);
           
        }
        if( data){
            try{
                logoutFile=JSON.parse(data);
                if((logoutFile.Email===checkProfile.LEmail)&&(logoutFile.Password===checkProfile.LPassword)){

                    fs.writeFile(profilePath,"{}",(err)=>{
                         if(err){
                            console.log("Error clearing file:", err);
                            return res.status(400).json({ success: false, message: "Error clearing file. Try again." });
                         }
                         else{
                           
                            res.json({ success: true });
                         }
                    });
                }else {
                    // If email/password wrong
                    console.log("Failed to log out: Email or password incorrect. Try again.");
                    return res.status(400).json({ success: false, message: "Email or password incorrect. Try again." });
                    
          
                  
                }

            }
            catch(parseError){
                console.log("err in parsing data!:"+parseError);
              
            }
          }
          else{
            console.log("file doesn't exist or file corrupt+"+readErr);
          
          }
          
       });
  });


  app.get("/search", (req, res) => {
  res.render("search.ejs", {
    posts: null,
    query: "",
    activePage: "search"
  });
});

app.get("/searchResults", (req, res) => {
  const query = req.query.q?.toLowerCase() || "";
  let allPosts = [];

  loadPost((userPosts) => {
    allPosts = [...userPosts];

    // Load dummy posts
    fs.readFile(dummyFilePath, "utf-8", (err, dummyData) => {
      if (!err && dummyData) {
        try {
          const dummyPostsParsed = JSON.parse(dummyData);
          allPosts.push(...dummyPostsParsed);
        } catch (e) {
          console.error("Failed to parse dummyPosts:", e.message);
        }
      }

      const filteredPosts = allPosts.filter(post => {
        return (
          post.Destination?.toLowerCase().includes(query) ||
          post.userName?.toLowerCase().includes(query) ||
          post.yourStory?.toLowerCase().includes(query)
        );
      });

      res.render("search.ejs", {
        posts: filteredPosts,
        query: req.query.q,
        activePage: "search"
      });
    });
  });
});



app.listen(port,()=>{
    console.log(`server is running on port-no:${port}`);
});