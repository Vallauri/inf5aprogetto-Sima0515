//"option strict"
$(document).ready(function () {

    let data = new Date()

    let giorno = data.getDate();
    let mese = data.getMonth() + 1;
    let anno = data.getFullYear();
    $("#giorno").text(giorno + "-");
    $("#mese").text(mese + "-");
    $("#anno").text(anno);

    let idCond = sessionStorage.getItem("idCond");
    let cFiscale = sessionStorage.getItem("codiceFiscale");
    let nomeU = sessionStorage.getItem("nome");
    //alert("idCondominio: " + idCond + " Codice Fiscale: " + cFiscale + "Nome " + nomeU);

    let parCod ={
        codiceFiscale: cFiscale
    }
    console.log(parCod);
    let name = inviaRichiesta("/api/thisNameC", "POST", parCod);
    
    

    name.done(function (data){
        $("#txtNomeUtente").text(data[0].nome);
        let nome=data[0].nome;
        sessionStorage.setItem("nome", nome);
        
    });
    name.fail(function (jqXHR, test_status, str_error) {
        error(jqXHR, test_status, str_error);

    });





    let pagamentieffettuaTI = inviaRichiesta("/api/elencoPagamentiEffettuati", "POST", {codiceFiscale : cFiscale});
    pagamentieffettuaTI.done(function (data) {
        
        let idPagamentiEffettuati = [];
        
        for(let i=0; i<data.ris.length; i++)
        {
            idPagamentiEffettuati[i]=data.ris[i].idSpesa;
        }

        let pagamentiMensili  = inviaRichiesta("/api/elencoPagamentiMensiliC", "POST", {idCondominio : parseInt(idCond), idPagamentiEffettuati: idPagamentiEffettuati});

        pagamentiMensili.done(function (data) {
            console.log(data.ris);
            aggiornaTabella(data.ris, "#tabPagamentiMensili");        
            
        });
    
        pagamentiMensili.fail(function (jqXHR, test_status, str_error) {
            error(jqXHR, test_status, str_error); // funzione di errore
        }); 
        
    });

    pagamentieffettuaTI.fail(function (jqXHR, test_status, str_error) {
        error(jqXHR, test_status, str_error);
    });


    let spese = inviaRichiesta("/api/elencoPagamentiEffettuati", "POST", {codiceFiscale : cFiscale});
    spese.done(function (data) {
        
        let idSpese = [];
        
        for(let i=0; i<data.ris.length; i++)
        {
            idSpese[i]=data.ris[i].idSpesa;
        }

        let SpeseMensili  = inviaRichiesta("/api/elencoSpeseMensiliC", "POST", {idCondominio : parseInt(idCond), idSpese: idSpese});

        SpeseMensili.done(function (data) {
            console.log(data.ris);
            aggiornaTabella4(data.ris, "#tabPME");        
            
        });
    
        SpeseMensili.fail(function (jqXHR, test_status, str_error) {
            error(jqXHR, test_status, str_error); // funzione di errore
        }); 
        
    });

    spese.fail(function (jqXHR, test_status, str_error) {
        error(jqXHR, test_status, str_error);
    });

    let speseA = inviaRichiesta("/api/elencoPagamentiEffettuatiAA", "POST", {codiceFiscale : cFiscale});
    speseA.done(function (data) {
        
        let idSpese = [];
        
        for(let i=0; i<data.ris.length; i++)
        {
            idSpese[i]=data.ris[i].idSpesa;
        }

        let SpeseMensiliA  = inviaRichiesta("/api/elencoSpeseMensiliCAA", "POST", {idCondominio : parseInt(idCond), idSpese: idSpese});

        SpeseMensiliA.done(function (data) {
            console.log(data.ris);
            aggiornaTabella4(data.ris, "#tabPAE");        
            
        });
    
        SpeseMensiliA.fail(function (jqXHR, test_status, str_error) {
            error(jqXHR, test_status, str_error); // funzione di errore
        }); 
        
    });

    speseA.fail(function (jqXHR, test_status, str_error) {
        error(jqXHR, test_status, str_error);
    });




    let pagamentieffettuaTIA = inviaRichiesta("/api/elencoPagamentiEffettuatiA", "POST", {codiceFiscale : cFiscale});
    pagamentieffettuaTIA.done(function (data) {
        
        let idPagamentiEffettuati = [];
        
        for(let i=0; i<data.ris.length; i++)
        {
            idPagamentiEffettuati[i]=data.ris[i].idSpesa;
        }

        let pagamentiAnnuali  = inviaRichiesta("/api/elencoPagamentiMensiliCA", "POST", {idCondominio : parseInt(idCond), idPagamentiEffettuati: idPagamentiEffettuati});

        pagamentiAnnuali.done(function (data) {
            console.log(data.ris);
            aggiornaTabella1(data.ris, "#tabPagamentiMensili1");        
            
        });
    
        pagamentiAnnuali.fail(function (jqXHR, test_status, str_error) {
            error(jqXHR, test_status, str_error); // funzione di errore
        }); 
        
    });

    pagamentieffettuaTIA.fail(function (jqXHR, test_status, str_error) {
        error(jqXHR, test_status, str_error);
    });


    let mex  = inviaRichiesta("/api/elencoMessaggi", "POST", {idCondominio : parseInt(idCond)});
    mex.done(function (data) {
        console.log(data.ris);
        aggiornaTabella2(data.ris, "#tabMessaggi");        
        
    });

    mex.fail(function (jqXHR, test_status, str_error) {
        alert("fallito");
        error(jqXHR, test_status, str_error); 
    });
    let mg  = inviaRichiesta("/api/elencoSegnalazioni", "POST", {idCondominio : parseInt(idCond)});
    mg.done(function (data) {
        console.log(data.ris);
        aggiornaTabella3(data.ris, "#tabMessaggi1");        
        
    });

    mg.fail(function (jqXHR, test_status, str_error) {
        alert("fallito");
        error(jqXHR, test_status, str_error); 
    });

    
    

    

    

    

    let parCon ={
        idCondominio: parseInt(idCond)
    }

    let nomeCondominio = inviaRichiesta("/api/thisNameCondominio", "POST", parCon);
    
    nomeCondominio.done(function (data){
        $("#txtNomeCondominio").text("Condominio " + data[0].nomeCondominio);
    });
    nomeCondominio.fail(function (jqXHR, test_status, str_error) {
        error(jqXHR, test_status, str_error);

    });


    $("#btnLogout").on("click", function () {
		let logoutRQ = inviaRichiesta('/api/logout', 'POST', {});
            logoutRQ.fail(function (jqXHR, test_status, str_error) {
                if (jqXHR.status == 401) {
                }
                else {
                    error(jqXHR, test_status, str_error);
                }
            });
            logoutRQ.done(function (data) {
                window.location.href = "../index.html";
            });
    });

    $("#btnRichiestaA").on("click", function(){
        if($("#txtTipologiaA").val() != "" && $("#txtMessaggioA").val() != "")
        {
            /**/
            let idRichiesta = inviaRichiesta("/api/lastIdRichiesta", "POST", {});
            idRichiesta.done(function(data){
                let param = {
                    codiceFiscale: cFiscale,
                    nome: nomeU,
                    idCondominio: parseInt(idCond),
                    tipologiaRichiesta: $("#txtTipologiaA").val(),
                    Richiesta: $("#txtMessaggioA").val(),
                    tipologiaRichiedente:"A",
                    _idRichiesta: parseInt(data[0].idRichiesta + 1)
                
                }
                
                let insert = inviaRichiesta("/api/insertRichiesta", "POST", param);
                
                insert.done(function(data){
                if (data.ris.ok && data.ris.modifiedCount) {
                    $("#txtTipologiaA").val("");
                    $("#txtCodiceCatastale").val("");
                    $("#txtMessaggioA").val("");
                }
                else{
                    alert("Errore");
                }
            });

            insert.fail(function (jqXHR, test_status, str_error) {
                    error(jqXHR, test_status, str_error);
                });
            });
            idRichiesta.fail(function (jqXHR, test_status, str_error) {
                error(jqXHR, test_status, str_error);
        
            });  
        }    
        else
        alert("Completa tutti i campi");  

    });

    $("#btnRichiestaC").on("click", function(){
        if($("#txtTipologiaC").val() != "" && $("#txtMessaggioC").val() != "")
        {
            /**/
            let idRichiesta = inviaRichiesta("/api/lastIdRichiesta", "POST", {});
            idRichiesta.done(function(data){
                let param = {
                    codiceFiscale: cFiscale,
                    idCondominio: parseInt(idCond),
                    nome: nomeU,
                    tipologiaRichiesta: $("#txtTipologiaC").val(),
                    Richiesta: $("#txtMessaggioC").val(),
                    tipologiaRichiedente:"C",
                    _idRichiesta: parseInt(data[0].idRichiesta+1)
                
                }
                
                let insert = inviaRichiesta("/api/insertRichiesta", "POST", param);
                
                insert.done(function(data){
                if (data.ris.ok && data.ris.modifiedCount) {
                    $("#txtTipologiaA").val("");
                    $("#txtCodiceCatastale").val("");
                    $("#txtMessaggioA").val("");
                }
                else{
                    alert("Errore");
                }
            });

            insert.fail(function (jqXHR, test_status, str_error) {
                    error(jqXHR, test_status, str_error);
                });
            });
            idRichiesta.fail(function (jqXHR, test_status, str_error) {
                error(jqXHR, test_status, str_error);
        
            });  
        }    
        else
        alert("Completa tutti i campi");  

    });

    $("#btnRicercaMensile").on("click", function(){
        
        if($("#txtanno").val() != "")
        {
            let param = {
                codiceFiscale: cFiscale,
                idCondominio: parseInt(idCond),
                anno: $("#txtanno").val(),
                mese: $("#cmbMese").val()
            
            }
            let pagamentiMensili = inviaRichiesta("/api/richiediPagamentiMensili", "POST", param);
                
            pagamentiMensili.done(function(data){
                aggiornaTabella(data.ris, "#tabPagamentiMensili");  
            });

            pagamentiMensili.fail(function (jqXHR, test_status, str_error) {
                    error(jqXHR, test_status, str_error);
            });
            
            
        }    
        else
        alert("Inserisci l'anno");  

    });

    $("#btnRicercaMensile1").on("click", function(){
        
        if($("#txtanno1").val() != "")
        {
            let param = {
                codiceFiscale: cFiscale,
                idCondominio: parseInt(idCond),
                anno: $("#txtanno1").val(),
                mese: $("#cmbMese1").val()
            
            }
            let pagamentiMensili = inviaRichiesta("/api/richiediPagamentiAnnuali", "POST", param);
                
            pagamentiMensili.done(function(data){
                aggiornaTabella1(data.ris, "#tabPagamentiMensili1");  
            });

            pagamentiMensili.fail(function (jqXHR, test_status, str_error) {
                    error(jqXHR, test_status, str_error);
            });
            
            
        }    
        else
        alert("Inserisci l'anno");  

    });
    
       
    
        
});

