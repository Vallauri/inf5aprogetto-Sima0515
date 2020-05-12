"option strict"
$(document).ready(function () {

    let cFiscale = sessionStorage.getItem("codiceFiscale");
    
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

    $("#btnCercaCondominio").on("click", function(){
        if($("#txtNomeCondominio").val() != "" && $("#txtIndirizzo").val() != "" && $("#txtNumero").val() != "" && $("#txtCatasto").val() != "" && $("#txtPwdCondominio").val() != "" && $("#txtPwdCondominio").val() == $("#txtPwdCondominio2").val())
        {
            let params = {
                codiceFiscale: cFiscale,
                nomeCondominio: $("#txtNomeCondominio").val(),
                codiceCatastale: $("#txtCodiceCatastale").val(),
                codiceAccesso: $("#txtAccesso").val()
            
            }
            alert("params");
            /**/
            

            let controllo = inviaRichiesta("/api/esistenzaCondominio", "POST", params);
            controllo.done(function (data) {
                
                let ricercaId = inviaRichiesta("/api/ricercaIdCondominio", "POST", params);
                ricercaId.done(function(data){
                    let param = {
                        _codiceFiscale: cFiscale,
                        _idCondominio: parseInt(data[0].idCondominio)
                    
                    }
                    alert("param");
    
                    let update = inviaRichiesta("/api/updateUtente", "POST", param);
                    alert("Mando richiesta");
                    
                    update.done(function(data){
                    if (data.ris.ok && data.ris.modifiedCount) {
                        alert("Inserito");
                        $("#txtNomeCondominio").val("");
                        $("#txtCodiceCatastale").val("");
                        $("#txtAccesso").val("");
                    }
                    else{
                        alert("Errore");
                    }
                });
    
                    update.fail(function (jqXHR, test_status, str_error) {
                        error(jqXHR, test_status, str_error);
                    });
                });
                ricercaId.fail(function (jqXHR, test_status, str_error) {
                    error(jqXHR, test_status, str_error);
            
                });


                       
            });
            controllo.fail(function (jqXHR, test_status, str_error) {
                error(jqXHR, test_status, str_error);
            });

        }    
        else
        alert("Completa tutti i campi");  

    });
    

    
});

