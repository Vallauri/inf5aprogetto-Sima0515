"use strict"
const fs = require('fs');
const url = require('url');
const path = require('path');
const HEADERS = require('headers');
const ERRORS = require('errors');
const HTTPS = require('https');
//mongoose.connect("mongodb+srv://" + process.env.DBProgetto + ":" + process.env.DBprogetto1423513 + "@dbprogetto-5y5yb.mongodb.net/test?retryWrites=true&w=majority");
// mongo
const MONGO_CLIENT = require("mongodb").MongoClient;
const STRING_CONNECT = 'mongodb://127.0.0.1:27017';
const PARAMETERS = {
    useNewUrlParser: true,
    /* useUnifiedTopology: true */
};

// express
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");

// Online RSA Key Generator
const privateKey = fs.readFileSync("keys/private.key", "utf8");
const certificate = fs.readFileSync("keys/certificate.crt", "utf8");
const credentials = {"key":privateKey, "cert":certificate};

// avvio server
const TIMEOUT = 90; // 180 SEC
let pageNotFound;

var httpsServer = HTTPS.createServer(credentials, app);
httpsServer.listen(8888, function() {
    fs.readFile("./static/index.html", function(err, content) {
        if (err)
            content = "<h1>Risorsa non trovata</h1>"
        pageNotFound = content.toString();
    });
    console.log("Server in ascolto sulla porta: " + this.address().port);
});

/* ************************************************************ */

// middleware
app.use("/", bodyParser.json());
app.use("/", bodyParser.urlencoded({ extended: true }));

app.use("/", function(req, res, next) {
    console.log(">_ " + req.method + ": " + req.originalUrl);
    if (Object.keys(req.query).length != 0)
        console.log("Parametri GET: " + JSON.stringify(req.query));
    if (Object.keys(req.body).length != 0)
        console.log("Parametri BODY: " + JSON.stringify(req.body));
    // Il log di req.params può essere fatto solo DOPO aver assegnato un nome	
    next();
});

/* --------------------------------------------------------------- */
app.get('/', function(req, res, next) {
    controllaToken(req, res, next);
});
app.get('/index.html', function(req, res, next) {
    controllaToken(req, res, next);
});
/* --------------------------------------------------------------- */

app.use("/", express.static('./static'));

// controllo del token
app.use('/api', function(req, res, next) {
    controllaToken(req, res, next);
});