function aggiornaTabella4(dati, idTab) {
    let t = $(idTab);
    t.empty();
    let the = $("<thead class=''></thead>");
    let head = ["Data", "Tipologia", "Descrizione", "Prezzo Totale"];

    let tr = $("<tr></tr>");
    head.forEach(function (testo) {
        let th = $("<th></th>");
        th.html(testo);
        tr.append(th);
    })
    the.append(tr);
    t.append(the);
    let tb = $("<tbody></tbody>");

    for(let i = 0; i < dati.length; i++){
        let tr = $("<tr></tr>");
        let data, Tipologia, Descrizione, Prezzo, idCondominio;
        idSpesa = dati[i].idSpesa;
        data = dati[i].giorno + "/" + dati[i].mese + "/" + dati[i].anno;
        //cognomePaz = dati[i].cognomePaziente;
        pagamenti = dati[i];
        
        let td = $("<td></td>");
        td.html(data);
        tr.append(td);
        /*td=$("<td></td>");
        td.html(visita["telefono"]);
        tr.append(td);*/
        td=$("<td></td>");
        td.html(pagamenti["Tipologia"]);
        tr.append(td);

        td = $("<td></td>");
        td.html(pagamenti["Descrizione"]);
        tr.append(td);

        td = $("<td></td>");
        td.html(pagamenti["Importo"] + "€");
        tr.append(td);
        
        //td = $("<td></td>");
        //td.append("<button class='btn btn-success btn-circle' onclick='modPagamenti(" + idSpesa + ");' data-toggle='modal' data-target='#modVisita'><i class='fas fa-check'></i></button>");
        //td.append("<button class='btn-circle' onclick='elimPagamenti(" + idSpesa + ");'><i class='fas fa-info-circle'></i></button>");
        //tr.append(td);
        
        tr.attr("id", "tr_" + idSpesa);

        tb.append(tr);
    }
    t.append(tb);
}

