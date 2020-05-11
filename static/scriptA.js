"option strict"
$(document).ready(function () {

    let cFiscale = sessionStorage.getItem("codiceFiscale");
    
    let parCod ={
        codiceFiscale: cFiscale
    }
    console.log(parCod);
    let name = inviaRichiesta("/api/thisName", "POST", parCod);
    
    

    name.done(function (data){
        $("#txtNomeUtente").text(data[0].nome);
        console.log(data);
    });
    name.fail(function (jqXHR, test_status, str_error) {
        error(jqXHR, test_status, str_error);

    });
    

    $("#btnAggiungiCondominio").on("click", function(){
        if($("#txtNomeCondominio").val() != "" && $("#txtIndirizzo").val() != "" && $("#txtNumero").val() != "" && $("#txtCatasto").val() != "" && $("#txtPwdCondominio").val() != "" && $("#txtPwdCondominio").val() == $("#txtPwdCondominio2").val())
        {

            let id = inviaRichiesta("/api/lastIdCondominio", "POST", {});

            id.done(function (data) {
                let params = {
                    _id: parseInt(data[0].idCondominio + 1),
                    codiceFiscale: cFiscale,
                    nomeCondominio: $("#txtNomeCondominio").val(),
                    indirizzo: $("#txtIndirizzo").val(),
                    numero: $("#txtNumero").val(),
                    catasto: $("#txtCatasto").val(),
                    password: $("#txtPwdCondominio").val()
                }

                console.log(params);  
                let condominio = inviaRichiesta("/api/insertCondominio", "POST", params);
                
                
                condominio.done(function(data){
                    if (data.ok && data.insertedCount) {
                    alert("Inserito");
                    $("#txtNomeCondominio").val("");
                    $("#txtIndirizzo").val("");
                    $("#txtNumero").val("");
                    $("#txtCatasto").val("");
                    $("#txtPwdCondominio").val("");
                    $("#txtPwdCondominio2").val("");
                }
                else{
                    alert("Errore");
                }
            });

                condominio.fail(function (jqXHR, test_status, str_error) {
                    error(jqXHR, test_status, str_error);
                });            
            });
            id.fail(function (jqXHR, test_status, str_error) {
                error(jqXHR, test_status, str_error);
            });

        }    
        else
        alert("Completa tutti i campi");  

    });
});




