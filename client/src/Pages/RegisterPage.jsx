import React, { useState } from "react";

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    async function register(ev) {
        ev.preventDefault();
        const response = await fetch("http://localhost:5000/api/user/register", {
            method: "POST",
            body: JSON.stringify({username, password}),
            headers: {'Content-Type':'application/json'}
        });
        if(response.status === 200) {
            alert("registration successful!");
        } else {
            alert("registration failed!")
        }
    }
    return (
        <form className="register" onSubmit={register}>
            <h1>Register</h1>
            <input type="text" placeholder="username" value={username} onChange={ev => setUsername(ev.target.value)}/>
            <input type="password" placeholder="password" value={password} onChange={ev => setPassword(ev.target.value)}/>
            <button className="btn">Register</button>
        </form>
    );
}

export default RegisterPage;