"option strict"
$(document).ready(function () {

    let cFiscale = sessionStorage.getItem("codiceFiscale");
    
    let parCod ={
        codiceFiscale: cFiscale
    }
    console.log(parCod);
    let name = inviaRichiesta("/api/thisNameC", "POST", parCod);
    
    let idCondominioC = inviaRichiesta("/api/findidCondominio", "POST", {codiceFiscale : cFiscale});
    idCondominioC.done(function(data)
    {
        let _idCondominio=parseInt(data[0].idCondominio);
        let proprieta = inviaRichiesta("/api/elencoProprietaC", "POST", {_idCondominio : _idCondominio});

        proprieta.done(function(data){
            for (let i = 0; i < data.ris.length; i++) {
                $("#cardDinamiche").append("<div onclick='areaCondominiale(" + data.ris[i].idCondominio + ")' class='col-xl-3 col-md-6 mb-4'><div class='card border-left-success shadow h-100 py-2'><div class='card-body'><div class='row no-gutters align-items-center'><div class='col mr-2'><div class='text-xs font-weight-bold text-success text-uppercase mb-1'>Condominio " + data.ris[i].nomeCondominio + "</div><div class='h5 mb-0 font-weight-bold text-gray-800'>" + data.ris[i].Indirizzo + " " + data.ris[i].numeroCivico + "</div></div><div class='col-auto'><i class='fas fa-clipboard-list fa-2x text-gray-300'></i></div></div></div></div></div>")
                
            }
        });
        
    });   
    

    name.done(function (data){
        $("#txtNomeUtente").text(data[0].nome);
        let nome = data[0].nome;
        sessionStorage.setItem("nome", nome);
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
            /**/
            

            let controllo = inviaRichiesta("/api/esistenzaCondominio", "POST", params);
            controllo.done(function (data) {
                
                let ricercaId = inviaRichiesta("/api/ricercaIdCondominio", "POST", params);
                ricercaId.done(function(data){
                    let param = {
                        _codiceFiscale: cFiscale,
                        _idCondominio: parseInt(data[0].idCondominio)
                    
                    }
                    let idCond=data[0].idCondominio;
                    let update = inviaRichiesta("/api/updateUtente", "POST", param);
                    
                    update.done(function(data){
                    if (data.ris.ok && data.ris.modifiedCount) {
                        $("#txtNomeCondominio").val("");
                        $("#txtCodiceCatastale").val("");
                        $("#txtAccesso").val("");
                        sessionStorage.setItem("idCond", idCond);                
                        window.location.href = "AreaCondominialeC.html";
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
function areaCondominiale(id) {
    sessionStorage.setItem("idCond", id);
    window.location.href = "AreaCondominialeC.html";
}

