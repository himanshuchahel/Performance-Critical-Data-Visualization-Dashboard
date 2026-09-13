const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const datasets = [
  {id:"ds_001",name:"sales_data.csv",type:"CSV",rows:1234567,columns:18,size:44040192,status:"Ready",updatedAt:new Date().toISOString()},
];

app.get('/api/datasets', (req,res)=>res.json({data:datasets}));
app.get('/api/datasets/:id', (req,res)=>{
  const ds = datasets.find(d=>d.id===req.params.id);
  if(!ds) return res.status(404).json({error:"Dataset not found"});
  res.json({data:ds});
});
app.get('/api/datasets/:id/data', (req,res)=>{
  const ds = datasets.find(d=>d.id===req.params.id);
  if(!ds) return res.status(404).json({error:"Not found"});
  const cols = ["customer_id","name","revenue","region","status"];
  const rows = Math.min(parseInt(req.query.limit||"100"),1000);
  const data = Array.from({length:rows},(_,i)=>({customer_id:10001+i,name:`User ${i}`,revenue:Math.random()*2000,region:["North","South","East","West"][i%4],status:i%5===0?"Inactive":"Active"}));
  res.json({data:{rows,total:ds.rows,page:1,limit:rows,columns:cols},total:ds.rows,rows:data,limit:rows});
});
app.get('/api/health', (req,res)=>res.json({status:"ok"}));

const PORT = process.env.PORT||3001;
app.listen(PORT,()=>console.log('DataForge API on http://localhost:'+PORT));
