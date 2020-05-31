"option strict"
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
    alert("idCondominio: " + idCond + " Codice Fiscale: " + cFiscale);

    let parCod ={
        codiceFiscale: cFiscale
    }
    console.log(parCod);
    let name = inviaRichiesta("/api/thisNameC", "POST", parCod);
    
    

    name.done(function (data){
        $("#txtNomeUtente").text(data[0].nome);
        
    });
    name.fail(function (jqXHR, test_status, str_error) {
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
                    idCondominio: idCond,
                    tipologiaRichiesta: $("#txtTipologiaA").val(),
                    Richiesta: $("#txtMessaggioA").val(),
                    tipologiaRichiedente:"A",
                    _idRichiesta: parseInt(data[0].idRichiesta + 1)
                
                }
                
                let insert = inviaRichiesta("/api/insertRichiesta", "POST", param);
                
                insert.done(function(data){
                if (data.ris.ok && data.ris.modifiedCount) {
                    alert("Inserito");
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
                    idCondominio: idCond,
                    tipologiaRichiesta: $("#txtTipologiaC").val(),
                    Richiesta: $("#txtMessaggioC").val(),
                    tipologiaRichiedente:"C",
                    _idRichiesta: parseInt(data[0].idRichiesta + 1)
                
                }
                
                let insert = inviaRichiesta("/api/insertRichiesta", "POST", param);
                
                insert.done(function(data){
                if (data.ris.ok && data.ris.modifiedCount) {
                    alert("Inserito");
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



    
    
        
});
