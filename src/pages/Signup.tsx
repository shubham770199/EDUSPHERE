
import { useState } from "react";
import axios from "axios";

export default function Signup(){
 const [name,setName]=useState("");
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");

 const submit=async()=>{
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const res = await axios.post(`${apiUrl}/api/signup`,{name,email,password});
  alert(res.data.message);
 };

 return (
  <div style={{padding:40}}>
   <h2>Signup</h2>
   <input placeholder="name" onChange={e=>setName(e.target.value)} />
   <br/>
   <input placeholder="email" onChange={e=>setEmail(e.target.value)} />
   <br/>
   <input type="password" placeholder="password" onChange={e=>setPassword(e.target.value)} />
   <br/>
   <button onClick={submit}>Signup</button>
  </div>
 );
}
