const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 5000;

// diciamo all'applicazione di usare le risorse statiche nella cartella pagina
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// rotte get per le pagine html statiche

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// rotta get parametrica per renderizzare commenti specifici del post
app.get('/posts/:id/comments', (req, res) => {
    // ricerchiamo l'id nei parametri e lo rendiamo un numero
    const postId = Number(req.params.id);

    // verifichiamo che il json dei post esista, senno restituiamo un array vuoto
    if (!fs.existsSync('./posts.json')) {
        return res
            .status(200)
            .json({
            success: true,
            comments: []
            });
    }

    // leggiamo i dati dal json e li trasformiamo con parse in un array di oggetti javascript
    const data = fs.readFileSync('./posts.json', 'utf-8');
    const posts = JSON.parse(data);

    // ricerchiamo il post dall'id univoco
    const post = posts.find(p => p.id === postId);

    // se non esiste, restituiamo errore
    if (!post) {
        return res
            .status(404)
            .json({
                success: false,
                message: "Post non trovato"
            })
    }

    // se tutto va a buon fine, restituiamo l'array di commenti del post
    return res.json({
        success: true,
        comments: post.comments || []
    });
})

// rotta get che restituisce tutti posts presenti nel file json
app.get('/posts', (req, res) => {
    // verifichiamo che il file posts.json esista, restituendo errore nel caso non esista
    if (!fs.existsSync('./posts.json')) {
        return res
            .status(400)
            .json({
                success: false,
                error: "Non esiste alcun Post."
            })
    }

    // leggiamo i dati dal json e li trasformiamo con parse in un array di oggetti javascript
    const data = fs.readFileSync('./posts.json', 'utf-8');
    const posts = JSON.parse(data);

    // se non esistono post, restituiamo errore
    if (!posts) {
        return res
            .status(400)
            .json({
                success: false,
                error: "Non esiste alcun Post."
            })
    }

    // se tutto va a buon fine, restituiamo l'array con i post
    return res
        .status(200)
        .json({
            success: true,
            posts: posts
        });
});

// rotta post per aggiungere un post al json dei post
app.post('/api/post', (req, res) => {
    // riprendiamo i dati del post dal body della richiesta
    const post = req.body;

    // se non esistono, restituiamo errore
    if (!post) {
        return res
            .status(400)
            .json({
                success: false,
                message: "Post fallito"
            });
    }

    // prima di aggiungere il post al json, verifichiamo che esso sia una lista

    // inizializziamo una lista, che verrà popolata con i dati del json se esistono
    // oppure diventerà il json stesso se esso è vuoto o non esiste
    let posts = [];

    // verifichiamo l'esistenza del json dei post
    if (fs.existsSync('./posts.json')) {
        // riprendiamo i dati e il trasformiamo in un array di oggetti javascript per manipolarli
        const data = fs.readFileSync('./posts.json', 'utf-8');
        posts = JSON.parse(data);
    }

    // se il json dei posts contiene qualcosa ma non è un array, ritrasformiamo
    // la lista che li contiene in un array vuoto
    if (!Array.isArray(posts)) {
        posts = [];
    }

    // procedura per dare un id univoco ad ogni post

    // verifichiamo che il file che salva l'id dei post esista
    if (fs.existsSync('./postId.txt')) {
        // se esiste lo aumentiamo di 1
        const id = fs.readFileSync('./postId.txt', 'utf-8');
        let next_id = Number(id);
        next_id++;
        fs.writeFileSync('./postId.txt', String(next_id));
    } else {
        // se non esiste, lo inizializziamo a 1
        const start_id = 1;
        fs.writeFileSync('./postId.txt', String(start_id));
    }

    // riprendiamo l'id attuale e lo assegniamo al post
    const actual_id = fs.readFileSync('./postId.txt', 'utf-8');
    post.id = Number(actual_id);

    // inizializziamo i commenti del post
    post.comments = [];

    posts.push(post);

    // scriviamo i post sul json con stringify per riconvertirli
    fs.writeFileSync('./posts.json', JSON.stringify(posts, null, 2));

    // reindirizziamo alla home
    res.redirect('/');
});