function controllaToken(req, res, next) {
    if (req.originalUrl == '/api/loginA' || req.originalUrl == '/api/loginU' || req.originalUrl == '/api/insertAmministratore'|| 
    req.originalUrl == '/api/insertCondomino' || req.originalUrl == '/api/lastIdCondominio'|| req.originalUrl == '/api/insertCondominio' ||
    req.originalUrl == '/api/thisNameC' || req.originalUrl == '/api/esistenzaCondominio' || req.originalUrl == '/api/updateUtente' || 
    req.originalUrl == '/api/ricercaIdCondominio' || req.originalUrl == '/api/logout' || req.originalUrl == '/api/thisNameCondominio' || 
    req.originalUrl == '/api/lastIdRichiesta' || req.originalUrl == '/api/insertRichiesta' || req.originalUrl == '/api/lastIdSegnalazione' ||
    req.originalUrl == '/api/insertSegnalazione' || req.originalUrl == '/api/elencoProprieta' || req.originalUrl == '/api/findidCondominio'|| 
    req.originalUrl == 'elencoProprietaC' || req.originalUrl == '/api/elencoPagamentiMensili'  || req.originalUrl == '/api/richiediPagamentiMensili'||
    req.originalUrl == '/api/elencoPagamentiEffettuati' || req.originalUrl == '/api/confermaPagamento' || req.originalUrl == '/api/richiediThisPagamento'||
    req.originalUrl == '/api/elencoPagamentiAnnuali' || req.originalUrl == '/api/richiediPagamentiAnnuali' || req.originalUrl == '/api/inserisciPagamentiAnnuali'||
    req.originalUrl == '/api/lastIdPagamentoAnnuali' || req.originalUrl == '/api/richiediThisPagamentoAnnuali' || req.originalUrl == '/api/updatePagamentiAnnuali'||
    req.originalUrl == '/api/elencoPagamentiMensiliCA' || req.originalUrl == '/api/elencoPagamentiEffettuatiA' || req.originalUrl == '/api/confermaPagamentoA'||
    req.originalUrl == '/api/elencoMessaggi' ||  req.originalUrl == '/api/elencoSegnalazioni'||  req.originalUrl == '/api/elencoMessaggiA'|| req.originalUrl == '/api/elencoPagamentiEffettuatiM' ||
    req.originalUrl == '/api/ricercaPagamento'||  req.originalUrl == '/api/elencoPagamentiEffettuatiAA'||  req.originalUrl == '/api/elencoSpeseMensiliCAA' ||  req.originalUrl == '/api/elencoSpeseMensiliC' ||
    req.originalUrl == '/api/VisUtenti' || req.originalUrl == '/api/rimuoviThisCondomino')
        {           
              
        next();}
    else {
        let token = readCookie(req);
        if (token == '') {
            error(req, res, null, ERRORS.FORBIDDEN);
        } else {
            jwt.verify(token, privateKey, function(err, payload) {
                if (err)
                    error(req, res, err, ERRORS.FORBIDDEN);
                else {
                    // aggiornamento del token
                    var exp = Math.floor(Date.now() / 1000) + TIMEOUT;
                    payload = {...payload, 'exp': exp }
                    token = createToken(payload)
                    writeCookie(res, token)
                    req.payload = payload;
                    next();
                }
            });
        }
    }
}

function readCookie(req) {
    var valoreCookie = "";
    if (req.headers.cookie) {
        var cookies = req.headers.cookie.split('; ');
        for (var i = 0; i < cookies.length; i++) {
            cookies[i] = cookies[i].split("=");
            if (cookies[i][0] == "token") {
                valoreCookie = cookies[i][1];
                break;
            }
        }
    }
    return valoreCookie;
}

/* ************************************************************ */

app.post('/api/rimuoviThisCondomino', function (req, res, next) {
    console.log("Entro");
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('condomini');
            let myquery = {codiceFiscale:req.body.codiceFiscale};
            let newValues = {$set: {idCondominio:null}};

            collection.updateOne(myquery,newValues, function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                }
                else {
                    console.log("YA");
                    res.send(JSON.stringify({ "ris": data }));
                    
                }
                client.close();
            });
        }
    });
});

app.post("/api/VisUtenti", function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('condomini');
            collection.find({idCondominio:req.body.idCondominio}).toArray(function (err, data) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("NOn ce la fa");}
                else{
                    res.send(JSON.stringify({ "ris": data }));
                    console.log("Ce l fa");}
                client.close();
            });
        }
    });
});


app.post('/api/thisName', function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('amministratori');
            let query ={codiceFiscale: req.body.codiceFiscale}
            console.log(req.body.codiceFiscale);
            collection.find(query).toArray(function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("No Non riuscito");
                }
                else{
                    res.send(JSON.stringify(data));
                    console.log("Nome trovato");
                    console.log(data);
                }
                client.close();
            });
        }
    });
});

app.post('/api/thisNameC', function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('condomini');
            let query ={codiceFiscale: req.body.codiceFiscale}
            console.log(req.body.codiceFiscale);
            collection.find(query).toArray(function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("No Non riuscito");
                }
                else{
                    res.send(JSON.stringify(data));
                    console.log("Nome trovato");
                    console.log(data);
                }
                client.close();
            });
        }
    });
});

app.post('/api/thisNameCondominio', function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('condominio');
            let query ={idCondominio: req.body.idCondominio}
            console.log(req.body.idCondominio);
            collection.find(query).toArray(function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("No Non riuscito");
                }
                else{
                    res.send(JSON.stringify(data));
                    console.log("Condominio trovato");
                    console.log(data);
                }
                client.close();
            });
        }
    });
});

