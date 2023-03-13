const express = require('express')
var cors =require('cors');
const app = express();
const bodyparser=require('body-parser')
app.use(cors());

const mongoose=require('mongoose');
const router = express.Router();



app.use(express.json());
app.use(bodyparser.json());


const connectDB=async ()=>{
 const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology:true,
 }

try {
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb+srv://redwan:sustian@cluster0.wnczews.mongodb.net/Ichnos?retryWrites=true&w=majority',connectionParams);
    console.log("Db is connected")

} catch (error) {
    console.log("Db is not connected");

    console.log(error.message);

    process.exist(1);
}

}





//creating schema for vacant list

const vacantschema = new mongoose.Schema({
    p_id: String,
    title: {
        type: String,
        required: true
    },
    type:String,
    location:String,

    des: String,
    org:String,
    vac:Boolean,
    createdAt:{
        type:Date,
        default:Date.now
    },
    openingdate:String,
    closingdate: String,
    host:Boolean,
    fundstatus: String,






});






//creating model for vacant

 const vacantdoc=mongoose.model("Vacants",vacantschema)

//create tender user details list

const tenderaccountschema = new mongoose.Schema({
    
   
    t_name:String,
    email:String,
    t_phone:String,
    t_ads:String,
    t_des: String,
    project:String,
    password:String
   
    
 
 
 
 
 
 
 
 });



//tenderaccount model
 const tenderaccountdoc=mongoose.model("TenderIds",tenderaccountschema);


//creating tender rq schema

const tenderschema = new mongoose.Schema({
   c_id:String,
   p_id: String,
   t_name:String,
   email:String,
   t_phone:String,
   t_ads:String,
   t_des: String,
   budget:String,
   accpt:Boolean,
   







});

//creating tender rq model

const tenderdoc=mongoose.model("Tenderlist",tenderschema);


//creating tenderid
app.post("/createtenderid",async (req,res)=>{

    try {
        const newTenderaccount= new tenderaccountdoc({
            
            t_name:req.body.t_name,
            email:req.body.email,
            t_phone:req.body.t_phone,
            t_ads:req.body.t_ads,
            t_des: req.body.t_des,
            project:"null",
            password:req.body.password
           
            

        })
        const result = await newTenderaccount.save();
        res.status(201).json(result);
        
    } catch (error) {
        res.status(500).send({message:error.message})
    }
});









//posting to vacant
var p_id= Math.floor(100000 + Math.random() * 900000);

app.post("/vacants",async (req,res)=>{

    try {
        p_id++;
        let text=p_id.toString();

        const newVacant= new vacantdoc({
            p_id: text,
            type:req.body.type,
            location:req.body.location,
            title: req.body.title,
            des: req.body.des,
            org:req.body.org,
            vac:1,
            openingdate:req.body.openingdate,
            closingdate: req.body.closingdate,
            host:false,
            fundstatus:"Not given"

        })
        const data = await newVacant.save();
        res.status(201).json(data);
        
    } catch (error) {
        res.status(500).send({message:error.message})
    }
});

//posting to tender list

app.post("/tenderlists",async (req,res)=>{

    const c_id= req.body.c_id;
    const b = req.body.budget;

   const data11= await tenderaccountdoc.find({_id:c_id},)
   console.log(data11);
         const t_name= data11[0].t_name;
          const  email= data11[0].email;
          const  t_phone= data11[0].t_phone;
          const  t_ads=data11[0].t_ads;
        //  const  budget =data11[0].t_budget;
          const  des= data11[0].t_des;

    try {
        const newTender= new tenderdoc({
            c_id:c_id,
            p_id: req.body.p_id,
            t_name:t_name,
            email:email,
            t_phone:t_phone,
            t_ads:t_ads,
            budget :b,
            t_des:des,
            accpt:0,
            

        })
        const data2 = await newTender.save();
        res.status(201).json(data2);
        
    } catch (error) {
        res.status(500).send({message:error.message})
    }
});


//get tender list

app.get("/get_fulltenderlists",async (req,res)=>{

    try {
        const result =await tenderdoc.find({})
        console.log(result)
       if(result){
        res.status(200).json({result});
       }
        
    } catch (error) {
        res.status(404).send({message:error.message})
    }
});

//getting tender id

app.get("/get_tenderid",async (req,res)=>{

    try {
        const result =await tenderaccountdoc.find({})
        console.log(result)
       if(result){
        res.status(200).json({result});
       }
        
    } catch (error) {
        res.status(404).send({message:error.message})
    }
});


