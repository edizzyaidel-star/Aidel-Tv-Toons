import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(express.json({limit:"2mb"}));
app.use(cors({origin:process.env.ALLOWED_ORIGIN || "*"}));

app.get("/api/health",(_req,res)=>res.json({ok:true,service:"AIDEL TOONS backend",version:"1.0.0"}));

async function forwardToWorkflow(url, payload, res, kind) {
  if (!url) return res.status(501).json({
    error:`${kind} generation is not connected yet.`,
    message:`The AIDEL TOONS ${kind.toLowerCase()} endpoint is ready, but its AI workflow URL has not been configured. Add it to the backend environment variables.`
  });
  try {
    const headers={"Content-Type":"application/json"};
    if(process.env.AI_WEBHOOK_TOKEN) headers["Authorization"]=`Bearer ${process.env.AI_WEBHOOK_TOKEN}`;
    const upstream=await fetch(url,{method:"POST",headers,body:JSON.stringify(payload)});
    const text=await upstream.text();
    let data;try{data=JSON.parse(text)}catch{data={result:text}}
    if(!upstream.ok)return res.status(502).json({error:`AI provider workflow returned ${upstream.status}`,details:data});
    return res.json({ok:true,message:`${kind} request sent to your connected workflow.`,result:data});
  } catch(error) {
    return res.status(502).json({error:"Could not reach the AI workflow.",details:error.message});
  }
}

app.post("/api/generate-music",(req,res)=>{
  const {title,lyrics}=req.body||{};
  if(!title||!lyrics)return res.status(400).json({error:"Song title and lyrics are required."});
  return forwardToWorkflow(process.env.AI_MUSIC_WEBHOOK,req.body,res,"Music");
});
app.post("/api/generate-video",(req,res)=>{
  const {title,lyrics}=req.body||{};
  if(!title||!lyrics)return res.status(400).json({error:"Video title and lyrics are required."});
  return forwardToWorkflow(process.env.AI_VIDEO_WEBHOOK,req.body,res,"Video");
});

const port=process.env.PORT||3000;
app.listen(port,()=>console.log(`AIDEL TOONS backend listening on ${port}`));