app.post('/api/ricercaIdCondominio', function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('condominio');
            let query ={CodiceCatastale: req.body.codiceCatastale}
            console.log(req.body.codiceCatastale);
            collection.find(query).toArray(function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("No Non riuscito");
                }
                else{
                    res.send(JSON.stringify(data));
                    console.log("idCondominio trovato");
                    console.log(data);
                }
                client.close();
            });
        }
    });
});

/******************************************************/
/********************Pagamenti Mensili, amm************************/
/******************************************************/
app.post("/api/elencoPagamentiMensili", function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('speseMensili');
            collection.find({idCondominio:req.body.idCondominio}).sort({ idSpesa: -1 }).toArray(function (err, data) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("NOn ce la fa");}
                else{
                    res.send(JSON.stringify({ "ris": data }));
                    console.log("Ce l fa");}
                client.close();
            });
        }
    });
});
app.post("/api/richiediPagamentiMensili", function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('speseMensili');
            collection.find({idCondominio:req.body.idCondominio, anno:req.body.anno, mese:req.body.mese}).toArray(function (err, data) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("NOn ce la fa");}
                else{
                    res.send(JSON.stringify({ "ris": data }));
                    console.log("Ce l fa");}
                client.close();
            });
        }
    });
});
app.post("/api/inserisciPagamentiMensili", function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('speseMensili');
            let par = {
                "Tipologia": req.body.Tipologia,
                "giorno":req.body.giorno,
                "mese":req.body.mese,
                "anno":req.body.anno,
                "Descrizione":req.body.Descrizione,
                "idCondominio":req.body.idCondominio,
                "idSpesa":req.body.idSpesa, 
                "Importo":req.body.Prezzo
            };

            collection.insertOne(par, function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("Errore nella insertOne");
                }
                else {
                    res.send(JSON.stringify(data));
                    console.log("Ho inserito l'amministratore");
                }
                client.close();
            });
        }
    });
});
app.post('/api/lastIdPagamentoMensile', function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('speseMensili');
            collection.find({}).project({ idSpesa: 1 }).sort({ idSpesa: -1 }).limit(1).toArray(function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("No ID");
                }
                else{
                    res.send(JSON.stringify(data));
                    console.log("Id trovato");
                    console.log(data);
                }
                client.close();
            });
        }
    });
});
app.post('/api/richiediThisPagamento', function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('speseMensili');
            let query ={idSpesa: req.body.idSpesa}
            collection.find(query).toArray(function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("No Non riuscito");
                }
                else{
                    res.send(JSON.stringify(data));
                    console.log("Pagamento trovato");
                    console.log(data);
                }
                client.close();
            });
        }
    });
});
app.post('/api/updatePagamentiMensili', function (req, res, next) {
    console.log("Entro");
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('speseMensili');
            let myquery = {idSpesa:req.body.idSpesa};
            let newValues = {$set: {Tipologia:req.body.Tipologia, Descrizione:req.body.Descrizione, Importo:req.body.Prezzo}};

            collection.updateOne(myquery,newValues, function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                }
                else {
                    console.log("YA");
                    res.send(JSON.stringify({ "ris": data }));
                    
                }
                client.close();
            });
        }
    });
});
/******************************************************/ 
/********************Pagamenti Annuali, amm************************/
/******************************************************/
app.post("/api/elencoPagamentiAnnuali", function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('speseAnnuali');
            collection.find({idCondominio:req.body.idCondominio}).toArray(function (err, data) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("NOn ce la fa");}
                else{
                    res.send(JSON.stringify({ "ris": data }));
                    console.log("Ce l fa");}
                client.close();
            });
        }
    });
});
app.post("/api/richiediPagamentiAnnuali", function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('speseAnnuali');
            collection.find({idCondominio:req.body.idCondominio, anno:req.body.anno, mese:req.body.mese}).toArray(function (err, data) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("NOn ce la fa");}
                else{
                    res.send(JSON.stringify({ "ris": data }));
                    console.log("Ce l fa");}
                client.close();
            });
        }
    });
});
app.post("/api/inserisciPagamentiAnnuali", function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('speseAnnuali');
            let par = {
                "Tipologia": req.body.Tipologia,
                "giorno":req.body.giorno,
                "mese":req.body.mese,
                "anno":req.body.anno,
                "Descrizione":req.body.Descrizione,
                "idCondominio":req.body.idCondominio,
                "idSpesa":req.body.idSpesa, 
                "Importo":req.body.Prezzo
            };

            collection.insertOne(par, function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("Errore nella insertOne");
                }
                else {
                    res.send(JSON.stringify(data));
                    console.log("Ho inserito l'amministratore");
                }
                client.close();
            });
        }
    });
});
app.post('/api/lastIdPagamentoAnnuali', function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('speseAnnuali');
            collection.find({}).project({ idSpesa: 1 }).sort({ idSpesa: -1 }).limit(1).toArray(function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("No ID");
                }
                else{
                    res.send(JSON.stringify(data));
                    console.log("Id trovato");
                    console.log(data);
                }
                client.close();
            });
        }
    });
});
app.post('/api/richiediThisPagamentoAnnuali', function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('speseAnnuali');
            let query ={idSpesa: req.body.idSpesa}
            collection.find(query).toArray(function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("No Non riuscito");
                }
                else{
                    res.send(JSON.stringify(data));
                    console.log("Pagamento trovato");
                    console.log(data);
                }
                client.close();
            });
        }
    });
});
app.post('/api/updatePagamentiAnnuali', function (req, res, next) {
    console.log("Entro");
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('speseAnnuali');
            let myquery = {idSpesa:req.body.idSpesa};
            let newValues = {$set: {Tipologia:req.body.Tipologia, Descrizione:req.body.Descrizione, Importo:req.body.Prezzo}};

            collection.updateOne(myquery,newValues, function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                }
                else {
                    console.log("YA");
                    res.send(JSON.stringify({ "ris": data }));
                    
                }
                client.close();
            });
        }
    });
});
/******************************************************/
/********************Pagamenti Mensili, cond************************/
/******************************************************/
//, idSpesa : {$nin:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]}
app.post("/api/elencoPagamentiMensiliC", function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('speseMensili');
        collection.find({idCondominio:req.body.idCondominio, idSpesa : {$nin:req.body.idPagamentiEffettuati}}).sort({ idSpesa: -1 }).toArray(function (err, data) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("NOn ce la fa");}
                else{
                    res.send(JSON.stringify({ "ris": data }));
                    console.log("Ce l fa");}
                client.close();
            });
        }
    });
});
app.post("/api/elencoSpeseMensiliC", function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('speseMensili');
        collection.find({idCondominio:req.body.idCondominio, idSpesa : {$in:req.body.idSpese}}).sort({ idSpesa: -1 }).toArray(function (err, data) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("NOn ce la fa");}
                else{
                    res.send(JSON.stringify({ "ris": data }));
                    console.log("Ce l fa");}
                client.close();
            });
        }
    });
});
app.post("/api/elencoSpeseMensiliCAA", function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('speseAnnuali');
        collection.find({idCondominio:req.body.idCondominio, idSpesa : {$in:req.body.idSpese}}).sort({ idSpesa: -1 }).toArray(function (err, data) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("NOn ce la fa");}
                else{
                    res.send(JSON.stringify({ "ris": data }));
                    console.log("Ce l fa");}
                client.close();
            });
        }
    });
});
app.post("/api/elencoPagamentiEffettuati", function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('pagamentoUtenti');
            collection.find({codiceFiscale:req.body.codiceFiscale}).toArray(function (err, data) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("NOn ce la fa");}
                else{
                    res.send(JSON.stringify({ "ris": data }));
                    console.log("Ce l fa");}
                client.close();
            });
        }
    });
});
app.post("/api/elencoPagamentiEffettuatiAA", function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('pagamentoUtentiA');
            collection.find({codiceFiscale:req.body.codiceFiscale}).toArray(function (err, data) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("NOn ce la fa");}
                else{
                    res.send(JSON.stringify({ "ris": data }));
                    console.log("Ce l fa");}
                client.close();
            });
        }
    });
});
app.post("/api/confermaPagamento", function (req, res, next) {
    console.log("Entro in inserimento");
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('pagamentoUtenti');
            let par = {                
                "idSpesa": parseInt(req.body.idSpesa),
                "codiceFiscale":req.body.codiceFiscale,
                "Tipologia": req.body.Tipologia,
                "Descrizione":req.body.Descrizione,
                "giorno":req.body.giorno,
                "mese":req.body.mese,
                "anno":req.body.anno
            };

            collection.insertOne(par, function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("Errore nella insertOne");
                }
                else {
                    res.send(JSON.stringify(data));
                    console.log("Ho inserito");
                }
                client.close();
            });
        }
    });
});