//getting live detaisl against client id

app.get("/get_live",async (req,res)=>{
    const c_id= req.query.c_id;
    try {
        
        const result= await tenderdoc.aggregate([
        
          {
            $match:{
                accpt: true,
                c_id:c_id
                
               
            }
          },
          
          
          {  $lookup:{ 

                from:'vacants',
                localField:'p_id',
                foreignField:'p_id',
                as:"result"





             }

            },
          {$unwind:"$result"} ,
          {   
            $project:{
                p_id : "$result.p_id",
                title : "$result.title",
                des : "$result.des",
                org: "$result.org",
                location:"$result.location",
                type:"$result.type",
                openingdate:"$result.openingdate",
                closingdate:"$result.closingdate",
                _id:1,
                t_name:1,
                t_phone:1,
                email:1,
                t_ads:1,
                t_des:1,
                budget:1,

                fundstatus:"$result.fundstatus",
                
            } 
        }

        ]);
        console.log(result);
       if(result){
        res.status(200).json({result});
       }
        
    } catch (error) {
        res.status(404).send({message:error.message})
    }
});








//get tender list againts project id

app.get("/get_tenderlists",async (req,res)=>{

    try {
        const result =await tenderdoc.find({p_id:req.body.p_id},)
        
       if(result){
        res.status(200).json({result});
       }
        
    } catch (error) {
        res.status(404).send({message:"Not found"})
    }
});

//hosting
app.put("/hosting",async (req,res)=>{
     console.log(req.body.p_id);
    try {
        const result =await vacantdoc.updateOne({p_id:req.body.p_id},
            
            {
                $set:{host:true}
                
            }
            
            
            )

        
            console.log("hosted");
       if(result){
        res.status(200).json({sucess:true,
        message:'updated',
        data:result
        });
       }
        
    } catch (error) {
        res.status(404).send({message:error.message})
    }
});




//get tender list and project details 
app.get("/get_tenderlists_project",async (req,res)=>{

    try {
       
        const result= await vacantdoc.aggregate([
        
            {
              $match:{
                  vac:true,
                  host:true
              }
            },
            
            
            {  $lookup:{
                  from:'tenderlists',
                  localField:'p_id',
                  foreignField:'p_id',
                  as:"result"
               }
  
              },
           // {$unwind:"$result"} ,
            {   
              $project:{
                  p_id : 1,
                  title : 1,
                  des : 1,
                  org: 1,
                  location:1,
                  type:1,
                  closingdate:1,
                  openingdate:1,

                  /* _id:"$result._id",
                  t_name:"$result.t_name",
                  t_phone:"$result.t_phone",
                  email:"$result.email",
                  t_ads:"$result.t_ads",
                  des:"$result.des",*/
  
                  fundstatus:1,
                  offer:"$result"
                  
              } 
          }
  
          ]);
        
       if(result){
        res.status(200).json({result});
       }
        
    } catch (error) {
        res.status(404).send({message:"Not found"})
    }
});



//get only vacant list true

app.get("/get_vacantlists",async (req,res)=>{

    try {
        const result =await vacantdoc.find({vac:true,host:false,accpt:false})
        console.log("Vacant api worked");
       if(result){
        res.status(200).json({result});

       }
        
    } catch (error) {
        res.status(404).send({message:"Not found"})
    }
});

//gettiing vacant list agains vacant id

app.get("/get_id",async (req,res)=>{

    try {
        const data4 =await vacantdoc.find({_id:req.body.id});
        
       if(data4){
        res.status(200).json(data4);
       }
        
    } catch (error) {
        res.status(404).send({message:"Not found"})
    }
});


//accepting a tender request
//deleteing granted work from vacant 
// send me a client id

app.put("/accept",async (req,res)=>{

    try {
        const data3 =await tenderdoc.updateOne({c_id:req.body.client_id,p_id:req.body.p_id},
            
            {
                $set:{accpt:true}
            }
            
            
        )
        const data4 =await tenderaccountdoc.updateOne({_id:req.body.client_id},
            
            {
                $set:{project:req.body.p_id}
            }
            
            
        )





            const result =await vacantdoc.updateOne({p_id:req.body.p_id},
            
                {
                    $set:{vac:false,host:false}

                }
                
                
                )

        
        
       if(result){
        res.status(200).json({sucess:true,
        message:'updated',
        data:result
        });
       }
        
    } catch (error) {
        res.status(404).send({message:error.message})
    }
});


