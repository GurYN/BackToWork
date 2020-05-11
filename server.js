const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const pdftk = require('node-pdftk');
const statics = require('./statics');

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressLayouts);

// EJS View Engine
app.set('view engine', 'ejs');
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);
app.set('layout', '_layouts/default');

// Routes
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    return res.render('pages/index', { pageTitle: 'Home' });
});
app.post('/generate', (req, res) => {
    var today = new Date();
    var source = "/pdf/source.pdf";
    var data = {
        "Nom et prénom de l'employeur": statics.validatorName,
        "Fonctions": statics.validatorRole,
        "Prénom" : req.body.firstname,
        "Nom" : req.body.lastname,
        "Date de naissance" : req.body.birthdate,
        "Lieu de naissance" : req.body.birthplace,
        "Adresse du domicile" : req.body.personaladdress,
        "Nature de l'activité professionnelle" : req.body.worksubject,
        "Lieu d'exercice de l'activité professionnelle" : req.body.workaddress,
        "Moyen de déplacement" : req.body.meanstransport,
        "Durée de validité" : statics.validity,
        "Nom et cachet de l'employeur" : statics.companyName,
        "Ville" : statics.companyCity,
        "Date" : String(today.getDate()).padStart(2, '0') + "/" + String(today.getMonth() + 1).padStart(2, '0') + "/" + today.getFullYear()
    };

    pdftk
        .input(source)
        .fillForm(data)
        .flatten()
        .output()
        .then(buffer => {
            res.type("application/pdf");
            return res.send(buffer);
        })
        .catch(err => {
            console.log(err);
            return res.render('pages/error.ejs', { pageTitle: 'Error'});
        });
});

// Set server port
const port = '3000';
app.set('port', port);

// Start server
app.listen(port, () => {
    console.log('BackToWork server started.');
});