app.post("/api/ricercaPagamento", function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('pagamentoUtenti');
            collection.find({idSpesa:req.body.idSpesa}).toArray(function (err, data) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("NOn ce la fa");}
                else{
                    res.send(JSON.stringify({ "ris": data }));
                    console.log("Ce l fa");}
                client.close();
            });
        }
    });
});

app.post("/api/elencoPagamentiEffettuatiM", function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('pagamentoUtenti');
            collection.find({codiceFiscale:req.body.codiceFiscale}).toArray(function (err, data) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("NOn ce la fa");}
                else{
                    res.send(JSON.stringify({ "ris": data }));
                    console.log("Ce l fa");}
                client.close();
            });
        }
    });
});

/******************************************************/
/********************Pagamenti Annuali, cond************************/
/******************************************************/
app.post("/api/elencoPagamentiMensiliCA", function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('speseAnnuali');
        collection.find({idCondominio:req.body.idCondominio, idSpesa : {$nin:req.body.idPagamentiEffettuati}}).sort({ idSpesa: -1 }).toArray(function (err, data) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("NOn ce la fa");}
                else{
                    res.send(JSON.stringify({ "ris": data }));
                    console.log("Ce l fa");}
                client.close();
            });
        }
    });
});
app.post("/api/elencoPagamentiEffettuatiA", function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('pagamentoUtentiA');
            collection.find({codiceFiscale:req.body.codiceFiscale}).toArray(function (err, data) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("NOn ce la fa");}
                else{
                    res.send(JSON.stringify({ "ris": data }));
                    console.log("Ce l fa");}
                client.close();
            });
        }
    });
});
app.post("/api/confermaPagamentoA", function (req, res, next) {
    console.log("Entro in inserimento");
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('pagamentoUtentiA');
            let par = {                
                "idSpesa": parseInt(req.body.idSpesa),
                "codiceFiscale":req.body.codiceFiscale,
                "Tipologia": req.body.Tipologia,
                "Descrizione":req.body.Descrizione,
                "giorno":req.body.giorno,
                "mese":req.body.mese,
                "anno":req.body.anno
            };

            collection.insertOne(par, function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("Errore nella insertOne");
                }
                else {
                    res.send(JSON.stringify(data));
                    console.log("Ho inserito");
                }
                client.close();
            });
        }
    });
});



