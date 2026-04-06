const mysql=require("mysql2");
const mydb=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"auth_demo"
})
mydb.connect((error)=>{
    if(error){
     console.log("database no connect");
    }
    else{
        console.log("database connect");
    }
})
module.exports=mydb;