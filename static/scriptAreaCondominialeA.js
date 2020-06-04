"option strict"
$(document).ready(function () {

    let data = new Date()

    let giorno = data.getDate();
    let mese = data.getMonth() + 1;
    let anno = data.getFullYear();
    $("#giorno").text(giorno);
    $("#mese").text(mese);
    $("#anno").text(anno);
    let inserimento=false;
    
    

    let idCond = sessionStorage.getItem("idCond");
    let cFiscale = sessionStorage.getItem("codiceFiscale");
    
    //alert("idCondominio: " + idCond + " Codice Fiscale: " + cFiscale);

    let parCod ={
        codiceFiscale: cFiscale
    }
    console.log(parCod);
    let name = inviaRichiesta("/api/thisName", "POST", parCod);
    
    

    name.done(function (data){
        $("#txtNomeUtente").text(data[0].nome);
        
    });
    name.fail(function (jqXHR, test_status, str_error) {
        error(jqXHR, test_status, str_error);

    });

    let pagamentiMensili  = inviaRichiesta("/api/elencoPagamentiMensili", "POST", {idCondominio : parseInt(idCond)});

    pagamentiMensili.done(function (data) {
        console.log(data.ris);
        
        aggiornaTabella(data.ris, "#tabPagamentiMensili");        
	    
    });

    pagamentiMensili.fail(function (jqXHR, test_status, str_error) {
	    error(jqXHR, test_status, str_error); // funzione di errore
    }); 

    let pagamentiAnnuali  = inviaRichiesta("/api/elencoPagamentiAnnuali", "POST", {idCondominio : parseInt(idCond)});

    pagamentiAnnuali.done(function (data) {
        console.log(data.ris);
        
        aggiornaTabella1(data.ris, "#tabPagamentiMensili1");        
	    
    });

    pagamentiAnnuali.fail(function (jqXHR, test_status, str_error) {
	    error(jqXHR, test_status, str_error); // funzione di errore
    });

    let mex  = inviaRichiesta("/api/elencoMessaggiA", "POST", {idCondominio : parseInt(idCond)});
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

    $("#btnSegnalazioni").on("click", function(){
        if($("#txtTipologiaA").val() != "" && $("#txtMessaggioA").val() != "")
        {
            /**/
            let idSegnalazione = inviaRichiesta("/api/lastIdSegnalazione", "POST", {});
            idSegnalazione.done(function(data){
                let param = {
                    codiceFiscale: cFiscale,
                    //nome: nomeU,
                    idCondominio: parseInt(idCond),
                    tipologiaSegnalazione: $("#txtTipologiaA").val(),
                    Segnalazione: $("#txtMessaggioA").val(),
                    _idSegnalazione: parseInt(data[0].idSegnalazione + 1)
                
                }
                let insert = inviaRichiesta("/api/insertSegnalazione", "POST", param);
                
                insert.done(function(data){
                if (data.ris.ok && data.ris.modifiedCount) {
                    $("#txtTipologiaA").val("");
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
            idSegnalazione.fail(function (jqXHR, test_status, str_error) {
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

    
    $("#btnInserisciMensile").on("click", function(){
        if($("#txtTipologiamensile").val() != "" && $("#txtDescrizioneMensile").val() != "" && $("#txtPrezzoMensile").val() != "")
        {
            let idSpesa = inviaRichiesta("/api/lastIdPagamentoMensile", "POST", {});
            idSpesa.done(function(data){
            let param = {
                idSpesa: parseInt(data[0].idSpesa + 1),
                codiceFiscale: cFiscale,
                idCondominio: parseInt(idCond),
                Tipologia: $("#txtTipologiamensile").val(),
                Descrizione: $("#txtDescrizioneMensile").val(),
                Prezzo: $("#txtPrezzoMensile").val(),
                giorno:$("#giorno").text(),
                mese:$("#mese").text(),
                anno:$("#anno").text()
            
            }
            let pagamentiMensili = inviaRichiesta("/api/inserisciPagamentiMensili", "POST", param);
                
            pagamentiMensili.done(function(data){
                window.location.reload(); 
            });

            pagamentiMensili.fail(function (jqXHR, test_status, str_error) {
                    error(jqXHR, test_status, str_error);
            });
            });
            idSpesa.fail(function (jqXHR, test_status, str_error) {
                error(jqXHR, test_status, str_error);
        
            }); 
            
            
            
        }    
        else
        alert("Inserisci l'anno");  

    });
    $("#btnModificaMensile").on("click", function(){
        
        let idThisSpesa = sessionStorage.getItem("idThisSpesa");
        if($("#txtTipologiamensile").val() != "" && $("#txtDescrizioneMensile").val() != "" && $("#txtPrezzoMensile").val() != "")
        {
            
            let param = {
                idSpesa: parseInt(idThisSpesa),
                codiceFiscale: cFiscale,
                idCondominio: parseInt(idCond),
                Tipologia: $("#txtTipologiamensile").val(),
                Descrizione: $("#txtDescrizioneMensile").val(),
                Prezzo: $("#txtPrezzoMensile").val(),
                giorno:$("#giorno").text(),
                mese:$("#mese").text(),
                anno:$("#anno").text()
            
            }
            let pagamentiMensili = inviaRichiesta("/api/updatePagamentiMensili", "POST", param);
                
            pagamentiMensili.done(function(data){

                window.location.reload();
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

    
    $("#btnInserisciMensile1").on("click", function(){
        if($("#txtTipologiamensile1").val() != "" && $("#txtDescrizioneMensile1").val() != "" && $("#txtPrezzoMensile1").val() != "")
        {
            let idSpesa = inviaRichiesta("/api/lastIdPagamentoAnnuali", "POST", {});
            idSpesa.done(function(data){
            let param = {
                idSpesa: parseInt(data[0].idSpesa + 1),
                codiceFiscale: cFiscale,
                idCondominio: parseInt(idCond),
                Tipologia: $("#txtTipologiamensile1").val(),
                Descrizione: $("#txtDescrizioneMensile1").val(),
                Prezzo: $("#txtPrezzoMensile1").val(),
                giorno:$("#giorno").text(),
                mese:$("#mese").text(),
                anno:$("#anno").text()
            
            }
            let pagamentiMensili = inviaRichiesta("/api/inserisciPagamentiAnnuali", "POST", param);
                
            pagamentiMensili.done(function(data){
                window.location.reload(); 
            });

            pagamentiMensili.fail(function (jqXHR, test_status, str_error) {
                    error(jqXHR, test_status, str_error);
            });
            });
            idSpesa.fail(function (jqXHR, test_status, str_error) {
                error(jqXHR, test_status, str_error);
        
            }); 
            
            
            
        }    
        else
        alert("Inserisci l'anno");  

    });
    $("#btnModificaMensile1").on("click", function(){
        
        let idThisSpesa = sessionStorage.getItem("idThisSpesa");
        if($("#txtTipologiamensile1").val() != "" && $("#txtDescrizioneMensile1").val() != "" && $("#txtPrezzoMensile1").val() != "")
        {
            
            let param = {
                idSpesa: parseInt(idThisSpesa),
                codiceFiscale: cFiscale,
                idCondominio: parseInt(idCond),
                Tipologia: $("#txtTipologiamensile1").val(),
                Descrizione: $("#txtDescrizioneMensile1").val(),
                Prezzo: $("#txtPrezzoMensile1").val(),
                giorno:$("#giorno").text(),
                mese:$("#mese").text(),
                anno:$("#anno").text()
            
            }
            let pagamentiMensili = inviaRichiesta("/api/updatePagamentiAnnuali", "POST", param);
                
            pagamentiMensili.done(function(data){

                window.location.reload();
            });

            pagamentiMensili.fail(function (jqXHR, test_status, str_error) {
                    error(jqXHR, test_status, str_error);
            });
            
            
            
            
        }    
        else
        alert("Inserisci l'anno");  

    });

        
});

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
        td.append("<button class='btn btn-info btn-circle' onclick='modPagamenti(" + idSpesa + ");' data-toggle='modal' data-target='#modVisita'><i class='fas fa-info-circle'></i></button>");
        //td.append("<button class='btn-circle' onclick='elimPagamenti(" + idSpesa + ");'><i class='fas fa-info-circle'></i></button>");
        tr.append(td);
        
        tr.attr("id", "tr_" + idSpesa);

        tb.append(tr);
    }
    t.append(tb);
}

function modPagamenti(id) {
    // $("#modVisita").modal("show");
   
    
    
    let datiPagamentiMensili = inviaRichiesta("/api/richiediThisPagamento", "POST", {idSpesa : id});

    datiPagamentiMensili.done(function (data) {
        
        $("#txtTipologiamensile").val(data[0].Tipologia);
        $("#txtDescrizioneMensile").val(data[0].Descrizione);
        $("#txtPrezzoMensile").val(data[0].Importo);  
        let idInserimentoPagamento=data[0].idSpesa;
        sessionStorage.setItem("idThisSpesa", idInserimentoPagamento);
        
    });

    datiPagamentiMensili.fail(function (jqXHR, test_status, str_error) {
        error(jqXHR, test_status, str_error);
    });
}

function elimPagamenti(id) {
    console.log("Elimina Visita: " + id);
    let cancella = inviaRichiesta("/api/deletePagamentiMensili", "POST", { idSpesa: id});

    cancella.done(function (data) {
        console.log(data.ris);
        if (data.ris.ok) {
            if (data.ris.deletedCount)
                alert("Pagamento rimossa con successo!");
            else
                alert("Si è verificato un errore durante la rimozione della visita");

            window.location.reload();
        }
        else {
            alert("Errore generico. Riprovare");
        }
    });

    cancella.fail(function (jqXHR, test_status, str_error) {
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
        td.append("<button class='btn btn-info btn-circle' onclick='modPagamenti1(" + idSpesa + ");' data-toggle='modal' data-target='#modVisita'><i class='fas fa-info-circle'></i></button>");
        //td.append("<button class='btn-circle' onclick='elimPagamenti(" + idSpesa + ");'><i class='fas fa-info-circle'></i></button>");
        tr.append(td);
        
        tr.attr("id", "tr_" + idSpesa);

        tb.append(tr);
    }
    t.append(tb);
}

function modPagamenti1(id) {
    // $("#modVisita").modal("show");
   
    
    
    let datiPagamentiMensili = inviaRichiesta("/api/richiediThisPagamentoAnnuali", "POST", {idSpesa : id});

    datiPagamentiMensili.done(function (data) {
        
        $("#txtTipologiamensile1").val(data[0].Tipologia);
        $("#txtDescrizioneMensile1").val(data[0].Descrizione);
        $("#txtPrezzoMensile1").val(data[0].Importo);  
        let idInserimentoPagamento=data[0].idSpesa;
        sessionStorage.setItem("idThisSpesa", idInserimentoPagamento);
        
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