app.post("/api/elencoProprieta", function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('condominio');
			// nella find metto il valore del reparto passato dal client
            collection.find({idAmministratore:req.body.codiceFiscale}).toArray(function (err, data) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("NOn ce la fa");}
                else{
                    res.send(JSON.stringify({ "ris": data }));
                    console.log("Ce l fa");}
                client.close();
            });
        }
    });
});

app.post("/api/findidCondominio", function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('condomini');
            let query ={codiceFiscale: req.body.codiceFiscale}
            console.log(req.body.codiceFiscale);
            collection.find(query).toArray(function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("No Non riuscito");
                }
                else{
                    res.send(JSON.stringify(data));
                    console.log("id trovato");
                    console.log(data);
                }
                client.close();
            });
        }
    });
});

app.post("/api/elencoProprietaC", function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('condominio');
			// nella find metto il valore del reparto passato dal client
            collection.find({idCondominio:req.body._idCondominio}).toArray(function (err, data) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                }
                else{
                    res.send(JSON.stringify({ "ris": data }));
                    }
                client.close();
            });
        }
    });
});

app.post("/api/elencoMessaggi", function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('richiesteC');
			// nella find metto il valore del reparto passato dal client
            collection.find({idCondominio:req.body.idCondominio, tipologiaRicevente:"C"}).sort({ idRichiesta: -1 }).toArray(function (err, data) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                }
                else{
                    res.send(JSON.stringify({ "ris": data }));
                    }
                client.close();
            });
        }
    });
});
app.post("/api/elencoMessaggiA", function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('richiesteC');
			// nella find metto il valore del reparto passato dal client
            collection.find({idCondominio:req.body.idCondominio, tipologiaRicevente:"A"}).sort({ idRichiesta: -1 }).toArray(function (err, data) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                }
                else{
                    res.send(JSON.stringify({ "ris": data }));
                    }
                client.close();
            });
        }
    });
});

