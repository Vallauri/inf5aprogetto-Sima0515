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
    let name = inviaRichiesta("/api/thisName", "POST", parCod);
    
    

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

    $("#btnSegnalazioni").on("click", function(){
        if($("#txtTipologiaA").val() != "" && $("#txtMessaggioA").val() != "")
        {
            alert("parto");
            /**/
            let idSegnalazione = inviaRichiesta("/api/lastIdSegnalazione", "POST", {});
            alert(idSegnalazione);
            idSegnalazione.done(function(data){
                let param = {
                    codiceFiscale: cFiscale,
                    idCondominio: idCond,
                    tipologiaSegnalazione: $("#txtTipologiaA").val(),
                    Segnalazione: $("#txtMessaggioA").val(),
                    _idSegnalazione: parseInt(data[0].idSegnalazione + 1)
                
                }
                alert("idSegnalazionetrovato");
                let insert = inviaRichiesta("/api/insertSegnalazione", "POST", param);
                
                insert.done(function(data){
                if (data.ris.ok && data.ris.modifiedCount) {
                    alert("Inserito");
                    $("#txtTipologiaA").val("");
                    $("#txtMessaggioA").val("");
                    alert("insert effet");
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
