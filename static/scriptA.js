"option strict"
$(document).ready(function () {

    let cFiscale = sessionStorage.getItem("codiceFiscale");
    
    let parCod ={
        codiceFiscale: cFiscale
    }
    console.log(parCod);
    let name = inviaRichiesta("/api/thisName", "POST", parCod);

    //Ricerca quantita condominio
    let proprieta = inviaRichiesta("/api/elencoProprieta", "POST", {codiceFiscale : cFiscale});
    proprieta.done(function(data)
    {
        for (let i = 0; i < data.ris.length; i++) {
            $("#cardDinamiche").append("<div onclick='areaCondominiale(" + data.ris[i].idCondominio + ")' class='col-xl-3 col-md-6 mb-4'><div class='card border-left-success shadow h-100 py-2'><div class='card-body'><div class='row no-gutters align-items-center'><div class='col mr-2'><div class='text-xs font-weight-bold text-success text-uppercase mb-1'>Condominio " + data.ris[i].nomeCondominio + "</div><div class='h5 mb-0 font-weight-bold text-gray-800'>" + data.ris[i].Indirizzo + " " + data.ris[i].numeroCivico + "</div></div><div class='col-auto'><i class='fas fa-clipboard-list fa-2x text-gray-300'></i></div></div></div></div></div>")
            
        }
    });
    

    name.done(function (data){
        $("#txtNomeUtente").text(data[0].nome);
        let nome = data[0].nome;
        sessionStorage.setItem("nome", nome);
        console.log(data);
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
                    $("#txtNomeCondominio").val("");
                    $("#txtIndirizzo").val("");
                    $("#txtNumero").val("");
                    $("#txtCatasto").val("");
                    $("#txtPwdCondominio").val("");
                    $("#txtPwdCondominio2").val("");
                    window.location.reload();
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

function areaCondominiale(id) {
    sessionStorage.setItem("idCond", id);
    window.location.href = "AreaCondominialeA.html";
}