function aggiornaTabella(dati, idTab) {
    let t = $(idTab);
    t.empty();
    let the = $("<thead class=''></thead>");
    let head = ["Data", "Tipologia", "Descrizione", "Prezzo"];

    let tr = $("<tr></tr>");
    head.forEach(function (testo) {
        let th = $("<th></th>");
        th.html(testo);
        tr.append(th);
    })
    the.append(tr);
    t.append(the);
    let tb = $("<tbody></tbody>");

    for(let i = 0; i < dati.length; i++){
        let tr = $("<tr></tr>");
        let data, Tipologia, Descrizione, Prezzo, idCondominio;
        idSpesa = dati[i].idSpesa;
        data = dati[i].giorno + "/" + dati[i].mese + "/" + dati[i].anno;
        //cognomePaz = dati[i].cognomePaziente;
        pagamenti = dati[i];
        
        let td = $("<td></td>");
        td.html(data);
        tr.append(td);
        /*td=$("<td></td>");
        td.html(visita["telefono"]);
        tr.append(td);*/
        td=$("<td></td>");
        td.html(pagamenti["Tipologia"]);
        tr.append(td);

        td = $("<td></td>");
        td.html(pagamenti["Descrizione"]);
        tr.append(td);

        td = $("<td></td>");
        td.html(pagamenti["Importo"] + "€");
        tr.append(td);
        
        td = $("<td></td>");
        td.append("<button class='btn btn-success btn-circle' onclick='modPagamenti(" + idSpesa + ");' data-toggle='modal' data-target='#modVisita'><i class='fas fa-check'></i></button>");
        //td.append("<button class='btn-circle' onclick='elimPagamenti(" + idSpesa + ");'><i class='fas fa-info-circle'></i></button>");
        tr.append(td);
        
        tr.attr("id", "tr_" + idSpesa);

        tb.append(tr);
    }
    t.append(tb);
}