app.post("/api/elencoSegnalazioni", function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('richiesteA');
			// nella find metto il valore del reparto passato dal client
            collection.find({idCondominio:req.body.idCondominio}).sort({ idSegnalazione: -1 }).toArray(function (err, data) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                }
                else{
                    res.send(JSON.stringify({ "ris": data }));
                    }
                client.close();
            });
        }
    });
});


app.post('/api/esistenzaCondominio', function(req, res, next) {

    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function(err, client) {
        console.log("Connesso");
        if (err){
            error(req, res, err, ERRORS.DB_CONNECTION);
            console.log("Errore Server");}
        else {
            const DB = client.db('housing');
            const collection = DB.collection('condominio');

            let _codiceCatastale = req.body.codiceCatastale;
            collection.findOne({ "CodiceCatastale": _codiceCatastale }, function(err, data) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("0");}
                    
                else {
					console.log(data);
                    if (data == null){
                        console.log("1");
                        error(req, res, null, JSON.stringify(new ERRORS.Http401Error({})));
                    }
						
                        
                    else {  
                        if (data.CodiceAccesso != req.body.codiceAccesso){
                            console.log(JSON.stringify(ERRORS));
                            console.log("Condominio Ciccata");
                            error(req, res, err, JSON.stringify(new ERRORS.Http401Error({})));
                        }
                        else {
                            /*var token = createToken(dbUser);                                  
                            writeCookie(res, token)
                            res.send({"ris":"ok"});*/
                            res.send(JSON.stringify(data));
                            console.log("Condominio trovato");
                        }
                    }
                }
                client.close();
            });
        }
    });
});


app.post('/api/lastIdCondominio', function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('condominio');
            collection.find({}).project({ idCondominio: 1 }).sort({ idCondominio: -1 }).limit(1).toArray(function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("No ID");
                }
                else{
                    res.send(JSON.stringify(data));
                    console.log("Id trovato");
                    console.log(data);
                }
                client.close();
            });
        }
    });
});

app.post('/api/lastIdRichiesta', function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('richiesteC');
            collection.find({}).project({ idRichiesta: 1 }).sort({ idRichiesta: -1 }).limit(1).toArray(function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("No ID");
                }
                else{
                    res.send(JSON.stringify(data));
                    console.log("Id trovato");
                    console.log(data);
                }
                client.close();
            });
        }
    });
});

app.post('/api/lastIdSegnalazione', function (req, res, next) {
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('richiesteA');
            collection.find({}).project({ idSegnalazione: 1 }).sort({ idSegnalazione: -1 }).limit(1).toArray(function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("No ID");
                }
                else{
                    res.send(JSON.stringify(data));
                    console.log("Id trovato");
                    console.log(data + "Uesha");
                }
                console.log(data + "Id Richiesta");
                client.close();
            });
        }
    });
});