//Fund Status

app.put("/fund",async (req,res)=>{
    

    try {
       
             const f=req.body.fundstatus;
             console.log(f);
          if(f=="1")
            {   console.log("loop 1");
                const resul =await vacantdoc.updateOne({p_id:req.body.p_id},

                 
               
                {  
                    $set:{fundstatus:"Requested"}
                }
                
                
                )
                if(resul){
                    res.status(200).json({sucess:true,
                    message:'updated',
                    data:resul
                    });
                   }
            
            
            }
               else if(f=="2")
            {const result =await vacantdoc.updateOne({p_id:req.body.p_id},

                 
               
                {  
                    $set:{fundstatus:"Accepted"}
                }
                
                
                )
                if(result){
                    res.status(200).json({sucess:true,
                    message:'updated',
                    data:result
                    });
                   }
            
            }
               else if(f=="3")
               {const resul =await vacantdoc.updateOne({p_id:req.body.p_id},

                 
               
                {  
                    $set:{fundstatus:"Rejected"}
                }
                
                
                )
                if(resul){
                    res.status(200).json({sucess:true,
                    message:'updated',
                    data:resul
                    });
                   }
            }

        
        
      /* if(resul){
        res.status(200).json({sucess:true,
        message:'updated',
        data:resul
        });
       }*/
        
    } catch (error) {
        res.status(404).send({message:error.message})
    }
});



//list of granted  live project

app.get("/grantdetails",async (req,res)=>{

    try {
        
        const result= await tenderdoc.aggregate([
        
          {
            $match:{
                accpt: true,

               
            }
          },
          
          
          {  $lookup:{

                from:'vacants',
                localField:'p_id',
                foreignField:'p_id',
                as:"result"





             }

            },
          {$unwind:"$result"} ,
          {   
            $project:{
                p_id : "$result.p_id",
                title : "$result.title",
                des : "$result.des",
                org: "$result.org",
                location:"$result.location",
                type:"$result.type",
                openingdate:"$result.openingdate",
                closingdate:"$result.closingdate",
                _id:1,
                t_name:1,
                t_phone:1,
                email:1,
                t_ads:1,
                t_des:1,
                budget:1,

                fundstatus:"$result.fundstatus",
                
            } 
        }

        ]);
        console.log(result);
       if(result){
        res.status(200).json({result});
       }
        
    } catch (error) {
        res.status(404).send({message:error.message})
    }
});


//get tender_id with working list

/*app.get("/get_tenderid",async (req,res)=>{

    try {


        const data111= await tenderdoc.find({accpt:true});



        
        const result= await vacantdoc.aggregate([
        
        
          
          {  $lookup:{

                from:'tenderlists',
                localField:'_id',
                foreignField:'c_id',
                as:"working"





             }

            },
         // {$unwind:"$working"} ,
          {   
            $project:{
                works : "$working",
               /* title : "$result.title",
                des : "$result.des",
                org: "$result.org",
                location:"$result.location",
                type:"$result.type",
                startdate:"$result.openingdate",
                enddate:"$result.closingdate",
                _id:1,
                t_name:1,
                t_phone:1,
                email:1,
                t_ads:1,
                des:1,
                budget:1,

                fundstatus:"$result.fundstatus",
                
            } 
        }

        ]);
        console.log(result);
       if(result){
        res.status(200).json({result});
       }
        
    } catch (error) {
        res.status(404).send({message:error.message})
    }
})*/

//Reject offer
app.delete("/reject_offer",async (req,res)=>{
        const k=req.body.c_id;
        
    try {
        const result =await tenderdoc.deleteOne({c_id:k});
        
       if(result){
        res.status(200).json(result);
       }
        
    } catch (error) {
        res.status(404).send({message:"Not found"})
    }
});


//Auth

app.get("/auth",async (req,res)=>{
     const x = req.query.email;
     const y= req.query.password;

    try {
        const result=await tenderaccountdoc.find({email:x});
        const pass = result[0].password;
       if(pass==y){
        res.status(200).json({"success":true,"client_id":result[0]._id});
       }
       else{
        res.status(404).send({"success":false})
       }
        
    } catch (error) {
        res.status(404).send({"success":false,"message":"Create Account!"})
    }
});




app.get('/',(req,res)=>{ 
    res.send("yo");
}
)










app.listen(3000,async()=>{
    console.log("yey, server  running on 3000");
    await connectDB();

 });