function modPagamenti(id) {
    let cFiscale = sessionStorage.getItem("codiceFiscale");
    let datiPagamentiMensili = inviaRichiesta("/api/confermaPagamento", "POST", {idSpesa : id, codiceFiscale:cFiscale});

    
    datiPagamentiMensili.done(function (data) {
        window.location.reload();
    });

    datiPagamentiMensili.fail(function (jqXHR, test_status, str_error) {
        error(jqXHR, test_status, str_error);
    });
}


function aggiornaTabella1(dati, idTab) {
    let t = $(idTab);
    t.empty();
    let the = $("<thead class=''></thead>");
    let head = ["Data", "Tipologia", "Descrizione", "Prezzo"];

    let tr = $("<tr></tr>");
    head.forEach(function (testo) {
        let th = $("<th></th>");
        th.html(testo);
        tr.append(th);
    })
    the.append(tr);
    t.append(the);
    let tb = $("<tbody></tbody>");

    for(let i = 0; i < dati.length; i++){
        let tr = $("<tr></tr>");
        let data, Tipologia, Descrizione, Prezzo, idCondominio;
        idSpesa = dati[i].idSpesa;
        data = dati[i].giorno + "/" + dati[i].mese + "/" + dati[i].anno;
        //cognomePaz = dati[i].cognomePaziente;
        pagamenti = dati[i];
        
        let td = $("<td></td>");
        td.html(data);
        tr.append(td);
        /*td=$("<td></td>");
        td.html(visita["telefono"]);
        tr.append(td);*/
        td=$("<td></td>");
        td.html(pagamenti["Tipologia"]);
        tr.append(td);

        td = $("<td></td>");
        td.html(pagamenti["Descrizione"]);
        tr.append(td);

        td = $("<td></td>");
        td.html(pagamenti["Importo"] + "€");
        tr.append(td);
        
        td = $("<td></td>");
        td.append("<button class='btn btn-success btn-circle' onclick='modPagamenti1(" + idSpesa + ");' data-toggle='modal' data-target='#modVisita'><i class='fas fa-check'></i></button>");
        //td.append("<button class='btn-circle' onclick='elimPagamenti(" + idSpesa + ");'><i class='fas fa-info-circle'></i></button>");
        tr.append(td);
        
        tr.attr("id", "tr_" + idSpesa);

        tb.append(tr);
    }
    t.append(tb);
}