app.post('/api/loginA', function(req, res, next) {

    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function(err, client) {
        console.log("Connesso");
        if (err){
            error(req, res, err, ERRORS.DB_CONNECTION);
            console.log("Errore Server");}
        else {
            const DB = client.db('housing');
            const collection = DB.collection('amministratori');

            let _codFA = req.body.codFA;
            collection.findOne({ "codiceFiscale": _codFA }, function(err, dbUser) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("0");}
                    
                else {
					console.log(dbUser);
                    if (dbUser == null){
                        console.log("1");
                        error(req, res, null, JSON.stringify(new ERRORS.Http401Error({})));
                    }
						
                        
                    else {  
                        if (dbUser.password != req.body.pwd){
                            console.log(JSON.stringify(ERRORS));
                            console.log("PWD Ciccata");
                            error(req, res, err, JSON.stringify(new ERRORS.Http401Error({})));
                        }
                        else {
                            var token = createToken(dbUser);                                  
                            writeCookie(res, token)
                            res.send({"ris":"ok"});
                        }
                    }
                }
                client.close();
            });
        }
    });
});

app.post('/api/loginU', function(req, res, next) {

    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function(err, client) {
        console.log("Connesso");
        if (err){
            error(req, res, err, ERRORS.DB_CONNECTION);
            console.log("Errore Server");}
        else {
            const DB = client.db('housing');
            const collection = DB.collection('condomini');

            let _codFU = req.body.codFU;
            console.log(_codFU);
            collection.findOne({ "codiceFiscale": _codFU }, function(err, dbUser) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("0");}
                    
                else {
					console.log(dbUser);
                    if (dbUser == null){
                        console.log("1b");
                        error(req, res, null, JSON.stringify(new ERRORS.Http401Error({})));
                    }
						
                        
                    else {  
                        if (dbUser.password != req.body.pwdU){
                            console.log(JSON.stringify(ERRORS));
                            error(req, res, err, JSON.stringify(new ERRORS.Http401Error({})));
                        }
                        else {
                            var token = createToken(dbUser);                                  
                            writeCookie(res, token)
                            res.send({"ris":"ok"});
                        }
                    }
                }
                client.close();
            });
        }
    });
});

app.post('/api/insertAmministratore', function (req, res, next) {
    console.log("Entro in inserimento");
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('amministratori');
            let par = {
                "codiceFiscale": req.body.codiceFiscaleA,
                "nome":req.body.nomeA,
                "cognome":req.body.cognomeA,
                "DataNascita":req.body.DataNascitaA,
                "password":req.body.passwordA,
                "telefono":req.body.telefonoA
            };

            collection.insertOne(par, function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("Errore nella insertOne");
                }
                else {
                    res.send(JSON.stringify(data));
                    console.log("Ho inserito l'amministratore");
                }
                client.close();
            });
        }
    });
});

app.post('/api/insertRichiesta', function (req, res, next) {
    console.log("Entro in inserimento");
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('richiesteC');
            let par = {
                "idRichiesta": req.body._idRichiesta,
                "nome": req.body.nome,
                "idCondominio":req.body.idCondominio,
                "codiceFiscaleUtente":req.body.codiceFiscale,
                "tipologiaRichiesta":req.body.tipologiaRichiesta,
                "Richiesta":req.body.Richiesta,
                "tipologiaRicevente":req.body.tipologiaRichiedente
            };

            collection.insertOne(par, function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("Errore nella insertOne");
                }
                else {
                    res.send(JSON.stringify(data));
                    console.log("Ho inserito la richiesta");
                }
                client.close();
            });
        }
    });
});

app.post('/api/insertSegnalazione', function (req, res, next) {
    console.log("Entro in inserimento");
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('richiesteA');
            let par = {
                "idSegnalazione": req.body._idSegnalazione,
                //"nome": req.body.nome,
                "idCondominio":req.body.idCondominio,
                "codiceFiscaleUtente":req.body.codiceFiscale,
                "tipologiaSegnalazione":req.body.tipologiaSegnalazione,
                "Segnalazione":req.body.Segnalazione
            };

            collection.insertOne(par, function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("Errore nella insertOne");
                }
                else {
                    res.send(JSON.stringify(data));
                    console.log("Ho inserito la richiesta");
                }
                client.close();
            });
        }
    });
});

