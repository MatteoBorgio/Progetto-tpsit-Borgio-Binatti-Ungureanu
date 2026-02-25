const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 5000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/api/register', (req, res) => {
    const user = req.body;

    if (!user) {
        return res
            .status(400)
            .json({
                success: false,
                message: "Registrazione fallita"
            });
    }

    let users = [];

    if (fs.existsSync('./users.json')) {
        const data = fs.readFileSync('./users.json', 'utf-8');
        users = JSON.parse(data);
    }
    if (!Array.isArray(users)) {
        users = [];
    }

    if (fs.existsSync('./id.txt')) {
        const id = fs.readFileSync('./id.txt', 'utf-8');
        let next_id = Number(id);
        next_id++;
        fs.writeFileSync('./id.txt', String(next_id));
    } else {
        const start_id = 0;
        fs.writeFileSync('./id.txt', String(start_id));
    }

    const actual_id = fs.readFileSync('./id.txt', 'utf-8');
    user.id = Number(actual_id);

    const check_if_user_exist = users.find(u => u.name === user.name && u.email === user.email);

    if (check_if_user_exist) {
        return res
            .status(400)
            .json({
               success: false,
               message: "L'utente già esiste"
            });
    }

    users.push(user);

    fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));

    res.redirect('/');
});

app.post('/api/login', (req, res) => {
    const user = req.body;

    if (!user) {
        return res
            .status(400)
            .json({
                success: false,
                message: "Login fallito"
            });
    }

    if (!fs.existsSync('./users.json')) {
        return res
            .status(401)
            .json({
                success: false,
                message: "Utente non trovato"
            });
    }

    const data = fs.readFileSync('./users.json', 'utf-8');
    const users = JSON.parse(data);

    const existing_user = users.find(u => u.name === user.name && u.email === user.email);

    if (!existing_user) {
        return res
            .status(404)
            .json({
               success: false,
               message: "Utente non trovato"
            });
    }

    res.redirect('/');

});

app.use((req, res) => {
    res.send(`<h1>Errore 404 - Pagina non trovata</h1>`);
});

app.listen(PORT, () => {
    console.log("Server attivo sulla porta " + PORT)
});