function modPagamenti1(id) {
    let cFiscale = sessionStorage.getItem("codiceFiscale");
    let datiPagamentiMensili = inviaRichiesta("/api/confermaPagamentoA", "POST", {idSpesa : id, codiceFiscale:cFiscale});

    /*alert("entro");
    let pagamenti = inviaRichiesta("/api/ricercaPagamento", "POST", {idSpesa : id});
    pagamenti.done(function (data) {
        alert("inizio");
        let param = {
        cFiscale = sessionStorage.getItem("codiceFiscale"),
        Descrizione=data.ris[0].Descrizione,
        Tipologia=data[0].Tipologia,
        giorno=data[0].giorno,
        mese=data[0].mese,
        anno=data[0].anno,
        Importo=data[0].Importo
        }
        let datiPagamentiMensili = inviaRichiesta("/api/confermaPagamento", "POST", {param});

        
        datiPagamentiMensili.done(function (data) {
            window.location.reload();
        });
           

        datiPagamentiMensili.fail(function (jqXHR, test_status, str_error) {
            error(jqXHR, test_status, str_error);
        });
    }); 
    pagamenti.fail(function (jqXHR, test_status, str_error) {
        error(jqXHR, test_status, str_error);
    });*/

    
    datiPagamentiMensili.done(function (data) {
        window.location.reload();
    });

    datiPagamentiMensili.fail(function (jqXHR, test_status, str_error) {
        error(jqXHR, test_status, str_error);
    });
}
function aggiornaTabella2(dati, idTab) {
    let t = $(idTab);
    t.empty();
    let the = $("<thead class=''></thead>");
    let head = ["Nome", "Tipologia", "Messaggio"];

    let tr = $("<tr></tr>");
    head.forEach(function (testo) {
        let th = $("<th></th>");
        th.html(testo);
        tr.append(th);
    })
    the.append(tr);
    t.append(the);
    let tb = $("<tbody></tbody>");

    for(let i = 0; i < dati.length; i++){
        let tr = $("<tr></tr>");
        let data, Tipologia, Descrizione, Prezzo, idCondominio;
        idSpesa = dati[i].idSpesa;
        data = dati[i].giorno + "/" + dati[i].mese + "/" + dati[i].anno;
        //cognomePaz = dati[i].cognomePaziente;
        mex = dati[i];
        
        
        /*td=$("<td></td>");
        td.html(visita["telefono"]);
        tr.append(td);*/
        td=$("<td></td>");
        td.html(mex["nome"]);
        tr.append(td);

        td = $("<td></td>");
        td.html(mex["tipologiaRichiesta"]);
        tr.append(td);

        td = $("<td></td>");
        td.html(mex["Richiesta"]);
        tr.append(td);
        
        td = $("<td></td>");
        //td.append("<button class='btn btn-success btn-circle' onclick='modPagamenti1(" + idSpesa + ");' data-toggle='modal' data-target='#modVisita'><i class='fas fa-check'></i></button>");
        //td.append("<button class='btn-circle' onclick='elimPagamenti(" + idSpesa + ");'><i class='fas fa-info-circle'></i></button>");
        tr.append(td);
        
        //tr.attr("id", "tr_" + idSpesa);

        tb.append(tr);
    }
    t.append(tb);
}
function aggiornaTabella3(dati, idTab) {
    let t = $(idTab);
    t.empty();
    let the = $("<thead class=''></thead>");
    let head = ["Nome", "Tipologia", "Messaggio"];

    let tr = $("<tr></tr>");
    head.forEach(function (testo) {
        let th = $("<th></th>");
        th.html(testo);
        tr.append(th);
    })
    the.append(tr);
    t.append(the);
    let tb = $("<tbody></tbody>");

    for(let i = 0; i < dati.length; i++){
        let tr = $("<tr></tr>");
        let data, Tipologia, Descrizione, Prezzo, idCondominio;
        idSpesa = dati[i].idSpesa;
        data = dati[i].giorno + "/" + dati[i].mese + "/" + dati[i].anno;
        //cognomePaz = dati[i].cognomePaziente;
        mex = dati[i];
        
        
        /*td=$("<td></td>");
        td.html(visita["telefono"]);
        tr.append(td);*/
        td=$("<td></td>");
        td.html("Amministratore");
        tr.append(td);

        td = $("<td></td>");
        td.html(mex["tipologiaSegnalazione"]);
        tr.append(td);

        td = $("<td></td>");
        td.html(mex["Segnalazione"]);
        tr.append(td);
        
        td = $("<td></td>");
        //td.append("<button class='btn btn-success btn-circle' onclick='modPagamenti1(" + idSpesa + ");' data-toggle='modal' data-target='#modVisita'><i class='fas fa-check'></i></button>");
        //td.append("<button class='btn-circle' onclick='elimPagamenti(" + idSpesa + ");'><i class='fas fa-info-circle'></i></button>");
        tr.append(td);
        
        //tr.attr("id", "tr_" + idSpesa);

        tb.append(tr);
    }
    t.append(tb);
}