app.post('/api/insertCondomino', function (req, res, next) {
    console.log("Entro in inserimento");
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('condomini');
            let par = {
                "codiceFiscale": req.body.codiceFiscaleC,
                "nome":req.body.nomeC,
                "cognome":req.body.cognomeC,
                "DataNascita":req.body.DataNascitaC,
                "password":req.body.passwordC,
                "telefono":req.body.telefonoC,
                "idCondominio":null
            };

            collection.insertOne(par, function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("Errore nella insertOne");
                }
                else {
                    res.send(JSON.stringify(data));
                    console.log("Ho inserito il condomino");
                }
                client.close();
            });
        }
    });
});

app.post('/api/insertCondominio', function (req, res, next) {
    console.log("Entro in inserimento");
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('condominio');
            let par = {
                "idCondominio": parseInt(req.body._id),
                "idAmministratore":req.body.codiceFiscale,
                "nomeCondominio":req.body.nomeCondominio,
                "CodiceCatastale":req.body.catasto,
                "CodiceAccesso":req.body.password,
                "Indirizzo":req.body.indirizzo,
                "numeroCivico":req.body.numero
            };

            collection.insertOne(par, function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("Errore nella insertOne");
                }
                else {
                    res.send(JSON.stringify(data));
                    console.log("Ho inserito il condominio");
                }
                client.close();
            });
        }
    });
});



app.post('/api/updateUtente', function (req, res, next) {
    console.log("Entro");
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('condomini');
            let CodiceFiscale = req.body._codiceFiscale;
            let myquery = {codiceFiscale:CodiceFiscale};
            let newValues = {$set: {idCondominio:req.body._idCondominio}};
            console.log("Prendo parametri");
            console.log("CodiceFiscale utente:" + CodiceFiscale);
            console.log("idCondominio" + req.body._idCondominio);
            

            collection.updateOne(myquery,newValues, function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                }
                else {
                    console.log("YA");
                    res.send(JSON.stringify({ "ris": data }));
                    
                }
                client.close();
            });
        }
    });
});

app.post('/api/logout', function(req, res, next) {
    res.set("Set-Cookie", "token=;max-age=-1;Path=/;httponly=true");
    res.send({"ris":"LogOutOk"});
});

function createToken(obj) {
   let token = jwt.sign({
            '_id': obj._id,
            'password': obj.id,
            'iat': obj.iat || Math.floor(Date.now() / 1000),
			'exp': obj.exp || Math.floor(Date.now() / 1000 + TIMEOUT)
        },
        privateKey
    );
    console.log("Creato Nuovo token");
    console.log(token);
    return token;
}

app.post('/api/logout', function(req, res, next) {
    res.set("Set-Cookie", "token=;max-age=-1;Path=/;httponly=true");
    res.send({"ris":"LogOutOk"});
});

function writeCookie(res, token) {
	// sintassi nodejs
    // res.setHeader("Set-Cookie", "token=" + token + ";max-age=" + TIMEOUT + ";Path=/");
	// sintassi express
    res.set("Set-Cookie", "token=" + token + ";max-age=" + TIMEOUT + ";Path=/;httponly=true;secure=true");
}

// gestione degli errori
function error(req, res, err, httpError) {
    console.log("httpError: " + httpError);
    if (err)
        console.log(err.message);
    //res.status(httpError.CODE);
    console.log("URI: " + req.originalUrl);
    if (req.originalUrl.startsWith("/api"))
        res.send(httpError.message);
    else
    // L'unico errore su una richiesta di pagina può essere il token non valido 
    //  (oppure il successivo 404 not found)
        res.sendFile('index.html', { root: './static' })
}

// default route finale
app.use('/', function(req, res, next) {
    res.status(404)
    if (req.originalUrl.startsWith("/api")) {
        res.send('Risorsa non trovata');
    } else {
        res.send(pageNotFound);
    }
});