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

// prendo i post dal file json e li mando al client
app.get('/posts', (req, res) => {
    if (!fs.existsSync('./posts.json')) {
        return res
            .status(400)
            .json({
                success: false,
                error: "Non esiste alcun Post."
            })
    }

    const data = fs.readFileSync('./posts.json', 'utf-8');
    const posts = JSON.parse(data); // trasforma un oggetto json in un array

    if (!posts) {
        return res
            .status(400)
            .json({
                success: false,
                error: "Non esiste alcun Post."
            })
    }

    return res
        .status(200)
        .json({
            success: true,
            posts: posts
        });
});

app.post('/api/post', (req, res) => {
    const post = req.body;

    if (!post) {
        return res
            .status(400)
            .json({
                success: false,
                message: "Post fallito"
            });
    }

    let posts = [];

    if (fs.existsSync('./posts.json')) {
        const data = fs.readFileSync('./posts.json', 'utf-8');
        posts = JSON.parse(data);
    }
    if (!Array.isArray(posts)) {
        posts = [];
    }

    if (fs.existsSync('./postId.txt')) {
        const id = fs.readFileSync('./postId.txt', 'utf-8');
        let next_id = Number(id);
        next_id++;
        fs.writeFileSync('./postId.txt', String(next_id));
    } else {
        const start_id = 0;
        fs.writeFileSync('./postId.txt', String(start_id));
    }

    const actual_id = fs.readFileSync('./postId.txt', 'utf-8');
    post.id = Number(actual_id);
    post.comments = [];

    posts.push(post);

    fs.writeFileSync('./posts.json', JSON.stringify(posts, null, 2));

    res.redirect('/');
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

    const data = fs.readFileSync('./users.json', 'utf-8');
    const users_data = JSON.parse(data);

    const existing_user = users_data.find(u => u.name === user.name && u.email === user.email);

    if (existing_user) {
        return res
            .status(404)
            .json({
                success: false,
                message: "Utente già esistente"
            });
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

    users.push(user);

    fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));

    res.status(200).json({
        success: true,
        name: user.username
    });

});

app.post('/api/comment', (req, res) => {
    const { post_id, comment, autore } = req.body;

    if (!post_id) {
        return res
            .status(400)
            .json({
                success: false,
                message: "Deve essere specificato un id di un post valido"
            });
    }

    const data = fs.readFileSync('./posts.json', 'utf-8');
    const posts = JSON.parse(data);

    const post = posts.find(p => p.id === Number(post_id));

    if (!post) {
        return res
            .status(401)
            .json({
                success: false,
                message: "Post non trovato"
            });
    }

    post.comments.push({
        commento: comment,
        autore: autore
    });

    fs.writeFileSync('./posts.json', JSON.stringify(posts, null, 2));

    return res
        .status(200)
        .json({
            success: true,
            message: "Commento aggiunto con successo"
        });
})

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

    res.status(200).json({
        success: true,
        name: existing_user.username
    });

});

app.use((req, res) => {
    res.send(`<h1>Errore 404 - Pagina non trovata</h1>`);
});

app.listen(PORT, () => {
    console.log("Server attivo sulla porta " + PORT + " http://localhost:" + PORT);
});