// rotta per il login
app.post('/api/login', (req, res) => {
    // riprendiamo i dati dell'utente dal body della richiesta
    const user = req.body;

    // se non esiste, restituiamo errore
    if (!user) {
        return res
            .status(400)
            .json({
                success: false,
                message: "Login fallito"
            });
    }

    // verifichiamo l'esistenza del json degli utenti, se non c'è restituiamo errore
    if (!fs.existsSync('./users.json')) {
        return res
            .status(401)
            .json({
                success: false,
                message: "Utente non trovato"
            });
    }

    // riprendiamo i dati dal json e convertiamoli in array javascript
    const data = fs.readFileSync('./users.json', 'utf-8');
    const users = JSON.parse(data);

    // verifichiamo l'esistenza dell'utente
    const existing_user = users.find(u => u.name === user.name && u.email === user.email);

    // se non esiste, il login fallisce
    if (!existing_user) {
        return res
            .status(404)
            .json({
                success: false,
                message: "Utente non trovato"
            });
    }

    // restituiamo il nome dell'utente, che servirà nella rotta parametrica
    res.status(200).json({
        success: true,
        name: existing_user.username
    });

});

// rotta post per la registrazione
app.post('/api/register', (req, res) => {
    // riprendiamo i dati dell'utente dal body della richiesta
    const user = req.body;

    // se non esiste, restituiamo errore
    if (!user) {
        return res
            .status(400)
            .json({
                success: false,
                message: "Registrazione fallita"
            });
    }

    // prima di aggiungere l'utente al json, verifichiamo che esso sia una lista

    // inizializziamo una lista, che verrà popolata con i dati del json se esistono
    // oppure diventerà il json stesso se esso è vuoto o non esiste
    let users = [];

    // verifichiamo l'esistenza del json
    if (fs.existsSync('./users.json')) {
        // riprendiamo i dati e il trasformiamo in un array di oggetti javascript per manipolarli
        const data = fs.readFileSync('./users.json', 'utf-8');
        users = JSON.parse(data);
    }

    // se il json degli users contiene qualcosa ma non è un array, ritrasformiamo
    // la lista che li contiene in un array vuoto
    if (!Array.isArray(users)) {
        users = [];
    }

    // se l'utente già esiste, restituiamo errore
    const existing_user = users.find(u => u.name === user.name && u.email === user.email);

    if (existing_user) {
        return res
            .status(404)
            .json({
                success: false,
                message: "Utente già esistente"
            });
    }

    // verifichiamo che il file che salva l'id degli utenti esista
    if (fs.existsSync('./id.txt')) {
        // se esiste lo aumentiamo di 1
        const id = fs.readFileSync('./id.txt', 'utf-8');
        let next_id = Number(id);
        next_id++;
        fs.writeFileSync('./id.txt', String(next_id));
    } else {
        // se non esiste, lo inizializziamo a 1
        const start_id = 1;
        fs.writeFileSync('./id.txt', String(start_id));
    }

    // riprendiamo l'id attuale e lo assegniamo allo user
    const actual_id = fs.readFileSync('./id.txt', 'utf-8');
    user.id = Number(actual_id);

    users.push(user);

    // scriviamo gli users aggiornati sul json con stringify per riconvertirli
    fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));

    // restituiamo il nome dell'utente, che servirà nella rotta parametrica
    res.status(200).json({
        success: true,
        name: user.username
    });

});

// rotta post per aggiungere un commento ad un post specifico
app.post('/api/comment', (req, res) => {
    // riprendiamo dalla richiesta i dati che ci servono
    const { post_id, comment, autore } = req.body;

    // se l'id del post o il commento sono assenti, restituiamo errore
    if (!post_id || !comment) {
        return res.status(400).json({
            success: false,
            message: "Dati incompleti: post_id o commento mancanti."
        });
    }

    // verifichiamo che esista il json dei post
    if (!fs.existsSync('./posts.json')) {
        return res
            .status(500)
            .json({
                success: false,
                message: "Database non trovato"
            });
    }

    // riprendiamo i dati del post e convertiamoli come array javascript
    const data = fs.readFileSync('./posts.json', 'utf-8');
    const posts = JSON.parse(data);

    // ricerchiamo il post specifico dall'id univoco
    const post = posts.find(p => p.id === Number(post_id));

    // se non esiste, restituiamo errore
    if (!post) {
        return res
            .status(404)
            .json({
                success: false,
                message: "Post non trovato"
            });
    }

    // se i commenti sono assenti, inizializziamoli come lista vuota
    if (!post.comments) post.comments = [];

    // pushamo l'oggetto commento all'array di commenti del post
    post.comments.push({
        commento: comment,
        autore: autore || "Anonimo"
    });

    // riscriviamo il json dei post riconvertendo con stringify
    fs.writeFileSync('./posts.json', JSON.stringify(posts, null, 2));

    return res.status(200).json({
        success: true,
        message: "Commento aggiunto con successo"
    });
});

// restituiamo errore 404 in caso l'indirizzo della pagina non esista
app.use((req, res) => {
    res.send(`<h1>Errore 404 - Pagina non trovata</h1>`);
});

app.listen(PORT, () => {
    console.log("Server attivo sulla porta " + PORT + " http://localhost:" + PORT);
});

